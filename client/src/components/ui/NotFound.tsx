import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Tactical Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-8 animate-in slide-in-from-bottom-8 duration-700">
        {/* Warning Icon Area */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-red-500/20 animate-ping rounded-full" />
          <div className="w-24 h-24 bg-[#121821] border-2 border-red-500/30 rounded-[2rem] flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
            <AlertTriangle size={40} className="text-red-500" />
          </div>
        </div>

        {/* Text Block */}
        <div className="space-y-4">
          <h1 className="text-[120px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 leading-none tracking-tighter">
            404
          </h1>
          <h2 className="text-2xl font-black uppercase tracking-tighter italic text-white flex items-center justify-center gap-3">
            System <span className="text-red-500">Anomaly</span>
          </h2>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] leading-relaxed max-w-xs mx-auto">
            Directive Not Found. The requested sector does not exist or requires
            higher clearance.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#121821] border border-white/5 text-white/60 text-[10px] font-black uppercase tracking-widest hover:border-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} /> Retreat
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 shadow-xl shadow-amber-500/10 transition-all flex items-center justify-center gap-2"
          >
            <Home size={14} /> Return to Hub
          </Link>
        </div>
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
    </div>
  );
}
