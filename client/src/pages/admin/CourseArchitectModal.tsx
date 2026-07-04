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
  ChevronUp,
  ChevronDown,
  PlusCircle,
  Cloud,
  CheckCircle2,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import StepPickerModal from "./StepPickerModal";
import { useAutoSave } from "../../utils/useAutoSave";

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

export interface CourseDay {
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
  const [days, setDays] = useState<CourseDay[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [activeDay, setActiveDay] = useState<number>(1);
  const [activeSession, setActiveSession] = useState<"morning" | "evening">(
    "morning",
  );
  const [showStepPicker, setShowStepPicker] = useState(false);
  const { clearDraft, saveStatus } = useAutoSave(
    `architect_draft_${courseId}`,
    days,
  );

  // ==========================================
  // 🔄 INITIALIZATION
  // ==========================================
  useEffect(() => {
    const initializeArchitect = async () => {
      try {
        const templatesRes = await api.get("/chapters/templates");
        setTemplates(templatesRes.data.data);

        // 🚀 1. THE SAFETY INTERCEPTOR: Check for an unsaved draft first!
        const savedDraft = localStorage.getItem(`architect_draft_${courseId}`);

        // If a draft exists and it isn't an empty array, load it instantly!
        if (savedDraft && JSON.parse(savedDraft).length > 0) {
          const parsedDraft = JSON.parse(savedDraft);
          setDays(parsedDraft);
          setActiveDay(parsedDraft[0].dayNumber);
          toast.success("Recovered unsaved draft!");
          setIsLoading(false);
          return; // STOP HERE! Do not overwrite the draft with older database data.
        }

        // 🚀 2. STANDARD BEHAVIOR: If no draft exists, load from the database
        const planRes = await api.get(`/chapters/plan/${courseId}`);
        const existingPlan = planRes.data.data;

        if (existingPlan && existingPlan.days && existingPlan.days.length > 0) {
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
          setActiveDay(normalizedDays[0].dayNumber);
        } else {
          // 🚀 FIX: Start with a clean slate of just Day 1 instead of 42 empty days
          setDays([
            {
              dayNumber: 1,
              morning: { isRest: false, templateRefName: "", steps: [] },
              evening: { isRest: false, templateRefName: "", steps: [] },
            },
          ]);
          setActiveDay(1);
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
  // 🛠️ DAY & TIMELINE MANAGEMENT
  // ==========================================
  const currentDayIndex = days.findIndex((d) => d.dayNumber === activeDay);
  const activeDayData = days[currentDayIndex];
  const activeSessionData = activeDayData ? activeDayData[activeSession] : null;

  const addNewDay = () => {
    setDays((prev) => {
      const nextDayNum =
        prev.length > 0 ? Math.max(...prev.map((d) => d.dayNumber)) + 1 : 1;
      return [
        ...prev,
        {
          dayNumber: nextDayNum,
          morning: { isRest: false, templateRefName: "", steps: [] },
          evening: { isRest: false, templateRefName: "", steps: [] },
        },
      ];
    });
  };

  const removeActiveDay = () => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete Day ${activeDay}?`,
      )
    )
      return;

    setDays((prev) => {
      const newDays = prev.filter((d) => d.dayNumber !== activeDay);
      if (newDays.length > 0) {
        setActiveDay(newDays[0].dayNumber);
      } else {
        // If they delete the very last day, generate a fresh Day 1
        newDays.push({
          dayNumber: 1,
          morning: { isRest: false, templateRefName: "", steps: [] },
          evening: { isRest: false, templateRefName: "", steps: [] },
        });
        setActiveDay(1);
      }
      return newDays;
    });
  };

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

  const toggleRestDay = () =>
    updateActiveSession((s) => {
      s.isRest = !s.isRest;
      return s;
    });

  const importBlueprint = (templateId: string) => {
    if (!templateId) return;
    const template = templates.find((t) => t._id === templateId);
    if (!template) return;
    if (activeSessionData && activeSessionData.steps.length > 0) {
      if (
        !window.confirm(
          "Importing a Blueprint will overwrite current exercises. Continue?",
        )
      )
        return;
    }
    updateActiveSession((session) => {
      session.templateRefName = template.name;
      session.steps = template.steps.map((s) => ({ ...s }));
      return session;
    });
  };

  // 🚀 REORDERING LOGIC
  const moveStep = (index: number, direction: "up" | "down") => {
    updateActiveSession((session) => {
      const newSteps = [...session.steps];
      if (direction === "up" && index > 0) {
        [newSteps[index - 1], newSteps[index]] = [
          newSteps[index],
          newSteps[index - 1],
        ];
      } else if (direction === "down" && index < newSteps.length - 1) {
        [newSteps[index + 1], newSteps[index]] = [
          newSteps[index],
          newSteps[index + 1],
        ];
      }
      session.steps = newSteps;
      return session;
    });
  };

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

  const removeStep = (stepIndex: number) =>
    updateActiveSession((s) => {
      s.steps.splice(stepIndex, 1);
      return s;
    });
  const updateStepField = (
    stepIndex: number,
    field: keyof InlineStep,
    value: string,
  ) =>
    updateActiveSession((s) => {
      s.steps[stepIndex] = { ...s.steps[stepIndex], [field]: value };
      return s;
    });

  // ==========================================
  // 💾 SAVING
  // ==========================================
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const mappedDays = days.map((d) => ({
        dayNumber: d.dayNumber,
        morning: {
          isRest: d.morning.isRest,
          templateRefName: d.morning.templateRefName,
          steps: d.morning.steps.map((s) => ({
            step: s.step._id,
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
      await api.post("/chapters/plan", { courseId, days: mappedDays });
      clearDraft();
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

  if (isLoading)
    return (
      <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <>
      <div className="fixed inset-0 z-[50] flex items-center justify-center p-2 md:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in">
        <div className="bg-[#0F1724] border border-white/10 rounded-[2rem] w-full max-w-[1400px] h-[95vh] overflow-hidden shadow-2xl flex flex-col md:flex-row relative">
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
              {/* 🚀 ADD THIS NEW BLOCK: The Live Sync Indicator */}
              <div className="mt-4 flex items-center gap-2 h-6">
                {saveStatus === "saving" && (
                  <div className="flex items-center gap-1.5 text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 animate-pulse">
                    <Cloud size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      Saving Draft...
                    </span>
                  </div>
                )}
                {saveStatus === "saved" && (
                  <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 animate-in fade-in zoom-in duration-300">
                    <CheckCircle2 size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">
                      Saved to Device
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 md:p-4 space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-x-hidden gap-2 md:gap-0">
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
                    className={`w-[140px] md:w-full shrink-0 flex flex-col text-left p-3 md:p-4 rounded-2xl transition-all duration-300 border ${isActive ? "bg-amber-500/10 border-amber-500/50 shadow-inner" : "bg-[#121821] border-white/5 hover:border-white/20"}`}
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

              {/* 🚀 DYNAMIC TIMELINE ADD BUTTON */}
              <button
                onClick={addNewDay}
                className="w-[140px] md:w-full shrink-0 flex flex-col items-center justify-center p-3 md:p-4 rounded-2xl transition-all duration-300 border-2 border-dashed border-white/10 bg-transparent text-white/40 hover:text-amber-500 hover:border-amber-500/50 hover:bg-amber-500/5"
              >
                <PlusCircle size={20} className="mb-1" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Add Day
                </span>
              </button>
            </div>

            <div className="p-4 border-t border-white/5 bg-[#121821] hidden md:block">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-4 rounded-xl bg-amber-500 text-black font-black text-[10px] uppercase tracking-[0.2em] hover:bg-amber-400 transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-[0_10px_30px_rgba(245,158,11,0.2)]"
              >
                {isSaving ? "Synchronizing..." : "Deploy Course Plan"}{" "}
                {!isSaving && <Save size={16} />}
              </button>
            </div>
          </div>

          {/* RIGHT PANEL: DYNAMIC DAY EDITOR */}
          <div className="flex-1 flex flex-col h-full bg-[#121821] relative overflow-hidden">
            <button
              onClick={onClose}
              className="hidden md:flex absolute top-6 right-6 z-20 text-white/50 hover:text-white bg-black/40 p-2 rounded-full backdrop-blur-md border border-white/10 transition-colors"
            >
              <X size={20} />
            </button>

            {activeSessionData && (
              <>
                <div className="p-6 md:p-8 border-b border-white/5 bg-gradient-to-b from-black/40 to-transparent sticky top-0 z-10 backdrop-blur-md">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-3xl md:text-4xl font-black italic uppercase text-white drop-shadow-md flex items-center gap-4">
                        <span>
                          Day{" "}
                          <span className="text-amber-500">{activeDay}</span>
                        </span>
                      </h3>
                      <p className="text-[10px] text-[#8A94A6] uppercase tracking-widest mt-1 font-bold">
                        Week {Math.ceil(activeDay / 7)} Editor
                      </p>
                    </div>
                    <button
                      onClick={removeActiveDay}
                      className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      <Trash2 size={14} />{" "}
                      <span className="hidden sm:inline">Delete Day</span>
                    </button>
                  </div>

                  <div className="flex p-1.5 bg-black/60 border border-white/10 rounded-2xl shadow-inner max-w-sm">
                    <button
                      onClick={() => setActiveSession("morning")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 ${activeSession === "morning" ? "bg-[#121821] text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] border border-amber-500/30" : "text-white/40 hover:text-white"}`}
                    >
                      <Sun size={14} /> Morning Block
                    </button>
                    <button
                      onClick={() => setActiveSession("evening")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 ${activeSession === "evening" ? "bg-[#121821] text-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.2)] border border-blue-400/30" : "text-white/40 hover:text-white"}`}
                    >
                      <Moon size={14} /> Evening Block
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
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
                        />{" "}
                        Recovery Status
                      </h4>
                      <p className="text-[10px] text-[#8A94A6] uppercase tracking-widest mt-1 font-bold">
                        Mark this entire session as recovery.
                      </p>
                    </div>
                    <button
                      onClick={toggleRestDay}
                      className={`relative w-14 h-8 rounded-full transition-all duration-300 border ${activeSessionData.isRest ? "bg-emerald-500/20 border-emerald-500" : "bg-white/5 border-white/20"}`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-5 h-5 rounded-full transition-all duration-300 ${activeSessionData.isRest ? "translate-x-6 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" : "bg-white/50"}`}
                      />
                    </button>
                  </div>

                  {!activeSessionData.isRest && (
                    <div className="space-y-6">
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

                                  {/* 🚀 EXERCISE REORDERING CONTROLS */}
                                  <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-xl p-1">
                                    <button
                                      type="button"
                                      onClick={() => moveStep(index, "up")}
                                      disabled={index === 0}
                                      className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-30 transition-colors"
                                    >
                                      <ChevronUp size={16} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => moveStep(index, "down")}
                                      disabled={
                                        index ===
                                        activeSessionData.steps.length - 1
                                      }
                                      className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-30 transition-colors"
                                    >
                                      <ChevronDown size={16} />
                                    </button>
                                    <div className="w-px h-4 bg-white/10 mx-1" />
                                    <button
                                      type="button"
                                      onClick={() => removeStep(index)}
                                      className="p-2 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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
                                          e.target
                                            .value as InlineStep["intensityType"],
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
