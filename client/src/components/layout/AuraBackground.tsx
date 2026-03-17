import { memo } from "react";

interface AuraBackgroundProps {
  imageUrl?: string | null;
}

const AuraBackground = memo(({ imageUrl }: AuraBackgroundProps) => {
  if (!imageUrl) {
    // Fallback: Default Athletic Zone gradient if no image is uploaded
    return (
      <div className="fixed inset-0 z-[-1] bg-[#0B0F14] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#0B0F14]">
      {/* 🚀 The Full Page Image - Sharp and Clear (Blur completely removed) */}
      <img
        src={imageUrl}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover scale-[1.05]"
      />

      {/* 🚀 The Unified Dark Tint - Keeps text readable over the sharp image */}
      <div className="absolute inset-0 bg-[#0B0F14]/70" />
    </div>
  );
});

export default AuraBackground;
