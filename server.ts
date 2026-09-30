import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { 
  isQuotaError, 
  getFallbackSearchQueryResponse, 
  getFallbackEscrowVerification 
} from './server/oracleFallback';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: Date.now(),
  });
});

// Helper function to call Gemini with Google Search Grounding
async function callSearchGrounding(prompt: string, customSystemInstruction?: string) {
  const ai = getGenAI();
  const primaryModel = 'gemini-3.8-flash';
  const fallbackModel = 'gemini-3.1-flash-lite';

  const configPayload: any = {
    tools: [{ googleSearch: {} }],
  };

  if (customSystemInstruction) {
    configPayload.systemInstruction = customSystemInstruction;
  }

  try {
    const response = await ai.models.generateContent({
      model: primaryModel,
      contents: prompt,
      config: configPayload,
    });
    return { response, modelUsed: primaryModel, quotaLimited: false };
  } catch (err: any) {
    console.warn(`Primary model ${primaryModel} failed, retrying with ${fallbackModel}:`, err?.message || err);
    try {
      const response = await ai.models.generateContent({
        model: fallbackModel,
        contents: prompt,
        config: configPayload,
      });
      return { response, modelUsed: fallbackModel, quotaLimited: false };
    } catch (fallbackErr: any) {
      // Check if quota error
      if (isQuotaError(err) || isQuotaError(fallbackErr)) {
        console.warn('Gemini 429 quota exhaustion detected across models. Activating autonomous oracle fallback.');
        const quotaErr: any = new Error('QUOTA_EXHAUSTED_429');
        quotaErr.isQuota = true;
        throw quotaErr;
      }
      throw fallbackErr;
    }
  }
}

// Search Grounding General Query endpoint
app.post('/api/grounding/search', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'A search query string is required.' });
      return;
    }

    const systemInstruction = `You are the PAYMIND AI Market & Protocol Oracle. You deliver precise, verified real-time data for autonomous AI agents transacting on M2M rails. 
Always prioritize factual, up-to-date figures (current pricing, network gas rates, protocol specs, dates, FX rates). Be concise, structured, and quantitative.`;

    try {
      const { response, modelUsed } = await callSearchGrounding(query, systemInstruction);

      const text = response.text || 'No response generated.';
      const candidate = response.candidates?.[0];
      const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
      const searchQueries = candidate?.groundingMetadata?.webSearchQueries || [];

      res.json({
        text,
        modelUsed,
        groundingChunks,
        searchQueries,
        quotaLimited: false,
        timestamp: Date.now(),
      });
    } catch (apiErr: any) {
      if (apiErr?.isQuota || isQuotaError(apiErr)) {
        // Return verified fallback dataset smoothly
        const fallbackData = getFallbackSearchQueryResponse(query);
        res.json(fallbackData);
        return;
      }
      throw apiErr;
    }
  } catch (error: any) {
    console.error('Error executing search grounding:', error?.message || error);
    res.status(500).json({
      error: error?.message || 'Failed to execute Google Search Grounding query.',
    });
  }
});

// Escrow Condition Verification endpoint with Search Grounding
app.post('/api/grounding/verify-escrow', async (req: Request, res: Response) => {
  try {
    const { escrowId, title, conditionType, conditionDescription } = req.body;
    if (!title || !conditionDescription) {
      res.status(400).json({ error: 'Escrow title and conditionDescription are required.' });
      return;
    }

    const prompt = `Evaluate the following AI agent escrow contract release criteria using the latest live web information and Google Search verification:
Contract Title: ${title}
Condition Type: ${conditionType || 'custom'}
Condition Terms: ${conditionDescription}

Using current real-time search data, determine:
1. Verification Verdict: Is this condition verifiable or met? (Status: VERIFIED_MET, PENDING_DATA, or INVALID)
2. Ground-truth evidence from the web (cite recent sources, dates, pricing, or release status)
3. Recommended action: RELEASE_PAYMENT, HOLD_ESCROW, or TRIGGER_REFUND
4. Risk score (1-100) for machine counterparty risk.

Format clearly with bullet points and quantitative metrics.`;

    try {
      const { response, modelUsed } = await callSearchGrounding(
        prompt,
        'You are an autonomous escrow arbitrator oracle with access to live Google Search grounding. Evaluate contracts objectively with strict evidentiary standards.'
      );

      const text = response.text || 'No verification report generated.';
      const candidate = response.candidates?.[0];
      const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
      const searchQueries = candidate?.groundingMetadata?.webSearchQueries || [];

      res.json({
        escrowId,
        report: text,
        modelUsed,
        groundingChunks,
        searchQueries,
        quotaLimited: false,
        timestamp: Date.now(),
      });
    } catch (apiErr: any) {
      if (apiErr?.isQuota || isQuotaError(apiErr)) {
        const fallbackEscrow = getFallbackEscrowVerification(title, conditionType || 'deliverable', conditionDescription);
        res.json({
          escrowId,
          ...fallbackEscrow,
          timestamp: Date.now(),
        });
        return;
      }
      throw apiErr;
    }
  } catch (error: any) {
    console.error('Error verifying escrow condition:', error?.message || error);
    res.status(500).json({
      error: error?.message || 'Failed to verify escrow condition with Google Search.',
    });
  }
});

// Market Rates & Compute Grounding endpoint
app.post('/api/grounding/market-intel', async (req: Request, res: Response) => {
  try {
    const prompt = `Provide the current live market benchmark rates for autonomous AI agent infrastructure:
1. Current GPU compute rental spot prices (H100 SXM, A100 80GB per hour on cloud providers like Lambda, RunPod, Together AI).
2. Major AI LLM API pricing benchmarks (input/output per 1M tokens for Gemini, Claude, GPT).
3. Current average Layer-2 gas fees in USD equivalent (Base, Arbitrum, Solana, Polygon) for sub-cent micropayments.
4. Current major stablecoin peg stability (USDC, USDT, EURC) and FX exchange rates.

Keep the summary tightly formatted with tables or crisp bullet points, highlighting the exact current rates and dates.`;

    try {
      const { response, modelUsed } = await callSearchGrounding(
        prompt,
        'You are the real-time financial data feed for the autonomous AI agent economy. Rely strictly on current Google Search data.'
      );

      const text = response.text || 'No market intel available.';
      const candidate = response.candidates?.[0];
      const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];
      const searchQueries = candidate?.groundingMetadata?.webSearchQueries || [];

      res.json({
        intel: text,
        modelUsed,
        groundingChunks,
        searchQueries,
        quotaLimited: false,
        timestamp: Date.now(),
      });
    } catch (apiErr: any) {
      if (apiErr?.isQuota || isQuotaError(apiErr)) {
        const fallbackIntel = getFallbackSearchQueryResponse('GPU compute spot pricing, Base gas, stablecoin pegs');
        res.json({
          intel: fallbackIntel.text,
          modelUsed: fallbackIntel.modelUsed,
          groundingChunks: fallbackIntel.groundingChunks,
          searchQueries: fallbackIntel.searchQueries,
          quotaLimited: true,
          statusNotice: fallbackIntel.statusNotice,
          timestamp: Date.now(),
        });
        return;
      }
      throw apiErr;
    }
  } catch (error: any) {
    console.error('Error fetching market intel:', error?.message || error);
    res.status(500).json({
      error: error?.message || 'Failed to retrieve live market intelligence.',
    });
  }
});

// Start server with Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PAYMIND AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
