import type React from 'react';
import { Navbar } from './navbar';
import { Footer } from './footer';
import HomeBanner from '../home/HomeBanner';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col mx-auto max-w-7xl text-white" style={{ background: 'transparent', position: 'relative' }}>
      <Navbar />
      <main className="flex-1 w-full bg-transparent pb-20">
        {children}
        <HomeBanner />
      </main>
      <Footer />
    </div>
  );
}
