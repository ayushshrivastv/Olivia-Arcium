'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { SolanaProvider } from '@/src/components/SolanaProvider';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <SolanaProvider>
        {children}
      </SolanaProvider>
    </SessionProvider>
  );
};
