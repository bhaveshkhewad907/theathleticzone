import { useState, useEffect } from "react";
import { X, Calendar, Plus, Trash2, Save } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

// 🚀 THE FIX: Defined a basic Step interface so it's not 'any'
interface Step {
  _id: string;
}

interface DayTemplate {
  _id: string;
  name: string;
  steps: Step[]; // 🚀 THE FIX: Replaced any[] with Step[]
}

interface CourseDay {
  dayNumber: number;
  templateId: string;
}

// 🚀 THE FIX: Defined the shape of the data coming back from the API
interface PopulatedCourseDay {
  dayNumber: number;
  templateId: {
    _id: string;
  };
}

interface CourseArchitectModalProps {
  courseId: string; // The ID of the standard Course this plan belongs to
  courseName: string; // Just for display purposes
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

  // Load available templates and the existing plan (if any)
  useEffect(() => {
    Promise.all([
      api.get("/chapters/templates"),
      api
        .get(`/chapters/plan/${courseId}`)
        .catch(() => ({ data: { data: null } })), // Catch 404 if no plan exists yet
    ])
      .then(([templatesRes, planRes]) => {
        setAvailableTemplates(templatesRes.data.data);

        const existingPlan = planRes.data.data;
        if (existingPlan && existingPlan.days) {
          // Map populated templates back to just their IDs for the dropdowns
          setDays(
            // 🚀 THE FIX: Replaced (d: any) with (d: PopulatedCourseDay)
            existingPlan.days.map((d: PopulatedCourseDay) => ({
              dayNumber: d.dayNumber,
              templateId: d.templateId._id,
            })),
          );
        } else {
          // Start with 1 empty day by default
          setDays([{ dayNumber: 1, templateId: "" }]);
        }
      })
      .catch(() => toast.error("Failed to load architectural data"));
  }, [courseId]);

  const addDay = () => {
    const nextDayNum =
      days.length > 0 ? Math.max(...days.map((d) => d.dayNumber)) + 1 : 1;
    setDays([...days, { dayNumber: nextDayNum, templateId: "" }]);
  };

  const removeDay = (index: number) => {
    const newDays = [...days];
    newDays.splice(index, 1);

    // Automatically renumber the remaining days
    const renumberedDays = newDays.map((day, i) => ({
      ...day,
      dayNumber: i + 1,
    }));

    setDays(renumberedDays);
  };

  const updateDayTemplate = (index: number, templateId: string) => {
    const newDays = [...days];
    newDays[index].templateId = templateId;
    setDays(newDays);
  };

  const handleSave = async () => {
    // Validation: Ensure all days have a selected template
    if (days.some((d) => !d.templateId)) {
      return toast.error("All days must have an assigned Protocol Template.");
    }

    setLoading(true);
    try {
      await api.post("/chapters/plan", {
        courseId,
        days,
      });
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0F1724] border border-white/10 rounded-[24px] w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
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
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                className="flex items-center gap-4 bg-black/40 border border-white/5 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-4"
              >
                {/* Day Badge */}
                <div className="flex flex-col items-center justify-center w-16 h-16 bg-[#121821] border border-amber-500/20 rounded-lg shrink-0 shadow-inner">
                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">
                    Day
                  </span>
                  <span className="text-xl font-black text-white italic leading-none">
                    {day.dayNumber}
                  </span>
                </div>

                {/* Template Selector */}
                <div className="flex-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#8A94A6] mb-2 block ml-1">
                    Assign Protocol Template
                  </label>
                  <select
                    value={day.templateId}
                    onChange={(e) => updateDayTemplate(index, e.target.value)}
                    className="w-full bg-[#121821] border border-white/10 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
                  >
                    <option value="" disabled>
                      -- Select a Template --
                    </option>
                    {availableTemplates.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.steps.length} Steps)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => removeDay(index)}
                  className="h-12 w-12 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-colors shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}

          {/* Add Day Button */}
          <button
            onClick={addDay}
            className="w-full py-4 rounded-xl border-2 border-dashed border-white/10 text-[#8A94A6] font-black text-[10px] uppercase tracking-[0.2em] hover:border-amber-500/50 hover:text-amber-500 transition-all flex justify-center items-center gap-2 mt-4"
          >
            <Plus size={16} /> Schedule Next Day
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
