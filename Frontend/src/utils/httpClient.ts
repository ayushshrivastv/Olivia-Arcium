import { Depth, KLine, Market, TradesResponse } from './types';

// Mock data for frontend development
const MOCK_MARKETS: Market[] = [
  {
    name: "Election 2028",
    description: "Will the Democratic candidate win the 2028 US Presidential Election?",
    base_asset: "ELECTION2028",
    quote_asset: "USDC",
    start_time: "2024-01-01T00:00:00Z",
    end_time: "2028-11-05T23:59:59Z",
    status: "Ongoing"
  },
  {
    name: "NYC Mayoral Election",
    description: "Who will win the New York City mayoral election?",
    base_asset: "NYC-MAYOR",
    quote_asset: "USDC",
    start_time: "2024-01-01T00:00:00Z",
    end_time: "2025-11-05T23:59:59Z",
    status: "Ongoing"
  },
  {
    name: "Government Shutdown",
    description: "Will there be a government shutdown in 2024?",
    base_asset: "GOVSHUTDOWN",
    quote_asset: "USDC",
    start_time: "2024-01-01T00:00:00Z",
    end_time: "2024-12-31T23:59:59Z",
    status: "Ongoing"
  },
  {
    name: "NY Election",
    description: "Will the incumbent win the New York Senate race?",
    base_asset: "NYELECTION",
    quote_asset: "USDC",
    start_time: "2024-01-01T00:00:00Z",
    end_time: "2024-11-05T23:59:59Z",
    status: "Ongoing"
  }
];

const MOCK_DEPTH: Depth = {
  payload: {
    bids: [
      ["0.45", "1000"],
      ["0.44", "2000"],
      ["0.43", "1500"],
      ["0.42", "3000"],
      ["0.41", "2500"]
    ],
    asks: [
      ["0.46", "1200"],
      ["0.47", "1800"],
      ["0.48", "2200"],
      ["0.49", "1600"],
      ["0.50", "2800"]
    ]
  }
};

const MOCK_TRADES: TradesResponse = {
  success: true,
  data: [
    {
      id: "1",
      currency_code: "USDC",
      price: 0.45,
      quantity: 500,
      time: new Date().toISOString(),
      volume: 225,
      side: "buy"
    },
    {
      id: "2",
      currency_code: "USDC",
      price: 0.46,
      quantity: 300,
      time: new Date(Date.now() - 60000).toISOString(),
      volume: 138,
      side: "sell"
    },
    {
      id: "3",
      currency_code: "USDC",
      price: 0.44,
      quantity: 800,
      time: new Date(Date.now() - 120000).toISOString(),
      volume: 352,
      side: "buy"
    }
  ]
};

const MOCK_KLINES: KLine[] = [
  {
    open: "0.43",
    high: "0.47",
    low: "0.42",
    close: "0.45",
    volume: "10000",
    quoteVolume: "4500",
    trades: "25",
    start: new Date(Date.now() - 3600000).toISOString(),
    end: new Date().toISOString()
  },
  {
    open: "0.45",
    high: "0.48",
    low: "0.44",
    close: "0.46",
    volume: "12000",
    quoteVolume: "5520",
    trades: "30",
    start: new Date(Date.now() - 7200000).toISOString(),
    end: new Date(Date.now() - 3600000).toISOString()
  }
];

// Mock API functions - no network calls
export async function getTicker(market: string): Promise<Market> {
  const markets = await getTickers();
  const ticker = markets.find((m) => m.base_asset == market.replace(/_+$/, ''));
  
  if (!ticker) {
    throw new Error(`No ticker found for ${market}`);
  }
  return ticker;
}

export async function getTickers(): Promise<Market[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return MOCK_MARKETS;
}

export async function getDepth(market: string): Promise<Depth> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return MOCK_DEPTH;
}

export async function getTrades(market: string): Promise<TradesResponse> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return MOCK_TRADES;
}

export async function getKlines(
  market: string,
  interval: string,
  startTime: string,
  endTime: string
): Promise<KLine[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return MOCK_KLINES;
}
