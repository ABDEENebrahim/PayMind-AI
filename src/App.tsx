import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OverviewDashboard } from './components/OverviewDashboard';
import { WalletsManager } from './components/WalletsManager';
import { EscrowEngine } from './components/EscrowEngine';
import { MicropaymentStream } from './components/MicropaymentStream';
import { CrossBorderReconciliation } from './components/CrossBorderReconciliation';
import { TreasuryControl } from './components/TreasuryControl';
import { InteractivePlayground } from './components/InteractivePlayground';
import { DevProtocolExplorer } from './components/DevProtocolExplorer';
import { SearchGroundingTerminal } from './components/SearchGroundingTerminal';
import { AgentPerformanceAnalytics } from './components/AgentPerformanceAnalytics';
import { CreateWalletModal } from './components/CreateWalletModal';
import { CreateEscrowModal } from './components/CreateEscrowModal';
import { OmnisearchModal } from './components/OmnisearchModal';
import { PaymindLogo } from './components/PaymindLogo';
import { useFirebase } from './context/FirebaseContext';
import { 
  Database, 
  Cloud, 
  Shield, 
  CheckCircle2, 
  Sparkles,
  Coins,
  Globe2,
  Vault,
  TrendingUp,
  Search,
  PlayCircle,
  Code2
} from 'lucide-react';

import { 
  INITIAL_WALLETS, 
  INITIAL_ESCROWS, 
  INITIAL_CORRIDORS, 
  INITIAL_TREASURY_POOLS, 
  INITIAL_SCENARIOS 
} from './data/initialData';
import { 
  AgentWallet, 
  EscrowContract, 
  MicroPaymentTransaction, 
  CrossBorderCorridor, 
  TreasuryPool 
} from './types';

