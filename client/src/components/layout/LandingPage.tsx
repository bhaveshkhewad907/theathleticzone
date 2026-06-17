import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  sport: string;
  user?: {
    name: string;
    profileImage?: string;
  };
}

/* ==========================================================================
   Data Registries (Easy English Updates)
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
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const cinematicReveal = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
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
      `https://media.theathleticzone.in/center-images/center-image-${index + 1}.jpg`,
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
    <div className="min-h-screen text-[#E5E7EB] font-sans selection:bg-amber-500/30 overflow-x-hidden bg-[#0B0F14]">
      {/* 🟢 FLOATING WHATSAPP CTA */}
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-8 right-8 z-[100] group flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-full shadow-[0_10px_30px_rgba(34,197,94,0.4)] hover:scale-110 hover:shadow-[0_15px_40px_rgba(34,197,94,0.6)] transition-all duration-300"
      >
        <MessageCircle size={32} strokeWidth={2.5} />
        <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-ping opacity-20" />
      </a>

      {/* 💎 GLASSMORPHISM NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-[#0F1724]/40 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.02)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div
            className="flex items-center gap-4 group cursor-pointer"
            onClick={() => window.scrollTo(0, 0)}
          >
            <div className="h-12 w-12 bg-amber-500/10 border border-amber-500/20 rounded-[14px] flex items-center justify-center shadow-inner group-hover:bg-amber-500 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all duration-500">
              <span className="text-amber-500 group-hover:text-black font-black text-2xl italic tracking-tighter transition-colors">
                AZ
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic leading-none hidden sm:block text-white">
              The Athletic <span className="text-amber-500">Zone</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <Link
              to="/register"
              className="text-[11px] font-black uppercase tracking-widest text-[#8A94A6] hover:text-white transition-colors hidden sm:block"
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
      <section className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden">
        {/* Unique Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop"
            alt="Starting Blocks"
            className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F14] via-transparent to-[#0B0F14]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] shadow-inner"
          >
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
            Online Sprint Training Hub
          </motion.div>

          <motion.h1
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-6xl md:text-8xl lg:text-[10rem] font-black uppercase italic tracking-tighter leading-[0.85] text-white"
          >
            <motion.span
              variants={cinematicReveal}
              className="block drop-shadow-2xl"
            >
              Dominate
            </motion.span>
            <motion.span
              variants={cinematicReveal}
              className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-200 drop-shadow-[0_0_40px_rgba(245,158,11,0.3)]"
            >
              Your Sprint.
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="max-w-2xl mx-auto text-[11px] md:text-sm text-gray-300 font-bold uppercase tracking-[0.2em] leading-loose drop-shadow-md"
          >
            Expert coaching and smart training plans for the 100m & 200m track
            athlete. Built for sprinters who want to run faster and leave the
            competition behind.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1 }}
            className="pt-12 flex justify-center"
          >
            <a
              href="#sprint-program"
              className="group flex flex-col items-center gap-3 text-white/50 hover:text-amber-500 transition-colors"
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

      {/* 🏆 SECTION 2: CTA CARD (Upgraded & Irresistible) */}
      <section
        id="sprint-program"
        className="py-24 md:py-40 px-6 relative flex justify-center items-center overflow-hidden bg-[#0B0F14]"
      >
        {/* Subtle Ambient Section Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-[600px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] group border border-white/10 hover:border-amber-500/50 transition-all duration-700"
        >
          {/* 🖼️ THE CARD'S OWN ATTRACTION IMAGE */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1698671823406-035c77ff6fcd?q=80&w=715&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Sprinter exploding off blocks"
              className="w-full h-full object-cover opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-[2s] ease-out"
            />
            {/* Deep gradient overlay to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-[#0B0F14]/70 to-[#0B0F14]/30" />
            <div className="absolute inset-0 bg-amber-500/5 mix-blend-overlay group-hover:bg-amber-500/10 transition-colors duration-700" />
          </div>

          {/* ✨ CONTENT PAYLOAD */}
          <div className="relative z-10 p-10 md:p-20 flex flex-col items-center text-center">
            {/* Ambient Inner Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[150px] bg-amber-500/20 blur-[80px] pointer-events-none rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-amber-500 mb-8 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
              Elite Track & Field Focus
            </div>

            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black italic uppercase tracking-tighter text-white mb-6 leading-[1.05] drop-shadow-2xl">
              Master the <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-200 drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                100m & 200m Sprint
              </span>
            </h2>

            <p className="text-gray-300 text-sm md:text-lg font-medium leading-relaxed max-w-2xl mb-12 drop-shadow-md">
              Ready to get faster? Take our quick assessment and let our system
              build the exact 6-week workout plan you need to perfect your form
              and shave critical milliseconds off your time.
            </p>

            {/* 🚀 HYPER-ATTRACTIVE BUTTON */}
            <button
              onClick={() => navigate("/register")}
              className="relative overflow-hidden px-10 py-5 md:px-14 md:py-6 bg-amber-500 text-black font-black text-sm md:text-base uppercase tracking-widest rounded-[20px] hover:bg-amber-400 transition-all shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:shadow-[0_0_60px_rgba(245,158,11,0.6)] active:scale-95 flex items-center gap-3 group/btn"
            >
              <span className="relative z-10 flex items-center gap-3">
                Unlock Your Plan
                <ArrowRight
                  size={22}
                  className="group-hover/btn:translate-x-2 transition-transform duration-300"
                />
              </span>
              {/* Shimmer Light Sweep Effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover/btn:animate-[shimmer_1.5s_infinite]" />
            </button>

            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-6">
              Join 500+ Athletes Currently Enrolled
            </p>
          </div>
        </motion.div>
      </section>

      {/* 🧠 SECTION 3: FEATURES */}
      <section className="py-20 md:py-32 px-6 relative overflow-hidden">
        {/* Unique Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
            alt="Track Spikes"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-[#0B0F14]/80 to-[#0B0F14]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <Crosshair
              className="mx-auto text-amber-500 mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
              size={40}
              strokeWidth={1.5}
            />
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white drop-shadow-lg">
              Smart <span className="text-amber-500">Training</span>
            </h2>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-4 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              We don't just run. We track, analyze, and build a plan to make you
              faster safely.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {INTELLIGENCE_FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#0F1724]/60 backdrop-blur-xl border border-white/10 rounded-[24px] p-8 shadow-[0_15px_35px_rgba(0,0,0,0.5)] group hover:border-amber-500/50 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="h-14 w-14 rounded-[16px] bg-white/5 border border-white/10 flex items-center justify-center text-amber-500 mb-6 shadow-inner group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-black transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-black uppercase italic tracking-tighter text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 🏟️ SECTION 4: GALLERY */}
      <section className="py-20 md:py-32 px-6 relative bg-[#0B0F14] overflow-hidden border-y border-white/5">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-12 text-center flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-[0.3em] mb-4 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              Facility Feed
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white drop-shadow-lg">
              The <span className="text-amber-500">Facility</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-3 md:gap-4 md:h-[600px] w-full relative">
            <AnimatePresence mode="popLayout">
              {currentGallerySet.map((img, i) => {
                const isHero = i === 0;
                const gridClasses = isHero
                  ? "col-span-2 md:col-span-2 md:row-span-2 aspect-[16/10] md:aspect-auto"
                  : "col-span-1 md:col-span-1 md:row-span-1 aspect-square md:aspect-auto";

                return (
                  <motion.div
                    key={img}
                    initial={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }}
                    animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                    exit={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
                    transition={{
                      duration: 1.8,
                      delay: i * 0.4,
                      ease: "easeInOut",
                    }}
                    className={`relative rounded-[16px] md:rounded-[24px] overflow-hidden group shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/[0.05] ${gridClasses}`}
                  >
                    <img
                      src={img}
                      alt={`Facility View ${i}`}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] opacity-70 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14]/90 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-700" />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 🏅 SECTION 5: HEAD COACH */}
      <section className="py-20 md:py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative flex flex-col items-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 flex flex-col items-center text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <Shield size={14} /> Leadership
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">
              Meet Your <span className="text-amber-500">Coach</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group relative w-full max-w-md bg-[#0F1724]/60 backdrop-blur-xl border border-white/10 rounded-[24px] overflow-hidden hover:border-amber-500/50 transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
          >
            <div className="aspect-[4/5] relative overflow-hidden group">
              <img
                src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2069&auto=format&fit=crop"
                alt="Head Coach"
                className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="relative overflow-hidden rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl p-6 shadow-2xl transition-all duration-500 group-hover:bg-white/20 group-hover:border-amber-500/50">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-black">
                      <Briefcase size={10} />
                    </div>
                    <span className="text-amber-500 text-[9px] font-black uppercase tracking-[0.3em] drop-shadow-md">
                      Head Sprint Coach
                    </span>
                  </div>
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-4 drop-shadow-lg">
                    Jitendra Saini
                  </h3>
                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <div className="flex items-center gap-2">
                      <Award
                        size={14}
                        className="text-white group-hover:text-amber-500 transition-colors duration-300"
                      />
                      <p className="text-white text-[11px] font-bold uppercase tracking-widest transition-colors duration-300">
                        4+ Years Elite Track Experience
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 🚀 SECTION 6: THE PROTOCOL */}
      <section className="py-20 md:py-32 px-6 relative overflow-hidden border-t border-white/5">
        {/* Unique Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1519833159155-7380963ce5d7?q=80&w=2070&auto=format&fit=crop"
            alt="Stopwatch"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-[#0B0F14]/40 backdrop-blur-sm" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F14] via-transparent to-[#0B0F14]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white drop-shadow-lg">
              How It <span className="text-amber-500">Works</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 relative">
            <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent z-0" />
            {JOURNEY_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative z-10 text-center space-y-6"
              >
                <div className="w-20 h-20 mx-auto bg-[#0F1724]/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-2xl font-black italic text-amber-500 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative group hover:scale-110 transition-transform">
                  <div className="absolute inset-0 rounded-full border border-amber-500/0 group-hover:border-amber-500/50 transition-colors duration-500" />
                  {step.num}
                </div>
                <div className="bg-[#0F1724]/40 backdrop-blur-md border border-white/5 rounded-[16px] p-6 shadow-lg">
                  <h3 className="text-lg font-black uppercase tracking-tighter text-white italic mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 🗣️ SECTION 7: REVIEWS */}
      <section className="py-20 md:py-32 px-6 relative overflow-hidden border-t border-white/5">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex items-center gap-4"
            >
              <Shield
                className="text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                size={32}
              />
              <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white drop-shadow-lg">
                Success <span className="text-amber-500">Stories</span>
              </h2>
            </motion.div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => scrollReviews("left")}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 hover:border-amber-500/50 flex items-center justify-center text-white transition-all active:scale-95"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scrollReviews("right")}
                className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 flex items-center justify-center text-black transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div
            ref={reviewScrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {reviews.length > 0 ? (
              reviews.map((review, i) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-[85vw] md:w-[400px] shrink-0 snap-start bg-[#0F1724]/60 backdrop-blur-xl p-8 rounded-[24px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col justify-between hover:border-amber-500/40 transition-colors"
                >
                  <p className="text-sm font-medium text-white leading-loose italic mb-8">
                    "{review.content}"
                  </p>
                  <div className="flex items-center gap-4 border-t border-white/10 pt-6">
                    {review.user?.profileImage ? (
                      <img
                        src={review.user.profileImage}
                        alt="User"
                        className="w-10 h-10 rounded-full object-cover border border-white/20 shadow-inner"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500 font-black italic border border-amber-500/40 shadow-inner">
                        {review.user?.name?.[0] || "A"}
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] font-black text-white uppercase tracking-widest">
                        {review.user?.name || "Anonymous Athlete"}
                      </p>
                      <p className="text-[9px] font-black text-amber-500/80 uppercase tracking-[0.2em] mt-1">
                        {review.sport}
                      </p>
                    </div>
                    <div className="flex gap-1 pl-4">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          size={14}
                          className={
                            index < (review.rating || 5)
                              ? "fill-amber-500 text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]"
                              : "text-white/10"
                          }
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="w-full text-center py-10 text-white/30 text-xs font-black uppercase tracking-widest">
                No reviews available right now.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 📍 SECTION 8: LOCATION & CONTACT */}
      <section className="py-24 px-6 relative overflow-hidden border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-4 drop-shadow-lg">
                The <span className="text-amber-500">Address</span>
              </h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] drop-shadow-md">
                Come visit us and see where the magic happens.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-[#0F1724]/60 backdrop-blur-xl p-5 rounded-[16px] border border-white/10 shadow-lg hover:border-amber-500/40 transition-colors">
                <div className="h-10 w-10 bg-amber-500 rounded-[10px] flex items-center justify-center text-black flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">
                    Address
                  </p>
                  <p className="text-xs font-bold text-white tracking-wider leading-relaxed">
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
              </div>
              <div className="flex items-center gap-4 bg-[#0F1724]/60 backdrop-blur-xl p-5 rounded-[16px] border border-white/10 shadow-lg hover:border-amber-500/40 transition-colors">
                <div className="h-10 w-10 bg-amber-500 rounded-[10px] flex items-center justify-center text-black flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">
                    Open Hours
                  </p>
                  <p className="text-xs font-bold text-white tracking-wider">
                    06:00 AM — 20:00 PM (Daily)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-[#0F1724]/60 backdrop-blur-xl p-5 rounded-[16px] border border-white/10 shadow-lg hover:border-amber-500/40 transition-colors">
                <div className="h-10 w-10 bg-amber-500 rounded-[10px] flex items-center justify-center text-black flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">
                    Contact Us
                  </p>
                  <p className="text-xs font-bold text-white tracking-wider">
                    +91 86192 55647
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="h-[450px] bg-black/60 rounded-[24px] border border-white/20 overflow-hidden relative shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex items-center justify-center"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3628.5475739845874!2d73.7182282751422!3d24.570291878119853!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3967ef1e19cc92a7%3A0xcfa5ff23f205570f!2sAthletic%20zone!5e0!3m2!1sen!2sin!4v1772879873901!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "contrast(1.2)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </section>

      {/* 🔥 SECTION 9: FINAL CONVERSION */}
      <section className="py-24 md:py-40 px-4 md:px-6 relative overflow-hidden text-center border-t border-white/5">
        {/* Unique Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop"
            alt="Final Sprint"
            className="w-full h-full object-cover opacity-20 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-[#0B0F14]/70 backdrop-blur-md" />
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-amber-500/20 blur-[150px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative z-10 w-full max-w-4xl mx-auto space-y-8 md:space-y-10 bg-[#0F1724]/60 backdrop-blur-2xl border border-white/10 p-8 md:p-14 lg:p-16 rounded-[2rem] shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
        >
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase italic tracking-tighter text-white leading-[1.1] md:leading-tight drop-shadow-2xl">
            Ready to Train Like <br className="hidden md:block" /> a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-300 drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]">
              Professional?
            </span>
          </h2>

          <p className="text-[10px] md:text-xs font-black text-gray-300 uppercase tracking-[0.2em] md:tracking-[0.3em] leading-relaxed md:leading-loose max-w-2xl mx-auto drop-shadow-md">
            Stop guessing. Start tracking. Create your account today and get
            access to world-class coaching and personalized training.
          </p>

          <div className="pt-4 md:pt-8 w-full flex justify-center">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-5 md:px-14 md:py-6 bg-amber-500 text-black text-[11px] md:text-sm font-black uppercase tracking-widest rounded-[16px] hover:bg-amber-400 transition-all shadow-[0_15px_40px_rgba(245,158,11,0.3)] hover:shadow-[0_20px_50px_rgba(245,158,11,0.5)] active:scale-95 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <span className="relative z-10 flex items-center gap-2">
                Create Athlete Account
                <ChevronRight
                  size={18}
                  strokeWidth={3}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </span>
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
