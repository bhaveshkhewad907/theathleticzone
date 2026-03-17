import { useEffect, useState } from "react";
import api from "../../services/api";
import { Archive, Activity, Calendar, Users, User } from "lucide-react";

interface Session {
  _id: string;
  scheduledDate: string;
  type: "GROUP" | "ONE_ON_ONE";
  athletes: { name: string }[];
  sport: { name: string };
}

interface HistoryResponse {
  sessions: Session[];
  total: number;
  page: number;
  totalPages: number;
}

export default function CoachHistory() {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/coach/history?page=1&limit=10");
        setData(res.data.data);
      } catch (error) {
        console.error("Failed to load history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="relative min-h-full">
        {/* 🔦 Ambient Radial Lighting Spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />

        <div className="relative z-10 space-y-10 max-w-7xl mx-auto pt-2">
          {/* 🏆 Header Skeleton */}
          <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] p-10 rounded-[16px] gap-6">
            <div className="space-y-4">
              <div className="h-10 w-72 bg-white/[0.03] rounded-lg animate-pulse" />
              <div className="h-4 w-56 bg-white/[0.02] rounded-md animate-pulse" />
            </div>
            <div className="h-10 w-48 bg-white/[0.03] rounded-full hidden md:block animate-pulse" />
          </div>

          {/* 📋 Ledger List Skeleton */}
          <div className="grid gap-4 pb-10">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-[#0F1724]/80 backdrop-blur-md p-6 md:p-8 rounded-[24px] border border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-6 shadow-inner"
              >
                <div className="flex items-center gap-8 w-full md:w-auto">
                  {/* Visual Identity Block */}
                  <div className="h-16 w-16 rounded-[16px] bg-white/[0.03] animate-pulse shrink-0" />

                  <div className="space-y-3">
                    {/* Date */}
                    <div className="h-3 w-24 bg-white/[0.03] rounded animate-pulse" />
                    {/* Title */}
                    <div className="h-6 w-48 bg-white/[0.03] rounded animate-pulse" />
                  </div>
                </div>

                <div className="mt-6 md:mt-0 flex flex-col items-center md:items-end w-full md:w-auto space-y-4">
                  {/* Sector Badge */}
                  <div className="h-6 w-24 bg-white/[0.03] rounded-lg animate-pulse" />
                  {/* Athletes List */}
                  <div className="h-3 w-40 bg-white/[0.02] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full">
      {/* 🔦 Ambient Radial Lighting Spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto">
        {/* 🏆 Header Section */}
        <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] p-10 rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] gap-6">
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
              Performance <span className="text-amber-500">Archive</span>
            </h1>
            <p className="text-[#8A94A6] text-[10px] font-bold uppercase tracking-[0.3em] mt-3">
              Historical Session Logs & Sector Participation
            </p>
          </div>
          <div className="relative z-10 hidden md:flex items-center gap-4 px-6 py-3 rounded-full bg-black/40 border border-white/[0.05] shadow-inner">
            <Archive size={14} className="text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#8A94A6]">
              Accessing Secure Ledger
            </span>
          </div>
        </div>

        {/* 📋 Ledger List */}
        <div className="grid gap-4 pb-10">
          {data?.sessions.map((session) => (
            <div
              key={session._id}
              className="group relative bg-[#0F1724]/80 backdrop-blur-md p-6 md:p-8 rounded-[24px] border border-white/[0.05] flex flex-col md:flex-row justify-between items-center transition-all duration-500 hover:border-amber-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

              <div className="flex items-center gap-8 relative z-10 w-full md:w-auto">
                {/* Visual Identity Block */}
                <div className="h-16 w-16 rounded-[16px] bg-black/40 border border-white/10 flex items-center justify-center font-black text-2xl text-amber-500 italic shadow-inner group-hover:border-amber-500/30 transition-colors">
                  {session.sport?.name[0].toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={12} className="text-[#8A94A6]" />
                    <p className="text-[10px] font-black text-[#8A94A6] uppercase tracking-[0.2em]">
                      {new Date(session.scheduledDate).toLocaleDateString(
                        undefined,
                        { dateStyle: "medium" },
                      )}
                    </p>
                  </div>
                  <h2 className="text-xl font-black text-[#E5E7EB] tracking-tighter uppercase italic leading-tight flex items-center gap-3">
                    {session.type === "GROUP" ? (
                      <Users size={18} className="text-amber-500/60" />
                    ) : (
                      <User size={18} className="text-amber-500/60" />
                    )}
                    {session.type === "GROUP"
                      ? "Technical Cluster"
                      : "Elite 1:1 Protocol"}
                  </h2>
                </div>
              </div>

              <div className="mt-6 md:mt-0 text-center md:text-right relative z-10 w-full md:w-auto">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10 text-[9px] font-black text-amber-500 uppercase tracking-widest mb-3">
                  <Activity size={10} strokeWidth={3} /> Sector:{" "}
                  {session.sport?.name}
                </div>
                <p className="text-[10px] font-bold text-[#8A94A6]/60 uppercase tracking-widest max-w-[200px] md:max-w-none">
                  Athletes: {session.athletes.map((a) => a.name).join(", ")}
                </p>
              </div>

              {/* Card Hover Glow */}
              <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-amber-500/5 blur-[60px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
          ))}

          {/* Empty State */}
          {data?.sessions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 bg-[#0F1724]/40 border-2 border-dashed border-white/5 rounded-[24px]">
              <Activity size={48} className="text-[#8A94A6]/20 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8A94A6]/40">
                No historical deployments logged
              </p>
            </div>
          )}
        </div>

        {/* 🏁 Footer Meta */}
        <div className="pt-8 border-t border-white/[0.05] flex justify-between items-center text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">
          <div>R2 DATA ARCHIVE: ACTIVE</div>
          <div>COACHING INTELLIGENCE V.2.0.4</div>
        </div>
      </div>
    </div>
  );
}
