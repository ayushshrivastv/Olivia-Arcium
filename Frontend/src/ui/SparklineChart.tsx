/**
 * Olivia: Decentralised Permissionless Predicition Market 
 * Copyright (c) 2025 Ayush Srivastava
 *
 * Licensed under the Apache 2.0
 */

'use client';

import React, { useState, useEffect } from 'react';

export type SparklineDataPoint = {
  price: number;
  timestamp: number;
};

export type SparklineData = {
  data: SparklineDataPoint[];
  type: 'up' | 'down' | 'volatile';
};

interface ApiResponse {
  success?: boolean;
  message?: string;
  data?: unknown[];
  klines?: unknown[];
  results?: unknown[];
}

type ApiKLine = {
  close: string;
  end: string;
  high: string;
  low: string;
  open: string;
  quoteVolume: string;
  start: string;
  trades: string;
  volume: string;
};

interface SparklineChartProps {
  baseAsset: string;
  quoteAsset: string;
  height?: number;
  showDashedLine?: boolean;
  daysHistory?: number;
  interval?: string;
}

const SparklineChart: React.FC<SparklineChartProps> = ({
  baseAsset,
  quoteAsset,
  height = 60,
  showDashedLine = true,
  daysHistory = 7,
  interval = '1h',
}) => {
  const [chartData, setChartData] = useState<SparklineData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!baseAsset) {
      setIsLoading(false);
      setError('Market');
      setChartData(null);
      return;
    }

    const fetchKlinesData = async () => {
      setIsLoading(true);
      setError(null);
      setChartData(null);

      const endTime = Date.now();
      const startTime = endTime - daysHistory * 24 * 60 * 60 * 1000;

      try {
        const apiUrl = `http://localhost:8080/api/v1/klines?market=${`${baseAsset}_${quoteAsset}`}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          let errorData = 'Failed to fetch data.';
          try {
            const errJson = await response.json();
            errorData =
              errJson.message || errJson.error || JSON.stringify(errJson);
          } catch {
            errorData = await response.text();
          }
          throw new Error(
            `Failed to fetch k-lines: ${response.status} ${response.statusText}. ${errorData}`
          );
        }

        const responseData = await response.json();

        console.log(`API response for ${baseAsset}:`, responseData);

        let klinesArray: ApiKLine[];

        if (Array.isArray(responseData)) {
          klinesArray = responseData;
        } else if (responseData && Array.isArray(responseData.data)) {
          klinesArray = responseData.data;
        } else if (responseData && Array.isArray(responseData.klines)) {
          klinesArray = responseData.klines;
        } else if (responseData && Array.isArray(responseData.results)) {
          klinesArray = responseData.results;
        } else {
          if (
            responseData &&
            typeof responseData === 'object' &&
            responseData !== null
          ) {
            if (
              (responseData as ApiResponse).success === false &&
              (responseData as ApiResponse).message
            ) {
              throw new Error(
                `API returned error: ${(responseData as ApiResponse).message}`
              );
            }
          }
          console.error(
            "Fetched data is not in the expected array format, or the array is not found in a known property (e.g., 'data', 'klines', 'results'). Actual data:",
            responseData
          );
          klinesArray = [];
        }

        if (!Array.isArray(klinesArray)) {
          throw new Error('Processed klines data is not an array.');
        }

        if (klinesArray.length === 0) {
          setChartData({ data: [], type: 'volatile' });
          setIsLoading(false);
          return;
        }

        const sortedKlines = [...klinesArray].sort(
          (a, b) => parseInt(a.start, 10) - parseInt(b.start, 10)
        );

        const processedData: SparklineDataPoint[] = sortedKlines.map(
          (kline) => ({
            price: parseFloat(kline.close),
            timestamp: parseInt(kline.end, 10),
          })
        );

        let type: 'up' | 'down' | 'volatile' = 'volatile';
        if (processedData.length > 1) {
          const firstPrice = processedData[0].price;
          const lastPrice = processedData[processedData.length - 1].price;
          if (lastPrice > firstPrice) type = 'up';
          else if (lastPrice < firstPrice) type = 'down';
        }

        setChartData({ data: processedData, type });
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : 'Unknown error';
    console.error(`Error fetching or processing k-lines for ${baseAsset}:`, e);
    setError(errMsg || 'Could not fetch or process chart data.');
        setChartData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKlinesData();
  }, [baseAsset, quoteAsset, daysHistory, interval]);

  console.log('main chart data: ', chartData);

  if (isLoading) {
    return (
      <div
        className="w-full h-full bg-transparent animate-pulse"
        style={{ height: `${height}px` }}
      />
    );
  }

  if (error) {
    return (
      <div
        className="w-full h-full flex items-center justify-center text-red-500 text-xs"
        style={{ height: `${height}px` }}
        title={error}
      >
        Chart N/A
      </div>
    );
  }

  if (!chartData || chartData.data.length === 0) {
    return (
      <div
        className="w-full h-full flex items-center justify-center text-zinc-500 text-xs"
        style={{ height: `${height}px` }}
      >
        No chart data
      </div>
    );
  }

  const dataPoints = chartData.data;

  const prices = dataPoints.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  let priceRange = maxPrice - minPrice;
  // Avoid division by zero or tiny range if all prices are the same or close to zero
  if (priceRange < 1e-9 && minPrice > 1e-9) {
    // Effectively zero range but has a price
    priceRange = minPrice * 0.2; // Create a small artificial range
  } else if (priceRange < 1e-9) {
    // Effectively zero range and zero price
    priceRange = 1; // Default range if price is zero
  }

  const buffer = priceRange * 0.1; // 10% buffer
  const adjustedMin = minPrice - buffer;
  const adjustedMax = maxPrice + buffer;
  const finalRange =
    adjustedMax - adjustedMin > 0 ? adjustedMax - adjustedMin : 1; // Ensure finalRange is positive

  const svgWidth = 240; // Intrinsic width of the SVG drawing area
  const generatePath = () => {
    if (dataPoints.length <= 1) {
      if (dataPoints.length === 1) {
        // For a single point, draw a horizontal line at its price level
        const y =
          height - ((dataPoints[0].price - adjustedMin) / finalRange) * height;
        return `M 0 ${y.toFixed(2)} L ${svgWidth} ${y.toFixed(2)}`;
      }
      return `M 0 ${height / 2}`; // Default to middle if no points
    }
    return dataPoints
      .map((point, i) => {
        const x = (i / (dataPoints.length - 1)) * svgWidth;
        let yValue = ((point.price - adjustedMin) / finalRange) * height;
        // Handle potential NaN/Infinity if finalRange is 0 or prices are extreme
        if (!isFinite(yValue)) yValue = height / 2;
        const y = height - Math.max(0, Math.min(height, yValue)); // Clamp y to be within [0, height]
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(' ');
  };

  const generateFillPath = () => {
    const linePath = generatePath();
    if (dataPoints.length === 0)
      return `M 0 ${height} L ${svgWidth} ${height} Z`;

    // Get the y-coordinate of the first point on the line path
    const firstPathSegment = linePath.split(' ')[0]; // e.g., "M" or "M0.00"
    const firstYCoord = parseFloat(
      linePath.substring(firstPathSegment.length + 1).split(' ')[1]
    );

    return `${linePath} L ${svgWidth.toFixed(
      2
    )} ${height} L 0 ${height} L 0 ${firstYCoord.toFixed(2)} Z`;
  };

  const strokeColor = chartData.type === 'down' ? '#FF3D00' : '#00C853'; // Red for down, Green for up/volatile

  let startPriceY = height / 2;
  if (dataPoints.length > 0) {
    let startPriceYValue =
      ((dataPoints[0].price - adjustedMin) / finalRange) * height;
    if (!isFinite(startPriceYValue)) startPriceYValue = height / 2;
    startPriceY = height - Math.max(0, Math.min(height, startPriceYValue));
  }

  // Sanitize name for use in SVG ID. Replace non-alphanumeric characters.
  const sanitizedname = baseAsset.replace(/[^a-zA-Z0-9]/g, '');
  const gradientId = `gradient-${chartData.type}-${sanitizedname}`;

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${height}`}
      className="w-full h-full" // Ensure SVG scales with its container
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.15" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d={generateFillPath()} fill={`url(#${gradientId})`} />

      {showDashedLine && dataPoints.length > 0 && (
        <line
          x1="0"
          y1={startPriceY.toFixed(2)}
          x2={svgWidth}
          y2={startPriceY.toFixed(2)}
          stroke="#666666"
          strokeWidth="0.5"
          strokeDasharray="2,2"
          opacity="0.5"
        />
      )}

      <path
        d={generatePath()}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default SparklineChart;
