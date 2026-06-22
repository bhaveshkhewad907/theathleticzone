import { useEffect, useState } from "react";
import api from "../../services/api";
import { Tag } from "lucide-react";

interface AdminDashboardData {
  totalAthletes: number;
  athletesInTraining: number;
  athletesNeedingAssessment: number;
  totalAssessments: number;
  couponUsage: { code: string; count: number }[];
  totalRevenue: number;
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
        console.error("Dashboard sync failed", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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

  if (!data) return null;

  const StatCard = ({
    label,
    value,
    isHighlight = false,
    colorClass = "text-white",
  }: {
    label: string;
    value: number | string;
    isHighlight?: boolean;
    colorClass?: string;
  }) => (
    <div className="group relative overflow-hidden bg-[#0F1724]/80 backdrop-blur-md border border-white/[0.05] rounded-[16px] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] hover:shadow-[0_15px_40px_rgba(245,158,11,0.1),inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-500/10 blur-[50px] rounded-full transition-opacity opacity-0 group-hover:opacity-100" />

      <div className="relative z-10">
        <p className="text-[#8A94A6] text-xs font-bold uppercase tracking-wider mb-3">
          {label}
        </p>
        <h3
          className={`text-4xl font-black tracking-tighter ${isHighlight ? "text-amber-500" : colorClass}`}
        >
          {value.toLocaleString()}
        </h3>
      </div>
      <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-amber-500 transition-all duration-500 group-hover:w-full opacity-50" />
    </div>
  );

  return (
    <div className="relative min-h-full pb-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Section */}
        <div className="relative p-8 rounded-[16px] bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-4xl font-black tracking-tighter text-white">
              Admin <span className="text-amber-500">Dashboard</span>
            </h1>
            <p className="text-[#8A94A6] text-sm mt-2 font-medium">
              Overview of athletes, courses, and platform data.
            </p>
          </div>

          {/* Quick Stats Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-black/40 border border-white/5 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A94A6] flex items-center gap-1.5 mb-1">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />{" "}
                System Status
              </p>
              <p className="text-lg font-black text-green-500">ONLINE</p>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A94A6] flex items-center gap-1.5 mb-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Training
                Active
              </p>
              <p className="text-lg font-black text-white">
                {data.athletesInTraining}
              </p>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A94A6] flex items-center gap-1.5 mb-1">
                <span className="h-2 w-2 rounded-full bg-red-500" /> Needs
                Assessment
              </p>
              <p className="text-lg font-black text-white">
                {data.athletesNeedingAssessment}
              </p>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A94A6] flex items-center gap-1.5 mb-1">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> Total
                Athletes
              </p>
              <p className="text-lg font-black text-white">
                {data.totalAthletes}
              </p>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard label="Total Athletes" value={data.totalAthletes} />
          <StatCard
            label="Total Revenue"
            value={`₹${data.totalRevenue.toLocaleString()}`}
            colorClass="text-green-500"
          />

          <StatCard
            label="Completed Assessments"
            value={data.totalAssessments}
            isHighlight
          />
        </div>

        {/* 🚀 NEW: Promo Code Analytics Section */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <Tag size={20} />
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Promo Code Usage
            </h2>
          </div>

          <div className="bg-[#0F1724]/80 backdrop-blur-md border border-white/[0.05] rounded-[16px] overflow-hidden">
            {data.couponUsage && data.couponUsage.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/40 border-b border-white/5">
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#8A94A6]">
                      Influencer Code
                    </th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-[#8A94A6]">
                      Athletes Joined
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.couponUsage.map((coupon, index) => (
                    <tr
                      key={index}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-4 px-6">
                        <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-500 font-black tracking-widest uppercase rounded-md text-sm border border-amber-500/20">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-white font-bold text-lg">
                        {coupon.count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-[#8A94A6]">
                <p className="font-bold uppercase tracking-wider">
                  No promo codes used yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
