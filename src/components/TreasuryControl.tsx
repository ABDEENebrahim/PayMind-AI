import React, { useState } from 'react';
import { 
  Vault, 
  ShieldAlert, 
  Percent, 
  RefreshCw, 
  CheckCircle2, 
  Lock, 
  Coins, 
  ArrowUpRight,
  TrendingUp,
  Sliders
} from 'lucide-react';
import { TreasuryPool, AgentWallet } from '../types';
import { formatCurrency } from '../utils/formatters';

interface TreasuryControlProps {
  pools: TreasuryPool[];
  wallets: AgentWallet[];
  onUpdatePool: (updated: TreasuryPool) => void;
}

export const TreasuryControl: React.FC<TreasuryControlProps> = ({
  pools,
  wallets,
  onUpdatePool,
}) => {
  const [selectedPoolId, setSelectedPoolId] = useState<string>(pools[0]?.id || '');
  const [isRebalancing, setIsRebalancing] = useState<boolean>(false);
  const [activeStrategy, setActiveStrategy] = useState<'dynamic' | 'overnight' | 'conservative'>('dynamic');

  const selectedPool = pools.find(p => p.id === selectedPoolId) || pools[0];

  const handleRunRebalance = () => {
    setIsRebalancing(true);
    setTimeout(() => {
      if (selectedPool) {
        onUpdatePool({
          ...selectedPool,
          healthFactor: 99.9,
          activeYieldingReserve: selectedPool.activeYieldingReserve + 250000,
        });
      }
      setIsRebalancing(false);
    }, 800);
  };

  const totalTreasury = pools.reduce((acc, curr) => acc + curr.totalLiquidity, 0);
  const totalIdleYielding = pools.reduce((acc, curr) => acc + curr.activeYieldingReserve, 0);
  const totalRiskBuffer = pools.reduce((acc, curr) => acc + curr.counterpartyRiskBuffer, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Enterprise Treasury & Counterparty Risk</h1>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono text-xs font-semibold">
              Programmable Liquidity
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Direct institutional control over treasury workflows, deep liquidity reserves, automated yield sweeps for idle agent balances, and real-time counterparty risk mitigation.
          </p>
        </div>

        <button
          onClick={handleRunRebalance}
          id="treasury-rebalance-btn"
          disabled={isRebalancing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-cyan-500/20 transition-all shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isRebalancing ? 'animate-spin' : ''}`} />
          <span>{isRebalancing ? 'Rebalancing Pools...' : 'Optimize Yield & Liquidity'}</span>
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Total Enterprise Treasury</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {formatCurrency(totalTreasury)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Backing 500,000+ daily M2M transactions
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Automated Yield Sweeper Reserve</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {formatCurrency(totalIdleYielding)}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Blended APY: 4.95% (Risk-Free)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400">Counterparty Risk Buffer</div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {formatCurrency(totalRiskBuffer)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Zero enterprise default history
          </div>
        </div>
      </div>

      {/* Main Grid: Treasury Reserve Pools (Left) + Counterparty Risk & Compliance (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Liquidity Pools */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Vault className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">Programmable Liquidity Pools</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Auto-Rebalancing Active
            </span>
          </div>

          <div className="space-y-3">
            {pools.map((pool) => {
              const isSelected = pool.id === selectedPoolId;
              const reserveRatio = (pool.agentReserved / pool.totalLiquidity) * 100;
              const yieldRatio = (pool.activeYieldingReserve / pool.totalLiquidity) * 100;

              return (
                <div
                  key={pool.id}
                  id={`pool-card-${pool.id}`}
                  onClick={() => setSelectedPoolId(pool.id)}
                  className={`p-5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold font-mono text-xs">
                        {pool.asset}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {pool.asset} Treasury Pool
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          Strategy: {pool.strategy}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-base font-bold text-white">
                        {formatCurrency(pool.totalLiquidity, pool.asset)}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-bold">
                        {pool.currentApy}% APY
                      </div>
                    </div>
                  </div>

                  {/* Dual Bar: Instant Clearing vs Yield Sweep */}
                  <div className="mt-3 pt-2 border-t border-slate-800/60 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Instant Agent Liquidity: {reserveRatio.toFixed(1)}%</span>
                      <span className="text-emerald-400">Yield Swept: {yieldRatio.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden flex">
                      <div className="h-full bg-cyan-500" style={{ width: `${reserveRatio}%` }} />
                      <div className="h-full bg-emerald-500" style={{ width: `${yieldRatio}%` }} />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Risk Buffer: {formatCurrency(pool.counterpartyRiskBuffer, pool.asset)}</span>
                    <span className="text-emerald-400 font-semibold">Health: {pool.healthFactor}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Counterparty Risk Assessment & Compliance */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Counterparty Risk Scoring & SLA Matrix</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                ZERO-TRUST
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Autonomous agents build a machine-verifiable on-chain credit score. Agents with high SLA fulfillment unlock zero-collateral micro-credit; abnormal velocity triggers automatic isolation.
            </p>

            {/* Agent SLA Reputation Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-2">Agent Name</th>
                    <th className="pb-2">Role</th>
                    <th className="pb-2 text-right">Reputation</th>
                    <th className="pb-2 text-right">Risk Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {wallets.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-800/40">
                      <td className="py-2.5 font-semibold text-white font-sans">{w.name}</td>
                      <td className="py-2.5 text-slate-400 text-[11px]">{w.role}</td>
                      <td className="py-2.5 text-right text-emerald-400 font-bold">{w.reputationScore}%</td>
                      <td className="py-2.5 text-right">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px]">
                          Tier 1 (Prime)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Seamless Compliance & Machine Travel Rule */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Machine-to-Machine Travel Rule & Sanctions Screener</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400">Continuous 24/7</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Transactions automatically embed cryptographic proof of originator and beneficiary agent DID credentials, complying with global AML/CFT standards without introducing human-scale operational delays.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
