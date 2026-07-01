import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  Activity,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  Shield,
  MapPin,
  MessageCircle,
  Phone,
  Clock,
  Target,
  TrendingUp,
  Crosshair,
  Briefcase,
  Award,
  Star,
  ArrowRight,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import api from "../../services/api";
import Footer from "./Footer";

interface ReviewData {
  _id: string;
  content: string;
  rating: number;
  user?: {
    name: string;
    profileImage?: string;
  };
}

/* ==========================================================================
   Data Registries
   ========================================================================== */
const INTELLIGENCE_FEATURES = [
  {
    icon: <Activity size={24} />,
    title: "Track Your Progress",
    desc: "Monitor your speed, strength, and daily improvement easily.",
  },
  {
    icon: <BarChart3 size={24} />,
    title: "Smart Training",
    desc: "Train hard and get faster without burning out or getting injured.",
  },
  {
    icon: <Target size={24} />,
    title: "Form Correction",
    desc: "Improve your running posture and foot strike technique.",
  },
  {
    icon: <TrendingUp size={24} />,
    title: "See Your Speed",
    desc: "Watch your sprint times drop week by week on your dashboard.",
  },
];

const JOURNEY_STEPS = [
  {
    num: "01",
    title: "Sign Up",
    desc: "Create your secure account to get started.",
  },
  {
    num: "02",
    title: "Take the Test",
    desc: "Share your current stats and a video of your sprint.",
  },
  {
    num: "03",
    title: "Get Your Plan",
    desc: "Get a custom 6-week training plan built just for you.",
  },
  {
    num: "04",
    title: "Train & Win",
    desc: "Follow the plan, get faster, and beat your personal best.",
  },
];

// Cinematic Framer Motion Variants
const staggerContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const maskedReveal: Variants = {
  hidden: { y: "120%", opacity: 0, filter: "blur(10px)" },
  visible: {
    y: "0%",
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, delay: 0.2, ease: "easeOut" },
  },
};

/* ==========================================================================
   Main Component
   ========================================================================== */
