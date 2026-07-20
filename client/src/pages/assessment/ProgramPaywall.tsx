import { useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { Zap, ShieldCheck, Tag, CheckCircle2, Lock, Star } from "lucide-react";
import { loadRazorpayScript } from "../../utils/razorpay";

export default function ProgramPaywall({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [coupon, setCoupon] = useState("");
  const [activeCoupon, setActiveCoupon] = useState<string | null>(null);
  const [displayPrice, setDisplayPrice] = useState(1000);
  const [isProcessing, setIsProcessing] = useState(false);

  const COUPONS: Record<string, number> = {
    "JAYSON-TAZ": 50,
  };

  const handleApplyCoupon = () => {
    const code = coupon.toUpperCase();
    if (COUPONS[code]) {
      const discount = COUPONS[code];
      setDisplayPrice(1000 - (1000 * discount) / 100);
      setActiveCoupon(code);
      toast.success(`${discount}% Discount Applied!`);
    } else {
      toast.error("Invalid or expired code");
      setDisplayPrice(1000);
      setActiveCoupon(null);
    }
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Network Error: Failed to load Razorpay SDK.");
        setIsProcessing(false);
        return;
      }

      const { data } = await api.post("/entry/create-order", {
        couponCode: activeCoupon,
      });

      const options = {
        key:
          data.key ||
          data.order?.key ||
          data.razorpayOrder?.key ||
          import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: "INR",
        name: "The Athletic Zone",
        description: "Protocol Activation",
        order_id: data.order.id,
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          try {
            await api.post("/entry/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              appliedCoupon: data.appliedCoupon,
            });
            toast.success("Payment Successful! Protocol Activated.");
            onSuccess();
          } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            toast.error(
              error?.response?.data?.message ||
                "Payment verification failed. Contact support.",
            );
          }
        },
        theme: { color: "#F59E0B" },
      };

      const RazorpayConstructor = (
        window as unknown as {
          Razorpay: new (opts: typeof options) => { open: () => void };
        }
      ).Razorpay;
      const rzp = new RazorpayConstructor(options);
      rzp.open();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Checkout Gateway Error:", error?.response?.data || err);
      toast.error(
        error?.response?.data?.message ||
          "Internal Error: Check browser console.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    // 🌑 Outer Modal Backdrop (Responsive padding to maximize mobile space)
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-[#0B0F14]/90 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
      {/* 💎 Glassmorphic Main Card (Added max-h-[96dvh] and overflow fallback just in case) */}
      <div className="max-w-5xl w-full bg-[#0F1724]/95 backdrop-blur-2xl rounded-[1.5rem] md:rounded-[2rem] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.9)] flex flex-col md:flex-row relative max-h-[96dvh] overflow-y-auto custom-scrollbar md:overflow-hidden">
        {/* 📸 Left Side: Cinematic Header (Mobile) / Full Panel (Desktop) */}
        <div className="w-full md:w-[55%] relative flex flex-col justify-end p-5 sm:p-8 md:p-12 shrink-0 md:min-h-[600px]">
          <img
            src="https://media.theathleticzone.in/auth-bg-images/paywall.webp"
            alt="Sprint Athlete"
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity transition-all duration-1000 hover:scale-105 hover:opacity-50"
          />
          {/* Responsive Gradient: Blends downward into the form on mobile, rightward on desktop */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F1724]/10 via-[#0F1724]/80 to-[#0F1724] md:bg-gradient-to-r md:from-[#0F1724] md:via-[#0F1724]/60" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3 md:mb-4 shadow-inner w-max">
              <Lock size={10} className="md:w-3 md:h-3" /> Protocol Generated &
              Locked
            </div>

            <h2 className="text-3xl md:text-5xl font-black italic text-white tracking-tighter uppercase leading-[1] md:leading-[0.9] drop-shadow-2xl mb-2 md:mb-4">
              Activate Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-300">
                Custom Blueprint.
              </span>
            </h2>

            {/* 🚀 HIDDEN ON MOBILE: Long description */}
            <p className="hidden md:block text-white/70 text-xs uppercase tracking-widest font-bold leading-relaxed drop-shadow-md mb-8 max-w-sm">
              Your biometric data has been processed. Unlock your dashboard to
              access your day-by-day training protocol.
            </p>

            {/* 🚀 HIDDEN ON MOBILE: The Value Stack */}
            <div className="hidden md:block space-y-3 mb-8">
              {[
                "6-Week Algorithmic Training Block",
                "HD Exercise Demonstration Library",
                "Daily Mobility & Recovery Protocols",
                "Direct Platform Access & Updates",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2
                    size={16}
                    className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] shrink-0"
                  />
                  <span className="text-xs font-bold text-white/90 uppercase tracking-wider">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* 🚀 SOCIAL PROOF (Kept tight on mobile) */}
            <div className="flex items-center gap-3 md:gap-4 pt-2 md:pt-6 md:border-t border-white/10">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-black border-2 border-[#0F1724] overflow-hidden"
                  >
                    <img
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      alt="Athlete"
                      className="w-full h-full object-cover opacity-80"
                    />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex text-amber-500 gap-0.5 mb-0.5 md:mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={8}
                      className="md:w-[10px] md:h-[10px]"
                      fill="currentColor"
                    />
                  ))}
                </div>
                <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/50">
                  Joined by 200+ Athletes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 💳 Right Side: Transparent on mobile to blend with the header, boxed on desktop */}
        <div className="w-full md:w-[45%] p-5 sm:p-8 md:p-12 flex flex-col justify-center relative bg-transparent md:bg-black/40 md:border-l border-white/5">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 bg-amber-500/10 blur-[80px] md:blur-[100px] rounded-full pointer-events-none" />

          <div className="space-y-5 md:space-y-8 relative z-10">
            {/* Price Block */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[1rem] md:rounded-[20px] p-5 md:p-8 shadow-inner relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-amber-500/10 blur-[40px] rounded-full transition-opacity opacity-0 group-hover:opacity-100" />

              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2 md:mb-3 flex items-center gap-1.5 md:gap-2">
                <ShieldCheck size={14} className="md:w-4 md:h-4" /> Phase 1
                Access Fee
              </p>
              <div className="flex items-baseline gap-3 md:gap-4">
                <h3 className="text-4xl md:text-6xl font-black italic text-white tracking-tighter drop-shadow-lg">
                  ₹{displayPrice}
                </h3>
                {activeCoupon && (
                  <span className="text-white/30 line-through text-xl md:text-2xl font-bold">
                    ₹1000
                  </span>
                )}
              </div>
            </div>

            {/* Promo Code Block */}
            <div className="space-y-2 md:space-y-3">
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/50 drop-shadow-md ml-1">
                Have an Influencer Code?
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag
                    size={14}
                    className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-white/30 md:w-4 md:h-4"
                  />
                  <input
                    type="text"
                    placeholder="ENTER CODE"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="w-full bg-black/40 backdrop-blur-sm border border-white/10 rounded-[10px] md:rounded-xl py-3 md:py-4 pl-9 md:pl-12 pr-3 md:pr-4 text-white uppercase font-black tracking-widest text-xs md:text-sm outline-none focus:border-amber-500 transition-colors placeholder:text-white/20 shadow-inner"
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  className="px-4 md:px-6 rounded-[10px] md:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all active:scale-95 shadow-lg"
                >
                  Apply
                </button>
              </div>

              {/* Success Message Area */}
              <div className="h-3 md:h-4 ml-1">
                {activeCoupon && (
                  <p className="text-[9px] md:text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1 drop-shadow-md animate-in slide-in-from-left-2">
                    ✓ Code {activeCoupon} Active
                  </p>
                )}
              </div>
            </div>

            {/* Checkout Button */}
            <div className="pt-3 md:pt-4 border-t border-white/5">
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="relative overflow-hidden w-full py-4 md:py-6 rounded-xl bg-amber-500 text-black font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-amber-400 transition-all shadow-[0_10px_30px_rgba(245,158,11,0.3)] hover:shadow-[0_15px_40px_rgba(245,158,11,0.5)] active:scale-95 flex justify-center items-center gap-2 md:gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />

                <span className="relative z-10 flex items-center gap-1.5 md:gap-2">
                  {isProcessing
                    ? "Connecting Gateway..."
                    : "Activate My Protocol"}
                  {!isProcessing && (
                    <Zap
                      size={16}
                      className="md:w-[18px] md:h-[18px] group-hover:scale-110 group-hover:translate-x-1 transition-all"
                    />
                  )}
                </span>
              </button>

              <p className="text-[8px] md:text-[9px] text-white/30 text-center font-bold uppercase tracking-widest mt-4 md:mt-6 flex items-center justify-center gap-1.5">
                <Lock size={10} /> 256-bit Encrypted. Secured by Razorpay.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
