/**
 * Olivia: Decentralised Permissionless Predicition Market 
 * Copyright (c) 2025 Ayush Srivastava
 *
 * Licensed under the Apache 2.0
 */

import {
  LineSeries,
  ColorType,
  createChart as createLightWeightChart,
  CrosshairMode,
  ISeriesApi,
  UTCTimestamp,
  IChartApi,
} from 'lightweight-charts';

interface CandidateData {
  name: string;
  percentage: number;
  color: string;
}

export class MultiLineChartManager {
  private candidateSeries: Map<string, ISeriesApi<'Line'>>;
  private chart: IChartApi | null;
  private isDisposed: boolean = false;
  private candidates: CandidateData[];

  constructor(
    ref: HTMLDivElement,
    candidates: CandidateData[],
    layout: { background: string; color: string }
  ) {
    this.candidates = candidates;
    this.candidateSeries = new Map();

    const chart = createLightWeightChart(ref, {
      autoSize: true,
      overlayPriceScales: {
        ticksVisible: true,
        borderVisible: false,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: 'rgba(224, 224, 224, 0.5)',
          style: 2, // dashed
        },
        horzLine: {
          width: 1,
          color: 'rgba(224, 224, 224, 0.5)',
          style: 2, // dashed
        },
      },
      rightPriceScale: {
        visible: true,
        borderVisible: false,
        ticksVisible: true,
        entireTextOnly: true,
      },
      leftPriceScale: {
        visible: false,
      },
      timeScale: {
        borderVisible: false,
        tickMarkFormatter: (time: UTCTimestamp) => {
          const date = new Date(time * 1000);
          return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          });
        },
      },
      grid: {
        horzLines: {
          color: 'rgba(197, 203, 206, 0.1)',
          visible: true,
        },
        vertLines: {
          color: 'rgba(197, 203, 206, 0.1)',
          visible: true,
        },
      },
      layout: {
        background: {
          type: ColorType.Solid,
          color: layout.background,
        },
        textColor: 'rgba(255, 255, 255, 0.7)',
        fontSize: 12,
      },
    });
    this.chart = chart;

    // Create a line series for each candidate
    candidates.forEach((candidate) => {
      const series = chart.addSeries(LineSeries, {
        color: candidate.color,
        lineWidth: 2,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: candidate.color,
        crosshairMarkerBackgroundColor: candidate.color,
        title: candidate.name,
      });

      series.priceScale().applyOptions({
        scaleMargins: {
          top: 0.1,
          bottom: 0.3,
        },
        borderVisible: false,
      });

      this.candidateSeries.set(candidate.name, series);
    });

    // Generate historical data matching the image: June to October (5 months)
    const now = Date.now();
    const startDate = new Date(now);
    startDate.setMonth(startDate.getMonth() - 5); // Start from June (5 months ago to get to October)
    const startTime = startDate.getTime();
    const dataPoints = 150; // More data points for smoother curves
    const timeStep = (now - startTime) / dataPoints;

    // Helper function to get value at a specific progress (0 to 1) through the timeline
    const getValueAtProgress = (name: string, progress: number, basePercentage: number): number => {
      let value: number;

      switch (name) {
        case 'Zohran Mamdani': {
          // Orange line: starts 10-15% in early June, spikes to 35% late June/early July,
          // drops to 5-10% mid-July, then rises steadily to 88.8% by October
          if (progress < 0.15) {
            // Early June: 10-15%
            value = 12 + progress * 3; // 12% to 15%
          } else if (progress < 0.25) {
            // Late June: sharp increase to 35%
            const localProgress = (progress - 0.15) / 0.1;
            value = 15 + localProgress * 20; // 15% to 35%
          } else if (progress < 0.30) {
            // Early July: peak at 35%
            value = 35;
          } else if (progress < 0.35) {
            // Mid-July: drop to 5-10%
            const localProgress = (progress - 0.30) / 0.05;
            value = 35 - localProgress * 28; // 35% to 7%
          } else {
            // Mid-July to October: steady rise to 88.8%
            const localProgress = (progress - 0.35) / 0.65;
            // Smooth curve from 7% to 88.8%
            value = 7 + localProgress * 81.8;
            // Ensure we end exactly at 88.8%
            if (progress > 0.98) {
              value = 88.8;
            }
          }
          break;
        }

        case 'Andrew Cuomo': {
          // Blue line: starts around 80% in early June, stays stable until mid-July,
          // then dramatic drop to below 10%, fluctuates 5-20%, ends at 11.1%
          if (progress < 0.35) {
            // Early June to mid-July: stable around 80%
            value = 78 + Math.sin(progress * 10) * 2; // Slight fluctuation 76-80%
          } else if (progress < 0.40) {
            // Mid-July: dramatic drop
            const localProgress = (progress - 0.35) / 0.05;
            value = 80 - localProgress * 72; // 80% to 8%
          } else {
            // After drop: fluctuates between 5-20%, ending at 11.1%
            const localProgress = (progress - 0.40) / 0.60;
            // Oscillating pattern decreasing over time
            const oscillation = 8 * Math.sin(localProgress * 15) * (1 - localProgress * 0.5);
            value = 10 + oscillation;
            // End value should be 11.1%
            if (progress > 0.98) {
              value = 11.1;
            }
          }
          break;
        }

        case 'Eric Adams': {
          // Yellow line: starts below 5% in early June, spikes to 25-30% mid-July,
          // then declines steadily, staying below 10% from late July, finishing <1%
          if (progress < 0.30) {
            // Early June to early July: low, below 5%
            value = 3 + Math.sin(progress * 8) * 1.5; // 1.5% to 4.5%
          } else if (progress < 0.40) {
            // Mid-July: spike to 25-30%
            const localProgress = (progress - 0.30) / 0.10;
            const spikeProgress = Math.sin(localProgress * Math.PI); // Smooth spike
            value = 3 + spikeProgress * 27; // 3% to 30%
          } else {
            // After spike: steady decline to <1%
            const localProgress = (progress - 0.40) / 0.60;
            value = 30 * (1 - localProgress); // Decline from 30% to near 0%
            if (value < 0.5) value = 0.5; // Minimum at 0.5%
          }
          break;
        }

        case 'Curtis Sliwa': {
          // Grey line: consistently very low, almost flat, never above a few percent
          // Slight variation around 0.5-1%
          value = 0.5 + Math.sin(progress * 20) * 0.3; // Oscillates between 0.2% and 0.8%
          break;
        }

        default:
          value = basePercentage;
      }

      return Math.max(0, Math.min(100, value));
    };

    candidates.forEach((candidate) => {
      const series = this.candidateSeries.get(candidate.name);
      if (!series) return;

      const data: { time: UTCTimestamp; value: number }[] = [];

      for (let i = 0; i <= dataPoints; i++) {
        const timestamp = Math.floor((startTime + i * timeStep) / 1000) as UTCTimestamp;
        const progress = i / dataPoints; // 0 to 1
        
        let value = getValueAtProgress(candidate.name, progress, candidate.percentage);
        
        // Add small random noise for realism (±0.3%)
        const noise = (Math.random() - 0.5) * 0.6;
        value = Math.max(0, Math.min(100, value + noise));

        data.push({ time: timestamp, value });
      }

      series.setData(data);
      
      // Configure price scale with percentage formatting
      series.priceScale().applyOptions({
        scaleMargins: {
          top: 0.1,
          bottom: 0.3,
        },
      });
    });

    // Fit content and add margin
    chart.timeScale().fitContent();
  }

  public destroy() {
    if (this.isDisposed || !this.chart) {
      return;
    }

    try {
      this.chart.remove();
      this.chart = null;
      this.candidateSeries.clear();
      this.isDisposed = true;
    } catch (error) {
      console.error('Error while destroying multi-line chart:', error);
    }
  }
}

