import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import {
  Activity,
  Calendar,
  Zap,
  ShieldCheck,
  Target,
  User,
} from "lucide-react";
import dayjs from "dayjs"; // Assuming you use dayjs, or just use native Date

/* ==========================================================================
   Types
   ========================================================================== */
interface FeedbackRecord {
  _id: string;
  createdAt: string;
  intensity: "LOW" | "MEDIUM" | "HIGH";
  globalSummary: string;
  personalFeedback: string;
  coach: {
    name: string;
    profileImage?: string;
  };
  session?: {
    scheduledDate: string;
  };
}

/* ==========================================================================
   Main Component
   ========================================================================== */
export default function AthleteFeedback() {
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        // 🚀 This endpoint should return ONLY the current athlete's filtered feedback
        const res = await api.get<{ success: boolean; data: FeedbackRecord[] }>(
          "/athlete/feedback",
        );
        setFeedbacks(res.data.data);
      } catch (error) {
        console.error("Failed to decrypt ledger:", error);
        toast.error("Signal Lost: Cannot retrieve performance ledger.");
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, []);

  // Utility to style the intensity badge
  const getIntensityConfig = (intensity: string) => {
    switch (intensity) {
      case "HIGH":
        return {
          color: "text-red-500",
          bg: "bg-red-500/10",
          border: "border-red-500/20",
          label: "Maximum Load",
        };
      case "LOW":
        return {
          color: "text-blue-500",
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
          label: "Recovery Threshold",
        };
      case "MEDIUM":
      default:
        return {
          color: "text-amber-500",
          bg: "bg-amber-500/10",
          border: "border-amber-500/20",
          label: "Optimal Performance",
        };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="h-12 w-12 rounded-full border-t-2 border-amber-500 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 animate-pulse">
          Decrypting Performance Ledger...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-full pb-20">
      {/* 🔦 Ambient Radial Lighting Spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.05),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700">
        {/* 🏆 Header Section */}
        <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] p-10 rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
              Performance <span className="text-amber-500">Ledger</span>
            </h1>
            <p className="text-[#8A94A6] text-[10px] font-bold uppercase tracking-[0.3em] mt-3">
              Secure Tactical Feedback & Deployment Intelligence
            </p>
          </div>
          <ShieldCheck
            className="text-white/[0.03] absolute right-10 top-1/2 -translate-y-1/2"
            size={100}
          />
        </div>

        {/* 📂 Empty State */}
        {feedbacks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 bg-[#0F1724]/40 border border-white/[0.05] rounded-[24px] backdrop-blur-sm shadow-inner">
            <Activity size={48} className="text-white/10 mb-6" />
            <h3 className="text-lg font-black italic uppercase tracking-tighter text-white/50">
              No Intelligence Found
            </h3>
            <p className="text-[10px] font-bold text-[#8A94A6] uppercase tracking-[0.2em] mt-2">
              Attend a live deployment to generate tactical feedback.
            </p>
          </div>
        )}

        {/* 📜 Feedback Timeline / Grid */}
        <div className="space-y-6">
          {feedbacks.map((item, idx) => {
            const intensityStyle = getIntensityConfig(item.intensity);

            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, ease: "easeOut" }}
                className="group relative bg-[#0F1724]/80 backdrop-blur-md border border-white/[0.05] rounded-[24px] p-8 overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-amber-500/20 transition-all duration-500"
              >
                {/* Accent Highlight */}
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

                <div className="flex flex-col lg:flex-row gap-8 relative z-10">
                  {/* Left Column: Meta & Global Summary */}
                  <div className="lg:w-1/3 space-y-6 border-b lg:border-b-0 lg:border-r border-white/[0.05] pb-6 lg:pb-0 lg:pr-8">
                    {/* Date & Intensity */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#8A94A6] bg-black/40 px-3 py-1.5 rounded-full border border-white/[0.05]">
                        <Calendar size={12} className="text-amber-500" />
                        {dayjs(item.createdAt).format("MMM DD, YYYY")}
                      </div>

                      <div
                        className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${intensityStyle.bg} ${intensityStyle.border} ${intensityStyle.color}`}
                      >
                        <Zap size={12} />
                        {intensityStyle.label}
                      </div>
                    </div>

                    {/* Coach Info */}
                    <div className="flex items-center gap-3">
                      {item.coach?.profileImage ? (
                        <img
                          src={item.coach.profileImage}
                          alt={item.coach.name}
                          className="w-10 h-10 rounded-full border border-white/10 object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-amber-500">
                          <User size={16} />
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">
                          {item.coach?.name || "Commanding Coach"}
                        </p>
                        <p className="text-[8px] font-bold text-[#8A94A6] uppercase tracking-[0.2em]">
                          Technical Lead
                        </p>
                      </div>
                    </div>

                    {/* Global Summary */}
                    <div className="space-y-2 pt-2">
                      <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-[#8A94A6] flex items-center gap-2">
                        <Activity size={10} className="text-white/20" /> Mission
                        Summary
                      </h4>
                      <p className="text-xs text-[#E5E7EB] leading-relaxed font-medium">
                        "{item.globalSummary}"
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Personal Tactical Feedback */}
                  <div className="lg:w-2/3 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 bg-amber-500/10 rounded-[12px] flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-inner">
                        <Target size={18} strokeWidth={2.5} />
                      </div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-amber-500">
                        Personal Tactical Debrief
                      </h3>
                    </div>

                    <div className="bg-black/40 border border-white/[0.03] rounded-[16px] p-6 shadow-inner relative">
                      {/* Decorative quote marks */}
                      <div className="absolute top-4 right-4 text-6xl text-white/[0.02] font-serif leading-none rotate-180 pointer-events-none">
                        "
                      </div>

                      <p className="text-sm text-[#E5E7EB] leading-loose font-medium relative z-10 italic">
                        {item.personalFeedback ||
                          "No specific technical feedback recorded for this cycle."}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
