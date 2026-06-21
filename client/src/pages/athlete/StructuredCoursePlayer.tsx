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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";

// ==========================================
// 🛡️ TYPESCRIPT INTERFACES
// ==========================================
interface Step {
  _id: string;
  title: string;
  type: string;
  videoUrl: string;
}

// 🚀 UPGRADED: Added sets and reps to the template interface
interface TemplateStep {
  _id?: string;
  step: Step;
  sets: string;
  reps: string;
}

interface DayTemplate {
  _id: string;
  name: string;
  steps: TemplateStep[];
}

interface CourseDay {
  dayNumber: number;
  templateId: DayTemplate;
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
    }
  };

  const openVideo = (url: string) => {
    setActiveVideo(url);
    setIsVideoModalOpen(true);
  };

  if (!plan) return <ClassicSingleVideoPlayer />;

  const currentDayData = plan.days.find((d) => d.dayNumber === activeDay);
  const uniqueWeeks = Array.from(
    new Set(plan.days.map((d) => getWeekNumber(d.dayNumber))),
  ).sort((a, b) => a - b);
  const daysInActiveWeek = plan.days.filter(
    (d) => getWeekNumber(d.dayNumber) === activeWeek,
  );

  // 🚀 NEW: Categories configuration for visual grouping
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
    <div className="max-w-4xl mx-auto p-4 md:p-6 animate-in fade-in duration-700 relative">
      <div className="mb-8 space-y-6">
        <h3 className="text-xl md:text-2xl font-black italic uppercase text-white">
          Protocol <span className="text-amber-500">Navigator</span>
        </h3>

        {/* TIER 1: THE WEEK SELECTOR */}
        <div className="flex overflow-x-auto gap-8 border-b border-white/10 pb-3 snap-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {uniqueWeeks.map((week) => {
            const isActiveWeek = activeWeek === week;
            return (
              <button
                key={`week-${week}`}
                onClick={() => handleWeekSwitch(week)}
                className={`relative pb-2 shrink-0 font-black uppercase tracking-widest text-sm transition-colors duration-300 ${
                  isActiveWeek
                    ? "text-white"
                    : "text-[#8A94A6] hover:text-white/70"
                }`}
              >
                Week {week}
                {isActiveWeek && (
                  <motion.div
                    layoutId="activeWeekUnderline"
                    className="absolute -bottom-[3px] left-0 right-0 h-[3px] bg-amber-500 rounded-t-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* TIER 2: THE DAY SELECTOR */}
        <div className="flex overflow-x-auto gap-3 pb-2 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {daysInActiveWeek.map((day) => {
            const isActive = activeDay === day.dayNumber;
            const isDayCompleteByDB = progress?.completedDays?.includes(
              day.dayNumber,
            );

            // Note: Update to use item.step._id instead of just step._id
            const allSteps = day.templateId?.steps || [];
            const areAllStepsChecked =
              allSteps.length > 0 &&
              allSteps.every((item) =>
                progress?.completedSteps?.includes(
                  `${day.dayNumber}-${item.step?._id}`,
                ),
              );
            const isFullyComplete = isDayCompleteByDB || areAllStepsChecked;

            return (
              <button
                key={day.dayNumber}
                onClick={() => setActiveDay(day.dayNumber)}
                className={`relative shrink-0 snap-start px-5 py-3 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all duration-300 ${
                  isActive
                    ? "bg-amber-500 text-black shadow-[0_5px_15px_rgba(245,158,11,0.2)] scale-105"
                    : "bg-[#0F1724] border border-white/5 text-[#8A94A6] hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isFullyComplete && (
                    <CheckCircle
                      size={14}
                      className={isActive ? "text-black" : "text-emerald-500"}
                    />
                  )}
                  {getDayNameOnly(day.dayNumber)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CARD SWAPPING CONTAINER (Protocol Steps) */}
      <div className="relative overflow-hidden bg-[#0F1724]/60 backdrop-blur-xl border border-white/[0.05] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-h-[400px]">
        <AnimatePresence mode="wait">
          {currentDayData && currentDayData.templateId ? (
            <motion.div
              key={`day-${currentDayData.dayNumber}`}
              initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="p-6 md:p-8"
            >
              <div className="mb-8">
                <h4 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic text-white leading-none">
                  {currentDayData.templateId.name}
                </h4>
                <p className="text-[10px] text-amber-500 uppercase tracking-widest mt-2 font-bold">
                  Day {currentDayData.dayNumber} •{" "}
                  {currentDayData.templateId.steps.length} Actions Required
                </p>
              </div>

              <div className="space-y-8">
                {/* 🚀 NEW: Render steps visually grouped by Category */}
                {stepCategories.map((category) => {
                  const stepsInCategory =
                    currentDayData.templateId.steps.filter(
                      (item) => item.step?.type === category.id,
                    );

                  if (stepsInCategory.length === 0) return null;

                  return (
                    <div key={category.id}>
                      {/* Section Header */}
                      <h5 className="flex items-center gap-2 text-amber-500 font-black text-[10px] md:text-xs uppercase tracking-widest mb-4 border-b border-white/5 pb-2">
                        {category.icon} {category.label}
                      </h5>

                      <div className="space-y-3">
                        {stepsInCategory.map((item) => {
                          // Handle cases where backend might send incomplete data
                          if (!item || !item.step) return null;

                          const scopedStepId = `${currentDayData.dayNumber}-${item.step._id}`;
                          const isDayCompleteByDB =
                            progress?.completedDays?.includes(
                              currentDayData.dayNumber,
                            );
                          const isStepComplete =
                            progress?.completedSteps?.includes(scopedStepId) ||
                            isDayCompleteByDB;

                          return (
                            <div
                              key={scopedStepId}
                              onClick={() => openVideo(item.step.videoUrl)}
                              className="p-4 rounded-[16px] bg-black/40 border border-white/5 hover:border-amber-500/40 hover:bg-[#121821] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group shadow-inner"
                            >
                              <div className="flex items-center gap-4 overflow-hidden flex-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStepComplete(scopedStepId);
                                  }}
                                  className="active:scale-90 transition-transform shrink-0"
                                >
                                  {isStepComplete ? (
                                    <CheckCircle
                                      size={22}
                                      className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                                    />
                                  ) : (
                                    <Circle
                                      size={22}
                                      className="text-[#8A94A6]/50 group-hover:text-amber-500/50"
                                    />
                                  )}
                                </button>
                                <div className="truncate">
                                  <p className="text-sm md:text-base font-black uppercase tracking-widest text-white truncate group-hover:text-amber-500 transition-colors">
                                    {item.step.title}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between sm:justify-end gap-4 pl-10 sm:pl-0">
                                {/* 🚀 NEW: Sets & Reps Badge */}
                                {(item.sets !== "-" || item.reps !== "-") && (
                                  <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-center shrink-0">
                                    <p className="text-[8px] text-[#8A94A6] font-black uppercase tracking-widest leading-none mb-1">
                                      Target
                                    </p>
                                    <p className="text-xs font-black text-white leading-none">
                                      {item.sets}{" "}
                                      <span className="text-amber-500 mx-0.5">
                                        x
                                      </span>{" "}
                                      {item.reps}
                                    </p>
                                  </div>
                                )}

                                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-black text-amber-500 transition-all shadow-inner">
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
                const allSteps = currentDayData.templateId.steps || [];
                const areAllStepsChecked =
                  allSteps.length > 0 &&
                  allSteps.every((item) =>
                    progress?.completedSteps?.includes(
                      `${currentDayData.dayNumber}-${item.step?._id}`,
                    ),
                  );
                const isDayCompleteByDB = progress?.completedDays?.includes(
                  currentDayData.dayNumber,
                );

                if (!isDayCompleteByDB && !areAllStepsChecked) {
                  return (
                    <button
                      onClick={() =>
                        handleDayComplete(currentDayData.dayNumber)
                      }
                      className="mt-8 w-full py-5 rounded-xl bg-amber-500 text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-amber-400 transition-all shadow-[0_10px_30px_rgba(245,158,11,0.2)] active:scale-95"
                    >
                      Log Day as Complete
                    </button>
                  );
                }
                return null;
              })()}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-10 flex flex-col items-center justify-center text-center min-h-[400px]"
            >
              <Circle size={48} className="text-white/10 mb-4 animate-pulse" />
              <p className="text-[#8A94A6] font-black uppercase tracking-widest text-xs">
                Rest Day or No Protocol Assigned
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🎬 IMMERSIVE VERTICAL REEL MODAL */}
      <AnimatePresence>
        {isVideoModalOpen && activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#0B0F14]/95 backdrop-blur-2xl"
          >
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-6 right-6 md:top-10 md:right-10 w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all active:scale-90 z-10"
            >
              <X size={24} />
            </button>

            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-[45vh] aspect-[9/16] bg-black rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
            >
              <video
                src={
                  activeVideo.startsWith("http")
                    ? activeVideo
                    : `https://pub-your-r2-domain.r2.dev/${activeVideo}`
                }
                controls
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==========================================
// 🛠️ EMPTY STATE FALLBACK
// ==========================================
function ClassicSingleVideoPlayer() {
  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-700">
      <div className="aspect-video bg-[#0B0F14] rounded-2xl overflow-hidden border border-white/10 relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center flex-col text-[#8A94A6]">
        <PlayCircle size={48} className="mb-4 opacity-20" />
        <p className="font-black uppercase tracking-widest text-xs text-amber-500 mb-2">
          Protocol Pending Deployment
        </p>
        <p className="text-[10px] text-[#8A94A6] max-w-xs text-center leading-relaxed">
          The administrator is currently configuring your Day-by-Day training
          schedule. Please stand by.
        </p>
      </div>
    </div>
  );
}
