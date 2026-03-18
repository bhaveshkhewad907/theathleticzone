import { createContext, useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import api from "../services/api";
import { subscribeLogout, unsubscribeLogout } from "./authEvents";
import toast from "react-hot-toast";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "COACH" | "ATHLETE";
  sports?: string[] | { _id: string; name: string }[];
  isProfileLocked?: boolean;
  profileImage?: string | null;
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

        if (
          userData.role === "ATHLETE" &&
          (!userData.sports || userData.sports.length === 0) &&
          !userData.sport
        ) {
          if (!window.location.pathname.includes("/athlete/profile")) {
            toast.error(
              "Deployment incomplete. Please select your sport sector.",
            );
            window.location.href = "/athlete/profile?onboarding=true";
          }
        }
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
      <div className="min-h-screen bg-[#0F1724] relative overflow-hidden flex flex-col items-center justify-center">
        {/* Ambient Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none animate-pulse" />

        {/* Tactical Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-50" />

        <div className="relative z-10 flex flex-col items-center gap-10">
          {/* The Core Reactor (3-Tier Spinner) */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Outer Orbit - Dashed */}
            <div className="absolute inset-0 border-[1px] border-dashed border-amber-500/30 rounded-full animate-[spin_8s_linear_infinite]" />

            {/* Middle Power Ring - Accelerating */}
            <div className="absolute inset-2 border-[2px] border-white/5 border-t-amber-500 border-b-amber-500 rounded-full animate-[spin_2s_ease-in-out_infinite]" />

            {/* Inner Focus Ring - Reversing */}
            <div className="absolute inset-6 border-[1px] border-amber-500/60 border-r-transparent border-l-transparent rounded-full animate-[spin_1.5s_linear_infinite_reverse]" />

            {/* Center Monogram */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-amber-500 font-black text-2xl tracking-tighter drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                AZ
              </span>
            </div>
          </div>

          {/* Typography & Status Indicator */}
          <div className="flex flex-col items-center gap-5 animate-fade-up">
            <h2 className="text-white text-sm md:text-base font-black uppercase tracking-[0.5em] text-center ml-[0.5em] drop-shadow-md">
              The Athletic Zone
            </h2>

            {/* Dynamic Status Pill */}
            <div className="flex items-center gap-3 px-5 py-2.5 bg-black/40 backdrop-blur-md border border-white/5 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              {/* Ping Dot */}
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
              </span>
              <span className="text-amber-500/70 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]">
                Establishing Secure Link
              </span>
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
