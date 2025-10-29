'use client';

import { useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import ChartControl from './ChartControl';
import { ChartManager } from '@/src/utils/chartManager';
import { KLine } from '@/src/utils/types';
import { getKlines } from '@/src/utils/httpClient';
import { useChartStore } from '@/src/utils/store/chartStore';

export default function ChartArea({ market }: { market: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<ChartManager | null>(null);
  const lastBarTsRef = useRef<number>(0);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  const { interval, view } = useChartStore();

  const toBar = (x: KLine) => {
    // Parse ISO date string or timestamp
    let tsInMillis: number;
    if (typeof x.end === 'string') {
      // Try to parse as ISO date string first
      const parsed = new Date(x.end).getTime();
      tsInMillis = isNaN(parsed) ? parseInt(x.end, 10) : parsed;
    } else {
      tsInMillis = Number(x.end);
    }
    
    return {
      timestamp: tsInMillis,
      close: parseFloat(x.close),
      volume: parseFloat(x.volume),
      open: x.open ? parseFloat(x.open) : undefined,
      high: x.high ? parseFloat(x.high) : undefined,
      low: x.low ? parseFloat(x.low) : undefined,
    };
  };

  const initializeChart = useCallback(async () => {
    if (!containerRef.current) return;

    const now = Date.now();
    let startTime;
    switch (interval) {
      case '1m':
        startTime = now - 1000 * 60 * 60;
        break;
      case '1h':
        startTime = now - 1000 * 60 * 60 * 24 * 7;
        break;
      case '1d':
        startTime = now - 1000 * 60 * 60 * 24 * 30 * 6;
        break;
      case '1w':
        startTime = now - 1000 * 60 * 60 * 24 * 365 * 2;
        break;
      default:
        startTime = now - 1000 * 60 * 60;
    }

    let klines: KLine[] = [];
    try {
      klines = await getKlines(
        market,
        interval,
        startTime.toString(),
        now.toString()
      );
    } catch (e) {
      console.error('Failed to fetch initial history:', e);
      return;
    }

    const bars = klines.map(toBar).sort((a, b) => a.timestamp - b.timestamp);

    managerRef.current?.destroy();

    managerRef.current = new ChartManager(containerRef.current, bars, {
      background: '#0e0f14',
      color: 'white',
    });

    lastBarTsRef.current =
      bars.length > 0 ? bars[bars.length - 1].timestamp : now;
  }, [interval, market]);

  const fetchLatestDataAndUpdate = useCallback(async () => {
    if (!managerRef.current) {
      console.log('Chart manager not initialized, skipping fetch.');
      return;
    }

    const start = (lastBarTsRef.current + 1).toString();
    const now = Date.now().toString();

    let klines: KLine[] = [];
    try {
      klines = await getKlines(market, interval, start, now);
    } catch (e) {
      console.error(
        `[${new Date().toLocaleTimeString()}] Failed to fetch latest data:`,
        e
      );
      return;
    }

    if (klines.length > 0) {
      const newBars = klines
        .map(toBar)
        .sort((a, b) => a.timestamp - b.timestamp);

      const latestBar = newBars[newBars.length - 1];

      const isNewCandlePeriod = latestBar.timestamp > lastBarTsRef.current;
      const updateData = {
        time: latestBar.timestamp,
        close: latestBar.close ?? 0,
        volume: latestBar.volume ?? 0,
        newCandleInitiated: isNewCandlePeriod,
      };

      managerRef.current?.update(updateData);

      if (isNewCandlePeriod) {
        lastBarTsRef.current = latestBar.timestamp;
      }
    }
  }, [interval, market]);

  useEffect(() => {
    initializeChart();
    return () => {
      managerRef.current?.destroy();
      managerRef.current = null;
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [market, interval, initializeChart]);

  useEffect(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }

    intervalIdRef.current = setInterval(fetchLatestDataAndUpdate, 1000);
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [market, interval, fetchLatestDataAndUpdate]);

  const ChatArea = dynamic(() => import('@/src/trade/Chat/ChatArea'), { ssr: false });

  return (
    <>
      <ChartControl />
      <div className="flex-1 bg-card flex items-center justify-center">
        <div
          ref={containerRef}
          className={`text-muted-foreground w-full h-full ${
            view === 'chat' ? 'hidden' : 'block'
          }`}
          style={{ minHeight: '300px' }}
        />
        {view === 'chat' && (
          <div className="w-full h-full" style={{ minHeight: '300px' }}>
            <ChatArea market={market} />
          </div>
        )}
      </div>
    </>
  );
}
