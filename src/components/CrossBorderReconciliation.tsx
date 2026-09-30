import React, { useState } from 'react';
import { 
  Globe2, 
  ArrowRightLeft, 
  Zap, 
  CheckCircle2, 
  Layers, 
  FileCheck,
  TrendingDown
} from 'lucide-react';
import { CrossBorderCorridor } from '../types';
import { formatCurrency } from '../utils/formatters';

interface CrossBorderReconciliationProps {
  corridors: CrossBorderCorridor[];
}

export const CrossBorderReconciliation: React.FC<CrossBorderReconciliationProps> = ({
  corridors,
}) => {
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>(corridors[0]?.id || '');
  const [isNetting, setIsNetting] = useState<boolean>(false);
  const [lastNettingReceipt, setLastNettingReceipt] = useState<{
    timestamp: string;
    grossVolume: number;
    netSettled: number;
    savingsPct: number;
    batchHash: string;
  } | null>({
    timestamp: '2 mins ago',
    grossVolume: 14850000,
    netSettled: 840000,
    savingsPct: 94.3,
    batchHash: '0x8f190e241bc490aa1848bc0241a77e1b994801ac',
  });

  const selectedCorridor = corridors.find(c => c.id === selectedCorridorId) || corridors[0];

  const handleExecuteNetting = () => {
    setIsNetting(true);
    setTimeout(() => {
      setLastNettingReceipt({
        timestamp: 'Just now',
        grossVolume: 18420000 + Math.floor(Math.random() * 500000),
        netSettled: 920000 + Math.floor(Math.random() * 50000),
        savingsPct: 95.0,
        batchHash: '0x' + Math.random().toString(16).substring(2, 10) + '99c488ef1092a40b17849c',
      });
      setIsNetting(false);
    }, 1000);
  };

  const totalDailyVolume = corridors.reduce((acc, curr) => acc + curr.dailyVolume, 0);
  const totalActiveLiquidity = corridors.reduce((acc, curr) => acc + curr.activeLiquidity, 0);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Cross-Border Reconciliation & FX Rails</h1>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono text-xs font-semibold">
              Instant Global Netting
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Automated multi-currency reconciliation that facilitates instant, low-cost settlements across global markets. Continuous multilateral netting compresses circular obligations to reduce liquidity lockup by &gt;94%.
          </p>
        </div>

        <button
          onClick={handleExecuteNetting}
          id="crossborder-run-netting-btn"
          disabled={isNetting}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all shrink-0 cursor-pointer"
        >
          <ArrowRightLeft className={`w-4 h-4 ${isNetting ? 'animate-spin' : ''}`} />
          <span>{isNetting ? 'Netting Global Ledgers...' : 'Execute Multilateral Netting'}</span>
        </button>
      </div>

      {/* Corridor Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Total 24H Global FX Flow</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {formatCurrency(totalDailyVolume)}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Avg Spread: 0.8 bps</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Deep Liquidity Reserve Pools</div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {formatCurrency(totalActiveLiquidity)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Direct high-frequency market makers
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Netting Liquidity Compression</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            94.8% <span className="text-xs font-sans font-normal text-slate-400">Capital Saved</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Zero-human batch reconciliation
          </div>
        </div>
      </div>

      {/* Multilateral Netting Visualizer & Corridor Hubs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Global Hub Corridors List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider px-1">
            Active Currency Corridors
          </div>

          <div className="space-y-2.5">
            {corridors.map((c) => {
              const isSelected = c.id === selectedCorridorId;
              return (
                <div
                  key={c.id}
                  id={`corridor-card-${c.id}`}
                  onClick={() => setSelectedCorridorId(c.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                        <Globe2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {c.fromHub.split(' ')[0]} ⇄ {c.toHub.split(' ')[0]}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-emerald-400">
                        1 {c.fromCurrency} = {c.fxRate} {c.toCurrency}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Spread: {c.spreadBps} bps
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Latency: <strong className="text-cyan-400">{c.settlementLatencyMs} ms</strong></span>
                    <span>24h Vol: <strong className="text-slate-200">{formatCurrency(c.dailyVolume)}</strong></span>
                    <span className="text-amber-400 font-semibold">{c.nettedSavingsPct}% Saved</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Multilateral Netting Engine & Cryptographic Receipt */}
        <div className="lg:col-span-7 space-y-4">
          {/* Netting Engine Card */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Multilateral Netting Engine</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                REAL-TIME CLEARING
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Rather than executing individual bilateral cross-border wires for each of the 500,000 daily agent transactions, Paymind computes circular obligations between international liquidity pools and settles only the residual delta.
            </p>

            {/* Visual Comparison: Gross vs Net */}
            {lastNettingReceipt && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="space-y-1">
                  <div className="text-xs text-slate-400">Gross M2M Settlement Obligations:</div>
                  <div className="text-lg font-bold font-mono text-rose-400 line-through decoration-rose-500">
                    {formatCurrency(lastNettingReceipt.grossVolume)}
                  </div>
                  <div className="text-[10px] text-slate-500">500,000+ atomic agent transfers</div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-400">Compressed Net Required Capital:</div>
                  <div className="text-lg font-bold font-mono text-emerald-400">
                    {formatCurrency(lastNettingReceipt.netSettled)}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-medium">
                    {lastNettingReceipt.savingsPct}% Liquidity Freed
                  </div>
                </div>
              </div>
            )}

            {/* Hub Topology Nodes */}
            <div className="space-y-2 pt-1">
              <div className="text-xs font-semibold text-slate-200">
                Connected Cross-Border Clearing Nodes
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { hub: 'New York', code: 'NY4', curr: 'USD', ping: '12ms' },
                  { hub: 'Tokyo', code: 'TY3', curr: 'JPY', ping: '14ms' },
                  { hub: 'Frankfurt', code: 'FR2', curr: 'EUR', ping: '18ms' },
                  { hub: 'Singapore', code: 'SG1', curr: 'SGD', ping: '22ms' },
                ].map((node, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 font-mono text-xs">
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span>{node.code}</span>
                      <span className="text-emerald-400">{node.ping}</span>
                    </div>
                    <div className="font-bold text-white font-sans text-xs mt-0.5">{node.hub}</div>
                    <div className="text-[10px] text-cyan-400">{node.curr} Clearing</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cryptographic Netting Receipt */}
            {lastNettingReceipt && (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Cryptographic Netting Settlement Receipt</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{lastNettingReceipt.timestamp}</span>
                </div>
                <div className="font-mono text-[11px] text-slate-400 truncate bg-slate-900 p-2 rounded border border-slate-800/80">
                  <span className="text-slate-500">Batch Proof: </span>
                  <span className="text-slate-200">{lastNettingReceipt.batchHash}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified across Federal Reserve Fedwire, ECB Target2 & Bank of Japan BoJ-Net interfaces</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
