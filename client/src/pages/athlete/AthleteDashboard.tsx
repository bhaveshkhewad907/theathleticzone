import { useEffect, useState, useContext, Fragment } from "react";
import AuthContext from "../../context/AuthContext";
import api from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Ruler,
  Weight,
  Calendar,
  PlayCircle,
  Activity,
  X,
  Monitor,
  ShieldCheck,
} from "lucide-react";

import StructuredCoursePlayer from "./StructuredCoursePlayer";
import ProgramPaywall from "../assessment/ProgramPaywall";
import AssessmentWizard from "../../components/ui/AssessmentWizard";

// 🚀 THE FIX: Defined strict TypeScript interfaces to replace 'any'
interface ExtendedAuthUser {
  platformState?: {
    status?: string;
    hasPaidEntryFee?: boolean;
  };
}

interface AthleteProfileData {
  age?: number;
  weight?: number;
  height?: number;
  sport?: string;
}

interface ActiveCourseData {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
}

export default function AthleteDashboard() {
  const auth = useContext(AuthContext);

  // 🚀 THE FIX: Applied the ExtendedAuthUser interface
  const userStatus = (auth?.user as ExtendedAuthUser)?.platformState?.status;
  const hasPaid = (auth?.user as ExtendedAuthUser)?.platformState
    ?.hasPaidEntryFee;

  // 🚀 THE FIX: Applied specific data interfaces instead of <any>
  const [profile, setProfile] = useState<AthleteProfileData | null>(null);
  const [activeCourse, setActiveCourse] = useState<ActiveCourseData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  useEffect(() => {
    // If they need an assessment, stop loading immediately. Don't fetch course data.
    if (userStatus === "NEEDS_ASSESSMENT" || !userStatus) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const [profileRes, courseRes] = await Promise.all([
          api.get("/athlete-profile"),
          api.get("/course-purchase/my"),
        ]);
        setProfile(profileRes.data.data);
        if (courseRes.data.data && courseRes.data.data.length > 0) {
          setActiveCourse(courseRes.data.data[0].course);
        }
      } catch (error) {
        console.error("Dashboard sync failed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [userStatus]);

  // =========================================================
  // 🛑 THE CHAMELEON INTERCEPTOR: No Routing Involved!
  // =========================================================
  if (userStatus === "NEEDS_ASSESSMENT" || !userStatus) {
    if (!hasPaid) {
      // Show Paywall full screen overlay
      return <ProgramPaywall onSuccess={() => window.location.reload()} />;
    } else {
      // Show Assessment inline inside their dashboard wrapper
      return (
        <div className="animate-in fade-in duration-500">
          <AssessmentWizard />
        </div>
      );
    }
  }

  // =========================================================
  // ✅ THE ACTIVE DASHBOARD
  // =========================================================
  if (loading) {
    return (
      <div className="relative min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
      </div>
    );
  }

  return (
    <Fragment>
      <div className="relative min-h-full">
        <div className="relative z-10 space-y-10 animate-in fade-in duration-700 max-w-5xl mx-auto">
          <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] p-8 rounded-[16px] gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
                My <span className="text-amber-500">Dashboard</span>
              </h1>
              <p className="text-[#8A94A6] text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
                Your Stats & Training Program
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
              <div className="bg-[#0F1724]/80 backdrop-blur-md border border-white/[0.05] rounded-[16px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8A94A6] mb-8 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                  My Stats
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <StatBox
                    icon={<Calendar size={14} />}
                    label="Age"
                    value={`${profile?.age || 0} YRS`}
                  />
                  <StatBox
                    icon={<Weight size={14} />}
                    label="Weight"
                    value={`${profile?.weight || 0} KG`}
                  />
                  <StatBox
                    icon={<Ruler size={14} />}
                    label="Height"
                    value={`${profile?.height || 0} FT`}
                  />
                  <StatBox
                    icon={<Dumbbell size={14} />}
                    label="Status"
                    value="ACTIVE"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col">
              <div className="relative bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] rounded-[16px] p-2 flex flex-col h-full overflow-hidden transition-all hover:border-amber-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]">
                {activeCourse ? (
                  <div className="flex flex-col h-full relative">
                    <div className="relative aspect-video rounded-[12px] overflow-hidden bg-black/60 group shadow-inner">
                      <img
                        src={activeCourse.thumbnailUrl}
                        alt={activeCourse.title}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F1724] via-transparent to-transparent opacity-80" />
                      <div className="absolute top-4 left-4 bg-amber-500 text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                        <Activity size={10} /> Active Program
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1 relative z-10">
                      <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">
                        {activeCourse.title}
                      </h2>
                      <p className="text-sm text-[#8A94A6] mb-8 font-medium line-clamp-2">
                        {activeCourse.description}
                      </p>
                      <button
                        onClick={() => setIsPlayerOpen(true)}
                        className="mt-auto w-full py-5 rounded-[12px] bg-amber-500 text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-amber-400 active:scale-95 flex justify-center items-center gap-2 shadow-[0_10px_20px_rgba(245,158,11,0.2)] transition-all"
                      >
                        <PlayCircle size={18} /> Start Training Session
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-10 text-center border-2 border-dashed border-white/5 rounded-[12px] bg-black/20 m-6">
                    <ShieldCheck size={48} className="text-[#8A94A6]/20 mb-4" />
                    <h3 className="text-xl font-black text-white italic uppercase mb-2">
                      No Program Assigned
                    </h3>
                    <p className="text-xs text-[#8A94A6] max-w-xs">
                      If you just completed your assessment, please wait for the
                      algorithm to process your results.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isPlayerOpen && activeCourse && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-[100] bg-[#0B0F14] overflow-y-auto"
          >
            <div className="sticky top-0 z-50 p-4 md:p-6 border-b border-white/5 bg-[#0B0F14]/80 backdrop-blur-xl flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-3">
                <Monitor size={16} className="text-amber-500" />
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white">
                  Training Mode Active
                </span>
              </div>
              <button
                onClick={() => setIsPlayerOpen(false)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/30 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95"
              >
                <X size={14} /> Close Player
              </button>
            </div>
            <div className="py-6 md:py-10">
              <StructuredCoursePlayer courseId={activeCourse._id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Fragment>
  );
}

function StatBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number | null;
}) {
  return (
    <div className="bg-black/40 border border-white/[0.05] rounded-[14px] p-5 flex flex-col items-center justify-center text-center gap-2 hover:border-amber-500/20 transition-all shadow-inner">
      <div className="text-amber-500/40">{icon}</div>
      <div>
        <div className="text-[8px] font-black uppercase tracking-[0.2em] text-[#8A94A6]">
          {label}
        </div>
        <div className="text-[11px] font-black text-[#E5E7EB] tracking-widest uppercase mt-0.5 truncate max-w-[80px]">
          {value || "-"}
        </div>
      </div>
    </div>
  );
}
