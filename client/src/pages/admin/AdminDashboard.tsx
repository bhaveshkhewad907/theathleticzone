import { useEffect, useState } from "react";
import api from "../../services/api";

interface AdminDashboardData {
  totalAthletes: number;
  totalAdmins: number;
  athletesInTraining: number;
  athletesNeedingAssessment: number;
  totalAssessments: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get("/admin/dashboard");
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (error) {
        console.error("Dashboard telemetry sync failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // Fast poll for real-time telemetry updates for Admin
    const poll = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(poll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm backdrop-blur-md">
        Failed to load dashboard data.
      </div>
    );
  }

  // 💎 PREMIUM SAAS STAT CARD
  const StatCard = ({
    label,
    value,
    isHighlight = false,
    colorClass = "text-[#E5E7EB]",
  }: {
    label: string;
    value: number | string;
    isHighlight?: boolean;
    colorClass?: string;
  }) => (
    <div className="group relative overflow-hidden bg-[#0F1724]/80 backdrop-blur-md border border-white/[0.05] rounded-[16px] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] hover:shadow-[0_15px_40px_rgba(245,158,11,0.1),inset_0_1px_0_rgba(255,255,255,0.04)]">
      {/* Subtle Inner Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

      {/* Subtle Glow on Hover */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full transition-opacity opacity-0 group-hover:opacity-100" />

      <div className="relative z-10">
        <p className="text-[#8A94A6] text-[10px] font-black uppercase tracking-widest mb-3">
          {label}
        </p>

        <h3
          className={`text-4xl font-black tracking-tighter ${isHighlight ? "text-amber-500" : colorClass}`}
        >
          {value.toLocaleString()}
        </h3>
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-amber-500 transition-all duration-500 group-hover:w-full opacity-50" />
    </div>
  );

  return (
    <div className="relative min-h-full">
      {/* Ambient Radial Lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Section */}
        <div className="relative p-8 rounded-[16px] bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />

          <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none">
            <div className="text-[120px] font-black text-white/[0.02] select-none">
              ADMIN
            </div>
          </div>

          <div className="relative z-10">
            <h1 className="text-4xl font-black tracking-tighter text-white">
              Platform <span className="text-amber-500">Intelligence</span>
            </h1>
            <p className="text-[#8A94A6] text-sm mt-2 max-w-md font-medium">
              Real-time operational metrics and engine oversight for The
              Athletic Zone.
            </p>
          </div>
          <div>
            {/* 🚀 DYNAMIC ADMIN TELEMETRY STRIP */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 mt-8">
              <div className="bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] rounded-[12px] p-5 shadow-inner transition-all duration-500 hover:bg-[#0F1724]/80 hover:border-white/10">
                <p className="text-[8px] font-black uppercase tracking-widest text-[#8A94A6] flex items-center gap-1.5 mb-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_currentColor]" />
                  Engine Status
                </p>
                <p className="text-xl font-black italic tracking-tighter text-green-500">
                  ONLINE
                </p>
              </div>
              <div className="bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] rounded-[12px] p-5 shadow-inner transition-all duration-500 hover:bg-[#0F1724]/80 hover:border-white/10">
                <p className="text-[8px] font-black uppercase tracking-widest text-[#8A94A6] flex items-center gap-1.5 mb-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  Active Courses
                </p>
                <p className="text-xl font-black italic tracking-tighter text-white">
                  {data.athletesInTraining}
                </p>
              </div>
              <div className="bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] rounded-[12px] p-5 shadow-inner transition-all duration-500 hover:bg-[#0F1724]/80 hover:border-white/10">
                <p className="text-[8px] font-black uppercase tracking-widest text-[#8A94A6] flex items-center gap-1.5 mb-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  Pending Review
                </p>
                <p className="text-xl font-black italic tracking-tighter text-white">
                  {data.athletesNeedingAssessment}
                </p>
              </div>
              <div className="bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] rounded-[12px] p-5 shadow-inner transition-all duration-500 hover:bg-[#0F1724]/80 hover:border-white/10">
                <p className="text-[8px] font-black uppercase tracking-widest text-[#8A94A6] flex items-center gap-1.5 mb-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  Global Athletes
                </p>
                <p className="text-xl font-black italic tracking-tighter text-white">
                  {data.totalAthletes}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Core Metrics Row */}
          <StatCard label="Total Athletes" value={data.totalAthletes} />
          <StatCard label="Total Admins" value={data.totalAdmins} />
          <StatCard
            label="Assessments Processed"
            value={data.totalAssessments}
            isHighlight
          />

          {/* Engine Section - Using a spanning card for Bento feel */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <StatCard
              label="Athletes in Training"
              value={data.athletesInTraining}
              colorClass="text-green-500"
            />
            <StatCard
              label="Awaiting Assessment"
              value={data.athletesNeedingAssessment}
              colorClass="text-red-500"
            />
          </div>

          {/* Premium Operations Card */}
          <div className="group relative bg-[#0F1724]/80 backdrop-blur-md border border-white/[0.05] rounded-[16px] p-6 flex flex-col justify-between overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] hover:-translate-y-1 hover:border-amber-500/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

            <div className="relative z-10">
              <p className="text-[#8A94A6] text-[10px] font-black uppercase tracking-widest mb-3">
                Recommendation Engine
              </p>
              <h3 className="text-4xl font-black tracking-tighter text-[#E5E7EB]">
                Active
              </h3>
              <p className="text-[#8A94A6] text-xs font-medium mt-1">
                System Auto-Assigning
              </p>
            </div>

            <div className="mt-8 relative z-10">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse" />
                Routing Online
              </div>
            </div>

            {/* Restricted Glow Element */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-green-500/10 rounded-full blur-[50px] transition-transform duration-500 group-hover:scale-150" />
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-green-500 transition-all duration-500 group-hover:w-full opacity-50" />
          </div>
        </div>

        {/* Footer System Info */}
        <div className="pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">
          <div>System Online • Automated Routing Node Global</div>
          <div>Athletic Zone Intelligence v2.1.0</div>
        </div>
      </div>
    </div>
  );
}
