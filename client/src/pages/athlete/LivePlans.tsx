import { useState, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  Users,
  User,
  ShieldCheck,
  Clock,
  Check,
  AlertTriangle,
} from "lucide-react";
import AuthContext from "../../context/AuthContext";
import { loadRazorpayScript } from "../../utils/razorpay";

/* ==========================================================================
   Types & Configuration
   ========================================================================== */
type PlanType = "GROUP" | "ONE_ON_ONE";
type PlanDuration = "ONE_MONTH" | "THREE_MONTHS" | "SIX_MONTHS" | "YEARLY";

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  key: string;
}

interface CreateOrderResponse {
  subscription: unknown;
  razorpayOrder: RazorpayOrder;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface PricingConfig {
  group: Record<PlanDuration, number>;
  oneOnOne: Record<PlanDuration, number>;
}

// Define the specific options expected by the Razorpay constructor
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  theme: {
    color: string;
  };
}

// Tell TypeScript that Window has Razorpay
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

// Full 8-Plan Registry (Marketing Copy)
const plans: { type: PlanType; plan: PlanDuration; features: string[] }[] = [
  {
    type: "GROUP",
    plan: "ONE_MONTH",
    features: ["Live Group Sessions", "Technical Drills", "Community Access"],
  },
  {
    type: "GROUP",
    plan: "THREE_MONTHS",
    features: [
      "Full Quarter Access",
      "Performance Tracking",
      "Priority Support",
    ],
  },
  {
    type: "GROUP",
    plan: "SIX_MONTHS",
    features: ["Bi-Annual Strategy", "Advanced Metrics", "Exclusive Workshops"],
  },
  {
    type: "GROUP",
    plan: "YEARLY",
    features: ["Annual Mastery", "All-Access Pass", "VIP Sector Status"],
  },
  {
    type: "ONE_ON_ONE",
    plan: "ONE_MONTH",
    features: ["Direct Coach Link", "Custom Feedback", "Private Stream"],
  },
  {
    type: "ONE_ON_ONE",
    plan: "THREE_MONTHS",
    features: ["Quarterly Mentorship", "Biometric Analysis", "Shift Support"],
  },
  {
    type: "ONE_ON_ONE",
    plan: "SIX_MONTHS",
    features: ["Elite Performance Plan", "Full Roadmap", "Direct Hotline"],
  },
  {
    type: "ONE_ON_ONE",
    plan: "YEARLY",
    features: [
      "Professional Retainer",
      "Total Transformation",
      "Elite Tier Card",
    ],
  },
];

/* ==========================================================================
   Main Component
   ========================================================================== */
