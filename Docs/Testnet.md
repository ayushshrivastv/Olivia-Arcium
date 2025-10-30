# Testnet Configuration

## Environment

Set these in Frontend/.env.local:

```
NEXT_PUBLIC_SOLANA_NETWORK=testnet
# Optional RPC override
# NEXT_PUBLIC_SOLANA_RPC_URL=https://api.testnet.solana.com

# Required: your testnet deployment program id
NEXT_PUBLIC_PREDICTION_MARKET_PROGRAM_ID=ReplaceWithYourTestnetProgramId

# Required for Arcium on testnet
NEXT_PUBLIC_ARCIUM_MXE_ACCOUNT_TESTNET=ReplaceWithMXEAccountPubkey
NEXT_PUBLIC_ARCIUM_PROGRAM_ID_TESTNET=ReplaceWithArciumProgramId
```

## Notes
- The app now defaults to testnet if NEXT_PUBLIC_SOLANA_NETWORK is unset.
- Devnet Arcium accounts remain hardcoded for devnet; testnet requires explicit values.
- RPC fallbacks are selected per network for better reliability.
