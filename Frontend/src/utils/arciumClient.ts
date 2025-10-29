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

/**
 * Get MXE public key with retry logic
 */
export async function getMXEPublicKeyWithRetry(
  provider: AnchorProvider,
  programId: PublicKey,
  maxRetries: number = 10,
  retryDelayMs: number = 500
): Promise<Uint8Array> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const mxePublicKey = await getMXEPublicKey(provider, programId);
      if (mxePublicKey) {
        return mxePublicKey;
      }
    } catch (error) {
      console.log(`Attempt ${attempt} failed to fetch MXE public key:`, error);
    }

    if (attempt < maxRetries) {
      console.log(
        `Retrying in ${retryDelayMs}ms... (attempt ${attempt}/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }

  throw new Error(
    `Failed to fetch MXE public key after ${maxRetries} attempts`
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
  const mxeAccount = getMXEAccAddress(programId);
  const mempoolAccount = getMempoolAccAddress(programId);
  const executingPool = getExecutingPoolAccAddress(programId);
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

