import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ArrowRight, Mail, Lock, KeyRound } from "lucide-react";
import { AxiosError } from "axios";
import { toast } from "react-hot-toast";

// 🎬 Cinematic Background Array
const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2069&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526506114642-54bc23e75bb5?q=80&w=2070&auto=format&fit=crop",
];

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<1 | 2>(1); // 1: Email, 2: Reset
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 🎬 Cinematic Background State
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setStep(2);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Failed to dispatch code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email, otp, newPassword });
      toast.success("Credentials updated. Security protocols synchronized.");
      navigate("/login");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
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

      {/* Ambient Form Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* 💎 GLASSMORPHIC CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#0F1724]/60 backdrop-blur-2xl border border-white/10 rounded-[24px] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[16px] bg-amber-500/10 border border-amber-500/20 mb-6 text-amber-500 shadow-inner">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">
            Access <span className="text-amber-500">Recovery</span>
          </h1>
          <p className="text-[#8A94A6] text-[10px] font-bold uppercase tracking-[0.3em] mt-3">
            Security Credential Override
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleRequestOTP}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#8A94A6] ml-2">
                  Registered Email
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-amber-500 transition-colors"
                    size={18}
                  />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/40 backdrop-blur-sm border border-white/5 p-4 pl-12 rounded-[12px] text-sm text-white focus:border-amber-500/50 outline-none transition-all placeholder:text-white/20 shadow-inner"
                    placeholder="athlete@zone.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-[12px] bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-500 transition-all flex items-center justify-center gap-2 group shadow-[0_10px_20px_rgba(255,255,255,0.1)] hover:shadow-[0_15px_30px_rgba(245,158,11,0.3)] active:scale-[0.98]"
              >
                {loading ? "Dispatching..." : "Request Security Code"}
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleResetPassword}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#8A94A6] ml-2">
                    6-Digit Code
                  </label>
                  <div className="relative group">
                    <KeyRound
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-amber-500 transition-colors"
                      size={18}
                    />
                    <input
                      required
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-black/40 backdrop-blur-sm border border-white/5 p-4 pl-12 rounded-[12px] text-lg font-black tracking-[0.5em] text-amber-500 focus:border-amber-500/50 outline-none transition-all placeholder:text-white/10 shadow-inner"
                      placeholder="000000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#8A94A6] ml-2">
                    New Password
                  </label>
                  <div className="relative group">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-amber-500 transition-colors"
                      size={18}
                    />
                    <input
                      required
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-black/40 backdrop-blur-sm border border-white/5 p-4 pl-12 rounded-[12px] text-sm text-white focus:border-amber-500/50 outline-none transition-all placeholder:text-white/20 shadow-inner"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-[12px] bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-400 transition-all shadow-[0_10px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_15px_30px_rgba(245,158,11,0.4)] active:scale-[0.98]"
              >
                {loading ? "Synchronizing..." : "Update Credentials"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
          <Link
            to="/login"
            className="text-[10px] font-black uppercase tracking-widest text-[#8A94A6] hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <ArrowRight size={12} className="rotate-180" />
            Return to Log In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
