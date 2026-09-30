import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Terminal, 
  FileCode, 
  Layers, 
  Send,
  Zap
} from 'lucide-react';

export const DevProtocolExplorer: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'typescript' | 'python'>('typescript');
  const [rpcMethod, setRpcMethod] = useState<string>('paymind.streamMicropayment');
  const [rpcResponse, setRpcResponse] = useState<string | null>(null);
  const [isSendingRpc, setIsSendingRpc] = useState<boolean>(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const tsCode = `import { PaymindAgentClient } from '@paymind/sdk';

// Initialize non-custodial agent wallet from environment secret
const agent = new PaymindAgentClient({
  privateKey: process.env.PAYMIND_AGENT_KEY, // Ed25519 seed
  did: 'did:paymind:agent:0x892a4e10b12f689c',
  rpcEndpoint: 'https://rpc.paymind.network/v1',
  spendingLimit: {
    maxPerCall: 0.05, // USD
    hourlyCap: 50.00
  }
});

// 1. High-frequency sub-cent micropayment (e.g. paying for 2,400 tokens)
const receipt = await agent.streamMicropayment({
  recipientDid: 'did:paymind:agent:0x334bf772a08910ec',
  amount: 0.00036, // fractional cent
  serviceTag: 'llm_tokens:gpt4o-mini',
  metadata: { tokens: 2400, promptId: 'p-9941' }
});
console.log('Sub-cent settled in ' + receipt.latencyMs + 'ms');

// 2. Programmable Conditional Escrow Lock
const escrow = await agent.createEscrow({
  sellerDid: 'did:paymind:agent:0x00fa82bc1944510d',
  amount: 14.50,
  condition: {
    type: 'llm_oracle_evaluation',
    oracleJudge: 'veritas.paymind.network',
    minScore: 0.92,
    timeoutSeconds: 3600
  }
});`;

  const pyCode = `from paymind import PaymindAgentClient
import os

# Initialize agent custody wallet
agent = PaymindAgentClient(
    private_key=os.environ["PAYMIND_AGENT_KEY"],
    did="did:paymind:agent:0x892a4e10b12f689c",
    max_per_call_usd=0.05
)

# 1. Stream fractional-cent micropayment for web scraping
receipt = agent.stream_micropayment(
    recipient_did="did:paymind:agent:0x334bf772a08910ec",
    amount=0.00072, # $0.00072 USD
    service="crawler:biomedical_journals"
)
print(f"Settled: {receipt.tx_id} in {receipt.latency_ms}ms")

# 2. Lock conditional escrow for verified model weights
escrow = agent.create_conditional_escrow(
    seller_did="did:paymind:agent:0x77c082ea91bc0192",
    amount=85.00,
    expected_sha256="0x992bcf77401a892e88a002bc449174fa"
)`;

  const handleTestRpc = () => {
    setIsSendingRpc(true);
    setTimeout(() => {
      setRpcResponse(JSON.stringify({
        jsonrpc: "2.0",
        result: {
          txId: "tx-m2m-" + Math.random().toString(16).substring(2, 8),
          status: "SETTLED_OFF_CHAIN",
          stateChannel: "sc-0x892a-to-0x334b",
          amount: 0.00042,
          currency: "USD",
          channelBalanceDelta: "+0.00042",
          rollupBatch: "#891,421",
          latencyMs: 11.2,
          ed25519Signature: "0x89ab10cf4949182377a01c44ba90ef19a84499002bb1479ac992019ab7612f0a",
          verified: true
        },
        id: 104
      }, null, 2));
      setIsSendingRpc(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Agent Payment Protocol (APP) Specification</h1>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono text-xs font-semibold">
              v1.4 Machine-Native
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Standardized machine-to-machine payment protocol allowing autonomous agents and multi-agent frameworks (LangChain, AutoGen, CrewAI, LlamaIndex) to transact via HTTP headers and JSON-RPC 2.0.
          </p>
        </div>
      </div>

      {/* Protocol Architecture: Standard HTTP Headers */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white">Standard M2M HTTP Header Handshake</h2>
        </div>
        <p className="text-xs text-slate-300">
          When an agent queries an external API or sub-agent, it attaches cryptographic payment credentials directly to the HTTP request headers:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-cyan-400 font-semibold">X-Paymind-Agent-DID</div>
            <div className="text-[11px] text-slate-400 truncate">did:paymind:agent:0x892a...</div>
            <div className="text-[10px] text-slate-500 font-sans">Originator identity & permissions</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-cyan-400 font-semibold">X-Paymind-Signature</div>
            <div className="text-[11px] text-slate-400 truncate">ed25519:994f10a82b...</div>
            <div className="text-[10px] text-slate-500 font-sans">Cryptographic state channel proof</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-emerald-400 font-semibold">X-Paymind-Micro-Amount</div>
            <div className="text-[11px] text-slate-400">0.00036 USD</div>
            <div className="text-[10px] text-slate-500 font-sans">Fractional value per request/token</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-emerald-400 font-semibold">X-Paymind-Escrow-Id</div>
            <div className="text-[11px] text-slate-400 truncate">escrow-9041-veritas</div>
            <div className="text-[10px] text-slate-500 font-sans">Conditional release lock reference</div>
          </div>
        </div>
      </div>

      {/* Code Snippets & Interactive JSON-RPC Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: SDK Integration */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Agent SDK Quickstart</h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => setSelectedLanguage('typescript')}
                  className={`px-2 py-1 rounded transition-colors ${
                    selectedLanguage === 'typescript' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                  }`}
                >
                  TypeScript
                </button>
                <button
                  onClick={() => setSelectedLanguage('python')}
                  className={`px-2 py-1 rounded transition-colors ${
                    selectedLanguage === 'python' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                  }`}
                >
                  Python
                </button>
              </div>

              <button
                onClick={() => copyToClipboard(selectedLanguage === 'typescript' ? tsCode : pyCode, 'sdk')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1"
                title="Copy Code"
              >
                {copiedSection === 'sdk' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs overflow-x-auto text-slate-300 leading-relaxed max-h-96">
            <pre>{selectedLanguage === 'typescript' ? tsCode : pyCode}</pre>
          </div>
        </div>

        {/* Right Col: Interactive JSON-RPC 2.0 Tester */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Machine JSON-RPC Console</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">ENDPOINT ACTIVE</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400">Select Protocol Method</label>
            <select
              value={rpcMethod}
              onChange={(e) => setRpcMethod(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="paymind.streamMicropayment">paymind.streamMicropayment</option>
              <option value="paymind.createConditionalEscrow">paymind.createConditionalEscrow</option>
              <option value="paymind.submitDeliverableProof">paymind.submitDeliverableProof</option>
              <option value="paymind.netGlobalCorridors">paymind.netGlobalCorridors</option>
            </select>
          </div>

          <button
            onClick={handleTestRpc}
            disabled={isSendingRpc}
            id="protocol-send-rpc-btn"
            className="w-full py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{isSendingRpc ? 'Executing RPC Call...' : 'Execute Machine RPC Call'}</span>
          </button>

          {rpcResponse && (
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Response (HTTP 200 OK):</span>
                <span className="text-emerald-400 font-mono text-[10px]">11.2ms latency</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-56">
                <pre>{rpcResponse}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
