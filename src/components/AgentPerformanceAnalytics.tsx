import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Wallet,
  Activity,
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Filter,
  BarChart3,
  Scale,
  RefreshCw,
  Cpu,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { AgentWallet, MicroPaymentTransaction, EscrowContract } from '../types';
import { formatCurrency, truncateHash } from '../utils/formatters';

interface AgentPerformanceAnalyticsProps {
  wallets: AgentWallet[];
  recentTxs: MicroPaymentTransaction[];
  escrows?: EscrowContract[];
  onOpenCreateWallet?: () => void;
}

type TimeframeOption = '24h' | '7d' | '30d';

interface TimePointData {
  timeKey: string;
  displayLabel: string;
  inflow: number;
  outflow: number;
  netProfit: number;
  cumulativeProfit: number;
  txCount: number;
}

interface AgentProfitSummary {
  walletId: string;
  name: string;
  did: string;
  role: string;
  status: string;
  balance: number;
  inflow: number;
  outflow: number;
  netProfit: number;
  marginPct: number;
  txCount: number;
  inboundTxCount: number;
  outboundTxCount: number;
  categoryBreakdown: {
    category: string;
    inflow: number;
    outflow: number;
  }[];
}

export const AgentPerformanceAnalytics: React.FC<AgentPerformanceAnalyticsProps> = ({
  wallets,
  recentTxs,
  escrows = [],
  onOpenCreateWallet,
}) => {
  const [selectedWalletId, setSelectedWalletId] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<TimeframeOption>('24h');
  const [chartViewMode, setChartViewMode] = useState<'pnl' | 'cumulative' | 'comparison'>('pnl');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<'netProfit' | 'inflow' | 'outflow' | 'margin'>('netProfit');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  // Baseline multiplier map by agent role to provide realistic initial autonomous financial profiles
  const roleMultipliers = useMemo<Record<string, { inflowMult: number; outflowMult: number }>>(() => ({
    'Inference Buyer': { inflowMult: 0.65, outflowMult: 1.45 },
    'Scraping Worker': { inflowMult: 1.6, outflowMult: 0.45 },
    'Model Evaluator': { inflowMult: 1.85, outflowMult: 0.5 },
    'Quant Arbitrageur': { inflowMult: 2.1, outflowMult: 1.7 },
    'Data Provider': { inflowMult: 1.75, outflowMult: 0.55 },
    'Synthesis Lead': { inflowMult: 1.35, outflowMult: 0.9 },
  }), []);

  // Compute live inflows and outflows from recent streaming transactions for each wallet
  const liveTxsByWallet = useMemo(() => {
    const map = new Map<string, { inflow: number; outflow: number; inCount: number; outCount: number }>();
    wallets.forEach(w => {
      map.set(w.id, { inflow: 0, outflow: 0, inCount: 0, outCount: 0 });
    });

    recentTxs.forEach(tx => {
      const from = map.get(tx.fromAgentId);
      if (from) {
        from.outflow += tx.amount;
        from.outCount += 1;
      }
      const to = map.get(tx.toAgentId);
      if (to) {
        to.inflow += tx.amount;
        to.inCount += 1;
      }
    });

    return map;
  }, [wallets, recentTxs]);

  // Comprehensive profit summary for every wallet
  const agentSummaries = useMemo<AgentProfitSummary[]>(() => {
    return wallets.map(wallet => {
      const live = liveTxsByWallet.get(wallet.id) || { inflow: 0, outflow: 0, inCount: 0, outCount: 0 };
      const roleProfile = roleMultipliers[wallet.role] || { inflowMult: 1.0, outflowMult: 1.0 };

      // Base historical scale based on wallet's total transactions and reputation
      const baseScale = Math.max(10, wallet.totalTransactionsCount * 0.045);
      const timeframeFactor = timeframe === '24h' ? 1 : timeframe === '7d' ? 5.8 : 22.4;

      const baseInflow = Number((baseScale * roleProfile.inflowMult * timeframeFactor + live.inflow * 12).toFixed(2));
      const baseOutflow = Number((baseScale * roleProfile.outflowMult * timeframeFactor + live.outflow * 12).toFixed(2));
      const net = Number((baseInflow - baseOutflow).toFixed(2));
      const margin = baseInflow > 0 ? Number(((net / baseInflow) * 100).toFixed(1)) : 0;

      const categories = [
        { category: 'LLM Tokens', inflow: baseInflow * 0.32, outflow: baseOutflow * 0.4 },
        { category: 'Vector Retrieval', inflow: baseInflow * 0.22, outflow: baseOutflow * 0.18 },
        { category: 'Web Scraping', inflow: baseInflow * 0.24, outflow: baseOutflow * 0.15 },
        { category: 'Data Validation', inflow: baseInflow * 0.14, outflow: baseOutflow * 0.15 },
        { category: 'Arbitrage Leg', inflow: baseInflow * 0.08, outflow: baseOutflow * 0.12 },
      ];

      return {
        walletId: wallet.id,
        name: wallet.name,
        did: wallet.did,
        role: wallet.role,
        status: wallet.status,
        balance: wallet.balance,
        inflow: baseInflow,
        outflow: baseOutflow,
        netProfit: net,
        marginPct: margin,
        txCount: wallet.totalTransactionsCount + live.inCount + live.outCount,
        inboundTxCount: Math.round(wallet.totalTransactionsCount * 0.52) + live.inCount,
        outboundTxCount: Math.round(wallet.totalTransactionsCount * 0.48) + live.outCount,
        categoryBreakdown: categories,
      };
    });
  }, [wallets, liveTxsByWallet, roleMultipliers, timeframe]);

  // Aggregate Portfolio Totals
  const portfolioStats = useMemo(() => {
    let totalInflow = 0;
    let totalOutflow = 0;
    let totalNet = 0;
    let topEarner: AgentProfitSummary | null = null;
    let maxProfit = -Infinity;

    agentSummaries.forEach(agent => {
      totalInflow += agent.inflow;
      totalOutflow += agent.outflow;
      totalNet += agent.netProfit;

      if (agent.netProfit > maxProfit) {
        maxProfit = agent.netProfit;
        topEarner = agent;
      }
    });

    const netMargin = totalInflow > 0 ? (totalNet / totalInflow) * 100 : 0;
    const capitalEfficiency = totalOutflow > 0 ? (totalInflow / totalOutflow) : 1;

    return {
      totalInflow,
      totalOutflow,
      totalNet,
      netMargin,
      capitalEfficiency,
      topEarner,
    };
  }, [agentSummaries]);

  // Active wallet stats (either selected agent or aggregate portfolio)
  const activeAgentStats = useMemo(() => {
    if (selectedWalletId === 'all') {
      return {
        title: 'All Machine Wallets (Consolidated)',
        inflow: portfolioStats.totalInflow,
        outflow: portfolioStats.totalOutflow,
        netProfit: portfolioStats.totalNet,
        marginPct: portfolioStats.netMargin,
        txCount: agentSummaries.reduce((a, c) => a + c.txCount, 0),
        role: 'Autonomous Agent Fleet',
      };
    }
    const found = agentSummaries.find(a => a.walletId === selectedWalletId);
    if (!found) {
      return {
        title: 'Selected Agent',
        inflow: 0,
        outflow: 0,
        netProfit: 0,
        marginPct: 0,
        txCount: 0,
        role: 'Unknown',
      };
    }
    return {
      title: `${found.name} (${found.walletId})`,
      inflow: found.inflow,
      outflow: found.outflow,
      netProfit: found.netProfit,
      marginPct: found.marginPct,
      txCount: found.txCount,
      role: found.role,
    };
  }, [selectedWalletId, agentSummaries, portfolioStats]);

  // Time-Series generation for Recharts
  const timeSeriesData = useMemo<TimePointData[]>(() => {
    const points: TimePointData[] = [];
    const count = timeframe === '24h' ? 24 : timeframe === '7d' ? 14 : 30;
    const now = new Date();

    // Determine base hourly or daily curve profile
    const selectedAgent = selectedWalletId === 'all' 
      ? null 
      : agentSummaries.find(a => a.walletId === selectedWalletId);

    const baseInflowTotal = selectedAgent ? selectedAgent.inflow : portfolioStats.totalInflow;
    const baseOutflowTotal = selectedAgent ? selectedAgent.outflow : portfolioStats.totalOutflow;

    const avgInflowStep = baseInflowTotal / count;
    const avgOutflowStep = baseOutflowTotal / count;

    let rollingCumulative = 0;

    for (let i = count - 1; i >= 0; i--) {
      let timeLabel = '';
      let displayLabel = '';

      if (timeframe === '24h') {
        const hour = (now.getHours() - i + 24) % 24;
        timeLabel = `${hour.toString().padStart(2, '0')}:00`;
        displayLabel = i === 0 ? 'Now' : `${hour}:00`;
      } else if (timeframe === '7d') {
        const d = new Date(now.getTime() - i * 12 * 3600 * 1000);
        timeLabel = `${d.toLocaleDateString('en-US', { weekday: 'short' })} ${d.getHours() > 12 ? 'PM' : 'AM'}`;
        displayLabel = timeLabel;
      } else {
        const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
        timeLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        displayLabel = timeLabel;
      }

      // Sine fluctuation to emulate machine request bursts & micro-batching
      const burstFactor = 1 + 0.35 * Math.sin(i * 0.9) + (i % 4 === 0 ? 0.25 : -0.15);
      const outflowBurst = 1 + 0.3 * Math.cos(i * 1.1) + (i % 3 === 0 ? 0.2 : -0.1);

      // Add recent streaming tx weight to latest bucket
      const isLatest = i === 0;
      const liveBoost = isLatest ? recentTxs.length * 0.05 : 0;

      const stepInflow = Number((avgInflowStep * burstFactor + liveBoost).toFixed(2));
      const stepOutflow = Number((avgOutflowStep * outflowBurst).toFixed(2));
      const net = Number((stepInflow - stepOutflow).toFixed(2));

      rollingCumulative = Number((rollingCumulative + net).toFixed(2));

      points.push({
        timeKey: timeLabel,
        displayLabel,
        inflow: stepInflow,
        outflow: stepOutflow,
        netProfit: net,
        cumulativeProfit: rollingCumulative,
        txCount: Math.round(120 * burstFactor + 40),
      });
    }

    return points;
  }, [timeframe, selectedWalletId, agentSummaries, portfolioStats, recentTxs]);

  // Comparative data across all wallets for the cross-wallet BarChart
  const crossWalletComparisonData = useMemo(() => {
    return agentSummaries.map(a => ({
      walletId: a.walletId,
      displayName: a.name.length > 14 ? `${a.name.slice(0, 13)}…` : a.name,
      fullName: a.name,
      role: a.role,
      inflow: a.inflow,
      outflow: a.outflow,
      netProfit: a.netProfit,
      marginPct: a.marginPct,
    }));
  }, [agentSummaries]);

  // Filter and sort agent table
  const filteredAgentSummaries = useMemo(() => {
    return agentSummaries
      .filter(a => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          a.name.toLowerCase().includes(q) ||
          a.walletId.toLowerCase().includes(q) ||
          a.did.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (sortField === 'margin') {
          valA = a.marginPct;
          valB = b.marginPct;
        }
        if (sortDirection === 'desc') {
          return (valB as number) - (valA as number);
        }
        return (valA as number) - (valB as number);
      });
  }, [agentSummaries, searchQuery, sortField, sortDirection]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/95 to-emerald-950/30 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold text-white">Agent Performance & Profitability</h1>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-[11px] font-semibold flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-400" />
                Live Recharts P&L Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl">
              Inspect individual machine wallet profitability, tracking sub-cent revenue inflows vs. infrastructure outflows across time. Monitor margins, capital efficiency, and agent ROI in real time.
            </p>
          </div>

          {/* Controls: Timeframe & Wallet Selector */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            {/* Wallet Dropdown Filter */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <Wallet className="w-3.5 h-3.5 text-slate-400" />
              <select
                id="agent-performance-wallet-select"
                value={selectedWalletId}
                onChange={e => setSelectedWalletId(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs pr-1"
              >
                <option value="all" className="bg-slate-900 text-white">
                  All Wallets ({wallets.length} Agents)
                </option>
                {wallets.map(w => (
                  <option key={w.id} value={w.id} className="bg-slate-900 text-slate-200">
                    {w.name} ({w.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Timeframe Buttons */}
            <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
              {(['24h', '7d', '30d'] as TimeframeOption[]).map(t => (
                <button
                  key={t}
                  id={`timeframe-btn-${t}`}
                  onClick={() => setTimeframe(t)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    timeframe === t
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            {onOpenCreateWallet && (
              <button
                onClick={onOpenCreateWallet}
                id="analytics-new-agent-btn"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors cursor-pointer shadow-sm shadow-emerald-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>New Agent</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Profitability */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Net Profitability (P&L)</span>
            <div className={`p-1.5 rounded-lg ${activeAgentStats.netProfit >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {activeAgentStats.netProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-bold font-mono tracking-tight ${activeAgentStats.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {activeAgentStats.netProfit >= 0 ? '+' : ''}{formatCurrency(activeAgentStats.netProfit)}
            </span>
            <span className={`text-xs font-mono font-semibold ${activeAgentStats.marginPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {activeAgentStats.marginPct >= 0 ? '+' : ''}{activeAgentStats.marginPct}% margin
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Scope: {selectedWalletId === 'all' ? 'All Agents' : truncateHash(selectedWalletId, 10, 0)}</span>
            <span className="font-mono text-cyan-400">{timeframe.toUpperCase()} Window</span>
          </div>
        </div>

        {/* Gross Inflow (Revenue) */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Gross Inflow (Incoming)</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {formatCurrency(activeAgentStats.inflow)}
            </span>
            <span className="text-xs text-emerald-400 font-mono font-medium">earned</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Machine task settlements</span>
            <span className="font-mono text-emerald-400">{activeAgentStats.txCount.toLocaleString()} txs</span>
          </div>
        </div>

        {/* Gross Outflow (Expenses) */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Gross Outflow (Costs)</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {formatCurrency(activeAgentStats.outflow)}
            </span>
            <span className="text-xs text-rose-400 font-mono font-medium">spent</span>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span>Compute, vectors & gas</span>
            <span className="font-mono text-slate-300">Sub-cent rails</span>
          </div>
        </div>

        {/* Top Performer / Capital Efficiency */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium">Top Earning Machine</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base font-bold text-white truncate">
              {portfolioStats.topEarner ? portfolioStats.topEarner.name : 'N/A'}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-mono font-bold text-emerald-400">
                +{formatCurrency(portfolioStats.topEarner?.netProfit || 0)}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                ({portfolioStats.topEarner?.marginPct || 0}% margin)
              </span>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
            <span className="truncate">{portfolioStats.topEarner?.role || 'Machine agent'}</span>
            <button
              onClick={() => portfolioStats.topEarner && setSelectedWalletId(portfolioStats.topEarner.walletId)}
              id="top-earner-inspect-btn"
              className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] flex items-center gap-0.5 cursor-pointer"
            >
              <span>View</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Recharts Chart Section */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        {/* Chart Header & Mode Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                {chartViewMode === 'pnl'
                  ? 'Profit & Loss Over Time (Inflow vs. Outflow)'
                  : chartViewMode === 'cumulative'
                  ? 'Cumulative Net Retained Profit Curve'
                  : 'Cross-Wallet Inflow vs. Outflow Comparison'}
              </h2>
              {selectedWalletId !== 'all' && (
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-xs font-mono">
                  Wallet: {selectedWalletId}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {chartViewMode === 'pnl'
                ? `Green bars indicate incoming revenue; red indicates outgoing operational spend; cyan line is net margin.`
                : chartViewMode === 'cumulative'
                ? `Trajectory of retained earnings and machine equity generated across ${timeframe}.`
                : `Compare incoming vs. outgoing capital balance for all ${wallets.length} machine wallets.`}
            </p>
          </div>

          {/* Chart View Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              id="chart-mode-pnl-btn"
              onClick={() => setChartViewMode('pnl')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartViewMode === 'pnl'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Inflow vs. Outflow
            </button>
            <button
              id="chart-mode-cumulative-btn"
              onClick={() => setChartViewMode('cumulative')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartViewMode === 'cumulative'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cumulative Profit
            </button>
            <button
              id="chart-mode-comparison-btn"
              onClick={() => setChartViewMode('comparison')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartViewMode === 'comparison'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Wallets Bar
            </button>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-80 w-full pt-2">
          {chartViewMode === 'pnl' && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="inflowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="outflowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="displayLabel"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={val => `$${val}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                  formatter={(value) => {
                    if (value === 'inflow') return <span className="text-emerald-400 font-mono">Inflow (Revenue)</span>;
                    if (value === 'outflow') return <span className="text-rose-400 font-mono">Outflow (Spend)</span>;
                    if (value === 'netProfit') return <span className="text-cyan-400 font-mono">Net Profit ($)</span>;
                    return value;
                  }}
                />
                <ReferenceLine y={0} stroke="#475569" strokeDasharray="2 2" />
                <Bar dataKey="inflow" name="inflow" fill="url(#inflowGradient)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="outflow" name="outflow" fill="url(#outflowGradient)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Line
                  type="monotone"
                  dataKey="netProfit"
                  name="netProfit"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#06b6d4', stroke: '#083344', strokeWidth: 1.5 }}
                  activeDot={{ r: 6, fill: '#22d3ee', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {chartViewMode === 'cumulative' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="cumulativeProfitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="displayLabel"
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={val => `$${val}`}
                />
                <Tooltip content={<CustomCumulativeTooltip />} />
                <ReferenceLine y={0} stroke="#475569" strokeDasharray="2 2" />
                <Area
                  type="monotone"
                  dataKey="cumulativeProfit"
                  name="Cumulative Net Profit"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#cumulativeProfitGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {chartViewMode === 'comparison' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crossWalletComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="displayName"
                  stroke="#64748b"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={val => `$${val}`}
                />
                <Tooltip content={<CustomComparisonTooltip onSelectWallet={(id) => setSelectedWalletId(id)} />} />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                  formatter={(value) => {
                    if (value === 'inflow') return <span className="text-emerald-400 font-mono">Gross Inflow ($)</span>;
                    if (value === 'outflow') return <span className="text-rose-400 font-mono">Gross Outflow ($)</span>;
                    return value;
                  }}
                />
                <Bar
                  dataKey="inflow"
                  name="inflow"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                  onClick={(entry) => entry && setSelectedWalletId(entry.walletId)}
                  className="cursor-pointer hover:opacity-80"
                />
                <Bar
                  dataKey="outflow"
                  name="outflow"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                  onClick={(entry) => entry && setSelectedWalletId(entry.walletId)}
                  className="cursor-pointer hover:opacity-80"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Leaderboard Table: Per-Wallet Inflow vs. Outflow Breakdown */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white">Agent Wallet Profitability Breakdown</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Net settlement telemetry and margin ratios per wallet ID. Click an agent to inspect their isolated curve.
            </p>
          </div>

          {/* Search and Sort */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                id="agent-performance-search"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search wallet ID, name..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400">Sort:</span>
              <select
                id="agent-performance-sort"
                value={sortField}
                onChange={e => setSortField(e.target.value as any)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="netProfit" className="bg-slate-900">Net Profit</option>
                <option value="inflow" className="bg-slate-900">Highest Inflow</option>
                <option value="outflow" className="bg-slate-900">Highest Outflow</option>
                <option value="margin" className="bg-slate-900">Margin %</option>
              </select>
              <button
                id="agent-performance-sort-dir"
                onClick={() => setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')}
                className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer ml-1"
                title="Toggle direction"
              >
                {sortDirection === 'desc' ? '↓' : '↑'}
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3">Agent Wallet ID</th>
                <th className="py-3 px-3">Role & Status</th>
                <th className="py-3 px-3 text-right">Inflow (Revenue)</th>
                <th className="py-3 px-3 text-right">Outflow (Spend)</th>
                <th className="py-3 px-3 text-right">Net Profit</th>
                <th className="py-3 px-3 text-right">Margin %</th>
                <th className="py-3 px-3 text-center">In/Out Ratio</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAgentSummaries.map(agent => {
                const isSelected = selectedWalletId === agent.walletId;
                const totalIO = agent.inflow + agent.outflow;
                const inflowRatio = totalIO > 0 ? (agent.inflow / totalIO) * 100 : 50;

                return (
                  <tr
                    key={agent.walletId}
                    className={`transition-colors hover:bg-slate-800/40 ${
                      isSelected ? 'bg-cyan-950/20 border-l-2 border-cyan-400' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 font-mono text-xs">
                          {agent.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-white flex items-center gap-1.5">
                            <span>{agent.name}</span>
                            {isSelected && (
                              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
                                Active Focus
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                            <span>ID: {agent.walletId}</span>
                            <span>•</span>
                            <span className="text-slate-400">{truncateHash(agent.did, 12, 4)}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <div className="text-slate-300 font-medium text-[11px]">{agent.role}</div>
                        <div className="flex items-center gap-1 text-[10px] font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="text-emerald-400 capitalize">{agent.status}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-400">
                      +{formatCurrency(agent.inflow)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-semibold text-rose-400">
                      -{formatCurrency(agent.outflow)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span
                        className={`px-2 py-0.5 rounded text-xs inline-block ${
                          agent.netProfit >= 0
                            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                        }`}
                      >
                        {agent.netProfit >= 0 ? '+' : ''}{formatCurrency(agent.netProfit)}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono">
                      <span className={`font-semibold ${agent.marginPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {agent.marginPct >= 0 ? '+' : ''}{agent.marginPct}%
                      </span>
                    </td>

                    {/* Dual In/Out Ratio Mini Visual */}
                    <td className="py-3 px-3">
                      <div className="w-24 mx-auto space-y-1">
                        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden flex">
                          <div
                            style={{ width: `${inflowRatio}%` }}
                            className="bg-emerald-500 h-full transition-all"
                            title={`Inflow: ${inflowRatio.toFixed(0)}%`}
                          />
                          <div
                            style={{ width: `${100 - inflowRatio}%` }}
                            className="bg-rose-500 h-full transition-all"
                            title={`Outflow: ${(100 - inflowRatio).toFixed(0)}%`}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] font-mono text-slate-400">
                          <span className="text-emerald-400">{inflowRatio.toFixed(0)}% in</span>
                          <span className="text-rose-400">{(100 - inflowRatio).toFixed(0)}% out</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedWalletId(isSelected ? 'all' : agent.walletId)}
                        id={`inspect-agent-btn-${agent.walletId}`}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 font-bold'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                        }`}
                      >
                        {isSelected ? 'Viewing' : 'Focus Curve'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Custom Tooltips for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as TimePointData;
    return (
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-700 shadow-xl text-xs space-y-1.5 font-mono">
        <div className="font-bold text-white border-b border-slate-800 pb-1 flex items-center justify-between gap-3">
          <span>Time: {data.timeKey}</span>
          <span className="text-[10px] text-slate-400">{data.txCount} txs</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-emerald-400">
          <span>Inflow:</span>
          <span className="font-bold">+{formatCurrency(data.inflow)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-rose-400">
          <span>Outflow:</span>
          <span className="font-bold">-{formatCurrency(data.outflow)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800">
          <span className="text-slate-300 font-semibold">Net Profit:</span>
          <span className={`font-bold ${data.netProfit >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
            {data.netProfit >= 0 ? '+' : ''}{formatCurrency(data.netProfit)}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomCumulativeTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as TimePointData;
    return (
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-700 shadow-xl text-xs space-y-1.5 font-mono">
        <div className="font-bold text-white border-b border-slate-800 pb-1">
          Snapshot: {data.timeKey}
        </div>
        <div className="flex items-center justify-between gap-4 text-cyan-300">
          <span>Cumulative Net:</span>
          <span className="font-bold text-sm">
            {data.cumulativeProfit >= 0 ? '+' : ''}{formatCurrency(data.cumulativeProfit)}
          </span>
        </div>
        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
          Net retained balance from machine agent activity
        </div>
      </div>
    );
  }
  return null;
};

const CustomComparisonTooltip = ({ active, payload, onSelectWallet }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 rounded-xl bg-slate-950 border border-slate-700 shadow-xl text-xs space-y-1.5 font-mono">
        <div className="font-bold text-white border-b border-slate-800 pb-1 flex items-center justify-between gap-2">
          <span>{data.fullName}</span>
          <span className="text-[10px] text-cyan-400">{data.walletId}</span>
        </div>
        <div className="text-[10px] text-slate-400">{data.role}</div>
        <div className="flex items-center justify-between gap-4 text-emerald-400">
          <span>Total Inflow:</span>
          <span className="font-bold">+{formatCurrency(data.inflow)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-rose-400">
          <span>Total Outflow:</span>
          <span className="font-bold">-{formatCurrency(data.outflow)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-800">
          <span className="text-slate-300 font-semibold">Net Margin:</span>
          <span className={`font-bold ${data.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {data.netProfit >= 0 ? '+' : ''}{formatCurrency(data.netProfit)} ({data.marginPct}%)
          </span>
        </div>
      </div>
    );
  }
  return null;
};
