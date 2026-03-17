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
    window.location.href = "/login";
  };

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initAuth = async () => {
      try {
        // 🚀 UPGRADED: Point to the robust user controller instead of auth
        const meRes = await api.get("/users/me");
        const userData = meRes.data.data;

        // 🚀 UPGRADED: Safely map _id to id for your Context Interface, and pass the whole object
        setAuth({
          ...userData,
          id: userData._id || userData.id,
        });

        if (
          userData.role === "ATHLETE" &&
          (!userData.sports || userData.sports.length === 0) &&
          !userData.sport // 🚀 THE FIX: Don't trigger the alarm if they have a core sport!
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

  if (loading) return null;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, setAuth, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
