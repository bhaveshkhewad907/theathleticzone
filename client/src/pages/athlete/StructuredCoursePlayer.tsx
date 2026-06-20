import { useState, useEffect } from "react";
import { PlayCircle, CheckCircle, Circle, X } from "lucide-react";
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

interface DayTemplate {
  _id: string;
  name: string;
  steps: Step[];
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

interface PurchaseRecord {
  course: {
    _id: string;
    videoUrl?: string;
    meta?: {
      videoUrl?: string;
    };
  };
}

// ==========================================
// 🧠 HELPER: MATHEMATICAL DAY CONVERTER
// ==========================================
const formatDayLabel = (dayNumber: number) => {
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekNumber = Math.ceil(dayNumber / 7);
  const dayName = daysOfWeek[(dayNumber - 1) % 7];
  return `W${weekNumber}: ${dayName}`;
};

// ==========================================
// 🎬 MAIN COMPONENT
// ==========================================
export default function StructuredCoursePlayer({
  courseId,
}: StructuredCoursePlayerProps) {
  const [plan, setPlan] = useState<CoursePlan | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);

  // Modal State
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Tab State
  const [activeDay, setActiveDay] = useState<number | null>(null);

  useEffect(() => {
    const fetchPlayerState = async () => {
      try {
        const planRes = await api.get(`/chapters/plan/${courseId}`);
        let planData = planRes.data?.data;

        if (Array.isArray(planData) && planData.length > 0) {
          planData = planData[0];
        }

        if (!planData || !planData.days || planData.days.length === 0) {
          return;
        }

        setPlan(planData);
        // Automatically select the first day in the tabs
        if (planData.days.length > 0) {
          setActiveDay(planData.days[0].dayNumber);
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
        console.error(
          "Critical Error fetching plan. Standard course fallback triggered.",
          error,
        );
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

    // Automatically slide to the next day!
    const nextDay = plan?.days.find((d) => d.dayNumber === dayNumber + 1);
    if (nextDay) setActiveDay(nextDay.dayNumber);
  };

  const openVideo = (url: string) => {
    setActiveVideo(url);
    setIsVideoModalOpen(true);
  };

  if (!plan) return <ClassicSingleVideoPlayer courseId={courseId} />;

  // Find the currently active day object to render
  const currentDayData = plan.days.find((d) => d.dayNumber === activeDay);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 animate-in fade-in duration-700 relative">
      {/* 🚀 HORIZONTAL DAY SELECTOR (The Tabs) */}
      <div className="mb-8">
        <h3 className="text-xl font-black italic uppercase text-white mb-4">
          Training Protocol
        </h3>
        <div className="flex overflow-x-auto gap-3 pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {plan.days.map((day) => {
            const isActive = activeDay === day.dayNumber;
            const isDayCompleteByDB = progress?.completedDays?.includes(
              day.dayNumber,
            );
            const allSteps = day.templateId?.steps || [];
            const areAllStepsChecked =
              allSteps.length > 0 &&
              allSteps.every((step) =>
                progress?.completedSteps?.includes(
                  `${day.dayNumber}-${step._id}`,
                ),
              );
            const isFullyComplete = isDayCompleteByDB || areAllStepsChecked;

            return (
              <button
                key={day.dayNumber}
                onClick={() => setActiveDay(day.dayNumber)}
                className={`relative shrink-0 snap-start px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${
                  isActive
                    ? "bg-amber-500 text-black shadow-[0_10px_20px_rgba(245,158,11,0.3)]"
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
                  {formatDayLabel(day.dayNumber)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🚀 CARD SWAPPING CONTAINER */}
      <div className="relative overflow-hidden bg-[#0F1724]/60 backdrop-blur-xl border border-white/[0.05] rounded-[2rem] shadow-2xl min-h-[400px]">
        <AnimatePresence mode="wait">
          {currentDayData && currentDayData.templateId && (
            <motion.div
              key={currentDayData.dayNumber}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="p-6 md:p-8"
            >
              <div className="mb-8">
                <h4 className="text-2xl font-black uppercase tracking-tighter italic text-white">
                  {currentDayData.templateId.name}
                </h4>
                <p className="text-[10px] text-amber-500 uppercase tracking-widest mt-1 font-bold">
                  {currentDayData.templateId.steps.length} Protocol Steps
                </p>
              </div>

              <div className="space-y-4">
                {currentDayData.templateId.steps.map((step) => {
                  const scopedStepId = `${currentDayData.dayNumber}-${step._id}`;
                  const isStepComplete =
                    progress?.completedSteps?.includes(scopedStepId);

                  return (
                    <div
                      key={step._id}
                      onClick={() => openVideo(step.videoUrl)}
                      className="p-4 rounded-[16px] bg-black/40 border border-white/5 hover:border-amber-500/40 hover:bg-[#121821] transition-all cursor-pointer flex items-center justify-between group shadow-inner"
                    >
                      <div className="flex items-center gap-4 overflow-hidden">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStepComplete(scopedStepId);
                          }}
                          className="active:scale-90 transition-transform shrink-0"
                        >
                          {isStepComplete ? (
                            <CheckCircle
                              size={20}
                              className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                            />
                          ) : (
                            <Circle
                              size={20}
                              className="text-[#8A94A6]/50 group-hover:text-amber-500/50"
                            />
                          )}
                        </button>
                        <div className="truncate">
                          <p className="text-sm font-black uppercase tracking-widest text-white truncate group-hover:text-amber-500 transition-colors">
                            {step.title}
                          </p>
                          <p className="text-[10px] text-[#8A94A6] uppercase tracking-wider mt-0.5">
                            {step.type}
                          </p>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-black text-amber-500 transition-all">
                        <PlayCircle
                          size={20}
                          className={!isStepComplete ? "animate-pulse" : ""}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Day Completion Logic */}
              {(() => {
                const allSteps = currentDayData.templateId.steps || [];
                const areAllStepsChecked =
                  allSteps.length > 0 &&
                  allSteps.every((step) =>
                    progress?.completedSteps?.includes(
                      `${currentDayData.dayNumber}-${step._id}`,
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
            {/* Close Button */}
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-6 right-6 md:top-10 md:right-10 w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all active:scale-90 z-10"
            >
              <X size={24} />
            </button>

            {/* Vertical Video Container (9:16 Aspect Ratio) */}
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-[45vh] aspect-[9/16] bg-black rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
            >
              <video
                src={activeVideo}
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
// 🛠️ UPGRADED SINGLE VIDEO PLAYER
// ==========================================
function ClassicSingleVideoPlayer({ courseId }: { courseId: string }) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get("/course-purchase/my")
      .then((res) => {
        const purchase = res.data.data.find(
          (p: PurchaseRecord) => p.course._id === courseId,
        );
        if (purchase) {
          const rawVideo =
            purchase.course.meta?.videoUrl || purchase.course.videoUrl;
          if (rawVideo) setVideoUrl(rawVideo);
        }
      })
      .catch((err) => console.error("Failed to fetch legacy video URL", err))
      .finally(() => setIsLoading(false));
  }, [courseId]);

  return (
    <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-700">
      <div className="aspect-video bg-[#0B0F14] rounded-2xl overflow-hidden border border-white/10 relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center flex-col text-[#8A94A6]">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(245,158,11,0.4)]" />
            <p className="font-black uppercase tracking-widest text-xs">
              Decrypting Video Stream...
            </p>
          </div>
        ) : videoUrl ? (
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center flex-col text-[#8A94A6] bg-black/40">
            <PlayCircle size={48} className="mb-4 opacity-20" />
            <p className="font-black uppercase tracking-widest text-xs text-amber-500 mb-2">
              Media Stream Unavailable
            </p>
            <p className="text-[10px] text-[#8A94A6] max-w-xs text-center leading-relaxed">
              No content has been uploaded to this protocol yet. Please wait for
              the administrator to deploy the Day-by-Day schedule.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
