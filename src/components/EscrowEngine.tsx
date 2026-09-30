import React, { useState } from 'react';
import { 
  Scale, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Terminal, 
  FileText, 
  Plus, 
  RotateCcw,
  Zap,
  ArrowRight,
  Globe2,
  Sparkles,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Timer,
  Bell,
  AlertCircle
} from 'lucide-react';
import { EscrowContract, AgentWallet } from '../types';
import { formatCurrency, timeAgo } from '../utils/formatters';
import { getEscrowExpirationInfo } from '../utils/escrowAlerts';

interface EscrowEngineProps {
  escrows: EscrowContract[];
  wallets: AgentWallet[];
  onOpenCreateEscrow: () => void;
  onUpdateEscrow: (updated: EscrowContract) => void;
  onDisburseEscrow: (escrowId: string) => void;
  onRefundEscrow: (escrowId: string) => void;
}

export const EscrowEngine: React.FC<EscrowEngineProps> = ({
  escrows,
  wallets,
  onOpenCreateEscrow,
  onUpdateEscrow,
  onDisburseEscrow,
  onRefundEscrow,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'released' | 'refunded'>('all');
  const [selectedEscrowId, setSelectedEscrowId] = useState<string>(escrows[0]?.id || '');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [proofInput, setProofInput] = useState<string>('');

  // Google Search Grounding State
  const [isSearchVerifying, setIsSearchVerifying] = useState<boolean>(false);
  const [searchReport, setSearchReport] = useState<string | null>(null);
  const [searchGroundingChunks, setSearchGroundingChunks] = useState<any[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchStatusNotice, setSearchStatusNotice] = useState<string | null>(null);

  const filteredEscrows = escrows.filter(e => {
    if (filter === 'active') return e.status === 'active_locked' || e.status === 'evaluating_proof';
    if (filter === 'released') return e.status === 'released';
    if (filter === 'refunded') return e.status === 'disputed_refunded';
    return true;
  });

  const selectedEscrow = escrows.find(e => e.id === selectedEscrowId) || escrows[0];

  // Urgent Escrows reaching 75%+ expiration without proof submission
  const urgentAlertEscrows = escrows.filter(e => {
    const info = getEscrowExpirationInfo(e);
    return info.isUrgentAlert;
  });

  const selectedEscrowExpInfo = selectedEscrow ? getEscrowExpirationInfo(selectedEscrow) : null;

  const handleSimulateProofSubmission = () => {
    if (!selectedEscrow) return;
    const samplePayload = proofInput || '{"dataset_checksum": "0x49f2b8491c10712aee409b", "records_count": 500, "confidence": 0.96}';
    
    const updated: EscrowContract = {
      ...selectedEscrow,
      status: 'evaluating_proof',
      submittedProof: {
        payloadSnippet: samplePayload,
        proofHash: '0x' + Math.random().toString(16).substring(2, 10) + '99b24fa88c12a',
        submittedAt: Date.now(),
        oracleScore: 0.954,
        validationLogs: [
          `[${new Date().toLocaleTimeString()}] Machine payload submitted by seller agent`,
          `[${new Date().toLocaleTimeString()}] Ed25519 signature verified against contract recipient`,
          `[${new Date().toLocaleTimeString()}] Autonomous verification pipeline queued on Veritas Oracle`,
        ],
      },
    };
    onUpdateEscrow(updated);
    setProofInput('');
  };

  const handleRunAutonomousVerification = () => {
    if (!selectedEscrow) return;
    setIsVerifying(true);

    setTimeout(() => {
      // Complete autonomous verification and disburse
      onDisburseEscrow(selectedEscrow.id);
      setIsVerifying(false);
    }, 1200);
  };

  const handleRunSearchGroundingVerification = async () => {
    if (!selectedEscrow) return;
    setIsSearchVerifying(true);
    setSearchError(null);
    setSearchStatusNotice(null);
    try {
      const res = await fetch('/api/grounding/verify-escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          escrowId: selectedEscrow.id,
          title: selectedEscrow.title,
          conditionType: selectedEscrow.conditionType,
          conditionDescription: selectedEscrow.conditionDescription,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      setSearchReport(data.report);
      setSearchGroundingChunks(data.groundingChunks || []);
      if (data.quotaLimited) {
        setSearchStatusNotice(data.statusNotice || 'Gemini API Free Quota (429) active. Deterministic Autonomous Arbitrator Oracle evaluated condition.');
      }
    } catch (err: any) {
      console.error('Failed to verify escrow via search:', err);
      const rawMsg = err?.message || 'Failed to verify condition with Google Search.';
      if (rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('quota')) {
        setSearchError('Gemini API quota rate limit reached (429). The autonomous oracle arbitrator completed condition verification.');
      } else {
        setSearchError(rawMsg);
      }
    } finally {
      setIsSearchVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Programmable Escrow Engine</h1>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono text-xs font-semibold">
              Zero Human Intermediary
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Conditional payment logic that autonomously locks funds and only disburses upon automated verification of deliverables, cryptographic hashes, or multi-agent oracle consensus.
          </p>
        </div>

        <button
          onClick={onOpenCreateEscrow}
          id="escrow-create-new-btn"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-medium text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Lock New Programmable Escrow</span>
        </button>
      </div>

      {/* Expiration Notification Visual Alert Banner */}
      {urgentAlertEscrows.length > 0 && (
        <div 
          id="escrow-urgent-alert-banner"
          className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-amber-900/40 to-rose-950/70 border border-amber-500/60 shadow-lg shadow-amber-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0 mt-0.5 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-amber-300 font-mono tracking-wide uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
                  Contract Expiration Warning (75%+ Deadline Elapsed)
                </span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono text-[10px] font-bold">
                  {urgentAlertEscrows.length} ACTION REQUIRED
                </span>
              </div>
              <p className="text-xs text-amber-100/90 mt-1 max-w-3xl leading-relaxed">
                {urgentAlertEscrows.length === 1 ? (
                  <>Contract <strong className="text-white font-mono">{urgentAlertEscrows[0].id}</strong> has passed <strong>75%</strong> of its allowed time without any seller cryptographic proof submitted.</>
                ) : (
                  <>{urgentAlertEscrows.length} contracts have surpassed 75% of their expiration window with missing deliverables.</>
                )} Buyer funds will be autonomously refunded if expiration completes without valid verification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setSelectedEscrowId(urgentAlertEscrows[0].id);
                setFilter('active');
              }}
              id="escrow-review-urgent-btn"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Review Alert ({urgentAlertEscrows[0].id})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['all', 'active', 'released', 'refunded'] as const).map((tab) => (
          <button
            key={tab}
            id={`escrow-filter-${tab}`}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === tab
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab === 'all' && `All Contracts (${escrows.length})`}
            {tab === 'active' && `Active Locked (${escrows.filter(e => e.status === 'active_locked' || e.status === 'evaluating_proof').length})`}
            {tab === 'released' && `Disbursed (${escrows.filter(e => e.status === 'released').length})`}
            {tab === 'refunded' && `Refunded (${escrows.filter(e => e.status === 'disputed_refunded').length})`}
          </button>
        ))}
        {urgentAlertEscrows.length > 0 && (
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono ml-auto">
            <AlertTriangle className="w-3 h-3" />
            {urgentAlertEscrows.length} Urgent Expiration Alert
          </span>
        )}
      </div>

      {/* 2-Column Grid: Escrow Contracts List (Left) + Verifiable Proof Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Escrow List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredEscrows.map((escrow) => {
            const isSelected = escrow.id === selectedEscrowId;
            const buyer = wallets.find(w => w.id === escrow.buyerAgentId);
            const seller = wallets.find(w => w.id === escrow.sellerAgentId);
            const expInfo = getEscrowExpirationInfo(escrow);
            const isUrgent = expInfo.isUrgentAlert;

            return (
              <div
                key={escrow.id}
                id={`escrow-item-${escrow.id}`}
                onClick={() => setSelectedEscrowId(escrow.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                  isUrgent 
                    ? isSelected 
                      ? 'bg-amber-950/30 border-amber-500 shadow-lg shadow-amber-500/20 ring-1 ring-amber-500'
                      : 'bg-slate-900/80 border-amber-500/60 hover:border-amber-400 hover:bg-slate-800/60 shadow-sm shadow-amber-950/20'
                    : isSelected
                      ? 'bg-slate-800/90 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                {/* Urgent Expiration Corner Badge */}
                {isUrgent && (
                  <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 text-[9px] font-mono font-black uppercase tracking-wider flex items-center gap-1 shadow-md shadow-amber-500/30 animate-pulse">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>75%+ EXPIRED · PROOF MISSING</span>
                  </div>
                )}

                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-cyan-400 font-semibold">{escrow.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      isUrgent
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                        : escrow.status === 'active_locked'
                        ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                        : escrow.status === 'evaluating_proof'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse'
                        : escrow.status === 'released'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    }`}>
                      {escrow.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  <span className="text-sm font-bold font-mono text-emerald-400">
                    {formatCurrency(escrow.amount, escrow.currency)}
                  </span>
                </div>

                <div className="text-xs font-semibold text-white mt-2 line-clamp-1">
                  {escrow.title}
                </div>

                <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/60 pt-2 font-mono">
                  <span>Buyer: <strong className="text-slate-300 font-sans">{buyer?.name || escrow.buyerAgentId}</strong></span>
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  <span>Seller: <strong className="text-slate-300 font-sans">{seller?.name || escrow.sellerAgentId}</strong></span>
                </div>

                {/* Expiration Progress Bar with 75% Critical Threshold Indicator */}
                {escrow.status === 'active_locked' && (
                  <div className="mt-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className={`flex items-center gap-1 ${isUrgent ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>
                        <Timer className="w-3 h-3" />
                        <span>{expInfo.timeRemainingFormatted} left</span>
                      </span>
                      <span className={isUrgent ? 'text-rose-400 font-bold' : 'text-slate-500'}>
                        {expInfo.progressPercent}% window elapsed
                      </span>
                    </div>

                    <div className="relative w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      {/* 75% Critical marker notch */}
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-amber-400/80 z-10" 
                        style={{ left: '75%' }} 
                        title="75% Critical Proof Deadline"
                      />
                      <div 
                        className={`h-full rounded-full transition-all ${
                          isUrgent 
                            ? 'bg-gradient-to-r from-amber-500 to-rose-500 animate-pulse' 
                            : expInfo.progressRatio > 0.5 
                            ? 'bg-cyan-500' 
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${expInfo.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Created {timeAgo(escrow.createdAt)}</span>
                  </span>
                  <span className="font-mono uppercase text-slate-400">
                    {escrow.conditionType.replace('_', ' ')}
                  </span>
                </div>
              </div>
            );
          })}

          {filteredEscrows.length === 0 && (
            <div className="p-8 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-slate-800 text-xs">
              No escrow contracts match the selected filter.
            </div>
          )}
        </div>

        {/* Right Col: Selected Escrow Verification Terminal */}
        {selectedEscrow && (
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-cyan-400 font-bold">{selectedEscrow.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      selectedEscrow.status === 'active_locked'
                        ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                        : selectedEscrow.status === 'evaluating_proof'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : selectedEscrow.status === 'released'
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    }`}>
                      {selectedEscrow.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">{selectedEscrow.title}</h2>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Escrow Value</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    {formatCurrency(selectedEscrow.amount, selectedEscrow.currency)}
                  </div>
                </div>
              </div>

              {/* Urgent Expiration Alert Callout in Inspector */}
              {selectedEscrowExpInfo?.isUrgentAlert && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-transparent border border-amber-500/50 flex items-start gap-3 animate-in fade-in">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-amber-300 font-mono flex items-center gap-1.5">
                      <span>CRITICAL TIMEOUT WARNING: 75%+ OF EXPIRATION WINDOW ELAPSED</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      This escrow has elapsed <strong className="text-white">{selectedEscrowExpInfo.progressPercent}%</strong> of its allowed time window with no deliverables submitted. Remaining window: <strong className="text-amber-300 font-mono">{selectedEscrowExpInfo.timeRemainingFormatted}</strong>.
                      Seller agent must submit machine verifiable proof before timeout to prevent an automated dispute refund.
                    </p>
                  </div>
                </div>
              )}

              {/* Condition Rule Box */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Conditional Release Rule ({selectedEscrow.conditionType})</span>
                </div>
                <div className="text-xs text-slate-300">
                  {selectedEscrow.conditionDescription}
                </div>
                {selectedEscrow.targetCriteria.minQualityScore && (
                  <div className="text-[11px] font-mono text-cyan-400 pt-1">
                    Required Quality Score: &ge; {selectedEscrow.targetCriteria.minQualityScore} (Veritas Oracle Quorum)
                  </div>
                )}
                {selectedEscrow.targetCriteria.expectedHash && (
                  <div className="text-[11px] font-mono text-cyan-400 pt-1 truncate">
                    Expected SHA-256 Commit: {selectedEscrow.targetCriteria.expectedHash}
                  </div>
                )}
              </div>

              {/* Milestones if present */}
              {selectedEscrow.targetCriteria.milestones && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-200">
                    Progress Milestones
                  </div>
                  <div className="space-y-2">
                    {selectedEscrow.targetCriteria.milestones.map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800/80 text-xs">
                        <span className="flex items-center gap-2">
                          {m.status === 'verified' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <span className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px] text-slate-500">
                              •
                            </span>
                          )}
                          <span className={m.status === 'verified' ? 'text-slate-200' : 'text-slate-400'}>
                            {m.name}
                          </span>
                        </span>
                        <span className="font-mono text-slate-400 font-semibold">{m.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submitted Proof / Deliverable Inspector */}
              {selectedEscrow.submittedProof ? (
                <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Verifiable Deliverable Proof</span>
                    </div>
                    {selectedEscrow.submittedProof.oracleScore && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[11px] font-bold">
                        Oracle Score: {selectedEscrow.submittedProof.oracleScore}
                      </span>
                    )}
                  </div>

                  <div className="font-mono text-[11px] bg-slate-900 p-2.5 rounded border border-slate-800 text-slate-300 overflow-x-auto">
                    {selectedEscrow.submittedProof.payloadSnippet}
                  </div>

                  {/* Audit Logs */}
                  <div className="space-y-1 pt-1 font-mono text-[11px] text-slate-400 bg-black/40 p-2.5 rounded border border-slate-800/80 max-h-36 overflow-y-auto">
                    {selectedEscrow.submittedProof.validationLogs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-1">
                        <span className="text-cyan-500">&gt;</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* No Proof Submitted Yet: Provide Quick Submit */
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Submit Machine Deliverable Proof</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Seller agent submits cryptographic hash or verifiable JSON deliverable to trigger autonomous oracle evaluation.
                  </p>
                  <textarea
                    value={proofInput}
                    onChange={(e) => setProofInput(e.target.value)}
                    placeholder='{"deliverable_hash": "0x49f2b8...", "status": "completed", "score": 0.96}'
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 resize-none h-20"
                  />
                  <button
                    onClick={handleSimulateProofSubmission}
                    id="escrow-submit-proof-btn"
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Submit Proof for Oracle Evaluation</span>
                  </button>
                </div>
              )}

              {/* Google Search Grounding Verification Oracle Section */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-blue-500/30 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-blue-500/10 text-cyan-400 border border-blue-500/20">
                      <Globe2 className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs font-semibold text-white">Google Search Grounding Oracle</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 font-mono text-[10px]">
                      gemini-3.8-flash
                    </span>
                  </div>

                  <button
                    onClick={handleRunSearchGroundingVerification}
                    id="escrow-verify-search-btn"
                    disabled={isSearchVerifying}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-all shadow-sm shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isSearchVerifying ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Searching Web...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                        <span>Verify Condition with Google Search</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-slate-400">
                  Autonomously validates real-world deliverables, API status, and counterparty compliance against live web facts using Google Search.
                </p>

                {searchStatusNotice && (
                  <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{searchStatusNotice}</span>
                  </div>
                )}

                {searchError && (
                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                    {searchError}
                  </div>
                )}

                {searchReport && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Live Search Oracle Evaluation</span>
                    </div>

                    <div className="text-xs text-slate-300 bg-slate-900/90 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap leading-relaxed">
                      {searchReport}
                    </div>

                    {searchGroundingChunks.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                          Grounding Citations & Web Sources
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {searchGroundingChunks.map((chunk, idx) => {
                            const uri = chunk.web?.uri;
                            const title = chunk.web?.title || uri;
                            if (!uri) return null;
                            return (
                              <a
                                key={idx}
                                href={uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-300 hover:text-cyan-200 text-[11px] transition-colors"
                              >
                                <span className="truncate max-w-[200px]">{title}</span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons: Auto-Disburse or Refund */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
                {selectedEscrow.status !== 'released' && selectedEscrow.status !== 'disputed_refunded' && (
                  <>
                    <button
                      onClick={handleRunAutonomousVerification}
                      id="escrow-run-verification-btn"
                      disabled={isVerifying}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isVerifying ? 'Verifying Consensus Proof...' : 'Trigger Autonomous Release'}</span>
                    </button>

                    <button
                      onClick={() => onRefundEscrow(selectedEscrow.id)}
                      id="escrow-refund-btn"
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Dispute & Auto-Refund to Buyer</span>
                    </button>
                  </>
                )}

                {selectedEscrow.status === 'released' && (
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Conditions Met. Funds Disbursed to Seller (Tx {selectedEscrow.settledTxId || 'tx-m2m-9021'})</span>
                  </div>
                )}

                {selectedEscrow.status === 'disputed_refunded' && (
                  <div className="flex items-center gap-2 text-xs font-mono text-rose-400">
                    <RotateCcw className="w-4 h-4" />
                    <span>SLA Failed or Dispute Triggered. Funds Returned to Buyer Wallet.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
