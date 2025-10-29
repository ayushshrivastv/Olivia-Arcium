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
      <div className="pt-2 px-2">
        <TableHeader isNYCMayorMarket={isNYCMayorMarket} />
      </div>
      <div className="flex mt-2">
        <div className="w-1/2 pr-1">
          {asks && <NoTable asks={asks.slice(0, 50)} isNYCMayorMarket={isNYCMayorMarket} />}
        </div>
        <div className="w-1/2 pl-1">
          {bids && <YesTable bids={bids.slice(0, 50)} isNYCMayorMarket={isNYCMayorMarket} />}
        </div>
      </div>
    </div>
  );
}

function TableHeader({ isNYCMayorMarket }: { isNYCMayorMarket: boolean }) {
  if (isNYCMayorMarket) {
    const candidates = [
      { name: 'Zohran Mamdani', percentage: 88.8 },
      { name: 'Andrew Cuomo', percentage: 11.1 },
      { name: 'Curtis Sliwa', percentage: 0.8 },
      { name: 'Eric Adams', percentage: 0.5 },
    ];

    return (
      <div className="flex flex-col gap-1 pb-2">
        {candidates.map((candidate) => (
          <div key={candidate.name} className="flex justify-between text-xs text-muted-foreground">
            <span>{candidate.name}</span>
            <span>{candidate.percentage < 1 ? '<1%' : `${candidate.percentage.toFixed(1)}%`}</span>
          </div>
        ))}
        <div className="flex text-xs text-muted-foreground border-t border-border/20 pt-2 mt-1">
          <div className="w-1/3 text-left">No</div>
          <div className="w-1/3 text-center">Yes</div>
          <div className="w-1/3 text-right">Size</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex text-xs text-muted-foreground border-b border-border/20 pb-2">
      <div className="w-1/3 text-left">No</div>
      <div className="w-1/3 text-center">Yes</div>
      <div className="w-1/3 text-right">Size</div>
    </div>
  );
}
