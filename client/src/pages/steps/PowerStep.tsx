import { PlayCircle } from "lucide-react";

interface Props {
  data: { broadJumpMeters: string; verticalJumpCm: string };
  updateData: (
    category: "mobility" | "power" | "sprinting" | "strength",
    field: string,
    value: string,
  ) => void;
}

export default function PowerStep({ data, updateData }: Props) {
  return (
    <div className="animate-fade-up">
      <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">
        Phase 2: <span className="text-amber-500">Power</span>
      </h2>
      <p className="text-white/60 text-sm mb-8">
        We need to measure your explosive capability. This tells us how well you
        can generate force from a dead stop.
      </p>

      <div className="mb-10">
        <div className="flex items-start justify-between mb-4">
          <label className="text-sm font-bold uppercase tracking-widest text-white/90 block">
            1. Standing Broad Jump
          </label>
          <button className="flex items-center gap-1.5 text-amber-500 text-[10px] font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition-colors">
            <PlayCircle size={14} /> Watch How
          </button>
        </div>

        <p className="text-xs text-white/40 mb-3">
          Jump as far forward as possible from a standstill. Measure from the
          starting line to the back of your closest heel.
        </p>

        <div className="relative">
          <input
            type="number"
            step="0.01"
            value={data.broadJumpMeters}
            onChange={(e) =>
              updateData("power", "broadJumpMeters", e.target.value)
            }
            placeholder="e.g. 2.15"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white text-lg font-bold placeholder:text-white/20 focus:border-amber-500 focus:outline-none transition-all"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">
            meters
          </span>
        </div>
      </div>

      <div>
        <div className="flex items-start justify-between mb-4">
          <label className="text-sm font-bold uppercase tracking-widest text-white/90 block">
            2. Vertical Jump
          </label>
          <button className="flex items-center gap-1.5 text-amber-500 text-[10px] font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition-colors">
            <PlayCircle size={14} /> Watch How
          </button>
        </div>

        <p className="text-xs text-white/40 mb-3">
          Use the wall-touch method. Measure your highest reach standing flat,
          then your highest reach at the peak of your jump. Enter the
          difference.
        </p>

        <div className="relative">
          <input
            type="number"
            value={data.verticalJumpCm}
            onChange={(e) =>
              updateData("power", "verticalJumpCm", e.target.value)
            }
            placeholder="e.g. 50"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white text-lg font-bold placeholder:text-white/20 focus:border-amber-500 focus:outline-none transition-all"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">
            cm
          </span>
        </div>
      </div>
    </div>
  );
}
