import React, { useState } from 'react';
import { X, Scale, ShieldCheck } from 'lucide-react';
import { EscrowContract, AgentWallet, EscrowConditionType, CurrencyCode } from '../types';

interface CreateEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: AgentWallet[];
  onCreateEscrow: (contract: EscrowContract) => void;
}

export const CreateEscrowModal: React.FC<CreateEscrowModalProps> = ({
  isOpen,
  onClose,
  wallets,
  onCreateEscrow,
}) => {
  const [title, setTitle] = useState('');
  const [buyerId, setBuyerId] = useState(wallets[0]?.id || '');
  const [sellerId, setSellerId] = useState(wallets[1]?.id || '');
  const [amount, setAmount] = useState('25.00');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [conditionType, setConditionType] = useState<EscrowConditionType>('llm_oracle_evaluation');
  const [conditionDescription, setConditionDescription] = useState('');
  const [minScore, setMinScore] = useState('0.92');
  const [expectedHash, setExpectedHash] = useState('0x49f2b8491c10712aee409b88a10cc91');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const escrowId = `escrow-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEscrow: EscrowContract = {
      id: escrowId,
      title: title.trim(),
      buyerAgentId: buyerId,
      sellerAgentId: sellerId,
      amount: parseFloat(amount) || 10,
      currency,
      conditionType,
      conditionDescription: conditionDescription || `Disburse funds only if verification condition (${conditionType}) is fulfilled autonomously`,
      targetCriteria: {
        expectedHash: conditionType === 'cryptographic_hash' ? expectedHash : undefined,
        minQualityScore: conditionType === 'llm_oracle_evaluation' ? parseFloat(minScore) : undefined,
        slaMaxLatencyMs: conditionType === 'latency_sla' ? 50 : undefined,
      },
      status: 'active_locked',
      createdAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 2, // 2 hours
    };

    onCreateEscrow(newEscrow);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create Programmable Escrow</h2>
              <p className="text-xs text-slate-400">Lock funds conditionally with zero human intermediary</p>
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
            <label className="text-xs font-semibold text-slate-300">Task or Deliverable Name</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Vector Indexing & Synthesis"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Buyer Agent</label>
              <select
                value={buyerId}
                onChange={(e) => setBuyerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Seller Agent</label>
              <select
                value={sellerId}
                onChange={(e) => setSellerId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Escrow Value</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                >
                  <option value="USD">USD</option>
                  <option value="USDC">USDC</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Condition Logic</label>
              <select
                value={conditionType}
                onChange={(e) => setConditionType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="llm_oracle_evaluation">LLM Oracle Evaluation Quorum</option>
                <option value="cryptographic_hash">SHA-256 Merkle / Checksum Proof</option>
                <option value="multi_milestone">Progressive Milestones</option>
                <option value="latency_sla">Latency SLA Commitment</option>
              </select>
            </div>
          </div>

          {/* Condition Details */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Verification Condition Description</label>
            <input
              type="text"
              value={conditionDescription}
              onChange={(e) => setConditionDescription(e.target.value)}
              placeholder="e.g. Disburse payout only if Veritas Oracle certifies model accuracy >= 0.92"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {conditionType === 'llm_oracle_evaluation' && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Required Consensus Quality Score:</span>
              <input
                type="number"
                step="0.01"
                min="0.5"
                max="1.0"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono text-right"
              />
            </div>
          )}

          {conditionType === 'cryptographic_hash' && (
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400">Expected SHA-256 Commit Hash</label>
              <input
                type="text"
                value={expectedHash}
                onChange={(e) => setExpectedHash(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
              />
            </div>
          )}

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
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              Lock Funds in Escrow
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