export default function LivePlans() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<PlanType>("GROUP");

  // 🚀 NEW: State to control the Overwrite Consent Modal
  const [pendingPurchase, setPendingPurchase] = useState<{
    type: PlanType;
    plan: PlanDuration;
  } | null>(null);

  const auth = useContext(AuthContext);
  const user = auth?.user;

  useEffect(() => {
    const fetchLiveConfig = async () => {
      try {
        const res = await api.get("/live-config");
        setPricingConfig(res.data.data);
      } catch (error) {
        console.error("Failed to sync pricing telemetry:", error);
        toast.error("Failed to load live protocols.");
      } finally {
        setLoading(false);
      }
    };
    fetchLiveConfig();
  }, []);

  // 🚀 THE OMNI-EXTRACTOR ACTIVE PLAN CHECK
  const initiatePurchase = async (type: PlanType, plan: PlanDuration) => {
    if (!user || !user.sports || !user.isProfileLocked) {
      toast.error(
        "Initialization Required: Please configure your Sport Sector in your Profile before purchasing.",
      );
      navigate("/athlete/profile?onboarding=true");
      return;
    }

    setLoadingId(`${type}-${plan}`);

    try {
      const res = await api.get("/live-subscription/my");
      const responseData = res.data?.data || res.data;

      // 🐛 DEBUG WEAPON: This will print the exact backend data to your browser console!
      console.log("🔍 API Response Data:", responseData);

      let hasActive = false;

      // SCENARIO A: Backend returned the 'State Object' (e.g., { active: {...}, hasActive: true })
      if (
        responseData &&
        typeof responseData === "object" &&
        !Array.isArray(responseData) &&
        "hasActive" in responseData
      ) {
        hasActive = responseData.hasActive === true;
        console.log("👉 Detected State Object. hasActive:", hasActive);
      }
      // SCENARIO B: Backend returned an Array of subscriptions
      else {
        let subsArray: { status: string; isActive?: boolean }[] = [];
        if (Array.isArray(responseData)) {
          subsArray = responseData;
        } else if (Array.isArray(responseData?.subscriptions)) {
          subsArray = responseData.subscriptions;
        }

        hasActive = subsArray.some(
          (sub: { status: string; isActive?: boolean }) =>
            sub.status === "ACTIVE" || sub.isActive === true,
        );
        console.log("👉 Detected Array. hasActive:", hasActive);
      }

      if (hasActive) {
        // 🛑 ACTIVE PLAN DETECTED: Trigger the Warning Modal!
        setPendingPurchase({ type, plan });
      } else {
        // ✅ CLEAR TO PROCEED: Open Razorpay
        await executePurchase(type, plan);
      }
    } catch (error) {
      console.error("Failed to verify active status", error);
      toast.error("Secure connection error. Please try clicking again.");
    } finally {
      setLoadingId(null);
    }
  };

  // Step 2 - The actual Razorpay execution (Your original code)
  const executePurchase = async (type: PlanType, plan: PlanDuration) => {
    try {
      setLoadingId(`${type}-${plan}`);

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Network Error: Failed to load payment gateway.");
        return;
      }

      const res = await api.post<{
        success: boolean;
        data: CreateOrderResponse;
      }>("/live-subscription/order", { type, plan });
      const { razorpayOrder } = res.data.data;

      const options = {
        key: razorpayOrder.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "THE ATHLETIC ZONE",
        description: `${type.replace("_", " ")} - ${plan.replace("_", " ")}`,
        order_id: razorpayOrder.id,
        handler: async (response: RazorpayResponse) => {
          await api.post("/live-subscription/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          toast.success(
            "Deployment Authorized. Old protocols voided (if any).",
          );
          navigate("/athlete/subscriptions");
        },
        theme: { color: "#f59e0b" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment Link Failure", error);
      toast.error("Transmission Error: Check your connection.");
    } finally {
      setLoadingId(null);
      setPendingPurchase(null); // Clear the modal state
    }
  };

  const displayedPlans = plans.filter((p) => p.type === activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-amber-500 font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
          Synchronizing Live Protocols...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] p-10 rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
              Live Deployment <span className="text-amber-500">Plans</span>
            </h1>
            <p className="text-[#8A94A6] text-[10px] font-bold uppercase tracking-[0.3em] mt-3">
              Initialize your tactical training protocol and synchronize with
              elite coaches.
            </p>
          </div>
          <ShieldCheck
            className="text-white/[0.03] absolute right-10 top-1/2 -translate-y-1/2"
            size={120}
          />
        </div>

        {/* 🎚️ THE PREMIUM TOGGLE SWITCH */}
        <div className="flex justify-center">
          <div className="bg-black/40 p-1.5 rounded-full border border-white/[0.05] flex items-center shadow-inner relative">
            <div
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#E5E7EB] rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-out z-0
              ${activeTab === "ONE_ON_ONE" ? "translate-x-full" : "translate-x-0"}`}
            />
            <button
              onClick={() => setActiveTab("GROUP")}
              className={`relative z-10 flex items-center justify-center gap-2 px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-full transition-colors duration-300 w-40
              ${activeTab === "GROUP" ? "text-black" : "text-[#8A94A6] hover:text-white"}`}
            >
              <Users size={14} strokeWidth={3} />
              Group
            </button>
            <button
              onClick={() => setActiveTab("ONE_ON_ONE")}
              className={`relative z-10 flex items-center justify-center gap-2 px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-full transition-colors duration-300 w-40
              ${activeTab === "ONE_ON_ONE" ? "text-black" : "text-[#8A94A6] hover:text-white"}`}
            >
              <User size={14} strokeWidth={3} />
              1-on-1
            </button>
          </div>
        </div>

        {/* Plan Matrix */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 min-h-[500px]">
          <AnimatePresence mode="popLayout">
            {displayedPlans.map((item, idx) => (
              <motion.div
                key={`${item.type}-${item.plan}`}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{
                  duration: 0.4,
                  delay: idx * 0.05,
                  ease: "easeOut",
                }}
                className="group relative bg-[#0F1724]/80 backdrop-blur-md border border-white/[0.05] rounded-[24px] p-8 flex flex-col shadow-[0_15px_35px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-amber-500/30 transition-all duration-500"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/5 blur-[50px] rounded-full group-hover:bg-amber-500/10 transition-colors pointer-events-none" />

                <div className="mb-8 relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`h-10 w-10 rounded-[12px] flex items-center justify-center border transition-colors ${item.type === "ONE_ON_ONE" ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-white/5 border-white/10 text-[#8A94A6]"}`}
                    >
                      {item.type === "ONE_ON_ONE" ? (
                        <User size={18} strokeWidth={3} />
                      ) : (
                        <Users size={18} strokeWidth={3} />
                      )}
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/20">
                      Protocol R2
                    </span>
                  </div>

                  <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-[#8A94A6] mb-2 flex items-center gap-2">
                    <span
                      className={`h-1 w-1 rounded-full ${item.type === "ONE_ON_ONE" ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" : "bg-white/20"}`}
                    />
                    {item.type.replace(/_/g, " ")}
                  </h3>

                  <p className="text-2xl font-black uppercase italic tracking-tighter text-[#E5E7EB] leading-tight mb-2">
                    {item.plan.replace(/_/g, " ")}
                  </p>

                  <div className="flex items-end gap-1 mb-6 border-b border-white/[0.05] pb-6">
                    <span className="text-3xl font-black text-amber-500 italic tracking-tighter group-hover:drop-shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all">
                      {pricingConfig
                        ? `₹${pricingConfig[item.type === "GROUP" ? "group" : "oneOnOne"][item.plan].toLocaleString()}`
                        : "..."}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#8A94A6] mb-1.5">
                      INR /{" "}
                      {
                        {
                          ONE_MONTH: "month",
                          THREE_MONTHS: "3 months",
                          SIX_MONTHS: "6 months",
                          YEARLY: "year",
                        }[item.plan]
                      }
                    </span>
                  </div>

                  <ul className="space-y-3">
                    {item.features.map((feature, fIdx) => (
                      <li
                        key={fIdx}
                        className="flex items-center gap-2 text-[9px] font-bold text-[#8A94A6]/60 uppercase tracking-widest"
                      >
                        <Check
                          size={10}
                          className="text-amber-500"
                          strokeWidth={4}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto relative z-10 pt-6 border-t border-white/[0.05]">
                  <button
                    onClick={() => initiatePurchase(item.type, item.plan)}
                    disabled={loadingId === `${item.type}-${item.plan}`}
                    className="w-full px-6 py-4 rounded-[12px] bg-[#E5E7EB] text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-500 hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all active:scale-95 disabled:opacity-20 shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
                  >
                    {loadingId === `${item.type}-${item.plan}`
                      ? "Establishing Link..."
                      : "Authorize Deployment"}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer Meta */}
        <div className="pt-12 border-t border-white/[0.05] flex justify-between items-center text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock size={12} /> Live Node Active
            </div>
            <div className="h-1 w-1 rounded-full bg-white/10" />
            <div>Encrypted Transaction Tunnel</div>
          </div>
          <div>Registry V.2.0.4 • 2026</div>
        </div>
      </div>

      {/* 🚨 OVERWRITE CONSENT MODAL */}
      {pendingPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setPendingPurchase(null)}
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-md bg-[#0F1724] border border-amber-500/30 rounded-[24px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle
                  size={24}
                  className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                />
              </div>
            </div>

            <h2 className="text-xl font-black uppercase tracking-tighter text-white text-center mb-4">
              Active Protocol Detected
            </h2>

            <p className="text-xs text-[#8A94A6] text-center mb-8 font-medium leading-relaxed">
              You currently have an active deployment plan. Authorizing this new
              protocol will{" "}
              <span className="text-red-400 font-bold uppercase tracking-widest mx-1">
                overwrite and void
              </span>{" "}
              your existing access. Do you wish to proceed?
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setPendingPurchase(null)}
                className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-[#E5E7EB] text-[10px] font-black uppercase tracking-widest rounded-[12px] transition-colors border border-white/10"
              >
                Abort
              </button>
              <button
                onClick={() =>
                  executePurchase(pendingPurchase.type, pendingPurchase.plan)
                }
                className="flex-1 py-4 bg-red-500 hover:bg-red-400 text-white text-[10px] font-black uppercase tracking-widest rounded-[12px] transition-all active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] border border-red-500"
              >
                Overwrite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
