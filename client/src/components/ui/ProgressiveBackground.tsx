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
  // 🚀 THE FIX: Track the URL of the loaded image instead of a true/false boolean
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

  useEffect(() => {
    // We no longer need to synchronously reset state here! The linter is happy.
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setLoadedSrc(src);
    };
  }, [src]);

  // If the current 'src' matches the 'loadedSrc', we know the new image is fully loaded!
  const isLoaded = loadedSrc === src;

  return (
    <div className={`isolate ${className}`}>
      <img
        src={src}
        alt="Background"
        className={`fixed inset-0 w-full h-full object-cover z-[-2] transition-opacity duration-700 ease-in-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="fixed inset-0 bg-black/30 z-[-1]" />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
