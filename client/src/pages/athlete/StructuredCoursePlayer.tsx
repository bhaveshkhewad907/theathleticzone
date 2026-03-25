import { useState, useEffect } from "react";
import { PlayCircle, CheckCircle, Circle, ChevronDown } from "lucide-react";
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

// ==========================================
// 🎬 MAIN COMPONENT
// ==========================================
export default function StructuredCoursePlayer({
  courseId,
}: StructuredCoursePlayerProps) {
  const [plan, setPlan] = useState<CoursePlan | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  // 🚀 THE FIX: State to track which day is currently open (Defaults to Day 1)
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  useEffect(() => {
    Promise.all([
      api.get(`/chapters/plan/${courseId}`),
      api.get(`/chapters/progress/${courseId}`),
    ])
      .then(([planRes, progRes]) => {
        setPlan(planRes.data.data);
        setProgress(progRes.data.data);
      })
      .catch(() => {
        console.error("Standard course fallback triggered");
      });
  }, [courseId]);

  const handleStepComplete = async (stepId: string) => {
    const res = await api.post("/chapters/progress", { courseId, stepId });
    setProgress(res.data.data);
  };

  const handleDayComplete = async (dayNumber: number) => {
    const res = await api.post("/chapters/progress", {
      courseId,
      dayNumber,
      isDayComplete: true,
    });
    setProgress(res.data.data);

    // Optional UX improvement: Automatically open the next day when they complete one!
    setExpandedDay(dayNumber + 1);
  };

  if (!plan) return <ClassicSingleVideoPlayer courseId={courseId} />;

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
      {/* LEFT: Video Player */}
      <div className="lg:col-span-2">
        <div className="aspect-video bg-[#0B0F14] rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl">
          {activeVideo ? (
            <video
              src={activeVideo}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center flex-col text-[#8A94A6]">
              <PlayCircle size={48} className="mb-4 opacity-50" />
              <p className="font-black uppercase tracking-widest text-xs">
                Select a step to initialize protocol
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Structured Day Plan (The Accordion) */}
      <div className="bg-[#0F1724] border border-white/[0.05] rounded-2xl p-6 overflow-y-auto max-h-[80vh] shadow-xl">
        <h3 className="text-xl font-black italic uppercase text-white mb-6 sticky top-0 bg-[#0F1724] z-10 pb-2 border-b border-white/5">
          Training Protocol
        </h3>

        <div className="space-y-4">
          {plan.days.map((day: CourseDay) => {
            const isDayComplete = progress?.completedDays?.includes(
              day.dayNumber,
            );
            const template = day.templateId;
            const isExpanded = expandedDay === day.dayNumber;

            return (
              <div
                key={day.dayNumber}
                className={`border rounded-xl transition-all duration-300 overflow-hidden ${
                  isExpanded
                    ? "border-amber-500/30 bg-black/40"
                    : "border-white/5 bg-black/20 hover:border-white/10"
                }`}
              >
                {/* 🚀 ACCORDION HEADER */}
                <button
                  onClick={() =>
                    setExpandedDay(isExpanded ? null : day.dayNumber)
                  }
                  className="w-full flex justify-between items-center p-4 outline-none"
                >
                  <div className="flex items-center gap-4">
                    {/* Day Completion Icon */}
                    {isDayComplete ? (
                      <CheckCircle
                        className="text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] rounded-full"
                        size={20}
                      />
                    ) : (
                      <Circle className="text-[#8A94A6]/30" size={20} />
                    )}

                    <div className="text-left">
                      <h4 className="font-black text-white uppercase tracking-widest text-sm">
                        Day {day.dayNumber}
                      </h4>
                      <p className="text-[10px] text-amber-500 uppercase tracking-wider mt-0.5">
                        {template.name}
                      </p>
                    </div>
                  </div>

                  {/* Expand/Collapse Chevron */}
                  <div
                    className={`p-1.5 rounded-full bg-white/5 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                  >
                    <ChevronDown
                      size={14}
                      className={
                        isExpanded ? "text-amber-500" : "text-white/40"
                      }
                    />
                  </div>
                </button>

                {/* 🚀 ACCORDION BODY (The Steps) */}
                <div
                  className={`transition-all duration-500 ease-in-out ${
                    isExpanded
                      ? "max-h-[1000px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="p-4 pt-0 border-t border-white/5 mt-2 space-y-3">
                    {template.steps.map((step: Step) => {
                      const isStepComplete = progress?.completedSteps?.includes(
                        step._id,
                      );
                      const isPlaying = activeVideo === step.videoUrl;

                      return (
                        <div
                          key={step._id}
                          onClick={() => setActiveVideo(step.videoUrl)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isPlaying
                              ? "bg-amber-500/10 border-amber-500/50"
                              : "bg-[#121821] border-white/5 hover:border-amber-500/30"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStepComplete(step._id);
                              }}
                              className="active:scale-90 transition-transform"
                            >
                              {isStepComplete ? (
                                <CheckCircle
                                  size={16}
                                  className="text-emerald-500"
                                />
                              ) : (
                                <Circle size={16} className="text-[#8A94A6]" />
                              )}
                            </button>
                            <div>
                              <p
                                className={`text-xs font-black uppercase tracking-widest ${isPlaying ? "text-amber-500" : "text-white"}`}
                              >
                                {step.title}
                              </p>
                              <p className="text-[9px] text-[#8A94A6] uppercase tracking-wider">
                                {step.type}
                              </p>
                            </div>
                          </div>
                          <PlayCircle
                            size={16}
                            className={
                              isPlaying
                                ? "text-amber-500 animate-pulse"
                                : "text-white/20"
                            }
                          />
                        </div>
                      );
                    })}

                    {/* Complete Session Button */}
                    {!isDayComplete && (
                      <button
                        onClick={() => handleDayComplete(day.dayNumber)}
                        className="mt-6 w-full py-4 rounded-xl bg-amber-500 text-black font-black text-[10px] uppercase tracking-[0.2em] hover:bg-amber-400 transition-all shadow-[0_10px_20px_rgba(245,158,11,0.2)] active:scale-95"
                      >
                        Complete Session
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 🛠️ TEMPORARY PLACEHOLDER
// ==========================================
function ClassicSingleVideoPlayer({ courseId }: { courseId: string }) {
  return (
    <div className="p-10 text-center border border-white/10 rounded-xl bg-black/40 text-white">
      <p className="text-amber-500 font-bold tracking-widest uppercase text-sm mb-2">
        Legacy Protocol Detected
      </p>
      <p className="text-[#8A94A6] text-xs">
        Loading classic video interface for course: {courseId}...
      </p>
    </div>
  );
}
