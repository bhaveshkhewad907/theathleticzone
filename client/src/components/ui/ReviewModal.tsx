import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import toast from "react-hot-toast";
import { Star, X, MessageSquare } from "lucide-react";

interface ReviewModalProps {
  courseId: string;
  onClose: () => void;
}

export default function ReviewModal({ courseId, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = async () => {
    if (rating === 0) return toast.error("Please select a rating to proceed.");

    try {
      setLoading(true);
      await api.post("/course-reviews", {
        courseId,
        rating,
        review,
      });
      toast.success("Operational feedback submitted successfully.");
      onClose();
    } catch (error) {
      console.error("Failed to submit review", error);
      toast.error("Telemetry failure. Feedback could not be transmitted.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[110] p-4">
        {/* Ambient Glow behind Modal */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#0F1724]/80 backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-[24px] max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/40 hover:text-white bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/5 hover:border-white/20 transition-all z-10 active:scale-95"
          >
            <X size={16} strokeWidth={3} />
          </button>

          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-[12px] bg-amber-500/10 border border-amber-500/20 mb-2 text-amber-500 shadow-inner">
              <MessageSquare size={20} />
            </div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">
              Operational <span className="text-amber-500">Debrief</span>
            </h2>
            <p className="text-[#8A94A6] text-[10px] font-bold uppercase tracking-[0.2em]">
              Evaluate deployment efficiency
            </p>
          </div>

          {/* Star Rating Selection */}
          <div className="flex justify-center gap-3 mb-8">
            {[1, 2, 3, 4, 5].map((star) => {
              const isActive = star <= (hoveredRating || rating);
              return (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform active:scale-75 focus:outline-none"
                >
                  <Star
                    size={36}
                    className={`transition-all duration-300 ${
                      isActive
                        ? "fill-amber-500 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)] scale-110"
                        : "fill-transparent text-white/10 hover:text-white/30"
                    }`}
                    strokeWidth={isActive ? 0 : 1.5}
                  />
                </button>
              );
            })}
          </div>

          <div className="space-y-2 mb-8">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#8A94A6] ml-2">
              Tactical Feedback (Optional)
            </label>
            <textarea
              placeholder="Detail your experience..."
              className="w-full bg-black/40 backdrop-blur-sm border border-white/5 p-5 rounded-[16px] text-sm text-white focus:border-amber-500/50 outline-none h-32 resize-none transition-all placeholder:text-white/20 shadow-inner"
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-4 rounded-[12px] bg-black/60 border border-white/5 text-[#8A94A6] text-[10px] font-black uppercase tracking-widest hover:text-white hover:border-white/20 transition-all disabled:opacity-50"
            >
              Abort
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || rating === 0}
              className="flex-1 py-4 bg-amber-500 text-black rounded-[12px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-400 transition-all disabled:opacity-50 shadow-[0_10px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_15px_30px_rgba(245,158,11,0.4)] active:scale-95"
            >
              {loading ? "Transmitting..." : "Submit Debrief"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
