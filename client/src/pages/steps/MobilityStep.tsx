import { PlayCircle, X } from "lucide-react";
import { useState } from "react";

interface Props {
  data: { kneeToWallCm: string; deepSquatHold: string };
  updateData: (
    category: "mobility" | "power" | "sprinting" | "strength",
    field: string,
    value: string,
  ) => void;
}

export default function MobilityStep({ data, updateData }: Props) {
  const [activeDemoVideo, setActiveDemoVideo] = useState<string | null>(null);

  return (
    <div
      className="animate-fade-up relative bg-cover bg-center bg-no-repeat p-6 sm:p-10 rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(9,9,11,0.85), rgba(9,9,11,0.98)), url('https://media.theathleticzone.in/auth-bg-images/mobility.jpg')`,
      }}
    >
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
          <button
            onClick={() =>
              setActiveDemoVideo(
                "https://media.theathleticzone.in/assessment-demo-videos/knee%20to%20wall.MOV",
              )
            }
            className="flex items-center gap-1.5 text-amber-500 text-[10px] font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition-colors"
            aria-label="Watch video demonstration for Knee to Wall Test"
          >
            <PlayCircle size={14} /> Demo video
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
          <button
            onClick={() =>
              setActiveDemoVideo(
                "https://media.theathleticzone.in/assessment-demo-videos/deep%20squat%20hold.MOV",
              )
            }
            className="flex items-center gap-1.5 text-amber-500 text-[10px] font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition-colors"
            aria-label="Watch video demonstration for Deep Squat Hold"
          >
            <PlayCircle size={14} /> Demo video
          </button>
        </div>

        <p className="text-xs text-white/40 mb-3">
          Drop into the deepest squat you can. Keep your heels flat. How does it
          feel?
        </p>

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

      {/* 🎥 DYNAMIC ASSESSMENT VIDEO DEMO MODAL */}
      {activeDemoVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-3 border-b border-white/5 bg-zinc-950">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                Movement Demonstration
              </span>
              <button
                onClick={() => setActiveDemoVideo(null)}
                className="text-white/60 hover:text-white transition-colors p-1"
                aria-label="Close demo player"
              >
                <X size={18} />
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              <video
                src={activeDemoVideo}
                controls
                autoPlay
                className="w-full h-full object-contain"
                controlsList="nodownload"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
