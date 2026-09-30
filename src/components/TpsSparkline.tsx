import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

interface TpsSparklineProps {
  width?: number;
  height?: number;
  className?: string;
  pointsCount?: number;
  isStreaming?: boolean;
  compact?: boolean;
}

export const TpsSparkline: React.FC<TpsSparklineProps> = ({
  width = 90,
  height = 24,
  className = '',
  pointsCount = 30, // 30-second rolling window
  isStreaming = true,
  compact = false,
}) => {
  const { isFinancialLight } = useTheme();

  // 30-second rolling TPS simulation data points (14,000 - 18,000 range)
  const [dataPoints, setDataPoints] = useState<number[]>(() => {
    const base = 15400;
    const initial: number[] = [];
    for (let i = 0; i < pointsCount; i++) {
      const wave = Math.sin(i * 0.35) * 1100;
      const noise = (Math.random() - 0.5) * 800;
      initial.push(Math.round(base + wave + noise));
    }
    return initial;
  });

  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setDataPoints(prev => {
        const last = prev[prev.length - 1] || 15400;
        // Natural oscillation between 14,000 and 18,000 TPS
        const meanTarget = 15800;
        const drift = (meanTarget - last) * 0.12;
        const delta = (Math.random() * 900 - 450) + drift;
        const next = Math.max(14100, Math.min(17950, Math.round(last + delta)));
        return [...prev.slice(1), next];
      });
    }, 1000); // 1-second interval for 30s window

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Compute SVG polyline coordinates
  const minVal = 13800;
  const maxVal = 18200;
  const range = maxVal - minVal;

  const strokeColor = isFinancialLight ? '#059669' : '#14F195';
  const gradStop1 = isFinancialLight ? '#059669' : '#14F195';
  const gradStop2 = isFinancialLight ? '#0284c7' : '#03E1FF';

  const coords = dataPoints.map((val, idx) => {
    const x = (idx / (dataPoints.length - 1)) * width;
    const normalized = (val - minVal) / range;
    const y = height - normalized * (height - 4) - 2;
    return { x, y };
  });

  const polylinePoints = coords.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPolygonPoints = `${polylinePoints} ${width},${height} 0,${height}`;
  const lastPoint = coords[coords.length - 1];

  const gradientId = `sparkline-grad-${compact ? 'compact' : 'full'}-${Math.random().toString(36).substring(2, 6)}`;

  return (
    <div className={`relative inline-flex items-center shrink-0 ${className}`} style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={gradStop1} stopOpacity={isFinancialLight ? 0.3 : 0.4} />
            <stop offset="100%" stopColor={gradStop2} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Fill under sparkline */}
        <polygon points={areaPolygonPoints} fill={`url(#${gradientId})`} />

        {/* Line graph */}
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth={compact ? 1.5 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          points={polylinePoints}
        />

        {/* Pulsing end-dot indicating live stream heartbeat */}
        {lastPoint && isStreaming && (
          <g>
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r={compact ? 2 : 2.5}
              fill={strokeColor}
              className="animate-ping opacity-75 origin-center"
            />
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r={compact ? 1.5 : 2}
              fill={strokeColor}
            />
          </g>
        )}
      </svg>
    </div>
  );
};
