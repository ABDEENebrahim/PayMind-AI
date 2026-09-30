import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Scale, 
  Coins, 
  Globe2, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Play, 
  Cpu, 
  Search, 
  TrendingUp, 
  Copy, 
  Check, 
  Zap, 
  Activity, 
  Layers, 
  Clock, 
  Server,
  Box
} from 'lucide-react';
import { AgentWallet, EscrowContract, MicroPaymentTransaction, CrossBorderCorridor } from '../types';
import { formatCurrency, formatSubCent } from '../utils/formatters';
import { TransactionVolumeTrendChart } from './TransactionVolumeTrendChart';

interface OverviewDashboardProps {
  wallets: AgentWallet[];
  escrows: EscrowContract[];
  recentTxs: MicroPaymentTransaction[];
  corridors: CrossBorderCorridor[];
  setActiveTab: (tab: string) => void;
  onOpenCreateWallet: () => void;
  onOpenCreateEscrow: () => void;
  onRunSimulation: () => void;
}

interface RollupBatch {
  id: string;
  slotNumber: number;
  proposerName: string;
  proposerDid: string;
  txCount: number;
  totalVolume: number;
  gasSettled: number;
  timestampAgo: string;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  wallets,
  escrows,
  recentTxs,
  corridors,
  setActiveTab,
  onOpenCreateWallet,
  onOpenCreateEscrow,
  onRunSimulation,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live 30-second rolling TPS sparkline data (Solana Beach style)
  const [tpsHistory, setTpsHistory] = useState<number[]>([
    14400, 14750, 15190, 14900, 15420, 15150, 15600, 15220,
    15540, 15920, 15700, 15300, 15850, 16200, 15740, 16300,
    15900, 15600, 16220, 15840, 16400, 15950, 16600, 16180,
    15700, 16350, 16800, 16420, 16900, 16680
  ]);
  const [currentTps, setCurrentTps] = useState<number>(16680);
  const [currentLatency, setCurrentLatency] = useState<number>(11.8);

  // Rollup Batches (Blocks feed)
  const [batches, setBatches] = useState<RollupBatch[]>([
    {
      id: '#891,421',
      slotNumber: 891421,
      proposerName: 'Nexus Arbitrageur FX',
      proposerDid: 'did:paymind:agent:0x77c0...0192',
      txCount: 42,
      totalVolume: 0.08412,
      gasSettled: 0.000126,
      timestampAgo: '1s ago'
    },
    {
      id: '#891,420',
      slotNumber: 891420,
      proposerName: 'Atlas Research Lead',
      proposerDid: 'did:paymind:agent:0x9920...24C3',
      txCount: 38,
      totalVolume: 0.06120,
      gasSettled: 0.000114,
      timestampAgo: '3s ago'
    },
    {
      id: '#891,419',
      slotNumber: 891419,
      proposerName: 'Crawler Swarm Beta',
      proposerDid: 'did:paymind:agent:0x44A2...10aF',
      txCount: 51,
      totalVolume: 0.11450,
      gasSettled: 0.000153,
      timestampAgo: '5s ago'
    },
    {
      id: '#891,418',
      slotNumber: 891418,
      proposerName: 'Sakura Cross-Border',
      proposerDid: 'did:paymind:agent:0x12bb...0c7e',
      txCount: 29,
      totalVolume: 0.04890,
      gasSettled: 0.000087,
      timestampAgo: '8s ago'
    },
    {
      id: '#891,417',
      slotNumber: 891417,
      proposerName: 'Veritas Oracle Node',
      proposerDid: 'did:paymind:agent:0x3310...88ab',
      txCount: 44,
      totalVolume: 0.09120,
      gasSettled: 0.000132,
      timestampAgo: '11s ago'
    },
    {
      id: '#891,416',
      slotNumber: 891416,
      proposerName: 'Nexus Arbitrageur FX',
      proposerDid: 'did:paymind:agent:0x77c0...0192',
      txCount: 36,
      totalVolume: 0.05740,
      gasSettled: 0.000108,
      timestampAgo: '14s ago'
    },
    {
      id: '#891,415',
      slotNumber: 891415,
      proposerName: 'Atlas Research Lead',
      proposerDid: 'did:paymind:agent:0x9920...24C3',
      txCount: 48,
      totalVolume: 0.09820,
      gasSettled: 0.000144,
      timestampAgo: '17s ago'
    },
    {
      id: '#891,414',
      slotNumber: 891414,
      proposerName: 'Crawler Swarm Beta',
      proposerDid: 'did:paymind:agent:0x44A2...10aF',
      txCount: 33,
      totalVolume: 0.06210,
      gasSettled: 0.000099,
      timestampAgo: '20s ago'
    }
  ]);

  // Periodic TPS oscillation & real-time sparkline shift (14,000–18,000 TPS)
  useEffect(() => {
    const timer = setInterval(() => {
      const nextTps = Math.floor(14200 + Math.random() * 3600);
      setCurrentTps(nextTps);
      setTpsHistory(prev => [...prev.slice(1), nextTps]);
      setCurrentLatency(prev => {
        const delta = (Math.random() * 0.8 - 0.4);
        return Math.max(9.8, Math.min(13.2, Number((prev + delta).toFixed(1))));
      });
    }, 1200);

    return () => clearInterval(timer);
  }, []);

