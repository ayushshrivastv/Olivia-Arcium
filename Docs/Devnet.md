## Olivia Devnet Runbook

Prereqs
- Node 20+, Rust stable, Docker (for Redis/DB if needed), Solana CLI
- Wallet funded on devnet for the program interactions

Env setup
- Frontend: copy `Frontend/ENV.sample` to `.env.local` and set `NEXT_PUBLIC_PREDICTION_MARKET_PROGRAM_ID`
- WebSocketServer: copy `WebSocketServer/ENV.sample` to `.env` (or export) and set `REDIS_URL`, `WEB_SOCKET_PORT`
- DatabaseProcessor: copy `DatabaseProcessor/ENV.sample` to `.env` and set `DATABASE_URL`, `REDIS_URL`

Build
- Frontend: `cd Frontend && npm ci && npm run build`
- WebSocketServer: `cd WebSocketServer && cargo build --release`
- DatabaseProcessor: `cd DatabaseProcessor && cargo build --release`

Run services
- Redis: `docker run -p 6379:6379 redis:7`
- WebSocketServer: `cd WebSocketServer && ./target/release/websocketserver`
- DatabaseProcessor: `cd DatabaseProcessor && ./target/release/databaseprocessor`
- Frontend: `cd Frontend && npm run dev`

Arcium check
- Ensure Arcium 0.3.0 nodes reachable and MXE/computation definitions initialized per `Arcium/docs/Arcium.md`

Smoke flow (Devnet)
1) Create market via UI
2) Place bet (YES/NO)
3) Resolve market (authority)
4) Verify rewards distribution and real-time updates via WebSocket

Notes
- Override RPC via `NEXT_PUBLIC_SOLANA_RPC_URL` if needed
- Program IDL is served from `/public/idl/prediction_market.json` (already present)
