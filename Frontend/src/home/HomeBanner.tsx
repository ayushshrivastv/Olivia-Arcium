/**
 * Olivia: Decentralised Permissionless Predicition Market 
 * Copyright (c) 2025 Ayush Srivastava
 *
 * Licensed under the Apache 2.0
 */

'use client';

import Link from 'next/link';

export default function HomeBanner() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <Link href="/markets" className="block">
        <div className="relative rounded-xl overflow-hidden">
          <div className="h-[180px] w-full bg-gradient-to-r from-[#121212] to-[#001A2C] p-8 flex flex-col justify-center">
            <div className="text-xs bg-black/30 backdrop-blur-sm text-white px-3 py-1 rounded-full w-fit mb-2">
              LIVE NOW - JOIN THE BETA
            </div>
            
            <h2 className="text-2xl md:text-3xl font-light mb-1 text-white">
              Welcome to Olivia
            </h2>
            <p className="text-lg md:text-xl text-white opacity-80">
              The Future of Prediction Markets
            </p>

            <div className="mt-4">
              <button className="px-4 py-1.5 bg-[#5522e0] text-white text-xs rounded-full hover:bg-[#5522e0]/90 transition">
                Explore Markets
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

