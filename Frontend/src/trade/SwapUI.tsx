'use client';

import { useState, useEffect, ChangeEvent, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Button } from '@/src/ui/Button';
import { Input } from '@/src/ui/Input';
import { ArrowDownIcon } from '@/src/components/Icons';
import { Loader2, X } from 'lucide-react';
import Depth from '@/src/trade/Depth/Depth';
import Image from 'next/image';

interface SwapUIProps {
  baseCurrency: string;
  quoteCurrency: string;
}

type OrderType = 'BUY' | 'SELL';
type OrderMode = 'MKT' | 'LIMIT';

interface QuoteResponse {
  payload: {
    avg_price: string;
    quantity: string;
    total_cost: string;
  };
  type: string;
}

interface OrderResponse {
  payload: {
    filled_qty: string;
    order_id: string;
    remaining_qty: string;
  };
  type: string;
}

interface OrderPayload {
  userId: string;
  market: string;
  quantity: number;
  side: string;
  price?: number;
}

interface QuotePayload {
  market: string;
  order_type: string;
  side: string;
  quantity: number;
}

export default function SwapUI({ baseCurrency, quoteCurrency }: SwapUIProps) {
  const isNYCMayorMarket = baseCurrency.includes('NYC-MAYOR') || baseCurrency === 'NYC-MAYOR';
  const candidates = isNYCMayorMarket ? [
    'Zohran Mamdani',
    'Andrew Cuomo',
    'Curtis Sliwa',
    'Eric Adams',
  ] : [];
  
  const market = `${baseCurrency.replace(/_+$/, '')}_${quoteCurrency}`;
  
  const [selectedCandidate, setSelectedCandidate] = useState<string>(candidates[0] || '');
  const [orderType, setOrderType] = useState<OrderType>('BUY');
  const [orderMode, setOrderMode] = useState<OrderMode>('MKT');
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [orderResult, setOrderResult] = useState<OrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBetConfirmation, setShowBetConfirmation] = useState<boolean>(false);

  const sideMapping = useMemo<Record<OrderType, string>>(
    () => ({ BUY: 'Bid', SELL: 'Ask' }),
    []
  );

  const getQuote = useCallback(async (): Promise<void> => {
    if (!amount || parseFloat(amount) <= 0) return;

    setLoading(true);
    // Don't clear error here - only clear on order creation

    try {
      const payload: QuotePayload = {
        market: market,
        order_type: 'Spot',
        side: sideMapping[orderType],
        quantity: parseFloat(amount),
      };

      const response = await axios.post<QuoteResponse>(
        'http://localhost:8080/api/v1/order/quote',
        payload
      );

      setQuote(response.data);
    } catch (err) {
      // Silently handle quote errors - don't display network errors to user
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }, [amount, market, orderType, sideMapping]);

  useEffect(() => {
    if (orderMode === 'MKT' && amount && parseFloat(amount) > 0) {
      getQuote();
    }
  }, [amount, orderType, orderMode, getQuote]);


  const handleBetClick = (): void => {
    if (amount && parseFloat(amount) > 0) {
      setShowBetConfirmation(true);
    }
  };

  const createOrder = async (): Promise<void> => {
    setShowBetConfirmation(false);
    setLoading(true);
    setError(null);
    setOrderResult(null);

    try {
      const payload: OrderPayload = {
        userId: '1',
        market: market,
        quantity: parseFloat(amount),
        side: sideMapping[orderType],
      };

      if (orderMode === 'LIMIT') {
        if (!limitPrice || parseFloat(limitPrice) <= 0) {
          throw new Error('Please enter a valid limit price');
        }
        payload.price = parseFloat(limitPrice);
      }

      const response = await axios.post<OrderResponse>(
        'http://localhost:8080/api/v1/order/create',
        payload
      );

      setOrderResult(response.data);
    } catch (err) {
      // Silently handle order creation errors - don't display network errors to user
      console.error('Order creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderTypeChange = (type: OrderType): void => {
    setOrderType(type);
    if (orderMode === 'MKT' && amount && parseFloat(amount) > 0) {
      getQuote();
    }
  };

  const handleOrderModeChange = (mode: OrderMode): void => {
    setOrderMode(mode);
    setQuote(null);
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setAmount(e.target.value);
  };

  const handleLimitPriceChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setLimitPrice(e.target.value);
  };

  const applyMultiplier = (multiplier: number): void => {
    if (amount) {
      const newAmount = (parseFloat(amount) * multiplier).toString();
      setAmount(newAmount);
    }
  };

  const executionCost = quote ? quote.payload.total_cost : '0.00';

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex-shrink-0">
        {isNYCMayorMarket && candidates.length > 0 ? (
          <div className="mb-4">
            <div className="text-sm mb-2 text-muted-foreground">Select Candidate:</div>
            <div 
              className="flex gap-2 overflow-x-auto pb-2"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255, 255, 255, 0.1) transparent',
              }}
            >
              {candidates.map((candidate) => (
                <button
                  key={candidate}
                  onClick={() => setSelectedCandidate(candidate)}
                  className={`rounded-full px-4 py-2 text-sm transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    selectedCandidate === candidate
                      ? 'text-white'
                      : 'text-muted-foreground'
                  }`}
                  style={{
                    backgroundColor: selectedCandidate === candidate
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(10, 10, 10, 0.7)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCandidate !== candidate) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCandidate !== candidate) {
                      e.currentTarget.style.backgroundColor = 'rgba(10, 10, 10, 0.7)';
                    }
                  }}
                >
                  {candidate}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex mb-4">
            <Button
              className={`flex-1 ${
                orderType === 'BUY'
                  ? 'bg-white text-green-500'
                  : 'bg-card hover:bg-card/90 text-green-500'
              } rounded-l-xl rounded-r-none border border-border font-semibold`}
              onClick={() => handleOrderTypeChange('BUY')}
            >
              BUY
            </Button>
            <Button
              className={`flex-1 ${
                orderType === 'SELL'
                  ? 'bg-white text-red-500'
                  : 'bg-card hover:bg-card/90 text-red-500'
              } rounded-r-xl rounded-l-none border border-l-0 border-border font-semibold`}
              onClick={() => handleOrderTypeChange('SELL')}
            >
              SELL
            </Button>
          </div>
        )}

        <div className="flex mb-4">
          <Button
            className={`flex-1 ${
              orderMode === 'MKT'
                ? 'bg-white text-black'
                : 'bg-card hover:bg-card/90 text-foreground'
            } rounded-l-xl rounded-r-none border border-border`}
            onClick={() => handleOrderModeChange('MKT')}
          >
            Buy
          </Button>
          <Button
            className={`flex-1 ${
              orderMode === 'LIMIT'
                ? 'bg-white text-background'
                : 'bg-card hover:bg-card/90 text-foreground'
            } rounded-r-xl rounded-l-none border border-l-0 border-border`}
            onClick={() => handleOrderModeChange('LIMIT')}
          >
            Sell
          </Button>
        </div>
      </div>

      {orderMode === 'LIMIT' && (
        <div className="flex-shrink-0 mb-4">
          <div className="flex justify-between items-center text-sm mb-2">
            <span>Limit Price:</span>
            <div className="bg-secondary text-xs rounded-md px-2 py-1">
              {quoteCurrency}
            </div>
          </div>
          <Input
            className="bg-card border-border"
            placeholder="enter price"
            value={limitPrice}
            onChange={handleLimitPriceChange}
            type="number"
            step="0.0001"
          />
        </div>
      )}

      <div className="flex-shrink-0 mb-4">
        <div className="flex justify-between items-center text-sm mb-2">
          <span>Amount:</span>
          <div className="flex gap-2">
            <button
              className="rounded-full px-3 py-1.5 text-sm transition-all duration-200 text-white"
              style={{
                backgroundColor: 'rgba(10, 10, 10, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(10, 10, 10, 0.7)';
              }}
              onClick={() => applyMultiplier(0.5)}
            >
              .5x
            </button>
            <button
              className="rounded-full px-3 py-1.5 text-sm transition-all duration-200 text-white"
              style={{
                backgroundColor: 'rgba(10, 10, 10, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(10, 10, 10, 0.7)';
              }}
              onClick={() => applyMultiplier(2)}
            >
              2x
            </button>
          </div>
        </div>
        <div className="flex">
          <Input
            className="bg-card border-border rounded-r-none"
            placeholder="0"
            value={amount}
            onChange={handleAmountChange}
            type="number"
            step="0.01"
          />
          <button
            className="rounded-l-none rounded-r-md px-4 py-2 text-sm transition-all duration-200 text-white flex items-center gap-2"
            style={{
              backgroundColor: 'rgba(10, 10, 10, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(10, 10, 10, 0.7)';
            }}
          >
            SOLANA
            <ArrowDownIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-shrink-0 flex justify-between items-center text-sm mb-2">
        <span>Execution</span>
        <span
          className={orderType === 'BUY' ? 'text-green-500' : 'text-red-500'}
        >
          {loading ? 'Calculating...' : `${executionCost} SOL`}
        </span>
      </div>


      {orderResult && (
        <div className="flex-shrink-0 text-green-500 text-sm mb-2 p-2 bg-green-100 rounded-md">
          Order placed successfully! ID: {orderResult.payload.order_id}
        </div>
      )}

      <div className="flex-shrink-0 mt-auto">
        <button
          onClick={handleBetClick}
          disabled={
            loading ||
            !amount ||
            parseFloat(amount) <= 0 ||
            (orderMode === 'LIMIT' &&
              (!limitPrice || parseFloat(limitPrice) <= 0))
          }
          className={`w-full py-3 rounded-full text-sm transition-all duration-200 flex items-center justify-center ${
            loading ||
            !amount ||
            parseFloat(amount) <= 0 ||
            (orderMode === 'LIMIT' &&
              (!limitPrice || parseFloat(limitPrice) <= 0))
              ? 'text-muted-foreground cursor-not-allowed opacity-50'
              : 'text-white'
          }`}
          style={{
            backgroundColor: loading ||
              !amount ||
              parseFloat(amount) <= 0 ||
              (orderMode === 'LIMIT' &&
                (!limitPrice || parseFloat(limitPrice) <= 0))
              ? 'rgba(10, 10, 10, 0.7)'
              : 'rgba(10, 10, 10, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          }}
          onMouseEnter={(e) => {
            if (!loading &&
                amount &&
                parseFloat(amount) > 0 &&
                !(orderMode === 'LIMIT' && (!limitPrice || parseFloat(limitPrice) <= 0))) {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading &&
                amount &&
                parseFloat(amount) > 0 &&
                !(orderMode === 'LIMIT' && (!limitPrice || parseFloat(limitPrice) <= 0))) {
              e.currentTarget.style.backgroundColor = 'rgba(10, 10, 10, 0.7)';
            }
          }}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            isNYCMayorMarket && selectedCandidate
              ? orderType === 'BUY'
                ? `Bet on ${selectedCandidate}`
                : `Sell ${selectedCandidate}`
              : `${orderType} ${baseCurrency.replace(/_+$/, '')}`
          )}
        </button>
      </div>

      {/* Depth Table Section - Scrollable */}
      <div className="flex-shrink-0 mt-4 border-t border-border/20 pt-4 flex flex-col" style={{ height: '256px' }}>
        <Depth market={market} isNYCMayorMarket={isNYCMayorMarket} />
      </div>

      {/* Bet Confirmation Modal */}
      {showBetConfirmation && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 9999 }}
          onClick={() => setShowBetConfirmation(false)}
        >
          <div
            className="w-full max-w-2xl rounded-xl p-6 max-h-[90vh] overflow-y-auto"
            style={{
              backgroundColor: 'rgba(10, 10, 10, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Bet Confirmation</h2>
              <button
                onClick={() => setShowBetConfirmation(false)}
                className="text-white hover:opacity-70 transition-opacity"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Bet Details */}
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Market</span>
                      <span className="text-white font-medium">
                        {isNYCMayorMarket ? 'NYC Mayoral Election' : `${baseCurrency}/${quoteCurrency}`}
                      </span>
                    </div>
                    
                    {isNYCMayorMarket && selectedCandidate && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">Candidate</span>
                        <span className="text-white font-medium">{selectedCandidate}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Order Type</span>
                      <span className="text-white font-medium">{orderType}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Amount</span>
                      <span className="text-white font-medium">{amount} SOL</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Execution Cost</span>
                      <span className="text-white font-medium">{executionCost} SOL</span>
                    </div>

                    {orderMode === 'LIMIT' && limitPrice && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-300">Limit Price</span>
                        <span className="text-white font-medium">{limitPrice}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notice */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-xs text-gray-300 leading-relaxed mb-4">
                    Please review your bet details carefully. Once confirmed, the transaction will be processed on the blockchain.
                  </p>
                  
                  {/* Magic Block Promotion */}
                  <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                    <Image
                      src="/Magic Block.png"
                      alt="Magic Block"
                      width={100}
                      height={100}
                      className="flex-shrink-0"
                    />
                    <div className="flex-1">
                      <p className="text-xs text-white leading-relaxed">
                        Powered by MagicBlock — offers{' '}
                        <span className="font-semibold text-green-400">zero transaction fees</span>
                        {' '}and faster block times.{' '}
                        <a
                          href="https://www.magicblock.xyz/blog/solana-plugins"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          Learn more
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBetConfirmation(false)}
                  className="px-4 py-2 rounded-full text-sm transition-all duration-200 border border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={createOrder}
                  className="px-4 py-2 rounded-full text-sm transition-all duration-200 text-white"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  Confirm Bet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
