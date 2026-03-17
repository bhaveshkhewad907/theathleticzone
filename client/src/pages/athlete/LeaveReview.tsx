import { useState } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { Star, Send, Activity, MessageSquare } from "lucide-react";

interface LeaveReviewProps {
  onSuccess?: () => void;
}

export default function LeaveReview({ onSuccess }: LeaveReviewProps) {
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [sport, setSport] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 🛡️ SYNC FIX: Sending the sport to the backend
      await api.post("/reviews", { rating, content, sport });
      toast.success("Review submitted to central command.");
      setContent("");
      setSport(""); // Clear the field

      if (onSuccess) onSuccess();
    } catch {
      toast.error("Failed to submit review.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#121821] border border-white/5 p-6 md:p-8 rounded-3xl max-w-xl shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-40" />

      <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-2">
        Verified <span className="text-amber-500">Clearance</span>
      </h3>
      <p className="text-[#8A94A6] text-[10px] font-bold uppercase tracking-widest mb-6">
        Submit your operational debrief. Your review will be public.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              className="focus:outline-none transition-transform active:scale-90"
            >
              <Star
                size={28}
                className={
                  star <= rating
                    ? "fill-amber-500 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                    : "text-white/20"
                }
              />
            </button>
          ))}
        </div>

        {/* 🛡️ NEW: Operational Sector Field */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] ml-2 flex items-center gap-2">
            <Activity size={12} className="text-amber-500" /> Operational Sector
          </label>
          <input
            required
            type="text"
            maxLength={50}
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            placeholder="e.g. Cricket Sector, Combat, Conditioning..."
            className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-4 text-sm text-white focus:border-amber-500/50 outline-none transition-all placeholder:text-white/10"
          />
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] ml-2 flex items-center gap-2">
            <MessageSquare size={12} className="text-amber-500" /> Debrief
            Content
          </label>
          <textarea
            required
            maxLength={300}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Detail your experience with the tactical training..."
            className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-4 text-sm text-white focus:border-amber-500/50 outline-none transition-all placeholder:text-white/10 min-h-[120px] resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !content || !sport}
          className="w-full bg-amber-500 text-black py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
        >
          {loading ? "Transmitting..." : "Submit Debrief"}
          {!loading && <Send size={14} />}
        </button>
      </form>
    </div>
  );
}
