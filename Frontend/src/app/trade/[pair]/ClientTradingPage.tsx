'use client';

import BottomTable from '@/src/trade/BottomTable';
import ChartArea from '@/src/trade/Chart/ChartArea';
import SwapUI from '@/src/trade/SwapUI';
import TradeHeader from '@/src/trade/TradeHeader';
import Depth from '@/src/trade/Depth/Depth';
import { MainLayout } from '@/src/layout/Layout';

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
    <MainLayout showFooter={false}>
      <div className="flex flex-col bg-background text-foreground overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>
        <TradeHeader baseCurrency={baseCurrency} quoteCurrency={quoteCurrency} />

        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          <div className="w-full md:w-3/4 border-r border-border/20 flex flex-col p-4 min-h-0">
            <div className="flex-1 min-h-0">
              <ChartArea market={pair} />
            </div>
            <div className="h-1/3 min-h-0">
              <BottomTable market={pair} />
            </div>
          </div>

          <div className="w-full md:w-2/6 border-t md:border-t-0 border-border/20 flex flex-col h-full min-h-0">
            <div className="flex flex-col flex-grow h-full overflow-hidden p-4 min-h-0">
              <div className="flex-1 min-h-0">
                <SwapUI baseCurrency={baseCurrency} quoteCurrency={quoteCurrency} />
              </div>
              <div className="flex-1 min-h-0">
                <Depth market={pair} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
