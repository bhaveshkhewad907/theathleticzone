import { useState, useEffect } from "react";
import {
  PlayCircle,
  CheckCircle,
  Circle,
  X,
  Activity,
  Zap,
  Timer,
  BookOpen,
  Sun,
  Moon,
  BatteryCharging,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";

import ProgressiveBackground from "../../components/ui/ProgressiveBackground";

// ==========================================
// 🛡️ TYPESCRIPT INTERFACES
// ==========================================
interface Step {
  _id: string;
  title: string;
  type: string;
  videoUrl: string;
}

interface TemplateStep {
  _id?: string;
  step: Step;
  sets?: string;
  reps?: string;
  intensityType?: "Effort" | "Load" | "Custom" | "None";
  intensityValue?: string;
  recovery?: string;
}

interface DayTemplate {
  _id: string;
  name: string;
  steps: TemplateStep[];
}

interface Session {
  isRest: boolean;
  templateId?: DayTemplate | null;
  templateRefName?: string;
  steps?: TemplateStep[]; // 🚀 Supports the new inline architecture
}

interface CourseDay {
  dayNumber: number;
  morning: Session;
  evening: Session;
}

interface CoursePlan {
  _id: string;
  courseId: string;
  days: CourseDay[];
}

interface UserProgress {
  _id: string;
  courseId: string;
  completedSteps: string[];
  completedDays: number[];
}

interface StructuredCoursePlayerProps {
  courseId: string;
}

// ==========================================
// 🧠 HELPERS
// ==========================================
const getWeekNumber = (dayNumber: number) => Math.ceil(dayNumber / 7);

const getDayNameOnly = (dayNumber: number) => {
  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  return daysOfWeek[(dayNumber - 1) % 7];
};

// 🚀 ARCHITECTURE ADAPTERS
const getSessionSteps = (
  session: Session | undefined | null,
): TemplateStep[] => {
  if (!session) return [];
  if (session.steps && session.steps.length > 0) return session.steps;
  if (session.templateId && session.templateId.steps)
    return session.templateId.steps;
  return [];
};

const getSessionName = (session: Session | undefined | null): string => {
  if (!session) return "";
  if (session.templateRefName) return session.templateRefName;
  if (session.templateId && session.templateId.name)
    return session.templateId.name;
  return "Training Block";
};

// ==========================================
// 🎬 MAIN COMPONENT
// ==========================================
export default function StructuredCoursePlayer({
  courseId,
}: StructuredCoursePlayerProps) {
  const [plan, setPlan] = useState<CoursePlan | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);

  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [activeDay, setActiveDay] = useState<number | null>(null);

  const [activeSession, setActiveSession] = useState<"morning" | "evening">(
    "morning",
  );

  useEffect(() => {
    const fetchPlayerState = async () => {
      try {
        const planRes = await api.get(`/chapters/plan/${courseId}`);
        let planData = planRes.data?.data;

        if (Array.isArray(planData) && planData.length > 0)
          planData = planData[0];
        if (!planData || !planData.days || planData.days.length === 0) return;

        setPlan(planData);

        if (planData.days.length > 0) {
          const firstDay = planData.days[0].dayNumber;
          setActiveWeek(getWeekNumber(firstDay));
          setActiveDay(firstDay);
        }

        try {
          const progRes = await api.get(`/chapters/progress/${courseId}`);
          setProgress(progRes.data?.data || null);
        } catch {
          setProgress({
            _id: "",
            courseId,
            completedSteps: [],
            completedDays: [],
          });
        }
      } catch (error) {
        console.error("Error fetching plan.", error);
      }
    };

    fetchPlayerState();
  }, [courseId]);

  const handleStepComplete = async (scopedStepId: string) => {
    const res = await api.post("/chapters/progress", {
      courseId,
      stepId: scopedStepId,
    });
    setProgress(res.data.data);
  };

  const handleDayComplete = async (dayNumber: number) => {
    const res = await api.post("/chapters/progress", {
      courseId,
      dayNumber,
      isDayComplete: true,
    });
    setProgress(res.data.data);

    if (plan?.days) {
      const sortedDays = [...plan.days].sort(
        (a, b) => a.dayNumber - b.dayNumber,
      );
      const currentIndex = sortedDays.findIndex(
        (d) => d.dayNumber === dayNumber,
      );

      if (currentIndex !== -1 && currentIndex < sortedDays.length - 1) {
        const nextDay = sortedDays[currentIndex + 1];
        setActiveDay(nextDay.dayNumber);
        setActiveWeek(getWeekNumber(nextDay.dayNumber));
        setActiveSession("morning");
      }
    }
  };

  const handleWeekSwitch = (weekNum: number) => {
    setActiveWeek(weekNum);
    const firstDayOfSelectedWeek = plan?.days.find(
      (d) => getWeekNumber(d.dayNumber) === weekNum,
    );
    if (firstDayOfSelectedWeek) {
      setActiveDay(firstDayOfSelectedWeek.dayNumber);
      setActiveSession("morning");
    }
  };

  const openVideo = (url: string) => {
    setActiveVideo(url);
    setIsVideoModalOpen(true);
  };

  const checkSessionComplete = (
    session: Session | undefined,
    dayNum: number,
  ) => {
    if (!session || session.isRest) return true;
    const steps = getSessionSteps(session);
    if (steps.length === 0) return true;
    return steps.every((item) =>
      progress?.completedSteps?.includes(`${dayNum}-${item.step?._id}`),
    );
  };

  if (!plan) return <ClassicSingleVideoPlayer />;

  const currentDayData = plan.days.find((d) => d.dayNumber === activeDay);
  const uniqueWeeks = Array.from(
    new Set(plan.days.map((d) => getWeekNumber(d.dayNumber))),
  ).sort((a, b) => a - b);
  const daysInActiveWeek = plan.days.filter(
    (d) => getWeekNumber(d.dayNumber) === activeWeek,
  );

  const currentSessionData = currentDayData
    ? currentDayData[activeSession]
    : null;

  const stepCategories = [
    { id: "WARMUP", label: "1. Warmup Protocol", icon: <Activity size={16} /> },
    { id: "EXERCISE", label: "2. Primary Block", icon: <Zap size={16} /> },
    {
      id: "COOLDOWN",
      label: "3. Cooldown & Recovery",
      icon: <Timer size={16} />,
    },
    {
      id: "EDUCATION",
      label: "4. Education & Briefing",
      icon: <BookOpen size={16} />,
    },
  ];

  return (
    <ProgressiveBackground
      src="https://media.theathleticzone.in/auth-bg-images/video-player-bg.webp"
      className="fixed inset-0 w-full min-h-screen overflow-y-auto"
    >
      <div className="w-full min-h-screen animate-in fade-in duration-700 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 md:pt-12">
          {/* Controls Header */}
          <div className="mb-6 space-y-5">
            <h3 className="text-2xl md:text-3xl font-black italic uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Protocol <span className="text-amber-500">Navigator</span>
            </h3>

            {/* TIER 1: THE WEEK SELECTOR */}
            <div className="flex overflow-x-auto gap-2 md:gap-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-2 mb-2 snap-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {uniqueWeeks.map((week) => {
                const isActiveWeek = activeWeek === week;
                return (
                  <button
                    key={`week-${week}`}
                    onClick={() => handleWeekSwitch(week)}
                    className={`relative flex-1 min-w-[80px] py-2 md:py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] md:text-xs transition-all duration-300 drop-shadow-md ${
                      isActiveWeek
                        ? "text-white bg-white/10 shadow-inner"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    Week {week}
                    {isActiveWeek && (
                      <motion.div
                        layoutId="activeWeekUnderline"
                        className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-amber-500 rounded-t-full shadow-[0_0_10px_rgba(245,158,11,0.8)]"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* TIER 2: THE DAY SELECTOR */}
            <div className="flex overflow-x-auto gap-3 pb-2 mb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-1">
              {daysInActiveWeek.map((day) => {
                const isActive = activeDay === day.dayNumber;
                const isDayCompleteByDB = progress?.completedDays?.includes(
                  day.dayNumber,
                );
                const isMorningDone = checkSessionComplete(
                  day.morning,
                  day.dayNumber,
                );
                const isEveningDone = checkSessionComplete(
                  day.evening,
                  day.dayNumber,
                );
                const isFullyComplete =
                  isDayCompleteByDB || (isMorningDone && isEveningDone);
                const isFullRestDay =
                  day.morning?.isRest && day.evening?.isRest;

                return (
                  <button
                    key={day.dayNumber}
                    onClick={() => setActiveDay(day.dayNumber)}
                    className={`relative shrink-0 snap-start px-4 md:px-5 py-3 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 backdrop-blur-md border ${
                      isActive
                        ? "bg-amber-500 text-black border-amber-400 shadow-[0_5px_20px_rgba(245,158,11,0.3)] scale-105"
                        : isFullRestDay
                          ? "bg-black/40 border-white/5 text-white/50 hover:bg-black/60"
                          : "bg-black/40 border-white/10 text-white hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isFullyComplete ? (
                        <CheckCircle
                          size={14}
                          className={
                            isActive ? "text-black" : "text-emerald-500"
                          }
                        />
                      ) : isFullRestDay ? (
                        <BatteryCharging
                          size={14}
                          className={
                            isActive ? "text-black" : "text-emerald-500/50"
                          }
                        />
                      ) : null}
                      {getDayNameOnly(day.dayNumber)}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* TIER 3: SESSION TOGGLE */}
            {currentDayData && (
              <div className="flex w-full sm:max-w-sm mx-auto p-1.5 bg-black/40 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl mb-8">
                <button
                  onClick={() => setActiveSession("morning")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 ${
                    activeSession === "morning"
                      ? "bg-black/60 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] border border-amber-500/30"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Sun size={14} /> Morning
                </button>
                <button
                  onClick={() => setActiveSession("evening")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 ${
                    activeSession === "evening"
                      ? "bg-black/60 text-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.2)] border border-blue-400/30"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Moon size={14} /> Evening
                </button>
              </div>
            )}
          </div>

          {/* 🚀 CARD SWAPPING CONTAINER */}
          <div className="relative overflow-hidden bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-h-[400px]">
            <AnimatePresence mode="wait">
              {currentSessionData?.isRest ? (
                <motion.div
                  key={`rest-${currentDayData?.dayNumber}-${activeSession}`}
                  initial={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
                  animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                  exit={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 md:p-10 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_70%)]"
                >
                  <BatteryCharging
                    size={64}
                    className="text-emerald-500/50 mb-6 drop-shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-pulse"
                  />
                  <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic text-emerald-400 leading-none mb-4">
                    Recovery Protocol
                  </h4>
                  <p className="text-xs md:text-sm font-bold text-white/70 max-w-md uppercase tracking-widest leading-relaxed">
                    Central Nervous System restoration in progress. Hydrate,
                    focus on nutrition, and allow your body to absorb the
                    training adaptations.
                  </p>
                </motion.div>
              ) : getSessionSteps(currentSessionData).length > 0 ? (
                <motion.div
                  key={`active-${currentDayData?.dayNumber}-${activeSession}`}
                  initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="p-5 md:p-8"
                >
                  <div className="mb-6 md:mb-8">
                    <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic text-white leading-none">
                      {getSessionName(currentSessionData)}
                    </h4>
                    <p
                      className={`text-[9px] md:text-[10px] uppercase tracking-widest mt-2 font-bold ${activeSession === "morning" ? "text-amber-500" : "text-blue-400"}`}
                    >
                      Day {currentDayData?.dayNumber} • {activeSession} Block •{" "}
                      {getSessionSteps(currentSessionData).length} Actions
                      Required
                    </p>
                  </div>

                  <div className="space-y-8">
                    {stepCategories.map((category) => {
                      const sessionSteps = getSessionSteps(currentSessionData);
                      const stepsInCategory = sessionSteps.filter(
                        (item) => item.step?.type === category.id,
                      );

                      if (stepsInCategory.length === 0) return null;

                      return (
                        <div key={category.id}>
                          <h5
                            className={`flex items-center gap-2 font-black text-[10px] md:text-xs uppercase tracking-widest mb-4 border-b border-white/5 pb-2 ${activeSession === "morning" ? "text-amber-500" : "text-blue-400"}`}
                          >
                            {category.icon} {category.label}
                          </h5>

                          <div className="space-y-3">
                            {stepsInCategory.map((item) => {
                              if (!item || !item.step) return null;

                              const scopedStepId = `${currentDayData?.dayNumber}-${item.step._id}`;
                              const isDayCompleteByDB =
                                progress?.completedDays?.includes(
                                  currentDayData!.dayNumber,
                                );
                              const isStepComplete =
                                progress?.completedSteps?.includes(
                                  scopedStepId,
                                ) || isDayCompleteByDB;

                              // 🚀 INTENSITY FORMATTING LOGIC
                              const parts = [];
                              if (item.sets && item.sets !== "-")
                                parts.push(`${item.sets} SETS`);
                              if (item.reps && item.reps !== "-")
                                parts.push(`${item.reps} REPS`);
                              const setRepString = parts.join(" / ");

                              let intensityString = "";
                              if (
                                item.intensityType &&
                                item.intensityType !== "None" &&
                                item.intensityValue &&
                                item.intensityValue !== "-"
                              ) {
                                intensityString = `${item.intensityValue} ${item.intensityType === "Custom" ? "" : item.intensityType}`;
                              }

                              return (
                                <div
                                  key={scopedStepId}
                                  onClick={() => openVideo(item.step.videoUrl)}
                                  className={`p-4 md:p-5 rounded-[16px] md:rounded-[20px] bg-black/50 backdrop-blur-xl border border-white/10 hover:bg-black/70 transition-all cursor-pointer flex items-center justify-between gap-4 group shadow-lg ${
                                    activeSession === "morning"
                                      ? "hover:border-amber-500/40"
                                      : "hover:border-blue-400/40"
                                  }`}
                                >
                                  {/* Left side: Checkbox & Details */}
                                  <div className="flex items-start gap-4 overflow-hidden flex-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleStepComplete(scopedStepId);
                                      }}
                                      className="mt-1 active:scale-90 transition-transform shrink-0"
                                    >
                                      {isStepComplete ? (
                                        <CheckCircle
                                          size={22}
                                          className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                        />
                                      ) : (
                                        <Circle
                                          size={22}
                                          className={`text-white/40 ${activeSession === "morning" ? "group-hover:text-amber-500/50" : "group-hover:text-blue-400/50"}`}
                                        />
                                      )}
                                    </button>

                                    {/* 🚀 UPGRADED DATA HIERARCHY (Matches WhatsApp Reference) */}
                                    <div className="flex flex-col gap-1.5 w-full">
                                      <p
                                        className={`text-sm md:text-base font-black uppercase tracking-widest text-white transition-colors ${activeSession === "morning" ? "group-hover:text-amber-500" : "group-hover:text-blue-400"}`}
                                      >
                                        {item.step.title}
                                      </p>

                                      <div className="flex flex-col gap-0.5">
                                        {(setRepString || intensityString) && (
                                          <p className="text-[10px] md:text-[11px] font-bold text-[#8A94A6] uppercase tracking-wider">
                                            {setRepString}
                                            {setRepString &&
                                              intensityString && (
                                                <span className="mx-1">/</span>
                                              )}
                                            {intensityString && (
                                              <span className="text-white/80">
                                                {intensityString}
                                              </span>
                                            )}
                                          </p>
                                        )}

                                        {item.recovery &&
                                          item.recovery !== "-" &&
                                          item.recovery !== "0 sec" && (
                                            <p className="text-[10px] md:text-[11px] font-bold text-[#8A94A6] uppercase tracking-wider">
                                              RECOVERY:{" "}
                                              <span className="text-white/80">
                                                {item.recovery}
                                              </span>
                                            </p>
                                          )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right side: Play Button */}
                                  <div className="shrink-0 pl-2 md:pl-4 border-l border-white/5">
                                    <div
                                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all shadow-inner ${
                                        activeSession === "morning"
                                          ? "bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-black"
                                          : "bg-blue-400/10 text-blue-400 group-hover:bg-blue-400 group-hover:text-black"
                                      }`}
                                    >
                                      <PlayCircle
                                        size={20}
                                        className={
                                          !isStepComplete ? "animate-pulse" : ""
                                        }
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Day Completion Button Logic */}
                  {(() => {
                    if (!currentDayData) return null;
                    const isDayCompleteByDB = progress?.completedDays?.includes(
                      currentDayData.dayNumber,
                    );
                    const isMorningDone = checkSessionComplete(
                      currentDayData.morning,
                      currentDayData.dayNumber,
                    );
                    const isEveningDone = checkSessionComplete(
                      currentDayData.evening,
                      currentDayData.dayNumber,
                    );
                    const areAllStepsChecked = isMorningDone && isEveningDone;

                    if (!isDayCompleteByDB && !areAllStepsChecked) {
                      return (
                        <button
                          onClick={() =>
                            handleDayComplete(currentDayData.dayNumber)
                          }
                          className="mt-8 w-full py-4 md:py-5 rounded-xl bg-amber-500 text-black font-black text-[10px] md:text-xs uppercase tracking-[0.2em] hover:bg-amber-400 transition-all shadow-[0_10px_30px_rgba(245,158,11,0.2)] active:scale-95"
                        >
                          Log Full Day as Complete
                        </button>
                      );
                    }
                    return null;
                  })()}
                </motion.div>
              ) : (
                <motion.div
                  key={`empty-${currentDayData?.dayNumber}-${activeSession}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-10 flex flex-col items-center justify-center text-center min-h-[400px]"
                >
                  <Circle
                    size={48}
                    className="text-white/20 mb-4 animate-pulse"
                  />
                  <p className="text-white/60 font-black uppercase tracking-widest text-xs">
                    No Protocol Assigned
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 🎬 IMMERSIVE VERTICAL REEL MODAL */}
      <AnimatePresence>
        {isVideoModalOpen && activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // Increased z-index to ensure it overlaps any other floating navigation
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#0B0F14]/95 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-[45vh] aspect-[9/16] bg-black rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
            >
              {/* 🚀 UPGRADED: Close Button moved INSIDE the video frame so it never gets hidden by mobile notches! */}
              <button
                onClick={() => {
                  setIsVideoModalOpen(false);
                  setTimeout(() => setActiveVideo(null), 300); // 🚀 Clears the video so audio actually stops!
                }}
                className="absolute top-4 right-4 w-10 h-10 bg-black/60 hover:bg-red-500 border border-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all active:scale-90 z-50 shadow-xl"
              >
                <X size={20} />
              </button>

              <video
                src={
                  activeVideo.startsWith("http")
                    ? activeVideo
                    : `https://media.theathleticzone.in/${activeVideo}`
                }
                controls
                autoPlay
                playsInline
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ProgressiveBackground>
  );
}

// ==========================================
// 🛠️ EMPTY STATE FALLBACK
// ==========================================
function ClassicSingleVideoPlayer() {
  return (
    <ProgressiveBackground
      src="https://media.theathleticzone.in/auth-bg-images/video-player-bg.webp"
      className="fixed inset-0 w-full min-h-screen overflow-y-auto"
    >
      <div className="w-full min-h-screen flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-700">
        <div className="w-full max-w-4xl aspect-video bg-black/40 backdrop-blur-2xl rounded-[2rem] overflow-hidden border border-white/10 relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center flex-col text-white/60 p-6">
          <PlayCircle size={48} className="mb-4 opacity-40" />
          <p className="font-black uppercase tracking-widest text-xs md:text-sm text-amber-500 mb-2 drop-shadow-md text-center">
            Protocol Pending Deployment
          </p>
          <p className="text-[10px] md:text-xs text-white/60 max-w-xs text-center leading-relaxed">
            The administrator is currently configuring your Day-by-Day training
            schedule. Please stand by.
          </p>
        </div>
      </div>
    </ProgressiveBackground>
  );
}
