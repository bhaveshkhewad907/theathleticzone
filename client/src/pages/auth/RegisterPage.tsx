import { useState, useEffect } from "react";
import { Eye, EyeOff, Mail, Lock, User, ChevronRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../../layout/AuthLayout";

import api from "../../services/api";
import toast from "react-hot-toast";

// 🎬 Background System Assets
const BACKGROUND_IMAGES = [
  "https://media.theathleticzone.in/auth-bg-images/auth-bg-one.webp",
  "https://media.theathleticzone.in/auth-bg-images/auth-bg-two.webp",
  "https://media.theathleticzone.in/auth-bg-images/auth-bg-three.webp",
  "https://media.theathleticzone.in/auth-bg-images/auth-bg-four.webp",
  "https://media.theathleticzone.in/auth-bg-images/auth-bg-five.webp",
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [currentBg, setCurrentBg] = useState(0);

  const navigate = useNavigate();

  // 🎬 Cinematic Background Preloader & Looper
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    const errors: { name?: string; email?: string; password?: string } = {};
    if (!name.trim()) errors.name = "Full name is required.";
    if (!email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Enter a valid email address.";
    if (password.length < 6)
      errors.password = "Password must be at least 6 characters.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      toast.success(
        "Account created! Please check your email for the verification code.",
      );

      // 🚀 THE FIX: We only navigate to the login page to trigger the OTP modal.
      navigate("/login", {
        state: { email: email, requiresVerification: true },
      });

      // 🚨 WE DELETED THE auth?.setAuth() AND THE /athlete REDIRECTS FROM HERE!
      // The user is not fully "logged in" until they verify the OTP on the login page.
    } catch {
      setError("Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* 🎬 CINEMATIC BACKGROUND SYSTEM */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#0B0F14]">
        {BACKGROUND_IMAGES.map((src, idx) => (
          <img
            key={src}
            src={src}
            alt="Cinematic Athletic Background"
            className="absolute inset-0 w-full h-full object-cover"
            fetchPriority={idx === 0 ? "high" : "auto"}
            loading={idx === 0 ? "eager" : "lazy"}
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

      {/* 🛡️ PREMIUM AUTH CARD */}
      <div className="relative z-10 w-full max-w-6xl bg-[#0F1724]/20 backdrop-blur-md rounded-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] overflow-hidden grid md:grid-cols-2 border border-white/[0.05]">
        {/* LEFT SIDE - Transparent Overlay / Branding */}
        <div className="hidden md:flex items-center justify-center relative overflow-hidden bg-black/10 border-r border-white/[0.05]">
          <div className="relative z-10 text-center px-12">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white mb-6 drop-shadow-lg">
              Start Your <br />
              <span className="text-amber-500">Training.</span>
            </h2>
            <p className="text-[#8A94A6] text-[10px] font-bold uppercase tracking-[0.2em] leading-loose drop-shadow-md">
              Join our community of athletes. Get access to expert coaching,
              personalized training programs, and performance tracking.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE - Form Area */}
        <div className="p-10 md:p-14 flex flex-col justify-center relative bg-black/20">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-amber-500 to-transparent opacity-40" />

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-white/[0.05] text-[9px] font-black text-[#8A94A6] uppercase tracking-widest mb-4 shadow-inner">
              Create Account
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
              Sign <span className="text-amber-500">Up</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 border border-red-500/20 rounded-[12px] px-5 py-4">
                {error}
              </div>
            )}

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] mb-2 block ml-2">
                Full Name
              </label>
              <div
                className={`flex items-center bg-black/40 rounded-[12px] px-5 py-4 border transition-all duration-300 shadow-inner ${fieldErrors.name ? "border-red-500/50" : "border-white/[0.05] focus-within:border-amber-500/50"}`}
              >
                <User className="text-[#8A94A6]/40 mr-4" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="bg-transparent outline-none text-[#E5E7EB] w-full placeholder-[#8A94A6]/20 text-sm font-bold"
                />
              </div>
              {fieldErrors.name && (
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2 ml-2">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] mb-2 block ml-2">
                Email Address
              </label>
              <div
                className={`flex items-center bg-black/40 rounded-[12px] px-5 py-4 border transition-all duration-300 shadow-inner ${fieldErrors.email ? "border-red-500/50" : "border-white/[0.05] focus-within:border-amber-500/50"}`}
              >
                <Mail className="text-[#8A94A6]/40 mr-4" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="athlete@theathleticzone.com"
                  className="bg-transparent outline-none text-[#E5E7EB] w-full placeholder-[#8A94A6]/20 text-sm font-bold"
                />
              </div>
              {fieldErrors.email && (
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2 ml-2">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] mb-2 block ml-2">
                Password
              </label>
              <div
                className={`flex items-center bg-black/40 rounded-[12px] px-5 py-4 border transition-all duration-300 shadow-inner ${fieldErrors.password ? "border-red-500/50" : "border-white/[0.05] focus-within:border-amber-500/50"}`}
              >
                <Lock className="text-[#8A94A6]/40 mr-4" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-transparent outline-none text-[#E5E7EB] w-full placeholder-[#8A94A6]/20 text-sm font-bold tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#8A94A6]/40 hover:text-amber-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2 ml-2">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full py-5 rounded-[12px] bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-400 transition-all active:scale-[0.98] disabled:opacity-50 shadow-[0_10px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_15px_30px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 mt-4"
            >
              {loading ? "Creating Account..." : "Create Account"}{" "}
              <ChevronRight
                size={16}
                strokeWidth={3}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </form>

          <p className="text-[#8A94A6] text-[10px] font-black uppercase tracking-widest mt-8 text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-amber-500 hover:text-amber-400 transition ml-1"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
