import React, { useState } from 'react';
import { X, Wallet, Shield, Key } from 'lucide-react';
import { AgentWallet, CurrencyCode } from '../types';

interface CreateWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWallet: (wallet: AgentWallet) => void;
}

export const CreateWalletModal: React.FC<CreateWalletModalProps> = ({
  isOpen,
  onClose,
  onCreateWallet,
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<AgentWallet['role']>('Inference Buyer');
  const [balance, setBalance] = useState('250');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [maxPerTx, setMaxPerTx] = useState('10');
  const [maxPerHour, setMaxPerHour] = useState('100');
  const [maxPerDay, setMaxPerDay] = useState('500');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const idHash = Math.random().toString(16).substring(2, 10);
    const newWallet: AgentWallet = {
      id: `agent-${idHash}`,
      name: name.trim(),
      did: `did:paymind:agent:0x${idHash}${Math.random().toString(16).substring(2, 8)}`,
      role,
      status: 'active',
      balance: parseFloat(balance) || 0,
      currency,
      publicKey: `ed25519:${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
      spendingLimits: {
        maxPerTransaction: parseFloat(maxPerTx) || 10,
        maxPerHour: parseFloat(maxPerHour) || 100,
        maxPerDay: parseFloat(maxPerDay) || 500,
        currentHourlySpent: 0,
        currentDailySpent: 0,
        rateLimitPerMinute: 600,
        enforceServiceWhitelist: true,
      },
      allowedServices: ['api.openai.com', 'api.deepseek.ai', 'evaluator.paymind.network'],
      totalTransactionsCount: 0,
      reputationScore: 100.0,
      ownerAddress: '0x' + Math.random().toString(16).substring(2, 12),
      createdAt: new Date().toISOString().split('T')[0],
      avatarSeed: name.toLowerCase().replace(/\s+/g, '-'),
    };

    onCreateWallet(newWallet);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Deploy Machine-Native Agent Wallet</h2>
              <p className="text-xs text-slate-400">Identity and programmable custody for autonomous execution</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Agent Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. DeepSeek Code Optimizer #08"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Agent Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Inference Buyer">Inference Buyer</option>
                <option value="Scraping Worker">Scraping Worker</option>
                <option value="Model Evaluator">Model Evaluator</option>
                <option value="Quant Arbitrageur">Quant Arbitrageur</option>
                <option value="Synthesis Lead">Synthesis Lead</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Initial Allocation</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                >
                  <option value="USD">USD</option>
                  <option value="USDC">USDC</option>
                  <option value="EUR">EUR</option>
                  <option value="JPY">JPY</option>
                  <option value="SGD">SGD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Spending Limits */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Programmable Spending Boundaries (Human-Defined)</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400">Max / Tx ($)</span>
                <input
                  type="number"
                  value={maxPerTx}
                  onChange={(e) => setMaxPerTx(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white mt-0.5"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Max / Hour ($)</span>
                <input
                  type="number"
                  value={maxPerHour}
                  onChange={(e) => setMaxPerHour(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white mt-0.5"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Max / Day ($)</span>
                <input
                  type="number"
                  value={maxPerDay}
                  onChange={(e) => setMaxPerDay(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white mt-0.5"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
            >
              Deploy Machine Wallet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
