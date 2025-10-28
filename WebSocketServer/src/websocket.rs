use axum::extract::ws::{Message, WebSocket};
use futures::{sink::SinkExt, stream::StreamExt};
use std::{collections::HashMap, sync::Arc};
use tokio::sync::Mutex;
use tokio::task::JoinHandle;
use tracing::{error, info};

use crate::redis_manager::RedisManager;
use crate::types::{ChannelInfo, ClientRequest, ServerMessage, SharedState};

pub async fn handle_socket(socket: WebSocket, state: SharedState) {
    let (websocket_sender, mut websocket_receiver) = socket.split();
    let shared_websocket_sender = Arc::new(Mutex::new(websocket_sender));

    let mut client_room_forwarding_tasks: HashMap<String, JoinHandle<()>> = HashMap::new();
    let redis_manager = RedisManager::new(state.redis_client.clone());

    while let Some(Ok(msg)) = websocket_receiver.next().await {
        match msg {
            Message::Text(text) => match serde_json::from_str::<ClientRequest>(&text) {
                Ok(request) => match request {
                    ClientRequest::Subscribe { payload } => {
                        let room_name = payload.room.clone();
                        if client_room_forwarding_tasks.contains_key(&room_name) {
                            info!("Client already subscribed to room: {}", room_name);
                            continue;
                        }

                        match subscribe_client_to_room(
                            shared_websocket_sender.clone(),
                            state.clone(),
                            room_name.clone(),
                        )
                        .await
                        {
                            Ok(join_handle) => {
                                client_room_forwarding_tasks.insert(room_name.clone(), join_handle);
                                info!("Client subscribed to room: {}", room_name);
                            }
                            Err(e) => {
                                error!("Failed to subscribe client to room {}: {}", room_name, e);
                            }
                        }
                    }
                    ClientRequest::Unsubscribe { payload } => {
                        let room_name = payload.room.clone();
                        if let Some(task_handle) = client_room_forwarding_tasks.remove(&room_name) {
                            task_handle.abort();
                            decrement_room_subscriber_count(state.clone(), room_name.clone()).await;
                            info!("Client unsubscribed from room: {}", room_name);
                        } else {
                            info!(
                                "Client tried to unsubscribe from room {} but was not subscribed.",
                                room_name
                            );
                        }
                    }
                    ClientRequest::SendMessage { payload } => {
                        let room_name = payload.room.clone();
                        let message_content = payload.message.clone();

                        if let Err(e) = redis_manager.publish_message(&room_name, &message_content)
                        {
                            error!("Failed to send message to room {}: {}", room_name, e);
                        } else {
                            info!("Client message published to Redis room '{}'", room_name);
                        }
                    }
                },
                Err(e) => {
                    error!("Failed to parse client message: {}", e);
                    let mut sender_guard = shared_websocket_sender.lock().await;
                    let error_msg = Message::Text(
                        format!("{{\"error\":\"Failed to parse message: {}\"}}", e).into(),
                    );
                    if sender_guard.send(error_msg).await.is_err() {
                        error!(
                            "Failed to send parsing error to client, client might be disconnected."
                        );
                        break;
                    }
                }
            },
            Message::Close(_) => {
                info!("Client sent close message.");
                break;
            }
            Message::Ping(ping_data) => {
                let mut sender_guard = shared_websocket_sender.lock().await;
                if sender_guard.send(Message::Pong(ping_data)).await.is_err() {
                    error!("Failed to send pong, client might be disconnected.");
                    break;
                }
            }
            Message::Pong(_) => {
                info!("Received pong from client.");
            }
            Message::Binary(_) => {
                error!("Received unexpected binary message from client.");
            }
        }
    }

    info!("Client disconnected. Cleaning up client resources...");
    let subscribed_rooms_on_disconnect: Vec<String> =
        client_room_forwarding_tasks.keys().cloned().collect();
    for room_name in subscribed_rooms_on_disconnect {
        if let Some(task_handle) = client_room_forwarding_tasks.remove(&room_name) {
            task_handle.abort();
        }
        decrement_room_subscriber_count(state.clone(), room_name.clone()).await;
        info!(
            "Auto-unsubscribed client from room {} due to disconnect",
            room_name
        );
    }
    info!("Client cleanup complete.");
}

async fn subscribe_client_to_room(
    websocket_tx: Arc<Mutex<futures::stream::SplitSink<WebSocket, Message>>>,
    state: SharedState,
    room: String,
) -> Result<JoinHandle<()>, String> {
    let broadcast_sender = {
        let mut channels = state.channels.lock().await;
        if let Some(info) = channels.get_mut(&room) {
            info.subscribers += 1;
            info.sender.clone()
        } else {
            let (s, _) = tokio::sync::broadcast::channel(100); // Channel capacity
            channels.insert(
                room.clone(),
                ChannelInfo {
                    sender: s.clone(),
                    subscribers: 1,
                },
            );

            RedisManager::start_listener(state.redis_client.clone(), room.clone(), s.clone());
            s
        }
    };

    let mut broadcast_rx = broadcast_sender.subscribe();
    let room_clone_for_task = room.clone();

    let task_handle = tokio::spawn(async move {
        loop {
            match broadcast_rx.recv().await {
                Ok(payload) => {
                    let server_msg = ServerMessage {
                        room: room_clone_for_task.clone(),
                        data: payload,
                    };

                    match serde_json::to_string(&server_msg) {
                        Ok(json_msg) => {
                            let mut tx_guard = websocket_tx.lock().await;
                            if tx_guard.send(Message::Text(json_msg.into())).await.is_err() {
                                break;
                            }
                        }
                        Err(e) => {
                            error!(
                                "Forwarding task for room '{}': Failed to serialize server message: {}. Skipping message.",
                                room_clone_for_task, e
                            );
                        }
                    }
                }
                Err(tokio::sync::broadcast::error::RecvError::Lagged(n)) => {
                    error!(
                        "Forwarding task for room '{}': WebSocket sender lagged by {} messages. Skipping.", 
                        room_clone_for_task, n
                    );
                }
                Err(tokio::sync::broadcast::error::RecvError::Closed) => {
                    error!(
                        "Forwarding task for room '{}': Broadcast channel closed. This task will stop.", 
                        room_clone_for_task
                    );
                    break;
                }
            }
        }
    });

    Ok(task_handle)
}

async fn decrement_room_subscriber_count(state: SharedState, room: String) {
    let mut channels = state.channels.lock().await;
    let mut remove_channel_fully = false;

    if let Some(info) = channels.get_mut(&room) {
        info.subscribers = info.subscribers.saturating_sub(1);
        if info.subscribers == 0 {
            remove_channel_fully = true;
        }
    } else {
        info!(
            "Attempted to decrement subscriber count for non-existent or already removed room: {}",
            room
        );
        return;
    }

    if remove_channel_fully {
        channels.remove(&room);
    }
}
