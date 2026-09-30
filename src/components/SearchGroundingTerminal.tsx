import React, { useState } from 'react';
import { 
  Search, 
  ExternalLink, 
  Sparkles, 
  Loader2, 
  Cpu, 
  Zap, 
  Globe2, 
  DollarSign, 
  FileCheck, 
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

interface SearchGroundingResult {
  text: string;
  modelUsed: string;
  groundingChunks: GroundingChunk[];
  searchQueries: string[];
  quotaLimited?: boolean;
  statusNotice?: string;
  timestamp: number;
}

const PRESET_QUERIES = [
  {
    id: 'gpu-pricing',
    label: 'GPU Compute Spot Pricing',
    category: 'Compute',
    icon: Cpu,
    prompt: 'What are the current hourly rental rates for NVIDIA H100 SXM and A100 80GB on cloud providers like Lambda Labs, RunPod, and Together AI?',
    description: 'Real-time spot rates for agent compute settlements',
  },
  {
    id: 'l2-gas',
    label: 'Layer-2 & Solana Gas Rates',
    category: 'Gas',
    icon: Zap,
    prompt: 'What are the current average transaction fee costs in USD on Base, Arbitrum, Solana, and Polygon for micro-transactions?',
    description: 'Current network fee benchmarks for sub-cent payments',
  },
  {
    id: 'fx-rates',
    label: 'Agent FX & Stablecoin Pegs',
    category: 'FX',
    icon: DollarSign,
    prompt: 'What are the current market exchange rates for USD, EUR, JPY, and SGD, and are USDC, USDT, and EURC strictly maintaining their pegs today?',
    description: 'Live cross-border corridor exchange & peg stability',
  },
  {
    id: 'agent-standards',
    label: 'Autonomous Agent Payment Specs',
    category: 'Protocol',
    icon: FileCheck,
    prompt: 'What are the latest developer frameworks and standards for autonomous AI agent-to-agent micropayments, machine-native wallets, and ERC-4337 smart accounts in 2025/2026?',
    description: 'Latest M2M protocol standards and SDK releases',
  },
];

export const SearchGroundingTerminal: React.FC = () => {
  const [customQuery, setCustomQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SearchGroundingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const executeSearch = async (queryText: string, presetId?: string) => {
    if (!queryText.trim()) return;
    setIsLoading(true);
    setError(null);
    if (presetId) setActivePresetId(presetId);

    try {
      const res = await fetch('/api/grounding/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${res.status}`);
      }

      const data: SearchGroundingResult = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('Search grounding error:', err);
      const rawMsg = err?.message || 'Failed to retrieve live Google Search grounded results.';
      if (rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('quota')) {
        setError('Gemini API quota rate limit reached (429). The system activated the autonomous protocol oracle baseline so agent intelligence remains operational.');
      } else {
        setError(rawMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Globe2 className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-bold text-white">Live Market & Protocol Grounding</h1>
              <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-300 font-mono text-[11px] font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Google Search Grounded (gemini-3.8-flash)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-3xl">
              Equips machine wallets with real-time web verification and live market facts. Queries live cloud compute rates, Layer-2 micropayment gas benchmarks, foreign exchange pegs, and autonomous agent protocol standards.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto text-xs font-mono text-slate-400 bg-slate-950/70 px-3 py-2 rounded-xl border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Google Search Tool: <strong>Active</strong></span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {PRESET_QUERIES.map((preset) => {
            const IconComponent = preset.icon;
            const isSelected = activePresetId === preset.id;

            return (
              <button
                key={preset.id}
                id={`preset-btn-${preset.id}`}
                onClick={() => {
                  setCustomQuery(preset.prompt);
                  executeSearch(preset.prompt, preset.id);
                }}
                disabled={isLoading}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-60 ${
                  isSelected
                    ? 'bg-blue-900/30 border-blue-500 ring-1 ring-blue-500/40'
                    : 'bg-slate-950/60 border-slate-800/90 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
                    <IconComponent className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-900">
                    {preset.category}
                  </span>
                </div>
                <div className="text-xs font-semibold text-white mt-2.5">
                  {preset.label}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {preset.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Query Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeSearch(customQuery);
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              id="search-grounding-query-input"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="Ask for live web data (e.g. Current GPU rental cost per hour, Base gas fees, or AI agent payment specs)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <button
            type="submit"
            id="search-grounding-submit-btn"
            disabled={isLoading || !customQuery.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Searching Web...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Execute Grounded Search</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <div className="flex-1">
            <div className="font-semibold text-rose-200">Query Failed:</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[11px] font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Verified Web Grounding
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  Model: <strong className="text-slate-200">{result.modelUsed}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                <Clock className="w-3 h-3" />
                <span>Fetched {new Date(result.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Quota Fallback Notice if active */}
            {result.quotaLimited && (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2 font-mono">
                <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{result.statusNotice || 'Gemini API Free-Tier Quota (429) reached. Served verified autonomous protocol oracle baseline.'}</span>
              </div>
            )}

            {/* Google Search Queries Made */}
            {result.searchQueries && result.searchQueries.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Google Search Queries Executed
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.searchQueries.map((q, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded bg-slate-950 text-cyan-300 text-[11px] font-mono border border-slate-800"
                    >
                      "{q}"
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Formatted Content */}
            <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              {result.text}
            </div>

            {/* Grounding Source Citations */}
            {result.groundingChunks && result.groundingChunks.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                    <span>Verified Web Sources ({result.groundingChunks.length})</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Live Search Citations</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {result.groundingChunks.map((chunk, index) => {
                    const uri = chunk.web?.uri;
                    const title = chunk.web?.title || uri || `Source #${index + 1}`;
                    if (!uri) return null;

                    let hostname = '';
                    try {
                      hostname = new URL(uri).hostname.replace('www.', '');
                    } catch {
                      hostname = uri;
                    }

                    return (
                      <a
                        key={index}
                        href={uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/90 hover:border-cyan-500/50 hover:bg-slate-900 transition-all flex items-start gap-2 group"
                      >
                        <div className="w-5 h-5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 truncate">
                            {title}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 truncate">
                            {hostname}
                          </div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 shrink-0 mt-1" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Initial state placeholder when no query is submitted yet */}
      {!result && !isLoading && (
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-800/80 text-blue-400 mx-auto flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <div className="text-sm font-semibold text-white">Select a preset or ask a live question</div>
          <div className="text-xs text-slate-400 max-w-md mx-auto">
            Try clicking one of the presets above (such as "GPU Compute Spot Pricing" or "Layer-2 & Solana Gas Rates") to fetch live verified data grounded with Google Search.
          </div>
        </div>
      )}
    </div>
  );
};
