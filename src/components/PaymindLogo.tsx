import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface PaymindLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showBadge?: boolean;
  badgeText?: string;
  className?: string;
  onClick?: () => void;
}

export const PaymindLogo: React.FC<PaymindLogoProps> = ({
  size = 'md',
  showText = true,
  showBadge = true,
  badgeText = 'M2M EXPLORER',
  className = '',
  onClick,
}) => {
  const { isFinancialLight } = useTheme();

  // Pixel sizing mapping
  const iconDimensions = {
    sm: { width: 24, height: 24, boxSize: 'w-7 h-7' },
    md: { width: 32, height: 32, boxSize: 'w-9 h-9' },
    lg: { width: 40, height: 40, boxSize: 'w-11 h-11' },
    xl: { width: 48, height: 48, boxSize: 'w-14 h-14' },
  }[size];

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  }[size];

  const uniqueId = React.useId().replace(/:/g, '');

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Precision Geometric SVG Icon Emblem */}
      <div
        className={`${iconDimensions.boxSize} rounded-xl flex items-center justify-center relative overflow-hidden transition-all duration-300 ${
          isFinancialLight
            ? 'bg-gradient-to-br from-emerald-50 via-sky-50 to-indigo-50 border border-emerald-300 shadow-sm shadow-emerald-500/10'
            : 'bg-[#0f1420] border border-white/10 shadow-lg shadow-[#14F195]/15'
        }`}
      >
        {/* Subtle background ambient pulse glow */}
        <div
          className={`absolute inset-0 rounded-xl opacity-30 ${
            isFinancialLight
              ? 'bg-gradient-to-br from-emerald-400 to-sky-400 blur-sm'
              : 'bg-gradient-to-br from-[#14F195] via-[#03E1FF] to-[#9945FF] blur-md'
          }`}
        />

        <svg
          width={iconDimensions.width}
          height={iconDimensions.height}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 transition-transform duration-300 hover:scale-105"
        >
          <defs>
            {/* Dark Mode Neon Gradients */}
            <linearGradient id={`pmGrad1_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14F195" />
              <stop offset="60%" stopColor="#03E1FF" />
              <stop offset="100%" stopColor="#9945FF" />
            </linearGradient>

            <linearGradient id={`pmGrad2_${uniqueId}`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#03E1FF" />
              <stop offset="100%" stopColor="#14F195" />
            </linearGradient>

            {/* Light Mode High-Contrast Institutional Gradients */}
            <linearGradient id={`pmLightGrad1_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="60%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>

            <linearGradient id={`pmLightGrad2_${uniqueId}`} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            <filter id={`pmGlow_${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="1.5"
                floodColor={isFinancialLight ? '#059669' : '#14F195'}
                floodOpacity={isFinancialLight ? '0.3' : '0.6'}
              />
            </filter>
          </defs>

          {/* Facet 1: The 'P' & Left Neural Node Arc (Autonomous Machine Protocol) */}
          <path
            d="M8 32V8H22C25.3137 8 28 10.6863 28 14C28 17.3137 25.3137 20 22 20H15V32H8Z"
            fill={isFinancialLight ? `url(#pmLightGrad1_${uniqueId})` : `url(#pmGrad1_${uniqueId})`}
            fillRule="evenodd"
            clipRule="evenodd"
            opacity="0.95"
            filter={`url(#pmGlow_${uniqueId})`}
          />

          {/* Facet 2: The 'M' Interlocking Circuit / Lightning Micropayment Beam */}
          <path
            d="M17 12L25 21L33 12V32H27V21L25 24L20 18.5V32H15V12H17Z"
            fill={isFinancialLight ? `url(#pmLightGrad2_${uniqueId})` : `url(#pmGrad2_${uniqueId})`}
            opacity="0.9"
          />

          {/* Central High-Speed Atomic Settlement Node (Diamond Core) */}
          <path
            d="M25 17L28 21L25 25L22 21L25 17Z"
            fill={isFinancialLight ? '#ffffff' : '#ffffff'}
            className="drop-shadow-xs"
          />

          {/* Micro-sparkle pulse at apex */}
          <circle
            cx="25"
            cy="21"
            r="1.2"
            fill={isFinancialLight ? '#0284c7' : '#14F195'}
          />
        </svg>
      </div>

      {/* Typography Brand Name & Badge */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`font-black tracking-tight font-sans ${textSizeClasses} ${
                isFinancialLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              PAYMIND
              <span
                className={`ml-1 font-black ${
                  isFinancialLight ? 'text-emerald-700' : 'solana-text-gradient'
                }`}
              >
                AI
              </span>
            </span>

            {showBadge && (
              <span
                className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wide uppercase transition-colors ${
                  isFinancialLight
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs'
                    : 'bg-slate-900 text-[#14F195] border border-[#14F195]/30'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {badgeText}
              </span>
            )}
          </div>
          <p
            className={`text-[10px] hidden sm:block font-mono ${
              isFinancialLight ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            Machine-to-Machine Settlement Rail
          </p>
        </div>
      )}
    </div>
  );
};
