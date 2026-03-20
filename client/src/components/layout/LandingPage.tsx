import { Link } from "react-router-dom";
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
  X,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import api from "../../services/api";
import Footer from "./Footer";

interface SportSector {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
}

interface CoachRoster {
  _id: string;
  name: string;
  profileImage: string;
  title: string;
  experience: string;
}

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
   Data Registries & Animation Variants
   ========================================================================== */

const INTELLIGENCE_FEATURES = [
  {
    icon: <Activity size={24} />,
    title: "Performance Tracking",
    desc: "Real-time biometric and tactical load monitoring.",
  },
  {
    icon: <BarChart3 size={24} />,
    title: "Attendance Analytics",
    desc: "Volume consistency and dedication metrics.",
  },
  {
    icon: <Target size={24} />,
    title: "Coach Feedback",
    desc: "Encrypted post-deployment action debriefs.",
  },
  {
    icon: <TrendingUp size={24} />,
    title: "Progress Trajectory",
    desc: "Visualized improvement over 30-day cycles.",
  },
];

const JOURNEY_STEPS = [
  {
    num: "01",
    title: "Establish Identity",
    desc: "Register your secure profile.",
  },
  {
    num: "02",
    title: "Sector Selection",
    desc: "Lock in your primary sport discipline.",
  },
  {
    num: "03",
    title: "Live Deployment",
    desc: "Join technical clusters or 1:1s.",
  },
  { num: "04", title: "Analyze & Adapt", desc: "Review performance ledgers." },
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
      // 🛡️ THE FIX: This forces TS to read it as a specific 4-number bezier curve
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

/* ==========================================================================
   Main Component
   ========================================================================== */
export default function LandingPage() {
  const WHATSAPP_NUMBER = "+919680223777";
  const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=Hello,%20I%20am%20interested%20in%20joining%20The%20Athletic%20Zone.%20Could%20I%20please%20request%20more%20information%20regarding%20your%20training%20sectors%20and%20facility%20access?`;
  const [sectors, setSectors] = useState<SportSector[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [selectedSector, setSelectedSector] = useState<SportSector | null>(
    null,
  );

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleSectorScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;

      // If scrollLeft is greater than 0, we can scroll back left
      setCanScrollLeft(scrollLeft > 0);

      // If scrollLeft + what we see (clientWidth) is less than the total width, we can still scroll right.
      // (We subtract 5px as a buffer because some browsers calculate decimals weirdly)
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 5);
    }
  };

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

  const scrollNext = () => {
    if (scrollContainerRef.current) {
      // Scrolls exactly one card width + gap
      const scrollAmount = scrollContainerRef.current.offsetWidth / 4;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount * 2,
        behavior: "smooth",
      });
    }
  };

  const scrollPrev = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.offsetWidth / 4;
      scrollContainerRef.current.scrollBy({
        left: -(scrollAmount * 2),
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
    // Automatically swap to the next 5 images every 5 seconds
    const interval = setInterval(() => {
      setGalleryIndex((prev) => (prev + 1) % facilitySlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [facilitySlides.length]);

  const currentGallerySet = facilitySlides[galleryIndex] || [];

  useEffect(() => {
    const fetchPublicSports = async () => {
      try {
        const res = await api.get("/sports");
        setSectors(res.data.data);

        // 🚀 THE FIX: Check arrow visibility after data loads (slight delay to let React paint the UI)
        setTimeout(() => handleSectorScroll(), 150);
      } catch (error) {
        console.error("Failed to fetch sports sectors", error);
      }
    };
    fetchPublicSports();

    // Also re-check if the user resizes their browser window!
    window.addEventListener("resize", handleSectorScroll);
    return () => window.removeEventListener("resize", handleSectorScroll);
  }, []);

  const [coaches, setCoaches] = useState<CoachRoster[]>([]);
  const coachScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch dynamic coaches
    api.get("/users/coaches/public").then((res) => setCoaches(res.data.data));
  }, []);

  const scrollCoachNext = () => {
    if (coachScrollRef.current) {
      coachScrollRef.current.scrollBy({
        left: coachScrollRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
  };

  const scrollCoachPrev = () => {
    if (coachScrollRef.current) {
      coachScrollRef.current.scrollBy({
        left: -coachScrollRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen text-[#E5E7EB] font-sans selection:bg-amber-500/30 overflow-x-hidden relative">
      {/* 🎬 GLOBAL CINEMATIC BACKGROUND SYSTEM */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[#0F1724]">
        {/* 📱 MOBILE VIEW: Static Image Fallback (Massive Scroll Performance Boost) */}
        <img
          src="https://media.theathleticzone.in/Landing%20page%20background%20video/poster-image%20(1).avif"
          alt="The Athletic Zone Background"
          className="absolute inset-0 w-full h-full object-cover opacity-40 md:hidden"
        />

        {/* 💻 DESKTOP VIEW: Full Premium Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          src="https://media.theathleticzone.in/Landing%20page%20background%20video/TAZ-Hero-section-bg%20(1).mp4"
          className="hidden md:block absolute inset-0 w-full h-full object-cover opacity-40"
          poster="https://media.theathleticzone.in/Landing%20page%20background%20video/poster-image%20(1).avif"
        />

        {/* Layer 1: Deep Navy/Charcoal Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F1724]/95 via-[#0B0F14]/80 to-[#0F1724]/95 mix-blend-multiply" />

        {/* Layer 2: Dark Vignette Edge Blur */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0B0F14_100%)] opacity-90" />

        {/* Layer 3: Cinematic Atmospheric Light Beams */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-amber-500/10 blur-[150px] rounded-full animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[150px] rounded-full animate-[pulse_10s_ease-in-out_infinite_reverse]" />

        {/* Layer 4: Cinematic Grain Texture */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

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
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-[#0F1724]/20 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.02)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer">
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
            {/* 💻 DESKTOP ONLY: Subtle Register Link */}
            <Link
              to="/register"
              className="text-[11px] font-black uppercase tracking-widest text-[#8A94A6] hover:text-white transition-colors hidden sm:block"
            >
              Initialize Profile
            </Link>

            {/* 📱 MOBILE & DESKTOP: Primary Login Button */}
            <Link
              to="/login"
              className="px-5 py-3 md:px-8 md:py-4 bg-amber-500 text-black text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] rounded-[12px] md:rounded-[14px] hover:bg-amber-400 transition-all shadow-[0_10px_20px_rgba(245,158,11,0.2)] active:scale-95 flex items-center gap-1 md:gap-2 whitespace-nowrap"
            >
              Access Portal <ChevronRight size={14} strokeWidth={3} />
            </Link>
          </div>
        </div>
      </nav>

      {/* 🎬 SECTION 1: HERO (Cinematic Impact) */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 z-10">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/40 border border-white/[0.05] text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] shadow-inner backdrop-blur-md"
          >
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
            V.2.0 Intelligence Hub Online
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
              Your Limits.
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="max-w-2xl mx-auto text-[11px] md:text-sm text-[#8A94A6] font-bold uppercase tracking-[0.3em] leading-loose drop-shadow-md"
          >
            Elite technical coaching and professional-grade performance
            intelligence. Built exclusively for athletes who refuse to stay
            average.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1 }}
            className="pt-12 flex justify-center"
          >
            <a
              href="#sectors"
              className="group flex flex-col items-center gap-3 text-[#8A94A6] hover:text-amber-500 transition-colors"
            >
              <span className="text-[9px] font-black uppercase tracking-[0.4em]">
                Explore The Hub
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

      {/* 🏆 SECTION 2: SPORTS SECTORS */}
      <section
        id="sectors"
        className="py-20 md:py-32 px-6 relative z-10 border-t border-white/[0.05] bg-black/20 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto group/carousel relative">
          <div
            ref={scrollContainerRef}
            onScroll={handleSectorScroll}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {sectors.map((sector, idx) => (
              <motion.div
                key={sector._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.8 }}
                onClick={() => setSelectedSector(sector)} // 🚀 THE FIX: Opens the modal!
                className="group relative w-[85vw] md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] shrink-0 snap-start h-[400px] md:h-[500px] rounded-[24px] overflow-hidden bg-black/40 border border-white/[0.05] shadow-[0_15px_30px_rgba(0,0,0,0.5)] cursor-pointer"
              >
                <img
                  src={sector.imageUrl}
                  alt={sector.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-50 group-hover:opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-[#0B0F14]/60 to-transparent" />

                {/* 🚀 UPGRADED: Content overlay with a "View Details" hint */}
                <div className="absolute bottom-0 left-0 p-8 w-full transition-transform duration-500 group-hover:-translate-y-2">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-10 w-10 bg-amber-500/10 backdrop-blur-md rounded-full flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                      <Crosshair size={18} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                      {sector.name}
                    </h3>
                  </div>
                  <p className="text-[#8A94A6] text-sm font-medium leading-relaxed group-hover:text-amber-100/80 transition-colors line-clamp-3 mb-4">
                    {sector.description}
                  </p>

                  {/* Subtle hint that it's clickable */}
                  <div className="flex items-center gap-2 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Access Protocol
                    </span>
                    <ChevronRight size={14} strokeWidth={3} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {/* Glassmorphic Left Arrow (Dynamically hidden if at the start) */}
          {canScrollLeft && (
            <button
              onClick={scrollPrev}
              className="absolute left-0 md:-left-6 top-[60%] -translate-y-1/2 z-30 h-16 w-16 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-amber-500 hover:bg-amber-500/20 hover:border-amber-500/40 transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)] opacity-0 group-hover/carousel:opacity-100  md:flex"
            >
              <ChevronLeft size={36} strokeWidth={1.5} />
            </button>
          )}

          {/* 🛡️ THE FIX: Added onScroll listener to track user swipes */}
          <div
            ref={scrollContainerRef}
            onScroll={handleSectorScroll}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {sectors.map((sector, idx) => (
              <motion.div
                key={sector._id} // 🛡️ Use database ID
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.8 }}
                // 🛡️ THE FIX: Math explicitly sets 1 card on mobile, 2 on tablet, and exactly 4 on desktop!
                className="group relative w-[85vw] md:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] shrink-0 snap-start h-[400px] md:h-[500px] rounded-[24px] overflow-hidden bg-black/40 border border-white/[0.05] shadow-[0_15px_30px_rgba(0,0,0,0.5)] cursor-pointer"
              >
                <img
                  src={sector.imageUrl} // 🛡️ Use database Image URL
                  alt={sector.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-50 group-hover:opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-[#0B0F14]/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-10 w-10 bg-amber-500/10 backdrop-blur-md rounded-full flex items-center justify-center border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-black transition-colors">
                      <Crosshair size={18} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                      {sector.name}
                    </h3>
                  </div>
                  <p className="text-[#8A94A6] text-sm font-medium leading-relaxed group-hover:text-amber-100/80 transition-colors line-clamp-3">
                    {sector.description} {/* 🛡️ Use database Description */}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Glassmorphic Right Arrow (Dynamically hidden if at the end) */}
          {canScrollRight && (
            <button
              onClick={scrollNext}
              className="absolute right-0 md:-right-6 top-[60%] -translate-y-1/2 z-30 h-16 w-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:text-amber-500 hover:bg-amber-500/20 hover:border-amber-500/40 transition-all shadow-[0_10px_40px_rgba(0,0,0,0.8)] opacity-100 md:opacity-50 md:group-hover/carousel:opacity-100  md:flex"
            >
              <ChevronRight size={36} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {/* 🚀 THE NEW INNOVATION: Sector Detail Modal */}
        <AnimatePresence>
          {selectedSector && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSector(null)} // Clicking the background closes it
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                onClick={(e) => e.stopPropagation()} // Clicking the modal itself WON'T close it
                className="relative w-full max-w-2xl bg-[#0F1724] border border-white/10 rounded-[24px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh]"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedSector(null)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white/70 hover:text-amber-500 transition-all"
                >
                  <X size={20} />
                </button>

                {/* Header Image */}
                <div className="relative h-48 md:h-64 shrink-0">
                  <img
                    src={selectedSector.imageUrl}
                    alt={selectedSector.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F1724] to-transparent" />

                  <div className="absolute bottom-6 left-6 md:left-8 flex items-center gap-4">
                    <div className="h-12 w-12 bg-amber-500 rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                      <Crosshair size={24} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white drop-shadow-lg">
                      {selectedSector.name}
                    </h3>
                  </div>
                </div>

                {/* Scrollable Description Area */}
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black uppercase tracking-[0.2em] text-amber-500 mb-6">
                    Official Protocol Description
                  </div>
                  <p className="text-[#E5E7EB] text-sm md:text-base leading-relaxed font-medium whitespace-pre-wrap">
                    {selectedSector.description}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 🧠 SECTION 3: NEXT-GEN INTELLIGENCE */}
      <section className="py-20 md:py-32 px-6 relative z-10 border-t border-white/[0.02] bg-white/[0.01] backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
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
              Performance <span className="text-amber-500">Intelligence</span>
            </h2>
            <p className="text-[10px] font-black text-[#8A94A6] uppercase tracking-[0.3em] mt-4 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
              We don't just train. We track, analyze, and mathematically
              optimize human performance using our custom-built analytics hub.
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
                className="bg-black/40 backdrop-blur-md border border-white/[0.05] rounded-[24px] p-8 shadow-[0_15px_35px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] group hover:border-amber-500/30 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="h-14 w-14 rounded-[16px] bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-amber-500 mb-6 shadow-inner group-hover:scale-110 group-hover:bg-amber-500/10 transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-black uppercase italic tracking-tighter text-[#E5E7EB] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[10px] text-[#8A94A6] font-bold uppercase tracking-widest leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 🏟️ SECTION 4: FACILITY GALLERY */}
      <section className="py-20 md:py-32 px-6 relative z-10 border-t border-white/[0.05] bg-black/20 backdrop-blur-sm overflow-hidden">
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-12 text-center flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-[0.3em] mb-4 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              Live Facility Feed
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white drop-shadow-lg">
              The <span className="text-amber-500">Facility</span>
            </h2>
          </motion.div>

          {/* 🚀 THE UPGRADE: "Studio Grid" Layout */}
          {/* We removed the fixed height on mobile so it can naturally fit all 5 images */}
          <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-3 md:gap-4 md:h-[600px] w-full relative">
            <AnimatePresence mode="popLayout">
              {currentGallerySet.map((img, i) => {
                const isHero = i === 0;

                // 📱 Mobile: Hero is top full-width (aspect-video), others are squares below it.
                // 💻 Desktop: Hero is left half (2 cols, 2 rows), others are 2x2 grid on right.
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
                      delay: i * 0.4, // Staggered fade in
                      ease: "easeInOut",
                    }}
                    className={`relative rounded-[16px] md:rounded-[24px] overflow-hidden group shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/[0.05] ${gridClasses}`}
                  >
                    <img
                      src={img}
                      alt={`Facility View ${i}`}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] opacity-70 group-hover:opacity-100"
                    />

                    {/* Shadow gradient so the text is always readable */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14]/90 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity duration-700" />

                    {/* Camera Feed Label */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80" />
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/90 drop-shadow-md">
                        Cam 0{i + 1}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* ⏱️ Auto-Swap Timer Bar */}
          <div className="w-full max-w-md mx-auto mt-10 h-[2px] bg-white/5 rounded-full overflow-hidden">
            <motion.div
              key={galleryIndex}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]"
            />
          </div>
        </div>
      </section>

      {/* 🏅 SECTION 5: ELITE COACHING STAFF */}
      <section className="py-20 md:py-32 px-6 relative z-10 bg-[#0B0F14]">
        <div className="max-w-7xl mx-auto group/coach relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 flex flex-col items-center text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <Shield size={14} /> Elite Personnel
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white">
              Command <span className="text-amber-500">Roster</span>
            </h2>
          </motion.div>

          {/* Left Arrow */}
          {coaches.length > 3 && (
            <button
              onClick={scrollCoachPrev}
              className="absolute left-0 md:-left-6 top-[60%] -translate-y-1/2 z-30 h-16 w-16 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/50 hover:text-amber-500 hover:bg-amber-500/20 transition-all opacity-0 group-hover/coach:opacity-100 md:flex"
            >
              <ChevronLeft size={36} strokeWidth={1.5} />
            </button>
          )}

          {/* Carousel Container */}
          <div
            ref={coachScrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {coaches.map((coach, i) => (
              <motion.div
                key={coach._id}
                initial={{ opacity: 0, y: 20 }}
                // 🛡️ FIX 1: Changed 'whileInView' to 'animate' so the card never gets stuck invisible!
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative w-[85vw] md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] shrink-0 snap-start bg-[#121821] border border-white/5 rounded-[24px] overflow-hidden hover:border-amber-500/30 transition-all duration-500 shadow-xl hover:shadow-[0_20px_40px_rgba(245,158,11,0.1)]"
              >
                <div className="aspect-[4/5] relative overflow-hidden group">
                  {/* The Coach Image */}
                  <img
                    src={
                      coach.profileImage ||
                      "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
                    }
                    alt={coach.name}
                    className="absolute inset-0 w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  />

                  {/* Upgraded Background Gradient for better contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                  {/* 🚀 UPGRADED: Glassmorphic Floating Data Panel */}
                  <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-5 shadow-2xl transition-all duration-500 group-hover:bg-white/10 group-hover:border-amber-500/30">
                      {/* Glowing Accent Line */}
                      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />

                      {/* Operational Title */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-500">
                          <Briefcase size={10} />
                        </div>
                        <span className="text-amber-500 text-[9px] font-black uppercase tracking-[0.3em] drop-shadow-md">
                          {coach.title}
                        </span>
                      </div>

                      {/* Commander Name */}
                      <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white mb-4 drop-shadow-lg">
                        {coach.name}
                      </h3>

                      {/* Track Record & Action Icon */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <div className="flex items-center gap-2">
                          <Award
                            size={12}
                            className="text-[#8A94A6] group-hover:text-amber-500 transition-colors duration-300"
                          />
                          <p className="text-[#8A94A6] text-[10px] font-bold uppercase tracking-widest group-hover:text-white transition-colors duration-300">
                            {coach.experience}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Arrow */}
          {coaches.length > 3 && (
            <button
              onClick={scrollCoachNext}
              className="absolute right-0 md:-right-6 top-[60%] -translate-y-1/2 z-30 h-16 w-16 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:text-amber-500 transition-all opacity-100 md:opacity-50 md:group-hover/coach:opacity-100  md:flex"
            >
              <ChevronRight size={36} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </section>

      {/* 🚀 SECTION 6: TRAINING JOURNEY */}
      <section className="py-20 md:py-32 px-6 relative z-10 border-t border-white/[0.05] bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white drop-shadow-lg">
              The <span className="text-amber-500">Protocol</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 relative">
            <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />
            {JOURNEY_STEPS.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative z-10 text-center space-y-6"
              >
                <div className="w-20 h-20 mx-auto bg-[#0B0F14] border border-white/[0.1] rounded-full flex items-center justify-center text-2xl font-black italic text-amber-500 shadow-[0_10px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] relative group">
                  <div className="absolute inset-0 rounded-full border border-amber-500/0 group-hover:border-amber-500/50 group-hover:animate-ping transition-colors duration-500" />
                  {step.num}
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tighter text-white italic mb-2 drop-shadow-md">
                    {step.title}
                  </h3>
                  <p className="text-[10px] font-bold text-[#8A94A6] uppercase tracking-widest leading-relaxed drop-shadow-sm">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 🗣️ SECTION 7: SUCCESS STORIES */}
      <section className="py-20 md:py-32 px-6 relative z-10 border-t border-white/[0.02] bg-white/[0.01] backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          {/* Header & Scroll Buttons */}
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
                Verified <span className="text-amber-500">Clearances</span>
              </h2>
            </motion.div>

            {/* Scroll Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => scrollReviews("left")}
                className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/50 flex items-center justify-center text-white transition-all active:scale-95"
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

          {/* Horizontally Scrolling Container */}
          <div
            ref={reviewScrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {reviews.length > 0 ? (
              reviews.map((review, i) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }} // 🛡️ FIX: Changed from whileInView to animate to prevent the Framer scroll bug!
                  transition={{ delay: i * 0.1 }}
                  className="w-[85vw] md:w-[400px] shrink-0 snap-start bg-black/40 backdrop-blur-md p-8 rounded-[24px] border border-white/[0.05] shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] flex flex-col justify-between hover:border-amber-500/20 transition-colors"
                >
                  <p className="text-sm font-medium text-[#E5E7EB] leading-loose italic mb-8">
                    "{review.content}"
                  </p>
                  <div className="flex items-center gap-4 border-t border-white/[0.05] pt-6">
                    {/* Shows their uploaded profile image if they have one, otherwise uses your cool glowing initials */}
                    {review.user?.profileImage ? (
                      <img
                        src={review.user.profileImage}
                        alt="User"
                        className="w-10 h-10 rounded-full object-cover border border-white/[0.05] shadow-inner"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-white/[0.02] rounded-full flex items-center justify-center text-amber-500 font-black italic border border-white/[0.05] shadow-inner">
                        {review.user?.name?.[0] || "A"}
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] font-black text-white uppercase tracking-widest">
                        {review.user?.name || "Anonymous Recruit"}
                      </p>
                      <p className="text-[9px] font-black text-amber-500/60 uppercase tracking-[0.2em] mt-1">
                        {review.sport}
                      </p>
                    </div>
                    {/* Right Side: Star Rating */}
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
                No clearances on record.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 📍 SECTION 8: LOCATION & CONTACT */}
      <section className="py-24 px-6 relative z-10 border-t border-white/[0.05] bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div>
              <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-white mb-4 drop-shadow-lg">
                Base <span className="text-amber-500">Command</span>
              </h2>
              <p className="text-[10px] font-black text-[#8A94A6] uppercase tracking-[0.3em] drop-shadow-md">
                Initialize visual contact before deployment.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-black/40 backdrop-blur-md p-5 rounded-[16px] border border-white/[0.05] shadow-inner hover:border-amber-500/30 transition-colors">
                <div className="h-10 w-10 bg-amber-500/10 rounded-[10px] flex items-center justify-center text-amber-500 flex-shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#8A94A6] mb-1">
                    Address
                  </p>
                  <p className="text-xs font-bold text-[#E5E7EB] tracking-wider leading-relaxed">
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
              <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-5 rounded-[16px] border border-white/[0.05] shadow-inner hover:border-amber-500/30 transition-colors">
                <div className="h-10 w-10 bg-amber-500/10 rounded-[10px] flex items-center justify-center text-amber-500 flex-shrink-0">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#8A94A6] mb-1">
                    Active Window
                  </p>
                  <p className="text-xs font-bold text-[#E5E7EB] tracking-wider">
                    06:00 AM — 20:00 PM (Daily)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-5 rounded-[16px] border border-white/[0.05] shadow-inner hover:border-amber-500/30 transition-colors">
                <div className="h-10 w-10 bg-amber-500/10 rounded-[10px] flex items-center justify-center text-amber-500 flex-shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#8A94A6] mb-1">
                    Direct Comms
                  </p>
                  <p className="text-xs font-bold text-[#E5E7EB] tracking-wider">
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
            className="h-[450px] bg-black/60 rounded-[24px] border border-white/[0.05] overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay pointer-events-none z-10" />
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3628.5475739845874!2d73.7182282751422!3d24.570291878119853!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3967ef1e19cc92a7%3A0xcfa5ff23f205570f!2sAthletic%20zone!5e0!3m2!1sen!2sin!4v1772879873901!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{
                border: 0,
                opacity: 0.7,
                filter: "grayscale(100%) contrast(1.2)",
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </section>

      {/* 🔥 SECTION 9: FINAL CONVERSION */}
      <section className="py-40 px-6 relative z-10 overflow-hidden text-center bg-[#0B0F14]/40 backdrop-blur-xl border-t border-white/[0.05]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto space-y-10"
        >
          <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-white leading-tight drop-shadow-2xl">
            Ready to Train Like <br /> a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-300 drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]">
              Professional?
            </span>
          </h2>
          <p className="text-xs font-black text-[#8A94A6] uppercase tracking-[0.4em] leading-loose max-w-2xl mx-auto drop-shadow-md">
            Stop guessing. Start tracking. Join the elite roster today and get
            access to world-class coaching and analytics.
          </p>
          <div className="pt-8">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-3 md:gap-4 px-8 py-5 md:px-16 md:py-8 bg-amber-500 text-black text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em] rounded-[16px] md:rounded-[24px] hover:bg-amber-400 transition-all shadow-[0_20px_50px_rgba(245,158,11,0.4)] active:scale-95 group overflow-hidden relative whitespace-nowrap"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              Create Athlete Account{" "}
              <ChevronRight
                size={20}
                strokeWidth={3}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
