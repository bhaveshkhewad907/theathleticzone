import { useState, useContext, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import AuthLayout from "../../layout/AuthLayout";
import AuthContext from "../../context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

// 🎬 Background System Assets
const BACKGROUND_IMAGES = [
  "https://media.theathleticzone.in/auth-bg-images/auth-bg-one.webp",
  "https://media.theathleticzone.in/auth-bg-images/auth-bg-two.webp",
  "https://media.theathleticzone.in/auth-bg-images/auth-bg-three.webp",
  "https://media.theathleticzone.in/auth-bg-images/auth-bg-four.webp",
  "https://media.theathleticzone.in/auth-bg-images/auth-bg-five.webp",
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"LOGIN" | "VERIFY">("LOGIN");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [currentBg, setCurrentBg] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const auth = useContext(AuthContext);

  // 🎬 Cinematic Background Preloader & Looper
  useEffect(() => {
    BACKGROUND_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 7000); // 7 seconds per image

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (location.state?.email && email !== location.state.email) {
      setEmail(location.state.email);
    }
    if (location.state?.requiresVerification && step !== "VERIFY") {
      setStep("VERIFY");
    }
  }, [
    location.state?.email,
    location.state?.requiresVerification,
    email,
    step,
  ]);

  useEffect(() => {
    if (auth?.isAuthenticated && auth?.user) {
      if (auth.user.role === "ADMIN") navigate("/admin", { replace: true });
      else if (auth.user.role === "COACH")
        navigate("/coach/dashboard", { replace: true });
      else navigate("/athlete", { replace: true });
    }
  }, [auth?.isAuthenticated, auth?.user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Enter a valid email address.";
    if (!password.trim()) errors.password = "Password is required.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }
    try {
      const response = await api.post("/auth/login", { email, password });
      toast.success("Login successful.");
      auth?.setAuth(response.data.data);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      const errorMsg = err.response?.data?.message || "Login failed.";

      if (
        err.response?.status === 403 ||
        errorMsg.toLowerCase().includes("verify")
      ) {
        setStep("VERIFY");
        toast.error("Account not verified. Please enter your code.");
        setError("Account not verified. Please enter your code.");
      } else {
        setError("Login failed. Please check your email and password.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/auth/verify-email", { email, otp });
      toast.success("Account verified successfully.");
      setStep("LOGIN");
      setOtp("");
      setPassword("");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      setError(err.response?.data?.message || "Invalid verification code.");
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
        {/* LEFT SIDE - Form Area */}
        <div className="p-10 md:p-14 flex flex-col justify-center relative bg-black/10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-40" />

          {/* 📱 MOBILE ONLY: Clickable AZ Logo to return to Landing Page */}
          <Link
            to="/"
            className="md:hidden h-12 w-12 mb-8 bg-amber-500/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:bg-amber-500/20 transition-all active:scale-95 group"
            title="Return Home"
          >
            <span className="text-amber-500 font-black text-xl italic group-hover:scale-110 transition-transform">
              AZ
            </span>
          </Link>

          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-white/[0.05] text-[9px] font-black text-[#8A94A6] uppercase tracking-widest mb-4 shadow-inner">
              Secure Login
            </div>

            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
              {step === "LOGIN" ? "Sign" : "Verify"}{" "}
              <span className="text-amber-500">
                {step === "LOGIN" ? "In" : "Account"}
              </span>
            </h1>
          </div>

          {error && (
            <div className="mb-6 text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 border border-red-500/20 rounded-[12px] px-5 py-4 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {/* ======================= LOGIN FORM ======================= */}
          {step === "LOGIN" && (
            <form
              onSubmit={handleLogin}
              className="space-y-6 animate-in fade-in zoom-in-95 duration-500"
            >
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

              <div className="text-right text-[10px] font-black uppercase tracking-widest text-[#8A94A6]/40 hover:text-amber-500 transition cursor-pointer">
                <Link
                  to="/forgot-password"
                  className="text-amber-500 hover:text-amber-400 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group w-full py-5 rounded-[12px] bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-400 transition-all active:scale-[0.98] disabled:opacity-50 shadow-[0_10px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_15px_30px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2"
              >
                {loading ? "Logging in..." : "Log In"}{" "}
                <ChevronRight
                  size={16}
                  strokeWidth={3}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>

              <div className="flex items-center gap-4 text-[#8A94A6]/30 text-[9px] font-black uppercase tracking-[0.3em] my-8">
                <div className="flex-1 h-px bg-white/[0.05]"></div>
                Or continue with
                <div className="flex-1 h-px bg-white/[0.05]"></div>
              </div>

              <button
                type="button"
                onClick={() => {
                  window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
                }}
                className="w-full py-4 rounded-[12px] bg-black/40 text-white border border-white/[0.05] hover:border-amber-500/30 transition-all duration-300 flex items-center justify-center gap-3 shadow-inner hover:bg-black/60"
              >
                <svg width="16" height="16" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.7 1.22 9.19 3.6l6.85-6.85C35.9 2.38 30.43 0 24 0 14.63 0 6.62 5.38 2.7 13.22l8.09 6.28C12.94 13.44 17.98 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.1 24.5c0-1.63-.14-3.2-.41-4.7H24v9.1h12.44c-.54 2.9-2.2 5.36-4.7 7.02l7.2 5.6C43.98 37.04 46.1 31.33 46.1 24.5z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.79 28.5a14.5 14.5 0 010-9l-8.09-6.28A23.93 23.93 0 000 24c0 3.9.94 7.6 2.7 10.78l8.09-6.28z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.43 0 11.9-2.12 15.87-5.77l-7.2-5.6c-2 1.34-4.6 2.12-8.67 2.12-6.02 0-11.06-3.94-13.21-9.5l-8.09 6.28C6.62 42.62 14.63 48 24 48z"
                  />
                </svg>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#E5E7EB]">
                  Google
                </span>
              </button>

              <p className="text-[#8A94A6] text-[10px] font-black uppercase tracking-widest mt-8 text-center">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-amber-500 hover:text-amber-400 transition ml-1"
                >
                  Sign Up
                </Link>
              </p>
            </form>
          )}

          {/* ======================= OTP VERIFICATION FORM ======================= */}
          {step === "VERIFY" && (
            <form
              onSubmit={handleVerifyOTP}
              className="space-y-6 animate-in fade-in zoom-in-95 duration-500"
            >
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-[12px] p-5 text-center mb-6 shadow-inner">
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-relaxed">
                  A 6-digit verification code has been sent to <br />
                  <span className="text-[#E5E7EB] font-black">{email}</span>
                </p>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] mb-2 block ml-2">
                  Verification Code
                </label>
                <div className="flex items-center bg-black/40 rounded-[12px] px-5 py-4 border border-white/[0.05] focus-within:border-amber-500/50 transition-all duration-300 shadow-inner">
                  <ShieldCheck className="text-[#8A94A6]/40 mr-4" size={18} />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="bg-transparent outline-none text-[#E5E7EB] w-full text-center text-2xl font-black tracking-[0.5em] placeholder-[#8A94A6]/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="group w-full py-5 rounded-[12px] bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-400 transition-all active:scale-[0.98] disabled:opacity-50 shadow-[0_10px_20px_rgba(245,158,11,0.2)] flex items-center justify-center gap-3 mt-8"
              >
                {loading ? "Verifying..." : "Verify Code"}{" "}
                <ShieldCheck size={16} strokeWidth={3} />
              </button>

              <button
                type="button"
                onClick={() => setStep("LOGIN")}
                className="w-full py-3 text-[9px] font-black uppercase tracking-[0.2em] text-[#8A94A6]/40 hover:text-white transition-colors"
              >
                Cancel & Go Back
              </button>
            </form>
          )}
        </div>

        {/* RIGHT SIDE - Transparent Overlay / Branding */}
        <div className="hidden md:flex items-center justify-center relative overflow-hidden bg-black/10">
          <div className="relative z-10 text-center px-10 flex flex-col items-center">
            {/* 💻 DESKTOP: Clickable Interactive AZ Logo */}
            <Link
              to="/"
              className="group h-20 w-20 mx-auto bg-amber-500/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.2)] mb-8 hover:bg-amber-500/20 hover:shadow-[0_0_60px_rgba(245,158,11,0.4)] hover:-translate-y-1 transition-all active:scale-95 cursor-pointer"
              title="Return Home"
            >
              <span className="text-amber-500 font-black text-4xl italic group-hover:scale-110 transition-transform">
                AZ
              </span>
            </Link>

            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white drop-shadow-lg">
              The Athletic Zone
            </h2>
            <p className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3 drop-shadow-md">
              Elite Performance Engine
            </p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
