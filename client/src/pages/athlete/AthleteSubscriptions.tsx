import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getMySubscriptions } from "../../services/liveSubscription.service";
import type { SubscriptionState } from "../../types/athlete";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Zap,
  Clock,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function AthleteSubscriptions() {
  const [data, setData] = useState<SubscriptionState | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await getMySubscriptions();
      setData(res);
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  if (loading) {
    return (
      <div className="relative min-h-full overflow-hidden">
        {/* Ambient background matching the final page */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />

        {/* Subtle pulsing animation over the whole skeleton */}
        <div className="relative z-10 space-y-10 max-w-7xl mx-auto animate-pulse">
          {/* Header Skeleton */}
          <div className="border-b border-white/[0.05] pb-8">
            <div className="h-10 w-72 bg-white/5 rounded-md mb-3" />
            <div className="h-3 w-48 bg-white/5 rounded-md" />
          </div>

          {/* Main Clearance Card Skeleton */}
          <div className="bg-[#0F1724]/40 border border-white/[0.02] rounded-[24px] p-10">
            {/* Top Row (Icon, Title, Pills) */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 border-b border-white/[0.05] pb-10">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-[16px] bg-white/5" />
                <div>
                  <div className="h-8 w-64 bg-white/5 rounded-md mb-3" />
                  <div className="h-3 w-32 bg-white/5 rounded-md" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-10 w-32 bg-white/5 rounded-full" />
                <div className="h-10 w-24 bg-white/5 rounded-full" />
              </div>
            </div>

            {/* Middle Grid (Dates & Countdown) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-3 w-24 bg-white/5 rounded-md" />
                  <div className="h-4 w-32 bg-white/5 rounded-md" />
                </div>
              ))}
            </div>

            {/* Bottom Section (Progress Bar & Renew Button) */}
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <div className="h-3 w-32 bg-white/5 rounded-md" />
                  <div className="h-3 w-16 bg-white/5 rounded-md" />
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full" />
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-4 border-t border-white/[0.05]">
                <div className="h-4 w-48 bg-white/5 rounded-md" />
                <div className="h-[52px] w-full sm:w-40 bg-white/5 rounded-[12px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-[10px] font-black uppercase tracking-widest text-red-500 p-8 border border-red-500/20 bg-red-500/5 rounded-[16px] inline-flex items-center gap-3">
        <AlertTriangle size={14} /> System Error: Telemetry Offline
      </div>
    );
  }

  // 🟣 CASE 1 — No Subscription
  if (!data.active && !data.expired) {
    return (
      <div className="relative min-h-full">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />
        <div className="relative z-10 space-y-10 max-w-7xl mx-auto">
          <div className="border-b border-white/[0.05] pb-8">
            <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
              Active <span className="text-amber-500">Clearance</span>
            </h2>
            <p className="text-[#8A94A6] text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
              Live Training Access Protocols
            </p>
          </div>

          <div className="bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] rounded-[24px] p-20 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="relative z-10 max-w-sm mx-auto">
              <Shield size={48} className="text-white/10 mx-auto mb-6" />
              <h3 className="text-2xl font-black uppercase tracking-tighter italic text-[#E5E7EB] mb-2">
                No Active Deployment
              </h3>
              <p className="text-[10px] font-black text-[#8A94A6] uppercase tracking-widest mb-10 leading-loose">
                You haven’t initialized a live training protocol yet. Initialize
                deployment to access real-time coaching.
              </p>
              <button
                onClick={() => navigate("/athlete/live-plans")}
                className="px-10 py-5 rounded-[12px] bg-amber-500 text-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-amber-400 transition-all active:scale-95 shadow-[0_0_25px_rgba(245,158,11,0.3)]"
              >
                Explore Live Plans
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const active = data.active;
  let progressPercentage = 0;
  if (active?.endDate && active?.startDate) {
    const start = new Date(active.startDate).getTime();
    const end = new Date(active.endDate).getTime();
    progressPercentage = Math.min(100, ((now - start) / (end - start)) * 100);
  }

  const getExpiryCountdown = (endDate?: string) => {
    if (!endDate) return null;
    const diff = new Date(endDate).getTime() - now;
    if (diff <= 0) return "Terminated";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${days}D ${hours}H ${minutes}M`;
  };

  return (
    <div className="relative min-h-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />
      <div className="relative z-10 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-700">
        <div className="border-b border-white/[0.05] pb-8">
          <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
            Active <span className="text-amber-500">Clearance</span>
          </h2>
          <p className="text-[#8A94A6] text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
            Live Training Access Protocols
          </p>
        </div>

        {/* 🟢 ACTIVE SUBSCRIPTION PANEL */}
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative overflow-hidden bg-[#0F1724]/80 backdrop-blur-md border border-white/[0.05] rounded-[24px] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-500 hover:border-amber-500/30"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 border-b border-white/[0.05] pb-10">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-[16px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <Zap size={28} strokeWidth={3} />
                </div>
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter italic text-[#E5E7EB] leading-none">
                    {active.type.replace("_", " ")}{" "}
                    <span className="text-amber-500">Protocol</span>
                  </h3>
                  <div className="flex items-center gap-3 mt-3">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8A94A6]">
                      Tier:{" "}
                      <span className="text-white">
                        {active.plan.replace("_", " ")}
                      </span>
                    </p>
                    <div className="h-1 w-1 rounded-full bg-white/20" />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8A94A6]">
                      ID:{" "}
                      <span className="text-white">{active._id.slice(-8)}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-3 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                  System Active
                </div>
                {active.endDate && (
                  <div className="px-5 py-2.5 rounded-full bg-white/[0.03] text-[#8A94A6] border border-white/[0.05] text-[9px] font-black uppercase tracking-widest">
                    {Math.max(
                      0,
                      Math.ceil(
                        (new Date(active.endDate).getTime() - now) /
                          (1000 * 60 * 60 * 24),
                      ),
                    )}{" "}
                    Days Left
                  </div>
                )}
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
              <ClearanceStat
                label="Initialization"
                value={
                  active.startDate &&
                  new Date(active.startDate).toLocaleDateString()
                }
                icon={<Clock size={14} />}
              />
              <ClearanceStat
                label="Deactivation"
                value={
                  active.endDate &&
                  new Date(active.endDate).toLocaleDateString()
                }
                icon={<Zap size={14} />}
              />
              <ClearanceStat
                label="Live Countdown"
                value={active.endDate && getExpiryCountdown(active.endDate)}
                icon={<Clock size={14} />}
                color="text-amber-500"
              />
            </div>

            <div className="relative z-10 space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6]">
                    Lifecycle Integrity
                  </span>
                  <span className="text-[10px] font-black text-amber-500 tracking-widest">
                    {Math.round(progressPercentage)}% Complete
                  </span>
                </div>
                <div className="h-2 bg-black/40 border border-white/[0.05] rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all duration-1000 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-4 border-t border-white/[0.05]">
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-green-500" />
                  <p className="text-[10px] font-black text-[#8A94A6] uppercase tracking-widest">
                    Credentials Verified & Secure
                  </p>
                </div>

                {active.canRenew && (
                  <button
                    onClick={() => navigate("/athlete/live-plans")}
                    className="w-full sm:w-auto px-10 py-4 rounded-[12px] bg-[#E5E7EB] text-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-amber-500 transition-all active:scale-95 shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
                  >
                    Renew Protocol
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* 🔴 ARCHIVED CLEARANCE */}
        {!data.hasActive && data.expired && (
          <div className="group relative bg-black/20 backdrop-blur-sm border border-white/[0.05] rounded-[24px] p-8 opacity-60 hover:opacity-100 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/[0.02] to-transparent pointer-events-none" />
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="h-12 w-12 rounded-[12px] bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-500/40">
                  <RefreshCw size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#E5E7EB] uppercase italic tracking-tighter">
                    Archived <span className="text-red-500/40">Clearance</span>
                  </h3>
                  <p className="text-[9px] font-bold text-[#8A94A6] uppercase tracking-widest mt-1">
                    Protocol: {data.expired.type.replace("_", " ")} • Level:{" "}
                    {data.expired.plan.replace("_", " ")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/athlete/live-plans")}
                className="w-full sm:w-auto px-8 py-3 rounded-[10px] bg-white/[0.03] border border-white/[0.05] text-[9px] font-black uppercase tracking-[0.2em] text-[#E5E7EB] hover:bg-amber-500 hover:text-black hover:border-amber-500 transition-all active:scale-95"
              >
                Reactivate Access
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ClearanceStat({
  label,
  value,
  icon,
  color = "text-[#E5E7EB]",
}: {
  label: string;
  value: string | null | undefined; // 🛡️ Added 'undefined' here
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6]">
        {icon} <span>{label}</span>
      </div>
      <p
        className={`text-sm font-black tracking-widest uppercase ${color} font-mono`}
      >
        {value || "DATA UNAVAILABLE"}
      </p>
    </div>
  );
}
