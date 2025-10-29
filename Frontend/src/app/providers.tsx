/**
 * Olivia: Decentralised Permissionless Predicition Market 
 * Copyright (c) 2025 Ayush Srivastava
 *
 * Licensed under the Apache 2.0
 */

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
