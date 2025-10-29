# Arcium Integration for Olivia Prediction Market

This directory contains all Arcium-related components for Olivia, a decentralized permissionless prediction market that uses encrypted computation to keep predictions private until market resolution.

## Overview

Arcium provides a **Multi-Party Computation (MPC) network** that enables encrypted computations on Solana. In Olivia, Arcium ensures that user predictions remain encrypted throughout the computation lifecycle, maintaining privacy while still allowing accurate reward calculations and pool distributions.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         OLIVIA PREDICTION MARKET                            │
│                     Decentralized Encrypted Architecture                    │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│   User Frontend  │  (Next.js)
│                  │
│  • Place Bets    │
│  • View Markets  │
│  • Encrypt Data  │
└────────┬─────────┘
         │
         │ (1) User places bet with encrypted prediction
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SOLANA BLOCKCHAIN LAYER                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────┐         ┌──────────────────────────┐       │
│  │  Prediction Market       │         │      Arcium Program       │       │
│  │  Program                 │◄────────┤  (Orchestration Layer)    │       │
│  │  (AMgZmVhB1...)          │  CPI    │  (BKck65TgoKR...)          │       │
│  └────────┬─────────────────┘         └────────┬──────────────────┘       │
│           │                                    │                            │
│           │ queue_computation()               │                            │
│           │ (encrypted data)                  │                            │
│           │                                    │                            │
│           │                                    │                            │
│  ┌────────▼───────────────────────────────────▼──────────────────────┐  │
│  │                           MXE (Multi-Party Execution Environment)    │  │
│  │                                                                      │  │
│  │  • Mempool: Queues encrypted computations                           │  │
│  │  • Executing Pool: Active computations                              │  │
│  │  • Computation Definitions: Blueprint for each computation type    │  │
│  │                                                                      │  │
│  │  ┌─────────────────────────────────────────────────────────────┐   │  │
│  │  │  Computation Definitions (PDAs)                            │   │  │
│  │  │  • initialize_market_comp_def                              │   │  │
│  │  │  • place_bet_comp_def                                      │   │  │
│  │  │  • distribute_rewards_comp_def                             │   │  │
│  │  └─────────────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└───────────────────────────────┬───────────────────────────────────────────┘
                                │
                                │ (2) Queued computation sent to ARX cluster
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ARCIUM MPC NETWORK (Off-Chain)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                        ARX Node Cluster                             │  │
│  │                                                                      │  │
│  │  ┌──────────────┐              ┌──────────────┐                     │  │
│  │  │  ARX Node 0  │              │  ARX Node 1  │                     │  │
│  │  │              │◄────MPC─────►│              │                     │  │
│  │  │ • Encrypted  │    Protocol   │ • Encrypted  │                     │  │
│  │  │   Computation│               │   Computation│                     │  │
│  │  │ • No decryption│              │ • No decryption│                  │  │
│  │  └──────────────┘              └──────────────┘                     │  │
│  │                                                                      │  │
│  │  Process: Multi-Party Computation on Encrypted Data                 │  │
│  │  • Nodes compute WITHOUT decrypting                                 │  │
│  │  • Results remain encrypted until callback                          │  │
│  │  • Zero-knowledge: No node sees plaintext                           │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└───────────────────────────────┬───────────────────────────────────────────┘
                                │
                                │ (3) Encrypted computation result
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CALLBACK TO SOLANA                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────────────┐                                             │
│  │  Prediction Market       │                                             │
│  │  Callback Handlers:       │                                             │
│  │                           │                                             │
│  │  • place_bet_callback()   │                                             │
│  │  • init_market_callback() │                                             │
│  │  • distribute_callback()  │                                             │
│  │                           │                                             │
│  │  Updates market state     │                                             │
│  │  with encrypted results   │                                             │
│  └──────────────────────────┘                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATA FLOW SUMMARY                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. User → Frontend: Encrypts prediction using x25519                      │
│  2. Frontend → Solana: place_bet() with encrypted data                    │
│  3. Solana → Arcium: queue_computation(encrypted_prediction)               │
│  4. Arcium MXE → ARX Cluster: Distributes encrypted computation            │
│  5. ARX Nodes: Perform MPC on encrypted data (no decryption)              │
│  6. ARX Cluster → Solana: Callback with encrypted results                  │
│  7. Solana Program: Updates market state from encrypted callback          │
│  8. Frontend: Updates UI with transaction confirmation                     │
│                                                                             │
│  Key Property: Prediction NEVER decrypted until market resolution         │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
Arcium/
├── config/
│   └── Arcium.toml              # Arcium configuration (localnet settings)
│
├── scripts/
│   ├── init-arcium-localnet.js  # Master initialization script
│   ├── init-mxe.js              # Initialize MXE account
│   └── init-comp-defs.js        # Initialize computation definitions
│
├── circuits/
│   ├── EncryptedIxs/            # Rust source for encrypted instructions
│   │   ├── Cargo.toml
│   │   └── src/lib.rs
│   └── build/                    # Compiled circuit files
│       ├── *.arcis              # Arcium circuit files
│       └── *.arcis.ir           # Intermediate representation
│
├── artifacts/
│   ├── programs/                # Arcium program binaries
│   │   └── arcium_program_*.so
│   ├── cli/                     # Arcium CLI tools
│   ├── nodes/                    # ARX node configurations
│   │   ├── node_config_*.toml
│   │   └── arx_node_*.json
│   ├── accounts/                 # On-chain account keypairs
│   │   ├── mxe_acc.json
│   │   ├── cluster_acc_*.json
│   │   └── ...
│   ├── circuits/                 # Raw circuit artifacts
│   ├── localnet/                 # Localnet node identities
│   └── docker-compose-arx-env.yml  # Docker Compose for ARX nodes
│
└── docs/
    └── Arcium.md                # Detailed explanation document
