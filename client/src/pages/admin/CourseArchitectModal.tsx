import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Plus,
  Trash2,
  Save,
  Sun,
  Moon,
  BatteryCharging,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

// 🚀 UPGRADED INTERFACES FOR TWO-A-DAYS
interface Step {
  _id: string;
}

interface DayTemplate {
  _id: string;
  name: string;
  steps: Step[];
}

interface Session {
  isRest: boolean;
  templateId: string;
}

interface CourseDay {
  dayNumber: number;
  morning: Session;
  evening: Session;
}

interface PopulatedSession {
  isRest: boolean;
  templateId?: { _id: string } | null;
}

interface PopulatedCourseDay {
  dayNumber: number;
  morning: PopulatedSession;
  evening: PopulatedSession;
}

interface CourseArchitectModalProps {
  courseId: string;
  courseName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CourseArchitectModal({
  courseId,
  courseName,
  onClose,
  onSuccess,
}: CourseArchitectModalProps) {
  const [availableTemplates, setAvailableTemplates] = useState<DayTemplate[]>(
    [],
  );
  const [days, setDays] = useState<CourseDay[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/chapters/templates"),
      api
        .get(`/chapters/plan/${courseId}`)
        .catch(() => ({ data: { data: null } })),
    ])
      .then(([templatesRes, planRes]) => {
        setAvailableTemplates(templatesRes.data.data);

        const existingPlan = planRes.data.data;
        if (existingPlan && existingPlan.days) {
          // 🚀 Maps the populated dual-phase days
          setDays(
            existingPlan.days.map((d: PopulatedCourseDay) => ({
              dayNumber: d.dayNumber,
              morning: {
                isRest: d.morning?.isRest || false,
                templateId: d.morning?.templateId?._id || "",
              },
              evening: {
                isRest: d.evening?.isRest || false,
                templateId: d.evening?.templateId?._id || "",
              },
            })),
          );
        } else {
          // 🚀 Starts with an empty dual-phase day
          setDays([
            {
              dayNumber: 1,
              morning: { isRest: false, templateId: "" },
              evening: { isRest: false, templateId: "" },
            },
          ]);
        }
      })
      .catch(() => toast.error("Failed to load architectural data"));
  }, [courseId]);

  const addDay = () => {
    const nextDayNum =
      days.length > 0 ? Math.max(...days.map((d) => d.dayNumber)) + 1 : 1;
    setDays([
      ...days,
      {
        dayNumber: nextDayNum,
        morning: { isRest: false, templateId: "" },
        evening: { isRest: false, templateId: "" },
      },
    ]);
  };

  const removeDay = (index: number) => {
    const newDays = [...days];
    newDays.splice(index, 1);
    const renumberedDays = newDays.map((day, i) => ({
      ...day,
      dayNumber: i + 1,
    }));
    setDays(renumberedDays);
  };

  // 🚀 HIGHLY CONTROLLED STATE UPDATER FOR SPECIFIC TIME BLOCKS
  const updateSession = (
    index: number,
    sessionType: "morning" | "evening",
    field: "isRest" | "templateId",
    value: string | boolean,
  ) => {
    const newDays = [...days];
    newDays[index][sessionType] = {
      ...newDays[index][sessionType],
      [field]: value,
    };

    // Automatically clear the template if marked as rest
    if (field === "isRest" && value === true) {
      newDays[index][sessionType].templateId = "";
    }

    setDays(newDays);
  };

  const handleSave = async () => {
    // 🚀 VALIDATION: Ensure neither slot is left completely empty/undefined
    const hasIncompleteSlot = days.some(
      (d) =>
        (!d.morning.isRest && !d.morning.templateId) ||
        (!d.evening.isRest && !d.evening.templateId),
    );

    if (hasIncompleteSlot) {
      return toast.error(
        "All active sessions must have an assigned Protocol Template or be marked as Rest.",
      );
    }

    setLoading(true);
    try {
      await api.post("/chapters/plan", { courseId, days });
      toast.success("Master Course Plan established!");
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to save Course Plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-[50] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm rounded-3xl">
      <div className="bg-[#0F1724] border border-white/10 rounded-[24px] w-[95%] max-w-4xl h-[90%] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5 shrink-0 bg-black/20">
          <div>
            <h2 className="text-2xl font-black italic uppercase text-white">
              Course Architect
            </h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mt-1">
              Target: {courseName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors bg-white/5 p-2 rounded-full active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Timeline Canvas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {days.length === 0 ? (
            <div className="text-center py-10 text-[#8A94A6]">
              <Calendar size={40} className="mx-auto mb-4 opacity-30" />
              <p className="text-xs uppercase tracking-widest font-black">
                No days scheduled.
              </p>
            </div>
          ) : (
            days.map((day, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row gap-6 bg-black/40 border border-white/5 rounded-2xl p-5 animate-in fade-in slide-in-from-bottom-4 shadow-inner"
              >
                {/* Day Badge & Delete Button Column */}
                <div className="flex flex-row md:flex-col items-center justify-between md:justify-start gap-4 shrink-0">
                  <div className="flex flex-col items-center justify-center w-16 h-16 bg-[#121821] border border-amber-500/20 rounded-xl shadow-inner">
                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">
                      Day
                    </span>
                    <span className="text-xl font-black text-white italic leading-none">
                      {day.dayNumber}
                    </span>
                  </div>

                  <button
                    onClick={() => removeDay(index)}
                    className="h-10 w-10 md:w-full rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors shrink-0"
                    title="Delete Day"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* 🚀 THE SPLIT SESSIONS UI */}
                <div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {/* ☀️ MORNING BLOCK */}
                  <div className="bg-[#121821] border border-white/[0.05] rounded-xl p-4 shadow-lg flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500">
                        <Sun size={14} /> Morning Protocol
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={day.morning.isRest}
                          onChange={(e) =>
                            updateSession(
                              index,
                              "morning",
                              "isRest",
                              e.target.checked,
                            )
                          }
                          className="w-3.5 h-3.5 accent-amber-500 cursor-pointer"
                        />
                        <span className="text-[9px] font-bold text-[#8A94A6] uppercase tracking-widest group-hover:text-white transition-colors">
                          Recovery
                        </span>
                      </label>
                    </div>

                    {!day.morning.isRest ? (
                      <select
                        value={day.morning.templateId}
                        onChange={(e) =>
                          updateSession(
                            index,
                            "morning",
                            "templateId",
                            e.target.value,
                          )
                        }
                        className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-xs font-bold text-white outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
                      >
                        <option value="" disabled>
                          -- Select Workout Template --
                        </option>
                        {availableTemplates.map((t) => (
                          <option key={t._id} value={t._id}>
                            {t.name} ({t.steps.length} Steps)
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="w-full bg-[#0B0F14] border border-white/[0.02] rounded-lg py-3 flex items-center justify-center gap-2 text-xs font-black uppercase text-[#8A94A6] shadow-inner opacity-70">
                        <BatteryCharging
                          size={14}
                          className="text-emerald-500"
                        />{" "}
                        Rest Scheduled
                      </div>
                    )}
                  </div>

                  {/* 🌙 EVENING BLOCK */}
                  <div className="bg-[#121821] border border-white/[0.05] rounded-xl p-4 shadow-lg flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400">
                        <Moon size={14} /> Evening Protocol
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={day.evening.isRest}
                          onChange={(e) =>
                            updateSession(
                              index,
                              "evening",
                              "isRest",
                              e.target.checked,
                            )
                          }
                          className="w-3.5 h-3.5 accent-blue-400 cursor-pointer"
                        />
                        <span className="text-[9px] font-bold text-[#8A94A6] uppercase tracking-widest group-hover:text-white transition-colors">
                          Recovery
                        </span>
                      </label>
                    </div>

                    {!day.evening.isRest ? (
                      <select
                        value={day.evening.templateId}
                        onChange={(e) =>
                          updateSession(
                            index,
                            "evening",
                            "templateId",
                            e.target.value,
                          )
                        }
                        className="w-full bg-[#0B0F14] border border-white/10 rounded-lg px-4 py-3 text-xs font-bold text-white outline-none focus:border-blue-400/50 appearance-none cursor-pointer"
                      >
                        <option value="" disabled>
                          -- Select Workout Template --
                        </option>
                        {availableTemplates.map((t) => (
                          <option key={t._id} value={t._id}>
                            {t.name} ({t.steps.length} Steps)
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="w-full bg-[#0B0F14] border border-white/[0.02] rounded-lg py-3 flex items-center justify-center gap-2 text-xs font-black uppercase text-[#8A94A6] shadow-inner opacity-70">
                        <BatteryCharging
                          size={14}
                          className="text-emerald-500"
                        />{" "}
                        Rest Scheduled
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Add Day Button */}
          <button
            onClick={addDay}
            className="w-full py-5 rounded-2xl border-2 border-dashed border-white/10 text-[#8A94A6] font-black text-[10px] uppercase tracking-[0.2em] hover:border-amber-500/50 hover:text-amber-500 hover:bg-amber-500/5 transition-all flex justify-center items-center gap-2 mt-4"
          >
            <Plus size={16} /> Schedule Additional Day
          </button>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-black/20 shrink-0">
          <button
            onClick={handleSave}
            disabled={loading || days.length === 0}
            className="w-full py-4 rounded-xl bg-amber-500 text-black font-black text-[10px] uppercase tracking-[0.2em] hover:bg-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-[0_10px_20px_rgba(245,158,11,0.2)]"
          >
            {loading ? "Compiling Master Plan..." : "Deploy Course Plan"}
            <Save size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
