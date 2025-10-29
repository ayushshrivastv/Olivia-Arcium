/**
 * Olivia: Decentralised Permissionless Predicition Market 
 * Copyright (c) 2025 Ayush Srivastava
 *
 * Licensed under the Apache 2.0
 */

import { PublicKey, Transaction } from '@solana/web3.js';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface WalletProvider {
  name: string;
  icon?: string;
  connect: () => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage?: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  isConnected: boolean;
  publicKey?: PublicKey;
}

export class SolanaWalletProvider implements WalletProvider {
  private provider: any;
  public name: string;
  public isConnected: boolean = false;
  public publicKey?: PublicKey;

  constructor(provider: any, name: string) {
    this.provider = provider;
    this.name = name;
    
    // Set initial state
    if (provider.isConnected && provider.publicKey) {
      this.isConnected = true;
      this.publicKey = new PublicKey(provider.publicKey.toString());
    }
    
    // Listen for wallet events
    if (provider.on) {
      provider.on('connect', (publicKey: any) => {
        this.isConnected = true;
        this.publicKey = new PublicKey(publicKey.toString());
      });
      
      provider.on('disconnect', () => {
        this.isConnected = false;
        this.publicKey = undefined;
      });
      
      provider.on('accountChanged', (publicKey: any) => {
        if (publicKey) {
          this.publicKey = new PublicKey(publicKey.toString());
        } else {
          this.isConnected = false;
          this.publicKey = undefined;
        }
      });
    }
  }

  async connect(): Promise<{ publicKey: PublicKey }> {
    if (!this.provider.connect) {
      throw new Error(`${this.name} wallet not available`);
    }
    
    const response = await this.provider.connect();
    this.publicKey = new PublicKey(response.publicKey.toString());
    this.isConnected = true;
    
    return { publicKey: this.publicKey };
  }

  async disconnect(): Promise<void> {
    if (this.provider.disconnect) {
      await this.provider.disconnect();
    }
    this.isConnected = false;
    this.publicKey = undefined;
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    // Ensure transaction has the recent blockhash and fee payer set
    if (!transaction.recentBlockhash) {
      throw new Error('Transaction missing recentBlockhash');
    }
    
    // Use the wallet's signTransaction method
    return await this.provider.signTransaction(transaction);
  }

  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    if (!this.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    return await this.provider.signAllTransactions(transactions);
  }

  async signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }> {
    if (!this.provider.signMessage) {
      throw new Error('Message signing not supported by this wallet');
    }
    
    return await this.provider.signMessage(message);
  }
}

export function detectWallets(): WalletProvider[] {
  const wallets: SolanaWalletProvider[] = [];
  
  // Check for Backpack first (priority)
  if (window.backpack) {
    wallets.push(new SolanaWalletProvider(window.backpack, 'Backpack'));
  }
  
  // Check for Phantom
  if (window.solana?.isPhantom) {
    wallets.push(new SolanaWalletProvider(window.solana, 'Phantom'));
  }
  
  // Check for Solflare
  if (window.solflare) {
    wallets.push(new SolanaWalletProvider(window.solflare, 'Solflare'));
  }
  
  // Check for generic Solana wallet
  if (window.solana && !window.solana.isPhantom) {
    wallets.push(new SolanaWalletProvider(window.solana, 'Solana Wallet'));
  }
  
  return wallets;
}
