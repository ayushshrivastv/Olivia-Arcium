use anyhow::{anyhow, Result};
use sqlx::{Executor, PgPool};
use tracing::{error, info, warn};

use crate::types::AddTradePayload;

fn sanitize_ticker(ticker: &str) -> String {
    ticker
        .replace(|c: char| !c.is_alphanumeric() && c != '_', "_")
        .to_lowercase()
}

pub async fn ensure_market_resources(pool: &PgPool, raw_ticker: &str) -> Result<(), anyhow::Error> {
    println!("inside");
    let sanitized_ticker = sanitize_ticker(raw_ticker);
    let table_name = format!("prices_{}", sanitized_ticker);

    let create_table_sql = format!(
        r#"
        CREATE TABLE IF NOT EXISTS public.{} (
            "time"        TIMESTAMPTZ NOT NULL,
            price         DOUBLE PRECISION,
            quantity      DOUBLE PRECISION,
            volume        DOUBLE PRECISION,
            market_ticker VARCHAR(50) NOT NULL  -- Stores the original ticker like "SOL/USDC"
        );
        "#,
        table_name
    );
    pool.execute(create_table_sql.as_str()).await?;
    info!("Ensured table public.{} exists or was created.", table_name);

    let create_hypertable_sql = format!(
        "SELECT create_hypertable('public.{}', 'time', partitioning_column => 'price', number_partitions => 2, if_not_exists => TRUE, migrate_data => TRUE);",
        table_name
    );

    match pool.execute(create_hypertable_sql.as_str()).await {
        Ok(_) => info!("Ensured public.{} is a hypertable.", table_name),
        Err(e) => {
            if e.as_database_error().map_or(false, |db_err| {
                db_err.message().contains("already a hypertable")
            }) {
                warn!(
                    "Table public.{} was already a hypertable. Proceeding.",
                    table_name
                );
            } else {
                error!("Failed to ensure hypertable for public.{}: {}. This might be an issue if 'if_not_exists' is not fully supported for all parameters or versions.", table_name, e);
                return Err(anyhow!(
                    "Failed to ensure hypertable for public.{}: {}",
                    table_name,
                    e
                ));
            }
        }
    }

    let intervals = [
        ("1m", "1 minute"),
        ("1h", "1 hour"),
        ("1d", "1 day"),
        ("1w", "1 week"),
    ];

    for (interval_label, interval_duration) in intervals.iter() {
        let mv_name = format!("klines_{}_{}", interval_label, sanitized_ticker);
        let create_mv_sql = format!(
            r#"
            CREATE MATERIALIZED VIEW IF NOT EXISTS public.{} AS
            SELECT
                time_bucket('{}', "time") AS bucket,
                first(price, "time") AS open,
                max(price) AS high,
                min(price) AS low,
                last(price, "time") AS close,
                sum(volume) AS volume,
                market_ticker  -- Grouping by the specific market ticker
            FROM public.{}
            GROUP BY bucket, market_ticker
            WITH DATA; -- Populate the MV upon creation
            "#,
            mv_name, interval_duration, table_name
        );
        pool.execute(create_mv_sql.as_str()).await?;
        info!(
            "Ensured materialized view public.{} exists or was created.",
            mv_name
        );

        let create_mv_index_sql = format!(
            "CREATE UNIQUE INDEX IF NOT EXISTS idx_{mv_name}_bucket_ticker ON public.{mv_name} (bucket DESC, market_ticker);"
        );
        pool.execute(create_mv_index_sql.as_str()).await?;
        info!(
            "Ensured index on public.{} for (bucket DESC, market_ticker).",
            mv_name
        );
    }

    Ok(())
}

pub async fn process_trade_dynamically(
    pool: &PgPool,
    trade_payload: &AddTradePayload,
) -> Result<(), anyhow::Error> {
    println!("called");
    ensure_market_resources(pool, &trade_payload.ticker).await?;

    let sanitized_ticker = sanitize_ticker(&trade_payload.ticker);
    let table_name = format!("prices_{}", sanitized_ticker);

    let price_f64 = trade_payload
        .price
        .to_string()
        .parse::<f64>()
        .map_err(|e| anyhow!("Failed to convert price Decimal to f64: {}", e))?;
    let quantity_f64 = trade_payload
        .quantity
        .to_string()
        .parse::<f64>()
        .map_err(|e| anyhow!("Failed to convert quantity Decimal to f64: {}", e))?;

    let volume_decimal = trade_payload.price * trade_payload.quantity;
    let volume_f64 = volume_decimal
        .to_string()
        .parse::<f64>()
        .map_err(|e| anyhow!("Failed to convert volume Decimal to f64: {}", e))?;

    let insert_sql = format!(
        "INSERT INTO public.{} (\"time\", price, quantity, volume, market_ticker) VALUES ($1, $2, $3, $4, $5)",
        table_name
    );

    sqlx::query(&insert_sql)
        .bind(trade_payload.time)
        .bind(price_f64)
        .bind(quantity_f64)
        .bind(volume_f64)
        .bind(&trade_payload.ticker)
        .execute(pool)
        .await?;

    info!(
        "Inserted trade for ticker '{}' into table public.{}.",
        trade_payload.ticker, table_name
    );
    Ok(())
}
