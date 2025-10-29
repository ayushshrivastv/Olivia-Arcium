/**
 * Olivia: Decentralised Permissionless Predicition Market 
 * Copyright (c) 2025 Ayush Srivastava
 *
 * Licensed under the Apache 2.0
 */

'use client';

import { useState, useEffect } from 'react';
import { getTickers } from '@/src/utils/httpClient';
import { Market } from '@/src/utils/types';

export default function MarketsTable() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [activeTab, setActiveTab] = useState<string>('All Assets');
  // Pagination state removed until pagination logic implemented to avoid unused var lint error
  const [/*currentPage*/, setCurrentPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<keyof Market | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const getMarkets = async (): Promise<void> => {
    try {
      const response = await getTickers();
      setMarkets(response);
    } catch (error) {
      console.error('Failed to fetch markets:', error);
    }
  };

  useEffect(() => {
    getMarkets();
  }, []);

  const handleSort = (column: keyof Market): void => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const handleTabChange = (tab: string): void => {
    setActiveTab(tab);
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-black text-white min-h-screen font-sans">
      {/* Tabs */}
      <div className="flex items-center mb-6 px-4">
        <div className="flex space-x-2">
          <button
            className={`px-6 py-2 rounded-full text-sm font-medium ${
              activeTab === 'All Assets' ? 'bg-orange-500' : 'bg-gray-800'
            }`}
            onClick={() => handleTabChange('All Assets')}
          >
            All Assets
          </button>
          <button
            className={`px-6 py-2 rounded-full text-sm font-medium ${
              activeTab === 'Solana' ? 'bg-orange-500' : 'bg-gray-800'
            }`}
            onClick={() => handleTabChange('Solana')}
          >
            Solana
          </button>
          <button
            className={`px-6 py-2 rounded-full text-sm font-medium ${
              activeTab === 'Sui' ? 'bg-orange-500' : 'bg-gray-800'
            }`}
            onClick={() => handleTabChange('Sui')}
          >
            Sui
          </button>
          <button className="px-3 py-2 rounded-full text-sm bg-gray-800">
            <span className="text-lg">★</span>
          </button>
        </div>
        <div className="ml-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="search..."
              className="px-4 py-2 rounded-full bg-gray-800 text-gray-300 w-64 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto px-4">
        <table className="w-full border-separate border-spacing-y-1">
          <thead>
            <tr className="text-left text-gray-400">
              <th
                className="py-4 px-4 cursor-pointer"
                onClick={() => handleSort('base_asset')}
              >
                <div className="flex items-center">
                  Asset
                  <span className="ml-1">▼</span>
                </div>
              </th>
              <th
                className="py-4 px-4 cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Name
                  <span className="ml-1">▼</span>
                </div>
              </th>
              <th
                className="py-4 px-4 cursor-pointer"
                onClick={() => handleSort('quote_asset')}
              >
                <div className="flex items-center">
                  Quote Asset
                  <span className="ml-1">▼</span>
                </div>
              </th>
              <th
                className="py-4 px-4 cursor-pointer"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center">
                  Status
                  <span className="ml-1">▼</span>
                </div>
              </th>
              <th
                className="py-4 px-4 text-right cursor-pointer"
                onClick={() => handleSort('end_time')}
              >
                <div className="flex items-center justify-end">
                  End Time
                  <span className="ml-1">▼</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {markets.map((market) => (
              <tr
                key={market.name}
                className="bg-gray-900 hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <td className="py-5 px-4 rounded-l">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center mr-3 text-lg font-semibold">
                      {market.base_asset.substring(0, 1)}
                    </div>
                    <div>
                      <div className="font-medium">{market.base_asset}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {market.description
                          ? `${market.description.substring(0, 15)}...`
                          : ''}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-5 px-4">
                  <div className="max-w-xs truncate font-medium">
                    {market.name}
                  </div>
                </td>
                <td className="py-5 px-4 font-medium">{market.quote_asset}</td>
                <td className="py-5 px-4">
                  <span className="px-3 py-1 rounded-full bg-gray-800 text-yellow-400 text-xs font-medium">
                    {market.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center mt-10 space-x-2 items-center">
        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white">
          &lt;
        </button>
        <button
          className="h-8 w-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-medium"
          onClick={() => handlePageChange(1)}
        >
          1
        </button>
        <button
          className="h-8 w-8 rounded-full bg-gray-800 text-white hover:bg-gray-700 flex items-center justify-center font-medium"
          onClick={() => handlePageChange(2)}
        >
          2
        </button>
        <button
          className="h-8 w-8 rounded-full bg-gray-800 text-white hover:bg-gray-700 flex items-center justify-center font-medium"
          onClick={() => handlePageChange(3)}
        >
          3
        </button>
        <button
          className="h-8 w-8 rounded-full bg-gray-800 text-white hover:bg-gray-700 flex items-center justify-center font-medium"
          onClick={() => handlePageChange(12)}
        >
          12
        </button>
        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white">
          &gt;
        </button>
      </div>
    </div>
  );
}
