import { useState, useEffect } from "react";
// Removed unused 'Lock' import
import { PlayCircle, CheckCircle, Circle } from "lucide-react";
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
  templateId: DayTemplate; // Populated by Mongoose
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
  // 🚀 THE FIX: Explicitly tell TS what shape this data will take
  const [plan, setPlan] = useState<CoursePlan | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    // Fetch course structure and user progress concurrently
    Promise.all([
      api.get(`/chapters/plan/${courseId}`),
      api.get(`/chapters/progress/${courseId}`),
    ])
      .then(([planRes, progRes]) => {
        setPlan(planRes.data.data);
        setProgress(progRes.data.data);
      })
      .catch(() => {
        // 🚀 THE FIX: Removed the unused 'err' parameter
        console.error("Standard course fallback triggered");
      });
  }, [courseId]);

  const handleStepComplete = async (stepId: string) => {
    // Pointed to /chapters/progress
    const res = await api.post("/chapters/progress", { courseId, stepId });
    setProgress(res.data.data);
  };

  const handleDayComplete = async (dayNumber: number) => {
    // Pointed to /chapters/progress and removed the undefined stepId!
    const res = await api.post("/chapters/progress", {
      courseId,
      dayNumber,
      isDayComplete: true,
    });
    setProgress(res.data.data);
  };

  // 🛡️ BACKWARD COMPATIBILITY
  // NOTE: Replace this with the actual import of your old video player component!
  if (!plan) return <ClassicSingleVideoPlayer courseId={courseId} />;

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
      {/* LEFT: Video Player */}
      <div className="lg:col-span-2">
        <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 relative shadow-2xl">
          {activeVideo ? (
            <video
              src={activeVideo}
              controls
              autoPlay
              className="w-full h-full object-cover"
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

      {/* RIGHT: Structured Day Plan */}
      <div className="bg-[#0F1724] border border-white/[0.05] rounded-2xl p-6 overflow-y-auto max-h-[80vh]">
        <h3 className="text-xl font-black italic uppercase text-white mb-6">
          Training Protocol
        </h3>

        {plan.days.map((day: CourseDay) => {
          // 🚀 THE FIX: Optional chaining ensures it doesn't crash if progress is null while loading
          const isDayComplete = progress?.completedDays?.includes(
            day.dayNumber,
          );
          const template = day.templateId;

          return (
            <div
              key={day.dayNumber}
              className="mb-8 border-b border-white/5 pb-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-black text-amber-500 uppercase tracking-widest text-sm">
                  Day {day.dayNumber}: {template.name}
                </h4>
                {isDayComplete && (
                  <CheckCircle className="text-emerald-500" size={18} />
                )}
              </div>

              <div className="space-y-3">
                {/* 🚀 THE FIX: Added explicit 'Step' type to the map parameter */}
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
                          : "bg-black/40 border-white/5 hover:border-amber-500/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStepComplete(step._id);
                          }}
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
                          <p className="text-[9px] text-[#8A94A6] uppercase">
                            {step.type}
                          </p>
                        </div>
                      </div>
                      <PlayCircle
                        size={16}
                        className={
                          isPlaying ? "text-amber-500" : "text-white/20"
                        }
                      />
                    </div>
                  );
                })}
              </div>

              {/* Complete Session Button */}
              {!isDayComplete && (
                <button
                  onClick={() => handleDayComplete(day.dayNumber)}
                  className="mt-4 w-full py-3 rounded-xl bg-amber-500 text-black font-black text-[10px] uppercase tracking-widest hover:bg-amber-400 transition-all"
                >
                  Complete Session
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 🛠️ TEMPORARY PLACEHOLDER
// Delete this once you import your real legacy video player component at the top!
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
