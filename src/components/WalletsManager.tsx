import React, { useState } from 'react';
import { 
  Wallet, 
  Key, 
  Sliders, 
  CheckCircle, 
  AlertTriangle, 
  ExternalLink, 
  RefreshCw,
  Zap,
  Plus,
  CheckSquare,
  Square,
  Users,
  X,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Check
} from 'lucide-react';
import { AgentWallet } from '../types';
import { formatCurrency } from '../utils/formatters';

interface WalletsManagerProps {
  wallets: AgentWallet[];
  onOpenCreateWallet: () => void;
  onUpdateWallet: (updated: AgentWallet) => void;
  onBulkUpdateWallets?: (updated: AgentWallet[]) => void;
  onSimulateSpend: (agentId: string) => void;
}

export const WalletsManager: React.FC<WalletsManagerProps> = ({
  wallets,
  onOpenCreateWallet,
  onUpdateWallet,
  onBulkUpdateWallets,
  onSimulateSpend,
}) => {
  const [selectedWalletId, setSelectedWalletId] = useState<string>(wallets[0]?.id || '');
  const [depositAmount, setDepositAmount] = useState<string>('50');
  const [isDepositing, setIsDepositing] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Bulk Selection & Modification State
  const [selectedWalletIds, setSelectedWalletIds] = useState<string[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkDailyLimitInput, setBulkDailyLimitInput] = useState<string>('5000');
  const [bulkSuccessToast, setBulkSuccessToast] = useState<string | null>(null);
  const [isApplyingBulk, setIsApplyingBulk] = useState(false);

  const selectedWallet = wallets.find(w => w.id === selectedWalletId) || wallets[0];

  const handleCopy = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDeposit = () => {
    const val = parseFloat(depositAmount);
    if (isNaN(val) || val <= 0 || !selectedWallet) return;
    setIsDepositing(true);
    setTimeout(() => {
      onUpdateWallet({
        ...selectedWallet,
        balance: selectedWallet.balance + val,
      });
      setIsDepositing(false);
      setDepositAmount('50');
    }, 400);
  };

  const handleSimulateBatchSpend = (amount: number = 10) => {
    if (!selectedWallet) return;
    const newHourly = selectedWallet.spendingLimits.currentHourlySpent + amount;
    const newDaily = selectedWallet.spendingLimits.currentDailySpent + amount;
    onUpdateWallet({
      ...selectedWallet,
      balance: Math.max(0, Number((selectedWallet.balance - amount).toFixed(2))),
      spendingLimits: {
        ...selectedWallet.spendingLimits,
        currentHourlySpent: Number(newHourly.toFixed(2)),
        currentDailySpent: Number(newDaily.toFixed(2)),
      },
      totalTransactionsCount: selectedWallet.totalTransactionsCount + 1,
    });
  };

  const handleResetDailySpend = () => {
    if (!selectedWallet) return;
    onUpdateWallet({
      ...selectedWallet,
      spendingLimits: {
        ...selectedWallet.spendingLimits,
        currentDailySpent: 0,
        currentHourlySpent: 0,
      },
    });
  };

  const toggleStatus = () => {
    if (!selectedWallet) return;
    const newStatus = selectedWallet.status === 'active' ? 'quarantined' : 'active';
    onUpdateWallet({
      ...selectedWallet,
      status: newStatus,
    });
  };

  const updateLimits = (field: keyof AgentWallet['spendingLimits'], value: number | boolean) => {
    if (!selectedWallet) return;
    onUpdateWallet({
      ...selectedWallet,
      spendingLimits: {
        ...selectedWallet.spendingLimits,
        [field]: value,
      },
    });
  };

  // Bulk Selection & Modification Handlers
  const toggleWalletSelection = (walletId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedWalletIds(prev => 
      prev.includes(walletId) ? prev.filter(id => id !== walletId) : [...prev, walletId]
    );
  };

  const selectAllWallets = () => {
    if (selectedWalletIds.length === wallets.length) {
      setSelectedWalletIds([]);
    } else {
      setSelectedWalletIds(wallets.map(w => w.id));
    }
  };

  const clearSelection = () => {
    setSelectedWalletIds([]);
  };

  const handleOpenBulkModal = () => {
    if (selectedWalletIds.length === 0) {
      setSelectedWalletIds(wallets.map(w => w.id));
    }
    setIsBulkModalOpen(true);
  };

  const handleApplyBulkDailyLimit = () => {
    const newLimit = parseFloat(bulkDailyLimitInput);
    if (isNaN(newLimit) || newLimit <= 0) return;
    if (selectedWalletIds.length === 0) return;

    setIsApplyingBulk(true);
    setTimeout(() => {
      const updatedList = wallets
        .filter(w => selectedWalletIds.includes(w.id))
        .map(w => ({
          ...w,
          spendingLimits: {
            ...w.spendingLimits,
            maxPerDay: newLimit,
          }
        }));

      if (onBulkUpdateWallets) {
        onBulkUpdateWallets(updatedList);
      } else {
        updatedList.forEach(w => onUpdateWallet(w));
      }

      setIsApplyingBulk(false);
      setIsBulkModalOpen(false);
      setBulkSuccessToast(`Applied new daily spending limit of $${newLimit.toLocaleString()} to ${updatedList.length} agent wallets.`);
      setTimeout(() => setBulkSuccessToast(null), 5000);
    }, 350);
  };

  return (
    <div className="space-y-6">
      {/* Component Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Machine-Native Wallets</h1>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono text-xs font-semibold">
              Autonomous Custody
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Identity and non-custodial cryptographic permissions purpose-built for autonomous AI agents. Human owners define spending boundaries once; agents execute millions of sub-cent decisions autonomously.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleOpenBulkModal}
            id="wallets-header-bulk-modify-btn"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 font-medium text-xs sm:text-sm transition-all cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Bulk Modify Limits</span>
          </button>

          <button
            onClick={onOpenCreateWallet}
            id="wallets-create-agent-btn"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs sm:text-sm shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Deploy Agent Wallet</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner for Bulk Actions */}
      {bulkSuccessToast && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{bulkSuccessToast}</span>
          </div>
          <button
            onClick={() => setBulkSuccessToast(null)}
            className="text-emerald-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Grid: Wallets List (Left) + Detailed Programmable Controls (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Agent Wallets Selector */}
        <div className="lg:col-span-4 space-y-3">
          {/* Fleet Header & Multi-Select Toolbar */}
          <div className="flex items-center justify-between px-1 py-1 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs font-mono">
            <button
              type="button"
              id="wallets-select-all-btn"
              onClick={selectAllWallets}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer px-2 py-1"
              title={selectedWalletIds.length === wallets.length ? "Deselect All" : "Select All for Bulk Action"}
            >
              {selectedWalletIds.length === wallets.length && wallets.length > 0 ? (
                <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
              ) : selectedWalletIds.length > 0 ? (
                <div className="w-3.5 h-3.5 rounded bg-cyan-500/30 border border-cyan-400 flex items-center justify-center text-[9px] text-cyan-200 font-bold">
                  -
                </div>
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span className="font-medium text-[11px]">
                {selectedWalletIds.length > 0 
                  ? `${selectedWalletIds.length}/${wallets.length} Selected` 
                  : `Fleet (${wallets.length})`}
              </span>
            </button>

            {selectedWalletIds.length > 0 ? (
              <div className="flex items-center gap-1.5 pr-1">
                <button
                  type="button"
                  id="wallets-clear-selection-btn"
                  onClick={clearSelection}
                  className="text-[10px] text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  id="wallets-bulk-modify-btn"
                  onClick={() => setIsBulkModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[11px] font-bold transition-all cursor-pointer shadow-xs shadow-cyan-500/20"
                >
                  <Sliders className="w-3 h-3 text-slate-950" />
                  <span>Bulk Modify ({selectedWalletIds.length})</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                id="wallets-quick-bulk-btn"
                onClick={handleOpenBulkModal}
                className="text-[11px] text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1 px-2 py-0.5 cursor-pointer"
              >
                <Sliders className="w-3 h-3 text-cyan-400" />
                <span>Bulk Modify</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {wallets.map((wallet) => {
              const isSelected = wallet.id === selectedWalletId;
              const isBulkSelected = selectedWalletIds.includes(wallet.id);
              const hourlyRatio = (wallet.spendingLimits.currentHourlySpent / wallet.spendingLimits.maxPerHour) * 100;
              
              // Daily spending limit telemetry & warning thresholds
              const dailyLimit = wallet.spendingLimits.maxPerDay;
              const dailySpent = wallet.spendingLimits.currentDailySpent;
              const dailyRatio = dailyLimit > 0 ? (dailySpent / dailyLimit) * 100 : 0;
              const clampedDailyRatio = Math.min(Math.max(dailyRatio, 0), 100);
              const isDailyNearLimit = dailyRatio >= 75 && dailyRatio < 90;
              const isDailyCritical = dailyRatio >= 90;
              const isDailyExceeded = dailyRatio >= 100;
              const remainingDaily = Math.max(0, dailyLimit - dailySpent);

              const cardBorderClass = isSelected
                ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                : isBulkSelected
                ? 'bg-slate-800/60 border-cyan-500/60 ring-1 ring-cyan-500/30'
                : isDailyCritical || isDailyExceeded
                ? 'bg-slate-900/80 border-rose-500/50 hover:bg-slate-800/60 shadow-sm shadow-rose-500/10'
                : isDailyNearLimit
                ? 'bg-slate-900/80 border-amber-500/40 hover:bg-slate-800/60'
                : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700';

              return (
                <div
                  key={wallet.id}
                  id={`wallet-card-${wallet.id}`}
                  onClick={() => setSelectedWalletId(wallet.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${cardBorderClass}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {/* Bulk Selection Checkbox */}
                      <button
                        type="button"
                        id={`wallet-checkbox-${wallet.id}`}
                        onClick={(e) => toggleWalletSelection(wallet.id, e)}
                        className={`p-1 rounded transition-colors cursor-pointer shrink-0 ${
                          isBulkSelected 
                            ? 'text-cyan-400 bg-cyan-500/20 ring-1 ring-cyan-500/50' 
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                        }`}
                        title={isBulkSelected ? "Deselect for bulk modify" : "Select for bulk modify"}
                      >
                        {isBulkSelected ? (
                          <CheckSquare className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        wallet.status === 'active' 
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' 
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}>
                        {wallet.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                          <span>{wallet.name}</span>
                          {wallet.status === 'active' ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-400" title="Active & Autonomous" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-rose-400" title="Quarantined" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {wallet.role}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-sm font-bold text-white">
                        {formatCurrency(wallet.balance, wallet.currency)}
                      </div>
                      <div className="text-[10px] text-emerald-400">
                        {wallet.reputationScore}% SLA
                      </div>
                    </div>
                  </div>

                  {/* Visual Warning Indicator: Daily Spending Limit Progress Bar */}
                  <div className="pt-2.5 border-t border-slate-800/70 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-300 font-medium">Daily Limit:</span>
                        <span className={`font-bold ${
                          isDailyCritical || isDailyExceeded
                            ? 'text-rose-400'
                            : isDailyNearLimit
                            ? 'text-amber-400'
                            : 'text-cyan-300'
                        }`}>
                          {dailyRatio.toFixed(1)}%
                        </span>
                      </div>

                      {/* Warning Status Badge */}
                      {isDailyExceeded ? (
                        <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/40 animate-pulse">
                          <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                          <span>Limit Exceeded</span>
                        </span>
                      ) : isDailyCritical ? (
                        <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/40 animate-pulse">
                          <AlertTriangle className="w-2.5 h-2.5 text-rose-400" />
                          <span>Near Limit ({dailyRatio.toFixed(0)}%)</span>
                        </span>
                      ) : isDailyNearLimit ? (
                        <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
                          <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                          <span>Approaching Limit</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">
                          ${dailySpent.toFixed(2)} / ${dailyLimit.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Progress Bar Track with Color-Coded Warning State */}
                    <div 
                      id={`wallet-daily-limit-bar-${wallet.id}`}
                      role="progressbar"
                      aria-valuenow={Math.round(clampedDailyRatio)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${wallet.name} daily spending limit: ${dailyRatio.toFixed(1)}% used`}
                      className={`w-full h-2 rounded-full bg-slate-950 p-0.5 overflow-hidden border ${
                        isDailyCritical || isDailyExceeded
                          ? 'border-rose-500/50 shadow-sm shadow-rose-500/25'
                          : isDailyNearLimit
                          ? 'border-amber-500/40 shadow-sm shadow-amber-500/15'
                          : 'border-slate-800/90'
                      }`}
                    >
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isDailyCritical || isDailyExceeded
                            ? 'bg-rose-500'
                            : isDailyNearLimit
                            ? 'bg-amber-400'
                            : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                        }`}
                        style={{ width: `${clampedDailyRatio}%` }}
                      />
                    </div>

                    {/* Remaining Allowance */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>
                        {isDailyExceeded ? (
                          <span className="text-rose-400 font-medium">Daily cap exhausted (throttled)</span>
                        ) : (
                          <span>${remainingDaily.toFixed(2)} remaining</span>
                        )}
                      </span>
                      <span className="text-slate-400">
                        Cap: ${dailyLimit.toFixed(0)}/day
                      </span>
                    </div>
                  </div>

                  {/* Hourly Velocity Meter (Compact) */}
                  <div className="pt-2 border-t border-slate-800/50">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span>Hourly Velocity:</span>
                      <span>
                        ${wallet.spendingLimits.currentHourlySpent.toFixed(2)} / ${wallet.spendingLimits.maxPerHour.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-slate-950 overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          hourlyRatio > 80 ? 'bg-rose-400' : hourlyRatio > 50 ? 'bg-amber-400' : 'bg-cyan-400'
                        }`}
                        style={{ width: `${Math.min(hourlyRatio, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Selected Wallet Programmable Inspector & Controls */}
        {selectedWallet && (
          <div className="lg:col-span-8 space-y-5">
            {/* Header Card */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-lg">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">{selectedWallet.name}</h2>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        selectedWallet.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {selectedWallet.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Machine Role: <span className="text-slate-200">{selectedWallet.role}</span> • Created {selectedWallet.createdAt}
                    </p>
                  </div>
                </div>

                {/* Quick Simulation & Quarantine */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onSimulateSpend(selectedWallet.id)}
                    id="wallet-test-spend-btn"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium transition-colors cursor-pointer"
                    title="Simulate micro-spend of $0.0024"
                  >
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Test Micro-Spend</span>
                  </button>

                  <button
                    onClick={() => handleSimulateBatchSpend(10)}
                    id="wallet-test-batch-spend-btn"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors cursor-pointer"
                    title="Add $10 to test daily limit warning thresholds"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>+ $10 Task Spend</span>
                  </button>

                  <button
                    onClick={handleResetDailySpend}
                    id="wallet-reset-spend-btn"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
                    title="Reset today's spent amount back to $0"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Reset Spend</span>
                  </button>

                  <button
                    onClick={toggleStatus}
                    id="wallet-toggle-quarantine-btn"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      selectedWallet.status === 'active'
                        ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    {selectedWallet.status === 'active' ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Emergency Quarantine</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Reactivate Agent</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Cryptographic Identity (DID & Ed25519 Key) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="flex items-center gap-1 font-medium">
                      <Key className="w-3 h-3 text-cyan-400" />
                      <span>Decentralized Agent ID (DID)</span>
                    </span>
                    <button 
                      onClick={() => handleCopy(selectedWallet.did, 'did')}
                      className="text-cyan-400 hover:text-cyan-300 font-mono text-[10px]"
                    >
                      {copiedKey === 'did' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="font-mono text-xs text-slate-200 truncate">
                    {selectedWallet.did}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="flex items-center gap-1 font-medium">
                      <Key className="w-3 h-3 text-cyan-400" />
                      <span>Ed25519 Public Verification Key</span>
                    </span>
                    <button 
                      onClick={() => handleCopy(selectedWallet.publicKey, 'pk')}
                      className="text-cyan-400 hover:text-cyan-300 font-mono text-[10px]"
                    >
                      {copiedKey === 'pk' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="font-mono text-xs text-slate-200 truncate">
                    {selectedWallet.publicKey}
                  </div>
                </div>
              </div>

              {/* Deposit Balance Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800/90 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Available Agent Liquidity</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                    {formatCurrency(selectedWallet.balance, selectedWallet.currency)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-mono text-slate-500">$</span>
                    <input
                      type="number"
                      id="wallet-deposit-amount-input"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-24 pl-6 pr-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                      placeholder="50"
                    />
                  </div>
                  <button
                    onClick={handleDeposit}
                    id="wallet-deposit-confirm-btn"
                    disabled={isDepositing}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isDepositing ? 'animate-spin' : ''}`} />
                    <span>Top-up Treasury</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Programmable Permissions & Spending Policies */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Programmable Spending Policies</h3>
                </div>
                <span className="text-xs text-slate-400">
                  Enforced by Paymind Cryptographic Consensus
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Max Per Tx */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="text-xs text-slate-400">Max Per Transaction</div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-mono text-xs">$</span>
                    <input
                      type="number"
                      value={selectedWallet.spendingLimits.maxPerTransaction}
                      onChange={(e) => updateLimits('maxPerTransaction', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">Autonomous cap per single API or task call</p>
                </div>

                {/* Max Per Hour */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="text-xs text-slate-400">Max Per Hour (Velocity)</div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-mono text-xs">$</span>
                    <input
                      type="number"
                      value={selectedWallet.spendingLimits.maxPerHour}
                      onChange={(e) => updateLimits('maxPerHour', parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">Current hour: ${selectedWallet.spendingLimits.currentHourlySpent.toFixed(2)}</p>
                </div>

                {/* Max Per Day */}
                {(() => {
                  const selDailyRatio = selectedWallet.spendingLimits.maxPerDay > 0
                    ? (selectedWallet.spendingLimits.currentDailySpent / selectedWallet.spendingLimits.maxPerDay) * 100
                    : 0;
                  const selClamped = Math.min(Math.max(selDailyRatio, 0), 100);
                  const isNear = selDailyRatio >= 75 && selDailyRatio < 90;
                  const isCrit = selDailyRatio >= 90;
                  const isExceeded = selDailyRatio >= 100;

                  return (
                    <div className={`p-3.5 rounded-xl bg-slate-950/80 border space-y-2 ${
                      isCrit || isExceeded
                        ? 'border-rose-500/50'
                        : isNear
                        ? 'border-amber-500/50'
                        : 'border-slate-800'
                    }`}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Max Per 24-Hour Period</span>
                        {isExceeded ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-rose-400 animate-pulse">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            100% Exceeded (Throttled)
                          </span>
                        ) : isCrit ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-rose-400 animate-pulse">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {selDailyRatio.toFixed(0)}% Critical Warning
                          </span>
                        ) : isNear ? (
                          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {selDailyRatio.toFixed(0)}% Limit Warning
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-emerald-400">
                            {selDailyRatio.toFixed(1)}% used
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono text-xs">$</span>
                        <input
                          type="number"
                          value={selectedWallet.spendingLimits.maxPerDay}
                          onChange={(e) => updateLimits('maxPerDay', parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      {/* Visual Warning Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800 p-0.5">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isCrit || isExceeded
                              ? 'bg-rose-500'
                              : isNear
                              ? 'bg-amber-400'
                              : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                          }`}
                          style={{ width: `${selClamped}%` }}
                        />
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center justify-between font-mono">
                        <span>Current day: ${selectedWallet.spendingLimits.currentDailySpent.toFixed(2)}</span>
                        <span>
                          {isExceeded 
                            ? '0.00 left' 
                            : `$${Math.max(0, selectedWallet.spendingLimits.maxPerDay - selectedWallet.spendingLimits.currentDailySpent).toFixed(2)} remaining`}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Service Whitelist & Access Domains */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-200">
                    Permitted Machine Endpoints & Service Whitelist
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedWallet.spendingLimits.enforceServiceWhitelist}
                      onChange={(e) => updateLimits('enforceServiceWhitelist', e.target.checked)}
                      className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-900"
                    />
                    <span>Enforce Strict Whitelist</span>
                  </label>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedWallet.allowedServices.map((srv, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span>{srv}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Modify Daily Spending Limit Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Bulk Modify Daily Spending Limits</h3>
                  <p className="text-xs text-slate-400">
                    Apply a synchronized daily limit threshold across selected agent wallets
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selected Wallets Count & Quick Chips */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Target Agents ({selectedWalletIds.length}):</span>
                <span className="text-cyan-400 font-semibold">{selectedWalletIds.length} wallets will be updated</span>
              </div>

              <div className="max-h-36 overflow-y-auto p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                {wallets
                  .filter(w => selectedWalletIds.includes(w.id))
                  .map(w => (
                    <div key={w.id} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-900/60 border border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded flex items-center justify-center bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">
                          {w.name.charAt(0)}
                        </span>
                        <span className="text-white font-medium">{w.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({w.role})</span>
                      </div>
                      <div className="font-mono text-slate-400 text-[11px]">
                        Current: <span className="text-slate-200 font-semibold">${w.spendingLimits.maxPerDay.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Input & Presets */}
            <div className="space-y-3">
              <label className="block text-xs font-mono text-slate-300">
                New Daily Spending Limit ($ USD)
              </label>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">
                  $
                </span>
                <input
                  type="number"
                  min="1"
                  step="50"
                  id="bulk-daily-limit-input"
                  value={bulkDailyLimitInput}
                  onChange={(e) => setBulkDailyLimitInput(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400 font-mono">Quick Preset Thresholds:</span>
                <div className="flex flex-wrap gap-1.5">
                  {['500', '1000', '2500', '5000', '10000', '25000', '50000'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBulkDailyLimitInput(preset)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                        bulkDailyLimitInput === preset
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                      }`}
                    >
                      ${parseInt(preset).toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Impact Note */}
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-300 leading-relaxed font-mono">
              <span className="font-semibold text-white">Consensus Policy Effect:</span> Real-time settlement rails will immediately recalculate quota percentages and SLA boundaries for each of the {selectedWalletIds.length} agents against this new threshold.
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                id="bulk-apply-confirm-btn"
                disabled={isApplyingBulk || !bulkDailyLimitInput || parseFloat(bulkDailyLimitInput) <= 0 || selectedWalletIds.length === 0}
                onClick={handleApplyBulkDailyLimit}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-medium text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
              >
                {isApplyingBulk ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Propagating Policy...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Apply to {selectedWalletIds.length} Wallets</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
