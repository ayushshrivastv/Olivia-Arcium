use redis::{Client, Connection, RedisResult};

pub struct RedisManager {
    client: Client,
}

impl RedisManager {
    pub fn new() -> Self {
        let client = redis::Client::open(std::env::var("REDIS_URL").unwrap()).unwrap();

        RedisManager { client }
    }

    pub fn get_connection(&self) -> RedisResult<Connection> {
        self.client.get_connection()
    }
}
