'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { IconWallet } from '@tabler/icons-react';
import { PublicKey } from '@solana/web3.js';
import { useState, useEffect } from 'react';

export function WalletButton() {
  const { wallet, publicKey, connected, disconnect } = useWallet();
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getShortAddress = (publicKey: PublicKey) => {
    const address = publicKey.toString();
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setShowDisconnect(false);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  return (
    <div className="fixed top-10 right-10 z-50 flex flex-col gap-2">
      {!isMounted ? (
        // Show a placeholder during SSR to prevent hydration mismatch
        <div 
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            borderRadius: '9999px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s',
          }}
        >
          <IconWallet className="h-4 w-4" />
          <span>Connect Wallet</span>
        </div>
      ) : connected && publicKey ? (
        <div className="flex flex-col gap-2">
          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm cursor-pointer hover:opacity-80 transition-all"
            onClick={() => setShowDisconnect(!showDisconnect)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              color: 'white',
            }}
          >
            <IconWallet className="h-4 w-4" />
            <span>{wallet?.adapter.name || 'Wallet'}</span>
          </div>
          
          {showDisconnect && (
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 rounded-full text-sm transition-all duration-200 hover:opacity-80"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                color: 'white',
              }}
            >
              Disconnect
            </button>
          )}
        </div>
      ) : (
        <WalletMultiButton 
          className="wallet-adapter-button wallet-adapter-button-trigger"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            borderRadius: '9999px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s',
          }}
        >
          Connect Wallet
        </WalletMultiButton>
      )}
    </div>
  );
}