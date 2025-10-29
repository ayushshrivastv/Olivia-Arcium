/*
 * Olivia: Decentralised Permissionless Predicition Market 
 * Copyright (c) 2025 Ayush Srivastava
 *
 * Licensed under the Apache 2.0
 */

pub mod message_from_engine;
pub use message_from_engine::*;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct IncomingMessage {
    #[serde(rename = "type")]
    pub message_type: String,
    pub data: AddTradePayload,
}
