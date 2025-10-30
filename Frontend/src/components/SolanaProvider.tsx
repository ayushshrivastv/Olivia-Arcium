/**
 * Olivia: Decentralised Permissionless Predicition Market 
 * Copyright (c) 2025 Ayush Srivastava
 *
 * Licensed under the Apache 2.0
 */

"use client";

import React, { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  CoinbaseWalletAdapter,
  TrustWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";

interface SolanaProviderProps {
  children: ReactNode;
}

export const SolanaProvider: FC<SolanaProviderProps> = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const envNetwork = (process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'testnet') as
    | 'devnet'
    | 'testnet'
    | 'mainnet-beta';

  const network =
    envNetwork === 'devnet'
      ? WalletAdapterNetwork.Devnet
      : envNetwork === 'mainnet-beta'
      ? WalletAdapterNetwork.Mainnet
      : WalletAdapterNetwork.Testnet;

  const endpoint = useMemo(() => {
    const override = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    if (override && override.trim().length > 0) {
      console.log('🔧 Using RPC override from env:', override);
      return override;
    }
    const derived = clusterApiUrl(network);
    console.log('🌐 Using cluster RPC:', derived, 'for network:', envNetwork);
    return derived;
  }, [network, envNetwork]);

  // Provide Solana wallets as a stable static array. Deduplication is not needed and causes key duplication.
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new TrustWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
