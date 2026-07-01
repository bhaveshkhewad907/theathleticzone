import { useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { Zap, ShieldCheck, Tag } from "lucide-react";
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
        description: "Sprint Intelligence Program Integration",
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
            toast.success("Payment Successful! Assessment Unlocked.");
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
    // 🌑 Outer Modal Backdrop (Heavy Blur)
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0B0F14]/80 backdrop-blur-lg animate-in fade-in zoom-in-95 duration-500">
      {/* 💎 Glassmorphic Main Card */}
      <div className="max-w-4xl w-full bg-black/40 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row relative">
        {/* 📸 Left Side: Cinematic Image */}
        <div className="md:w-1/2 relative min-h-[300px] md:min-h-[500px]">
          <img
            src="https://media.theathleticzone.in/auth-bg-images/paywall.webp"
            alt="Sprint Athlete"
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity transition-all duration-700 hover:scale-105 hover:opacity-80"
          />
          {/* Gradient to blend the image into the glass form on desktop, and down on mobile */}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/90 via-black/50 to-transparent" />

          <div className="absolute bottom-0 left-0 p-8 md:p-10 z-10 w-full">
            <h2 className="text-4xl md:text-5xl font-black italic text-white tracking-tighter uppercase leading-[0.9] drop-shadow-2xl">
              Unlock Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-300">
                True Speed.
              </span>
            </h2>
            <p className="text-white/70 text-[10px] md:text-xs uppercase tracking-widest mt-4 font-bold leading-relaxed drop-shadow-md">
              Join the elite protocol. Get your biomechanical assessment and a
              custom 6-week programming block.
            </p>
          </div>
        </div>

        {/* 💳 Right Side: Glass Checkout Form */}
        <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center relative">
          {/* Ambient Glow behind the form */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="space-y-6 relative z-10">
            {/* Price Block */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[16px] p-6 shadow-inner">
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2 flex items-center gap-2">
                <ShieldCheck size={14} /> One-Time Access Fee
              </p>
              <div className="flex items-baseline gap-3">
                <h3 className="text-5xl md:text-6xl font-black italic text-white tracking-tighter drop-shadow-lg">
                  ₹{displayPrice}
                </h3>
                {activeCoupon && (
                  <span className="text-white/40 line-through text-xl md:text-2xl font-bold">
                    ₹1000
                  </span>
                )}
              </div>
            </div>

            {/* Promo Code Block */}
            <div className="space-y-3">
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/60 drop-shadow-md">
                Influencer / Promo Code
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag
                    size={14}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                  />
                  <input
                    type="text"
                    placeholder="ENTER CODE"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="w-full bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl py-4 pl-10 pr-4 text-white uppercase font-bold tracking-widest text-sm md:text-base outline-none focus:border-amber-500 transition-colors placeholder:text-white/20 shadow-inner"
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  className="px-5 md:px-6 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all active:scale-95 shadow-lg"
                >
                  Apply
                </button>
              </div>

              {/* Success Message Area */}
              <div className="h-4">
                {activeCoupon && (
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1 drop-shadow-md animate-in slide-in-from-left-2">
                    ✓ Code {activeCoupon} Active
                  </p>
                )}
              </div>
            </div>

            {/* Checkout Button */}
            <div className="pt-2">
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="relative overflow-hidden w-full py-5 rounded-[16px] bg-amber-500 text-black font-black text-[11px] md:text-xs uppercase tracking-[0.2em] hover:bg-amber-400 transition-all shadow-[0_10px_30px_rgba(245,158,11,0.3)] hover:shadow-[0_15px_40px_rgba(245,158,11,0.5)] active:scale-95 flex justify-center items-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />

                <span className="relative z-10 flex items-center gap-2">
                  {isProcessing
                    ? "Connecting Gateway..."
                    : "Proceed to Secure Checkout"}
                  {!isProcessing && (
                    <Zap
                      size={16}
                      className="group-hover:scale-110 transition-transform"
                    />
                  )}
                </span>
              </button>

              <p className="text-[8px] md:text-[9px] text-white/40 text-center font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-1">
                <ShieldCheck size={10} /> Secured by Razorpay. Includes Platform
                Access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
