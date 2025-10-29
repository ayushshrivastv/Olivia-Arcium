// Extend the Window interface to include Solana wallets
interface Window {
  solana?: {
    isPhantom?: boolean;
    isConnected?: boolean;
    publicKey?: {
      toString(): string;
    };
    connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{
      publicKey: {
        toString(): string;
      };
    }>;
    disconnect: () => Promise<void>;
    signTransaction: (transaction: any) => Promise<any>;
    signAllTransactions: (transactions: any[]) => Promise<any[]>;
    on: (event: string, callback: (args: unknown) => void) => void;
    removeListener: (event: string, callback: (args: unknown) => void) => void;
  };
  solflare?: {
    isConnected?: boolean;
    publicKey?: {
      toString(): string;
    };
    connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{
      publicKey: {
        toString(): string;
      };
    }>;
    disconnect: () => Promise<void>;
    signTransaction: (transaction: any) => Promise<any>;
    signAllTransactions: (transactions: any[]) => Promise<any[]>;
    on: (event: string, callback: (args: unknown) => void) => void;
    removeListener: (event: string, callback: (args: unknown) => void) => void;
  };
  backpack?: {
    isConnected?: boolean;
    publicKey?: {
      toString(): string;
    };
    connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{
      publicKey: {
        toString(): string;
      };
    }>;
    disconnect: () => Promise<void>;
    signTransaction: (transaction: any) => Promise<any>;
    signAllTransactions: (transactions: any[]) => Promise<any[]>;
    on: (event: string, callback: (args: unknown) => void) => void;
    removeListener: (event: string, callback: (args: unknown) => void) => void;
  };
}

