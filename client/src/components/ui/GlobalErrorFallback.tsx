import type { FallbackProps } from "react-error-boundary";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function GlobalErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  return (
    <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Tactical Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg animate-in fade-in zoom-in-95 duration-500 text-center">
        {/* Glassmorphic Card */}
        <div className="bg-[#0F1724]/60 backdrop-blur-2xl border border-red-500/20 p-10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] relative overflow-hidden">
          {/* Warning Icon Area */}
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-red-500/20 animate-ping rounded-2xl" />
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#121821] border border-red-500/30 text-red-500 relative z-10 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
              <AlertTriangle size={40} />
            </div>
          </div>

          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2">
            System <span className="text-red-500">Anomaly</span>
          </h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mb-6">
            Critical Interface Failure
          </p>

          {/* Error Output Terminal */}
          <div className="bg-black/60 backdrop-blur-md border border-red-500/10 rounded-xl p-5 mb-8 text-left overflow-auto max-h-32 shadow-inner">
            <code className="text-red-400 text-[10px] font-mono leading-relaxed">
              {(error as Error)?.message || "Unknown rendering error occurred."}
            </code>
          </div>

          <button
            onClick={resetErrorBoundary}
            className="w-full py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-500 transition-all flex items-center justify-center gap-2 group shadow-[0_10px_20px_rgba(255,255,255,0.1)] hover:shadow-[0_15px_30px_rgba(245,158,11,0.3)] active:scale-[0.98]"
          >
            <RefreshCcw
              size={14}
              className="group-hover:-rotate-180 transition-transform duration-500"
            />
            Reboot Interface
          </button>
        </div>
      </div>

      {/* Cinematic Grain Texture */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
