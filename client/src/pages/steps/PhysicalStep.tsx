import { memo } from "react";

interface PhysicalStepProps {
  data: {
    age: string;
    heightCm: string;
    bodyweightKg: string;
    trainingAgeYears: string;
    trainingAgeMonths?: string; // Added to interface
  };
  updateData: (category: "physical", field: string, value: string) => void;
}

function PhysicalStep({ data, updateData }: PhysicalStepProps) {
  return (
    <div className="animate-fade-up space-y-6 relative">
      <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-6 drop-shadow-lg">
        Athlete Profile
      </h2>

      {/* Basic Metrics */}
      <div className="space-y-5">
        <div>
          <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/70 mb-2">
            Age (Years)
          </label>
          <input
            type="number"
            min={0}
            placeholder="e.g. 21"
            value={data.age}
            onChange={(e) => {
              updateData("physical", "age", e.target.value);
            }}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white text-base md:text-lg font-bold placeholder:text-white/20 focus:outline-none focus:border-amber-500 transition-all shadow-inner"
          />
        </div>

        <div>
          <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/70 mb-2">
            Height (cm)
          </label>
          <input
            type="number"
            min={0}
            placeholder="e.g. 180"
            value={data.heightCm}
            onChange={(e) => {
              updateData("physical", "heightCm", e.target.value);
            }}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white text-base md:text-lg font-bold placeholder:text-white/20 focus:outline-none focus:border-amber-500 transition-all shadow-inner"
          />
        </div>

        <div>
          <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/70 mb-2">
            Bodyweight (kg)
          </label>
          <input
            type="number"
            min={0}
            placeholder="e.g. 75"
            value={data.bodyweightKg}
            onChange={(e) =>
              updateData("physical", "bodyweightKg", e.target.value)
            }
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white text-base md:text-lg font-bold placeholder:text-white/20 focus:outline-none focus:border-amber-500 transition-all shadow-inner"
          />
        </div>
      </div>

      {/* 🚀 NEW: Split Training Age Inputs */}
      <div className="pt-2">
        <label className="block text-[10px] md:text-xs font-bold uppercase tracking-widest text-amber-500 mb-3 drop-shadow-md">
          Training Experience
        </label>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="number"
              min="0"
              placeholder="Years"
              value={data.trainingAgeYears}
              onChange={(e) =>
                updateData("physical", "trainingAgeYears", e.target.value)
              }
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white text-base md:text-lg font-bold placeholder:text-white/20 focus:outline-none focus:border-amber-500 transition-all shadow-inner"
            />
            <span className="block text-center mt-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
              Years
            </span>
          </div>
          <div className="flex-1">
            <input
              type="number"
              min="0"
              max="11"
              placeholder="Months"
              value={data.trainingAgeMonths || ""}
              onChange={(e) =>
                updateData("physical", "trainingAgeMonths", e.target.value)
              }
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white text-base md:text-lg font-bold placeholder:text-white/20 focus:outline-none focus:border-amber-500 transition-all shadow-inner"
            />
            <span className="block text-center mt-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
              Months
            </span>
          </div>
        </div>
      </div>

      <p className="text-[9px] md:text-[10px] text-white/40 italic font-bold tracking-widest mt-6 drop-shadow-md">
        *Data is used exclusively by the recommendation engine to determine your
        course tier.
      </p>
    </div>
  );
}
export default memo(PhysicalStep);
