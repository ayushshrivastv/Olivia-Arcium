'use client';

import { useState, useRef, useEffect } from 'react';
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
  const [chartHeight, setChartHeight] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initialize with default ratio (2:1)
    const updateInitialHeight = () => {
      const padding = 16;
      const gap = 8;
      const availableHeight = container.clientHeight - (padding * 2) - gap;
      const initialChartHeight = (availableHeight * 2) / 3;
      setChartHeight(initialChartHeight);
    };
    
    updateInitialHeight();
    
    // Update on resize
    const resizeObserver = new ResizeObserver(updateInitialHeight);
    resizeObserver.observe(container);

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current || !container) return;

      const containerRect = container.getBoundingClientRect();
      const padding = 16; // p-4 = 16px
      const gap = 8; // gap-2 = 8px
      const y = e.clientY - containerRect.top - padding;
      
      // Calculate new heights with constraints
      const minChartHeight = 200;
      const minTableHeight = 150;
      const availableHeight = container.clientHeight - (padding * 2) - gap;
      const maxChartHeight = availableHeight - minTableHeight;
      const maxTableHeight = availableHeight - minChartHeight;

      const newChartHeight = Math.max(minChartHeight, Math.min(maxChartHeight, y));
      
      setChartHeight(newChartHeight);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    const handleMouseDown = () => {
      isResizingRef.current = true;
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    };

    const resizeHandle = resizeRef.current;
    if (resizeHandle) {
      resizeHandle.addEventListener('mousedown', handleMouseDown);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      resizeObserver.disconnect();
      if (resizeHandle) {
        resizeHandle.removeEventListener('mousedown', handleMouseDown);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

  return (
    <MainLayout showFooter={false} showSocialIcons={false}>
      <div className="flex flex-col bg-background text-foreground overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>
        <TradeHeader baseCurrency={baseCurrency} quoteCurrency={quoteCurrency} />

        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          <div ref={containerRef} className="w-full md:w-3/4 border-r border-border/20 flex flex-col p-4 min-h-0 gap-2" style={{ position: 'relative' }}>
            <div className="min-h-0 overflow-hidden" style={{ height: chartHeight ? `${chartHeight}px` : '66%', minHeight: '200px' }}>
              <ChartArea market={pair} />
            </div>
            
            {/* Resize Handle */}
            <div
              ref={resizeRef}
              className="h-2 bg-border/30 hover:bg-border/60 cursor-row-resize transition-colors relative group flex items-center justify-center"
              style={{
                marginTop: '-4px',
                marginBottom: '-4px',
                userSelect: 'none',
              }}
            >
              <div className="h-1 w-20 bg-foreground/40 rounded-full group-hover:bg-foreground/60 transition-colors" />
            </div>

            <div className="min-h-0 overflow-hidden" style={{ flex: 1, minHeight: '150px' }}>
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
