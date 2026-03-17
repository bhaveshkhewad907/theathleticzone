import { useEffect, useState } from "react";
import api from "../../services/api";

interface AdminDashboardData {
  totalAthletes: number;
  totalCoaches: number;
  totalGroupSubscriptions: number;
  totalOneOnOneSubscriptions: number;
  totalRevenue: number;
  sessionsScheduledTomorrow: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sysStats, setSysStats] = useState({
    engineStatus: "SYNCING...",
    athletesSubmitted: 0,
    groupsGenerated: 0,
    pendingAssignments: 0,
    isReady: false,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 🚀 THE FIX: Fetch from the unified dashboard endpoint
        const res = await api.get("/admin/dashboard");
        const dashboardData = res.data.data;

        // Populate the main dashboard widgets
        setData(dashboardData);

        // 🚀 THE FIX: Direct mapping from the new backend sysStats object
        if (dashboardData.sysStats) {
          setSysStats({
            engineStatus: dashboardData.sysStats.engineStatus,
            athletesSubmitted: dashboardData.sysStats.athletesSubmitted,
            groupsGenerated: dashboardData.sysStats.groupsGenerated,
            pendingAssignments: dashboardData.sysStats.pendingAssignments,
            isReady: dashboardData.sysStats.isReady,
          });
        }
      } catch (error) {
        console.error("Dashboard telemetry sync failed", error);
        setSysStats((prev) => ({ ...prev, engineStatus: "OFFLINE" }));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // Fast poll for real-time telemetry updates for Admin
    const poll = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(poll);
  }, []);

  const telemetryNodes = [
    {
      label: "Group Engine",
      val: sysStats.engineStatus,
      color: sysStats.isReady ? "text-green-500" : "text-amber-500",
      dot: sysStats.isReady ? "bg-green-500" : "bg-amber-500",
    },
    {
      label: "Athletes Submitted",
      val: sysStats.athletesSubmitted.toString(),
      color: "text-white",
      dot: "bg-blue-500",
    },
    {
      label: "Groups Generated",
      val: sysStats.groupsGenerated.toString(),
      color: "text-white",
      dot: "bg-purple-500",
    },
    {
      label: "Pending Assignments",
      val: sysStats.pendingAssignments.toString(),
      color:
        sysStats.pendingAssignments > 0 ? "text-yellow-500" : "text-[#8A94A6]",
      dot: sysStats.pendingAssignments > 0 ? "bg-yellow-500" : "bg-white/20",
    },
  ];

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get<{
          success: boolean;
          data: AdminDashboardData;
        }>("/admin/dashboard");

        setData(res.data.data);
      } catch (error) {
        console.error("Failed to load admin dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
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
    isRevenue = false,
  }: {
    label: string;
    value: number | string;
    isRevenue?: boolean;
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
          className={`text-4xl font-black tracking-tighter ${isRevenue ? "text-amber-500" : "text-[#E5E7EB]"}`}
        >
          {value}
        </h3>
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-amber-500 transition-all duration-500 group-hover:w-full opacity-50" />
    </div>
  );

  return (
    <div className="relative min-h-full">
      {/* Ambient Radial Lighting requested by the user */}
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
              Real-time operational metrics and financial oversight for The
              Athletic Zone.
            </p>
          </div>
          <div>
            {/* 🚀 DYNAMIC ADMIN TELEMETRY STRIP */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 mt-8">
              {telemetryNodes.map((stat, i) => (
                <div
                  key={i}
                  className="bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] rounded-[12px] p-5 shadow-inner transition-all duration-500 hover:bg-[#0F1724]/80 hover:border-white/10"
                >
                  <p className="text-[8px] font-black uppercase tracking-widest text-[#8A94A6] flex items-center gap-1.5 mb-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${stat.dot} ${i === 0 || stat.val !== "0" ? "animate-pulse shadow-[0_0_8px_currentColor]" : "opacity-50"}`}
                    />
                    {stat.label}
                  </p>
                  <p
                    className={`text-xl font-black italic tracking-tighter ${stat.color} transition-colors`}
                  >
                    {stat.val}
                  </p>
                </div>
              ))}
            </div>

            {/* ... Rest of your admin dashboard ... */}
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Core Metrics Row */}
          <StatCard label="Total Athletes" value={data.totalAthletes} />
          <StatCard label="Total Coaches" value={data.totalCoaches} />
          <StatCard
            label="Total Revenue"
            value={`₹${data.totalRevenue.toLocaleString()}`}
            isRevenue
          />

          {/* Subscriptions Section - Using a spanning card for Bento feel */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <StatCard
              label="Active Group Training"
              value={data.totalGroupSubscriptions}
            />
            <StatCard
              label="Active 1:1 Coaching"
              value={data.totalOneOnOneSubscriptions}
            />
          </div>

          {/* Premium Operations Card */}
          <div className="group relative bg-[#0F1724]/80 backdrop-blur-md border border-white/[0.05] rounded-[16px] p-6 flex flex-col justify-between overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] hover:-translate-y-1 hover:border-amber-500/30 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

            <div className="relative z-10">
              <p className="text-[#8A94A6] text-[10px] font-black uppercase tracking-widest mb-3">
                Live Operations
              </p>
              <h3 className="text-4xl font-black tracking-tighter text-[#E5E7EB]">
                {data.sessionsScheduledTomorrow}
              </h3>
              <p className="text-[#8A94A6] text-xs font-medium mt-1">
                Sessions Tomorrow
              </p>
            </div>

            <div className="mt-8 relative z-10">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 animate-pulse" />
                Active Schedule
              </div>
            </div>

            {/* Restricted Glow Element */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-[50px] transition-transform duration-500 group-hover:scale-150" />
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-amber-500 transition-all duration-500 group-hover:w-full opacity-50" />
          </div>
        </div>

        {/* Footer System Info */}
        <div className="pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">
          <div>System Online • R2 Node Global</div>
          <div>Athletic Zone Intelligence v2.0.4</div>
        </div>
      </div>
    </div>
  );
}
