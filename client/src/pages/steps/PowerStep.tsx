import { PlayCircle, X } from "lucide-react";
import { useState } from "react";

interface Props {
  data: { broadJumpMeters: string; verticalJumpCm: string };
  updateData: (
    category: "mobility" | "power" | "sprinting" | "strength",
    field: string,
    value: string,
  ) => void;
}

export default function PowerStep({ data, updateData }: Props) {
  const [activeDemoVideo, setActiveDemoVideo] = useState<string | null>(null);

  return (
    <div
      className="animate-fade-up relative bg-cover bg-center bg-no-repeat p-6 sm:p-10 rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(9,9,11,0.85), rgba(9,9,11,0.98)), url('https://media.theathleticzone.in/auth-bg-images/power.jpg')`,
      }}
    >
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
          <button
            onClick={() =>
              setActiveDemoVideo(
                "https://media.theathleticzone.in/assessment-demo-videos/broad%20jump.MOV",
              )
            }
            className="flex items-center gap-1.5 text-amber-500 text-[10px] font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition-colors"
            aria-label="Watch video demonstration for Standing Broad Jump"
          >
            <PlayCircle size={14} /> Demo video
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
          <button
            onClick={() =>
              setActiveDemoVideo(
                "https://media.theathleticzone.in/assessment-demo-videos/verticel%20jump.MOV",
              )
            }
            className="flex items-center gap-1.5 text-amber-500 text-[10px] font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition-colors"
            aria-label="Watch video demonstration for Vertical Jump"
          >
            <PlayCircle size={14} /> Demo video
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
