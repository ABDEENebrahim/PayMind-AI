import React, { useState, useRef, useEffect } from 'react';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { Sun, Moon, Check, Sliders, TrendingUp, Monitor, Sparkles } from 'lucide-react';

export const ThemeSettingsToggle: React.FC = () => {
  const { theme, setTheme, toggleTheme, isFinancialLight } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Header Toggle Button */}
      <button
        type="button"
        id="header-theme-settings-btn"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
          isFinancialLight
            ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 shadow-sm'
            : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
        }`}
        title="Theme Settings: Switch between Dark Mode and Financial Terminal Light Mode"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {isFinancialLight ? (
          <Sun className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
        ) : (
          <Moon className="w-3.5 h-3.5 text-cyan-400" />
        )}
        <span className="hidden sm:inline font-mono">
          {isFinancialLight ? 'Terminal Light' : 'Dark Mode'}
        </span>
        <span className="text-[10px] px-1 py-0.2 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-mono hidden md:inline">
          {isFinancialLight ? 'DAY' : 'NIGHT'}
        </span>
        <Sliders className="w-3 h-3 text-slate-400" />
      </button>

      {/* Theme Settings Popover */}
      {isOpen && (
        <div
          id="theme-settings-popover"
          className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-4 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Popover Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-500" />
              <span className="font-semibold text-xs text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                Theme Settings
              </span>
            </div>

            {/* Quick Toggle pill */}
            <button
              onClick={toggleTheme}
              id="theme-quick-switch-btn"
              className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Quick Flip</span>
              <span className="text-cyan-500 font-bold">⇄</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            Select your visual interface mode optimized for continuous algorithmic monitoring or high-contrast daylight trading analysis.
          </p>

          {/* Option 1: Financial Terminal (High-Contrast Light Mode) */}
          <div
            id="theme-option-financial-light"
            onClick={() => {
              setTheme('financial-light');
              setIsOpen(false);
            }}
            className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
              isFinancialLight
                ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/20 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Financial Terminal (Light)
                    </span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/30">
                      DAY-TRADING
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    High-contrast daylight theme calibrated for market depth, order book scrutiny, and glaring room readability.
                  </p>
                </div>
              </div>

              {isFinancialLight && (
                <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </div>

            {/* Spec Features */}
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center gap-3 text-[10px] font-mono text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                Anti-Glare Ivory
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                Deep Navy Glyphs
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                Sharp Loss/Gain Delineation
              </span>
            </div>
          </div>

          {/* Option 2: Default Dark Mode */}
          <div
            id="theme-option-dark"
            onClick={() => {
              setTheme('dark');
              setIsOpen(false);
            }}
            className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
              !isFinancialLight
                ? 'bg-slate-100 dark:bg-slate-800/90 border-cyan-500 ring-2 ring-cyan-500/20 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-500 dark:text-cyan-400">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Autonomous Cyber (Dark)
                    </span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-400/30">
                      DEFAULT
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Original deep slate cyber environment built for low-light trading pits and autonomous machine streaming.
                  </p>
                </div>
              </div>

              {!isFinancialLight && (
                <div className="w-5 h-5 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-sm shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </div>

            {/* Spec Features */}
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center gap-3 text-[10px] font-mono text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
                Deep Slate (#020617)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Neon Channel Beacons
              </span>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>Stored in local terminal cache</span>
            <span className="text-cyan-600 dark:text-cyan-400">WCAG AAA Contrast</span>
          </div>
        </div>
      )}
    </div>
  );
};