  const activeEscrows = escrows.filter(e => e.status === 'active_locked' || e.status === 'evaluating_proof');
  const totalEscrowLocked = activeEscrows.reduce((acc, curr) => acc + curr.amount, 0);
  const totalWalletLiquidity = wallets.reduce((acc, curr) => acc + curr.balance, 0);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Sparkline coordinates calculator
  const minTps = 13500;
  const maxTps = 18500;
  const svgWidth = 140;
  const svgHeight = 32;
  const coordsList = tpsHistory.map((val, idx) => {
    const x = (idx / (tpsHistory.length - 1)) * svgWidth;
    const normalized = Math.max(0, Math.min(1, (val - minTps) / (maxTps - minTps)));
    const y = svgHeight - normalized * (svgHeight - 4) - 2;
    return { x, y };
  });
  const points = coordsList.map(c => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const areaPoints = `${points} ${svgWidth},${svgHeight} 0,${svgHeight}`;
  const lastPoint = coordsList[coordsList.length - 1];

  return (
    <div className="space-y-5">
      {/* 1. SOLANA BEACH CLUSTER DASHBOARD HEADER: 6 Pure Telemetry Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Epoch & Slot Progress */}
        <div className="p-3.5 rounded-xl solana-card solana-glass solana-fade-up solana-fade-up-1 font-mono space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#14F195] animate-ping" />
              <span>Rollup Batch</span>
            </span>
            <span className="text-[#14F195] font-bold">#891,421</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-white tracking-tight">Epoch 612</span>
            <span className="text-xs text-[#14F195] font-semibold">88.4%</span>
          </div>
          <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#14F195] to-[#03E1FF] w-[88.4%] rounded-full" />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
            <span>Slot: 400ms</span>
            <span>84% Finalized</span>
          </div>
        </div>

        {/* Metric 2: True M2M TPS & Real-Time Sparkline */}
        <div className="p-3.5 rounded-xl solana-card solana-glass solana-fade-up solana-fade-up-2 font-mono space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>True M2M TPS</span>
            <span className="text-xs text-[#14F195] font-bold">Live</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-white tracking-tight">
              {currentTps.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400">Peak 18.2k</span>
          </div>
          {/* Live SVG Sparkline */}
          <div className="h-8 w-full overflow-hidden flex items-center justify-center">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="tpsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#14F195" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#03E1FF" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polygon points={areaPoints} fill="url(#tpsGrad)" />
              <polyline
                fill="none"
                stroke="#14F195"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
              {lastPoint && (
                <circle
                  cx={lastPoint.x}
                  cy={lastPoint.y}
                  r="2"
                  fill="#14F195"
                  className="animate-pulse"
                />
              )}
            </svg>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>30s Rolling</span>
            <span className="text-emerald-400">99.98% True</span>
          </div>
        </div>

        {/* Metric 3: 24H M2M Settlement Volume */}
        <div className="p-3.5 rounded-xl solana-card solana-glass solana-fade-up solana-fade-up-3 font-mono space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>24H M2M Volume</span>
            <span className="text-[10px] text-emerald-400 font-semibold">+14.2%</span>
          </div>
          <div className="text-lg font-bold text-white tracking-tight">
            $42.92M
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            2,894,120 txs settled
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-800/60">
            <span>Avg Tx: $0.00018</span>
            <span className="text-cyan-400">Mainnet</span>
          </div>
        </div>

        {/* Metric 4: Total Value Locked (TVL) */}
        <div className="p-3.5 rounded-xl solana-card solana-card-purple solana-glass solana-fade-up solana-fade-up-4 font-mono space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Total Escrow TVL</span>
            <Scale className="w-3.5 h-3.5 text-[#9945FF]" />
          </div>
          <div className="text-lg font-bold text-white tracking-tight">
            {formatCurrency(totalEscrowLocked)}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {activeEscrows.length} Active Contracts
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-800/60">
            <span>Treasury: {formatCurrency(totalWalletLiquidity)}</span>
          </div>
        </div>

        {/* Metric 5: Active Agent Fleet */}
        <div className="p-3.5 rounded-xl solana-card solana-glass solana-fade-up solana-fade-up-5 font-mono space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Active Agent Fleet</span>
            <Wallet className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-white tracking-tight">
            {wallets.length} DIDs
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            Autonomous Custody
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-800/60">
            <span className="text-emerald-400">100% Ed25519</span>
            <span>Zero Custody</span>
          </div>
        </div>

        {/* Metric 6: Settlement Rail Latency & SLA */}
        <div className="p-3.5 rounded-xl solana-card solana-glass solana-fade-up solana-fade-up-6 font-mono space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Rail Latency</span>
            <span className="text-[10px] text-emerald-400 font-bold">99.98% SLA</span>
          </div>
          <div className="flex items-baseline gap-1 text-lg font-bold text-[#14F195] tracking-tight">
            <span>{currentLatency.toFixed(1)}</span>
            <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            Sub-20ms Finality
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-800/60">
            <span>Jitter: ±1.4ms</span>
            <span className="text-cyan-400">State Channel</span>
          </div>
        </div>
      </div>

      {/* 2. THE ICONIC SOLANA BEACH 2-COLUMN SPLIT: Live Batches & Live Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Live Rollup Batches (Blocks) */}
        <div className="rounded-xl solana-card solana-glass solana-fade-up overflow-hidden shadow-xs flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-[#14F195]" />
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Recent Rollup Batches
              </span>
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-slate-400">
                L2 Blocks
              </span>
            </div>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Batches Table List */}
          <div className="divide-y divide-white/[0.04] text-xs font-mono overflow-x-auto">
            {batches.map((batch) => {
              const isCopied = copiedId === batch.id;
              return (
                <div
                  key={batch.id}
                  className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-800/40 transition-colors group solana-hover-glow"
                >
                  {/* Batch Slot & Copy */}
                  <div className="flex items-center gap-2 min-w-[130px]">
                    <span className="text-[#14F195] font-semibold">{batch.id}</span>
                    <button
                      onClick={() => handleCopy(batch.id, batch.id)}
                      title="Copy Batch ID"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {isCopied ? (
                        <Check className="w-3 h-3 text-[#14F195]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {/* Leader Proposer Agent */}
                  <div className="flex-1 px-3 truncate hidden sm:block">
                    <span className="text-slate-200 font-sans font-medium hover:text-cyan-300 cursor-pointer" onClick={() => setActiveTab('wallets')}>
                      {batch.proposerName}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1.5">
                      {batch.proposerDid}
                    </span>
                  </div>

                  {/* Tx Count & Gas Settled */}
                  <div className="text-right px-3 shrink-0">
                    <span className="text-slate-300">{batch.txCount} txs</span>
                    <span className="text-[10px] text-slate-500 ml-1.5 hidden md:inline">
                      (${batch.gasSettled.toFixed(6)})
                    </span>
                  </div>

                  {/* Timestamp */}
                  <div className="text-right text-[11px] text-slate-500 shrink-0 min-w-[55px]">
                    {batch.timestampAgo}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live M2M Transactions */}
        <div className="rounded-xl solana-card solana-glass solana-fade-up overflow-hidden shadow-xs flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Live M2M Transactions
              </span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#14F195] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#14F195]" />
              </span>
            </div>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Inspect Feed</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Transactions Table List */}
          <div className="divide-y divide-white/[0.04] text-xs font-mono overflow-x-auto">
            {recentTxs.slice(0, 8).map((tx) => {
              const fromWallet = wallets.find(w => w.id === tx.fromAgentId);
              const toWallet = wallets.find(w => w.id === tx.toAgentId);
              const isCopied = copiedId === tx.id;
              const shortSig = tx.signature ? `${tx.signature.slice(0, 8)}...${tx.signature.slice(-4)}` : tx.id;

              return (
                <div
                  key={tx.id}
                  className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-800/40 transition-colors group solana-hover-glow"
                >
                  {/* Signature & Copy */}
                  <div className="flex items-center gap-1.5 min-w-[125px]">
                    <span className="text-cyan-300 font-semibold">{shortSig}</span>
                    <button
                      onClick={() => handleCopy(tx.signature || tx.id, tx.id)}
                      title="Copy Signature"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {isCopied ? (
                        <Check className="w-3 h-3 text-[#14F195]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {/* Instruction / Service Tag */}
                  <div className="px-2 truncate hidden sm:block">
                    <span className="px-1.5 py-0.5 rounded bg-slate-900/90 text-slate-300 text-[10px] border border-white/[0.06]">
                      {tx.serviceCategory}
                    </span>
                  </div>

                  {/* From -> To Agents */}
                  <div className="flex-1 px-2 truncate hidden md:block text-[11px] text-slate-400 font-sans">
                    <span className="text-slate-300">{fromWallet?.name || tx.fromAgentId}</span>
                    <span className="mx-1 text-slate-600">➔</span>
                    <span className="text-slate-300">{toWallet?.name || tx.toAgentId}</span>
                  </div>

                  {/* Micro Amount */}
                  <div className="text-right px-2 font-bold text-[#14F195] shrink-0">
                    {formatSubCent(tx.amount)}
                  </div>

                  {/* Latency */}
                  <div className="text-right px-2 font-mono text-[11px] text-cyan-400 shrink-0">
                    {tx.latencyMs || 11}ms
                  </div>

                  {/* Confirmation Badge */}
                  <div className="text-right shrink-0 min-w-[65px] flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#14F195]" />
                    <span className="text-[10px] text-slate-400">Finalized</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. TRANSACTION VOLUME & THROUGHPUT CHART */}
      <div className="rounded-xl solana-card solana-glass solana-fade-up p-4 shadow-xs">
        <TransactionVolumeTrendChart />
      </div>
    </div>
  );
};
