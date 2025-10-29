/**
 * Olivia: Decentralised Permissionless Predicition Market 
 * Copyright (c) 2025 Ayush Srivastava
 *
 * Licensed under the Apache 2.0
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.glb$/,
      type: 'asset/resource',
    });
    
    // Handle ESM modules from @arcium-hq/client
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.mjs': ['.mjs', '.mts'],
    };
    
    // Suppress warnings for optional dependencies (like pino-pretty from WalletConnect)
    // pino-pretty is an optional dependency for pino, only needed for pretty-printing logs (dev only)
    // Tell webpack to ignore this missing optional dependency
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'pino-pretty': false,
    };
    
    // Ignore the specific warning about pino-pretty
    if (!config.ignoreWarnings) {
      config.ignoreWarnings = [];
    }
    config.ignoreWarnings.push({
      module: /node_modules\/pino/,
      message: /Can't resolve 'pino-pretty'/,
    });
    
    // Make sure node_modules are transpiled if needed
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    
    return config;
  },
  transpilePackages: ['@arcium-hq/client'],
};

export default nextConfig;
