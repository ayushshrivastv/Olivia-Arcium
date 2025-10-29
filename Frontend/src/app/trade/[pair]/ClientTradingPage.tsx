'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
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
  const isInitializedRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initialize with default ratio (2:1)
    const updateInitialHeight = () => {
      const padding = 16;
      const resizeHandleHeight = 8; // h-2 = 8px
      const resizeHandleMargin = 8; // my-1 = 4px top + 4px bottom = 8px
      const minTableHeight = 100;
      const availableHeight = container.clientHeight - (padding * 2) - resizeHandleHeight - resizeHandleMargin;
      const calculatedHeight = (availableHeight * 2) / 3;
      const maxChartHeight = availableHeight - minTableHeight;
      // Minimum: ChartControl + chart + dates = ~320px
      const minChartHeight = 320;
      // Ensure initial height respects both min and max constraints
      const initialChartHeight = Math.max(minChartHeight, Math.min(maxChartHeight, calculatedHeight));
      if (!isInitializedRef.current) {
        setChartHeight(initialChartHeight);
        isInitializedRef.current = true;
      }
    };
    
    updateInitialHeight();
    
    // Update on resize
    const resizeObserver = new ResizeObserver(updateInitialHeight);
    resizeObserver.observe(container);

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      
      const currentContainer = containerRef.current;
      if (!currentContainer) {
        isResizingRef.current = false;
        return;
      }

      const containerRect = currentContainer.getBoundingClientRect();
      const padding = 16; // p-4 = 16px
      const resizeHandleHeight = 8; // h-2 = 8px
      const resizeHandleMargin = 8; // my-1 = 4px top + 4px bottom = 8px
      
      // Calculate mouse position relative to container top
      const mouseY = e.clientY - containerRect.top;
      const y = mouseY - padding;
      
      // Calculate new heights with constraints
      // Minimum chart height: ChartControl (~48px) + chart area (~220px) + date labels (~52px) = ~320px
      // This ensures chart and dates are fully visible
      const minChartHeight = 320;
      // Minimum table height: enough to show tabs (tabs ~48px + padding ~52px)
      const minTableHeight = 100;
      const availableHeight = currentContainer.clientHeight - (padding * 2) - resizeHandleHeight - resizeHandleMargin;
      // Maximum: expand until ChartControl is visible at top, leaving only min table height
      const maxChartHeight = availableHeight - minTableHeight;
      const minChartHeightActual = Math.min(minChartHeight, maxChartHeight);

      const newChartHeight = Math.max(minChartHeightActual, Math.min(maxChartHeight, y));
      
      setChartHeight(newChartHeight);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isResizingRef.current) {
        isResizingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    // Use capture phase to ensure we catch events early
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('mouseleave', handleMouseUp, true);

    return () => {
      resizeObserver.disconnect();
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('mouseup', handleMouseUp, true);
      document.removeEventListener('mouseleave', handleMouseUp, true);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      isResizingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MainLayout showFooter={false} showSocialIcons={false} showLogo={false}>
      {/* Arcium Logo - positioned below wallet button */}
      <div className="fixed top-28 right-10 z-50 flex items-center gap-2">
        <Image 
          src="/Arcium Icon.png" 
          alt="Arcium Icon" 
          width={32} 
          height={32}
          className="object-contain"
        />
        <Image 
          src="/Arcium logo.png" 
          alt="Arcium Logo" 
          width={120} 
          height={32}
          className="object-contain"
        />
      </div>

      <div className="flex flex-col bg-background text-foreground overflow-hidden" style={{ height: 'calc(100vh - 80px)' }}>
        <TradeHeader baseCurrency={baseCurrency} quoteCurrency={quoteCurrency} />

        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          <div ref={containerRef} className="w-full md:w-3/4 border-r border-border/20 flex flex-col p-4 min-h-0" style={{ position: 'relative' }}>
            <div className="flex-shrink-0 overflow-hidden" style={{ height: chartHeight ? `${chartHeight}px` : '66%', minHeight: '320px' }}>
              <ChartArea market={pair} />
            </div>
            
            {/* Resize Handle */}
            <div
              ref={resizeRef}
              className="h-2 bg-border/30 hover:bg-border/60 cursor-row-resize transition-colors relative group flex items-center justify-center flex-shrink-0 my-1"
              style={{
                userSelect: 'none',
                zIndex: 10,
                touchAction: 'none',
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (containerRef.current) {
                  isResizingRef.current = true;
                  document.body.style.cursor = 'row-resize';
                  document.body.style.userSelect = 'none';
                  // Force a re-render to ensure handlers are active
                  setChartHeight((prev) => prev || 400);
                }
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                if (containerRef.current) {
                  isResizingRef.current = true;
                }
              }}
            >
              <div className="h-1 w-20 bg-foreground/40 rounded-full group-hover:bg-foreground/60 transition-colors pointer-events-none" />
            </div>

            <div className="flex-1 min-h-0 overflow-hidden" style={{ minHeight: '100px' }}>
              <BottomTable market={pair} baseCurrency={baseCurrency} quoteCurrency={quoteCurrency} />
            </div>
          </div>

          <div className="w-full md:w-2/6 border-t md:border-t-0 border-border/20 flex flex-col h-full min-h-0">
            <div className="flex flex-col flex-grow h-full overflow-hidden p-4 min-h-0 gap-4">
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <SwapUI baseCurrency={baseCurrency} quoteCurrency={quoteCurrency} />
              </div>
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <Depth market={pair} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
