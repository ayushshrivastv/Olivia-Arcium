/*
 * Olivia: Decentralised Permissionless Predicition Market 
 * Copyright (c) 2025 Ayush Srivastava
 *
 * Licensed under the Apache 2.0
 */

use redis::{Commands, Connection, RedisResult};

pub struct PubSubPublisher {
    conn: Connection,
}

impl PubSubPublisher {
    pub fn new(redis_url: &str) -> RedisResult<Self> {
        let client = redis::Client::open(redis_url)?;
        let conn = client.get_connection()?;
        Ok(Self { conn })
    }

    pub fn publish(&mut self, channel: &str, payload_json: &str) -> RedisResult<()> {
        self.conn.publish(channel, payload_json)?;
        Ok(())
    }
}


