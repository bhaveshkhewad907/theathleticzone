import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import axios from "axios";
import {
  Radio,
  Users,
  User,
  CheckCircle2,
  Zap,
  Activity,
  Clock,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Session {
  id: string;
  scheduledTime: string;
  type: "GROUP" | "ONE_ON_ONE";
  athletes: string[];
  isJoinAllowed: boolean;
  isLive: boolean;
  joinAvailableAt: string; // 🚀 Added this line!
  meetingLink?: string;
}

export default function CoachDashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [telemetry, setTelemetry] = useState({
    sessionStatus: "LOADING",
    athletesReady: 0,
    totalAthletes: 0,
    startTime: null as string | null,
    isLive: false,
  });
  const [countdown, setCountdown] = useState("--:--");

  // 🚀 1. Fetch all sessions (Keep this, it works perfectly)
  const fetchDashboard = async () => {
    try {
      const res = await api.get("/coach/dashboard");
      setSessions(res.data.data);
    } catch (error) {
      console.error("Failed to load dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // 🚀 2. DYNAMIC TELEMETRY ENGINE
  // This watches your 'sessions' array. Whenever it loads or changes, it updates the top panel!
  useEffect(() => {
    if (sessions.length === 0) {
      setTelemetry({
        sessionStatus: "STANDBY",
        athletesReady: 0,
        totalAthletes: 0,
        startTime: null,
        isLive: false,
      });
      return;
    }

    // Grab the first upcoming session, or the live one if it exists
    const activeOrNextSession = sessions.find((s) => s.isLive) || sessions[0];

    // Note: Since your backend returns 'joinAvailableAt', we use that to drive the logic!
    setTelemetry({
      sessionStatus: activeOrNextSession.isLive ? "LIVE" : "SCHEDULED",
      athletesReady: activeOrNextSession.athletes.length,
      totalAthletes: activeOrNextSession.athletes.length,
      startTime: activeOrNextSession.joinAvailableAt as string | null,
      isLive: activeOrNextSession.isLive,
    });
  }, [sessions]);

  // 🚀 3. THE COUNTDOWN TIMER
  useEffect(() => {
    if (!telemetry.startTime || telemetry.isLive) {
      setCountdown(telemetry.isLive ? "WINDOW OPEN" : "NO SESSION");
      return;
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();

      // 🛡️ THE TIMEZONE FIX: Strip the "Z" so the browser parses it as Local IST
      const cleanTimeString = telemetry.startTime!.replace("Z", "");
      const start = new Date(cleanTimeString).getTime();

      const distance = start - now;

      if (distance < 0) {
        setCountdown("WINDOW OPEN");
        clearInterval(timer);
      } else {
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setCountdown(
          `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [telemetry.startTime, telemetry.isLive]);

  const handleJoin = async (sessionId: string) => {
    try {
      setProcessingId(sessionId);
      const res = await api.post(`/coach/start/${sessionId}`);
      window.open(res.data.meetingLink, "_blank");
      fetchDashboard();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Unable to join session.");
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleEndSession = async (sessionId: string) => {
    try {
      setProcessingId(sessionId);
      await api.post(`/coach/end/${sessionId}`);
      navigate(`/coach/notes/${sessionId}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to end session.");
      }
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-full">
        {/* 🔦 Ambient Radial Lighting Spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />

        <div className="relative z-10 space-y-10 max-w-7xl mx-auto pt-2">
          {/* 🏆 Header Skeleton */}
          <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] p-10 rounded-[16px] gap-6">
            <div className="space-y-4">
              <div className="h-10 w-64 bg-white/[0.03] rounded-lg animate-pulse" />
              <div className="h-4 w-48 bg-white/[0.02] rounded-md animate-pulse" />
            </div>
            <div className="h-10 w-40 bg-white/[0.03] rounded-full animate-pulse" />
          </div>

          {/* 🚀 Telemetry Panel Skeleton */}
          <div className="h-24 w-full bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] rounded-[16px] animate-pulse flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-white/[0.03] rounded-xl" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-white/[0.03] rounded-md" />
                <div className="h-3 w-48 bg-white/[0.02] rounded-md" />
              </div>
            </div>
            <div className="h-10 w-32 bg-white/[0.03] rounded-[10px] hidden sm:block" />
          </div>

          {/* 📡 Sessions Grid Skeleton */}
          <div className="grid gap-6 pb-10">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-[#0F1724]/80 backdrop-blur-md p-10 rounded-[24px] border border-white/[0.05] flex flex-col lg:flex-row justify-between items-center gap-8 shadow-inner"
              >
                <div className="space-y-6 w-full lg:w-auto flex flex-col items-center lg:items-start">
                  {/* Time Badge */}
                  <div className="h-8 w-32 bg-white/[0.03] rounded-[10px] animate-pulse" />

                  {/* Title */}
                  <div className="h-10 w-56 bg-white/[0.03] rounded-lg animate-pulse" />

                  {/* Athlete Pills */}
                  <div className="flex gap-3">
                    <div className="h-8 w-24 bg-white/[0.02] rounded-lg animate-pulse" />
                    <div className="h-8 w-20 bg-white/[0.02] rounded-lg animate-pulse" />
                    <div className="h-8 w-28 bg-white/[0.02] rounded-lg animate-pulse hidden sm:block" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                  <div className="h-14 w-full sm:w-40 bg-white/[0.03] rounded-[12px] animate-pulse" />
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
              Live <span className="text-amber-500">Deployments</span>
            </h1>
            <p className="text-[#8A94A6] text-[10px] font-bold uppercase tracking-[0.3em] mt-3">
              Tactical Session Overview • Deployment Cycle
            </p>
          </div>
          <div className="relative z-10 px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <Radio size={14} className="text-amber-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">
              Awaiting Signal
            </span>
          </div>
        </div>
        <div>
          {/* 🚀 DYNAMIC COACH TELEMETRY PANEL */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] p-6 rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.45)] mb-8 transition-all">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Activity size={18} className="text-amber-500" />
              </div>
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8A94A6] flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${telemetry.isLive ? "bg-red-500 animate-pulse" : "bg-green-500 animate-pulse"}`}
                  />
                  Session Status:{" "}
                  <span
                    className={telemetry.isLive ? "text-red-500" : "text-white"}
                  >
                    {telemetry.sessionStatus}
                  </span>
                </h3>
                <p className="text-xs font-black text-[#E5E7EB] tracking-widest uppercase mt-1">
                  Athletes Ready: {telemetry.athletesReady} /{" "}
                  {telemetry.totalAthletes}
                </p>
              </div>
            </div>
            <div
              className={`px-5 py-2.5 bg-black/40 border rounded-[10px] text-[9px] font-black uppercase tracking-widest mt-4 sm:mt-0 ${telemetry.isLive ? "border-red-500/20 text-red-500" : "border-white/5 text-amber-500"}`}
            >
              {telemetry.isLive
                ? "SESSION IN PROGRESS"
                : countdown === "NO SESSION"
                  ? "NO SESSIONS PENDING"
                  : `OPENS IN ${countdown}`}
            </div>
          </div>

          {/* ... Rest of your coach dashboard ... */}
        </div>

        {sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 bg-[#0F1724]/40 border-2 border-dashed border-white/5 rounded-[24px] shadow-2xl">
            <CheckCircle2 size={48} className="text-[#8A94A6]/20 mb-6" />
            <div className="text-[#8A94A6]/40 uppercase font-black tracking-[0.4em] text-xs">
              No Sessions Scheduled
            </div>
            <p className="text-[9px] text-[#8A94A6]/20 font-bold uppercase tracking-widest mt-2">
              All sectors currently clear.
            </p>
          </div>
        )}

        {/* 📡 Sessions Grid */}
        <div className="grid gap-6 pb-10">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="group relative bg-[#0F1724]/80 backdrop-blur-md p-10 rounded-[24px] border border-white/[0.05] flex flex-col lg:flex-row justify-between items-center transition-all duration-500 hover:border-amber-500/30 shadow-[0_15px_35px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] overflow-hidden"
            >
              {/* Card Glow Effect */}
              <div className="absolute top-0 left-0 w-80 h-80 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-amber-500/10 transition-colors duration-700" />

              <div className="space-y-6 w-full lg:w-auto text-center lg:text-left relative z-10">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-[10px] bg-black/40 border border-white/10 text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] shadow-inner">
                  <Clock size={12} strokeWidth={3} /> Scheduled:{" "}
                  {session.scheduledTime}
                </div>

                <h2 className="text-4xl font-black tracking-tighter italic text-[#E5E7EB] flex items-center justify-center lg:justify-start gap-4">
                  {session.type === "GROUP" ? (
                    <Users
                      size={32}
                      className="text-amber-500"
                      strokeWidth={2.5}
                    />
                  ) : (
                    <User
                      size={32}
                      className="text-amber-500"
                      strokeWidth={2.5}
                    />
                  )}
                  {session.type === "GROUP"
                    ? "Technical Cluster"
                    : "Elite 1-on-1"}
                </h2>

                <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                  {session.athletes.map((name, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-[10px] font-black text-[#8A94A6] uppercase tracking-widest bg-black/20 px-4 py-2 rounded-lg border border-white/[0.03] shadow-inner"
                    >
                      <Activity size={10} className="text-amber-500/40" />
                      {name}
                    </div>
                  ))}
                </div>

                {session.isLive && (
                  <div className="inline-flex items-center gap-3 text-green-500 text-[10px] font-black uppercase tracking-[0.3em] bg-green-500/5 px-4 py-2 rounded-[10px] border border-green-500/20 animate-pulse mt-4">
                    <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                    Signal Active
                  </div>
                )}
              </div>

              <div className="mt-10 lg:mt-0 flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full lg:w-auto">
                <button
                  onClick={() => handleJoin(session.id)}
                  disabled={
                    !session.isJoinAllowed || processingId === session.id
                  }
                  className={`w-full sm:w-auto px-12 py-5 rounded-[12px] text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-[0_10px_20px_rgba(0,0,0,0.2)]
                    ${
                      session.isJoinAllowed
                        ? "bg-[#E5E7EB] text-black hover:bg-amber-500 hover:shadow-[0_0_25px_rgba(245,158,11,0.3)]"
                        : "bg-black/40 text-[#8A94A6]/20 border border-white/[0.05] cursor-not-allowed"
                    }
                  `}
                >
                  {processingId === session.id ? (
                    <span className="flex items-center gap-2">
                      Establishing Link...
                    </span>
                  ) : session.isLive ? (
                    "Rejoin Session"
                  ) : session.isJoinAllowed ? (
                    "Initialize Link"
                  ) : (
                    "Awaiting Window"
                  )}
                </button>

                {session.isLive && (
                  <button
                    onClick={() => handleEndSession(session.id)}
                    // 🛡️ FIX: Changed 'sessionId' to 'session.id' to match the current loop object
                    disabled={processingId === session.id}
                    className="w-full sm:w-auto px-10 py-5 rounded-[12px] text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white shadow-[0_10px_20px_rgba(239,68,68,0.1)]"
                  >
                    End Deployment
                  </button>
                )}
              </div>

              {/* Bottom Bevel Highlight */}
              <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-amber-500 transition-all duration-700 group-hover:w-full opacity-40" />
            </div>
          ))}
        </div>

        {/* 🏁 Footer Information */}
        <div className="pt-10 border-t border-white/[0.05] flex justify-between items-center text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">
          <div className="flex items-center gap-4">
            <Zap size={12} />
            System Online • Sector: Coach_Deployment
          </div>
          <div>Athletic Zone Intelligence v2.0.4</div>
        </div>
      </div>
    </div>
  );
}
