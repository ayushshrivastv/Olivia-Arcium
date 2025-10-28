import { create } from 'zustand';

type Interval = '1m' | '1h' | '1d' | '1w';
type ChartType = 'chart' | 'book' | 'depth' | 'equalizer';
type View = 'chart' | 'chat';

interface ChartState {
  market: string;
  interval: Interval;
  chartType: ChartType;
  view: View;
  setInterval: (interval: Interval) => void;
  setMarket: (market: string) => void;
  setChartType: (type: ChartType) => void;
  setView: (view: View) => void;
  toggleView: () => void;
}

export const useChartStore = create<ChartState>((set) => ({
  market: 'SOL_USDC',
  interval: '1h',
  chartType: 'chart',
  view: 'chart',
  setInterval: (interval) => set({ interval }),
  setMarket: (market) => set({ market }),
  setChartType: (chartType) => set({ chartType }),
  setView: (view) => set({ view }),
  toggleView: () =>
    set((state) => ({ view: state.view === 'chart' ? 'chat' : 'chart' })),
}));
