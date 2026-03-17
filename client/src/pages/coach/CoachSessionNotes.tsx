import { useState, useEffect } from "react";
import api from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Users,
  Activity,
  Save,
  FileText,
  Zap,
  ChevronRight,
} from "lucide-react";

export default function CoachSessionNotes() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState("");
  const [intensity, setIntensity] = useState<"LOW" | "MEDIUM" | "HIGH">(
    "MEDIUM",
  );
  const [athletes, setAthletes] = useState<{ _id: string; name: string }[]>([]);
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        const res = await api.get(`/coach/sessions/${sessionId}/athletes`);
        setAthletes(res.data.data);
      } catch {
        toast.error("Failed to load roster");
      } finally {
        setLoading(false);
      }
    };
    fetchAthletes();
  }, [sessionId]);

  const handleSubmit = async () => {
    try {
      const coachFeedback = athletes
        .map((a) => ({
          athlete: a._id,
          feedback: feedbacks[a._id] || "",
        }))
        .filter((f) => f.feedback.trim() !== "");

      await api.post(`/coach/notes/${sessionId}`, {
        summary,
        intensity,
        coachFeedback,
      });

      toast.success("Intelligence Archived Successfully.");
      navigate("/coach/history");
    } catch {
      toast.error("Failed to transmit report.");
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-full">
        {/* 🔦 Ambient Radial Lighting Spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto py-10 space-y-10">
          {/* 🏆 Header Skeleton */}
          <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] p-10 rounded-[16px]">
            <div className="space-y-4">
              <div className="h-10 w-64 bg-white/[0.03] rounded-lg animate-pulse" />
              <div className="h-4 w-48 bg-white/[0.02] rounded-md animate-pulse" />
            </div>
            <div className="h-20 w-20 bg-white/[0.02] rounded-[16px] hidden md:block animate-pulse" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
            {/* 📡 Global Session Metrics Skeleton */}
            <div className="bg-[#0F1724]/80 backdrop-blur-md border border-white/[0.05] rounded-[24px] p-8 space-y-8 shadow-inner h-fit">
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
                <div className="h-4 w-32 bg-white/[0.03] rounded animate-pulse" />
                <div className="h-3 w-20 bg-white/[0.02] rounded animate-pulse" />
              </div>

              <div className="space-y-3">
                <div className="h-4 w-40 bg-white/[0.03] rounded animate-pulse ml-2" />
                <div className="w-full h-40 rounded-[16px] bg-white/[0.02] animate-pulse" />
              </div>

              <div className="space-y-3">
                <div className="h-4 w-48 bg-white/[0.03] rounded animate-pulse ml-2" />
                <div className="w-full h-14 rounded-[12px] bg-white/[0.02] animate-pulse" />
              </div>
            </div>

            {/* 👥 Individual Athlete Feedback Skeleton */}
            <div className="bg-[#0F1724]/80 backdrop-blur-md border border-white/[0.05] rounded-[24px] p-8 space-y-8 shadow-inner flex flex-col">
              <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
                <div className="h-4 w-32 bg-white/[0.03] rounded animate-pulse" />
                <div className="h-3 w-24 bg-white/[0.02] rounded animate-pulse" />
              </div>

              <div className="space-y-6 flex-1">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="bg-white/[0.02] p-6 rounded-[16px] border border-white/[0.03]"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-2 w-2 rounded-full bg-white/[0.05] animate-pulse" />
                      <div className="h-4 w-32 bg-white/[0.03] rounded animate-pulse" />
                    </div>
                    <div className="w-full h-28 rounded-[12px] bg-white/[0.03] animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 🚀 Submission Protocol Skeleton */}
          <div className="pt-6">
            <div className="w-full h-[68px] bg-white/[0.03] rounded-[16px] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full">
      {/* 🔦 Ambient Radial Lighting Spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto py-10 space-y-10 animate-in fade-in duration-700">
        {/* 🏆 Header Section */}
        <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] p-10 rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
              Action <span className="text-amber-500">Debrief</span>
            </h1>
            <p className="text-[#8A94A6] text-[10px] font-bold uppercase tracking-[0.3em] mt-3">
              Post-Deployment Intelligence Report • Protocol V.2.0.4
            </p>
          </div>
          <FileText
            className="text-white/[0.03] absolute right-10 top-1/2 -translate-y-1/2"
            size={100}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
          {/* 📡 Global Session Metrics */}
          <div className="bg-[#0F1724]/80 backdrop-blur-md border border-white/[0.05] rounded-[24px] p-8 space-y-8 shadow-[0_15px_35px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] h-fit">
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8A94A6] flex items-center gap-2">
                <Activity size={14} className="text-amber-500" /> Global Metrics
              </h2>
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                Sector R2-B
              </span>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8A94A6] ml-2 flex items-center gap-2">
                <ChevronRight size={10} className="text-amber-500" /> Technical
                Summary
              </label>
              <textarea
                className="w-full p-6 rounded-[16px] bg-black/40 border border-white/[0.05] text-sm text-[#E5E7EB] placeholder:text-[#8A94A6]/20 focus:border-amber-500/50 outline-none transition-all h-40 resize-none shadow-inner"
                placeholder="Document overall tactical observations and load responses..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8A94A6] ml-2 flex items-center gap-2">
                <Zap size={10} className="text-amber-500" /> Deployment
                Intensity
              </label>
              <div className="relative group/select">
                <select
                  className="w-full p-5 rounded-[12px] bg-black/40 border border-white/[0.05] text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 outline-none focus:border-amber-500/50 transition-all cursor-pointer appearance-none shadow-inner"
                  value={intensity}
                  onChange={(e) =>
                    setIntensity(e.target.value as "LOW" | "MEDIUM" | "HIGH")
                  }
                >
                  <option value="LOW" className="bg-[#0F1724]">
                    Low Threshold (Recovery)
                  </option>
                  <option value="MEDIUM" className="bg-[#0F1724]">
                    Optimal Performance
                  </option>
                  <option value="HIGH" className="bg-[#0F1724]">
                    Maximum Load (Critical)
                  </option>
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-amber-500/40 group-hover/select:text-amber-500 transition-colors">
                  <ChevronRight size={14} className="rotate-90" />
                </div>
              </div>
            </div>
          </div>

          {/* 👥 Individual Athlete Feedback */}
          <div className="bg-[#0F1724]/80 backdrop-blur-md border border-white/[0.05] rounded-[24px] p-8 space-y-8 shadow-[0_15px_35px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8A94A6] flex items-center gap-2">
                <Users size={14} className="text-amber-500" /> Roster Debriefs
              </h2>
              <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">
                {athletes.length} Athletes Detected
              </span>
            </div>

            <div className="space-y-6 flex-1 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
              {athletes.map((athlete) => (
                <div
                  key={athlete._id}
                  className="group/athlete bg-black/20 p-6 rounded-[16px] border border-white/[0.03] hover:border-amber-500/20 transition-all duration-300 shadow-inner"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
                    <p className="text-[11px] font-black text-[#E5E7EB] uppercase tracking-[0.2em]">
                      {athlete.name}
                    </p>
                  </div>
                  <textarea
                    className="w-full p-4 rounded-[12px] bg-black/40 border border-white/[0.05] text-[11px] text-[#8A94A6] focus:text-[#E5E7EB] focus:border-amber-500/50 outline-none transition-all h-28 resize-none shadow-inner font-medium leading-relaxed"
                    placeholder={`Archive specific tactical feedback for ${athlete.name.split(" ")[0]}...`}
                    value={feedbacks[athlete._id] || ""}
                    onChange={(e) =>
                      setFeedbacks({
                        ...feedbacks,
                        [athlete._id]: e.target.value,
                      })
                    }
                  />
                </div>
              ))}

              {athletes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-black/20 rounded-[16px] border-2 border-dashed border-white/5">
                  <p className="text-[9px] font-black text-[#8A94A6]/30 uppercase tracking-[0.4em]">
                    No roster data detected
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🚀 Submission Protocol */}
        <div className="pt-6">
          <button
            onClick={handleSubmit}
            className="w-full group relative py-6 bg-amber-500 text-black font-black uppercase tracking-[0.3em] text-[11px] rounded-[16px] hover:bg-amber-400 transition-all active:scale-[0.98] shadow-[0_15px_30px_rgba(245,158,11,0.2)] hover:shadow-[0_20px_40px_rgba(245,158,11,0.4)] flex items-center justify-center gap-4 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
            <Save size={18} strokeWidth={2.5} /> Archive Report & Clear Roster
          </button>
        </div>

        {/* 🏁 Footer Meta */}
        <div className="pt-10 border-t border-white/[0.05] flex justify-between items-center text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">
          <div>Protocol: Intelligence_Archive_Active</div>
          <div>COACHING HUB V.2.0.4 • 2026</div>
        </div>
      </div>
    </div>
  );
}
