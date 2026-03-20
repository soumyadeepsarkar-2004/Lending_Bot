"use client";

import { useState, useCallback, useEffect } from "react";
import {
  supply,
  withdraw,
  borrow,
  repay,
  liquidate,
  getPosition,
  getHealthFactor,
  getTotalStats,
  getPrice,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}

function DepositIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 7l-5-5-5 5" />
    </svg>
  );
}

function WithdrawIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V2M7 17l5 5 5-5" />
    </svg>
  );
}

function BorrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M2 12h20" />
    </svg>
  );
}

function RepayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 14 4-4 4 4" />
      <path d="M5 10h11a4 4 0 1 1 0 8h-1" />
    </svg>
  );
}

function FireIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// ── Styled Input ─────────────────────────────────────────────

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30 focus-within:shadow-[0_0_20px_rgba(124,108,240,0.08)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
        />
      </div>
    </div>
  );
}

// ── Health Bar ───────────────────────────────────────────────

function HealthBar({ health }: { health: number }) {
  const percentage = Math.min(Math.max(health, 0), 200);
  const isHealthy = health >= 150;
  const isWarning = health >= 120 && health < 150;
  const isDanger = health < 120;

  const color = isHealthy ? "#34d399" : isWarning ? "#fbbf24" : "#f87171";
  const bgColor = isHealthy ? "bg-[#34d399]" : isWarning ? "bg-[#fbbf24]" : "bg-[#f87171]";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/40">Health Factor</span>
        <span className="font-mono" style={{ color }}>{health}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", bgColor)}
          style={{ width: `${(percentage / 200) * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-white/20">
        <span>100%</span>
        <span>120%</span>
        <span>150%</span>
      </div>
    </div>
  );
}

// ── Stats Card ───────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="text-[10px] uppercase tracking-wider text-white/30 mb-1">{label}</p>
      <p className="font-mono text-lg font-semibold" style={{ color }}>{value}</p>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────

type Tab = "dashboard" | "lend" | "borrow" | "liquidate";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // Dashboard state
  const [stats, setStats] = useState<{ total_collateral: number; total_debt: number; total_borrowers: number } | null>(null);
  const [userPosition, setUserPosition] = useState<{ collateral: number; debt: number } | null>(null);
  const [userHealth, setUserHealth] = useState<number>(0);
  const [currentPrice, setCurrentPrice] = useState<number>(100);
  const [isLoading, setIsLoading] = useState(false);

  // Action state
  const [amount, setAmount] = useState("");
  const [borrowerAddr, setBorrowerAddr] = useState("");
  const [isActing, setIsActing] = useState(false);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatAmount = (val: number) => (val / 10000000).toFixed(2);

  const loadData = useCallback(async () => {
    try {
      const [statsData, priceData] = await Promise.all([
        getTotalStats(walletAddress || undefined),
        getPrice(walletAddress || undefined),
      ]);
      if (statsData) setStats(statsData as { total_collateral: number; total_debt: number; total_borrowers: number });
      if (priceData) setCurrentPrice((priceData as number) / 100000);

      if (walletAddress) {
        const [posData, healthData] = await Promise.all([
          getPosition(walletAddress),
          getHealthFactor(walletAddress),
        ]);
        if (posData) setUserPosition(posData as { collateral: number; debt: number });
        if (healthData) setUserHealth((healthData as number) / 100000);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    }
  }, [walletAddress]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleSupply = async () => {
    if (!walletAddress) return setError("Connect wallet first");
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) return setError("Enter a valid amount");
    setError(null);
    setIsActing(true);
    setTxStatus("Awaiting signature...");
    try {
      await supply(walletAddress, BigInt(Math.floor(amountNum * 10000000)));
      setTxStatus("Collateral supplied!");
      setAmount("");
      await loadData();
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsActing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!walletAddress) return setError("Connect wallet first");
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) return setError("Enter a valid amount");
    setError(null);
    setIsActing(true);
    setTxStatus("Awaiting signature...");
    try {
      await withdraw(walletAddress, BigInt(Math.floor(amountNum * 10000000)));
      setTxStatus("Collateral withdrawn!");
      setAmount("");
      await loadData();
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsActing(false);
    }
  };

  const handleBorrow = async () => {
    if (!walletAddress) return setError("Connect wallet first");
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) return setError("Enter a valid amount");
    setError(null);
    setIsActing(true);
    setTxStatus("Awaiting signature...");
    try {
      await borrow(walletAddress, BigInt(Math.floor(amountNum * 10000000)));
      setTxStatus("Borrowed successfully!");
      setAmount("");
      await loadData();
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsActing(false);
    }
  };

  const handleRepay = async () => {
    if (!walletAddress) return setError("Connect wallet first");
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) return setError("Enter a valid amount");
    setError(null);
    setIsActing(true);
    setTxStatus("Awaiting signature...");
    try {
      await repay(walletAddress, BigInt(Math.floor(amountNum * 10000000)));
      setTxStatus("Repaid successfully!");
      setAmount("");
      await loadData();
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsActing(false);
    }
  };

  const handleLiquidate = async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!borrowerAddr.trim()) return setError("Enter borrower address");
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) return setError("Enter debt amount to cover");
    setError(null);
    setIsActing(true);
    setTxStatus("Awaiting signature...");
    try {
      await liquidate(walletAddress, borrowerAddr.trim(), BigInt(Math.floor(amountNum * 10000000)));
      setTxStatus("Position liquidated!");
      setAmount("");
      setBorrowerAddr("");
      await loadData();
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsActing(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "dashboard", label: "Dashboard", icon: <ChartIcon />, color: "#7c6cf0" },
    { key: "lend", label: "Lend", icon: <DepositIcon />, color: "#34d399" },
    { key: "borrow", label: "Borrow", icon: <BorrowIcon />, color: "#4fc3f7" },
    { key: "liquidate", label: "Liquidate", icon: <FireIcon />, color: "#f87171" },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("success") || txStatus.includes("supplied") || txStatus.includes("withdrawn") || txStatus.includes("Repaid") || txStatus.includes("Borrowed") || txStatus.includes("liquidated") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#f87171]/20 to-[#fbbf24]/20 border border-white/[0.06]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#f87171]">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">LendingBot</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <Badge variant="success" className="text-[10px]">Permissionless</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setError(null); }}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Dashboard */}
            {activeTab === "dashboard" && (
              <div className="space-y-5">
                {/* Protocol Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <StatCard label="Total Supplied" value={stats ? formatAmount(stats.total_collateral) : "0"} color="#34d399" />
                  <StatCard label="Total Borrowed" value={stats ? formatAmount(stats.total_debt) : "0"} color="#4fc3f7" />
                  <StatCard label="Borrowers" value={stats ? String(stats.total_borrowers) : "0"} color="#fbbf24" />
                </div>

                {/* Price */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">Collateral Price</span>
                    <span className="font-mono text-sm text-white/70">{currentPrice.toFixed(2)} XLM</span>
                  </div>
                </div>

                {/* User Position */}
                {walletAddress ? (
                  <div className="space-y-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/40">Your Position</span>
                      <span className="font-mono text-xs text-white/50">{truncate(walletAddress)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-white/30 uppercase mb-1">Collateral</p>
                        <p className="font-mono text-lg text-[#34d399]">
                          {userPosition ? formatAmount(userPosition.collateral) : "0.00"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/30 uppercase mb-1">Debt</p>
                        <p className="font-mono text-lg text-[#4fc3f7]">
                          {userPosition ? formatAmount(userPosition.debt) : "0.00"}
                        </p>
                      </div>
                    </div>
                    <HealthBar health={userHealth} />
                  </div>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#7c6cf0]/20 bg-[#7c6cf0]/[0.03] py-6 text-sm text-[#7c6cf0]/60 hover:border-[#7c6cf0]/30 hover:text-[#7c6cf0]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to view your position
                  </button>
                )}
              </div>
            )}

            {/* Lend Tab */}
            {activeTab === "lend" && (
              <div className="space-y-5">
                <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-sm">
                  <span className="text-[#34d399]">fn</span>
                  <span className="text-white/70"> supply</span>
                  <span className="text-white/20 text-xs">(user, amount)</span>
                  <span className="ml-auto text-white/15 text-[10px]">→ void</span>
                </div>

                <Input
                  label="Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1000"
                />

                {walletAddress ? (
                  <div className="grid grid-cols-2 gap-3">
                    <ShimmerButton onClick={handleSupply} disabled={isActing} shimmerColor="#34d399" className="w-full">
                      {isActing ? <><SpinnerIcon /> Processing...</> : <><DepositIcon /> Supply</>}
                    </ShimmerButton>
                    <ShimmerButton onClick={handleWithdraw} disabled={isActing} shimmerColor="#fbbf24" className="w-full">
                      {isActing ? <><SpinnerIcon /> Processing...</> : <><WithdrawIcon /> Withdraw</>}
                    </ShimmerButton>
                  </div>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#34d399]/20 bg-[#34d399]/[0.03] py-4 text-sm text-[#34d399]/60 hover:border-[#34d399]/30 hover:text-[#34d399]/80 transition-all disabled:opacity-50"
                  >
                    Connect wallet to supply
                  </button>
                )}

                <div className="text-xs text-white/30 space-y-1">
                  <p>• Supply collateral to earn interest</p>
                  <p>• Withdraw anytime (if healthy)</p>
                  <p>• Minimum collateral ratio: 150%</p>
                </div>
              </div>
            )}

            {/* Borrow Tab */}
            {activeTab === "borrow" && (
              <div className="space-y-5">
                <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-sm">
                  <span className="text-[#4fc3f7]">fn</span>
                  <span className="text-white/70"> borrow</span>
                  <span className="text-white/20 text-xs">(user, amount)</span>
                  <span className="ml-auto text-white/15 text-[10px]">→ void</span>
                </div>

                <Input
                  label="Borrow Amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="500"
                />

                {walletAddress ? (
                  <div className="grid grid-cols-2 gap-3">
                    <ShimmerButton onClick={handleBorrow} disabled={isActing} shimmerColor="#4fc3f7" className="w-full">
                      {isActing ? <><SpinnerIcon /> Processing...</> : <><BorrowIcon /> Borrow</>}
                    </ShimmerButton>
                    <ShimmerButton onClick={handleRepay} disabled={isActing} shimmerColor="#fbbf24" className="w-full">
                      {isActing ? <><SpinnerIcon /> Processing...</> : <><RepayIcon /> Repay</>}
                    </ShimmerButton>
                  </div>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#4fc3f7]/20 bg-[#4fc3f7]/[0.03] py-4 text-sm text-[#4fc3f7]/60 hover:border-[#4fc3f7]/30 hover:text-[#4fc3f7]/80 transition-all disabled:opacity-50"
                  >
                    Connect wallet to borrow
                  </button>
                )}

                <div className="text-xs text-white/30 space-y-1">
                  <p>• Borrow against your collateral</p>
                  <p>• Repay to reclaim collateral</p>
                  <p>• 5% APR interest rate</p>
                </div>
              </div>
            )}

            {/* Liquidate Tab */}
            {activeTab === "liquidate" && (
              <div className="space-y-5">
                <div className="rounded-xl border border-[#f87171]/10 bg-[#f87171]/[0.02] px-4 py-3 font-mono text-sm">
                  <span className="text-[#f87171]">fn</span>
                  <span className="text-white/70"> liquidate</span>
                  <span className="text-white/20 text-xs">(liquidator, borrower, debt)</span>
                  <span className="ml-auto text-white/15 text-[10px]">→ void</span>
                </div>

                <Input
                  label="Borrower Address"
                  value={borrowerAddr}
                  onChange={(e) => setBorrowerAddr(e.target.value)}
                  placeholder="G..."
                />

                <Input
                  label="Debt to Cover"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100"
                />

                {walletAddress ? (
                  <ShimmerButton onClick={handleLiquidate} disabled={isActing} shimmerColor="#f87171" className="w-full">
                    {isActing ? <><SpinnerIcon /> Processing...</> : <><FireIcon /> Liquidate Position</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#f87171]/20 bg-[#f87171]/[0.03] py-4 text-sm text-[#f87171]/60 hover:border-[#f87171]/30 hover:text-[#f87171]/80 transition-all disabled:opacity-50"
                  >
                    Connect wallet to liquidate
                  </button>
                )}

                <div className="text-xs text-white/30 space-y-1">
                  <p>• Liquidate positions below 120% health</p>
                  <p>• Earn 10% liquidation bonus</p>
                  <p>• Anyone can liquidate (permissionless)</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">LendingBot &middot; Soroban &middot; Permissionless</p>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" />
              <span className="font-mono text-[9px] text-white/15">150% min</span>
              <span className="text-white/10 text-[8px] mx-1">&darr;</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#f87171]" />
              <span className="font-mono text-[9px] text-white/15">120% liquidate</span>
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}
