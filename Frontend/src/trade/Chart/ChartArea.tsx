/**
 * Olivia: Decentralised Permissionless Predicition Market 
 * Copyright (c) 2025 Ayush Srivastava
 *
 * Licensed under the Apache 2.0
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import ChartControl from './ChartControl';
import { ChartManager } from '@/src/utils/chartManager';
import { MultiLineChartManager } from '@/src/utils/multiLineChartManager';
import { KLine } from '@/src/utils/types';
import { getKlines } from '@/src/utils/httpClient';
import { useChartStore } from '@/src/utils/store/chartStore';

export default function ChartArea({ market }: { market: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<ChartManager | MultiLineChartManager | null>(null);
  const lastBarTsRef = useRef<number>(0);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  const { interval, view } = useChartStore();

  // Check if this is the NYC Mayor election market
  const isNYCMayorMarket = market.includes('NYC-MAYOR') || market === 'NYC-MAYOR';

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

    managerRef.current?.destroy();

    // Use multi-line chart for NYC Mayor election
    if (isNYCMayorMarket) {
      const candidates = [
        { name: 'Zohran Mamdani', percentage: 88.8, color: '#FF8C42' }, // Orange - ends at 88.8%
        { name: 'Andrew Cuomo', percentage: 11.1, color: '#4285F4' }, // Blue - ends at 11.1%
        { name: 'Curtis Sliwa', percentage: 0.8, color: '#9E9E9E' }, // Grey (<1%)
        { name: 'Eric Adams', percentage: 0.5, color: '#FFEB3B' }, // Yellow (<1%)
      ];

      managerRef.current = new MultiLineChartManager(containerRef.current, candidates, {
        background: '#0e0f14',
        color: 'white',
      });
      return;
    }

    // Regular chart for other markets
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

    managerRef.current = new ChartManager(containerRef.current, bars, {
      background: '#0e0f14',
      color: 'white',
    });

    lastBarTsRef.current =
      bars.length > 0 ? bars[bars.length - 1].timestamp : now;
  }, [interval, market, isNYCMayorMarket]);

  const fetchLatestDataAndUpdate = useCallback(async () => {
    if (!managerRef.current) {
      console.log('Chart manager not initialized, skipping fetch.');
      return;
    }

    // Skip updates for multi-line chart (NYC Mayor) - it's static
    if (isNYCMayorMarket) {
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

    if (klines.length > 0 && managerRef.current instanceof ChartManager) {
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

      managerRef.current.update(updateData);

      if (isNewCandlePeriod) {
        lastBarTsRef.current = latestBar.timestamp;
      }
    }
  }, [interval, market, isNYCMayorMarket]);

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

  const candidates = isNYCMayorMarket ? [
    { name: 'Zohran Mamdani', percentage: 88.8, color: '#FF8C42' },
    { name: 'Andrew Cuomo', percentage: 11.1, color: '#4285F4' },
    { name: 'Curtis Sliwa', percentage: 0.8, color: '#9E9E9E' },
    { name: 'Eric Adams', percentage: 0.5, color: '#FFEB3B' },
  ] : [];

  return (
    <>
      <ChartControl />
      {isNYCMayorMarket && (
        <div className="flex items-center gap-4 px-4 py-2 border-b border-border/20 bg-background">
          {candidates.map((candidate) => (
            <div key={candidate.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: candidate.color }}
              />
              <span className="text-sm text-foreground">
                {candidate.name} {candidate.percentage < 1 ? '<1%' : `${candidate.percentage.toFixed(1)}%`}
              </span>
            </div>
          ))}
        </div>
      )}
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
