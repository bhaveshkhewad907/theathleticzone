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
const staggerContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

// The "Masked Reveal" effect
const maskedReveal: Variants = {
  hidden: {
    y: "120%",
    opacity: 0,
    filter: "blur(10px)",
  },
  visible: {
    y: "0%",
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, delay: 1.2, ease: "easeOut" },
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
      <section className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden bg-[#0B0F14]">
        {/* 1. Breathing Background Effect */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.img
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ duration: 12, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop"
            alt="Starting Blocks"
            className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F14] via-transparent to-[#0B0F14]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center space-y-8">
          {/* 2. The Floating Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              type: "spring",
              stiffness: 100,
            }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] shadow-inner"
          >
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
            Online Sprint Training Hub
          </motion.div>

          {/* 3. The Masked Title Reveal */}
          <motion.h1
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-6xl md:text-8xl lg:text-[10rem] font-black uppercase italic tracking-tighter leading-[0.85] text-white flex flex-col items-center"
          >
            {/* The overflow-hidden div creates the "invisible box" it slides out of */}
            <div className="overflow-hidden pb-4 md:pb-6">
              <motion.span
                variants={maskedReveal}
                className="block drop-shadow-2xl"
              >
                Dominate
              </motion.span>
            </div>
            <div className="overflow-hidden pb-4 md:pb-6">
              <motion.span
                variants={maskedReveal}
                className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-200 drop-shadow-[0_0_40px_rgba(245,158,11,0.3)]"
              >
                Your Sprint.
              </motion.span>
            </div>
          </motion.h1>

          {/* 4. The Subtitle Fade */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="max-w-2xl mx-auto text-[11px] md:text-sm text-[#8A94A6] font-bold uppercase tracking-[0.2em] leading-loose drop-shadow-md"
          >
            Expert coaching and smart training plans for the 100m & 200m track
            athlete. Built for sprinters who want to run faster and leave the
            competition behind.
          </motion.p>

          {/* 5. The Scroll Indicator */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
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

      {/* 🏆 SECTION 2: CTA CARD (Premium Framer Motion Upgrade) */}
      <section
        id="sprint-program"
        className="py-24 md:py-40 px-6 relative flex justify-center items-center overflow-hidden bg-[#0B0F14]"
      >
        {/* Subtle Ambient Section Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-[600px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

        {/* 🚀 By putting whileInView and staggerContainer on the main wrapper, all children animate in sequence! */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="relative z-10 w-full max-w-5xl rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] group border border-white/10 hover:border-amber-500/50 transition-colors duration-700"
        >
          {/* 🖼️ THE CARD'S OWN ATTRACTION IMAGE */}
          <div className="absolute inset-0 z-0">
            {/* Added a subtle scale-in animation to the image itself */}
            <motion.img
              variants={{
                hidden: { scale: 1.2, opacity: 0 },
                visible: {
                  scale: 1.05,
                  opacity: 0.4,
                  transition: { duration: 1.5, ease: "easeOut" },
                },
              }}
              src="https://images.unsplash.com/photo-1698671823406-035c77ff6fcd?q=80&w=715&auto=format&fit=crop&ixlib=rb-4.1.0"
              alt="Sprinter exploding off blocks"
              className="w-full h-full object-cover group-hover:scale-110 group-hover:opacity-60 transition-all duration-[2s] ease-out"
            />
            {/* Deep gradient overlay to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-[#0B0F14]/70 to-[#0B0F14]/30" />
            <div className="absolute inset-0 bg-amber-500/5 mix-blend-overlay group-hover:bg-amber-500/10 transition-colors duration-700" />
          </div>

          {/* ✨ CONTENT PAYLOAD */}
          <div className="relative z-10 p-10 md:p-20 flex flex-col items-center text-center">
            {/* Ambient Inner Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[150px] bg-amber-500/20 blur-[80px] pointer-events-none rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-700" />

            {/* Badge fading up */}
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-amber-500 mb-8 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
              Elite Track & Field Focus
            </motion.div>

            {/* Title using the Masked Reveal */}
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black italic uppercase tracking-tighter text-white mb-6 leading-[1.05] drop-shadow-2xl flex flex-col items-center">
              <div className="overflow-hidden pb-2 md:pb-4">
                <motion.span variants={maskedReveal} className="block">
                  Master the
                </motion.span>
              </div>
              <div className="overflow-hidden pb-4 md:pb-6">
                <motion.span
                  variants={maskedReveal}
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-200 drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]"
                >
                  100m & 200m Sprint
                </motion.span>
              </div>
            </h2>

            {/* Paragraph fading up */}
            <motion.p
              variants={fadeUp}
              className="text-[#8A94A6] text-sm md:text-lg font-medium leading-relaxed max-w-2xl mb-12 drop-shadow-md"
            >
              Ready to get faster? Take our quick assessment and let our system
              build the exact 6-week workout plan you need to perfect your form
              and shave critical milliseconds off your time.
            </motion.p>

            {/* 🚀 Button & Subtext fading up together */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col items-center w-full"
            >
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

              <p className="text-[10px] text-[#8A94A6] font-bold uppercase tracking-widest mt-6">
                Join 500+ Athletes Currently Enrolled
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 🧠 SECTION 3: FEATURES (Premium Framer Upgraded) */}
      <section className="py-20 md:py-32 px-6 relative overflow-hidden">
        {/* 1. Breathing Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 0.1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            viewport={{ once: true }}
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
            alt="Track Spikes"
            className="w-full h-full object-cover mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-[#0B0F14]/90 to-[#0B0F14]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header sequence controlled by staggerContainer */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-20 flex flex-col items-center"
          >
            <motion.div variants={fadeUp}>
              <Crosshair
                className="mx-auto text-amber-500 mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                size={40}
                strokeWidth={1.5}
              />
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white drop-shadow-lg flex flex-col items-center">
              <div className="overflow-hidden pb-2 md:pb-4">
                <motion.span variants={maskedReveal} className="block">
                  Smart <span className="text-amber-500">Training</span>
                </motion.span>
              </div>
            </h2>

            <motion.p
              variants={fadeUp}
              className="text-[10px] font-black text-[#8A94A6] uppercase tracking-[0.3em] mt-4 max-w-2xl mx-auto leading-relaxed drop-shadow-md"
            >
              We don't just run. We track, analyze, and build a plan to make you
              faster safely.
            </motion.p>
          </motion.div>

          {/* 🚀 The Grid Wave Reveal */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {INTELLIGENCE_FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeUp} // No hardcoded delay needed! The parent controls the timing perfectly.
                className="bg-[#0F1724]/60 backdrop-blur-xl border border-white/10 rounded-[24px] p-8 shadow-[0_15px_35px_rgba(0,0,0,0.5)] group hover:border-amber-500/50 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="h-14 w-14 rounded-[16px] bg-white/5 border border-white/10 flex items-center justify-center text-amber-500 mb-6 shadow-inner group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-black transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-black uppercase italic tracking-tighter text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-[10px] text-[#8A94A6] font-bold uppercase tracking-widest leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 🏟️ SECTION 4: GALLERY (Premium Upgrade) */}
      <section className="py-20 md:py-32 px-6 relative bg-[#0B0F14] overflow-hidden border-y border-white/5">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header Sequence */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mb-12 text-center flex flex-col items-center"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-[0.3em] mb-4 shadow-inner"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              Facility Feed
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white drop-shadow-lg flex flex-col items-center">
              <div className="overflow-hidden pb-2 md:pb-4">
                <motion.span variants={maskedReveal} className="block">
                  The <span className="text-amber-500">Facility</span>
                </motion.span>
              </div>
            </h2>
          </motion.div>

          {/* Gallery Grid Container */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            className="relative pt-6"
          >
            {/* 🚀 Premium Touch: The Cinematic Progress Indicator */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[2px] bg-white/10 rounded-full overflow-hidden flex">
              <motion.div
                key={galleryIndex} // This resets the animation perfectly every time the index changes
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, ease: "linear" }}
                className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-3 md:gap-4 md:h-[600px] w-full relative mt-4">
              <AnimatePresence mode="popLayout">
                {currentGallerySet.map((img, i) => {
                  const isHero = i === 0;
                  const gridClasses = isHero
                    ? "col-span-2 md:col-span-2 md:row-span-2 aspect-[16/10] md:aspect-auto"
                    : "col-span-1 md:col-span-1 md:row-span-1 aspect-square md:aspect-auto";

                  return (
                    <motion.div
                      key={img}
                      initial={{
                        opacity: 0,
                        filter: "blur(15px)",
                        scale: 1.05,
                      }}
                      animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                      exit={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
                      transition={{
                        duration: 1.2,
                        delay: i * 0.15, // Subtle cascading delay so they don't all pop in at the exact same millisecond
                        ease: [0.22, 1, 0.36, 1], // High-end Apple bezier curve
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
          </motion.div>
        </div>
      </section>

      {/* 🏅 SECTION 5: HEAD COACH (Editorial Premium Upgrade) */}
      <section className="py-24 md:py-40 px-6 relative overflow-hidden bg-[#0B0F14]">
        {/* Ambient Background Glow behind the coach */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[500px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative flex flex-col items-center z-10">
          {/* Header Sequence */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="mb-16 flex flex-col items-center text-center"
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-inner"
            >
              <Shield size={14} /> Leadership
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white flex flex-col items-center drop-shadow-lg">
              <div className="overflow-hidden pb-2 md:pb-4">
                <motion.span variants={maskedReveal} className="block">
                  Meet Your <span className="text-amber-500">Coach</span>
                </motion.span>
              </div>
            </h2>
          </motion.div>

          {/* 🚀 The Coach Profile - Magazine Style Layout */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="relative w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10 lg:gap-16"
          >
            {/* Left: The Image Portrait */}
            <motion.div
              variants={fadeUp}
              className="w-full md:w-1/2 relative group"
            >
              {/* Decorative Rotated Frame */}
              <div className="absolute -inset-4 border border-amber-500/20 rounded-[2rem] transform -rotate-3 group-hover:rotate-0 transition-transform duration-700 ease-out z-0 hidden md:block" />

              <div className="relative z-10 aspect-[4/5] rounded-[24px] overflow-hidden border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
                <img
                  src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=2069&auto=format&fit=crop"
                  alt="Head Coach Jitendra Saini"
                  className="absolute inset-0 w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[1.5s] ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/20 to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-700" />
              </div>
            </motion.div>

            {/* Right: The Editorial Bio */}
            <motion.div
              variants={staggerContainer}
              className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left z-10"
            >
              <motion.div
                variants={fadeUp}
                className="flex items-center gap-3 mb-6"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                  <Briefcase size={14} />
                </div>
                <span className="text-amber-500 text-xs font-black uppercase tracking-[0.3em] drop-shadow-md">
                  Head Sprint Coach
                </span>
              </motion.div>

              {/* Cinematic Name Reveal */}
              <h3 className="text-6xl lg:text-7xl font-black italic uppercase tracking-tighter text-white mb-6 drop-shadow-lg flex flex-col items-center md:items-start">
                <div className="overflow-hidden pb-1">
                  <motion.span variants={maskedReveal} className="block">
                    Jitendra
                  </motion.span>
                </div>
                <div className="overflow-hidden pb-2">
                  <motion.span
                    variants={maskedReveal}
                    className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400"
                  >
                    Saini
                  </motion.span>
                </div>
              </h3>

              {/* The Coach's Quote */}
              <motion.div variants={fadeUp} className="relative mb-8">
                <div className="absolute -top-6 -left-4 md:-left-8 text-6xl text-white/5 font-serif select-none hidden md:block">
                  "
                </div>
                <p className="text-[#8A94A6] text-sm md:text-base font-medium leading-relaxed italic relative z-10 md:pl-6 md:border-l-2 md:border-amber-500/30">
                  Speed is not just raw talent; it is a meticulously engineered
                  skill. My mission is to strip away the guesswork, refine your
                  biomechanics, and unlock the absolute fastest version of
                  yourself on the track.
                </p>
              </motion.div>

              {/* Accolades */}
              <motion.div
                variants={fadeUp}
                className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-6"
              >
                <div className="flex items-center gap-2 bg-[#0F1724]/60 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-xl hover:border-amber-500/30 transition-colors">
                  <Award size={16} className="text-amber-500" />
                  <p className="text-white text-[10px] font-bold uppercase tracking-widest">
                    4+ Years Elite Track Experience
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-[#0F1724]/60 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-xl hover:border-amber-500/30 transition-colors">
                  <Target size={16} className="text-amber-500" />
                  <p className="text-white text-[10px] font-bold uppercase tracking-widest">
                    Biomechanics Specialist
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* 🚀 SECTION 6: THE PROTOCOL (Animated Timeline Upgrade) */}
      <section className="py-24 md:py-32 px-6 relative overflow-hidden border-t border-white/5 bg-[#0B0F14]">
        {/* 1. Breathing Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 0.1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            viewport={{ once: true }}
            src="https://images.unsplash.com/photo-1519833159155-7380963ce5d7?q=80&w=2070&auto=format&fit=crop"
            alt="Stopwatch"
            className="w-full h-full object-cover mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F14] via-[#0B0F14]/80 to-[#0B0F14]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header Sequence */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-24 flex flex-col items-center"
          >
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white drop-shadow-lg flex flex-col items-center">
              <div className="overflow-hidden pb-2 md:pb-4">
                <motion.span variants={maskedReveal} className="block">
                  How It <span className="text-amber-500">Works</span>
                </motion.span>
              </div>
            </h2>
          </motion.div>

          <div className="relative">
            {/* 🚀 The Animated Connecting Line (Desktop Only) */}
            <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-[2px] bg-white/5 z-0 overflow-hidden rounded-full">
              <motion.div
                initial={{ x: "-100%" }}
                whileInView={{ x: "0%" }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                className="w-full h-full bg-gradient-to-r from-transparent via-amber-500 to-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]"
              />
            </div>

            {/* The Timeline Nodes */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10"
            >
              {JOURNEY_STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="relative text-center space-y-6 group"
                >
                  {/* The Node Circle */}
                  <div className="w-20 h-20 mx-auto bg-[#0F1724] backdrop-blur-xl border-2 border-white/10 rounded-full flex items-center justify-center text-2xl font-black italic text-white/50 group-hover:text-amber-500 group-hover:border-amber-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all duration-500 relative">
                    {/* Inner glowing pulse on hover */}
                    <div className="absolute inset-2 rounded-full bg-amber-500/0 group-hover:bg-amber-500/10 transition-colors duration-500" />
                    {step.num}
                  </div>

                  {/* The Content Box */}
                  <div className="bg-[#0F1724]/40 backdrop-blur-md border border-white/5 rounded-[16px] p-6 shadow-lg group-hover:bg-[#0F1724]/60 group-hover:border-white/10 transition-colors duration-500">
                    <h3 className="text-lg font-black uppercase tracking-tighter text-white italic mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[10px] font-bold text-[#8A94A6] uppercase tracking-widest leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 🗣️ SECTION 7: REVIEWS (Cinematic Poster Upgrade) */}
      <section className="py-24 md:py-32 px-6 relative overflow-hidden border-t border-white/5 bg-[#0B0F14]">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header & Controls Sequence */}
          <div className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div
                variants={fadeUp}
                className="flex items-center gap-4 mb-4"
              >
                <Shield
                  className="text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  size={32}
                />
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white drop-shadow-lg flex flex-col">
                  <div className="overflow-hidden pb-1">
                    <motion.span variants={maskedReveal} className="block">
                      Success
                    </motion.span>
                  </div>
                  <div className="overflow-hidden pb-2">
                    <motion.span
                      variants={maskedReveal}
                      className="block text-amber-500"
                    >
                      Stories
                    </motion.span>
                  </div>
                </h2>
              </motion.div>
            </motion.div>

            {/* Slider Controls */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex items-center gap-3"
            >
              <button
                onClick={() => scrollReviews("left")}
                className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 hover:border-amber-500/50 flex items-center justify-center text-white transition-all active:scale-95"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scrollReviews("right")}
                className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 flex items-center justify-center text-black transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              >
                <ChevronRight size={20} />
              </button>
            </motion.div>
          </div>

          {/* The Horizontal Slider */}
          <div
            ref={reviewScrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {reviews.length > 0 ? (
              reviews.map((review, i) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "100px" }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.1,
                    ease: "easeOut",
                  }}
                  className="relative w-[85vw] md:w-[380px] h-[480px] shrink-0 snap-start rounded-[24px] overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 hover:border-amber-500/40 transition-all duration-500 cursor-grab active:cursor-grabbing"
                >
                  {/* 🖼️ BACKGROUND IMAGE OR FALLBACK */}
                  {review.user?.profileImage ? (
                    <img
                      src={review.user.profileImage}
                      alt={review.user?.name || "Athlete"}
                      className="absolute inset-0 w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#121824] to-[#0B0F14] flex items-center justify-center overflow-hidden">
                      {/* Giant Watermark Initial */}
                      <span className="text-[15rem] font-black text-white/5 uppercase italic absolute -bottom-10 -right-10 select-none group-hover:text-amber-500/10 transition-colors duration-500">
                        {review.user?.name?.[0] || "A"}
                      </span>
                    </div>
                  )}

                  {/* 🌑 DARK TO IMAGE FADING OVERLAY */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-[#0B0F14]/80 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/10 mix-blend-overlay transition-colors duration-500" />

                  {/* ✨ CONTENT (Locked to the Bottom) */}
                  <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col justify-end z-10">
                    {/* The Review Text */}
                    <p className="text-sm md:text-base font-medium text-white leading-relaxed italic mb-6 line-clamp-5 relative">
                      <span className="absolute -top-4 -left-3 text-4xl text-amber-500/30 font-serif">
                        "
                      </span>
                      {review.content}
                    </p>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between border-t border-white/10 pt-5">
                      <div>
                        <p className="text-[11px] font-black text-white uppercase tracking-widest drop-shadow-md">
                          {review.user?.name || "Anonymous Athlete"}
                        </p>
                        <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] mt-1 drop-shadow-md">
                          {review.sport}
                        </p>
                      </div>

                      {/* Star Rating */}
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, index) => (
                          <Star
                            key={index}
                            size={12}
                            className={
                              index < (review.rating || 5)
                                ? "fill-amber-500 text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]"
                                : "text-white/10"
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="w-full text-center py-20 text-white/30 text-xs font-black uppercase tracking-widest border border-dashed border-white/10 rounded-[24px]">
                No reviews available right now.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 📍 SECTION 8: LOCATION & CONTACT (Premium Upgrade) */}
      <section className="py-24 md:py-32 px-6 relative overflow-hidden border-t border-white/5 bg-[#0B0F14]">
        {/* Ambient Background Glow */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* 👈 Left Side: Contact Info Staggered Reveal */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="space-y-10"
          >
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase italic tracking-tighter text-white drop-shadow-lg flex flex-col">
                <div className="overflow-hidden pb-1">
                  <motion.span variants={maskedReveal} className="block">
                    The
                  </motion.span>
                </div>
                <div className="overflow-hidden pb-4">
                  <motion.span
                    variants={maskedReveal}
                    className="block text-amber-500"
                  >
                    Address
                  </motion.span>
                </div>
              </h2>
              <motion.p
                variants={fadeUp}
                className="text-[10px] md:text-xs font-black text-[#8A94A6] uppercase tracking-[0.3em] drop-shadow-md border-l-2 border-amber-500/30 pl-4"
              >
                Come visit us and see where the magic happens.
              </motion.p>
            </div>

            <div className="space-y-4">
              {/* Address Card */}
              <motion.div
                variants={fadeUp}
                className="group flex items-start gap-5 bg-[#0F1724]/60 backdrop-blur-xl p-6 rounded-[20px] border border-white/10 shadow-lg hover:border-amber-500/50 hover:bg-[#0F1724]/80 transition-all duration-500"
              >
                <div className="h-12 w-12 bg-white/5 border border-white/10 rounded-[12px] flex items-center justify-center text-amber-500 flex-shrink-0 group-hover:bg-amber-500 group-hover:text-black group-hover:scale-110 transition-all duration-500 shadow-inner">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8A94A6] mb-2 group-hover:text-amber-500 transition-colors">
                    Headquarters
                  </p>
                  <p className="text-xs md:text-sm font-bold tracking-wider leading-relaxed text-white/80 group-hover:text-white transition-colors">
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

              {/* Hours Card */}
              <motion.div
                variants={fadeUp}
                className="group flex items-center gap-5 bg-[#0F1724]/60 backdrop-blur-xl p-6 rounded-[20px] border border-white/10 shadow-lg hover:border-amber-500/50 hover:bg-[#0F1724]/80 transition-all duration-500"
              >
                <div className="h-12 w-12 bg-white/5 border border-white/10 rounded-[12px] flex items-center justify-center text-amber-500 flex-shrink-0 group-hover:bg-amber-500 group-hover:text-black group-hover:scale-110 transition-all duration-500 shadow-inner">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8A94A6] mb-2 group-hover:text-amber-500 transition-colors">
                    Open Hours
                  </p>
                  <p className="text-xs md:text-sm font-bold tracking-wider text-white/80 group-hover:text-white transition-colors">
                    06:00 AM — 20:00 PM (Daily)
                  </p>
                </div>
              </motion.div>

              {/* Phone Card */}
              <motion.div
                variants={fadeUp}
                className="group flex items-center gap-5 bg-[#0F1724]/60 backdrop-blur-xl p-6 rounded-[20px] border border-white/10 shadow-lg hover:border-amber-500/50 hover:bg-[#0F1724]/80 transition-all duration-500"
              >
                <div className="h-12 w-12 bg-white/5 border border-white/10 rounded-[12px] flex items-center justify-center text-amber-500 flex-shrink-0 group-hover:bg-amber-500 group-hover:text-black group-hover:scale-110 transition-all duration-500 shadow-inner">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#8A94A6] mb-2 group-hover:text-amber-500 transition-colors">
                    Contact Us
                  </p>
                  <p className="text-xs md:text-sm font-bold tracking-wider text-white/80 group-hover:text-white transition-colors">
                    +91 86192 55647
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* 👉 Right Side: The Interactive Map Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative group h-full flex items-center"
          >
            {/* Decorative Offset Frame */}
            <div className="absolute -inset-4 border border-amber-500/20 rounded-[32px] transform rotate-2 group-hover:rotate-0 transition-transform duration-700 ease-out z-0 hidden md:block" />

            {/* Glass Container */}
            <div className="w-full h-[400px] md:h-[500px] bg-[#0F1724] rounded-[24px] border border-white/10 overflow-hidden relative shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-10 group-hover:border-amber-500/40 transition-colors duration-700">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3628.5475739845874!2d73.7182282751422!3d24.570291878119853!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3967ef1e19cc92a7%3A0xcfa5ff23f205570f!2sAthletic%20zone!5e0!3m2!1sen!2sin!4v1772879873901!5m2!1sen!2sin"
                width="100%"
                height="100%"
                // The map sits in grayscale and jumps to color on hover!
                className="w-full h-full border-0 filter contrast-125 opacity-80 grayscale-[0.6] group-hover:filter-none group-hover:opacity-100 transition-all duration-700"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              {/* Subtle amber overlay to blend the map into the theme */}
              <div className="absolute inset-0 bg-amber-500/5 pointer-events-none mix-blend-overlay group-hover:bg-transparent transition-colors duration-700" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 🔥 SECTION 9: FINAL CONVERSION (Premium Mobile-Optimized Upgrade) */}
      <section className="py-24 md:py-40 px-4 md:px-6 relative overflow-hidden text-center border-t border-white/5 bg-[#0B0F14]">
        {/* Breathing Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 0.2 }}
            transition={{ duration: 3, ease: "easeOut" }}
            viewport={{ once: true }}
            src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop"
            alt="Final Sprint"
            className="w-full h-full object-cover mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-[#0B0F14]/70 backdrop-blur-md" />
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-amber-500/20 blur-[150px] rounded-full pointer-events-none" />

        {/* Main CTA Card - Mobile Structure Kept 100% Intact */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="relative z-10 w-full max-w-4xl mx-auto space-y-8 md:space-y-10 bg-[#0F1724]/60 backdrop-blur-2xl border border-white/10 hover:border-amber-500/30 transition-colors duration-700 p-8 md:p-14 lg:p-16 rounded-[2rem] shadow-[0_40px_80px_rgba(0,0,0,0.8)]"
        >
          {/* Headline with Masked Reveal */}
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase italic tracking-tighter text-white leading-[1.1] md:leading-tight drop-shadow-2xl flex flex-col items-center">
            <div className="overflow-hidden pb-1 md:pb-2">
              <motion.span variants={maskedReveal} className="block">
                Ready to Train Like
              </motion.span>
            </div>
            <div className="overflow-hidden pb-2 md:pb-4">
              <motion.span
                variants={maskedReveal}
                className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-300 drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]"
              >
                a Professional?
              </motion.span>
            </div>
          </h2>

          <motion.p
            variants={fadeUp}
            className="text-[10px] md:text-xs font-black text-gray-300 uppercase tracking-[0.2em] md:tracking-[0.3em] leading-relaxed md:leading-loose max-w-2xl mx-auto drop-shadow-md"
          >
            Stop guessing. Start tracking. Create your account today and get
            access to world-class coaching and personalized training.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="pt-4 md:pt-8 w-full flex justify-center"
          >
            {/* The w-full sm:w-auto and gap classes guarantee the mobile button stays exactly the same */}
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
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
