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
