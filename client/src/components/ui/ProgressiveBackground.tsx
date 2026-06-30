import { useState, useEffect } from "react";

export default function ProgressiveBackground({
  src,
  className = "",
  children,
}: {
  src: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Silently download the image in the browser cache
    const img = new Image();
    img.src = src;
    img.onload = () => setIsLoaded(true);
  }, [src]);

  return (
    <div className={`relative ${className}`}>
      {/* Fallback solid background color */}
      <div className="absolute inset-0 bg-[#0B0F14] z-[-2]" />

      {/* The actual image that fades in smoothly */}
      <div
        className={`absolute inset-0 z-[-1] bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out ${isLoaded ? "opacity-100" : "opacity-0"}`}
        style={{ backgroundImage: `url('${src}')` }}
      />

      {/* Your page content goes on top */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}
