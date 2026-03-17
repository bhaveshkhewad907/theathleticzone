import { useEffect, useState, useContext, Fragment, useRef } from "react";
import AuthContext from "../../context/AuthContext";
import api from "../../services/api";
import { Dialog, Transition } from "@headlessui/react";
import {
  Dumbbell,
  Ruler,
  Weight,
  Calendar,
  ChevronRight,
  Video,
  CheckCircle,
  Clock,
  MessageSquare,
  X,
  Activity, // 🛡️ NEW ICON for Telemetry
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import LeaveReview from "./LeaveReview";

// ... [Keep all your existing Interfaces and Time Utilities exactly the same] ...
interface AttendanceSummary {
  total: number;
  PRESENT: number;
  LATE: number;
  NO_SHOW: number;
  attendanceRate: number;
}
interface UpcomingSession {
  _id: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  meetingLink: string | null;
  isJoinable: boolean;
  isLive: boolean;
}
interface AthleteProfileData {
  sports?: (string | { _id: string; name: string })[];
  sport?: string;
  age: number;
  height: number;
  weight: number;
}

interface ApiError {
  response?: { data?: { message?: string } };
}

const getISTTime = () => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 330 * 60000);
};

const checkIsWithinWindow = () => {
  const istTime = getISTTime();
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const currentMinutes = hours * 60 + minutes;
  const start = 17 * 60;
  const end = 21 * 60 + 30;
  return currentMinutes >= start && currentMinutes <= end;
};

const checkIsSaturday = () => {
  const istTime = getISTTime();
  return istTime.getDay() === 6; // 0 = Sunday, 1 = Monday ... 6 = Saturday
};

const getTodayISTDateString = () => getISTTime().toDateString();

