import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Wallet, 
  Scale, 
  Coins, 
  Globe2, 
  Vault, 
  PlayCircle, 
  Code2, 
  Activity,
  TrendingUp,
  Plus,
  LogIn,
  LogOut,
  Database,
  CheckCircle,
  User,
  Loader2,
  Search,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';
import { useTheme } from '../context/ThemeContext';
import { ThemeSettingsToggle } from './ThemeSettingsToggle';
import { NetworkStatus } from './NetworkStatus';
import { TpsSparkline } from './TpsSparkline';
import { PaymindLogo } from './PaymindLogo';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isStreaming: boolean;
  setIsStreaming: React.Dispatch<React.SetStateAction<boolean>>;
  tps: number;
  totalVolume: number;
  activeEscrowCount: number;
  walletCount: number;
  onOpenCreateWallet: () => void;
  onOpenCreateEscrow: () => void;
  onOpenOmnisearch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isStreaming,
  setIsStreaming,
  tps,
  totalVolume,
  activeEscrowCount,
  walletCount,
  onOpenCreateWallet,
  onOpenCreateEscrow,
  onOpenOmnisearch,
}) => {
  const { 
    user, 
    userProfile, 
    loading: authLoading, 
    signInWithGoogle, 
    signOutUser,
    isFirestoreConnected,
    authError 
  } = useFirebase();

  const { isFinancialLight, toggleTheme } = useTheme();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [liveTps, setLiveTps] = useState<number>(tps || 15420);
  const [liveSlot, setLiveSlot] = useState<number>(891421);
  const [liveLatency, setLiveLatency] = useState<number>(11.8);

  // Periodically tick live TPS, Slot, and Latency to mirror Solana Beach performance HUD
  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      setLiveTps(prev => {
        const delta = Math.floor(Math.random() * 420 - 210);
        return Math.max(14100, Math.min(17900, prev + delta));
      });
      setLiveLatency(prev => {
        const delta = (Math.random() * 0.8 - 0.4);
        return Math.max(9.6, Math.min(13.4, Number((prev + delta).toFixed(1))));
      });
      setLiveSlot(prev => prev + 1);
    }, 1200);

    return () => clearInterval(interval);
  }, [isStreaming]);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsSigningIn(false);
    }
  };

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeText?: string;
    pulse?: boolean;
  }

  // 5 Core Explorer Hubs (Solana Beach style)
  const navItems: NavItem[] = [
    { id: 'overview', label: 'Dashboard', icon: Activity },
    { id: 'wallets', label: 'Agent Accounts', icon: Wallet, badge: walletCount },
    { id: 'escrow', label: 'Smart Escrows', icon: Scale, badge: activeEscrowCount },
    { id: 'transactions', label: 'Live Transactions', icon: Coins, pulse: isStreaming },
    { id: 'analytics', label: 'Analytics & Protocol', icon: TrendingUp },
  ];

  const isTabActive = (itemId: string) => {
    if (itemId === 'overview') return activeTab === 'overview';
    if (itemId === 'wallets') return activeTab === 'wallets';
    if (itemId === 'escrow') return activeTab === 'escrow';
    if (itemId === 'transactions') {
      return ['transactions', 'micropayments', 'crossborder', 'treasury'].includes(activeTab);
    }
    if (itemId === 'analytics') {
      return ['analytics', 'grounding', 'simulator', 'developer'].includes(activeTab);
    }
    return activeTab === itemId;
  };

  const handleNavClick = (itemId: string) => {
    if (itemId === 'transactions') {
      // Default to micropayments if not already on one of the transaction subtabs
      if (!['transactions', 'micropayments', 'crossborder', 'treasury'].includes(activeTab)) {
        setActiveTab('micropayments');
      }
    } else if (itemId === 'analytics') {
      if (!['analytics', 'grounding', 'simulator', 'developer'].includes(activeTab)) {
        setActiveTab('analytics');
      }
    } else {
      setActiveTab(itemId);
    }
  };

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md transition-colors duration-200 border-b ${
      isFinancialLight 
        ? 'bg-white/95 border-slate-200 shadow-xs' 
        : 'bg-[#0c1017]/95 border-white/[0.06]'
    }`}>
      {/* Top Infrastructure Health & Ticker Bar */}
      <div className={`px-4 lg:px-8 py-2 border-b flex flex-wrap items-center justify-between gap-3 text-xs transition-colors ${
        isFinancialLight 
          ? 'border-slate-200 bg-slate-50/80 text-slate-600' 
          : 'border-white/[0.06] bg-slate-950/40 text-slate-400'
      }`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isFinancialLight ? 'bg-emerald-500' : 'bg-[#14F195]'
              }`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                isFinancialLight ? 'bg-emerald-600' : 'bg-[#14F195]'
              }`} />
            </span>
            <span className={`font-semibold tracking-tight ${
              isFinancialLight ? 'text-slate-800' : 'text-slate-200'
            }`}>
              PAYMIND L2 SETTLEMENT ENGINE
            </span>
            <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold border ${
              isFinancialLight
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-[#14F195]/10 text-[#14F195] border-[#14F195]/30'
            }`}>
              MAINNET ACTIVE
            </span>
          </div>

          <div className={`hidden sm:flex items-center gap-1.5 font-mono ${
            isFinancialLight ? 'text-slate-600' : 'text-slate-400'
          }`}>
            <span>Rollup Batch:</span>
            <span className={`font-bold font-mono ${
              isFinancialLight ? 'text-sky-700' : 'text-[#03E1FF]'
            }`}>
              #{liveSlot.toLocaleString()}
            </span>
          </div>

          <div className="hidden md:flex items-center">
            <NetworkStatus isStreaming={isStreaming} />
          </div>

          {/* Firestore Status */}
          <div className={`hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-mono ${
            isFinancialLight
              ? 'bg-white border-slate-200 text-slate-600'
              : 'bg-slate-950/80 border-slate-800 text-slate-400'
          }`}>
            <Database className={`w-3 h-3 ${isFinancialLight ? 'text-sky-600' : 'text-[#03E1FF]'}`} />
            <span>Firestore:</span>
            {user ? (
              <span className={`flex items-center gap-1 font-semibold ${
                isFinancialLight ? 'text-emerald-700' : 'text-[#14F195]'
              }`}>
                <CheckCircle className="w-2.5 h-2.5" />
                Live Sync
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400">Local (Sign in to sync)</span>
            )}
          </div>
        </div>

        {/* Global Live Performance HUD with Sparkline & Latency */}
        <div className="flex items-center gap-2.5">
          <div className={`flex items-center gap-2.5 px-3 py-1 rounded-lg border font-mono text-xs shadow-inner ${
            isFinancialLight
              ? 'bg-white border-slate-200 text-slate-700 shadow-slate-100'
              : 'solana-glass border-white/[0.08] text-slate-300'
          }`}>
            <span className={isFinancialLight ? 'text-slate-500 hidden xs:inline' : 'text-slate-400 hidden xs:inline'}>M2M TPS:</span>
            <TpsSparkline compact={true} width={72} height={18} isStreaming={isStreaming} />
            <span className={`font-bold tracking-tight ${
              isFinancialLight ? 'text-emerald-700' : 'text-[#14F195]'
            }`}>
              {liveTps.toLocaleString()}
            </span>
            <span className={isFinancialLight ? 'text-slate-300 hidden sm:inline' : 'text-slate-600 hidden sm:inline'}>|</span>
            <span className={isFinancialLight ? 'text-slate-500 hidden sm:inline' : 'text-slate-400 hidden sm:inline'}>Latency:</span>
            <span className={`font-bold tracking-tight hidden sm:inline ${
              isFinancialLight ? 'text-sky-700' : 'text-[#03E1FF]'
            }`}>
              {liveLatency.toFixed(1)}ms
            </span>
            <span className={isFinancialLight ? 'text-slate-300 hidden md:inline' : 'text-slate-600 hidden md:inline'}>|</span>
            <span className={isFinancialLight ? 'text-slate-500 hidden md:inline' : 'text-slate-400 hidden md:inline'}>24H Vol:</span>
            <span className={`font-semibold hidden md:inline ${
              isFinancialLight ? 'text-slate-800' : 'text-[#03E1FF]'
            }`}>
              ${(totalVolume / 1000000).toFixed(2)}M
            </span>
          </div>

          {/* Quick Stream toggle */}
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            id="header-toggle-stream-btn"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
              isStreaming 
                ? isFinancialLight
                  ? 'bg-sky-50 text-sky-800 border border-sky-300 hover:bg-sky-100 shadow-xs'
                  : 'bg-[#03E1FF]/15 text-[#03E1FF] border border-[#03E1FF]/30 hover:bg-[#03E1FF]/25' 
                : isFinancialLight
                  ? 'bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-300'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${
              isStreaming 
                ? isFinancialLight ? 'text-sky-600 fill-sky-600 animate-pulse' : 'text-[#03E1FF] fill-[#03E1FF] animate-pulse' 
                : ''
            }`} />
            <span>{isStreaming ? 'Stream Active' : 'Stream Paused'}</span>
          </button>

          {/* Quick Theme Mode Switcher */}
          <button
            onClick={toggleTheme}
            id="header-quick-theme-btn"
            title={`Active Theme: ${isFinancialLight ? 'Financial Terminal (Light)' : 'Autonomous Cyber (Dark)'}. Click to switch.`}
            className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono border transition-all cursor-pointer ${
              isFinancialLight
                ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 shadow-xs font-semibold'
                : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {isFinancialLight ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-semibold text-[11px]">TERMINAL LIGHT</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px]">DARK MODE</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className={`px-4 lg:px-8 py-2.5 flex items-center justify-between gap-4 transition-colors ${
        isFinancialLight ? 'bg-white' : 'bg-[#0c1017]'
      }`}>
        {/* Brand Logo & Tagline */}
        <div 
          onClick={() => setActiveTab('overview')} 
          className="shrink-0 cursor-pointer"
          title="PAYMIND AI — Home Overview"
        >
          <PaymindLogo size="md" showText={true} showBadge={true} badgeText="M2M EXPLORER" />
        </div>

        {/* Solana Beach Omnisearch Bar */}
        <div className="flex-1 max-w-lg mx-2 sm:mx-6 hidden md:block">
          <button
            type="button"
            onClick={onOpenOmnisearch}
            id="header-omnisearch-trigger"
            className={`w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border transition-all text-xs group cursor-pointer ${
              isFinancialLight
                ? 'bg-slate-50 hover:bg-white border-slate-300 hover:border-emerald-500 text-slate-500 hover:text-slate-800 shadow-xs'
                : 'bg-slate-950/80 hover:bg-slate-950 border-slate-800 hover:border-[#14F195]/40 text-slate-400 hover:text-slate-200 shadow-inner'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Search className={`w-3.5 h-3.5 ${
                isFinancialLight ? 'text-emerald-600' : 'text-[#14F195]'
              } group-hover:scale-110 transition-transform`} />
              <span className="truncate">Search by Agent DID, Address, Escrow ID, Tx Hash, Batch...</span>
            </div>
            <kbd className={`hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono border shrink-0 ml-2 ${
              isFinancialLight ? 'bg-slate-200 text-slate-600 border-slate-300' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <span>⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Action Buttons, Theme Settings & Auth */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile search button */}
          <button
            type="button"
            onClick={onOpenOmnisearch}
            id="header-mobile-omnisearch-btn"
            className="md:hidden p-2 rounded-lg bg-slate-800/80 text-[#14F195] border border-slate-700/80 hover:bg-slate-750 cursor-pointer"
            title="Search Explorer (⌘K)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Network Status indicator on smaller screens when top bar items are collapsed */}
          <div className="md:hidden">
            <NetworkStatus isStreaming={isStreaming} />
          </div>

          {/* Theme Settings Toggle (Dark Mode vs High-Contrast Financial Terminal) */}
          <ThemeSettingsToggle />

          <button
            onClick={onOpenCreateEscrow}
            id="header-create-escrow-btn"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-[#9945FF]/40 text-xs font-medium transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#9945FF]" />
            <span>+ Lock Escrow</span>
          </button>

          <button
            onClick={onOpenCreateWallet}
            id="header-create-wallet-btn"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg solana-gradient text-slate-950 font-bold text-xs shadow-md shadow-[#14F195]/20 hover:opacity-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New Agent Wallet</span>
          </button>

          {/* Google Auth with Firebase */}
          <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

          {authLoading ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#14F195]" />
              <span>Checking Auth...</span>
            </div>
          ) : user ? (
            <div className="flex items-center gap-2">
              <div 
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 max-w-[200px]"
                title={`Signed in as ${user.email}`}
              >
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className="w-5 h-5 rounded-full object-cover border border-[#14F195]/40 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#14F195]/20 text-[#14F195] font-bold text-[10px] flex items-center justify-center shrink-0">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold text-white truncate">
                    {user.displayName || user.email?.split('@')[0]}
                  </div>
                  <div className="text-[9px] text-[#14F195] font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14F195] inline-block" />
                    Live Cloud Sync
                  </div>
                </div>
              </div>

              <button
                onClick={signOutUser}
                id="header-signout-btn"
                title="Sign Out"
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              id="header-google-signin-btn"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition-all shadow-md shadow-white/10 cursor-pointer disabled:opacity-60"
            >
              {isSigningIn ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-900" />
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <nav className={`px-4 lg:px-8 flex space-x-1 overflow-x-auto scrollbar-none border-t transition-colors ${
        isFinancialLight 
          ? 'border-slate-200 bg-slate-50/90 text-slate-700' 
          : 'border-white/[0.06] bg-[#080b10]/60 text-slate-400'
      }`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isTabActive(item.id);
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className={`relative flex items-center gap-2 py-3 px-3.5 text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? isFinancialLight
                    ? 'text-slate-900 font-bold bg-white shadow-xs rounded-t-lg border-t border-x border-slate-200/80 -mb-[1px]'
                    : 'text-white font-semibold'
                  : isFinancialLight
                    ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${
                isActive 
                  ? isFinancialLight ? 'text-emerald-700' : 'text-[#14F195]' 
                  : isFinancialLight ? 'text-slate-400' : 'text-slate-400'
              }`} />
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                  isActive 
                    ? isFinancialLight
                      ? 'bg-emerald-100 text-emerald-800 font-bold'
                      : 'bg-[#14F195]/20 text-[#14F195] font-semibold'
                    : isFinancialLight
                      ? 'bg-slate-200 text-slate-600'
                      : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
              {item.badgeText && (
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold border ${
                  isFinancialLight
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                }`}>
                  {item.badgeText}
                </span>
              )}
              {item.pulse && (
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  isFinancialLight ? 'bg-emerald-600' : 'bg-[#14F195]'
                }`} />
              )}

              {/* Signature Neon Gradient Active Underline */}
              {isActive && (
                <span 
                  className={`absolute bottom-0 left-0 right-0 h-[2.5px] rounded-full ${
                    isFinancialLight
                      ? 'bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.4)]'
                      : 'solana-gradient shadow-[0_0_10px_rgba(20,241,149,0.7)]'
                  }`} 
                />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
