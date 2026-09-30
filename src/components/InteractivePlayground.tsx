import React, { useState } from 'react';
import { 
  PlayCircle, 
  RotateCcw, 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  Coins, 
  Scale, 
  Terminal,
  Activity
} from 'lucide-react';
import { SimulationScenario, AgentWallet, EscrowContract } from '../types';
import { formatCurrency, formatSubCent } from '../utils/formatters';

interface InteractivePlaygroundProps {
  scenarios: SimulationScenario[];
  wallets: AgentWallet[];
  onExecuteSimulationStep: (stepDetails: {
    fromId: string;
    toId: string;
    amount: number;
    actionType: string;
    description: string;
  }) => void;
}

export const InteractivePlayground: React.FC<InteractivePlaygroundProps> = ({
  scenarios,
  wallets,
  onExecuteSimulationStep,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[0]?.id || '');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlayingAuto, setIsPlayingAuto] = useState<boolean>(false);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    '[INIT] Simulation harness ready. Selected scenario loaded.',
    '[READY] Agents standing by with funded machine-native wallets.',
  ]);

  const activeScenario = scenarios.find(s => s.id === selectedScenarioId) || scenarios[0];
  const steps = activeScenario.steps;

  const handleStepForward = () => {
    if (currentStepIndex >= steps.length) return;
    const step = steps[currentStepIndex];
    
    // Execute simulation step callback
    onExecuteSimulationStep({
      fromId: step.initiatorAgentId,
      toId: step.targetAgentId,
      amount: step.amount,
      actionType: step.actionType,
      description: step.description,
    });

    // Add log
    setConsoleLogs(prev => [
      `[STEP ${step.stepIndex}] ${step.title}: ${step.details}`,
      `[SETTLED] ${step.actionType.toUpperCase()} - ${formatCurrency(step.amount, step.currency)} transferred via Paymind Rail`,
      ...prev,
    ]);

    setCurrentStepIndex(prev => prev + 1);
  };

  const handleAutoPlay = () => {
    if (isPlayingAuto) return;
    setIsPlayingAuto(true);
    let idx = currentStepIndex;

    const interval = setInterval(() => {
      if (idx >= steps.length) {
        clearInterval(interval);
        setIsPlayingAuto(false);
        return;
      }
      const step = steps[idx];
      onExecuteSimulationStep({
        fromId: step.initiatorAgentId,
        toId: step.targetAgentId,
        amount: step.amount,
        actionType: step.actionType,
        description: step.description,
      });

      setConsoleLogs(prev => [
        `[STEP ${step.stepIndex}] ${step.title}: ${step.details}`,
        `[SETTLED] ${step.actionType.toUpperCase()} - ${formatCurrency(step.amount, step.currency)} verified & executed`,
        ...prev,
      ]);

      idx++;
      setCurrentStepIndex(idx);

      if (idx >= steps.length) {
        clearInterval(interval);
        setIsPlayingAuto(false);
      }
    }, 1500);
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlayingAuto(false);
    setConsoleLogs([
      `[RESET] Simulation scenario "${activeScenario.title}" reset to genesis state.`,
      '[READY] Ready for new step execution.',
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Multi-Agent Transaction Simulator</h1>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono text-xs font-semibold">
              Live Orchestration
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Watch autonomous AI agents negotiate, delegate tasks, stream fractional-cent micropayments, and unlock conditional escrow deliverables in real time.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleStepForward}
            disabled={currentStepIndex >= steps.length || isPlayingAuto}
            id="playground-step-forward-btn"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <span>Next Step ({currentStepIndex + 1}/{steps.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleAutoPlay}
            disabled={currentStepIndex >= steps.length || isPlayingAuto}
            id="playground-autoplay-btn"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current text-emerald-400" />
            <span>{isPlayingAuto ? 'Running...' : 'Auto-Run Scenario'}</span>
          </button>

          <button
            onClick={handleReset}
            id="playground-reset-btn"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {scenarios.map((sc) => {
          const isSelected = sc.id === selectedScenarioId;
          return (
            <div
              key={sc.id}
              onClick={() => {
                setSelectedScenarioId(sc.id);
                setCurrentStepIndex(0);
                setIsPlayingAuto(false);
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono">
                  {sc.category}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {sc.steps.length} Steps
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-2">{sc.title}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{sc.description}</p>
            </div>
          );
        })}
      </div>

      {/* Interactive Step Stepper & Visual Execution Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Steps Stepper (Left 6 Cols) */}
        <div className="lg:col-span-6 rounded-2xl bg-slate-900/70 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Scenario Execution Sequence</span>
            </h3>
            <span className="text-xs font-mono text-cyan-400 font-semibold">
              Step {Math.min(currentStepIndex, steps.length)} of {steps.length} Completed
            </span>
          </div>

          <div className="space-y-3">
            {steps.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const fromAgent = wallets.find(w => w.id === step.initiatorAgentId);
              const toAgent = wallets.find(w => w.id === step.targetAgentId);

              return (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-slate-800/90 border-cyan-400 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/30'
                      : isPast
                      ? 'bg-slate-950/60 border-slate-800 opacity-80'
                      : 'bg-slate-950/40 border-slate-800/60 opacity-40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        isPast 
                          ? 'bg-emerald-500 text-slate-950' 
                          : isCurrent 
                          ? 'bg-cyan-500 text-slate-950 animate-pulse' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isPast ? <CheckCircle2 className="w-4 h-4" /> : step.stepIndex}
                      </div>

                      <div>
                        <div className="text-xs font-bold text-white">{step.title}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {fromAgent?.name || step.initiatorAgentId} ➔ {toAgent?.name || step.targetAgentId}
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-emerald-400">
                        {formatCurrency(step.amount, step.currency)}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase">
                        {step.actionType.replace('_', ' ')}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 pl-8">
                    {step.description}
                  </p>

                  <div className="mt-2 pl-8 text-[11px] font-mono text-cyan-400/80">
                    {step.details}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Execution Console & Protocol Stream (Right 6 Cols) */}
        <div className="lg:col-span-6 rounded-2xl bg-slate-900/70 border border-slate-800 p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">M2M Rail Execution Telemetry</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono text-[10px]">
                LIVE LOGS
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2 h-96 overflow-y-auto">
              {consoleLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-cyan-500 font-bold shrink-0">&gt;</span>
                  <span className={
                    log.includes('[SETTLED]') 
                      ? 'text-emerald-400' 
                      : log.includes('[STEP') 
                      ? 'text-cyan-300 font-semibold' 
                      : 'text-slate-300'
                  }>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Protocol Latency: <strong className="text-white font-mono">11.4 ms</strong></span>
            <span>Zero Gas Spent: <strong className="text-emerald-400 font-mono">zk-Rollup</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
