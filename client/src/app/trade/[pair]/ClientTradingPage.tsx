'use client';

import BottomTable from '@/src/components/trade/BottomTable';
import ChartArea from '@/src/components/trade/chart/ChartArea';
import SwapUI from '@/src/components/trade/SwapUI';
import TradeHeader from '@/src/components/trade/TradeHeader';
import Depth from '@/src/components/trade/depth/Depth';

export default function ClientTradingPage({
  pair,
  baseCurrency,
  quoteCurrency,
}: {
  pair: string;
  baseCurrency: string;
  quoteCurrency: string;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <TradeHeader baseCurrency={baseCurrency} quoteCurrency={quoteCurrency} />

      <div className="flex-1 flex flex-col md:flex-row">
        <div className="w-full md:w-3/4 border-r border-border/20 flex flex-col p-4">
          <ChartArea market={pair} />
          <BottomTable market={pair} />
        </div>

        <div className="w-full md:w-2/6 border-t md:border-t-0 border-border/20 flex flex-col h-full">
          <div className="flex flex-col flex-grow h-[calc(100vh-100px)] overflow-hidden p-4">
            <SwapUI baseCurrency={baseCurrency} quoteCurrency={quoteCurrency} />

            <Depth market={pair} />
          </div>
        </div>
      </div>
    </div>
  );
}
