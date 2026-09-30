import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Wifi, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Radio, 
  Server, 
  Layers, 
  X, 
  RefreshCw,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NetworkStatusProps {
  isStreaming?: boolean;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ isStreaming = true }) => {
  const { isFinancialLight } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [latency, setLatency] = useState(12);
  const [jitter, setJitter] = useState(1.4);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<number | null>(null);
  const [heartbeatTime, setHeartbeatTime] = useState<string>(new Date().toLocaleTimeString());
  const modalRef = useRef<HTMLDivElement>(null);

  // Periodic subtle latency fluctuation when streaming is active to show live performance
  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      // Fluctuate between 9ms and 15ms
      const delta = (Math.random() * 4 - 2);
      setLatency(prev => {
        const next = Math.round((prev + delta * 0.4) * 10) / 10;
        return Math.max(8.5, Math.min(16.5, next));
      });
      setJitter(Math.round((1.2 + Math.random() * 0.6) * 10) / 10);
      setHeartbeatTime(new Date().toLocaleTimeString());
    }, 3500);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Handle outside click & Escape
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
      document.addEventListener('keydown', handleKey);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  // Simulate active diagnostic ping
  const handlePingTest = () => {
    setIsPinging(true);
    setPingResult(null);
    const start = performance.now();
    setTimeout(() => {
      const duration = Math.round((performance.now() - start) * 0.25 * 10) / 10;
      const finalLatency = Math.max(9.2, Math.min(14.8, duration));
      setPingResult(finalLatency);
      setLatency(finalLatency);
      setIsPinging(false);
    }, 450);
  };

  const uptimePct = '99.984%';

  return (
    <div className="relative inline-block" ref={modalRef}>
      {/* Header Indicator Pill */}
      <button
        type="button"
        id="header-network-status-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="M2M Settlement Rail Network Status & Performance"
        className={`flex items-center gap-2 px-2.5 py-1 rounded text-xs font-mono border transition-all cursor-pointer ${
          isFinancialLight
            ? 'bg-emerald-50/90 text-emerald-900 border-emerald-300 hover:bg-emerald-100 shadow-xs'
            : 'bg-slate-950/85 text-slate-300 border-slate-800 hover:bg-slate-900 hover:text-white'
        }`}
        aria-expanded={isOpen}
      >
        {/* Pulsing beacon */}
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            latency < 20 ? 'bg-emerald-400' : 'bg-amber-400'
          }`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            latency < 20 ? 'bg-emerald-500' : 'bg-amber-500'
          }`} />
        </span>

        <span className="text-slate-400 dark:text-slate-400 hidden xs:inline">Rail:</span>
        <span className="font-bold text-emerald-600 dark:text-emerald-400">{latency.toFixed(1)}ms</span>

        <span className="text-slate-400 dark:text-slate-600 hidden sm:inline">|</span>

        <span className="hidden sm:inline text-slate-400">Uptime:</span>
        <span className="hidden sm:inline font-semibold text-cyan-600 dark:text-cyan-300">{uptimePct}</span>

        <Activity className="w-3 h-3 text-slate-400" />
      </button>

      {/* Network Performance Popover */}
      {isOpen && (
        <div
          id="network-status-popover"
          className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150 text-left"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Wifi className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    M2M Settlement Rail
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
                    HEALTHY
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  State Channel L3 Consensus Engine
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Metric 1: Real-time Latency */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Avg Latency</span>
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1">
                <span>{latency.toFixed(1)}</span>
                <span className="text-xs font-normal text-slate-500">ms</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                <span>Jitter: ±{jitter}ms</span>
                <span className="text-emerald-500">Sub-20ms SLA</span>
              </div>
            </div>

            {/* Metric 2: Uptime SLA */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>30-Day Uptime</span>
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
              </div>
              <div className="text-xl font-bold font-mono text-cyan-600 dark:text-cyan-400 flex items-baseline gap-1">
                <span>{uptimePct}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                <span>Continuous: 720h</span>
                <span className="text-cyan-500">0 Outages</span>
              </div>
            </div>
          </div>

          {/* Infrastructure Nodes & Telemetry */}
          <div className="space-y-2 p-3 rounded-xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 text-xs font-mono">
            <div className="flex items-center justify-between text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-blue-500" />
                Active Clearing Hubs (14/14 Sync)
              </span>
              <span className="text-emerald-500 font-bold">100% SYNC</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 pt-1">
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
                <span>NY4 (Equinix):</span>
                <span className="text-emerald-500 font-bold">11.4ms</span>
              </div>
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
                <span>TY3 (Tokyo):</span>
                <span className="text-emerald-500 font-bold">14.2ms</span>
              </div>
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
                <span>FR2 (Frankfurt):</span>
                <span className="text-emerald-500 font-bold">16.8ms</span>
              </div>
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
                <span>SG1 (Singapore):</span>
                <span className="text-emerald-500 font-bold">18.1ms</span>
              </div>
            </div>
          </div>

          {/* Diagnostic Test Ping & Heartbeat */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            <div className="text-[10px] text-slate-400 font-mono">
              Last Heartbeat: <span className="text-slate-600 dark:text-slate-300">{heartbeatTime}</span>
            </div>

            <button
              onClick={handlePingTest}
              disabled={isPinging}
              id="network-ping-test-btn"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-mono font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isPinging ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3" />
                  <span>Ping Rail</span>
                </>
              )}
            </button>
          </div>

          {pingResult !== null && (
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-700 dark:text-emerald-300 font-mono flex items-center justify-between animate-in fade-in">
              <span>Diagnostic Ping: Responded in <strong>{pingResult}ms</strong></span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">OK</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
