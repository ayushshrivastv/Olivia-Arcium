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

export class SignalingManager {
  private ws: WebSocket;
  private static instance: SignalingManager;
  private buffer: Record<string, unknown>[] = [];
  private depthCallbacks: Record<string, Callback<DepthPayload>[]> = {};
  private tradeCallbacks: Record<string, Callback<TradePayload>[]> = {};
  private tickerCallbacks: Record<string, Callback<TickerPayload>[]> = {};
  private id = 1;
  private opened = false;

  private constructor() {
    this.ws = new WebSocket(BASE_URL);
    this.init();
  }

  public static getInstance(): SignalingManager {
    if (!this.instance) {
      this.instance = new SignalingManager();
    }
    return this.instance;
  }

  private init() {
    this.ws.onopen = () => {
      this.opened = true;
      this.buffer.forEach((m) => this.ws.send(JSON.stringify(m)));
      this.buffer = [];
    };

    this.ws.onmessage = (evt) => {
      const env = JSON.parse(evt.data);
      const room: string = env.room;

      if (!room) return;

      try {
        const data = JSON.parse(env.data);

        if (room.startsWith('depth@') && this.depthCallbacks[room]?.length) {
          const { a: asks, b: bids } = data.data || {};

          if (asks !== undefined && bids !== undefined) {
            this.depthCallbacks[room].forEach((cb) => cb({ bids, asks }));
          }
        } else if (
          room.startsWith('trade@') &&
          this.tradeCallbacks[room]?.length
        ) {
          const { price, quantity, side, timestamp } = data;

          if (price !== undefined) {
            this.tradeCallbacks[room].forEach((cb) =>
              cb({ price, quantity, side, timestamp })
            );
          }
        } else if (
          room.startsWith('ticker@') &&
          this.tickerCallbacks[room]?.length
        ) {
          // Pass the entire parsed data object to callbacks
          // The data format for ticker is { data: { e, p, q, s, t }, stream }
          this.tickerCallbacks[room].forEach((cb) => cb(data));
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  public subscribe(room: Room) {
    const message = {
      type: 'SUBSCRIBE',
      payload: { room },
    };
    this.sendMessage(message);
  }

  public unsubscribe(room: Room) {
    const message = {
      type: 'UNSUBSCRIBE',
      payload: { room },
    };
    this.sendMessage(message);
  }

  public sendMessage(msg: Record<string, unknown>) {
    const withId = { ...msg, id: this.id++ } as Record<string, unknown> & { id: number };
    if (!this.opened) {
      this.buffer.push(withId);
    } else {
      this.ws.send(JSON.stringify(withId));
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
