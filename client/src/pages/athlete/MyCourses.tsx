import { useEffect, useState } from "react";
import api from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import ReviewModal from "../../components/ui/ReviewModal";
import {
  Play,
  MessageSquare,
  Shield,
  Activity,
  X,
  Monitor,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface PurchasedCourse {
  _id: string;
  createdAt: string;
  course: {
    _id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    price: number;
    averageRating?: number;
  };
}

export default function MyCourses() {
  const [courses, setCourses] = useState<PurchasedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [reviewCourseId, setReviewCourseId] = useState<string | null>(null);

  const [isAuthorizing, setIsAuthorizing] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get<{ data: PurchasedCourse[] }>(
          "/course-purchase/my",
        );
        setCourses(res.data.data);
      } catch (error) {
        console.error("Failed to load courses", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handlePlayVideo = async (courseId: string) => {
    try {
      setIsAuthorizing(courseId);

      const res = await api.get(`/courses/${courseId}/secure-access`);

      const { secureVideoUrl, resumeAtSeconds } = res.data.data;

      setActiveVideo(secureVideoUrl);
      setVideoProgress(resumeAtSeconds || 0);
    } catch {
      toast.error("Stream authorization failed. Please contact support.");
    } finally {
      setIsAuthorizing(null);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-full overflow-hidden">
        {/* Ambient Radial Lighting Spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />

        {/* 📱 RESPONSIVE: Matches the exact px-2 md:px-0 padding of the final page */}
        <div className="relative z-10 space-y-8 md:space-y-12 max-w-7xl mx-auto px-2 md:px-0 animate-pulse">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#0F1724]/40 border border-white/[0.02] p-6 md:p-10 rounded-[16px] gap-4">
            <div>
              <div className="h-8 md:h-10 w-48 md:w-64 bg-white/5 rounded-md mb-2 md:mb-3" />
              <div className="h-3 w-64 md:w-80 max-w-full bg-white/5 rounded-md" />
            </div>
            {/* Badge Skeleton */}
            <div className="h-8 md:h-10 w-32 bg-white/5 rounded-full" />
          </div>

          {/* Course Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-10">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex flex-col bg-[#0F1724]/40 border border-white/[0.02] rounded-[24px] p-4 md:p-6 space-y-6"
              >
                {/* Visual Cover Asset Skeleton */}
                <div className="aspect-video bg-white/5 rounded-[16px]" />

                <div className="px-2">
                  <div className="h-2 w-24 bg-white/5 rounded-md mb-4" />
                  <div className="h-5 md:h-6 w-3/4 bg-white/5 rounded-md mb-2" />
                  <div className="h-5 md:h-6 w-1/2 bg-white/5 rounded-md" />
                </div>

                <div className="pt-2 md:pt-4 space-y-3 md:space-y-4 mt-auto">
                  {/* Play Button Skeleton */}
                  <div className="h-[40px] md:h-[48px] w-full bg-white/5 rounded-[12px]" />
                  {/* Review Button Skeleton */}
                  <div className="h-3 w-3/4 mx-auto bg-white/5 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />

      {/* 📱 RESPONSIVE: Prevent outer margins from breaking the screen */}
      <div className="relative z-10 space-y-8 md:space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto px-2 md:px-0">
        {/* 📱 RESPONSIVE: Stacked headers for phones */}
        <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] p-6 md:p-10 rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] gap-4">
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
              Personal <span className="text-amber-500">Vault</span>
            </h1>
            <p className="text-[#8A94A6] text-[10px] font-bold uppercase tracking-[0.3em] mt-2 md:mt-3">
              Your Active Performance Intelligence Modules
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-3 px-4 md:px-6 py-2 md:py-3 rounded-full bg-black/40 border border-white/[0.05] shadow-inner w-fit">
            <Shield size={12} className="text-amber-500" />
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-[#8A94A6]">
              Secure Access Node
            </span>
          </div>
        </div>

        {/* Course Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-10">
          {courses.map((purchase) => (
            <div
              key={purchase._id}
              className="group relative flex flex-col bg-[#0F1724]/80 backdrop-blur-md border border-white/[0.05] rounded-[24px] p-4 md:p-6 space-y-6 transition-all duration-500 hover:border-amber-500/30 shadow-[0_15px_35px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

              <div className="relative rounded-[16px] overflow-hidden aspect-video bg-black/40 shadow-inner">
                <img
                  src={purchase.course.thumbnailUrl}
                  alt={purchase.course.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-70 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F1724] via-transparent to-transparent opacity-60" />

                <div className="absolute top-3 right-3 md:top-4 md:right-4 h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              </div>

              <div className="px-2 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={10} className="text-amber-500/60" />
                  <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-[#8A94A6]">
                    Intelligence Module
                  </span>
                </div>
                <h2 className="text-base md:text-lg font-black text-[#E5E7EB] tracking-tighter uppercase italic leading-tight group-hover:text-amber-500 transition-colors">
                  {purchase.course.title}
                </h2>
              </div>

              <div className="pt-2 md:pt-4 space-y-3 md:space-y-4 mt-auto relative z-10">
                <button
                  onClick={() => handlePlayVideo(purchase.course._id)}
                  disabled={isAuthorizing === purchase.course._id}
                  className="w-full py-3 md:py-4 bg-[#E5E7EB] text-black text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-[12px] hover:bg-amber-500 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play size={12} fill="currentColor" />
                  {isAuthorizing === purchase.course._id
                    ? "Decrypting Stream..."
                    : "Initialize Stream"}
                </button>

                <button
                  onClick={() => setReviewCourseId(purchase.course._id)}
                  className="w-full py-2 text-[#8A94A6] text-[8px] md:text-[9px] hover:text-amber-500 transition-colors uppercase tracking-[0.4em] font-black flex items-center justify-center gap-2"
                >
                  <MessageSquare size={10} /> Submit Performance Review
                </button>
              </div>
            </div>
          ))}

          {courses.length === 0 && (
            <div className="col-span-full py-16 md:py-24 flex flex-col items-center justify-center bg-[#0F1724]/40 border-2 border-dashed border-white/5 rounded-[24px]">
              <Shield
                size={36}
                className="text-[#8A94A6]/20 mb-4 md:mb-6 md:w-12 md:h-12"
              />
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-[#8A94A6]/40 text-center px-4">
                No modules initialized in vault
              </p>
            </div>
          )}
        </div>

        <div className="pt-6 md:pt-8 border-t border-white/[0.05] flex flex-col md:flex-row justify-center md:justify-between items-center gap-2 text-[8px] md:text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] text-center">
          <div>R2 DATA NODE: ACTIVE</div>
          <div>ATHLETIC ZONE INTELLIGENCE V.2.0.4</div>
        </div>
      </div>

      {reviewCourseId && (
        <ReviewModal
          courseId={reviewCourseId}
          onClose={() => setReviewCourseId(null)}
        />
      )}

      {/* 📱 RESPONSIVE MODAL: Video Player */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // 🌌 UPGRADED: Premium Glassmorphic Overlay instead of solid black
            className="fixed inset-0 flex items-center justify-center z-[100] md:p-4 bg-[#0B0F14]/80 backdrop-blur-2xl bg-gradient-to-br from-amber-500/5 via-[#0B0F14]/90 to-blue-900/10"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              // 📱💻 RESPONSIVE CONTAINER
              // Mobile: 100vw/100vh, no borders, no rounded corners.
              // Desktop: Max-width 5xl, 24px rounded corners, crisp borders.
              className="bg-[#0F1724] relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.04)]
                w-[100vw] h-[100vh] rounded-none border-none
                md:w-[95vw] md:max-w-5xl md:h-auto md:rounded-[24px] md:border md:border-white/10"
            >
              {/* 🎬 HEADER: Floats over video on mobile, sits normally on desktop */}
              <div className="absolute md:relative top-0 left-0 w-full z-50 p-4 md:p-5 border-b border-white/[0.05] flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent md:bg-black/20">
                <div className="flex items-center gap-2 md:gap-3">
                  <Monitor
                    size={12}
                    className="text-amber-500 md:w-4 md:h-4 drop-shadow-md md:drop-shadow-none"
                  />
                  <span className="text-[10px] text-white/90 md:text-[#8A94A6] font-black uppercase tracking-[0.2em] drop-shadow-md md:drop-shadow-none">
                    HD Stream • R2 Global Deployment
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveVideo(null);
                    setVideoProgress(0);
                  }}
                  // Mobile gets a frosted glass circle to remain visible over the video content
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 md:bg-transparent border border-white/10 md:border-none backdrop-blur-md md:backdrop-blur-none text-white/90 md:text-[#8A94A6] hover:bg-white/10 hover:text-white transition-all active:scale-95"
                >
                  <X size={18} strokeWidth={3} className="md:w-5 md:h-5" />
                </button>
              </div>

              {/* 🎥 VIDEO WRAPPER & ELEMENT */}
              <div className="w-full h-full md:h-auto md:aspect-video bg-black shadow-inner relative">
                <video
                  src={activeVideo}
                  controls
                  autoPlay
                  playsInline // 🚀 CRITICAL: Stops iOS from immediately forcing its native full-screen player
                  crossOrigin="anonymous"
                  controlsList="nodownload"
                  // 🚀 MOBILE: Absolute positioning & object-cover to fill screen (Reels style)
                  // 💻 DESKTOP: Relative positioning & object-contain to preserve widescreen
                  className="absolute inset-0 md:relative w-full h-full object-contain"
                  onLoadedMetadata={(e) => {
                    if (videoProgress > 0) {
                      e.currentTarget.currentTime = videoProgress;
                    }
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
