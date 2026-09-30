import React, { useState, useEffect, useRef } from 'react';
import { 
  Coins, 
  Zap, 
  Pause, 
  Play, 
  Calculator, 
  CheckCircle, 
  Layers,
  ArrowRight,
  Sparkles,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MicroPaymentTransaction, AgentWallet } from '../types';
import { formatSubCent, timeAgo } from '../utils/formatters';

interface MicropaymentStreamProps {
  transactions: MicroPaymentTransaction[];
  wallets: AgentWallet[];
  isStreaming: boolean;
  setIsStreaming: React.Dispatch<React.SetStateAction<boolean>>;
  streamSpeed: number;
  setStreamSpeed: (speed: number) => void;
  onEmitManualTx: () => void;
}

export const MicropaymentStream: React.FC<MicropaymentStreamProps> = ({
  transactions,
  wallets,
  isStreaming,
  setIsStreaming,
  streamSpeed,
  setStreamSpeed,
  onEmitManualTx,
}) => {
  const [selectedTx, setSelectedTx] = useState<MicroPaymentTransaction | null>(transactions[0] || null);
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  
  // Animation & tangible settlement feedback state
  const prevTxIdRef = useRef<string | null>(transactions[0]?.id || null);
  const [latestSettledId, setLatestSettledId] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [settledCount, setSettledCount] = useState<number>(() => Math.max(14820, transactions.length * 370));
  const [latestSettledTx, setLatestSettledTx] = useState<MicroPaymentTransaction | null>(null);

  useEffect(() => {
    if (transactions.length > 0 && transactions[0].id !== prevTxIdRef.current) {
      const newTx = transactions[0];
      prevTxIdRef.current = newTx.id;
      setLatestSettledId(newTx.id);
      setLatestSettledTx(newTx);
      setIsFlashing(true);
      setSettledCount(prev => prev + 1);

      const timer = setTimeout(() => {
        setIsFlashing(false);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [transactions]);

  // Calculator state
  const [tokenCount, setTokenCount] = useState<number>(45000);
  const [ratePer1k, setRatePer1k] = useState<number>(0.00015); // $0.00015 per 1k tokens

  const filteredTxs = transactions.filter(tx => {
    if (serviceFilter === 'all') return true;
    return tx.serviceCategory.toLowerCase().includes(serviceFilter.toLowerCase());
  });

  const totalCalculatedCost = (tokenCount / 1000) * ratePer1k;
  const simulatedMicroTxCount = Math.max(1, Math.round(tokenCount / 1500));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Sub-Cent Micropayment Stream</h1>
            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono text-xs font-semibold">
              Fractional-Cent Settlement
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            High-frequency settlement layer engineered for machine-to-machine value transfers at fractional cents ($0.0001 – $0.01) per API call, token inference, and vector search with zero gas overhead.
          </p>
        </div>

        {/* Stream Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            {[1, 5, 20].map((spd) => (
              <button
                key={spd}
                onClick={() => setStreamSpeed(spd)}
                className={`px-2 py-1 rounded transition-colors ${
                  streamSpeed === spd 
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsStreaming(!isStreaming)}
            id="micropayment-stream-toggle-btn"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              isStreaming
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Stream</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume Stream</span>
              </>
            )}
          </button>

          <button
            onClick={onEmitManualTx}
            id="micropayment-emit-tx-btn"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 cursor-pointer ${
              isFlashing 
                ? 'bg-emerald-600 text-white border border-emerald-400 shadow-md shadow-emerald-500/20' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 transition-colors ${isFlashing ? 'text-white' : 'text-cyan-400'}`} />
            <span>Emit Micro-Tx</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border transition-all duration-500 relative overflow-hidden ${
          isFlashing
            ? 'bg-emerald-950/40 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.18)] ring-1 ring-emerald-500/30'
            : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Settled Packets Count</span>
            <span className={`w-2 h-2 rounded-full transition-all duration-300 ${
              isFlashing 
                ? 'bg-emerald-400 shadow-[0_0_10px_#34d399] scale-125' 
                : 'bg-slate-600'
            }`} />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-0.5 flex items-center gap-1.5">
            <motion.span
              key={settledCount}
              initial={{ scale: 1.25, color: '#34d399', y: -2 }}
              animate={{ scale: 1, color: isFlashing ? '#34d399' : '#ffffff', y: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 20 }}
              className="inline-block"
            >
              {settledCount.toLocaleString()}
            </motion.span>
            <AnimatePresence>
              {isFlashing && (
                <motion.span
                  initial={{ opacity: 0, y: 3, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -3, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="text-[10px] text-emerald-400 font-mono font-bold px-1 py-0.2 rounded bg-emerald-500/20 border border-emerald-500/40"
                >
                  +1
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
            <CheckCircle className="w-3 h-3" />
            <span>14,820 TPS State Channels</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Avg Gas Overhead</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
            $0.000003
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Compressed in zk-Rollup batch
          </div>
        </div>

        <div className={`p-4 rounded-xl border transition-all duration-300 ${
          isFlashing ? 'bg-slate-900/80 border-cyan-500/40' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <div className="text-xs text-slate-400">Avg Settlement Latency</div>
          <div className="text-xl font-bold font-mono text-white mt-0.5 flex items-center gap-1.5">
            <span>{latestSettledTx?.latencyMs || 12.8} ms</span>
            {isFlashing && (
              <span className="text-[10px] text-cyan-400 font-mono font-semibold">
                p99 &lt; 20ms
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Zero-wait instant finality
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Min Settled Amount</div>
          <div className="text-xl font-bold font-mono text-blue-400 mt-0.5">
            $0.000042
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Sub-cent economically viable
          </div>
        </div>
      </div>

      {/* Live Stream Table (Left) + Interactive Token Cost Calculator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Live Stream Feed */}
        <div className="lg:col-span-8 rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">Live Settlement Log</h2>
              {isStreaming && (
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full transition-colors ${
                    isFlashing ? 'bg-emerald-400 opacity-90' : 'bg-cyan-400 opacity-75'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 transition-colors ${
                    isFlashing ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-cyan-400'
                  }`} />
                </span>
              )}
              {/* Settlement Flash indicator badge */}
              <AnimatePresence>
                {isFlashing && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8, x: -6 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: 6 }}
                    transition={{ duration: 0.2 }}
                    className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                  >
                    <Zap className="w-2.5 h-2.5 fill-current text-emerald-400" />
                    <span>NEW SETTLEMENT</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Service Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {['all', 'token', 'scraping', 'vector', 'arbitrage'].map((srv) => (
                <button
                  key={srv}
                  onClick={() => setServiceFilter(srv)}
                  className={`px-2 py-1 rounded text-[11px] capitalize transition-colors ${
                    serviceFilter === srv
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-950/60'
                  }`}
                >
                  {srv}
                </button>
              ))}
            </div>
          </div>

          {/* Subtle Flash Notification Banner on New Settlement */}
          <AnimatePresence>
            {isFlashing && latestSettledTx && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.18)]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <span className="text-emerald-200 font-semibold truncate">
                      State Channel Closed: <span className="text-emerald-400 font-bold">{latestSettledTx.id}</span>
                    </span>
                    <span className="text-emerald-300/90 font-mono">• {formatSubCent(latestSettledTx.amount)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 shrink-0 font-medium">
                    <Zap className="w-3 h-3 fill-current" />
                    <span>{latestSettledTx.latencyMs}ms confirmation</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transactions List */}
          <div className="overflow-y-auto max-h-96 divide-y divide-slate-800/80 pr-1 space-y-1">
            {filteredTxs.slice(0, 15).map((tx, idx) => {
              const fromW = wallets.find(w => w.id === tx.fromAgentId);
              const toW = wallets.find(w => w.id === tx.toAgentId);
              const isSelected = selectedTx?.id === tx.id;
              const isLatestSettled = tx.id === latestSettledId && isFlashing;

              return (
                <motion.div
                  key={tx.id}
                  initial={idx === 0 && isLatestSettled ? { scale: 0.98, opacity: 0 } : false}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setSelectedTx(tx)}
                  className={`py-3 px-3 rounded-lg flex items-center justify-between gap-3 transition-all duration-300 cursor-pointer border ${
                    isLatestSettled
                      ? 'bg-emerald-950/50 border-emerald-500/60 shadow-[0_0_18px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/40'
                      : isSelected 
                        ? 'bg-slate-800/90 border-cyan-500/40' 
                        : 'border-transparent hover:bg-slate-800/40'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-xs font-semibold ${isLatestSettled ? 'text-emerald-300' : 'text-cyan-400'}`}>
                        {tx.id}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 text-[10px] font-mono">
                        {tx.serviceCategory}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">{tx.units}</span>
                      {isLatestSettled && (
                        <motion.span
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-mono border border-emerald-500/40 flex items-center gap-0.5 font-bold animate-pulse"
                        >
                          <Zap className="w-2.5 h-2.5 fill-current text-emerald-400" />
                          <span>JUST SETTLED</span>
                        </motion.span>
                      )}
                    </div>
                    <div className="text-xs text-slate-300 flex items-center gap-1.5">
                      <span>{fromW?.name || tx.fromAgentId}</span>
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                      <span>{toW?.name || tx.toAgentId}</span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className={`text-xs font-bold transition-all duration-300 ${
                      isLatestSettled 
                        ? 'text-emerald-300 scale-105 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                        : 'text-emerald-400'
                    }`}>
                      {formatSubCent(tx.amount)}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1">
                      <span className={isLatestSettled ? 'text-emerald-400 font-semibold' : ''}>
                        {tx.latencyMs}ms
                      </span>
                      <span>•</span>
                      <span>{timeAgo(tx.timestamp)}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Token Calculator & Selected Tx Cryptographic Proof */}
        <div className="lg:col-span-4 space-y-4">
          {/* Interactive Agent Token / Task Cost Estimator */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                M2M Fractional Cost Calculator
              </h3>
            </div>

            <p className="text-[11px] text-slate-400">
              Calculate exact autonomous payment splits for streaming LLM inference, embedding queries, or distributed scraping.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                  <span>Inference Workload:</span>
                  <span className="font-mono text-cyan-400 font-bold">{tokenCount.toLocaleString()} tokens</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="500000"
                  step="1000"
                  value={tokenCount}
                  onChange={(e) => setTokenCount(parseInt(e.target.value))}
                  className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                  <span>Service Unit Rate:</span>
                  <span className="font-mono text-cyan-400">${ratePer1k} / 1k</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setRatePer1k(0.00015)}
                    className={`py-1 text-[10px] font-mono rounded border ${
                      ratePer1k === 0.00015 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Flash $0.00015
                  </button>
                  <button
                    onClick={() => setRatePer1k(0.00060)}
                    className={`py-1 text-[10px] font-mono rounded border ${
                      ratePer1k === 0.00060 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Pro $0.00060
                  </button>
                  <button
                    onClick={() => setRatePer1k(0.00240)}
                    className={`py-1 text-[10px] font-mono rounded border ${
                      ratePer1k === 0.00240 ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    Ultra $0.0024
                  </button>
                </div>
              </div>

              {/* Calculated Result Box */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total Settlement Value:</span>
                  <span className="text-emerald-400 font-mono font-bold text-sm">
                    {formatSubCent(totalCalculatedCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Micro-transactions:</span>
                  <span>{simulatedMicroTxCount} stream packets</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Estimated L2 Fee:</span>
                  <span className="text-cyan-400">$0.000002</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Tx Cryptographic Details */}
          {selectedTx && (
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between font-sans">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white text-xs">State-Channel Proof</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                  VERIFIED
                </span>
              </div>

              <div className="space-y-1 text-[11px] text-slate-400">
                <div>
                  <span className="text-slate-500">Channel ID: </span>
                  <span className="text-slate-200">{selectedTx.stateChannelId}</span>
                </div>
                <div>
                  <span className="text-slate-500">Rollup Batch: </span>
                  <span className="text-cyan-400">{selectedTx.batchRollupId}</span>
                </div>
                <div>
                  <span className="text-slate-500">Ed25519 Sig: </span>
                  <div className="truncate text-slate-300 bg-slate-950 p-1.5 rounded mt-0.5 border border-slate-800">
                    {selectedTx.signature}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
