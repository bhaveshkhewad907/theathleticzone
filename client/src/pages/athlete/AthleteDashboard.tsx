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
  Trophy,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";

import StructuredCoursePlayer from "./StructuredCoursePlayer";
import ProgramPaywall from "../assessment/ProgramPaywall";
import AssessmentWizard from "../../components/ui/AssessmentWizard";

interface ExtendedAuthUser {
  platformState?: { status?: string; hasPaidEntryFee?: boolean };
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

  const userStatus = (auth?.user as ExtendedAuthUser)?.platformState?.status;
  const hasPaid = (auth?.user as ExtendedAuthUser)?.platformState
    ?.hasPaidEntryFee;

  const [profile, setProfile] = useState<AthleteProfileData | null>(null);
  const [activeCourse, setActiveCourse] = useState<ActiveCourseData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  // 🚀 New UI States for the Loop
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (
      userStatus === "NEEDS_ASSESSMENT" ||
      userStatus === "COMPLETED_TRAINING" ||
      !userStatus
    ) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        try {
          const courseRes = await api.get("/course-purchase/my");
          if (courseRes.data?.data?.length > 0) {
            const courseObj = courseRes.data.data[0].course;
            setActiveCourse({
              _id: courseObj._id,
              title: courseObj.meta?.title || courseObj.title,
              description: courseObj.meta?.description || courseObj.description,
              thumbnailUrl:
                courseObj.meta?.coverImageUrl || courseObj.thumbnailUrl,
            });
          }
        } catch (courseErr) {
          console.error(courseErr);
        }

        try {
          const assessmentRes = await api.get("/assessment/me");
          if (assessmentRes.data?.data?.length > 0) {
            const latest = assessmentRes.data.data[0].physical;
            setProfile({
              age: latest?.age || 0,
              weight: latest?.bodyweightKg || 0,
              height: latest?.heightCm || 0,
            });
          }
        } catch (assessmentErr) {
          console.error(assessmentErr);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [userStatus]);

  // 🚀 TRIGGERS THE API AND OPENS RAZORPAY
  const handleInitiateRenewal = async () => {
    setIsResetting(true);
    try {
      await api.post("/assessments/reset-cycle"); // Calls our new backend logic!
      setIsVictoryModalOpen(false); // Close the popup
      setShowPaywall(true); // Open the checkout
    } catch {
      toast.error("Failed to sync with server. Check connection.");
    } finally {
      setIsResetting(false);
    }
  };

  // =========================================================
  // 🛑 STATE INTERCEPTORS (The Chameleon Logic)
  // =========================================================

  // 1. If Paywall state is triggered, show checkout fullscreen
  if (showPaywall || (userStatus === "COMPLETED_TRAINING" && !hasPaid)) {
    return <ProgramPaywall onSuccess={() => window.location.reload()} />;
  }

  // 2. If Assessment state is triggered, show assessment wizard
  if (userStatus === "NEEDS_ASSESSMENT" || !userStatus) {
    if (!hasPaid) {
      return <ProgramPaywall onSuccess={() => window.location.reload()} />;
    } else {
      return (
        <div className="animate-in fade-in duration-500">
          <AssessmentWizard />
        </div>
      );
    }
  }

  if (loading) {
    return (
      <div className="relative min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
      </div>
    );
  }

  // =========================================================
  // ✅ THE ACTIVE DASHBOARD
  // =========================================================
  return (
    <Fragment>
      <div className="relative min-h-full">
        <div className="relative z-10 space-y-10 animate-in fade-in duration-700 max-w-5xl mx-auto">
          {/* Dashboard Header */}
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
            {/* Stats Column */}
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
                    value={`${profile?.height || 0} CM`}
                  />
                  <StatBox
                    icon={<Dumbbell size={14} />}
                    label="Status"
                    value="ACTIVE"
                  />
                </div>
              </div>
            </div>

            {/* Course Column */}
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

                      <div className="mt-auto space-y-3 w-full">
                        <button
                          onClick={() => setIsPlayerOpen(true)}
                          className="w-full py-5 rounded-[12px] bg-amber-500 text-black font-black text-[10px] md:text-xs uppercase tracking-[0.2em] hover:bg-amber-400 active:scale-95 flex justify-center items-center gap-2 shadow-[0_10px_20px_rgba(245,158,11,0.2)] transition-all"
                        >
                          <PlayCircle size={18} /> Start Training Session
                        </button>

                        {/* 🚀 OPENS THE CONGRATULATIONS POPUP */}
                        <button
                          onClick={() => setIsVictoryModalOpen(true)}
                          className="w-full py-4 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-[12px] font-black text-[10px] uppercase tracking-[0.2em] transition-colors shadow-inner active:scale-95"
                        >
                          End Protocol & Unlock Next Phase
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-10 text-center border-2 border-dashed border-white/5 rounded-[12px] bg-black/20 m-6">
                    <ShieldCheck size={48} className="text-[#8A94A6]/20 mb-4" />
                    <h3 className="text-xl font-black text-white italic uppercase mb-2">
                      No Program Assigned
                    </h3>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🏆 THE CONGRATULATIONS POPUP MODAL */}
      <AnimatePresence>
        {isVictoryModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0B0F14]/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-lg w-full bg-[#121821] border border-amber-500/30 rounded-[24px] p-8 md:p-10 text-center shadow-[0_30px_60px_rgba(245,158,11,0.15)] relative overflow-hidden"
            >
              {/* Background glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[150px] bg-amber-500/20 blur-[80px] pointer-events-none rounded-full" />

              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center text-amber-500 mb-6 shadow-inner">
                  <Trophy size={40} />
                </div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-4">
                  Protocol <span className="text-amber-500">Completed!</span>
                </h2>
                <p className="text-[#8A94A6] text-sm font-medium leading-relaxed mb-8">
                  Congratulations! You have successfully mastered your current
                  training block. Your central nervous system is primed. It's
                  time to recalibrate your biomechanics and push to the next
                  tier.
                </p>

                <div className="space-y-4">
                  {/* 🚀 THIS BUTTON TRIGGERS THE RESET AND OPENS RAZORPAY */}
                  <button
                    onClick={handleInitiateRenewal}
                    disabled={isResetting}
                    className="w-full py-4 bg-amber-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] flex justify-center items-center gap-2 active:scale-95"
                  >
                    {isResetting
                      ? "Initializing..."
                      : "Move Ahead & Unlock Phase 2"}
                    {!isResetting && <ArrowRight size={18} />}
                  </button>

                  <button
                    onClick={() => setIsVictoryModalOpen(false)}
                    disabled={isResetting}
                    className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-[#8A94A6]/60 hover:text-white transition-colors"
                  >
                    Cancel & Stay on Dashboard
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎬 THE COURSE PLAYER */}
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
