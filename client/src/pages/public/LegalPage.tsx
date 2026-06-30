import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Shield } from "lucide-react";

// 🎬 Cinematic Background Array
const BACKGROUND_IMAGES = [
  "https://media.theathleticzone.in/auth-bg-images/auth-bg-three.jpg",
  "https://media.theathleticzone.in/auth-bg-images/auth-bg-four.jpg",
  "https://media.theathleticzone.in/auth-bg-images/auth-bg-five.jpg",
];

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

export default function LegalPage({
  title,
  lastUpdated,
  children,
}: LegalPageProps) {
  // 🎬 Cinematic Background State
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen flex justify-center py-20 px-4 md:px-12 overflow-hidden selection:bg-amber-500/30">
      {/* 🎬 CINEMATIC BACKGROUND SYSTEM */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#0B0F14]">
        {BACKGROUND_IMAGES.map((src, idx) => (
          <img
            key={src}
            src={src}
            alt="Cinematic Athletic Background"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: idx === currentBg ? 1 : 0,
              transition: "opacity 1.5s ease-in-out",
            }}
          />
        ))}
        {/* Layer 1: Deep Navy/Charcoal Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F1724]/80 via-[#0B0F14]/40 to-[#0F1724]/80 mix-blend-multiply" />
        {/* Layer 2: Dark Vignette Edge Blur */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,#0B0F14_100%)] opacity-90" />
        {/* Layer 3: Cinematic Grain Texture */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Ambient Lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none opacity-50 z-0" />

      {/* 💎 GLASSMORPHIC CONTENT CARD */}
      <div className="w-full max-w-4xl bg-[#0F1724]/60 backdrop-blur-2xl border border-white/10 p-8 md:p-14 rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] relative z-10 animate-in fade-in duration-700 h-fit">
        {/* Header */}
        <div className="border-b border-white/10 pb-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-500 shadow-inner">
              <Shield size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">
              The Athletic Zone Legal
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">
            {title}
          </h1>
          <p className="text-[12px] font-bold text-[#8A94A6] uppercase tracking-widest mt-4">
            Last Updated: {lastUpdated}
          </p>
        </div>

        {/* Content Body */}
        <div className="prose prose-invert prose-amber max-w-none text-sm md:text-base leading-relaxed text-[#8A94A6]">
          {children}
        </div>
      </div>
    </div>
  );
}
