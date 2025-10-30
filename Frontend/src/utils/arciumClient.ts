/**
 * Olivia: Decentralised Permissionless Prediction Market 
 * Copyright (c) 2025 Ayush Srivastava
 *
 * Licensed under the Apache 2.0
 */

import { PublicKey } from "@solana/web3.js";
import { AnchorProvider, BN } from "@coral-xyz/anchor";
import {
  getMXEPublicKey,
  getMXEAccAddress,
  getMempoolAccAddress,
  getExecutingPoolAccAddress,
  getCompDefAccAddress,
  getComputationAccAddress,
  getClusterAccAddress,
  getCompDefAccOffset,
  RescueCipher,
  x25519,
  awaitComputationFinalization,
  deserializeLE,
} from "@arcium-hq/client";
// Browser-compatible random bytes generator
function randomBytes(length: number): Buffer {
  const bytes = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    // Fallback for environments without crypto API
    for (let i = 0; i < length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Buffer.from(bytes);
}

/**
 * Generate a random computation offset as BN
 */
export function generateComputationOffset(): BN {
  return new BN(randomBytes(8), "hex");
}

/**
 * Generate x25519 keypair for encryption
 */
export function generateEncryptionKeypair(): {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
} {
  const privateKey = x25519.utils.randomSecretKey();
  const publicKey = x25519.getPublicKey(privateKey);
  return { privateKey, publicKey };
}

// Network selection (default to devnet to avoid requiring testnet keys by default)
const NETWORK = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet') as
  | 'devnet'
  | 'testnet'
  | 'mainnet-beta';

// Arcium program ID (used for system-level Arcium operations if needed)
// Note: Most Arcium accounts (mempool, execpool, MXE, etc.) are derived from OUR program ID
const DEVNET_ARCIUM_PROGRAM_ID = new PublicKey("BKck65TgoKRokMjQM3datB9oRwJ8rAj2jxPXvHXUvcL6");
const TESTNET_ARCIUM_PROGRAM_ID_STR = process.env.NEXT_PUBLIC_ARCIUM_PROGRAM_ID_TESTNET;

function requireTestnetKey(name: string, value?: string): string {
  if (!value || value.trim().length === 0) {
    throw new Error(
      `[Arcium config] Missing ${name} for testnet. Set ${name} in ENV (see Frontend/ENV.sample).`
    );
  }
  return value;
}

export const ARCIUM_PROGRAM_ID = NETWORK === 'testnet'
  ? new PublicKey(requireTestnetKey('NEXT_PUBLIC_ARCIUM_PROGRAM_ID_TESTNET', TESTNET_ARCIUM_PROGRAM_ID_STR))
  : DEVNET_ARCIUM_PROGRAM_ID;

/**
 * Get MXE public key with retry logic
 */
export async function getMXEPublicKeyWithRetry(
  provider: AnchorProvider,
  programId: PublicKey,
  maxRetries: number = 3,
  retryDelayMs: number = 500
): Promise<Uint8Array> {
  // Derive the MXE account address from our program ID
  const mxeAccount = getMXEAccAddress(programId);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}: Reading MXE account data from ${mxeAccount.toString()}`);

      // Get the account info directly
      const accountInfo = await provider.connection.getAccountInfo(mxeAccount);

      if (!accountInfo) {
        throw new Error(`MXE account ${mxeAccount.toString()} does not exist on ${NETWORK}`);
      }

      if (accountInfo.data.length === 0) {
        throw new Error(`MXE account ${mxeAccount.toString()} exists but has no data`);
      }

      console.log(`MXE account found with ${accountInfo.data.length} bytes of data`);
      console.log(`Account owner: ${accountInfo.owner.toString()}`);
      console.log(`First 32 bytes:`, Array.from(accountInfo.data.slice(0, 32)));

      // The MXE public key should be stored in the account data
      // Based on Arcium's structure, it's likely the first 32 bytes after some header
      // Let's try different offsets to find the 32-byte public key

      if (accountInfo.data.length >= 32) {
        // Try the first 32 bytes (offset 0)
        const mxePublicKey = accountInfo.data.slice(0, 32);
        console.log("Extracted MXE public key (offset 0):", Array.from(mxePublicKey));
        return mxePublicKey;
      }

      throw new Error(`MXE account data is too short (${accountInfo.data.length} bytes), expected at least 32 bytes`);

    } catch (error) {
      console.log(`Attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        console.log(`Retrying in ${retryDelayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  }

  throw new Error(
    `Failed to read MXE public key after ${maxRetries} attempts. Account ${mxeAccount.toString()} exists but we cannot parse the public key from its data.`
  );
}

/**
 * Encrypt a prediction (boolean) for submission to Arcium
 */
export async function encryptPrediction(
  prediction: boolean,
  provider: AnchorProvider,
  programId: PublicKey
): Promise<{
  encryptedPrediction: number[];
  publicKey: number[];
  nonce: number[];
  nonceBN: BN;
}> {
  // Generate encryption keypair
  const { privateKey, publicKey } = generateEncryptionKeypair();

  // Get MXE public key
  const mxePublicKey = await getMXEPublicKeyWithRetry(provider, programId);

  // Generate shared secret
  const sharedSecret = x25519.getSharedSecret(privateKey, mxePublicKey);

  // Create cipher
  const cipher = new RescueCipher(sharedSecret);

  // Generate nonce
  const nonce = randomBytes(16);

  // Encrypt prediction (true = 1, false = 0)
  const encrypted = cipher.encrypt(
    [BigInt(prediction ? 1 : 0)],
    nonce
  );

  return {
    encryptedPrediction: Array.from(encrypted[0]),
    publicKey: Array.from(publicKey),
    nonce: Array.from(nonce),
    nonceBN: new BN(deserializeLE(nonce).toString()),
  };
}

/**
 * Get all required Arcium accounts for a computation
 */
export function getArciumAccounts(
  programId: PublicKey,
  computationOffset: BN,
  instructionName: "initialize_market" | "place_bet" | "distribute_rewards",
  clusterAccount?: PublicKey
): {
  mxeAccount: PublicKey;
  mempoolAccount: PublicKey;
  executingPool: PublicKey;
  computationAccount: PublicKey;
  compDefAccount: PublicKey;
  clusterAccount: PublicKey;
} {
  // Derive MXE account from our program ID (should match hardcoded value for devnet)
  const mxeAccount = getMXEAccAddress(programId);

  // CRITICAL: All Arcium accounts must be derived from OUR program ID, not Arcium's
  // The Rust macros (derive_mempool_pda!, etc.) derive from the calling program
  const mempoolAccount = getMempoolAccAddress(programId);
  const executingPool = getExecutingPoolAccAddress(programId);

  // Use our prediction market program ID for computation-specific accounts
  const computationAccount = getComputationAccAddress(
    programId,
    computationOffset
  );

  const offset = Buffer.from(getCompDefAccOffset(instructionName));
  const compDefAccount = getCompDefAccAddress(
    programId,
    offset.readUInt32LE()
  );

  // For cluster account, use provided one or default to cluster 0
  const cluster = clusterAccount || getClusterAccAddress(0);

  return {
    mxeAccount,
    mempoolAccount,
    executingPool,
    computationAccount,
    compDefAccount,
    clusterAccount: cluster,
  };
}

/**
 * Wait for computation finalization
 */
export async function waitForComputationFinalization(
  provider: AnchorProvider,
  computationOffset: BN,
  programId: PublicKey,
  commitment: "confirmed" | "finalized" = "confirmed"
): Promise<string> {
  return await awaitComputationFinalization(
    provider,
    computationOffset,
    programId,
    commitment
  );
}

