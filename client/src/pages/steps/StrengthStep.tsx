import { PlayCircle, X } from "lucide-react";
import { useState } from "react";

interface Props {
  data: { backSquatMaxKg: string };
  updateData: (
    category: "mobility" | "power" | "sprinting" | "strength",
    field: string,
    value: string,
  ) => void;
}

export default function StrengthStep({ data, updateData }: Props) {
  const [activeDemoVideo, setActiveDemoVideo] = useState<string | null>(null);

  return (
    <div className="animate-fade-up relative">
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
          <button
            onClick={() =>
              setActiveDemoVideo(
                "https://media.theathleticzone.in/assessment-demo-videos/back%20squat.MOV",
              )
            }
            className="flex items-center gap-1.5 text-amber-500 text-[10px] font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition-colors"
            aria-label="Watch video demonstration for Back Squat"
          >
            <PlayCircle size={14} /> Demo video
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
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white text-lg font-bold placeholder:text-white/20 focus:border-amber-500 focus:outline-none transition-all shadow-inner"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">
            kg
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
