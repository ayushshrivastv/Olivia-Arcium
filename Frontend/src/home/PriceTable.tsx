/**
 * Olivia: Decentralised Permissionless Predicition Market 
 * Copyright (c) 2025 Ayush Srivastava
 *
 * Licensed under the Apache 2.0
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Search, ChevronDown } from 'lucide-react';
import SparklineChart from '../ui/SparklineChart';
import { MarketIcon } from '@/src/market/MarketIcon';
import { PaginationControls } from '@/src/market/PaginationControl';

interface ApiMarket {
  id: string;
  name: string;
  base_asset: string;
  quote_asset: string;
  end_time: number[];
  status: string;
}

const parseMarketTime = (timeArray: number[]): Date | null => {
  if (!timeArray || timeArray.length < 2) return null;
  const [year, dayOfYear, hour = 0, minute = 0, second = 0] = timeArray;
  const date = new Date(year, 0, dayOfYear);
  date.setUTCHours(hour, minute, second);
  return date;
};

const formatMarketTime = (date: Date | null): string => {
  if (!date) return 'N/A';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('00' + value.toString(16)).slice(-2);
  }
  return color;
};

type MarketStatus =
  | 'Incoming'
  | 'Active'
  | 'Paused'
  | 'Resolved'
  | 'Cancelled'
  | string;

type Market = {
  id: string;
  name: string;
  base_asset: string;
  quote_asset: string;
  end_time_raw: number[];
  status: MarketStatus;
  endTime: Date | null;
  formattedEndTime: string;
  link: string;
  iconSymbol: string;
  bgColor: string;
  endTimeEpoch: number;
  mockCurrentPrice: number;
  mockPriceChangePercent: number;
};

type FilterOption = 'all' | 'favorites' | MarketStatus | `base:${string}`;
type SortField = 'name' | 'status';
type SortDirection = 'asc' | 'desc';

const PriceTable = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMarkets = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          'http://localhost:8080/api/v1/market/markets'
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error('API did not return an array');
        }

        const processedMarkets: Market[] = data.map((apiMarket: ApiMarket) => {
          const endTime = parseMarketTime(apiMarket.end_time);

          let mockPriceChangePercent = 0;
          if (apiMarket.status === 'Active') mockPriceChangePercent = 0.5;
          else if (
            apiMarket.status === 'Resolved' ||
            apiMarket.status === 'Cancelled'
          )
            mockPriceChangePercent = -0.5;

          return {
            id: apiMarket.id,
            name: apiMarket.name,
            base_asset: apiMarket.base_asset,
            quote_asset: apiMarket.quote_asset,
            end_time_raw: apiMarket.end_time,
            status: apiMarket.status,
            endTime: endTime,
            formattedEndTime: formatMarketTime(endTime),
            link: `/market/${apiMarket.id}`,
            iconSymbol: apiMarket.base_asset
              ? apiMarket.base_asset.charAt(0).toUpperCase()
              : '?',
            bgColor: stringToColor(apiMarket.base_asset || 'default'),
            endTimeEpoch: endTime ? endTime.getTime() : 0,
            mockCurrentPrice: Math.random() * 100, // Random probability for prediction markets
            mockPriceChangePercent: mockPriceChangePercent,
          };
        });
        setMarkets(processedMarkets);
      } catch (err: unknown) {
        // Silently handle errors - don't show error to user
        console.error('Error fetching prediction markets:', err);
        setMarkets([]); // Set empty array instead of showing error
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const savedFavorites = localStorage.getItem('marketFavorites');
      return savedFavorites ? JSON.parse(savedFavorites) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('marketFavorites', JSON.stringify(favorites));
    }
  }, [favorites]);

  const itemsPerPage = 6;

  const handleFilterChange = (filter: FilterOption) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleFavorite = (marketId: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(marketId)
        ? prev.filter((id) => id !== marketId)
        : [...prev, marketId];
      return newFavorites;
    });
  };

  const availableBaseAssets = React.useMemo(() => {
    const assets = new Set(markets.map((m) => m.base_asset));
    return Array.from(assets);
  }, [markets]);

  const availableStatuses = React.useMemo(() => {
    const statuses = new Set(markets.map((m) => m.status));
    return Array.from(statuses) as MarketStatus[];
  }, [markets]);

  const filterAndSortMarkets = useCallback(() => {
    let filtered = [...markets];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.base_asset.toLowerCase().includes(query)
      );
    }

    if (activeFilter !== 'all' && activeFilter !== 'favorites') {
      if (activeFilter.startsWith('base:')) {
        const baseAssetFilter = activeFilter.substring(5);
        filtered = filtered.filter((m) => m.base_asset === baseAssetFilter);
      } else {
        filtered = filtered.filter((m) => m.status === activeFilter);
      }
    } else if (activeFilter === 'favorites') {
      filtered = filtered.filter((m) => favorites.includes(m.id));
    }

    filtered.sort((a, b) => {
      let compareA, compareB;
      switch (sortField) {
        case 'name':
          compareA = a.name;
          compareB = b.name;
          break;
        case 'status':
          compareA = a.status;
          compareB = b.status;
          break;
        default:
          compareA = a.name;
          compareB = b.name;
      }
      const comparison =
        typeof compareA === 'string' && typeof compareB === 'string'
          ? compareA.localeCompare(compareB)
          : parseInt(compareA) - parseInt(compareB);
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return filtered;
  }, [markets, activeFilter, sortField, sortDirection, searchQuery, favorites]);

  const filteredMarkets = filterAndSortMarkets();
  const totalPages = Math.max(
    1,
    Math.ceil(filteredMarkets.length / itemsPerPage)
  );
  const adjustedCurrentPage = Math.min(currentPage, totalPages);
  const paginatedMarkets = filteredMarkets.slice(
    (adjustedCurrentPage - 1) * itemsPerPage,
    adjustedCurrentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-light text-white mb-2">Live Prediction Markets</h2>
        <p className="text-zinc-400 text-sm">
          Explore active markets and make your predictions on real-world events
        </p>
      </div>
      
      <div className="flex flex-wrap gap-3 mb-5 py-2">
        <button
          className={`px-5 py-1.5 rounded-full text-xs font-medium transition-colors ${
            activeFilter === 'all'
              ? 'bg-[#FF6B00] text-white'
              : 'bg-transparent border border-zinc-800 text-white hover:border-zinc-700'
          }`}
          onClick={() => handleFilterChange('all')}
        >
          All Markets
        </button>
        {availableStatuses.map((status) => (
          <button
            key={status}
            className={`px-5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeFilter === status
                ? 'bg-[#FF6B00] text-white'
                : 'bg-transparent border border-zinc-800 text-white hover:border-zinc-700'
            }`}
            onClick={() => handleFilterChange(status)}
          >
            {status}
          </button>
        ))}
        {availableBaseAssets.map((asset) => (
          <button
            key={asset}
            className={`px-5 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeFilter === `base:${asset}`
                ? 'bg-[#FF6B00] text-white'
                : 'bg-transparent border border-zinc-800 text-white hover:border-zinc-700'
            }`}
            onClick={() => handleFilterChange(`base:${asset}`)}
          >
            {asset}
          </button>
        ))}
        <button
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            activeFilter === 'favorites'
              ? 'bg-[#FF6B00] text-white'
              : 'bg-transparent border border-zinc-800 text-zinc-500 hover:border-zinc-700'
          }`}
          onClick={() => handleFilterChange('favorites')}
          title="Favorites"
        >
          ★
        </button>
      </div>

      <div className="mb-4 relative w-full md:w-60 ml-auto">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-3.5 w-3.5 text-zinc-500" />
        </div>
        <input
          type="text"
          placeholder="Search prediction markets..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full px-8 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-300 text-xs focus:outline-none focus:ring-1 focus:ring-zinc-700"
        />
      </div>

      <div className="overflow-hidden rounded-lg bg-zinc-900/50 border border-zinc-800">
        <div className="grid grid-cols-9 px-5 py-3 bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 text-xs">
          <button
            className="col-span-4 flex items-center text-left hover:text-zinc-300 transition-colors"
            onClick={() => handleSort('name')}
          >
            Event{' '}
            <ChevronDown
              className={`h-3 w-3 ml-1 transition-transform ${
                sortField === 'name' && sortDirection === 'asc'
                  ? 'rotate-180'
                  : ''
              }`}
            />
          </button>
          <button
            className="col-span-2 flex items-center text-left hover:text-zinc-300 transition-colors"
            onClick={() => handleSort('status')}
          >
            Status{' '}
            <ChevronDown
              className={`h-3 w-3 ml-1 transition-transform ${
                sortField === 'status' && sortDirection === 'asc'
                  ? 'rotate-180'
                  : ''
              }`}
            />
          </button>
          <div className="col-span-3 text-left">Probability Trend</div>
        </div>

        <div className="divide-y divide-zinc-800">
          {paginatedMarkets.length > 0 ? (
            paginatedMarkets.map((market) => (
              <div
                key={market.id}
                className="grid grid-cols-9 px-5 py-4 hover:bg-zinc-800/30 transition duration-200 relative"
              >
                <div className="absolute right-3 top-3">
                  <button
                    className="text-zinc-500 hover:text-[#FF6B00] transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleFavorite(market.id);
                    }}
                    aria-label={
                      favorites.includes(market.id)
                        ? 'Remove from favorites'
                        : 'Add to favorites'
                    }
                  >
                    <span
                      className={
                        favorites.includes(market.id) ? 'text-[#FF6B00]' : ''
                      }
                    >
                      ★
                    </span>
                  </button>
                </div>

                <div className="col-span-4 flex items-center space-x-3">
                  <Link
                    href={`/predict/${market.base_asset}_${market.quote_asset}`}
                    className="flex items-center space-x-3"
                    passHref
                  >
                    <MarketIcon base_asset={market.base_asset} />
                    <div>
                      <div className="text-white text-sm font-medium hover:underline">
                        {market.name}
                      </div>
                      <div className="text-zinc-500 text-xs mt-0.5">
                        Prediction Market • Ends {market.formattedEndTime}
                      </div>
                    </div>
                  </Link>
                </div>

                <div className="col-span-2 flex items-center">
                  <Link
                    href={`/predict/${market.base_asset}_${market.quote_asset}`}
                    className="w-full"
                    passHref
                  >
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        market.status === 'Incoming'
                          ? 'bg-blue-600/30 text-blue-300'
                          : market.status === 'Active'
                          ? 'bg-green-600/30 text-green-300'
                          : market.status === 'Resolved'
                          ? 'bg-purple-600/30 text-purple-300'
                          : 'bg-zinc-700/50 text-zinc-400'
                      }`}
                    >
                      {market.status}
                    </span>
                  </Link>
                </div>

                <div className="col-span-3 flex items-center h-10">
                  {' '}
                  <Link href={market.link} className="w-full h-full" passHref>
                    <SparklineChart
                      baseAsset={market.base_asset}
                      quoteAsset={market.quote_asset} // Or your API's expected format
                      // Optionally pass daysHistory or interval if you want to override defaults
                      // daysHistory={7}
                      // interval="1h"
                    />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="px-5 py-10 text-center text-zinc-500">
              {activeFilter === 'favorites' && favorites.length === 0
                ? 'No favorite prediction markets yet.'
                : 'No prediction markets found.'}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <PaginationControls
            currentPage={adjustedCurrentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      <div className="mt-4 text-xs text-zinc-500 flex justify-between items-center">
        <div>
          Showing {paginatedMarkets.length} of {filteredMarkets.length} prediction markets{' '}
          {activeFilter !== 'all' &&
            `(filtered by ${
              activeFilter.startsWith('base:')
                ? `category ${activeFilter.substring(5)}`
                : activeFilter
            })`}{' '}
          {searchQuery && `matching "${searchQuery}"`}
        </div>
        <div>
          Page {adjustedCurrentPage} of {totalPages}
        </div>
      </div>
    </div>
  );
};

export default PriceTable;
