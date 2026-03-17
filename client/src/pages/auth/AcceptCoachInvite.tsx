import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";
import axios from "axios";
import { Shield, Lock, User, ChevronRight, Activity } from "lucide-react";

// 🎬 Cinematic Background Array
const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2069&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526506114642-54bc23e75bb5?q=80&w=2070&auto=format&fit=crop",
];

export default function AcceptCoachInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [form, setForm] = useState({
    name: "",
    password: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 🎬 Cinematic Background State
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const validate = async () => {
      try {
        const res = await api.get(`/auth/validate-coach-invite?token=${token}`);
        setEmail(res.data.email);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          setError(error.response?.data?.message || "Invalid invitation");
        } else {
          setError("Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) validate();
    else {
      setError("Invalid or missing security token.");
      setLoading(false);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.post("/auth/accept-coach-invite", {
        token,
        name: form.name,
        password: form.password,
      });

      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Failed to accept invite");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-amber-500 animate-pulse">
          <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
          Verifying Cryptographic Token...
        </div>
      </div>
    );
  }

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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none opacity-50 z-0" />

      <div className="relative z-10 w-full max-w-md">
        {success ? (
          <div className="bg-[#0F1724]/60 backdrop-blur-2xl border border-green-500/30 p-10 rounded-[24px] text-center shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] animate-in zoom-in duration-500">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
              <Shield className="text-green-500" size={32} />
            </div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">
              Access <span className="text-green-500">Granted</span>
            </h2>
            <p className="text-[#8A94A6] text-[10px] font-bold uppercase tracking-[0.2em]">
              Credentials verified. Redirecting to Command Center...
            </p>
          </div>
        ) : (
          <div className="bg-[#0F1724]/60 backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6 shadow-inner">
                <Shield className="text-amber-500" size={24} />
              </div>
              <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">
                Commander <span className="text-amber-500">Initialization</span>
              </h1>
              <p className="text-[#8A94A6] text-[10px] font-black uppercase tracking-[0.3em] mt-3">
                Secure Protocol: {email}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-[12px] bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 backdrop-blur-md">
                <Activity size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {error}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] ml-2">
                  Designated Callsign (Full Name)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User
                      size={16}
                      className="text-[#8A94A6] group-focus-within:text-amber-500 transition-colors"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    disabled={!!error}
                    className="w-full bg-black/40 backdrop-blur-sm border border-white/5 rounded-[12px] pl-11 pr-4 py-4 text-sm text-white focus:border-amber-500/50 outline-none transition-all placeholder:text-white/20 shadow-inner"
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] ml-2">
                  Secure Passkey
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock
                      size={16}
                      className="text-[#8A94A6] group-focus-within:text-amber-500 transition-colors"
                    />
                  </div>
                  <input
                    type="password"
                    required
                    disabled={!!error}
                    className="w-full bg-black/40 backdrop-blur-sm border border-white/5 rounded-[12px] pl-11 pr-4 py-4 text-sm text-white focus:border-amber-500/50 outline-none transition-all placeholder:text-white/20 shadow-inner"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !!error}
                className="w-full relative group overflow-hidden bg-amber-500 text-black py-4 rounded-[12px] text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-50 mt-6 shadow-[0_10px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_15px_30px_rgba(245,158,11,0.4)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="flex items-center justify-center gap-2 relative z-10">
                  {submitting ? "Encrypting..." : "Finalize Credential"}
                  {!submitting && <ChevronRight size={14} strokeWidth={3} />}
                </span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