export default function App() {
  const { 
    user, 
    firestoreWallets, 
    firestoreEscrows, 
    firestoreTransactions, 
    saveWallet, 
    updateWallet, 
    saveEscrow, 
    updateEscrow, 
    saveTransaction,
    signInWithGoogle
  } = useFirebase();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [wallets, setWallets] = useState<AgentWallet[]>(INITIAL_WALLETS);
  const [escrows, setEscrows] = useState<EscrowContract[]>(INITIAL_ESCROWS);
  const [corridors, setCorridors] = useState<CrossBorderCorridor[]>(INITIAL_CORRIDORS);
  const [pools, setPools] = useState<TreasuryPool[]>(INITIAL_TREASURY_POOLS);
  const [scenarios] = useState(INITIAL_SCENARIOS);

  // Sync state from Firestore when user is logged in
  useEffect(() => {
    if (user && firestoreWallets.length > 0) {
      setWallets(firestoreWallets);
    }
  }, [user, firestoreWallets]);

  useEffect(() => {
    if (user && firestoreEscrows.length > 0) {
      setEscrows(firestoreEscrows);
    }
  }, [user, firestoreEscrows]);

  useEffect(() => {
    if (user && firestoreTransactions.length > 0) {
      setRecentTxs(prev => {
        const merged = [...firestoreTransactions, ...prev.filter(p => !firestoreTransactions.some(f => f.id === p.id))];
        return merged.slice(0, 30);
      });
    }
  }, [user, firestoreTransactions]);

  // Live Stream State
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamSpeed, setStreamSpeed] = useState<number>(1);
  const [tps, setTps] = useState<number>(14820);
  const [totalVolume, setTotalVolume] = useState<number>(42918450);
  const [recentTxs, setRecentTxs] = useState<MicroPaymentTransaction[]>([]);

  // Modals
  const [isCreateWalletOpen, setIsCreateWalletOpen] = useState<boolean>(false);
  const [isCreateEscrowOpen, setIsCreateEscrowOpen] = useState<boolean>(false);
  const [isOmnisearchOpen, setIsOmnisearchOpen] = useState<boolean>(false);

  // Global Omnisearch Hotkey (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOmnisearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Seed initial micro-transactions
  useEffect(() => {
    const services = ['LLM Tokens', 'Vector Retrieval', 'Web Scraping', 'Data Validation', 'Arbitrage Leg'] as const;
    const initialTxs: MicroPaymentTransaction[] = [];
    const now = Date.now();

    for (let i = 0; i < 12; i++) {
      const fromW = wallets[i % wallets.length];
      const toW = wallets[(i + 1) % wallets.length];
      const service = services[i % services.length];
      const amount = Number((0.0001 + Math.random() * 0.002).toFixed(6));

      initialTxs.push({
        id: `tx-m2m-${Math.random().toString(16).substring(2, 9)}`,
        timestamp: now - i * 1800,
        fromAgentId: fromW.id,
        toAgentId: toW.id,
        amount,
        currency: 'USD',
        serviceCategory: service,
        units: service === 'LLM Tokens' ? `${Math.floor(800 + Math.random() * 3200)} tokens` : service === 'Vector Retrieval' ? '1 embedding' : '1 task step',
        latencyMs: Math.floor(8 + Math.random() * 12),
        batchRollupId: `#891,${420 - Math.floor(i / 3)}`,
        stateChannelId: `sc-${fromW.id.slice(6, 11)}-to-${toW.id.slice(6, 11)}`,
        status: 'settled',
        gasFeeSubCent: 0.000003,
        signature: '0x' + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10),
      });
    }

    setRecentTxs(initialTxs);
  }, []);

  // Continuous background M2M streaming ticker
  useEffect(() => {
    if (!isStreaming) return;

    const intervalTime = Math.max(100, Math.floor(1800 / streamSpeed));
    const interval = setInterval(() => {
      // Pick two distinct agents
      const fromIdx = Math.floor(Math.random() * wallets.length);
      let toIdx = Math.floor(Math.random() * wallets.length);
      if (toIdx === fromIdx) toIdx = (fromIdx + 1) % wallets.length;

      const fromW = wallets[fromIdx];
      const toW = wallets[toIdx];
      const services = ['LLM Tokens', 'Vector Retrieval', 'Web Scraping', 'Data Validation', 'Arbitrage Leg'] as const;
      const service = services[Math.floor(Math.random() * services.length)];
      const amount = Number((0.00012 + Math.random() * 0.0018).toFixed(6));

      const newTx: MicroPaymentTransaction = {
        id: `tx-m2m-${Math.random().toString(16).substring(2, 9)}`,
        timestamp: Date.now(),
        fromAgentId: fromW.id,
        toAgentId: toW.id,
        amount,
        currency: 'USD',
        serviceCategory: service,
        units: service === 'LLM Tokens' ? `${Math.floor(500 + Math.random() * 2500)} tokens` : '1 query',
        latencyMs: Math.floor(9 + Math.random() * 10),
        batchRollupId: `#891,421`,
        stateChannelId: `sc-${fromW.id.slice(6, 10)}-to-${toW.id.slice(6, 10)}`,
        status: 'settled',
        gasFeeSubCent: 0.000003,
        signature: '0x' + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10),
      };

      setRecentTxs(prev => [newTx, ...prev.slice(0, 40)]);
      setTotalVolume(prev => prev + amount);
      setTps(14500 + Math.floor(Math.random() * 700));

      // Minor balance updates for active agents
      setWallets(prev => prev.map(w => {
        if (w.id === fromW.id) {
          return {
            ...w,
            balance: Math.max(0, w.balance - amount),
            spendingLimits: {
              ...w.spendingLimits,
              currentHourlySpent: w.spendingLimits.currentHourlySpent + amount,
              currentDailySpent: w.spendingLimits.currentDailySpent + amount,
            },
            totalTransactionsCount: w.totalTransactionsCount + 1,
          };
        }
        if (w.id === toW.id) {
          return {
            ...w,
            balance: w.balance + amount,
            totalTransactionsCount: w.totalTransactionsCount + 1,
          };
        }
        return w;
      }));

    }, intervalTime);

    return () => clearInterval(interval);
  }, [isStreaming, streamSpeed, wallets]);

  // Wallet Handlers
  const handleCreateWallet = (newWallet: AgentWallet) => {
    const walletWithUser = user ? { ...newWallet, userId: user.uid } : newWallet;
    setWallets(prev => [walletWithUser, ...prev]);
    if (user) {
      saveWallet(walletWithUser);
    }
  };

  const handleUpdateWallet = (updated: AgentWallet) => {
    setWallets(prev => prev.map(w => w.id === updated.id ? updated : w));
    if (user) {
      updateWallet(updated);
    }
  };

  const handleBulkUpdateWallets = (updatedWallets: AgentWallet[]) => {
    const map = new Map(updatedWallets.map(w => [w.id, w]));
    setWallets(prev => prev.map(w => map.get(w.id) || w));
    if (user) {
      updatedWallets.forEach(w => updateWallet(w));
    }
  };

  const handleSimulateSpend = (agentId: string) => {
    setWallets(prev => prev.map(w => {
      if (w.id === agentId) {
        const testCost = 0.0024;
        const updated: AgentWallet = {
          ...w,
          balance: Math.max(0, w.balance - testCost),
          spendingLimits: {
            ...w.spendingLimits,
            currentHourlySpent: w.spendingLimits.currentHourlySpent + testCost,
            currentDailySpent: w.spendingLimits.currentDailySpent + testCost,
          },
          totalTransactionsCount: w.totalTransactionsCount + 1,
        };
        if (user) {
          updateWallet(updated);
        }
        return updated;
      }
      return w;
    }));
  };

  // Escrow Handlers
  const handleCreateEscrow = (contract: EscrowContract) => {
    const escrowWithUser = user ? { ...contract, userId: user.uid } : contract;
    setEscrows(prev => [escrowWithUser, ...prev]);
    if (user) {
      saveEscrow(escrowWithUser);
    }
  };

  const handleUpdateEscrow = (updated: EscrowContract) => {
    setEscrows(prev => prev.map(e => e.id === updated.id ? updated : e));
    if (user) {
      updateEscrow(updated);
    }
  };

  const handleDisburseEscrow = (escrowId: string) => {
    const escrow = escrows.find(e => e.id === escrowId);
    if (!escrow) return;

    const settledTxId = `tx-m2m-${Math.random().toString(16).substring(2, 9)}`;
    let updatedEscrowObj: EscrowContract | null = null;

    setEscrows(prev => prev.map(e => {
      if (e.id === escrowId) {
        updatedEscrowObj = {
          ...e,
          status: 'released',
          settledTxId,
          submittedProof: e.submittedProof ? {
            ...e.submittedProof,
            validationLogs: [
              ...(e.submittedProof.validationLogs || []),
              `[${new Date().toLocaleTimeString()}] Veritas Oracle consensus certified. Payout of $${e.amount.toFixed(2)} disbursed instantly.`,
            ],
          } : undefined,
        };
        return updatedEscrowObj;
      }
      return e;
    }));

    if (user && updatedEscrowObj) {
      updateEscrow(updatedEscrowObj);
    }

    // Transfer amount to seller wallet
    setWallets(prev => prev.map(w => {
      if (w.id === escrow.sellerAgentId) {
        const updatedSeller = { ...w, balance: w.balance + escrow.amount };
        if (user) {
          updateWallet(updatedSeller);
        }
        return updatedSeller;
      }
      return w;
    }));
  };

  const handleRefundEscrow = (escrowId: string) => {
    const escrow = escrows.find(e => e.id === escrowId);
    if (!escrow) return;

    let updatedEscrowObj: EscrowContract | null = null;

    setEscrows(prev => prev.map(e => {
      if (e.id === escrowId) {
        updatedEscrowObj = {
          ...e,
          status: 'disputed_refunded',
        };
        return updatedEscrowObj;
      }
      return e;
    }));

    if (user && updatedEscrowObj) {
      updateEscrow(updatedEscrowObj);
    }

    // Refund buyer
    setWallets(prev => prev.map(w => {
      if (w.id === escrow.buyerAgentId) {
        const updatedBuyer = { ...w, balance: w.balance + escrow.amount };
        if (user) {
          updateWallet(updatedBuyer);
        }
        return updatedBuyer;
      }
      return w;
    }));
  };

  const handleUpdatePool = (updated: TreasuryPool) => {
    setPools(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  // Simulation step execution
  const handleExecuteSimulationStep = (step: {
    fromId: string;
    toId: string;
    amount: number;
    actionType: string;
    description: string;
  }) => {
    if (step.actionType === 'stream_micropayments' || step.actionType === 'open_channel') {
      const newTx: MicroPaymentTransaction = {
        id: `tx-m2m-${Math.random().toString(16).substring(2, 9)}`,
        timestamp: Date.now(),
        fromAgentId: step.fromId,
        toAgentId: step.toId,
        amount: step.amount,
        currency: 'USD',
        serviceCategory: 'Data Validation',
        units: 'simulation step',
        latencyMs: 11,
        batchRollupId: `#891,422`,
        stateChannelId: `sc-sim-${step.fromId.slice(6, 10)}`,
        status: 'settled',
        gasFeeSubCent: 0.000003,
        signature: '0x' + Math.random().toString(16).substring(2, 12),
        userId: user?.uid,
      };
      setRecentTxs(prev => [newTx, ...prev]);
      if (user) {
        saveTransaction(newTx);
      }
    }

    if (step.actionType === 'verify_deliverable') {
      // Disburse first active escrow
      const activeOne = escrows.find(e => e.status === 'active_locked' || e.status === 'evaluating_proof');
      if (activeOne) {
        handleDisburseEscrow(activeOne.id);
      }
    }
  };

  const handleEmitManualTx = () => {
    const fromW = wallets[0];
    const toW = wallets[1];
    const newTx: MicroPaymentTransaction = {
      id: `tx-m2m-${Math.random().toString(16).substring(2, 9)}`,
      timestamp: Date.now(),
      fromAgentId: fromW.id,
      toAgentId: toW.id,
      amount: 0.00045,
      currency: 'USD',
      serviceCategory: 'LLM Tokens',
      units: '3,000 tokens',
      latencyMs: 12,
      batchRollupId: '#891,422',
      stateChannelId: `sc-${fromW.id.slice(6, 10)}`,
      status: 'settled',
      gasFeeSubCent: 0.000003,
      signature: '0x' + Math.random().toString(16).substring(2, 12),
      userId: user?.uid,
    };
    setRecentTxs(prev => [newTx, ...prev]);
    setTotalVolume(prev => prev + 0.00045);
    if (user) {
      saveTransaction(newTx);
    }
  };

  const activeEscrowCount = escrows.filter(e => e.status === 'active_locked' || e.status === 'evaluating_proof').length;

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col selection:bg-[#14F195]/20 selection:text-[#14F195]">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isStreaming={isStreaming}
        setIsStreaming={setIsStreaming}
        tps={tps}
        totalVolume={totalVolume}
        activeEscrowCount={activeEscrowCount}
        walletCount={wallets.length}
        onOpenCreateWallet={() => setIsCreateWalletOpen(true)}
        onOpenCreateEscrow={() => setIsCreateEscrowOpen(true)}
        onOpenOmnisearch={() => setIsOmnisearchOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Firestore Persistence Banner (Shown on account & contract management hubs) */}
        {activeTab !== 'overview' && (user ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs solana-glass">
            <div className="flex items-center gap-2.5 text-emerald-300">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold text-emerald-200">Cloud Firestore Connected:</span>
                <span className="ml-1 text-emerald-400/90 font-mono">
                  All agent wallets, escrows, and transaction ledgers are syncing to your personal cloud partition ({user.email}).
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400/80 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
              <span>DB: ai-studio-paymindai</span>
              <span>•</span>
              <span>Subcollections Active</span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/20 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs solana-glass">
            <div className="flex items-center gap-2.5 text-cyan-300">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Database className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="font-semibold text-cyan-200">Local Interactive Mode:</span>
                <span className="ml-1 text-slate-300">
                  You are viewing local simulation state. Sign in with Google to persist your machine wallets, escrow contracts, and ledger records to Firebase Firestore.
                </span>
              </div>
            </div>
            <button
              onClick={signInWithGoogle}
              id="banner-signin-btn"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer shrink-0 shadow-sm"
            >
              <Sparkles className="w-3 h-3" />
              <span>Connect Cloud Firestore</span>
            </button>
          </div>
        ))}

        {activeTab === 'overview' && (
          <OverviewDashboard
            wallets={wallets}
            escrows={escrows}
            recentTxs={recentTxs}
            corridors={corridors}
            setActiveTab={setActiveTab}
            onOpenCreateWallet={() => setIsCreateWalletOpen(true)}
            onOpenCreateEscrow={() => setIsCreateEscrowOpen(true)}
            onRunSimulation={() => setActiveTab('simulator')}
          />
        )}

        {activeTab === 'wallets' && (
          <WalletsManager
            wallets={wallets}
            onOpenCreateWallet={() => setIsCreateWalletOpen(true)}
            onUpdateWallet={handleUpdateWallet}
            onBulkUpdateWallets={handleBulkUpdateWallets}
            onSimulateSpend={handleSimulateSpend}
          />
        )}

        {activeTab === 'escrow' && (
          <EscrowEngine
            escrows={escrows}
            wallets={wallets}
            onOpenCreateEscrow={() => setIsCreateEscrowOpen(true)}
            onUpdateEscrow={handleUpdateEscrow}
            onDisburseEscrow={handleDisburseEscrow}
            onRefundEscrow={handleRefundEscrow}
          />
        )}

        {/* Hub 4: Live Transactions Hub (Sub-Cent Stream / Cross-Border / Treasury) */}
        {['transactions', 'micropayments', 'crossborder', 'treasury'].includes(activeTab) && (
          <div className="space-y-4">
            {/* Solana Beach Sub-Nav Selector */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0c1017] border border-slate-800/80 w-fit text-xs font-mono">
              <button
                onClick={() => setActiveTab('micropayments')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'micropayments' || activeTab === 'transactions'
                    ? 'bg-slate-800 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Coins className="w-3.5 h-3.5 text-[#14F195]" />
                <span>Sub-Cent Stream</span>
              </button>
              <button
                onClick={() => setActiveTab('crossborder')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'crossborder'
                    ? 'bg-slate-800 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5 text-[#03E1FF]" />
                <span>Cross-Border FX</span>
              </button>
              <button
                onClick={() => setActiveTab('treasury')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'treasury'
                    ? 'bg-slate-800 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Vault className="w-3.5 h-3.5 text-[#9945FF]" />
                <span>Treasury Pools</span>
              </button>
            </div>

            {(activeTab === 'micropayments' || activeTab === 'transactions') && (
              <MicropaymentStream
                transactions={recentTxs}
                wallets={wallets}
                isStreaming={isStreaming}
                setIsStreaming={setIsStreaming}
                streamSpeed={streamSpeed}
                setStreamSpeed={setStreamSpeed}
                onEmitManualTx={handleEmitManualTx}
              />
            )}

            {activeTab === 'crossborder' && (
              <CrossBorderReconciliation corridors={corridors} />
            )}

            {activeTab === 'treasury' && (
              <TreasuryControl
                pools={pools}
                wallets={wallets}
                onUpdatePool={handleUpdatePool}
              />
            )}
          </div>
        )}

        {/* Hub 5: Analytics & Protocol Hub */}
        {['analytics', 'grounding', 'simulator', 'developer'].includes(activeTab) && (
          <div className="space-y-4">
            {/* Solana Beach Sub-Nav Selector */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0c1017] border border-slate-800/80 w-fit text-xs font-mono">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-slate-800 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-[#14F195]" />
                <span>Agent Performance</span>
              </button>
              <button
                onClick={() => setActiveTab('grounding')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'grounding'
                    ? 'bg-slate-800 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-[#03E1FF]" />
                <span>Google Search Intel</span>
              </button>
              <button
                onClick={() => setActiveTab('simulator')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'simulator'
                    ? 'bg-slate-800 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Swarm Playground</span>
              </button>
              <button
                onClick={() => setActiveTab('developer')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'developer'
                    ? 'bg-slate-800 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-[#9945FF]" />
                <span>Protocol & RPCs</span>
              </button>
            </div>

            {activeTab === 'analytics' && (
              <AgentPerformanceAnalytics
                wallets={wallets}
                recentTxs={recentTxs}
                escrows={escrows}
                onOpenCreateWallet={() => setIsCreateWalletOpen(true)}
              />
            )}

            {activeTab === 'grounding' && (
              <SearchGroundingTerminal />
            )}

            {activeTab === 'simulator' && (
              <InteractivePlayground
                scenarios={scenarios}
                wallets={wallets}
                onExecuteSimulationStep={handleExecuteSimulationStep}
              />
            )}

            {activeTab === 'developer' && (
              <DevProtocolExplorer />
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <OmnisearchModal
        isOpen={isOmnisearchOpen}
        onClose={() => setIsOmnisearchOpen(false)}
        wallets={wallets}
        escrows={escrows}
        transactions={recentTxs}
        corridors={corridors}
        onSelectTab={setActiveTab}
        onOpenCreateWallet={() => setIsCreateWalletOpen(true)}
        onOpenCreateEscrow={() => setIsCreateEscrowOpen(true)}
      />

      <CreateWalletModal
        isOpen={isCreateWalletOpen}
        onClose={() => setIsCreateWalletOpen(false)}
        onCreateWallet={handleCreateWallet}
      />

      <CreateEscrowModal
        isOpen={isCreateEscrowOpen}
        onClose={() => setIsCreateEscrowOpen(false)}
        wallets={wallets}
        onCreateEscrow={handleCreateEscrow}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#080b10] py-6 text-xs text-slate-400 font-mono transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <PaymindLogo size="sm" showBadge={false} />
            <span className="text-slate-400 hidden sm:inline">— Non-Custodial Machine Settlement Infrastructure</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Ed25519 Native</span>
            <span>•</span>
            <span>Sub-Cent State Channels</span>
            <span>•</span>
            <span>Zero Human Latency</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
