import { createContext, useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import api from "../services/api";
import { subscribeLogout, unsubscribeLogout } from "./authEvents";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "COACH" | "ATHLETE";
  sports?: string[] | { _id: string; name: string }[];
  isProfileLocked?: boolean;
  profileImage?: string | null;
  platformState?: {
    status: "NEEDS_ASSESSMENT" | "UNDER_REVIEW" | "ACTIVE_TRAINING";
    activeCourseId?: string;
    nextCourseId?: string;
  };
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const hasInitialized = useRef(false);

  const setAuth = (userData: AuthUser | null) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.warn("Logout error:", error);
    }

    setAuth(null);

    // 🚀 THE FIX: Use replace to prevent "back button" auto-login loops
    window.location.replace("/login");
  };

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initAuth = async () => {
      try {
        const meRes = await api.get("/users/me");
        const userData = meRes.data.data;

        setAuth({
          ...userData,
          id: userData._id || userData.id,
        });

        // 🚀 THE FIX: We completely deleted the old 'sports' array check that was
        // violently redirecting the user to the profile page!
        // Now, we just set the Auth state and let AthleteLayout route them to the Assessment.
      } catch {
        setAuth(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    const handleLogout = () => setAuth(null);
    subscribeLogout(handleLogout);
    return () => unsubscribeLogout(handleLogout);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1724] relative overflow-hidden flex flex-col items-center justify-center font-sans">
        {/* Ambient Stadium Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/15 blur-[120px] rounded-full pointer-events-none animate-pulse" />

        {/* Athletic Mesh / Jersey Fabric Texture Overlay */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,rgba(255,255,255,0.015)_0px,rgba(255,255,255,0.015)_2px,transparent_2px,transparent_8px)] pointer-events-none opacity-80" />

        <div className="relative z-10 flex flex-col items-center gap-10">
          {/* The "Stadium Track" Loader */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Outer Track Line */}
            <div className="absolute inset-0 border-4 border-[#1E293B] rounded-full" />

            {/* The "Runner" - Fast, asymmetrical spin simulating a sprinter on a track */}
            <div className="absolute inset-[-4px] rounded-full border-4 border-transparent border-t-amber-500 border-r-amber-500 animate-[spin_1s_cubic-bezier(0.67,0.05,0.15,0.95)_infinite] drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]" />

            {/* Inner Pace Ring - Dashed like track lanes */}
            <div className="absolute inset-3 border-[2px] border-dashed border-slate-700/60 rounded-full animate-[spin_4s_linear_infinite_reverse]" />

            {/* Center Hub - AZ Logo */}
            <div className="absolute inset-0 flex items-center justify-center bg-[#0F1724] rounded-full m-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] border border-slate-800">
              <span className="text-white font-black text-3xl italic tracking-tighter drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]">
                AZ
              </span>
            </div>

            {/* Floating Sports Icons */}
            {/* Speed/Energy */}
            <div
              className="absolute -top-2 -left-2 bg-slate-800 p-1.5 rounded-full border border-slate-600 animate-bounce shadow-lg"
              style={{ animationDelay: "0ms" }}
            >
              <svg
                className="w-4 h-4 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>

            {/* Strength/Fitness */}
            <div
              className="absolute -bottom-2 -left-2 bg-slate-800 p-1.5 rounded-full border border-slate-600 animate-bounce shadow-lg"
              style={{ animationDelay: "200ms" }}
            >
              <svg
                className="w-4 h-4 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10h18M3 14h18m-9-8v12m-6-4v-4m12 4v-4"
                />
              </svg>
            </div>

            {/* Time/Records */}
            <div
              className="absolute top-1/2 -right-4 -translate-y-1/2 bg-slate-800 p-1.5 rounded-full border border-slate-600 animate-bounce shadow-lg"
              style={{ animationDelay: "400ms" }}
            >
              <svg
                className="w-4 h-4 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 2v2m4 0l1 1"
                />
              </svg>
            </div>
          </div>

          {/* Typography & Status Indicator */}
          <div className="flex flex-col items-center gap-4 animate-fade-up">
            <h2 className="text-white text-base md:text-lg font-black uppercase italic tracking-[0.4em] text-center ml-[0.4em] drop-shadow-md">
              The Athletic Zone
            </h2>

            {/* Dynamic Status Pill - Skewed for "Forward Momentum" */}
            <div className="px-6 py-2.5 bg-amber-500/10 backdrop-blur-md border-b-2 border-amber-500 skew-x-[-12deg] shadow-[0_10px_20px_rgba(0,0,0,0.3)]">
              {/* Un-skew the inner content so it remains readable */}
              <div className="skew-x-[12deg] flex items-center gap-3">
                {/* Active warm-up dots */}
                <div className="flex items-center gap-1">
                  <span
                    className="w-1.5 h-4 bg-amber-500 animate-[pulse_1s_ease-in-out_infinite]"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1.5 h-4 bg-amber-500/60 animate-[pulse_1s_ease-in-out_infinite]"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-4 bg-amber-500/30 animate-[pulse_1s_ease-in-out_infinite]"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <span className="text-amber-500 text-[10px] md:text-xs font-black uppercase italic tracking-[0.2em]">
                  Warming Up...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, setAuth, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