export default function AthleteDashboard() {
  const auth = useContext(AuthContext);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [session, setSession] = useState<UpcomingSession | null>(null);
  const [profile, setProfile] = useState<AthleteProfileData | null>(null);
  const [activeSubId, setActiveSubId] = useState<string | null>(null);
  const [sportsRegistry, setSportsRegistry] = useState<
    { _id: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [submittingAvailability, setSubmittingAvailability] = useState(false);
  const [isWithinWindow, setIsWithinWindow] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [joiningSession, setJoiningSession] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSaturday, setIsSaturday] = useState(false);

  const environmentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!environmentRef.current) return;
      requestAnimationFrame(() => {
        if (environmentRef.current) {
          environmentRef.current.style.setProperty(
            "--cursor-x",
            `${e.clientX}px`,
          );
          environmentRef.current.style.setProperty(
            "--cursor-y",
            `${e.clientY}px`,
          );
        }
      });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    setIsWithinWindow(checkIsWithinWindow());
    setIsSaturday(checkIsSaturday()); // 🚀 Set on load

    const interval = setInterval(() => {
      setIsWithinWindow(checkIsWithinWindow());
      setIsSaturday(checkIsSaturday()); // 🚀 Keep updated
    }, 60000);

    const lastSub = localStorage.getItem("last_availability_submission");
    if (lastSub === getTodayISTDateString()) setHasSubmitted(true);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, subRes, sportsRes] = await Promise.all([
          api.get("/athlete/dashboard"),
          api.get<{ data: { active: { _id: string } | null } }>(
            "/live-subscription/my",
          ),
          api.get("/sports"),
        ]);
        setSession(dashRes.data.data.upcomingSession);
        setSummary(dashRes.data.data.attendanceSummary);
        setProfile(dashRes.data.data.profile);
        setSportsRegistry(sportsRes.data.data);
        if (subRes.data.data.active)
          setActiveSubId(subRes.data.data.active._id);
      } catch (error) {
        console.error("Dashboard sync failed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
    const poll = setInterval(fetchDashboard, 30000);
    return () => clearInterval(poll);
  }, []);

  const handleSubmitAvailability = async () => {
    if (!activeSubId) return toast.error("No active subscription detected.");
    setSubmittingAvailability(true);
    try {
      await api.post("/availability/submit", { subscriptionId: activeSubId });
      toast.success("Readiness confirmed.");
      setHasSubmitted(true);
      localStorage.setItem(
        "last_availability_submission",
        getTodayISTDateString(),
      );
    } catch (error) {
      const err = error as ApiError;
      const errMsg = err.response?.data?.message;
      if (errMsg && errMsg.toLowerCase().includes("already submitted")) {
        setHasSubmitted(true);
        localStorage.setItem(
          "last_availability_submission",
          getTodayISTDateString(),
        );
        toast.success("Readiness locked.");
      } else {
        toast.error(errMsg || "Transmission failed.");
      }
    } finally {
      setSubmittingAvailability(false);
    }
  };

  const handleJoin = async () => {
    if (!session?.isJoinable || !session?._id || joiningSession) return;
    try {
      setJoiningSession(true);
      const res = await api.post(`/athlete/join-session/${session._id}`);
      window.open(res.data.data.meetingLink, "_blank");
    } catch (error) {
      const err = error as ApiError;
      toast.error(err.response?.data?.message || "Stream init failed.");
    } finally {
      setJoiningSession(false);
    }
  };

  // 🚀 NEW: Session Phase Telemetry Engine
  const getSessionPhase = () => {
    if (!session)
      return {
        label: "NO SESSION SCHEDULED",
        color: "bg-white/20",
        text: "text-[#8A94A6]",
        pulse: false,
      };
    if (session.isLive)
      return {
        label: "SESSION LIVE",
        color: "bg-red-500",
        text: "text-red-500",
        pulse: true,
      };
    if (session.isJoinable)
      return {
        label: "JOIN WINDOW OPEN",
        color: "bg-green-500",
        text: "text-green-500",
        pulse: true,
      };
    return {
      label: "SESSION SCHEDULED",
      color: "bg-amber-500",
      text: "text-amber-500",
      pulse: false,
    };
  };

  const phase = getSessionPhase();

  const getSportDisplayName = () => {
    /* Existing Sport logic unchanged */
    const findInRegistry = (idToFind: string | undefined) => {
      if (!idToFind || !sportsRegistry.length) return null;
      const found = sportsRegistry.find(
        (s) => String(s._id) === String(idToFind),
      );
      return found ? found.name : null;
    };
    const userSport = auth?.user?.sports?.[0];
    if (userSport) {
      if (typeof userSport === "object" && userSport.name)
        return userSport.name;
      const name = findInRegistry(
        typeof userSport === "object" ? userSport._id : userSport,
      );
      if (name) return name;
    }
    const profileSport = profile?.sports?.[0] || profile?.sport;
    if (profileSport) {
      if (
        typeof profileSport === "object" &&
        "name" in profileSport &&
        profileSport.name
      )
        return profileSport.name;
      const pId =
        typeof profileSport === "object" && "_id" in profileSport
          ? profileSport._id
          : profileSport;
      const name = findInRegistry(String(pId));
      if (name) return name;
    }
    return !profile && sportsRegistry.length === 0
      ? "SYNCING..."
      : "SECTOR LOCKED";
  };

  if (loading)
    return (
      <div className="relative min-h-full overflow-hidden">
        {/* Subtle pulsing animation over the whole skeleton */}
        <div className="relative z-10 space-y-10 max-w-7xl mx-auto animate-pulse">
          {/* Header Skeleton */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-[#0F1724]/40 border border-white/[0.02] p-8 rounded-[16px] gap-6">
            <div>
              <div className="h-8 w-64 bg-white/5 rounded-md mb-3" />
              <div className="h-3 w-48 bg-white/5 rounded-md" />
            </div>
            <div className="flex gap-4">
              <div className="h-14 w-32 bg-white/5 rounded-[12px]" />
              <div className="h-14 w-48 bg-white/5 rounded-[12px]" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-1 space-y-8">
              {/* Session Card Skeleton */}
              <div className="bg-[#0F1724]/40 border border-white/[0.02] rounded-[16px] p-8">
                <div className="h-3 w-32 bg-white/5 rounded-md mb-8" />
                <div className="h-3 w-24 bg-white/5 rounded-md mb-3" />
                <div className="h-10 w-48 bg-white/5 rounded-md mb-6" />
                <div className="h-14 w-full bg-white/5 rounded-[12px]" />
              </div>

              {/* Biometrics Card Skeleton */}
              <div className="bg-[#0F1724]/40 border border-white/[0.02] rounded-[16px] p-8">
                <div className="h-3 w-24 bg-white/5 rounded-md mb-8" />
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-white/5 rounded-[14px]" />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (Analytics) Skeleton */}
            <div className="lg:col-span-2">
              <div className="bg-[#0F1724]/40 border border-white/[0.02] rounded-[16px] p-10 h-full">
                <div className="h-3 w-48 bg-white/5 rounded-md mb-10" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-32 bg-white/5 rounded-[16px]" />
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Button Skeleton */}
            <div className="lg:col-span-3 pt-6 border-t border-white/5">
              <div className="h-14 w-full bg-white/5 rounded-[16px]" />
            </div>
          </div>
        </div>
      </div>
    );
  return (
    <Fragment>
      <div
        ref={environmentRef}
        className="relative min-h-full group/environment overflow-hidden"
      >
        {/* Ambient Edge Lighting */}
        <div className="absolute inset-0 pointer-events-none z-0 hidden md:block motion-safe:animate-[pulse_14s_ease-in-out_infinite]">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(30,58,138,0.06),transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(245,158,11,0.03),transparent_50%)]" />
          <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(5,8,15,0.8)]" />
        </div>

        {/* Cursor Reactive Lighting Aura */}
        <div
          className="absolute inset-0 pointer-events-none z-0 hidden md:block transition-opacity duration-1000 opacity-0 group-hover/environment:opacity-100 mix-blend-screen"
          style={{
            background:
              "radial-gradient(600px circle at var(--cursor-x, 50%) var(--cursor-y, 50%), rgba(245,158,11,0.025), transparent 40%)",
          }}
        />

        <div className="relative z-10 space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto">
          {/* 🏆 Header Section with Deployment Telemetry */}
          <div className="relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] p-8 rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] gap-6 transition-all duration-700 hover:border-white/10">
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
                Performance <span className="text-amber-500">Hub</span>
              </h1>
              <p className="text-[#8A94A6] text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
                Centralized Telemetry & Deployment Status
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative z-10">
              {/* 🚀 UPGRADED: Deployment Window Telemetry Badge */}
              <div className="bg-black/40 border border-white/[0.05] rounded-[12px] px-5 py-3 flex flex-col justify-center shadow-inner">
                <span className="text-[8px] font-black text-[#8A94A6] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <Activity
                    size={10}
                    className={
                      isSaturday
                        ? "text-blue-500"
                        : isWithinWindow
                          ? "text-green-500"
                          : "text-amber-500"
                    }
                  />
                  Deployment Window
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-white tracking-widest">
                    {isSaturday ? "SUNDAY REST DAY" : "17:00 – 21:30 IST"}
                  </span>
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-widest ${
                      isSaturday
                        ? "bg-blue-500/10 text-blue-500"
                        : isWithinWindow
                          ? "bg-green-500/10 text-green-500"
                          : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    {isSaturday
                      ? "OFFLINE"
                      : isWithinWindow
                        ? "OPEN"
                        : "CLOSED"}
                  </span>
                </div>
              </div>

              {activeSubId && (
                <button
                  onClick={handleSubmitAvailability}
                  disabled={
                    submittingAvailability ||
                    hasSubmitted ||
                    isSaturday ||
                    !isWithinWindow
                  }
                  className={`h-full px-6 py-4 rounded-[12px] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                    isSaturday
                      ? "bg-blue-500/10 text-blue-500 border border-blue-500/20 cursor-not-allowed shadow-inner"
                      : hasSubmitted
                        ? "bg-green-500/10 text-green-500 border border-green-500/20 cursor-not-allowed shadow-inner"
                        : !isWithinWindow
                          ? "bg-black/40 text-[#8A94A6]/30 border border-white/[0.05] cursor-not-allowed shadow-inner"
                          : "bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)] active:scale-95"
                  }`}
                >
                  {submittingAvailability ? (
                    "Transmitting..."
                  ) : isSaturday ? (
                    <>
                      <Calendar size={14} strokeWidth={3} /> Sunday Rest Day
                    </>
                  ) : hasSubmitted ? (
                    <>
                      <CheckCircle size={14} strokeWidth={3} /> Readiness
                      Confirmed
                    </>
                  ) : !isWithinWindow ? (
                    <>
                      <Clock size={14} strokeWidth={3} /> Window Closed
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} strokeWidth={3} /> Confirm
                      Readiness
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
              {/* 🚀 UPGRADED: Session Phase Telemetry Card */}
              <div className="group relative overflow-hidden bg-[#0F1724]/80 backdrop-blur-md border border-white/[0.05] rounded-[16px] p-8 transition-all duration-700 ease-out shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-amber-500/20 hover:bg-[#0F1724]/90">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                <h2
                  className={`text-[10px] font-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2 ${phase.text}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${phase.color} ${phase.pulse ? "animate-pulse shadow-[0_0_8px_currentColor]" : ""}`}
                  />
                  {phase.label}
                </h2>
                {session ? (
                  <div className="space-y-6">
                    <div>
                      <p className="text-[11px] font-black text-[#8A94A6] tracking-widest uppercase mb-1">
                        {new Date(session.scheduledDate).toLocaleDateString()}
                      </p>
                      <p className="text-4xl font-black text-[#E5E7EB] tracking-tighter italic leading-none group-hover:text-white transition-colors duration-700">
                        {session.scheduledTime}
                      </p>
                    </div>
                    <button
                      onClick={handleJoin}
                      disabled={!session.isJoinable || joiningSession}
                      className={`w-full py-4 rounded-[12px] text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${session.isJoinable ? "bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]" : "bg-black/40 border border-white/5 text-white/20"}`}
                    >
                      <Video size={16} strokeWidth={3} />
                      {session.isJoinable
                        ? "Connect to Stream"
                        : "Awaiting Window"}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-[9px] font-bold text-[#8A94A6]/40 uppercase tracking-widest italic leading-relaxed">
                      Submit readiness to request deployment.
                    </p>
                  </div>
                )}
              </div>

              {/* Biometrics Card */}
              <div className="group relative overflow-hidden bg-[#0F1724]/80 backdrop-blur-md border border-white/[0.05] rounded-[16px] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-700 ease-out hover:border-amber-500/20 hover:bg-[#0F1724]/90">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8A94A6] mb-8 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse" />
                  Biometrics
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <BioStat
                    icon={<Dumbbell size={14} />}
                    label="Sport"
                    value={getSportDisplayName()}
                  />
                  <BioStat
                    icon={<Calendar size={14} />}
                    label="Age"
                    value={`${profile?.age || 0} YRS`}
                  />
                  <BioStat
                    icon={<Weight size={14} />}
                    label="Mass"
                    value={`${profile?.weight || 0} KG`}
                  />
                  <BioStat
                    icon={<Ruler size={14} />}
                    label="Height"
                    value={`${profile?.height || 0} FT`}
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="relative bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] rounded-[16px] p-10 shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] h-full flex flex-col overflow-hidden transition-all duration-700 hover:border-white/10">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                <div className="flex items-center justify-between mb-10 border-b border-white/[0.05] pb-6 relative z-10">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8A94A6] flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-[pulse_3s_ease-in-out_infinite]" />
                    30-Day Analytics Engine
                  </h2>
                  <Link
                    to="/athlete/attendance-history"
                    className="group flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    Access Full Ledger{" "}
                    <ChevronRight
                      size={12}
                      strokeWidth={3}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </Link>
                </div>
                {summary ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 flex-1 relative z-10">
                    <Stat label="Total Volume" value={summary.total} />
                    <Stat
                      label="Consistency %"
                      value={`${summary.attendanceRate}%`}
                      color="text-amber-500"
                      highlight
                    />
                    <Stat
                      label="Full Completion"
                      value={summary.PRESENT}
                      color="text-green-500"
                      dotColor="bg-green-500"
                    />
                    <Stat
                      label="Late Entry"
                      value={summary.LATE}
                      color="text-yellow-500"
                      dotColor="bg-yellow-500"
                    />
                    <Stat
                      label="Critical Miss"
                      value={summary.NO_SHOW}
                      color="text-red-500"
                      dotColor="bg-red-500"
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center border-2 border-dashed border-white/5 rounded-[12px] bg-black/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#8A94A6]/20">
                      Analytics Offline
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-3 pt-6 border-t border-white/5">
              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="w-full relative overflow-hidden bg-gradient-to-r from-[#121821] to-[#0F1724] border border-white/5 hover:border-amber-500/50 text-[#8A94A6] hover:text-white py-4 rounded-[16px] flex items-center justify-center gap-3 transition-all duration-300 group shadow-[0_8px_16px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_20px_rgba(245,158,11,0.15)] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <MessageSquare
                  size={18}
                  className="text-amber-500/70 group-hover:text-amber-500 group-hover:scale-110 transition-all"
                />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
                  Submit Operational Debrief
                </span>
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.05] flex justify-between items-center text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />{" "}
              System Online • R2 Node Global
            </div>
            <div>Athletic Zone Intelligence v2.0.4</div>
          </div>
        </div>

        <Transition appear show={isReviewModalOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50"
            onClose={() => setIsReviewModalOpen(false)}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/90 backdrop-blur-xl" />
            </Transition.Child>
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-xl transform transition-all relative">
                    <button
                      onClick={() => setIsReviewModalOpen(false)}
                      className="absolute top-4 right-4 text-white/50 hover:text-white bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10 hover:border-white/30 z-10 transition-all shadow-lg active:scale-95"
                    >
                      <X size={18} strokeWidth={3} />
                    </button>
                    <LeaveReview
                      onSuccess={() => setIsReviewModalOpen(false)}
                    />
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </Fragment>
  );
}

function BioStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number | null;
}) {
  return (
    <div className="bg-black/40 border border-white/[0.05] rounded-[14px] p-5 flex flex-col items-center justify-center text-center gap-2 group hover:border-amber-500/20 hover:shadow-[0_0_20px_rgba(245,158,11,0.03)] hover:bg-black/50 transition-all duration-700 ease-out shadow-inner relative overflow-hidden">
      <div className="text-amber-500/40 group-hover:text-amber-500 transition-colors duration-700">
        {icon}
      </div>
      <div>
        <div className="text-[8px] font-black uppercase tracking-[0.2em] text-[#8A94A6]">
          {label}
        </div>
        <div className="text-[11px] font-black text-[#E5E7EB] tracking-widest uppercase mt-0.5 truncate max-w-[80px] group-hover:text-white transition-colors duration-700">
          {value || "-"}
        </div>
      </div>
    </div>
  );
}

