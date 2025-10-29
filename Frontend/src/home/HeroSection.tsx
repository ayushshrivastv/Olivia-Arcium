'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IconRocket } from '@tabler/icons-react';

export default function HeroSection() {
  return (
    <div className="w-full flex items-center justify-center pt-32 pb-16 relative" style={{ minHeight: 'calc(100vh - 200px)' }}>
      {/* Olivia Logo - Right side */}
      <div className="absolute hidden lg:block" style={{ zIndex: 5, right: '-2rem', top: '75%', transform: 'translateY(-50%)' }}>
        <Image
          src="/Olivia Logo.png"
          alt="Olivia"
          width={450}
          height={450}
          className="w-[450px] h-[450px] object-contain"
          style={{
            filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.15))',
            opacity: 0.9,
          }}
        />
      </div>
      
      <div className="text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-light mb-6 text-white" style={{ textShadow: '0 0 20px rgba(0,0,0,1), 0 0 40px rgba(0,0,0,1), 0 0 60px rgba(0,0,0,0.9), 2px 2px 8px rgba(0,0,0,1)', WebkitTextStroke: '1px rgba(0,0,0,0.8)' }}>
          When Others Watch Chaos.
          <br />
          Predict Them. Profit From Them.
        </h1>
        <p className="text-white text-lg mb-8 max-w-2xl mx-auto" style={{ textShadow: '0 0 15px rgba(0,0,0,1), 0 0 30px rgba(0,0,0,1), 2px 2px 6px rgba(0,0,0,1)', WebkitTextStroke: '0.5px rgba(0,0,0,0.8)' }}>
          Experience Olivia, the prediction market of the future seamlessly powered by{' '}
          <span 
            className="inline-flex items-center rounded-full px-4 py-2 text-sm transition-all duration-200 text-white"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              fontFamily: 'GT America Mono, monospace',
            }}
          >
            <Image 
              src="/Arcium Icon.png" 
              alt="Arcium" 
              width={60} 
              height={60}
              className="h-4 w-auto"
              style={{ width: 'auto', height: '1rem' }}
            />
          </span>
          {' '}— the transparent layer for private prediction.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/signin"
            className="px-6 py-2 rounded-full text-white text-sm transition-all duration-200"
            style={{
              backgroundColor: 'rgba(10, 10, 10, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(10, 10, 10, 0.7)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            Sign In
          </Link>
          <Link
            href="/markets"
            className="px-6 py-2 rounded-full text-white text-sm transition-all duration-200"
            style={{
              backgroundColor: 'rgba(10, 10, 10, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(10, 10, 10, 0.7)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <span className="flex items-center gap-2">
              <IconRocket className="h-4 w-4" />
              Start Predicting
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
