import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Wallet, 
  Scale, 
  Coins, 
  Globe2, 
  ArrowRight, 
  X, 
  Zap, 
  Command, 
  Check, 
  Sliders, 
  Activity, 
  ShieldCheck,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { AgentWallet, EscrowContract, MicroPaymentTransaction, CrossBorderCorridor } from '../types';
import { formatCurrency } from '../utils/formatters';
import { PaymindLogo } from './PaymindLogo';

interface OmnisearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: AgentWallet[];
  escrows: EscrowContract[];
  transactions: MicroPaymentTransaction[];
  corridors: CrossBorderCorridor[];
  onSelectTab: (tab: string) => void;
  onSelectWallet?: (walletId: string) => void;
  onSelectEscrow?: (escrowId: string) => void;
  onOpenCreateWallet: () => void;
  onOpenCreateEscrow: () => void;
}

export const OmnisearchModal: React.FC<OmnisearchModalProps> = ({
  isOpen,
  onClose,
  wallets,
  escrows,
  transactions,
  corridors,
  onSelectTab,
  onSelectWallet,
  onSelectEscrow,
  onOpenCreateWallet,
  onOpenCreateEscrow,
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'wallets' | 'escrows' | 'txs' | 'corridors'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K / '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or custom event
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  // Search Results
  const matchedWallets = (activeFilter === 'all' || activeFilter === 'wallets')
    ? wallets.filter(w => 
        !q || 
        w.name.toLowerCase().includes(q) || 
        w.id.toLowerCase().includes(q) || 
        w.publicKey.toLowerCase().includes(q) ||
        w.role.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const matchedEscrows = (activeFilter === 'all' || activeFilter === 'escrows')
    ? escrows.filter(e => 
        !q || 
        e.title.toLowerCase().includes(q) || 
        e.id.toLowerCase().includes(q) || 
        e.conditionType.toLowerCase().includes(q) ||
        e.conditionDescription.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const matchedTxs = (activeFilter === 'all' || activeFilter === 'txs')
    ? transactions.filter(t => 
        !q || 
        t.id.toLowerCase().includes(q) || 
        t.signature.toLowerCase().includes(q) || 
        t.serviceCategory.toLowerCase().includes(q) ||
        t.batchRollupId.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const matchedCorridors = (activeFilter === 'all' || activeFilter === 'corridors')
    ? corridors.filter(c => 
        !q || 
        c.fromCurrency.toLowerCase().includes(q) || 
        c.toCurrency.toLowerCase().includes(q) || 
        c.settlementMethod.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const totalResults = matchedWallets.length + matchedEscrows.length + matchedTxs.length + matchedCorridors.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        ref={containerRef}
        className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-cyan-950/40 overflow-hidden flex flex-col max-h-[80vh] border-t-2 border-t-[#14F195]"
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/90">
          <Search className="w-5 h-5 text-[#14F195] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search address, agent DID, escrow contract, transaction hash, or rollup batch..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none font-sans"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1.5 ml-2 px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700">
            <span>ESC</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-800/80 bg-slate-900/60 text-xs overflow-x-auto">
          {(['all', 'wallets', 'escrows', 'txs', 'corridors'] as const).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-2.5 py-1 rounded-md capitalize transition-colors font-medium cursor-pointer ${
                activeFilter === f
                  ? 'bg-gradient-to-r from-[#14F195]/20 to-[#03E1FF]/20 text-[#14F195] border border-[#14F195]/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {f === 'txs' ? 'Transactions' : f}
            </button>
          ))}
          <span className="text-[11px] text-slate-500 font-mono ml-auto">
            {totalResults} matches
          </span>
        </div>

        {/* Scrollable Results List */}
        <div className="overflow-y-auto p-3 space-y-4 max-h-[55vh]">
          {/* Quick System Actions if empty query */}
          {!query && (
            <div className="space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 py-1">
                Quick Explorer Actions
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenCreateWallet();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-[#14F195]/40 text-left transition-all group"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#14F195]/15 border border-[#14F195]/30 flex items-center justify-center text-[#14F195]">
                    <Wallet className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-[#14F195]">
                      Deploy Agent Wallet
                    </div>
                    <div className="text-[10px] text-slate-400">Mint new DID key & limits</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenCreateEscrow();
                  }}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-800 hover:border-[#9945FF]/40 text-left transition-all group"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#9945FF]/15 border border-[#9945FF]/30 flex items-center justify-center text-[#9945FF]">
                    <Scale className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-[#9945FF]">
                      Lock Programmable Escrow
                    </div>
                    <div className="text-[10px] text-slate-400">Zero human intermediary</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Wallets */}
          {matchedWallets.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 px-2 flex items-center justify-between">
                <span>Machine Agent Wallets ({matchedWallets.length})</span>
                <span className="text-slate-400">Press Enter to Jump</span>
              </div>
              {matchedWallets.map(w => (
                <div
                  key={w.id}
                  onClick={() => {
                    onClose();
                    onSelectTab('wallets');
                    if (onSelectWallet) onSelectWallet(w.id);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 shrink-0">
                      <Wallet className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white group-hover:text-cyan-300 truncate">
                          {w.name}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-slate-400">
                          {w.role}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 truncate">
                        {w.publicKey}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <div className="text-xs font-bold font-mono text-emerald-400">
                      {formatCurrency(w.balance)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Limit: ${w.spendingLimits.maxPerDay.toLocaleString()}/d
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Escrow Contracts */}
          {matchedEscrows.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#9945FF] px-2 flex items-center justify-between">
                <span>Programmable Escrow Contracts ({matchedEscrows.length})</span>
              </div>
              {matchedEscrows.map(e => (
                <div
                  key={e.id}
                  onClick={() => {
                    onClose();
                    onSelectTab('escrow');
                    if (onSelectEscrow) onSelectEscrow(e.id);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-[#9945FF]/40 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[#9945FF]/15 border border-[#9945FF]/30 flex items-center justify-center text-[#9945FF] shrink-0">
                      <Scale className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white group-hover:text-[#9945FF] truncate">
                          {e.title}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-slate-400">
                          {e.status}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 truncate">
                        ID: {e.id} · Type: {e.conditionType}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <div className="text-xs font-bold font-mono text-emerald-400">
                      {formatCurrency(e.amount, e.currency)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {e.conditionType}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Micro-transactions */}
          {matchedTxs.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#14F195] px-2 flex items-center justify-between">
                <span>Recent M2M Transactions ({matchedTxs.length})</span>
              </div>
              {matchedTxs.map(t => (
                <div
                  key={t.id}
                  onClick={() => {
                    onClose();
                    onSelectTab('micropayments');
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-[#14F195]/40 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[#14F195]/15 border border-[#14F195]/30 flex items-center justify-center text-[#14F195] shrink-0">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white group-hover:text-[#14F195] truncate">
                          {t.serviceCategory}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-slate-400">
                          {t.units}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 truncate">
                        Sig: {t.signature.slice(0, 16)}... · Batch: {t.batchRollupId}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <div className="text-xs font-bold font-mono text-[#14F195]">
                      ${t.amount.toFixed(6)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {t.latencyMs}ms latency
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Corridors */}
          {matchedCorridors.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-blue-400 px-2 flex items-center justify-between">
                <span>FX Settlement Corridors ({matchedCorridors.length})</span>
              </div>
              {matchedCorridors.map(c => (
                <div
                  key={c.id}
                  onClick={() => {
                    onClose();
                    onSelectTab('crossborder');
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-blue-500/40 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                      <Globe2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white group-hover:text-blue-400">
                        {c.fromCurrency} ➔ {c.toCurrency}
                      </span>
                      <div className="text-[10px] font-mono text-slate-400">
                        Method: {c.settlementMethod} · Route: {c.clearingPartners.join(' ➔ ')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold font-mono text-slate-200">
                      1 {c.fromCurrency} = {c.exchangeRate} {c.toCurrency}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono">
                      {c.speedLabel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalResults === 0 && query && (
            <div className="text-center py-10 text-slate-400">
              <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-500 mt-1">Try searching by agent address, contract ID, or transaction hash.</p>
            </div>
          )}
        </div>

        {/* Modal Footer Keybinds */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700">↵</kbd> Select</span>
            <span><kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700">ESC</kbd> Close</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <PaymindLogo size="sm" showText={false} showBadge={false} />
            <span className="font-semibold text-slate-300">PAYMIND AI</span>
            <span>•</span>
            <span>M2M Cluster Explorer</span>
          </div>
        </div>
      </div>
    </div>
  );
};
