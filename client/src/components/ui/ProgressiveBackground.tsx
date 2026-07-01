import { useState, useEffect } from "react";

interface ProgressiveBackgroundProps {
  src: string;
  children: React.ReactNode;
  className?: string;
}

export default function ProgressiveBackground({
  src,
  children,
  className = "",
}: ProgressiveBackgroundProps) {
  // 🚀 THE LCP FIX: Initialize with `src` instead of `null`!
  // This forces the critical FIRST image to render immediately without waiting for JS.
  const [loadedSrc, setLoadedSrc] = useState<string | null>(src);

  useEffect(() => {
    // Only trigger the background JS loader if the user navigates to a NEW step.
    if (src !== loadedSrc) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setLoadedSrc(src);
      };
    }
  }, [src, loadedSrc]);

  const isLoaded = loadedSrc === src;

  return (
    <div className={`isolate ${className}`}>
      {/* 🚀 THE LCP FIX: fetchpriority="high" and loading="eager" forces the browser to skip the network queue */}
      <img
        src={src}
        alt="Background"
        fetchPriority="high"
        loading="eager"
        decoding="async"
        className={`fixed inset-0 w-full h-full object-cover z-[-2] transition-opacity duration-700 ease-in-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="fixed inset-0 bg-black/30 z-[-1]" />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