```

## Core Components

### 1. Arcium Program (On-Chain)
- **Program ID**: `BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6`
- **Purpose**: Orchestrates encrypted computations, manages MXE accounts, coordinates ARX nodes
- **Verification**: [Solscan Devnet](https://solscan.io/account/BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6?cluster=devnet)

### 2. MXE (Multi-Party Execution Environment)
- **Purpose**: Workspace for encrypted computations
- **Components**:
  - **Mempool**: Queues pending encrypted computations
  - **Executing Pool**: Active computations in progress
  - **Computation Definitions**: Blueprints for computation types

### 3. ARX Nodes (Off-Chain)
- **Purpose**: Perform Multi-Party Computation on encrypted data
- **Deployment**: Docker containers running ARX node software
- **Privacy**: No single node can decrypt data; computation happens collaboratively
- **Configuration**: `artifacts/nodes/node_config_*.toml`

### 4. Computation Definitions
Three computation definitions enable encrypted market operations:

1. **`initialize_market_comp_def`**: Initialize new prediction markets
2. **`place_bet_comp_def`**: Process encrypted bet placements
3. **`distribute_rewards_comp_def`**: Calculate and distribute rewards

Each is a Program Derived Address (PDA) that defines the computation schema.

## Setup and Initialization

### Prerequisites
1. Solana CLI installed
2. Docker Desktop running
3. Arcium CLI installed (`cargo install arcium-cli`)

### Initialization Sequence

```bash
# 1. Start Solana validator with Arcium program
solana-test-validator \
  --clone-upgradeable-program BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6 \
  --url devnet \
  --bpf-program AMgZmVhB17SVSQAbhTHaZzHPurArHaJ7zJeLdcwKRhE2 \
  target/deploy/prediction_market.so

# 2. Start ARX node containers
docker compose -f Arcium/artifacts/docker-compose-arx-env.yml up -d

# 3. Initialize Arcium network (one-time setup)
arcium init-arcium-network --keypair-path ~/.config/solana/id.json --rpc-url localnet
arcium init-cluster --cluster-offset 0 --keypair-path ~/.config/solana/id.json --rpc-url localnet

# 4. Initialize MXE and computation definitions
node Arcium/scripts/init-arcium-localnet.js
```

Or use the master script:
```bash
node Arcium/scripts/init-arcium-localnet.js
```

## Encryption Flow

1. **Frontend Encryption**: User's prediction encrypted using `@arcium-hq/client`
   ```typescript
   const encrypted = await encryptPrediction(
     prediction, // true/false
     provider,
     programId
   );
   ```

2. **On-Chain Queuing**: Prediction Market program queues encrypted computation
   ```rust
   queue_computation(
       ctx.accounts,
       computation_offset,
       args,
       None,
       vec![Callback::callback_ix(&[])]
   );
   ```

3. **MPC Execution**: ARX nodes perform computation without decryption

4. **Callback Processing**: Results returned via callback to update market state

## Configuration

### Arcium.toml
Located in `config/Arcium.toml`:
```toml
[localnet]
nodes = 2
localnet_timeout_secs = 120
```

### Docker Compose
Located in `artifacts/docker-compose-arx-env.yml`:
- Defines 2 ARX nodes (arx-node-0, arx-node-1)
- Mounts node configurations and keypairs
- Sets up networking for MPC communication

## Program IDs

| Component | Program/Account ID | Solscan Link |
|-----------|-------------------|--------------|
| Arcium Program | `BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6` | [View](https://solscan.io/account/BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6?cluster=devnet) |
| Prediction Market | `AMgZmVhB17SVSQAbhTHaZzHPurArHaJ7zJeLdcwKRhE2` | [View](https://solscan.io/account/AMgZmVhB17SVSQAbhTHaZzHPurArHaJ7zJeLdcwKRhE2?cluster=devnet) |

## Troubleshooting

### MXE Initialization Fails
- Ensure Arcium program is deployed: `solana program show BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6`
- Verify network/cluster initialized: `arcium init-arcium-network` first

### ARX Nodes Not Running
- Check Docker: `docker ps | grep arx-node`
- View logs: `docker compose -f Arcium/artifacts/docker-compose-arx-env.yml logs`

### Computation Definitions Fail
- Verify MXE initialized: `node Arcium/scripts/init-mxe.js`
- Check authority matches wallet: MXE must have correct authority set

## Additional Resources

- **Detailed Documentation**: See [Arcium.md](docs/Arcium.md) for in-depth explanation
- **Arcium Docs**: https://docs.arcium.com
- **Migration Guide**: https://docs.arcium.com/developers/migration/migration-v0.2-to-v0.3

## License

This project is licensed under the Apache 2.0 License. See the [LICENSE](../LICENSE) file in the root directory for details.

---

**Olivia**: Decentralized Permissionless Prediction Market  
**Copyright (c) 2025 Ayush Srivastava**

