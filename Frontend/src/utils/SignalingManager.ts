/**
 * Olivia: Decentralised Permissionless Predicition Market 
 * Copyright (c) 2025 Ayush Srivastava
 *
 * Licensed under the Apache 2.0
 */

import { DepthPayload, TradePayload, TickerPayload } from './types';

export const BASE_URL = 'ws://localhost:8081/ws';

type Callback<T> = (data: T) => void;

type RoomType = 'depth' | 'trade' | 'ticker';
type Room = `${RoomType}@${string}`;

type RoomPayloadMap = {
  depth: DepthPayload;
  trade: TradePayload;
  ticker: TickerPayload;
};

// Mock SignalingManager for frontend development
export class SignalingManager {
  private static instance: SignalingManager;
  private depthCallbacks: Record<string, Callback<DepthPayload>[]> = {};
  private tradeCallbacks: Record<string, Callback<TradePayload>[]> = {};
  private tickerCallbacks: Record<string, Callback<TickerPayload>[]> = {};
  private id = 1;
  private opened = true; // Mock as always connected
  private mockInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Mock WebSocket - no actual connection
    console.log('SignalingManager: Mock mode - no WebSocket connection');
    this.startMockData();
  }

  public static getInstance(): SignalingManager {
    if (!this.instance) {
      this.instance = new SignalingManager();
    }
    return this.instance;
  }

  private startMockData() {
    // Generate mock data every 2 seconds
    this.mockInterval = setInterval(() => {
      this.generateMockDepthData();
      this.generateMockTradeData();
      this.generateMockTickerData();
    }, 2000);
  }

  private generateMockDepthData() {
    const mockDepth: DepthPayload = {
      bids: [
        [String(0.45 + Math.random() * 0.02), String(Math.floor(Math.random() * 2000) + 500)],
        [String(0.44 + Math.random() * 0.02), String(Math.floor(Math.random() * 2000) + 500)],
        [String(0.43 + Math.random() * 0.02), String(Math.floor(Math.random() * 2000) + 500)]
      ],
      asks: [
        [String(0.46 + Math.random() * 0.02), String(Math.floor(Math.random() * 2000) + 500)],
        [String(0.47 + Math.random() * 0.02), String(Math.floor(Math.random() * 2000) + 500)],
        [String(0.48 + Math.random() * 0.02), String(Math.floor(Math.random() * 2000) + 500)]
      ]
    };

    Object.keys(this.depthCallbacks).forEach(room => {
      this.depthCallbacks[room].forEach(cb => cb(mockDepth));
    });
  }

  private generateMockTradeData() {
    const mockTrade: TradePayload = {
      price: String(0.45 + Math.random() * 0.02),
      quantity: String(Math.floor(Math.random() * 1000) + 100),
      side: Math.random() > 0.5 ? 'buy' : 'sell',
      timestamp: Date.now()
    };

    Object.keys(this.tradeCallbacks).forEach(room => {
      this.tradeCallbacks[room].forEach(cb => cb(mockTrade));
    });
  }

  private generateMockTickerData() {
    const mockTicker: TickerPayload = {
      data: {
        e: 'trade',
        p: String(0.45 + Math.random() * 0.02),
        q: String(Math.floor(Math.random() * 1000) + 100),
        s: 'ELECTION2028USDC',
        t: Date.now()
      },
      stream: 'ticker@ELECTION2028USDC'
    };

    Object.keys(this.tickerCallbacks).forEach(room => {
      this.tickerCallbacks[room].forEach(cb => cb(mockTicker));
    });
  }

  public subscribe(room: Room) {
    // Mock subscription - just log it
    console.log(`Mock subscribe to room: ${room}`);
  }

  public unsubscribe(room: Room) {
    // Mock unsubscription - just log it
    console.log(`Mock unsubscribe from room: ${room}`);
  }

  public sendMessage(msg: Record<string, unknown>) {
    // Mock message sending - just log it
    console.log('Mock send message:', msg);
  }

  public cleanup() {
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }
  }

  public registerDepthCallback(
    room: `depth@${string}`,
    cb: Callback<DepthPayload>
  ) {
    (this.depthCallbacks[room] ||= []).push(cb);
  }

  public registerTradeCallback(
    room: `trade@${string}`,
    cb: Callback<TradePayload>
  ) {
    (this.tradeCallbacks[room] ||= []).push(cb);
  }

  public registerTickerCallback(
    room: `ticker@${string}`,
    cb: Callback<TickerPayload>
  ) {
    (this.tickerCallbacks[room] ||= []).push(cb);
  }

  public deRegisterDepthCallback(
    room: `depth@${string}`,
    cb: Callback<DepthPayload>
  ) {
    if (!this.depthCallbacks[room]) return;
    this.depthCallbacks[room] = this.depthCallbacks[room].filter(
      (x) => x !== cb
    );
  }

  public deRegisterTradeCallback(
    room: `trade@${string}`,
    cb: Callback<TradePayload>
  ) {
    if (!this.tradeCallbacks[room]) return;
    this.tradeCallbacks[room] = this.tradeCallbacks[room].filter(
      (x) => x !== cb
    );
  }

  public deRegisterTickerCallback(
    room: `ticker@${string}`,
    cb: Callback<TickerPayload>
  ) {
    if (!this.tickerCallbacks[room]) return;
    this.tickerCallbacks[room] = this.tickerCallbacks[room].filter(
      (x) => x !== cb
    );
  }

  // Fixed type-safe register callback method
  public registerCallback<T extends RoomType>(
    room: `${T}@${string}`,
    cb: Callback<RoomPayloadMap[T]>
  ) {
    if (room.startsWith('depth@')) {
      this.registerDepthCallback(
        room as `depth@${string}`,
        cb as Callback<DepthPayload>
      );
    } else if (room.startsWith('trade@')) {
      this.registerTradeCallback(
        room as `trade@${string}`,
        cb as Callback<TradePayload>
      );
    } else if (room.startsWith('ticker@')) {
      this.registerTickerCallback(
        room as `ticker@${string}`,
        cb as Callback<TickerPayload>
      );
    }
  }

  // Fixed type-safe deregister callback method
  public deRegisterCallback<T extends RoomType>(
    room: `${T}@${string}`,
    cb: Callback<RoomPayloadMap[T]>
  ) {
    if (room.startsWith('depth@')) {
      this.deRegisterDepthCallback(
        room as `depth@${string}`,
        cb as Callback<DepthPayload>
      );
    } else if (room.startsWith('trade@')) {
      this.deRegisterTradeCallback(
        room as `trade@${string}`,
        cb as Callback<TradePayload>
      );
    } else if (room.startsWith('ticker@')) {
      this.deRegisterTickerCallback(
        room as `ticker@${string}`,
        cb as Callback<TickerPayload>
      );
    }
  }
}
