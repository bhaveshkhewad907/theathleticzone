import { useState, useEffect } from "react";
import {
  X,
  Plus,
  GripVertical,
  Trash2,
  Save,
  Video,
  Edit2,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import EditStepModal from "./EditStepModal";

interface Step {
  _id: string;
  title: string;
  type: string;
}

// 🚀 NEW: We now store the Step PLUS its unique sets and reps
interface SelectedStep {
  step: Step;
  sets: string;
  reps: string;
}

interface CreateTemplateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTemplateModal({
  onClose,
  onSuccess,
}: CreateTemplateModalProps) {
  const [availableSteps, setAvailableSteps] = useState<Step[]>([]);

  // 🚀 UPDATED STATE to use the new interface
  const [selectedSteps, setSelectedSteps] = useState<SelectedStep[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingStep, setEditingStep] = useState<Step | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get("/chapters/steps")
      .then((res) => setAvailableSteps(res.data.data))
      .catch(() => toast.error("Failed to load Content Vault"));
  }, []);

  const addStep = (step: Step) => {
    // 🚀 NEW: Defaults to 3 sets of 10 reps when added
    setSelectedSteps([...selectedSteps, { step, sets: "3", reps: "10" }]);
  };

  const removeStep = (index: number) => {
    const newSteps = [...selectedSteps];
    newSteps.splice(index, 1);
    setSelectedSteps(newSteps);
  };

  const moveStep = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === selectedSteps.length - 1) return;

    const newSteps = [...selectedSteps];
    const swapIndex = direction === "up" ? index - 1 : index + 1;

    [newSteps[index], newSteps[swapIndex]] = [
      newSteps[swapIndex],
      newSteps[index],
    ];
    setSelectedSteps(newSteps);
  };

  // 🚀 NEW: Function to update sets and reps
  const updateConfig = (
    index: number,
    field: "sets" | "reps",
    value: string,
  ) => {
    const newSteps = [...selectedSteps];
    newSteps[index][field] = value;
    setSelectedSteps(newSteps);
  };

  const handleSave = async () => {
    if (!name.trim() || selectedSteps.length === 0) {
      return toast.error("Template requires a name and at least one step.");
    }

    setLoading(true);
    try {
      await api.post("/chapters/templates", {
        name,
        description,
        // 🚀 NEW: Sends the step ID along with the custom sets & reps to the backend
        steps: selectedSteps.map((s) => ({
          step: s.step._id,
          sets: s.sets,
          reps: s.reps,
        })),
      });
      toast.success("Protocol Template established!");
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to save template.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-[50] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm rounded-3xl">
      <div className="bg-[#0F1724] border border-white/10 rounded-[24px] w-[85%] h-[85%] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5 shrink-0">
          <div>
            <h2 className="text-2xl font-black italic uppercase text-white">
              Protocol Builder
            </h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mt-1">
              Construct Reusable Day Templates with Sets & Reps
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors bg-white/5 p-2 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Split Screen Workspace */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          {/* LEFT: Content Vault */}
          <div className="p-6 border-r border-white/5 overflow-y-auto bg-black/20 custom-scrollbar">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#8A94A6] mb-4">
              Content Vault ({availableSteps.length} Assets)
            </h3>
            <div className="space-y-3">
              {availableSteps.map((step) => (
                <div
                  key={step._id}
                  className="group p-4 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between hover:border-amber-500/30 transition-all"
                >
                  <div className="flex items-center gap-3 truncate pr-4">
                    <Video size={16} className="text-[#8A94A6] shrink-0" />
                    <div className="truncate">
                      <p className="text-sm font-bold text-white uppercase tracking-wider truncate">
                        {step.title}
                      </p>
                      <p className="text-[9px] text-amber-500 uppercase tracking-widest">
                        {step.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setEditingStep(step)}
                      className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-amber-500 hover:text-black transition-all"
                      title="Replace Video"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => addStep(step)}
                      className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:bg-amber-500 hover:text-black transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Template Canvas */}
          <div className="p-6 overflow-y-auto flex flex-col custom-scrollbar">
            <div className="space-y-4 mb-8 shrink-0">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Template Name (e.g., Hypertrophy Push A)"
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-lg font-black italic uppercase tracking-wider outline-none focus:border-amber-500/50"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional protocol instructions..."
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-[#E5E7EB] text-sm outline-none focus:border-amber-500/50 h-20 resize-none"
              />
            </div>

            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#8A94A6] mb-4">
              Sequence Matrix ({selectedSteps.length} Steps)
            </h3>

            <div className="flex-1 space-y-3">
              {selectedSteps.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#8A94A6] opacity-50 border-2 border-dashed border-white/5 rounded-xl">
                  <Plus size={32} className="mb-2" />
                  <p className="text-xs uppercase tracking-widest font-black">
                    Add steps from the vault
                  </p>
                </div>
              ) : (
                selectedSteps.map((item, idx) => (
                  <div
                    key={`${item.step._id}-${idx}`}
                    className="p-3 bg-[#121821] border border-amber-500/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between shadow-lg gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex flex-col gap-1 text-white/20 shrink-0">
                        <button
                          onClick={() => moveStep(idx, "up")}
                          className="hover:text-amber-500 active:scale-95"
                        >
                          <GripVertical size={14} />
                        </button>
                        <button
                          onClick={() => moveStep(idx, "down")}
                          className="hover:text-amber-500 active:scale-95"
                        >
                          <GripVertical size={14} />
                        </button>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-[10px] font-black text-amber-500 shrink-0">
                        {idx + 1}
                      </div>
                      <div className="truncate pr-2">
                        <p className="text-sm font-bold text-white uppercase tracking-wider truncate">
                          {item.step.title}
                        </p>
                        <p className="text-[9px] text-amber-500 uppercase tracking-widest">
                          {item.step.type}
                        </p>
                      </div>
                    </div>

                    {/* 🚀 NEW: Sets & Reps Inputs inline */}
                    <div className="flex items-center gap-2 pl-12 sm:pl-0 shrink-0">
                      <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-lg p-1.5">
                        <input
                          type="text"
                          value={item.sets}
                          onChange={(e) =>
                            updateConfig(idx, "sets", e.target.value)
                          }
                          className="w-12 bg-transparent text-white text-center text-xs font-bold outline-none placeholder:text-white/20"
                          placeholder="Sets"
                        />
                        <span className="text-amber-500 text-[10px] font-black">
                          x
                        </span>
                        <input
                          type="text"
                          value={item.reps}
                          onChange={(e) =>
                            updateConfig(idx, "reps", e.target.value)
                          }
                          className="w-12 bg-transparent text-white text-center text-xs font-bold outline-none placeholder:text-white/20"
                          placeholder="Reps"
                        />
                      </div>
                      <button
                        onClick={() => removeStep(idx)}
                        className="p-2 text-white/20 hover:text-red-500 bg-white/5 hover:bg-red-500/10 rounded-lg transition-colors ml-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={loading || selectedSteps.length === 0 || !name.trim()}
              className="mt-6 w-full py-4 rounded-xl bg-amber-500 text-black font-black text-[10px] uppercase tracking-[0.2em] hover:bg-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shrink-0"
            >
              {loading ? "Locking Protocol..." : "Save Protocol Template"}
              <Save size={16} />
            </button>
          </div>
        </div>
      </div>
      {editingStep && (
        <EditStepModal
          step={editingStep}
          onClose={() => setEditingStep(null)}
          onSuccess={() => {
            setEditingStep(null);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
