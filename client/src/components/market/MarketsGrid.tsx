'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { CometCard } from '@/src/components/ui/comet-card';

interface MarketItem {
  id: string;
  title: string;
  question: string;
  probability: string;
  category: string;
  iconColor: string;
  pair: string;
  image: string;
}

const mockMarkets: MarketItem[] = [
  {
    id: '1',
    title: 'NYC Mayoral Election',
    question: 'Zohran Mamdani',
    probability: '88.5%',
    category: 'Politics',
    iconColor: '#5522e0',
    pair: 'NYC-MAYOR',
    image: '/NY Election.png'
  },
  {
    id: '2',
    title: 'Government Shutdown',
    question: 'November 23rd or Before',
    probability: '65%',
    category: 'Politics',
    iconColor: '#F7931A',
    pair: 'GOV-SHUTDOWN',
    image: '/Government Shutdown.jpeg'
  },
  {
    id: '3',
    title: 'Mamdani Victory Margin',
    question: '10-20%',
    probability: '47%',
    category: 'Politics',
    iconColor: '#E6007A',
    pair: 'MAMDANI-MARGIN',
    image: '/Zohran_Mamdani.jpg'
  },
  {
    id: '4',
    title: 'Presidential Election 2028',
    question: 'JD Vance',
    probability: '28%',
    category: 'Politics',
    iconColor: '#0033AD',
    pair: 'PRES-2028',
    image: '/Election 2028.jpeg'
  },
  {
    id: '5',
    title: 'Solana Price October',
    question: 'What price will Solana hit?',
    probability: '45%',
    category: 'Crypto',
    iconColor: '#9945FF',
    pair: 'SOL-PRICE',
    image: '/Solana.jpg'
  },
  {
    id: '6',
    title: 'Polymarket US Launch',
    question: 'Will it go live in 2025?',
    probability: '90%',
    category: 'Crypto',
    iconColor: '#26A17B',
    pair: 'POLY-US',
    image: '/PolyMarket.png'
  }
];

export default function MarketsGrid() {
  const [markets, setMarkets] = useState<MarketItem[]>(mockMarkets);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (searchQuery) {
      const filtered = mockMarkets.filter(market =>
        market.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.question.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setMarkets(filtered);
    } else {
      setMarkets(mockMarkets);
    }
  }, [searchQuery]);

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-white text-sm transition-all duration-200"
            style={{
              backgroundColor: 'rgba(10, 10, 10, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              fontFamily: 'GT America Mono, monospace',
            }}
          />
        </div>
      </div>

      {/* Markets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {markets.map((market) => (
          <CometCard key={market.id} rotateDepth={17.5} translateDepth={20}>
            <Link href={`/trade/${market.pair}`}>
              <div
                className="rounded-xl overflow-hidden transition-all duration-200 cursor-pointer h-full flex flex-col"
                style={{
                  backgroundColor: 'rgba(10, 10, 10, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  minHeight: '400px',
                }}
              >
                {/* Image - Top Half */}
                <div className="relative w-full h-[180px]">
                  <Image 
                    src={market.image} 
                    alt={market.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: 'rgba(10, 10, 10, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        color: 'white',
                        fontFamily: 'GT America Mono, monospace',
                      }}
                    >
                      {market.category}
                    </span>
                  </div>
                </div>

                {/* Bottom Half - Content */}
                <div className="flex flex-col flex-grow p-5">
                  <div className="mt-auto space-y-3">
                    <h3 className="text-white text-lg font-light" style={{ fontFamily: 'PP Editorial New, serif' }}>
                      {market.title}
                    </h3>
                    
                    <p className="text-gray-300 text-sm" style={{ fontFamily: 'GT America Mono, monospace' }}>
                      {market.question}
                    </p>

                    {/* Trade Button */}
                    <button
                      className="w-full py-2 rounded-full text-white text-sm font-medium transition-all duration-200"
                      style={{
                      backgroundColor: 'rgba(10, 10, 10, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      fontFamily: 'GT America Mono, monospace',
                      }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(10, 10, 10, 0.7)';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                  >
                      Trade Market
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          </CometCard>
        ))}
      </div>

      {markets.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">No markets found matching your search.</p>
        </div>
      )}
    </div>
  );
}

