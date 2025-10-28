use axum::{routing::get, Router};
use std::{net::SocketAddr, sync::Arc};
use tracing::info;

mod handlers;
mod redis_manager;
mod types;
mod websocket;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let state = Arc::new(types::AppState::new());

    let app = Router::new()
        .route("/ws", get(handlers::ws_handler))
        .with_state(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], 8081));
    info!("WebSocket server listening on ws://{}", addr);

    axum::serve(
        tokio::net::TcpListener::bind(addr).await.unwrap(),
        app.into_make_service(),
    )
    .await
    .unwrap();
}
