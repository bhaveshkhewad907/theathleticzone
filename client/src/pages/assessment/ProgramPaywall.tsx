import { useState, useEffect } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { Zap, ShieldCheck, Tag } from "lucide-react";

export default function ProgramPaywall({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [coupon, setCoupon] = useState("");
  const [activeCoupon, setActiveCoupon] = useState<string | null>(null);
  const [displayPrice, setDisplayPrice] = useState(700);
  const [isProcessing, setIsProcessing] = useState(false);

  const COUPONS: Record<string, number> = {
    GEMINI30: 30,
    SPRINT50: 50,
    ELITE10: 10,
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(script);
  }, []);

  const handleApplyCoupon = () => {
    const code = coupon.toUpperCase();
    if (COUPONS[code]) {
      const discount = COUPONS[code];
      setDisplayPrice(700 - (700 * discount) / 100);
      setActiveCoupon(code);
      toast.success(`${discount}% Discount Applied!`);
    } else {
      toast.error("Invalid or expired code");
      setDisplayPrice(700);
      setActiveCoupon(null);
    }
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const { data } = await api.post("/entry/create-order", {
        couponCode: activeCoupon,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
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
          } catch {
            toast.error("Payment verification failed. Contact support.");
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
    } catch {
      toast.error("Failed to initialize checkout gateway.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0B0F14]/90 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500">
      <div className="max-w-4xl w-full bg-[#121821] rounded-[2rem] border border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/2 relative min-h-[300px] md:min-h-full">
          <img
            src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070&auto=format&fit=crop"
            alt="Sprint Athlete"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#121821] via-[#121821]/80 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 z-10">
            <h2 className="text-3xl md:text-4xl font-black italic text-white tracking-tighter uppercase leading-tight">
              Unlock Your <br />
              <span className="text-amber-500">True Speed.</span>
            </h2>
            <p className="text-[#8A94A6] text-sm mt-3 max-w-xs font-medium">
              Join the elite protocol. Get your biomechanical assessment and a
              custom 6-week programming block.
            </p>
          </div>
        </div>

        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none" />
          <div className="space-y-8 relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2 flex items-center gap-2">
                <ShieldCheck size={14} /> One-Time Access Fee
              </p>
              <div className="flex items-baseline gap-3">
                <h3 className="text-5xl font-black text-white tracking-tighter">
                  ₹{displayPrice}
                </h3>
                {activeCoupon && (
                  <span className="text-[#8A94A6] line-through text-xl font-bold">
                    ₹700
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#8A94A6]">
                Influencer / Promo Code
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag
                    size={14}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A94A6]"
                  />
                  <input
                    type="text"
                    placeholder="e.g. GEMINI30"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-xl py-4 pl-10 pr-4 text-white uppercase font-bold tracking-widest outline-none focus:border-amber-500/50 transition-colors placeholder:text-white/10"
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  className="px-6 rounded-xl bg-white/5 text-white/50 hover:bg-white/10 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Apply
                </button>
              </div>
              {activeCoupon && (
                <p className="text-[9px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1">
                  ✓ Code {activeCoupon} Active
                </p>
              )}
            </div>

            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full py-5 rounded-xl bg-amber-500 text-black font-black text-[12px] uppercase tracking-[0.2em] hover:bg-amber-400 transition-all shadow-[0_10px_30px_rgba(245,158,11,0.2)] active:scale-95 flex justify-center items-center gap-2"
            >
              {isProcessing
                ? "Connecting to Gateway..."
                : "Proceed to Secure Checkout"}
              {!isProcessing && <Zap size={16} />}
            </button>
            <p className="text-[9px] text-[#8A94A6] text-center font-bold uppercase tracking-widest">
              Secured by Razorpay. Includes Platform Access & Phase 1 Protocol.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
