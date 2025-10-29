/**
 * Olivia: Decentralised Permissionless Predicition Market 
 * Copyright (c) 2025 Ayush Srivastava
 *
 * Licensed under the Apache 2.0
 */

'use client';

import React from 'react';
import Link from 'next/link';

const FeatureSections = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-light mb-6 text-white" style={{ textShadow: '0 0 18px rgba(0,0,0,1), 0 0 35px rgba(0,0,0,1), 2px 2px 8px rgba(0,0,0,1)', WebkitTextStroke: '1px rgba(0,0,0,0.8)' }}>
          Why Choose Olivia?
        </h2>
        <p className="text-white text-lg mb-8 max-w-2xl mx-auto" style={{ textShadow: '0 0 15px rgba(0,0,0,1), 0 0 30px rgba(0,0,0,1), 2px 2px 6px rgba(0,0,0,1)', WebkitTextStroke: '0.5px rgba(0,0,0,0.8)' }}>
          Through Arcium, the future of prediction is open, secure, and unstoppable.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl p-6" style={{ backgroundColor: 'rgba(10, 10, 10, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
          <h3 className="text-white text-xl font-light mb-3">Predict Smarter.</h3>
          <p className="text-white text-sm">
            Turn your knowledge into profit by predicting outcomes of real-world events. 
            From sports and politics to crypto prices and market trends - if it&apos;s predictable, you can trade it on Olivia.
          </p>
        </div>

        <div className="rounded-xl p-6" style={{ backgroundColor: 'rgba(10, 10, 10, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
          <h3 className="text-white text-xl font-light mb-3">Trade Privately.</h3>
          <p className="text-white text-sm">
            Your predictions remain completely private using advanced Multi-Party Computation (MPC) technology. 
            Trade with confidence knowing your strategies and positions are hidden until market resolution.
          </p>
          <Link
            href="/privacy"
            className="text-white text-sm hover:underline mt-3 inline-block"
          >
            Learn about privacy →
          </Link>
        </div>

        <div className="rounded-xl p-6" style={{ backgroundColor: 'rgba(10, 10, 10, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
          <h3 className="text-white text-xl font-light mb-3">
            Earn Rewards.
          </h3>
          <p className="text-white text-sm">
            Accurate predictions are rewarded proportionally. The more precise your forecast, 
            the bigger your share of the prize pool. Built on Solana for lightning-fast settlements and minimal fees.
          </p>
          <Link
            href="/how-it-works"
            className="text-white text-sm hover:underline mt-3 inline-block"
          >
            How rewards work →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeatureSections;
