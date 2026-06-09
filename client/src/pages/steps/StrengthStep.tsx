import { PlayCircle } from "lucide-react";

interface Props {
  data: { backSquatMaxKg: string };
  updateData: (
    category: "mobility" | "power" | "sprinting" | "strength",
    field: string,
    value: string,
  ) => void;
}

export default function StrengthStep({ data, updateData }: Props) {
  return (
    <div className="animate-fade-up">
      <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">
        Phase 4: <span className="text-amber-500">Absolute Strength</span>
      </h2>
      <p className="text-white/60 text-sm mb-8">
        Force production starts here. We use this to calculate your
        strength-to-weight ratio.
      </p>

      <div>
        <div className="flex items-start justify-between mb-4">
          <label className="text-sm font-bold uppercase tracking-widest text-white/90 block">
            1. Back Squat (1 Rep Max)
          </label>
          <button className="flex items-center gap-1.5 text-amber-500 text-[10px] font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition-colors">
            <PlayCircle size={14} /> Watch How
          </button>
        </div>

        <p className="text-xs text-white/40 mb-3">
          What is the heaviest weight you can safely squat for one perfect, deep
          repetition? If you don't test 1RMs, give us your most accurate
          estimate.
        </p>

        <div className="relative">
          <input
            type="number"
            value={data.backSquatMaxKg}
            onChange={(e) =>
              updateData("strength", "backSquatMaxKg", e.target.value)
            }
            placeholder="e.g. 120"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white text-lg font-bold placeholder:text-white/20 focus:border-amber-500 focus:outline-none transition-all"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">
            kg
          </span>
        </div>
      </div>
    </div>
  );
}
