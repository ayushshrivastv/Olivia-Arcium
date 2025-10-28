import axios from 'axios';
import { Depth, KLine, Market, TradesResponse } from './types';

const BASE_URL = 'http://localhost:8080/api/v1';

export async function getTicker(market: string): Promise<Market> {
  const markets = await getTickers();

  const ticker = markets.find((m) => m.base_asset == market.replace(/_+$/, ''));

  if (!ticker) {
    throw new Error(`No ticker found for ${market}`);
  }
  return ticker;
}

export async function getTickers(): Promise<Market[]> {
  const response = await axios.get(`${BASE_URL}/market/markets`);
  return response.data;
}

export async function getDepth(market: string): Promise<Depth> {
  const response = await axios.get(`${BASE_URL}/depth?market=${market}`);
  return response.data;
}

export async function getTrades(market: string): Promise<TradesResponse> {
  const response = await axios.get(`${BASE_URL}/trades?market=${market}`);
  return response.data;
}

export async function getKlines(
  market: string,
  interval: string,
  startTime: string,
  endTime: string
): Promise<KLine[]> {
  try {
    const response = await axios.get(
      `${BASE_URL}/klines?market=${market}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`
    );

    const data = await response.data;

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch klines');
    }

    return data.data;
  } catch (error) {
    console.error('Error fetching klines:', error);
    throw error;
  }
}
