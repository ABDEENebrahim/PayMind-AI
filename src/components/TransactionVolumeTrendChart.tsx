import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Bar,
  ComposedChart,
} from 'recharts';
import { 
  TrendingUp, 
  Activity, 
  Clock, 
  ArrowUpRight, 
  DollarSign, 
  Zap, 
  Layers
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { MicroPaymentTransaction } from '../types';
import { formatCurrency } from '../utils/formatters';

interface TransactionVolumeTrendChartProps {
  recentTxs?: MicroPaymentTransaction[];
  className?: string;
}

interface HourlyDataPoint {
  hour: string;
  displayHour: string;
  volume: number;
  txCount: number;
  gasSaved: number;
  avgLatency: number;
}

export const TransactionVolumeTrendChart: React.FC<TransactionVolumeTrendChartProps> = ({
  recentTxs = [],
  className = '',
}) => {
  const { isFinancialLight } = useTheme();
  const [activeMetric, setActiveMetric] = useState<'volume' | 'txCount' | 'combined'>('combined');

  // Generate deterministic 24-hour baseline trend points up to current hour
  const hourlyData = useMemo<HourlyDataPoint[]>(() => {
    const points: HourlyDataPoint[] = [];
    const now = new Date();
    const currentHour = now.getHours();

    // Baseline hourly distribution pattern typical for autonomous agent compute & data workflows
    const baselineHourlyMultipliers = [
      0.65, 0.58, 0.52, 0.49, 0.55, 0.68, 
      0.82, 1.05, 1.25, 1.40, 1.38, 1.32, 
      1.28, 1.35, 1.48, 1.55, 1.42, 1.30, 
      1.18, 1.08, 0.98, 0.88, 0.78, 0.72
    ];

    // Compute live recent tx delta for the current hour
    const liveTxSum = recentTxs.reduce((acc, tx) => acc + (tx.amount || 0), 0);
    const liveTxCount = recentTxs.length;

    for (let i = 23; i >= 0; i--) {
      const targetHourIndex = (currentHour - i + 24) % 24;
      const hourLabel = `${targetHourIndex.toString().padStart(2, '0')}:00`;
      const isLatest = i === 0;

      const multiplier = baselineHourlyMultipliers[targetHourIndex] || 1.0;
      const baseVol = 8500 * multiplier + (Math.sin(targetHourIndex * 0.8) * 1200);
      const baseTxs = Math.round(58000 * multiplier + (Math.cos(targetHourIndex * 0.5) * 8500));

      const volume = isLatest 
        ? Math.round(baseVol + liveTxSum * 15) 
        : Math.round(baseVol);

      const txCount = isLatest 
        ? baseTxs + liveTxCount * 250 
        : baseTxs;

      const gasSaved = Math.round(txCount * 0.0084 * 100) / 100;
      const avgLatency = Math.round(38 + (1 - multiplier * 0.2) * 12);

      points.push({
        hour: hourLabel,
        displayHour: i === 0 ? 'Now' : hourLabel,
        volume,
        txCount,
        gasSaved,
        avgLatency,
      });
    }

    return points;
  }, [recentTxs]);

  // Aggregate totals
  const total24hVolume = useMemo(() => {
    return hourlyData.reduce((acc, curr) => acc + curr.volume, 0);
  }, [hourlyData]);

  const total24hTxs = useMemo(() => {
    return hourlyData.reduce((acc, curr) => acc + curr.txCount, 0);
  }, [hourlyData]);

  const peakHour = useMemo(() => {
    return hourlyData.reduce((max, curr) => (curr.volume > max.volume ? curr : max), hourlyData[0]);
  }, [hourlyData]);

  const total24hGasSaved = useMemo(() => {
    return hourlyData.reduce((acc, curr) => acc + curr.gasSaved, 0);
  }, [hourlyData]);

  return (
    <div className={`rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-6 ${className}`}>
      {/* Header & Quick Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  24-Hour Liquidity Movement & Transaction Volume
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-semibold border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live 24h Rolling Window
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Hourly transaction volume, M2M micropayment frequency, and network settlement throughput.
              </p>
            </div>
          </div>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800 self-start lg:self-auto">
          <button
            id="trend-chart-metric-combined"
            onClick={() => setActiveMetric('combined')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeMetric === 'combined'
                ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Volume & Txs
          </button>
          <button
            id="trend-chart-metric-volume"
            onClick={() => setActiveMetric('volume')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeMetric === 'volume'
                ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Volume ($)
          </button>
          <button
            id="trend-chart-metric-txcount"
            onClick={() => setActiveMetric('txCount')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeMetric === 'txCount'
                ? 'bg-slate-800 text-cyan-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tx Frequency
          </button>
        </div>
      </div>

      {/* 24h Vital Telemetry Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>24h Total Volume</span>
            <DollarSign className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
            ${(total24hVolume / 1000).toFixed(1)}k
          </div>
          <div className="text-[11px] text-emerald-400 font-mono mt-0.5 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            <span>+16.4% vs prev day</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>24h M2M Micro-Txs</span>
            <Activity className="w-3 h-3 text-blue-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-white mt-1">
            {(total24hTxs / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            Avg {(total24hTxs / 24 / 3600).toFixed(0)} tx/sec
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Peak Hour Velocity</span>
            <Clock className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-amber-300 mt-1">
            ${(peakHour.volume / 1000).toFixed(1)}k <span className="text-xs font-normal text-slate-400 font-sans">/ hr</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            Recorded at {peakHour.hour}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90">
          <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>Rollup Gas Saved</span>
            <Zap className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-1">
            ${total24hGasSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            Zero fee state channels
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={hourlyData}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="txGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={isFinancialLight ? '#cbd5e1' : '#1e293b'} 
              vertical={false} 
            />

            <XAxis
              dataKey="displayHour"
              stroke={isFinancialLight ? '#475569' : '#64748b'}
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: isFinancialLight ? '#94a3b8' : '#334155' }}
              interval={2}
            />

            <YAxis
              yAxisId="left"
              stroke={isFinancialLight ? '#475569' : '#64748b'}
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              domain={[0, 'auto']}
            />

            {(activeMetric === 'txCount' || activeMetric === 'combined') && (
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke={isFinancialLight ? '#475569' : '#64748b'}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                domain={[0, 'auto']}
              />
            )}

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length > 0) {
                  const data = payload[0].payload as HourlyDataPoint;
                  return (
                    <div className={`p-3 rounded-xl border shadow-xl text-xs space-y-1.5 font-mono ${
                      isFinancialLight 
                        ? 'bg-white border-slate-300 text-slate-800' 
                        : 'bg-slate-950 border-slate-700 text-slate-200'
                    }`}>
                      <div className={`font-bold border-b pb-1 flex items-center justify-between gap-4 font-sans ${
                        isFinancialLight ? 'text-slate-900 border-slate-200' : 'text-slate-300 border-slate-800'
                      }`}>
                        <span>Hour: {data.hour}</span>
                        <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">
                          {data.avgLatency}ms latency
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-cyan-700 dark:text-cyan-300">
                        <span className={isFinancialLight ? 'text-slate-500' : 'text-slate-400'}>Volume:</span>
                        <span className="font-bold">${data.volume.toLocaleString()} USD</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 text-blue-700 dark:text-blue-300">
                        <span className={isFinancialLight ? 'text-slate-500' : 'text-slate-400'}>Transactions:</span>
                        <span>{data.txCount.toLocaleString()} txs</span>
                      </div>
                      <div className={`flex items-center justify-between gap-4 text-emerald-700 dark:text-emerald-400 text-[11px] pt-1 border-t ${
                        isFinancialLight ? 'border-slate-200' : 'border-slate-800/80'
                      }`}>
                        <span className={isFinancialLight ? 'text-slate-500' : 'text-slate-500'}>Gas Saved:</span>
                        <span>${data.gasSaved.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Render selected series */}
            {(activeMetric === 'volume' || activeMetric === 'combined') && (
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="volume"
                name="Volume ($)"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#volumeGradient)"
                activeDot={{ r: 5, fill: '#06b6d4', stroke: '#ffffff', strokeWidth: 1.5 }}
              />
            )}

            {activeMetric === 'txCount' && (
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="txCount"
                name="Transactions"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#txGradient)"
                activeDot={{ r: 5, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 1.5 }}
              />
            )}

            {activeMetric === 'combined' && (
              <Bar
                yAxisId="right"
                dataKey="txCount"
                name="Transactions"
                fill="#3b82f6"
                opacity={0.35}
                radius={[3, 3, 0, 0]}
                maxBarSize={14}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer with Legibility & State Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-3 border-t border-slate-800/70 font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span className="text-slate-300">Cyan: Settlement Volume ($)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500/60" />
            <span className="text-slate-300">Blue: Machine Tx Velocity</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>High-frequency rollup aggregation • Updated in real-time</span>
        </div>
      </div>
    </div>
  );
};
