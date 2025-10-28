export type Status = 'Incoming' | 'Ongoing';

export interface Market {
  name: string;
  description?: string;
  base_asset: string;
  quote_asset: string;
  start_time: string;
  end_time: string;
  status: Status;
}

export interface Trade {
  id?: string;
  currency_code: string;
  price: number;
  quantity: number;
  time: string;
  volume?: number;
  side?: string;
}

export interface KLine {
  close: string;
  end: string;
  high: string;
  low: string;
  open: string;
  quoteVolume: string;
  start: string;
  trades: string;
  volume: string;
}

export interface Depth {
  payload: {
    bids: [string, string][];
    asks: [string, string][];
  };
}

export interface TradesResponse {
  success: boolean;
  data: Trade[];
}

export type DepthPayload = {
  bids: [string, string][];
  asks: [string, string][];
};

export type TradePayload = {
  price: string;
  quantity: string;
  side: string;
  timestamp: number;
};

export interface TickerPayload {
  data: {
    e: string;
    p: string;
    q: string;
    s: string;
    t: number;
  };
  stream: string;
}
export type RoomType = 'depth' | 'trade';
export type Room = `${RoomType}@${string}`;
