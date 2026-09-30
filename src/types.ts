export type CurrencyCode = 'USD' | 'EUR' | 'JPY' | 'GBP' | 'SGD' | 'USDC';

export interface SpendingLimits {
  maxPerTransaction: number; // in USD
  maxPerHour: number;
  maxPerDay: number;
  currentHourlySpent: number;
  currentDailySpent: number;
  rateLimitPerMinute: number;
  enforceServiceWhitelist: boolean;
}

export interface AgentWallet {
  id: string;
  name: string;
  did: string; // e.g. did:paymind:agent:0x8f2c...
  role: 'Inference Buyer' | 'Data Provider' | 'Model Evaluator' | 'Scraping Worker' | 'Quant Arbitrageur' | 'Synthesis Lead';
  status: 'active' | 'rate_limited' | 'quarantined' | 'idle';
  balance: number; // in USD
  currency: CurrencyCode;
  publicKey: string; // Ed25519 public key hash
  spendingLimits: SpendingLimits;
  allowedServices: string[];
  totalTransactionsCount: number;
  reputationScore: number; // 0 - 100
  ownerAddress: string;
  createdAt: string;
  avatarSeed: string;
  userId?: string;
}

export type EscrowConditionType = 
  | 'cryptographic_hash' 
  | 'llm_oracle_evaluation' 
  | 'multi_milestone' 
  | 'latency_sla';

export interface EscrowMilestone {
  id: string;
  name: string;
  percentage: number;
  status: 'pending' | 'verified' | 'released';
  verificationHash?: string;
}

export interface EscrowContract {
  id: string;
  title: string;
  buyerAgentId: string;
  sellerAgentId: string;
  amount: number;
  currency: CurrencyCode;
  conditionType: EscrowConditionType;
  conditionDescription: string;
  targetCriteria: {
    expectedHash?: string;
    minQualityScore?: number; // 0.0 - 1.0
    slaMaxLatencyMs?: number;
    milestones?: EscrowMilestone[];
  };
  status: 'active_locked' | 'evaluating_proof' | 'released' | 'disputed_refunded';
  createdAt: number; // timestamp
  expiresAt: number; // timestamp
  submittedProof?: {
    payloadSnippet: string;
    proofHash: string;
    submittedAt: number;
    oracleScore?: number;
    validationLogs: string[];
  };
  settledTxId?: string;
  userId?: string;
}

export interface MicroPaymentTransaction {
  id: string;
  timestamp: number;
  fromAgentId: string;
  toAgentId: string;
  amount: number; // sub-cent, e.g. 0.00042 USD
  currency: CurrencyCode;
  serviceCategory: 'LLM Tokens' | 'Vector Retrieval' | 'Web Scraping' | 'Data Validation' | 'Arbitrage Leg';
  units: string; // e.g. '1,420 tokens', '4 vectors', '1 html parse'
  latencyMs: number;
  batchRollupId: string;
  stateChannelId: string;
  status: 'settled' | 'batched' | 'streaming';
  gasFeeSubCent: number; // e.g. 0.000005 USD
  signature: string;
  userId?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
}

export interface CrossBorderCorridor {
  id: string;
  name: string;
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  fromHub: string;
  toHub: string;
  fxRate: number;
  spreadBps: number;
  settlementLatencyMs: number;
  dailyVolume: number;
  nettedSavingsPct: number;
  activeLiquidity: number;
  status: 'optimal' | 'rebalancing' | 'surging';
}

export interface TreasuryPool {
  id: string;
  asset: CurrencyCode;
  totalLiquidity: number;
  agentReserved: number;
  activeYieldingReserve: number;
  currentApy: number;
  strategy: 'Dynamic Liquidity Buffer' | 'Automated Overnight Sweep' | 'High-Frequency Netting Reserve';
  counterpartyRiskBuffer: number;
  healthFactor: number; // e.g. 99.8%
}

export interface SimulationStep {
  stepIndex: number;
  title: string;
  description: string;
  initiatorAgentId: string;
  targetAgentId: string;
  actionType: 'open_channel' | 'stream_micropayments' | 'lock_escrow' | 'verify_deliverable' | 'settle_fx';
  amount: number;
  currency: CurrencyCode;
  details: string;
}

export interface SimulationScenario {
  id: string;
  title: string;
  category: string;
  description: string;
  totalVolume: number;
  agentsInvolved: string[];
  steps: SimulationStep[];
}