export default function LandingPage() {
  const navigate = useNavigate();
  const WHATSAPP_NUMBER = "+919680223777";
  const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Hello,%20I%20am%20interested%20in%20the%20100m/200m%20Sprint%20Program.`;

  const GALLERY = Array.from({ length: 15 }).map(
    (_, index) =>
      `https://media.theathleticzone.in/center-images/center-image-${index + 1}.webp`,
  );

  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const reviewScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get("/reviews/public");
        setReviews(res.data.data);
      } catch (error) {
        console.error("Failed to fetch reviews", error);
      }
    };
    fetchReviews();
  }, []);

  const scrollReviews = (direction: "left" | "right") => {
    if (reviewScrollRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 300 : 400;
      reviewScrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const facilitySlides = [];
  for (let i = 0; i < GALLERY.length; i += 5) {
    facilitySlides.push(GALLERY.slice(i, i + 5));
  }

  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGalleryIndex((prev) => (prev + 1) % facilitySlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [facilitySlides.length]);

  const currentGallerySet = facilitySlides[galleryIndex] || [];

  return (
    <div className="min-h-screen text-[#E5E7EB] font-sans selection:bg-amber-500/30 overflow-x-hidden relative">
      {/* 🚀 1. THE GLOBAL FIXED BACKGROUND LAYER */}
      <div className="fixed inset-0 z-[-1] bg-[#0B0F14]">
        <img
          src="https://media.theathleticzone.in/auth-bg-images/hero-bg%20(2).webp"
          alt="Athletic Zone Background"
          className="w-full h-full object-cover opacity-60"
          fetchPriority="high"
          loading="eager"
        />
        {/* Subtle overlay so text remains readable without killing natural tones */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      {/* 🟢 FLOATING WHATSAPP CTA */}
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[100] group flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-green-500 text-white rounded-full shadow-[0_10px_30px_rgba(34,197,94,0.4)] hover:scale-110 hover:shadow-[0_15px_40px_rgba(34,197,94,0.6)] transition-all duration-300"
      >
        <MessageCircle className="w-7 h-7 md:w-8 md:h-8" strokeWidth={2.5} />
        <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-ping opacity-20" />
      </a>

      {/* 💎 GLASSMORPHISM NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-black/40 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 md:h-24 flex items-center justify-between">
          <div
            className="flex items-center gap-3 md:gap-4 group cursor-pointer"
            onClick={() => window.scrollTo(0, 0)}
          >
            <div className="h-10 w-10 md:h-12 md:w-12 bg-amber-500/10 border border-amber-500/20 rounded-[12px] md:rounded-[14px] flex items-center justify-center shadow-inner group-hover:bg-amber-500 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-500">
              <span className="text-amber-500 group-hover:text-black font-black text-xl md:text-2xl italic tracking-tighter transition-colors">
                AZ
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic leading-none hidden sm:block text-white drop-shadow-md">
              The Athletic <span className="text-amber-500">Zone</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <Link
              to="/register"
              className="text-[11px] font-black uppercase tracking-widest text-[#8A94A6] hover:text-white transition-colors hidden sm:block drop-shadow-md"
            >
              Sign Up
            </Link>

            <Link
              to="/login"
              className="px-5 py-3 md:px-8 md:py-4 bg-amber-500 text-black text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] rounded-[12px] md:rounded-[14px] hover:bg-amber-400 transition-all shadow-[0_10px_20px_rgba(245,158,11,0.2)] active:scale-95 flex items-center gap-1 md:gap-2 whitespace-nowrap"
            >
              Log In <ChevronRight size={14} strokeWidth={3} />
            </Link>
          </div>
        </div>
      </nav>

      {/* 🎬 SECTION 1: HERO */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-6 md:space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/50 backdrop-blur-xl border border-white/10 text-[9px] md:text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] shadow-inner"
          >
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
            Online Sprint Training Hub
          </motion.div>

          <motion.h1
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-[3.5rem] leading-[0.9] sm:text-6xl md:text-8xl lg:text-[10rem] font-black uppercase italic tracking-tighter text-white flex flex-col items-center"
          >
            <div className="overflow-hidden pb-2 md:pb-6">
              <motion.span
                variants={maskedReveal}
                className="block drop-shadow-2xl"
              >
                Dominate
              </motion.span>
            </div>
            <div className="overflow-hidden pb-2 md:pb-6">
              <motion.span
                variants={maskedReveal}
                className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-200 drop-shadow-[0_0_40px_rgba(245,158,11,0.5)]"
              >
                Your Sprint.
              </motion.span>
            </div>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="max-w-2xl mx-auto text-[10px] md:text-[11px] lg:text-sm text-white/80 font-bold uppercase tracking-[0.2em] leading-relaxed md:leading-loose drop-shadow-lg px-4"
          >
            Expert coaching and smart training plans for the 100m & 200m track
            athlete. Built for sprinters who want to run faster and leave the
            competition behind.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="pt-8 md:pt-12 flex justify-center"
          >
            <a
              href="#sprint-program"
              className="group flex flex-col items-center gap-3 text-white/70 hover:text-amber-500 transition-colors drop-shadow-md"
            >
              <span className="text-[9px] font-black uppercase tracking-[0.4em]">
                Explore Programs
              </span>
              <ChevronRight
                size={18}
                strokeWidth={2}
                className="rotate-90 group-hover:translate-y-2 transition-transform duration-300"
              />
            </a>
          </motion.div>
        </div>
      </section>

      {/* 🏆 SECTION 2: CTA CARD (Glassmorphic Mobile-Optimized) */}
      <section
        id="sprint-program"
        className="py-16 md:py-32 px-4 md:px-6 relative flex justify-center items-center"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="relative z-10 w-full max-w-5xl rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.8)] group border border-white/10 hover:border-amber-500/50 transition-colors duration-700 bg-black/40 backdrop-blur-2xl"
        >
          {/* Internal Image specific to the CTA Card */}
          <div className="absolute inset-0 z-0">
            <motion.img
              variants={{
                hidden: { scale: 1.2, opacity: 0 },
                visible: {
                  scale: 1.05,
                  opacity: 0.3,
                  transition: { duration: 1.5, ease: "easeOut" },
                },
              }}
              src="https://media.theathleticzone.in/auth-bg-images/CTA-card_landing-page.webp"
              alt="Sprinter exploding off blocks"
              className="w-full h-full object-cover group-hover:scale-110 group-hover:opacity-50 transition-all duration-[2s] ease-out mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
          </div>

          <div className="relative z-10 p-8 md:p-20 flex flex-col items-center text-center">
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-3 px-5 py-2.5 md:px-6 md:py-2.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 mb-6 md:mb-8 shadow-inner"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
              Elite Track & Field Focus
            </motion.div>

            <h2 className="text-[2rem] leading-tight md:text-6xl lg:text-7xl font-black italic uppercase tracking-tighter text-white mb-4 md:mb-6 drop-shadow-2xl flex flex-col items-center">
              <div className="overflow-hidden pb-1 md:pb-4">
                <motion.span variants={maskedReveal} className="block">
                  Master the
                </motion.span>
              </div>
              <div className="overflow-hidden pb-2 md:pb-6">
                <motion.span
                  variants={maskedReveal}
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-200"
                >
                  100m & 200m
                </motion.span>
              </div>
            </h2>

            <motion.p
              variants={fadeUp}
              className="text-white/70 text-xs md:text-lg font-medium leading-relaxed max-w-2xl mb-8 md:mb-12 drop-shadow-md px-2"
            >
              Ready to get faster? Take our quick assessment and let our system
              build the exact 6-week workout plan you need to perfect your form
              and shave critical milliseconds off your time.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-col items-center w-full px-2"
            >
              <button
                onClick={() => navigate("/register")}
                className="w-full md:w-auto relative overflow-hidden px-8 py-5 md:px-14 md:py-6 bg-amber-500 text-black font-black text-xs md:text-base uppercase tracking-widest rounded-[16px] md:rounded-[20px] hover:bg-amber-400 transition-all shadow-[0_10px_30px_rgba(245,158,11,0.4)] active:scale-95 flex items-center justify-center gap-3 group/btn"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Unlock Your Plan
                  <ArrowRight
                    size={20}
                    className="group-hover/btn:translate-x-2 transition-transform"
                  />
                </span>
              </button>
              <p className="text-[9px] md:text-[10px] text-white/50 font-bold uppercase tracking-widest mt-6">
                Join 500+ Athletes Currently Enrolled
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 🧠 SECTION 3: FEATURES (Glassmorphic Cards) */}
      <section className="py-16 md:py-32 px-4 md:px-6 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16 md:mb-20 flex flex-col items-center"
          >
            <motion.div variants={fadeUp}>
              <Crosshair
                className="mx-auto text-amber-500 mb-4 md:mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] w-10 h-10 md:w-12 md:h-12"
                strokeWidth={1.5}
              />
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white drop-shadow-lg">
              Smart <span className="text-amber-500">Training</span>
            </h2>
            <motion.p
              variants={fadeUp}
              className="text-[9px] md:text-[10px] font-black text-white/70 uppercase tracking-[0.2em] md:tracking-[0.3em] mt-4 max-w-2xl mx-auto drop-shadow-md px-4"
            >
              We don't just run. We track, analyze, and build a plan to make you
              faster safely.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {INTELLIGENCE_FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-[20px] md:rounded-[24px] p-6 md:p-8 shadow-[0_15px_35px_rgba(0,0,0,0.5)] group hover:border-amber-500/50 hover:bg-black/70 transition-all duration-500"
              >
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-[14px] md:rounded-[16px] bg-white/5 border border-white/10 flex items-center justify-center text-amber-500 mb-5 md:mb-6 shadow-inner group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-black transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-base md:text-lg font-black uppercase italic tracking-tighter text-white mb-2 md:mb-3 drop-shadow-md">
                  {feature.title}
                </h3>
                <p className="text-[10px] md:text-[11px] text-white/60 font-bold uppercase tracking-widest leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 🏟️ SECTION 4: GALLERY */}
      <section className="py-16 md:py-32 px-4 md:px-6 relative border-y border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mb-10 md:mb-12 text-center flex flex-col items-center"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-400 text-[9px] font-black uppercase tracking-[0.3em] mb-4 shadow-inner"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              Facility Feed
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white drop-shadow-lg">
              The <span className="text-amber-500">Facility</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            className="relative pt-6"
          >
            {/* 🚀 THE SCROLL JUMP FIX: Grid structure is now static and permanent */}
            <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-3 md:gap-4 md:h-[600px] w-full relative mt-4">
              {[0, 1, 2, 3, 4].map((i) => {
                const img = currentGallerySet[i];
                if (!img) return null; // Safety check

                const isHero = i === 0;
                const gridClasses = isHero
                  ? "col-span-2 md:col-span-2 md:row-span-2 aspect-[16/10] md:aspect-auto"
                  : "col-span-1 md:col-span-1 md:row-span-1 aspect-square md:aspect-auto";

                return (
                  // 1. Grid Cells use the index (i) as the key, so they NEVER unmount. Layout is locked.
                  <div
                    key={`gallery-cell-${i}`}
                    className={`relative rounded-[16px] md:rounded-[24px] overflow-hidden group shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/[0.05] bg-black/40 ${gridClasses}`}
                  >
                    {/* 2. AnimatePresence now lives INSIDE the cell, only crossfading the images */}
                    <AnimatePresence>
                      <motion.img
                        key={img} // The key changes every 5 seconds, triggering the crossfade
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 0.8, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        src={img}
                        alt={`Facility View ${i}`}
                        // 3. Absolute positioning guarantees the animation never alters page height
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] group-hover:opacity-100"
                      />
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 🏅 SECTION 5: HEAD COACH (Glassmorphic Bio) */}
      <section className="py-16 md:py-32 px-4 md:px-6 relative">
        <div className="max-w-7xl mx-auto relative flex flex-col items-center z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mb-10 md:mb-16 flex flex-col items-center text-center"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-amber-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-3 md:mb-4 shadow-inner"
            >
              <Shield size={12} className="md:w-[14px] md:h-[14px]" />{" "}
              Leadership
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white drop-shadow-lg">
              Meet Your <span className="text-amber-500">Coach</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="relative w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center lg:items-stretch gap-8 lg:gap-16 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-5 sm:p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          >
            {/* 📸 The Portrait (Mobile Scaled Down) */}
            <motion.div
              variants={fadeUp}
              className="w-[75%] sm:w-[60%] md:w-[50%] lg:w-2/5 relative group shrink-0 mt-2 lg:mt-0"
            >
              <div className="relative z-10 aspect-[4/5] rounded-[16px] md:rounded-[24px] overflow-hidden border border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.6)]">
                <img
                  src="https://media.theathleticzone.in/auth-bg-images/jitu-saini%20(1).webp"
                  alt="Head Coach Jitendra Saini"
                  className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[1.5s] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/20 to-transparent opacity-80 lg:opacity-60 group-hover:opacity-30 transition-opacity duration-700" />
              </div>
            </motion.div>

            {/* 📝 The Editorial Bio */}
            <motion.div
              variants={staggerContainer}
              className="w-full lg:w-3/5 flex flex-col items-center lg:items-start text-center lg:text-left z-10"
            >
              <motion.div
                variants={fadeUp}
                className="flex flex-wrap justify-center lg:justify-start items-center gap-2 md:gap-3 mb-4 md:mb-6"
              >
                <div className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                  <Briefcase size={12} className="md:w-[14px] md:h-[14px]" />
                </div>
                <span className="text-amber-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] drop-shadow-md">
                  Sprint Performance Coach
                </span>
              </motion.div>

              <h3 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black italic uppercase tracking-tighter text-white mb-4 md:mb-6 drop-shadow-lg leading-none">
                Jitendra <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                  Saini
                </span>
              </h3>

              {/* Hook Statement */}
              <motion.div
                variants={fadeUp}
                className="relative mb-6 md:mb-8 w-full"
              >
                <p className="text-amber-500 text-[11px] sm:text-xs md:text-sm font-black uppercase tracking-widest leading-relaxed relative z-10 lg:pl-6 lg:border-l-2 lg:border-amber-500/50">
                  Helping 100m & 200m sprinters become faster through
                  biomechanics, strength training, and evidence-based
                  programming.
                </p>
              </motion.div>

              {/* The Mission Statement (Paragraphs) - Switched to text-left on mobile for readability */}
              <motion.div
                variants={fadeUp}
                className="space-y-4 mb-8 md:mb-10 text-white/70 text-[11px] sm:text-xs md:text-sm font-medium leading-relaxed w-full text-left md:text-left"
              >
                <p>
                  <strong className="text-white">
                    Hi, I’m Jitendra Saini, founder of The Athletic Zone.
                  </strong>
                </p>
                <p>
                  I built this platform with one mission—to provide Indian
                  sprinters with the same structured sprint performance system
                  used by elite athletes.
                </p>
                <p>
                  Every program is designed around{" "}
                  <span className="text-white font-bold border-b border-white/20 pb-0.5">
                    movement quality
                  </span>
                  ,{" "}
                  <span className="text-white font-bold border-b border-white/20 pb-0.5">
                    sprint mechanics
                  </span>
                  ,{" "}
                  <span className="text-white font-bold border-b border-white/20 pb-0.5">
                    force production
                  </span>{" "}
                  and long-term athletic development rather than random
                  workouts.
                </p>
                <p>
                  Whether you’re preparing for your first competition or chasing
                  a new personal best, every training block is built to help you
                  become a faster, stronger and more resilient sprinter.
                </p>
              </motion.div>

              {/* Official Accolades/Tags */}
              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-2 md:gap-3 w-full"
              >
                <div className="flex w-full sm:w-auto items-center justify-center sm:justify-start gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-3 py-2 md:px-4 md:py-2.5 rounded-lg md:rounded-xl hover:border-amber-500/30 transition-colors">
                  <Award
                    size={12}
                    className="text-amber-500 md:w-[14px] md:h-[14px]"
                  />
                  <p className="text-white text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-center">
                    Strength & Conditioning Specialist
                  </p>
                </div>
                <div className="flex w-full sm:w-auto items-center justify-center sm:justify-start gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-3 py-2 md:px-4 md:py-2.5 rounded-lg md:rounded-xl hover:border-amber-500/30 transition-colors">
                  <Target
                    size={12}
                    className="text-amber-500 md:w-[14px] md:h-[14px]"
                  />
                  <p className="text-white text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-center">
                    Sprint Mechanics Expert
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 🚀 SECTION 6: THE PROTOCOL (Glassmorphic Nodes) */}
      <section className="py-16 md:py-32 px-4 md:px-6 relative border-t border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16 md:mb-24 flex flex-col items-center"
          >
            <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white drop-shadow-lg">
              How It <span className="text-amber-500">Works</span>
            </h2>
          </motion.div>

          <div className="relative">
            <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-[2px] bg-white/10 z-0 rounded-full">
              <motion.div
                initial={{ x: "-100%" }}
                whileInView={{ x: "0%" }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                className="w-full h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]"
              />
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10 relative z-10"
            >
              {JOURNEY_STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="relative text-center space-y-4 md:space-y-6 group"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-black/60 backdrop-blur-2xl border border-white/20 rounded-full flex items-center justify-center text-xl md:text-2xl font-black italic text-white/70 group-hover:text-amber-500 group-hover:border-amber-500 transition-all shadow-lg">
                    {step.num}
                  </div>
                  <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-[16px] p-5 md:p-6 shadow-lg group-hover:bg-black/70 transition-colors">
                    <h3 className="text-base md:text-lg font-black uppercase tracking-tighter text-white italic mb-2 drop-shadow-md">
                      {step.title}
                    </h3>
                    <p className="text-[9px] md:text-[10px] font-bold text-white/60 uppercase tracking-widest leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 🗣️ SECTION 7: REVIEWS */}
      <section className="py-16 md:py-32 px-4 md:px-6 relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-10 md:mb-16 flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-center md:text-left">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
            >
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2 md:mb-4">
                <Shield className="text-amber-500 drop-shadow-lg" size={28} />
                <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white drop-shadow-lg">
                  Success <span className="text-amber-500">Stories</span>
                </h2>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="flex items-center gap-3"
            >
              <button
                onClick={() => scrollReviews("left")}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-95 shadow-lg"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scrollReviews("right")}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-amber-500 flex items-center justify-center text-black active:scale-95 shadow-lg"
              >
                <ChevronRight size={20} />
              </button>
            </motion.div>
          </div>

          <div
            ref={reviewScrollRef}
            className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {reviews.length > 0 ? (
              reviews.map((review, i) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "100px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="relative w-[85vw] md:w-[380px] h-[400px] md:h-[480px] shrink-0 snap-center rounded-[20px] md:rounded-[24px] overflow-hidden group shadow-2xl border border-white/10 bg-black/60 backdrop-blur-xl"
                >
                  {review.user?.profileImage ? (
                    <img
                      src={review.user.profileImage}
                      alt="Athlete"
                      className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-luminosity"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[12rem] font-black text-white/5 uppercase italic absolute -bottom-8 -right-8">
                        {review.user?.name?.[0] || "A"}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-90" />

                  <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 flex flex-col justify-end z-10">
                    <p className="text-xs md:text-sm font-bold text-white leading-relaxed italic mb-4 md:mb-6 line-clamp-6 drop-shadow-md">
                      "{review.content}"
                    </p>
                    <div className="flex items-center justify-between border-t border-white/20 pt-4">
                      <p className="text-[9px] md:text-[10px] font-black text-amber-500 uppercase tracking-widest drop-shadow-md">
                        {review.user?.name || "Anonymous Athlete"}
                      </p>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            size={10}
                            className={
                              index < (review.rating || 5)
                                ? "fill-amber-500 text-amber-500"
                                : "text-white/20"
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="w-full text-center py-16 text-white/40 text-[10px] font-black uppercase tracking-widest border border-dashed border-white/20 rounded-[20px] bg-black/40 backdrop-blur-md">
                No reviews available right now.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 📍 SECTION 8: LOCATION & CONTACT (Glassmorphic Cards) */}
      <section className="py-16 md:py-32 px-4 md:px-6 relative border-t border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-8 md:space-y-10"
          >
            <div className="text-center md:text-left space-y-3">
              <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white drop-shadow-lg">
                The <span className="text-amber-500">Address</span>
              </h2>
              <motion.p
                variants={fadeUp}
                className="text-[9px] md:text-[10px] font-black text-white/70 uppercase tracking-[0.3em] drop-shadow-md md:border-l-2 md:border-amber-500/50 md:pl-4"
              >
                Come visit us and see where the magic happens.
              </motion.p>
            </div>

            <div className="space-y-4">
              <motion.div
                variants={fadeUp}
                className="flex items-start gap-4 bg-black/50 backdrop-blur-2xl p-5 md:p-6 rounded-[20px] border border-white/10 shadow-lg"
              >
                <div className="h-10 w-10 md:h-12 md:w-12 bg-white/10 border border-white/20 rounded-[12px] flex items-center justify-center text-amber-500 flex-shrink-0 shadow-inner">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-amber-500 mb-1">
                    Headquarters
                  </p>
                  <p className="text-[10px] md:text-xs font-bold tracking-widest leading-relaxed text-white/90">
                    Athletic Zone
                    <br />
                    34A, opposite Hansa Palace Road
                    <br />
                    Narendra Nagar, Sector 4<br />
                    Gayariwas, Hiran Magri
                    <br />
                    Udaipur, Rajasthan 303001
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="flex items-center gap-4 bg-black/50 backdrop-blur-2xl p-5 md:p-6 rounded-[20px] border border-white/10 shadow-lg"
              >
                <div className="h-10 w-10 md:h-12 md:w-12 bg-white/10 border border-white/20 rounded-[12px] flex items-center justify-center text-amber-500 flex-shrink-0 shadow-inner">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-amber-500 mb-1">
                    Open Hours
                  </p>
                  <p className="text-[10px] md:text-xs font-bold tracking-widest text-white/90">
                    06:00 AM — 20:00 PM (Daily)
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="flex items-center gap-4 bg-black/50 backdrop-blur-2xl p-5 md:p-6 rounded-[20px] border border-white/10 shadow-lg"
              >
                <div className="h-10 w-10 md:h-12 md:w-12 bg-white/10 border border-white/20 rounded-[12px] flex items-center justify-center text-amber-500 flex-shrink-0 shadow-inner">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-amber-500 mb-1">
                    Contact Us
                  </p>
                  <p className="text-[10px] md:text-xs font-bold tracking-widest text-white/90">
                    +91 86192 55647
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="w-full h-[350px] md:h-[450px] bg-black/40 backdrop-blur-2xl rounded-[24px] border border-white/20 overflow-hidden shadow-2xl"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3628.5475739845874!2d73.7182282751422!3d24.570291878119853!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3967ef1e19cc92a7%3A0xcfa5ff23f205570f!2sAthletic%20zone!5e0!3m2!1sen!2sin!4v1772879873901!5m2!1sen!2sin"
              width="100%"
              height="100%"
              className="w-full h-full border-0 filter opacity-90 transition-opacity"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </section>

      {/* 🔥 SECTION 9: FINAL CONVERSION */}
      <section className="py-20 md:py-32 px-4 md:px-6 relative text-center border-t border-white/10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="relative z-10 w-full max-w-4xl mx-auto space-y-6 md:space-y-8 bg-black/60 backdrop-blur-3xl border border-white/20 p-8 md:p-14 lg:p-16 rounded-[2rem] shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
        >
          <h2 className="text-[2rem] leading-tight md:text-6xl font-black uppercase italic tracking-tighter text-white drop-shadow-2xl">
            Ready to Train Like <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-300">
              a Professional?
            </span>
          </h2>

          <motion.p
            variants={fadeUp}
            className="text-[9px] md:text-[11px] font-black text-white/80 uppercase tracking-[0.2em] md:tracking-[0.3em] leading-relaxed max-w-xl mx-auto drop-shadow-md"
          >
            Stop guessing. Start tracking. Create your account today and get
            access to world-class coaching.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="pt-4 md:pt-6 w-full flex justify-center"
          >
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-5 md:px-12 md:py-5 bg-amber-500 text-black text-[10px] md:text-xs font-black uppercase tracking-widest rounded-[16px] hover:bg-amber-400 transition-all shadow-[0_10px_30px_rgba(245,158,11,0.4)] active:scale-95"
            >
              Create Athlete Account <ChevronRight size={18} strokeWidth={3} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
