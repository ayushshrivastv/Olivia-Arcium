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
    base_asset: "GOV-SHUTDOWN",
    quote_asset: "USDC",
    start_time: "2024-01-01T00:00:00Z",
    end_time: "2024-12-31T23:59:59Z",
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
  },
  {
    name: "Mamdani Victory Margin",
    description: "Will Mamdani win with a 10-20% margin?",
    base_asset: "MAMDANI-MARGIN",
    quote_asset: "USDC",
    start_time: "2024-01-01T00:00:00Z",
    end_time: "2025-11-05T23:59:59Z",
    status: "Ongoing"
  },
  {
    name: "Presidential Election 2028",
    description: "Will JD Vance win the 2028 US Presidential Election?",
    base_asset: "PRES-2028",
    quote_asset: "USDC",
    start_time: "2024-01-01T00:00:00Z",
    end_time: "2028-11-05T23:59:59Z",
    status: "Ongoing"
  },
  {
    name: "Solana Price October",
    description: "What price will Solana hit in October?",
    base_asset: "SOL-PRICE",
    quote_asset: "USDC",
    start_time: "2024-01-01T00:00:00Z",
    end_time: "2024-10-31T23:59:59Z",
    status: "Ongoing"
  },
  {
    name: "Polymarket US Launch",
    description: "Will Polymarket go live in the US in 2025?",
    base_asset: "POLY-US",
    quote_asset: "USDC",
    start_time: "2024-01-01T00:00:00Z",
    end_time: "2025-12-31T23:59:59Z",
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

const getMockKlines = (): KLine[] => {
  const now = Date.now();
  // Create data points in ascending time order (oldest first)
  return [
    {
      open: "0.42",
      high: "0.44",
      low: "0.41",
      close: "0.43",
      volume: "8000",
      quoteVolume: "3440",
      trades: "20",
      start: new Date(now - 7200000).toISOString(),
      end: new Date(now - 5400000).toISOString()
    },
    {
      open: "0.43",
      high: "0.46",
      low: "0.42",
      close: "0.45",
      volume: "10000",
      quoteVolume: "4500",
      trades: "25",
      start: new Date(now - 5400000).toISOString(),
      end: new Date(now - 3600000).toISOString()
    },
    {
      open: "0.45",
      high: "0.48",
      low: "0.44",
      close: "0.47",
      volume: "12000",
      quoteVolume: "5640",
      trades: "30",
      start: new Date(now - 3600000).toISOString(),
      end: new Date(now - 1800000).toISOString()
    },
    {
      open: "0.47",
      high: "0.49",
      low: "0.46",
      close: "0.48",
      volume: "13000",
      quoteVolume: "6240",
      trades: "35",
      start: new Date(now - 1800000).toISOString(),
      end: new Date(now).toISOString()
    }
  ];
};

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getDepth(_market: string): Promise<Depth> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return MOCK_DEPTH;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getTrades(_market: string): Promise<TradesResponse> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return MOCK_TRADES;
}

export async function getKlines(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _market: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _interval: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _startTime: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _endTime: string
): Promise<KLine[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return getMockKlines();
}
