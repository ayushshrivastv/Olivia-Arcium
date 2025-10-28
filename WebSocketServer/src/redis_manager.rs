use redis::{Client, Commands};
use tracing::{error, info};

pub struct RedisManager {
    client: Client,
}

impl RedisManager {
    pub fn new(client: Client) -> Self {
        RedisManager { client }
    }

    pub fn publish_message(&self, room: &str, message: &str) -> Result<(), String> {
        let mut conn = self
            .client
            .get_connection()
            .map_err(|e| format!("Failed to get Redis connection: {}", e))?;

        conn.publish(room, message)
            .map_err(|e| format!("Failed to publish message to Redis room '{}': {}", room, e))?;

        Ok(())
    }

    pub fn start_listener(
        client: Client,
        room: String,
        sender: tokio::sync::broadcast::Sender<String>,
    ) {
        std::thread::spawn(move || {
            let mut conn = match client.get_connection() {
                Ok(c) => c,
                Err(err) => {
                    error!(
                        "Redis listener for room '{}': Connection error: {}. Listener not started.",
                        room, err
                    );
                    return;
                }
            };

            let mut pubsub = conn.as_pubsub();
            if let Err(err) = pubsub.subscribe(&room) {
                error!(
                    "Redis listener for room '{}': Subscribe error: {}. Listener stopping.",
                    room, err
                );
                return;
            }

            info!("Redis listener started for room '{}'", room);

            loop {
                let msg = match pubsub.get_message() {
                    Ok(m) => m,
                    Err(err) => {
                        error!("Redis listener for room '{}': PubSub get_message error: {:?}. Listener stopping.", room, err.kind());
                        break;
                    }
                };

                match msg.get_payload::<String>() {
                    Ok(payload) => {
                        if sender.send(payload).is_err() {
                            error!(
                                "Redis listener for room '{}': Broadcast sender has no receivers or is closed. Stopping listener.",
                                room
                            );
                            break;
                        }
                    }
                    Err(err) => {
                        error!("Redis listener for room '{}': Failed to parse payload: {}. Skipping message.", room, err);
                    }
                }
            }

            if let Err(err) = pubsub.unsubscribe(&room) {
                error!(
                    "Redis listener for room '{}': Unsubscribe error: {}",
                    room, err
                );
            }
        });
    }
}
