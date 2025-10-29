/**
 * Olivia: Decentralised Permissionless Predicition Market 
 * Copyright (c) 2025 Ayush Srivastava
 *
 * Licensed under the Apache 2.0
 */

'use client';

import type React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import Image from 'next/image';
import Link from 'next/link';

interface MainLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  showSocialIcons?: boolean;
  showLogo?: boolean;
  hideNavbar?: boolean;
}

export function MainLayout({ children, showFooter = true, showSocialIcons = true, showLogo = true, hideNavbar = false }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col mx-auto max-w-7xl text-white" style={{ background: 'transparent', position: 'relative', zIndex: 10 }}>
      {/* Arcium Logo - Top Left Corner */}
      {showLogo && !hideNavbar && (
        <div className="fixed top-10 left-10 z-50 flex items-center gap-2">
          <Image 
            src="/Arcium Icon.png" 
            alt="Arcium Icon" 
            width={32} 
            height={32}
            className="object-contain"
          />
          <Image 
            src="/Arcium logo.png" 
            alt="Arcium Logo" 
            width={120} 
            height={32}
            className="object-contain"
          />
        </div>
      )}
      {!hideNavbar && <Navbar />}
      <main className="flex-1 w-full bg-transparent" style={{ marginTop: hideNavbar ? '0px' : '80px' }}>
        {children}
      </main>
      {/* Social Media Links - Bottom Right Corner */}
      {showSocialIcons && (
        <div className="fixed bottom-8 right-8 flex flex-col gap-3" style={{ zIndex: 100 }}>
          <Link 
            href="https://x.com/ayushsrivastv" 
            target="_blank" 
            rel="noopener noreferrer"
            className="transition-all duration-200 hover:scale-110"
          >
            <Image 
              src="/X logo.png" 
              alt="X (Twitter)" 
              width={40} 
              height={40}
              className="rounded-lg"
            />
          </Link>
          <Link 
            href="https://www.linkedin.com/in/ayushshrivastv/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="transition-all duration-200 hover:scale-110"
          >
            <Image 
              src="/Linkedin Logo.png" 
              alt="LinkedIn" 
              width={40} 
              height={40}
              className="rounded-lg"
            />
          </Link>
        </div>
      )}
      {showFooter && (
        <div style={{ position: 'relative', zIndex: 10 }}>
          <Footer />
        </div>
      )}
    </div>
  );
}
