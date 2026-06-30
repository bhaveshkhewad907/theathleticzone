import { useState } from "react";
import { X, Search, Save, Trash2, Dumbbell, Timer } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";
import StepPickerModal from "./StepPickerModal"; // Adjust path if needed

interface CreateTemplateModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface TemplateStepInput {
  stepId: string;
  stepTitle: string;
  stepType: string;
  sets: string;
  reps: string;
  intensityType: "Effort" | "Load" | "Custom" | "None";
  intensityValue: string;
  recovery: string;
}

export default function CreateTemplateModal({
  onClose,
  onSuccess,
}: CreateTemplateModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<TemplateStepInput[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showStepPicker, setShowStepPicker] = useState(false);

  const addStepFromPicker = (stepData: {
    _id: string;
    title: string;
    type: string;
  }) => {
    setSteps([
      ...steps,
      {
        stepId: stepData._id,
        stepTitle: stepData.title,
        stepType: stepData.type,
        sets: "-",
        reps: "-",
        intensityType: "None",
        intensityValue: "-",
        recovery: "0 sec",
      },
    ]);
    setShowStepPicker(false);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStepFields = (
    index: number,
    field: keyof TemplateStepInput,
    value: string,
  ) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return toast.error("Blueprint Name is required.");
    if (steps.length === 0) return toast.error("Please add at least one step.");

    setIsSaving(true);
    try {
      const payload = {
        name,
        description,
        steps: steps.map((s) => ({
          step: s.stepId,
          sets: s.sets,
          reps: s.reps,
          intensityType: s.intensityType,
          intensityValue: s.intensityValue,
          recovery: s.recovery,
        })),
      };

      await api.post("/chapters/templates", payload);
      toast.success("Blueprint Saved Successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save Blueprint.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="bg-[#0F1724] border border-white/10 rounded-[24px] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#121821] sticky top-0 z-10">
            <div>
              <h2 className="text-xl md:text-2xl font-black italic uppercase text-white">
                Create Protocol Blueprint
              </h2>
              <p className="text-[10px] text-[#8A94A6] uppercase tracking-widest mt-1">
                Configure Exercises, Intensity & Recovery
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <form
              id="template-form"
              onSubmit={handleSave}
              className="space-y-8"
            >
              {/* Core Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6]">
                    Blueprint Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Strength Phase 1 - Lower Body"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6]">
                    Internal Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Focus on explosive concentric movements"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>
              </div>

              <div className="border-t border-white/5 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6]">
                    Programming Blocks
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowStepPicker(true)}
                    className="px-4 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-black transition-all flex items-center gap-2"
                  >
                    <Search size={14} /> Browse Vault
                  </button>
                </div>

                <div className="space-y-4">
                  {steps.length === 0 ? (
                    <div className="border-2 border-dashed border-white/5 rounded-2xl p-10 flex flex-col items-center justify-center text-white/30 text-center">
                      <Dumbbell size={48} className="mb-4 opacity-20" />
                      <p className="text-xs font-black uppercase tracking-widest">
                        No Blocks Added
                      </p>
                      <p className="text-[10px] font-bold mt-1">
                        Open the vault to add exercises to this blueprint.
                      </p>
                    </div>
                  ) : (
                    steps.map((step, index) => (
                      <div
                        key={index}
                        className="bg-black/40 border border-white/10 rounded-2xl p-4 md:p-5 relative group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-sm font-black text-white uppercase tracking-wider pr-8">
                            {index + 1}. {step.stepTitle}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeStep(index)}
                            className="absolute top-4 right-4 text-white/20 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* 🚀 PROGRAMMING VARIABLES GRID */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {/* Sets */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-[#8A94A6]">
                              Sets
                            </label>
                            <input
                              type="text"
                              value={step.sets}
                              onChange={(e) =>
                                updateStepFields(index, "sets", e.target.value)
                              }
                              className="w-full bg-[#121821] border border-white/5 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50"
                            />
                          </div>
                          {/* Reps */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-[#8A94A6]">
                              Reps
                            </label>
                            <input
                              type="text"
                              value={step.reps}
                              onChange={(e) =>
                                updateStepFields(index, "reps", e.target.value)
                              }
                              className="w-full bg-[#121821] border border-white/5 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50"
                            />
                          </div>

                          {/* Intensity Type */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-[#8A94A6]">
                              Intensity
                            </label>
                            <select
                              value={step.intensityType}
                              onChange={(e) =>
                                updateStepFields(
                                  index,
                                  "intensityType",
                                  e.target.value,
                                )
                              }
                              className="w-full appearance-none bg-[#121821] border border-white/5 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50"
                            >
                              <option value="None">None</option>
                              <option value="Effort">
                                Effort (RPE/%/Scale)
                              </option>
                              <option value="Load">Load (Weight)</option>
                              <option value="Custom">Custom</option>
                            </select>
                          </div>

                          {/* Intensity Value */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-[#8A94A6]">
                              Target Value
                            </label>
                            <input
                              type="text"
                              value={step.intensityValue}
                              onChange={(e) =>
                                updateStepFields(
                                  index,
                                  "intensityValue",
                                  e.target.value,
                                )
                              }
                              disabled={step.intensityType === "None"}
                              placeholder={
                                step.intensityType === "None"
                                  ? "-"
                                  : "e.g. RPE 8"
                              }
                              className="w-full bg-[#121821] border border-white/5 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-amber-500/50 disabled:opacity-50"
                            />
                          </div>

                          {/* Recovery Time */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase text-blue-400 flex items-center gap-1">
                              <Timer size={10} /> Recovery
                            </label>
                            <input
                              type="text"
                              value={step.recovery}
                              onChange={(e) =>
                                updateStepFields(
                                  index,
                                  "recovery",
                                  e.target.value,
                                )
                              }
                              placeholder="e.g. 60 sec"
                              className="w-full bg-[#121821] border border-white/5 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-400/50"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </form>
          </div>

          <div className="p-6 border-t border-white/5 bg-[#121821] flex justify-end gap-3 sticky bottom-0 z-10">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-3 rounded-xl border border-white/10 text-white/50 font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              form="template-form"
              type="submit"
              disabled={isSaving || !name || steps.length === 0}
              className="px-8 py-3 rounded-xl bg-amber-500 text-black font-black text-[10px] uppercase tracking-[0.2em] hover:bg-amber-400 transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_10px_30px_rgba(245,158,11,0.2)]"
            >
              {isSaving ? "Saving..." : "Lock Blueprint"}
              {!isSaving && <Save size={14} />}
            </button>
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
