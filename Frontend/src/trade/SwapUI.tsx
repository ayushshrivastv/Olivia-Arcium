'use client';

import { useState, useEffect, ChangeEvent, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Button } from '@/src/ui/Button';
import { Input } from '@/src/ui/Input';
import { ArrowDownIcon } from '@/src/components/Icons';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

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
  const [orderType, setOrderType] = useState<OrderType>('BUY');
  const [orderMode, setOrderMode] = useState<OrderMode>('MKT');
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [orderResult, setOrderResult] = useState<OrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const market = `${baseCurrency.replace(/_+$/, '')}_${quoteCurrency}`;

  const sideMapping = useMemo<Record<OrderType, string>>(
    () => ({ BUY: 'Bid', SELL: 'Ask' }),
    []
  );

  const getQuote = useCallback(async (): Promise<void> => {
    if (!amount || parseFloat(amount) <= 0) return;

    setLoading(true);
    setError(null);

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
      setError(err instanceof Error ? err.message : 'Failed to get quote');
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


  const createOrder = async (): Promise<void> => {
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
      setError(err instanceof Error ? err.message : 'Failed to create order');
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

  const session = useSession();
  return (
    <>
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

      <div className="flex mb-4">
        <Button
          className={`flex-1 ${
            orderMode === 'MKT'
              ? 'bg-white text-black'
              : 'bg-card hover:bg-card/90 text-foreground'
          } rounded-l-xl rounded-r-none border border-border`}
          onClick={() => handleOrderModeChange('MKT')}
        >
          MKT
        </Button>
        <Button
          className={`flex-1 ${
            orderMode === 'LIMIT'
              ? 'bg-white text-background'
              : 'bg-card hover:bg-card/90 text-foreground'
          } rounded-r-xl rounded-l-none border border-l-0 border-border`}
          onClick={() => handleOrderModeChange('LIMIT')}
        >
          LIMIT
        </Button>
      </div>

      {orderMode === 'LIMIT' && (
        <div className="mb-4">
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

      <div className="mb-4">
        <div className="flex justify-between items-center text-sm mb-2">
          <span>Amount:</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground px-2 h-6"
              onClick={() => applyMultiplier(0.5)}
            >
              .5x
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground px-2 h-6"
              onClick={() => applyMultiplier(2)}
            >
              2x
            </Button>
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
          <Button className="bg-secondary hover:bg-secondary/90 border border-border rounded-l-none text-white">
            SOLANA
            <ArrowDownIcon className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm mb-2">
        <span>Execution</span>
        <span
          className={orderType === 'BUY' ? 'text-green-500' : 'text-red-500'}
        >
          {loading ? 'Calculating...' : `${executionCost} ${quoteCurrency}`}
        </span>
      </div>

      {error && (
        <div className="text-red-500 text-sm mb-2 p-2 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {orderResult && (
        <div className="text-green-500 text-sm mb-2 p-2 bg-green-100 rounded-md">
          Order placed successfully! ID: {orderResult.payload.order_id}
        </div>
      )}

      {session.data?.user?.email ? (
        <Button
          onClick={createOrder}
          disabled={
            loading ||
            !amount ||
            parseFloat(amount) <= 0 ||
            (orderMode === 'LIMIT' &&
              (!limitPrice || parseFloat(limitPrice) <= 0))
          }
          className={`w-full py-6 ${
            loading ||
            !amount ||
            parseFloat(amount) <= 0 ||
            (orderMode === 'LIMIT' &&
              (!limitPrice || parseFloat(limitPrice) <= 0))
              ? 'bg-secondary/50 text-muted-foreground cursor-not-allowed'
              : orderType === 'BUY'
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `${orderType} ${baseCurrency.replace(/_+$/, '')}`
          )}
        </Button>
      ) : (
        <Button
          disabled
          className="w-full py-6 bg-secondary/50 hover:bg-secondary/50 text-muted-foreground cursor-not-allowed"
        >
          Sign In to Trade
        </Button>
      )}
    </>
  );
}
