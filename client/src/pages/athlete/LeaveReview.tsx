import { useState } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { Star, Send, Activity, MessageSquare, X } from "lucide-react";
import { motion } from "framer-motion";

interface LeaveReviewProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LeaveReview({ onClose, onSuccess }: LeaveReviewProps) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [sport, setSport] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/reviews", { rating, content, sport });
      toast.success(
        "Review submitted to central command. It is now live on the Landing Page!",
      );
      setContent("");
      setSport("");

      if (onSuccess) onSuccess();
      onClose(); // Automatically close the modal on success
    } catch {
      toast.error("Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#121821] border border-white/5 p-6 md:p-8 rounded-3xl w-full max-w-xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative overflow-hidden"
      >
        {/* Top Edge Glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-40" />

        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-1">
              Verified <span className="text-amber-500">Clearance</span>
            </h3>
            <p className="text-[#8A94A6] text-[10px] font-bold uppercase tracking-widest">
              Submit your operational debrief. Your review will be public on the
              homepage.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white bg-white/5 p-2 rounded-full transition-colors active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="flex gap-2 justify-center py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform active:scale-90 hover:scale-110"
              >
                <Star
                  size={36}
                  className={
                    star <= rating
                      ? "fill-amber-500 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                      : "text-white/10 hover:text-white/30"
                  }
                />
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] ml-2 flex items-center gap-2">
              <Activity size={12} className="text-amber-500" /> Operational
              Sector
            </label>
            <input
              required
              type="text"
              maxLength={50}
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              placeholder="e.g. 100m Sprint, Football, Combat..."
              className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-4 text-sm text-white focus:border-amber-500/50 outline-none transition-all placeholder:text-white/10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] ml-2 flex items-center gap-2">
              <MessageSquare size={12} className="text-amber-500" /> Public
              Debrief
            </label>
            <textarea
              required
              maxLength={300}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detail your experience with the training program..."
              className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-4 text-sm text-white focus:border-amber-500/50 outline-none transition-all placeholder:text-white/10 min-h-[120px] resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !content || !sport}
            className="w-full bg-amber-500 text-black py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          >
            {loading ? "Transmitting..." : "Submit Public Debrief"}
            {!loading && <Send size={14} />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
