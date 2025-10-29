'use client';

import { useState } from 'react';
import { MainLayout } from '../../layout/Layout';
import MarketsGrid from '../../market/MarketsGrid';

export default function Markets() {
  const [hideNavbar, setHideNavbar] = useState(false);

  return (
    <MainLayout hideNavbar={hideNavbar}>
      {/* Full viewport dark background */}
      <div className="fixed inset-0 bg-[#0a0a0a]" style={{ zIndex: 0 }} />
      
      <div className="relative w-full min-h-screen" style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', zIndex: 1 }}>
        <div className="container mx-auto px-4 pt-16 pb-8">
          <div className="mb-4">
            <h1 className="text-4xl md:text-5xl font-light mb-1 text-white" style={{ textShadow: '0 0 20px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,1), 2px 2px 8px rgba(0,0,0,1)', WebkitTextStroke: '1px rgba(0,0,0,0.8)' }}>
              Prediction Markets
            </h1>
            <p className="text-white text-lg opacity-80 mb-2" style={{ textShadow: '0 0 15px rgba(0,0,0,1), 1px 1px 4px rgba(0,0,0,1)' }}>
              Choose a market to start predicting and earning rewards
            </p>
          </div>
          <MarketsGrid onFormToggle={setHideNavbar} />
        </div>
      </div>
    </MainLayout>
  );
}

