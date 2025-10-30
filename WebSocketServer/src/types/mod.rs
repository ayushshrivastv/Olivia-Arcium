/*
 * Olivia: Decentralised Permissionless Predicition Market 
 * Copyright (c) 2025 Ayush Srivastava
 *
 * Licensed under the Apache 2.0
 */

use std::{collections::HashMap, sync::Arc};

use serde::{Deserialize, Serialize};
use tokio::sync::{broadcast, Mutex};

#[derive(Debug, Deserialize)]
pub struct SubscribePayload {
    pub room: String,
}

#[derive(Debug, Deserialize)]
pub struct UnsubscribePayload {
    pub room: String,
}

#[derive(Debug, Deserialize)]
pub struct MessagePayload {
    pub room: String,
    pub message: String,
}

#[derive(Debug, Deserialize)]
#[serde(tag = "type", rename_all = "UPPERCASE")]
pub enum ClientRequest {
    #[serde(rename = "SUBSCRIBE")]
    Subscribe { payload: SubscribePayload },
    #[serde(rename = "UNSUBSCRIBE")]
    Unsubscribe { payload: UnsubscribePayload },
    #[serde(rename = "SEND_MESSAGE")]
    SendMessage { payload: MessagePayload },
}

#[derive(Debug, Serialize)]
pub struct ServerMessage {
    pub room: String,
    pub data: String,
}

pub struct AppState {
    pub channels: Mutex<HashMap<String, ChannelInfo>>,
    pub redis_client: redis::Client,
}

impl AppState {
    pub fn new() -> Self {
        let redis_url = std::env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1/".to_string());
        let redis_client = redis::Client::open(redis_url)
            .expect("Failed to connect to Redis. Ensure REDIS_URL is set correctly (e.g., redis://127.0.0.1/)");

        AppState {
            channels: Mutex::new(HashMap::new()),
            redis_client,
        }
    }
}

pub struct ChannelInfo {
    pub sender: broadcast::Sender<String>,
    pub subscribers: usize,
}

pub type SharedState = Arc<AppState>;
