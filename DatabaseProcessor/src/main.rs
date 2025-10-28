use std::time::Duration;

use anyhow::Result;
use dotenv::dotenv;
use redis::Commands;
use sqlx::PgPool;
use tracing::{error, info};

use services::{process_trade_dynamically, RedisManager};
use types::IncomingMessage;

mod services;
mod types;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();
    dotenv().ok();

    let redis_manager = RedisManager::new();
    let mut conn = redis_manager.get_connection()?;

    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = PgPool::connect(&database_url).await?;

    let refresh_pool = pool.clone();
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(Duration::from_secs(10));
        loop {
            interval.tick().await;
            if let Err(e) = refresh_views(&refresh_pool).await {
                error!("Error refreshing views: {:?}", e);
            } else {
                info!("Materialized views refreshed successfully");
            }
        }
    });

    loop {
        let response: Option<(String, String)> = conn.brpop("db_processor", 0.0)?;
        if let Some((_, message)) = response {
            let parsed: IncomingMessage = serde_json::from_str(&message)?;

            if parsed.message_type == "TRADE_ADDED" {
                if let Err(e) = process_trade_dynamically(&pool, &parsed.data).await {
                    error!(
                        "Failed to process trade for {}: {:?}",
                        parsed.data.ticker, e
                    );
                } else {
                    info!("Processed trade for {}", parsed.data.ticker);
                }
            }
        }
    }
}

async fn refresh_views(pool: &PgPool) -> Result<(), sqlx::Error> {
    // 1) Query Postgres for all matview names in public that start with "klines_"
    let views = sqlx::query!(
        r#"
        SELECT matviewname
          FROM pg_matviews
         WHERE schemaname = 'public'
           AND matviewname LIKE 'klines_%'
        "#
    )
    .fetch_all(pool)
    .await?;

    for row in views {
        let name = &row.matviewname.unwrap();
        let sql = format!("REFRESH MATERIALIZED VIEW public.{}", name);
        sqlx::query(&sql).execute(pool).await?;
        info!("Refreshed mat‑view public.{}", name);
    }

    Ok(())
}
