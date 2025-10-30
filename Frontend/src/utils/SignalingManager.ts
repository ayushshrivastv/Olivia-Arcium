/**
 * Olivia: Decentralised Permissionless Predicition Market 
 * Copyright (c) 2025 Ayush Srivastava
 *
 * Licensed under the Apache 2.0
 */

import { DepthPayload, TradePayload, TickerPayload } from './types';

export const BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8081/ws';

type Callback<T> = (data: T) => void;

type RoomType = 'depth' | 'trade' | 'ticker';
type Room = `${RoomType}@${string}`;

type RoomPayloadMap = {
  depth: DepthPayload;
  trade: TradePayload;
  ticker: TickerPayload;
};

type ServerMessage = {
  room: string;
  data: string; // JSON string payload
};

export class SignalingManager {
  private static instance: SignalingManager;
  private depthCallbacks: Record<string, Callback<DepthPayload>[]> = {};
  private tradeCallbacks: Record<string, Callback<TradePayload>[]> = {};
  private tickerCallbacks: Record<string, Callback<TickerPayload>[]> = {};
  private socket: WebSocket | null = null;
  private reconnectDelayMs = 1000;
  private maxReconnectDelayMs = 10000;
  private pendingSubscriptions: Set<Room> = new Set();

  private constructor() {
    this.connect();
  }

  public static getInstance(): SignalingManager {
    if (!this.instance) {
      this.instance = new SignalingManager();
    }
    return this.instance;
  }

  private connect() {
    try {
      this.socket = new WebSocket(BASE_URL);
      this.socket.onopen = () => {
        this.reconnectDelayMs = 1000;
        this.pendingSubscriptions.forEach((room) => this.sendSubscribe(room as Room));
      };
      this.socket.onmessage = (evt) => this.handleMessage(evt.data);
      this.socket.onclose = () => this.scheduleReconnect();
      this.socket.onerror = () => this.scheduleReconnect();
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    this.socket = null;
    const delay = this.reconnectDelayMs;
    this.reconnectDelayMs = Math.min(this.reconnectDelayMs * 2, this.maxReconnectDelayMs);
    setTimeout(() => this.connect(), delay);
  }

  private handleMessage(raw: string) {
    try {
      const msg: ServerMessage = JSON.parse(raw);
      const { room, data } = msg;
      if (room.startsWith('depth@')) {
        const payload: DepthPayload = JSON.parse(data);
        this.depthCallbacks[room]?.forEach((cb) => cb(payload));
      } else if (room.startsWith('trade@')) {
        const payload: TradePayload = JSON.parse(data);
        this.tradeCallbacks[room]?.forEach((cb) => cb(payload));
      } else if (room.startsWith('ticker@')) {
        const payload: TickerPayload = JSON.parse(data);
        this.tickerCallbacks[room]?.forEach((cb) => cb(payload));
      }
    } catch (e) {
      console.warn('Failed to parse server message', e);
    }
  }

  private send(obj: unknown) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(obj));
    }
  }

  private sendSubscribe(room: Room) {
    this.send({ type: 'SUBSCRIBE', payload: { room } });
  }

  private sendUnsubscribe(room: Room) {
    this.send({ type: 'UNSUBSCRIBE', payload: { room } });
  }

  public subscribe(room: Room) {
    this.pendingSubscriptions.add(room);
    this.sendSubscribe(room);
  }

  public unsubscribe(room: Room) {
    this.pendingSubscriptions.delete(room);
    this.sendUnsubscribe(room);
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
    this.depthCallbacks[room] = this.depthCallbacks[room].filter((x) => x !== cb);
  }

  public deRegisterTradeCallback(
    room: `trade@${string}`,
    cb: Callback<TradePayload>
  ) {
    if (!this.tradeCallbacks[room]) return;
    this.tradeCallbacks[room] = this.tradeCallbacks[room].filter((x) => x !== cb);
  }

  public deRegisterTickerCallback(
    room: `ticker@${string}`,
    cb: Callback<TickerPayload>
  ) {
    if (!this.tickerCallbacks[room]) return;
    this.tickerCallbacks[room] = this.tickerCallbacks[room].filter((x) => x !== cb);
  }

  public registerCallback<T extends RoomType>(
    room: `${T}@${string}`,
    cb: Callback<RoomPayloadMap[T]>
  ) {
    if (room.startsWith('depth@')) {
      this.registerDepthCallback(room as `depth@${string}`, cb as Callback<DepthPayload>);
    } else if (room.startsWith('trade@')) {
      this.registerTradeCallback(room as `trade@${string}`, cb as Callback<TradePayload>);
    } else if (room.startsWith('ticker@')) {
      this.registerTickerCallback(room as `ticker@${string}`, cb as Callback<TickerPayload>);
    }
  }

  public deRegisterCallback<T extends RoomType>(
    room: `${T}@${string}`,
    cb: Callback<RoomPayloadMap[T]>
  ) {
    if (room.startsWith('depth@')) {
      this.deRegisterDepthCallback(room as `depth@${string}`, cb as Callback<DepthPayload>);
    } else if (room.startsWith('trade@')) {
      this.deRegisterTradeCallback(room as `trade@${string}`, cb as Callback<TradePayload>);
    } else if (room.startsWith('ticker@')) {
      this.deRegisterTickerCallback(room as `ticker@${string}`, cb as Callback<TickerPayload>);
    }
  }
}