// 🚀 UPGRADED: Analytics Stat with Micro-Telemetry Dots
function Stat({
  label,
  value,
  color = "text-[#E5E7EB]",
  highlight = false,
  dotColor = "bg-white/20",
}: {
  label: string;
  value: string | number;
  color?: string;
  highlight?: boolean;
  dotColor?: string;
}) {
  return (
    <div
      className={`group relative border rounded-[16px] p-8 flex flex-col items-center justify-center text-center transition-all duration-700 ease-out hover:border-white/10 hover:shadow-[0_0_25px_rgba(255,255,255,0.02)] hover:bg-[#0F1724]/60 ${highlight ? "bg-amber-500/5 border-amber-500/20 shadow-[0_15px_40px_rgba(245,158,11,0.1)]" : "bg-black/30 border-white/[0.05]"}`}
    >
      <div
        className={`absolute top-4 right-4 h-1 w-1 rounded-full ${dotColor} opacity-50 group-hover:animate-ping`}
      />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8A94A6] mb-3 group-hover:text-[#E5E7EB] transition-colors duration-700">
        {label}
      </p>
      <p
        className={`text-4xl font-black italic tracking-tighter ${color} group-hover:scale-105 group-hover:drop-shadow-[0_0_15px_currentColor] transition-all duration-700`}
      >
        {value}
      </p>
    </div>
  );
}
