/**
 * Olivia: Decentralised Permissionless Predicition Market 
 * Copyright (c) 2025 Ayush Srivastava
 *
 * Licensed under the Apache 2.0
 */

import { MainLayout } from '@/src/layout/Layout';

export default function Rewards() {
  return (
    <MainLayout>
        <div className="relative w-full min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
          <div className="w-full flex items-center justify-center pt-32 pb-16" style={{ minHeight: 'calc(100vh - 200px)' }}>
            <div className="text-center px-4 max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-light mb-6 text-white" style={{ textShadow: '0 0 20px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,1), 0 0 60px rgba(0,0,0,0.9), 2px 2px 8px rgba(0,0,0,1)', WebkitTextStroke: '1px rgba(0,0,0,0.8)' }}>
                Rewards
              </h1>
              <p className="text-white text-lg mb-6 max-w-2xl mx-auto leading-relaxed" style={{ textShadow: '0 0 15px rgba(0,0,0,1), 0 0 30px rgba(0,0,0,1), 2px 2px 6px rgba(0,0,0,1)', WebkitTextStroke: '0.5px rgba(0,0,0,0.8)' }}>
                Olivia rewards accurate predictions proportionally. When markets resolve, participants who predicted correctly share the prize pool based on their contribution.
              </p>
              <p className="text-white text-lg mb-6 max-w-2xl mx-auto leading-relaxed" style={{ textShadow: '0 0 15px rgba(0,0,0,1), 0 0 30px rgba(0,0,0,1), 2px 2px 6px rgba(0,0,0,1)', WebkitTextStroke: '0.5px rgba(0,0,0,0.8)' }}>
                The more precise your forecast, the larger your reward. Built on Solana, settlements are instant with minimal transaction fees.
              </p>
              <p className="text-white text-lg mb-8 max-w-2xl mx-auto leading-relaxed" style={{ textShadow: '0 0 15px rgba(0,0,0,1), 0 0 30px rgba(0,0,0,1), 2px 2px 6px rgba(0,0,0,1)', WebkitTextStroke: '0.5px rgba(0,0,0,0.8)' }}>
                No intermediaries, no delays—just transparent, automated payouts to your wallet. Your predictions become your earnings the moment markets close.
              </p>
            </div>
          </div>
        </div>
    </MainLayout>
  );
}

