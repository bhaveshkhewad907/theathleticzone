import { useState, useEffect } from "react";
import {
  X,
  Save,
  Plus,
  Trash2,
  Sun,
  Moon,
  BatteryCharging,
  Dumbbell,
  Timer,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import StepPickerModal from "./StepPickerModal"; // Ensures we can add ad-hoc exercises

// ==========================================
// 🛡️ TYPESCRIPT INTERFACES
// ==========================================
interface StepRef {
  _id: string;
  title: string;
  type: string;
}

interface InlineStep {
  step: StepRef;
  sets: string;
  reps: string;
  intensityType: "Effort" | "Load" | "Custom" | "None";
  intensityValue: string;
  recovery: string;
}

interface Session {
  isRest: boolean;
  templateRefName: string;
  steps: InlineStep[];
}

interface CourseDay {
  dayNumber: number;
  morning: Session;
  evening: Session;
}

interface Template {
  _id: string;
  name: string;
  steps: InlineStep[];
}

interface CourseArchitectModalProps {
  courseId: string;
  courseName: string;
  onClose: () => void;
  onSuccess: () => void;
}

// ==========================================
// 🎬 MAIN COMPONENT
// ==========================================
export default function CourseArchitectModal({
  courseId,
  courseName,
  onClose,
  onSuccess,
}: CourseArchitectModalProps) {
  // 1. Core State
  const [days, setDays] = useState<CourseDay[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Editor State
  const [activeDay, setActiveDay] = useState<number>(1);
  const [activeSession, setActiveSession] = useState<"morning" | "evening">(
    "morning",
  );
  const [showStepPicker, setShowStepPicker] = useState(false);

  // ==========================================
  // 🔄 INITIALIZATION (Fetch Plan & Blueprints)
  // ==========================================
  useEffect(() => {
    const initializeArchitect = async () => {
      try {
        // Fetch Blueprints (Templates)
        const templatesRes = await api.get("/chapters/templates");
        setTemplates(templatesRes.data.data);

        // Fetch Existing Plan
        const planRes = await api.get(`/chapters/plan/${courseId}`);
        const existingPlan = planRes.data.data;

        if (existingPlan && existingPlan.days && existingPlan.days.length > 0) {
          // Normalize existing data to ensure it matches our strict UI state
          const normalizedDays = existingPlan.days.map((d: CourseDay) => ({
            dayNumber: d.dayNumber,
            morning: {
              isRest: d.morning.isRest || false,
              templateRefName: d.morning.templateRefName || "",
              steps: d.morning.steps || [],
            },
            evening: {
              isRest: d.evening.isRest || false,
              templateRefName: d.evening.templateRefName || "",
              steps: d.evening.steps || [],
            },
          }));
          setDays(normalizedDays);
        } else {
          // Generate a blank 42-day (6-week) slate if no plan exists
          const initialDays: CourseDay[] = Array.from(
            { length: 42 },
            (_, i) => ({
              dayNumber: i + 1,
              morning: { isRest: false, templateRefName: "", steps: [] },
              evening: { isRest: false, templateRefName: "", steps: [] },
            }),
          );
          setDays(initialDays);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to initialize Architect environment.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeArchitect();
  }, [courseId]);

  // ==========================================
  // 🛠️ DAY EDITOR FUNCTIONS
  // ==========================================
  const currentDayIndex = days.findIndex((d) => d.dayNumber === activeDay);
  const activeDayData = days[currentDayIndex];
  const activeSessionData = activeDayData ? activeDayData[activeSession] : null;

  const updateActiveSession = (updater: (session: Session) => Session) => {
    setDays((prevDays) => {
      const newDays = [...prevDays];
      newDays[currentDayIndex] = {
        ...newDays[currentDayIndex],
        [activeSession]: updater({
          ...newDays[currentDayIndex][activeSession],
        }),
      };
      return newDays;
    });
  };

  const toggleRestDay = () => {
    updateActiveSession((session) => {
      session.isRest = !session.isRest;
      return session;
    });
  };

  // 🚀 IMPORT BLUEPRINT: Copies steps from Template into the active Day
  const importBlueprint = (templateId: string) => {
    if (!templateId) return;
    const template = templates.find((t) => t._id === templateId);
    if (!template) return;

    if (activeSessionData && activeSessionData.steps.length > 0) {
      if (
        !window.confirm(
          "Importing a Blueprint will overwrite the current exercises for this session. Continue?",
        )
      )
        return;
    }

    updateActiveSession((session) => {
      session.templateRefName = template.name;
      // Deep copy to prevent reference mutation
      session.steps = template.steps.map((s) => ({ ...s }));
      return session;
    });
  };

  // 🚀 INLINE STEP EDITING
  const addStepFromPicker = (stepData: StepRef) => {
    updateActiveSession((session) => {
      session.steps.push({
        step: stepData,
        sets: "-",
        reps: "-",
        intensityType: "None",
        intensityValue: "-",
        recovery: "0 sec",
      });
      return session;
    });
    setShowStepPicker(false);
  };

  const removeStep = (stepIndex: number) => {
    updateActiveSession((session) => {
      session.steps.splice(stepIndex, 1);
      return session;
    });
  };

  const updateStepField = (
    stepIndex: number,
    field: keyof InlineStep,
    value: string,
  ) => {
    updateActiveSession((session) => {
      session.steps[stepIndex] = {
        ...session.steps[stepIndex],
        [field]: value,
      };
      return session;
    });
  };

  // ==========================================
  // 💾 SAVING TO DATABASE
  // ==========================================
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Map state down to Mongoose expected payload (convert step object back to ObjectIds)
      const mappedDays = days.map((d) => ({
        dayNumber: d.dayNumber,
        morning: {
          isRest: d.morning.isRest,
          templateRefName: d.morning.templateRefName,
          steps: d.morning.steps.map((s) => ({
            step: s.step._id, // Extract ID
            sets: s.sets,
            reps: s.reps,
            intensityType: s.intensityType,
            intensityValue: s.intensityValue,
            recovery: s.recovery,
          })),
        },
        evening: {
          isRest: d.evening.isRest,
          templateRefName: d.evening.templateRefName,
          steps: d.evening.steps.map((s) => ({
            step: s.step._id,
            sets: s.sets,
            reps: s.reps,
            intensityType: s.intensityType,
            intensityValue: s.intensityValue,
            recovery: s.recovery,
          })),
        },
      }));

      await api.post("/chapters/plan", {
        courseId,
        days: mappedDays,
      });

      toast.success("Course Plan fully synchronized!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save Course Plan.");
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // 🎨 RENDERERS
  // ==========================================
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[50] flex items-center justify-center p-2 md:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in">
        <div className="bg-[#0F1724] border border-white/10 rounded-[2rem] w-full max-w-[1400px] h-[95vh] overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
          {/* Header (Mobile Only) */}
          <div className="md:hidden flex justify-between items-center p-4 border-b border-white/5 bg-[#121821]">
            <h2 className="text-lg font-black italic uppercase text-white truncate">
              Architect: {courseName}
            </h2>
            <button onClick={onClose} className="text-white/50">
              <X size={20} />
            </button>
          </div>

          {/* LEFT PANEL: TIMELINE MAPPER */}
          <div className="w-full md:w-[350px] lg:w-[400px] h-[150px] md:h-full flex flex-col border-b md:border-b-0 md:border-r border-white/5 bg-[#0B0F14]">
            <div className="hidden md:block p-6 border-b border-white/5 bg-gradient-to-b from-[#121821] to-[#0B0F14]">
              <h2 className="text-2xl font-black italic uppercase text-white leading-none">
                Course <span className="text-amber-500">Architect</span>
              </h2>
              <p className="text-[10px] text-[#8A94A6] uppercase tracking-[0.2em] mt-2 font-bold truncate">
                Target: {courseName}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-4 space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-x-hidden">
              {days.map((day) => {
                const isActive = activeDay === day.dayNumber;
                const mRest = day.morning.isRest;
                const eRest = day.evening.isRest;
                const mSteps = day.morning.steps.length;
                const eSteps = day.evening.steps.length;

                let statusText = "Pending Setup";
                let statusColor = "text-white/30";

                if (mRest && eRest) {
                  statusText = "Full Recovery";
                  statusColor = "text-emerald-500";
                } else if (mSteps > 0 || eSteps > 0) {
                  statusText = "Active Protocol";
                  statusColor = "text-amber-500";
                }

                return (
                  <button
                    key={day.dayNumber}
                    onClick={() => setActiveDay(day.dayNumber)}
                    className={`w-[140px] md:w-full shrink-0 flex flex-col text-left p-3 md:p-4 rounded-2xl transition-all duration-300 border ${
                      isActive
                        ? "bg-amber-500/10 border-amber-500/50 shadow-inner"
                        : "bg-[#121821] border-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className={`text-[11px] md:text-sm font-black uppercase tracking-widest ${isActive ? "text-amber-500" : "text-white"}`}
                      >
                        Day {day.dayNumber}
                      </span>
                      <span className="text-[9px] font-black tracking-widest text-[#8A94A6]">
                        W{Math.ceil(day.dayNumber / 7)}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest ${statusColor}`}
                    >
                      {statusText}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-white/5 bg-[#121821] hidden md:block">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-4 rounded-xl bg-amber-500 text-black font-black text-[10px] uppercase tracking-[0.2em] hover:bg-amber-400 transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-[0_10px_30px_rgba(245,158,11,0.2)]"
              >
                {isSaving ? "Synchronizing..." : "Deploy Course Plan"}
                {!isSaving && <Save size={16} />}
              </button>
            </div>
          </div>

          {/* RIGHT PANEL: DYNAMIC DAY EDITOR */}
          <div className="flex-1 flex flex-col h-full bg-[#121821] relative overflow-hidden">
            {/* Desktop Close Button */}
            <button
              onClick={onClose}
              className="hidden md:flex absolute top-6 right-6 z-20 text-white/50 hover:text-white bg-black/40 p-2 rounded-full backdrop-blur-md border border-white/10 transition-colors"
            >
              <X size={20} />
            </button>

            {activeSessionData && (
              <>
                {/* Editor Header: Session Toggle */}
                <div className="p-6 md:p-8 border-b border-white/5 bg-gradient-to-b from-black/40 to-transparent sticky top-0 z-10 backdrop-blur-md">
                  <div className="flex items-end justify-between mb-6">
                    <div>
                      <h3 className="text-3xl md:text-4xl font-black italic uppercase text-white drop-shadow-md">
                        Day <span className="text-amber-500">{activeDay}</span>
                      </h3>
                      <p className="text-[10px] text-[#8A94A6] uppercase tracking-widest mt-1 font-bold">
                        Week {Math.ceil(activeDay / 7)} Editor
                      </p>
                    </div>
                  </div>

                  <div className="flex p-1.5 bg-black/60 border border-white/10 rounded-2xl shadow-inner max-w-sm">
                    <button
                      onClick={() => setActiveSession("morning")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 ${
                        activeSession === "morning"
                          ? "bg-[#121821] text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] border border-amber-500/30"
                          : "text-white/40 hover:text-white"
                      }`}
                    >
                      <Sun size={14} /> Morning Block
                    </button>
                    <button
                      onClick={() => setActiveSession("evening")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 ${
                        activeSession === "evening"
                          ? "bg-[#121821] text-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.2)] border border-blue-400/30"
                          : "text-white/40 hover:text-white"
                      }`}
                    >
                      <Moon size={14} /> Evening Block
                    </button>
                  </div>
                </div>

                {/* Editor Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                  {/* Rest Day Override */}
                  <div className="flex items-center justify-between p-5 md:p-6 bg-black/40 border border-white/5 rounded-[20px] mb-8 group hover:border-white/10 transition-colors">
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
                        <BatteryCharging
                          size={16}
                          className={
                            activeSessionData.isRest
                              ? "text-emerald-500"
                              : "text-white/40"
                          }
                        />
                        Recovery Status
                      </h4>
                      <p className="text-[10px] text-[#8A94A6] uppercase tracking-widest mt-1 font-bold">
                        Mark this entire session as recovery.
                      </p>
                    </div>
                    <button
                      onClick={toggleRestDay}
                      className={`relative w-14 h-8 rounded-full transition-all duration-300 border ${
                        activeSessionData.isRest
                          ? "bg-emerald-500/20 border-emerald-500"
                          : "bg-white/5 border-white/20"
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-5 h-5 rounded-full transition-all duration-300 ${
                          activeSessionData.isRest
                            ? "translate-x-6 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                            : "bg-white/50"
                        }`}
                      />
                    </button>
                  </div>

                  {!activeSessionData.isRest && (
                    <div className="space-y-6">
                      {/* Blueprint Importer */}
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-[20px] p-5 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-end gap-4">
                          <div className="flex-1">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 mb-2 block">
                              Import Blueprint (Optional)
                            </label>
                            <select
                              onChange={(e) => importBlueprint(e.target.value)}
                              value=""
                              className="w-full bg-[#121821] border border-amber-500/30 rounded-xl px-4 py-4 text-xs font-bold text-white outline-none focus:border-amber-500 cursor-pointer appearance-none shadow-inner"
                            >
                              <option value="" disabled>
                                Select a Blueprint to auto-fill exercises...
                              </option>
                              {templates.map((t) => (
                                <option key={t._id} value={t._id}>
                                  {t.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          {activeSessionData.templateRefName && (
                            <div className="shrink-0">
                              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/80 mb-2">
                                Current Base
                              </p>
                              <div className="px-4 py-3.5 bg-[#121821] border border-emerald-500/30 rounded-xl text-xs font-bold text-white shadow-inner">
                                {activeSessionData.templateRefName}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Inline Steps Timeline */}
                      <div>
                        <div className="flex justify-between items-center mb-6">
                          <h4 className="text-sm font-black uppercase tracking-widest text-white">
                            Programming Blocks
                          </h4>
                          <button
                            onClick={() => setShowStepPicker(true)}
                            className="px-4 py-2 bg-white/5 text-white border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2"
                          >
                            <Plus size={14} /> Add Exercise
                          </button>
                        </div>

                        {activeSessionData.steps.length === 0 ? (
                          <div className="border-2 border-dashed border-white/5 rounded-[2rem] p-12 flex flex-col items-center justify-center text-white/30 text-center">
                            <Dumbbell size={48} className="mb-4 opacity-20" />
                            <p className="text-xs font-black uppercase tracking-widest">
                              Session is Empty
                            </p>
                            <p className="text-[10px] font-bold mt-1">
                              Import a blueprint or add exercises manually.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {activeSessionData.steps.map((stepData, index) => (
                              <div
                                key={index}
                                className="bg-black/40 border border-white/10 rounded-2xl p-5 relative group shadow-lg"
                              >
                                <div className="flex justify-between items-start mb-5">
                                  <div>
                                    <h4 className="text-sm font-black text-white uppercase tracking-wider pr-8">
                                      {index + 1}. {stepData.step.title}
                                    </h4>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#8A94A6] mt-1">
                                      {stepData.step.type}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeStep(index)}
                                    className="text-white/20 hover:text-red-500 transition-colors bg-white/5 p-2 rounded-lg"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>

                                {/* Editor Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                  {/* Sets */}
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase text-[#8A94A6]">
                                      Sets
                                    </label>
                                    <input
                                      type="text"
                                      value={stepData.sets}
                                      onChange={(e) =>
                                        updateStepField(
                                          index,
                                          "sets",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full bg-[#121821] border border-white/5 rounded-lg px-3 py-2.5 text-xs font-bold text-white outline-none focus:border-amber-500/50 shadow-inner"
                                    />
                                  </div>
                                  {/* Reps */}
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase text-[#8A94A6]">
                                      Reps
                                    </label>
                                    <input
                                      type="text"
                                      value={stepData.reps}
                                      onChange={(e) =>
                                        updateStepField(
                                          index,
                                          "reps",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full bg-[#121821] border border-white/5 rounded-lg px-3 py-2.5 text-xs font-bold text-white outline-none focus:border-amber-500/50 shadow-inner"
                                    />
                                  </div>
                                  {/* Intensity Type */}
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase text-[#8A94A6]">
                                      Intensity
                                    </label>
                                    <select
                                      value={stepData.intensityType}
                                      onChange={(e) =>
                                        updateStepField(
                                          index,
                                          "intensityType",
                                          e.target.value,
                                        )
                                      }
                                      className="w-full appearance-none bg-[#121821] border border-white/5 rounded-lg px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-amber-500/50 shadow-inner cursor-pointer"
                                    >
                                      <option value="None">None</option>
                                      <option value="Effort">Effort (%)</option>
                                      <option value="Load">Load (KG)</option>
                                      <option value="Custom">Custom</option>
                                    </select>
                                  </div>
                                  {/* Intensity Value */}
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase text-[#8A94A6]">
                                      Target Value
                                    </label>
                                    <input
                                      type="text"
                                      value={stepData.intensityValue}
                                      onChange={(e) =>
                                        updateStepField(
                                          index,
                                          "intensityValue",
                                          e.target.value,
                                        )
                                      }
                                      disabled={
                                        stepData.intensityType === "None"
                                      }
                                      placeholder={
                                        stepData.intensityType === "None"
                                          ? "-"
                                          : "e.g. 80%"
                                      }
                                      className="w-full bg-[#121821] border border-white/5 rounded-lg px-3 py-2.5 text-xs font-bold text-white outline-none focus:border-amber-500/50 disabled:opacity-30 shadow-inner"
                                    />
                                  </div>
                                  {/* Recovery */}
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase text-blue-400 flex items-center gap-1">
                                      <Timer size={10} /> Recovery
                                    </label>
                                    <input
                                      type="text"
                                      value={stepData.recovery}
                                      onChange={(e) =>
                                        updateStepField(
                                          index,
                                          "recovery",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="e.g. 60 sec"
                                      className="w-full bg-[#121821] border border-white/5 rounded-lg px-3 py-2.5 text-xs font-bold text-white outline-none focus:border-blue-400/50 shadow-inner"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Mobile Save Button */}
            <div className="md:hidden p-4 border-t border-white/5 bg-[#121821]">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-4 rounded-xl bg-amber-500 text-black font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(245,158,11,0.2)]"
              >
                {isSaving ? "Synchronizing..." : "Deploy Course Plan"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showStepPicker && (
        <StepPickerModal
          onClose={() => setShowStepPicker(false)}
          onSelect={addStepFromPicker}
        />
      )}
    </>
  );
}
