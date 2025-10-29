'use client';
import { useEffect, useState } from 'react';
import { getDepth } from '@/src/utils/httpClient';
import { NoTable } from './NoTable';
import { YesTable } from './YesTable';
import { SignalingManager } from '@/src/utils/SignalingManager';

export default function Depth({ market, isNYCMayorMarket = false }: { market: string; isNYCMayorMarket?: boolean }) {
  const [bids, setBids] = useState<[string, string][]>([]);
  const [asks, setAsks] = useState<[string, string][]>([]);
  const room = `depth@${market}` as const;

  useEffect(() => {
    const onDepth = (data: {
      bids: [string, string][];
      asks: [string, string][];
    }) => {
      if (data.bids && data.bids.length > 0) {
        setBids(data.bids);
      }
      if (data.asks && data.asks.length > 0) {
        setAsks(data.asks);
      }
    };

    const mgr = SignalingManager.getInstance();

    mgr.registerDepthCallback(room, onDepth);

    mgr.subscribe(room);

    getDepth(market).then((d) => {
      setBids(d.payload.bids);
      setAsks(d.payload.asks);
    });

    return () => {
      mgr.unsubscribe(room);

      mgr.deRegisterDepthCallback(room, onDepth);
    };
  }, [market, room]);

  return (
    <div className="flex flex-col w-full">
      <div className="pt-2 px-2 flex-shrink-0">
        <TableHeader isNYCMayorMarket={isNYCMayorMarket} />
      </div>
      <div className="flex mt-2 flex-1 overflow-hidden">
        <div className="w-1/2 pr-1 flex flex-col overflow-hidden">
          {asks && (
            <div className="flex-1 overflow-y-auto">
              <NoTable asks={asks.slice(0, 50)} isNYCMayorMarket={isNYCMayorMarket} />
            </div>
          )}
        </div>
        <div className="w-1/2 pl-1 flex flex-col overflow-hidden">
          {bids && (
            <div className="flex-1 overflow-y-auto">
              <YesTable bids={bids.slice(0, 50)} isNYCMayorMarket={isNYCMayorMarket} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TableHeader({ isNYCMayorMarket }: { isNYCMayorMarket: boolean }) {
  return (
    <div className="flex text-xs text-muted-foreground border-b border-border/20 pb-2">
      <div className="w-1/3 text-left">No</div>
      <div className="w-1/3 text-center">Yes</div>
      <div className="w-1/3 text-right">Size</div>
    </div>
  );
}
