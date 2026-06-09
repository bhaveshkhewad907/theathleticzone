import { PlayCircle } from "lucide-react";

interface Props {
  data: { kneeToWallCm: string; deepSquatHold: string };
  updateData: (
    category: "mobility" | "power" | "sprinting" | "strength",
    field: string,
    value: string,
  ) => void;
}

export default function MobilityStep({ data, updateData }: Props) {
  return (
    <div className="animate-fade-up">
      <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">
        Phase 1: <span className="text-amber-500">Mobility</span>
      </h2>
      <p className="text-white/60 text-sm mb-8">
        We need to see how your joints move before we add speed. Be honest—this
        helps us prevent injuries.
      </p>

      {/* QUESTION 1 */}
      <div className="mb-10">
        <div className="flex items-start justify-between mb-4">
          <label className="text-sm font-bold uppercase tracking-widest text-white/90 block">
            1. Knee-to-Wall Test
          </label>
          {/* THE INSTRUCTIONAL VIDEO TRIGGER */}
          <button className="flex items-center gap-1.5 text-amber-500 text-[10px] font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition-colors">
            <PlayCircle size={14} /> Watch How
          </button>
        </div>

        <p className="text-xs text-white/40 mb-3">
          Measure the maximum distance (in centimeters) your big toe can be from
          the wall while your knee touches the wall and your heel stays flat.
        </p>

        <div className="relative">
          <input
            type="number"
            value={data.kneeToWallCm}
            onChange={(e) =>
              updateData("mobility", "kneeToWallCm", e.target.value)
            }
            placeholder="e.g. 10"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white text-lg font-bold placeholder:text-white/20 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">
            cm
          </span>
        </div>
      </div>

      {/* QUESTION 2 */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <label className="text-sm font-bold uppercase tracking-widest text-white/90 block">
            2. Deep Squat Hold
          </label>
          <button className="flex items-center gap-1.5 text-amber-500 text-[10px] font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition-colors">
            <PlayCircle size={14} /> Watch How
          </button>
        </div>

        <p className="text-xs text-white/40 mb-3">
          Drop into the deepest squat you can. Keep your heels flat. How does it
          feel?
        </p>

        {/* GIANT TAP-FRIENDLY BUTTONS INSTEAD OF DROPDOWNS */}
        <div className="flex flex-col gap-3">
          {["Good", "Acceptable", "Poor"].map((option) => (
            <button
              key={option}
              onClick={() => updateData("mobility", "deepSquatHold", option)}
              className={`px-4 py-4 rounded-xl border text-left font-bold transition-all ${
                data.deepSquatHold === option
                  ? "bg-amber-500/20 border-amber-500 text-amber-500"
                  : "bg-black/40 border-white/10 text-white/60 hover:bg-white/5"
              }`}
            >
              {option === "Good" && "Good (Comfortable, heels flat, chest up)"}
              {option === "Acceptable" &&
                "Acceptable (A bit tight, but I can do it)"}
              {option === "Poor" && "Poor (Heels pop up, or I fall backwards)"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
