import { EscrowContract } from '../types';

export interface EscrowExpirationInfo {
  totalDurationMs: number;
  elapsedMs: number;
  remainingMs: number;
  progressRatio: number; // 0.0 to 1.0
  progressPercent: number; // 0 to 100
  isPast75Percent: boolean;
  isExpired: boolean;
  hasProof: boolean;
  isUrgentAlert: boolean; // triggers when contract reaches 75% of expiration time without proof submission
  timeRemainingFormatted: string;
}

export function getEscrowExpirationInfo(escrow: EscrowContract, now: number = Date.now()): EscrowExpirationInfo {
  const totalDurationMs = Math.max(1000, escrow.expiresAt - escrow.createdAt);
  const elapsedMs = Math.max(0, now - escrow.createdAt);
  const remainingMs = Math.max(0, escrow.expiresAt - now);
  const progressRatio = Math.min(1, elapsedMs / totalDurationMs);
  const progressPercent = Math.min(100, Math.round(progressRatio * 100));
  
  const isPast75Percent = progressRatio >= 0.75;
  const isExpired = now >= escrow.expiresAt;
  const hasProof = !!escrow.submittedProof;
  
  // Triggers visual alert when an escrow contract reaches 75% of its expiration time without a proof submission
  const isUrgentAlert = (escrow.status === 'active_locked') && !hasProof && isPast75Percent;

  let timeRemainingFormatted = 'Expired';
  if (remainingMs > 0) {
    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
    if (hours > 0) {
      timeRemainingFormatted = `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      timeRemainingFormatted = `${minutes}m ${seconds}s`;
    } else {
      timeRemainingFormatted = `${seconds}s`;
    }
  }

  return {
    totalDurationMs,
    elapsedMs,
    remainingMs,
    progressRatio,
    progressPercent,
    isPast75Percent,
    isExpired,
    hasProof,
    isUrgentAlert,
    timeRemainingFormatted,
  };
}
