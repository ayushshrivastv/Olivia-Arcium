/**
 * Olivia: Decentralised Permissionless Prediction Market 
 * Copyright (c) 2025 Ayush Srivastava
 *
 * Licensed under the Apache 2.0
 */

import { PublicKey, Connection, Commitment } from "@solana/web3.js";
import { AnchorProvider, Program, Wallet, Idl, BN } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";

// Program ID from lib.rs: declare_id!("3vttzXAnNXM1SGdMWQgVBJWEkEFmtExhX5hDgEGv9qux");
export const PREDICTION_MARKET_PROGRAM_ID = new PublicKey(
  "3vttzXAnNXM1SGdMWQgVBJWEkEFmtExhX5hDgEGv9qux"
);

/**
 * Initialize Anchor provider from wallet and connection
 */
export function createAnchorProvider(
  connection: Connection,
  wallet: Wallet,
  commitment: Commitment = "confirmed"
): AnchorProvider {
  return new AnchorProvider(connection, wallet, {
    commitment,
    skipPreflight: false,
  });
}

/**
 * Initialize program from provider and IDL
 */
export function createProgram(
  provider: AnchorProvider,
  idl: Idl
): Program<Idl> {
  return new Program(idl, PREDICTION_MARKET_PROGRAM_ID, provider);
}

/**
 * React hook to get program instance
 * Requires IDL to be loaded separately
 */
export function useProgram(idl: Idl | null): {
  program: Program<Idl> | null;
  provider: AnchorProvider | null;
  connection: Connection | null;
} {
  const { connection } = useConnection();
  const wallet = useWallet();

  if (!idl || !connection || !wallet.publicKey) {
    return { program: null, provider: null, connection: null };
  }

  const walletAdapter: Wallet = {
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction!,
    signAllTransactions: wallet.signAllTransactions!,
    signMessage: wallet.signMessage,
  };

  const provider = createAnchorProvider(connection, walletAdapter);
  const program = createProgram(provider, idl);

  return { program, provider, connection };
}

/**
 * Load IDL from a URL (public folder or CDN)
 */
export async function loadIdl(idlUrl: string): Promise<Idl> {
  const response = await fetch(idlUrl);
  if (!response.ok) {
    throw new Error(`Failed to load IDL from ${idlUrl}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Get market PDA
 */
export function getMarketPDA(marketId: BN | number | string): PublicKey {
  const marketIdBN = typeof marketId === "number" || typeof marketId === "string"
    ? new BN(marketId)
    : marketId;
  
  const marketIdBuffer = Buffer.alloc(8);
  marketIdBuffer.writeBigUInt64LE(BigInt(marketIdBN.toString()), 0);

  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("market"), marketIdBuffer],
    PREDICTION_MARKET_PROGRAM_ID
  );

  return pda;
}

/**
 * Get bet PDA
 */
export function getBetPDA(
  marketId: BN | number | string,
  bettor: PublicKey
): PublicKey {
  const marketIdBN = typeof marketId === "number" || typeof marketId === "string"
    ? new BN(marketId)
    : marketId;
  
  const marketIdBuffer = Buffer.alloc(8);
  marketIdBuffer.writeBigUInt64LE(BigInt(marketIdBN.toString()), 0);

  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("bet"),
      marketIdBuffer,
      bettor.toBuffer(),
    ],
    PREDICTION_MARKET_PROGRAM_ID
  );

  return pda;
}

