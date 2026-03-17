import { useEffect, useState } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { Star, ShoppingCart, CheckCircle, Megaphone } from "lucide-react";
import { loadRazorpayScript } from "../../utils/razorpay";

/* ==========================================================================
   Types & Interfaces
   ========================================================================== */
interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  price: number;
  averageRating?: number;
  totalReviews?: number;
}

interface PurchasedCourse {
  _id: string;
  course: { _id: string };
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

type RazorpayConstructor = new (options: {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  theme?: { color: string };
}) => { open: () => void };

/* ==========================================================================
   Main Component
   ========================================================================== */
export default function CoursesMarketplace() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [ownedCourses, setOwnedCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<number>(0);

  const filteredCourses = courses.filter((course) => {
    if (ratingFilter === 0) return true;
    return (course.averageRating || 0) >= ratingFilter;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [publicRes, myRes] = await Promise.allSettled([
          api.get<{ data: Course[] }>("/courses/public"),
          api.get<{ data: PurchasedCourse[] }>("/course-purchase/my"),
        ]);

        if (publicRes.status === "fulfilled" && publicRes.value.data?.data) {
          setCourses(publicRes.value.data.data);
        } else {
          toast.error("Failed to sync with the Training Vault.");
        }

        if (myRes.status === "fulfilled" && myRes.value.data?.data) {
          setOwnedCourses(myRes.value.data.data.map((p) => p.course._id));
        } else {
          setOwnedCourses([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBuy = async (courseId: string) => {
    if (processingId) return;
    try {
      setProcessingId(courseId);

      // 🚀 NEW: Load Razorpay dynamically (Just-In-Time)
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error("Network Error: Failed to load payment gateway.");
        setProcessingId(null);
        return;
      }

      const orderRes = await api.post("/course-purchase/create-order", {
        courseId,
      });
      const { razorpayOrder } = orderRes.data.data;
      const Razorpay = (window as unknown as { Razorpay: RazorpayConstructor })
        .Razorpay;

      const rzp = new Razorpay({
        key: razorpayOrder.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.id,
        theme: { color: "#f59e0b" },
        handler: async (response: RazorpayResponse) => {
          try {
            await api.post("/course-purchase/verify", {
              courseId: courseId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setOwnedCourses((prev) => [...prev, courseId]);
            toast.success("Module acquired successfully! 🚀");
          } catch (verifyError) {
            console.error("Verification failed", verifyError);
            toast.error("Payment processed, but backend verification failed.");
          }
        },
      });
      rzp.open();
    } catch (error) {
      console.error("Payment setup failed", error);
      toast.error("Payment setup failed. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-full overflow-hidden">
        {/* Ambient Radial Lighting Spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />

        <div className="relative z-10 space-y-12 max-w-7xl mx-auto animate-pulse">
          {/* Premium Header Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#0F1724]/40 border border-white/[0.02] p-10 rounded-[16px] gap-8">
            <div>
              <div className="h-10 w-64 bg-white/5 rounded-md mb-4" />
              <div className="h-3 w-80 max-w-full bg-white/5 rounded-md" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-3 w-20 bg-white/5 rounded-md hidden md:block" />
              <div className="h-12 w-40 bg-white/5 rounded-[12px]" />
            </div>
          </div>

          {/* Course Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex flex-col bg-[#0F1724]/40 border border-white/[0.02] rounded-[24px] overflow-hidden"
              >
                {/* Visual Cover Asset Skeleton */}
                <div className="aspect-video bg-white/5" />

                <div className="p-8 flex flex-col flex-1">
                  <div className="h-6 w-3/4 bg-white/5 rounded-md mb-5" />

                  {/* Description lines */}
                  <div className="space-y-3 mb-10">
                    <div className="h-2 w-full bg-white/5 rounded-md" />
                    <div className="h-2 w-5/6 bg-white/5 rounded-md" />
                    <div className="h-2 w-4/6 bg-white/5 rounded-md" />
                  </div>

                  {/* Footer Skeleton */}
                  <div className="mt-auto flex justify-between items-center pt-8 border-t border-white/[0.05]">
                    <div className="space-y-2">
                      <div className="h-2 w-20 bg-white/5 rounded-md" />
                      <div className="h-8 w-24 bg-white/5 rounded-md" />
                    </div>
                    <div className="h-[52px] w-[120px] bg-white/5 rounded-[12px]" />
                  </div>
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
      {/* 🔦 Ambient Radial Lighting Spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto">
        {/* Premium Header */}
        <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] p-10 rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] gap-8">
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
              Training <span className="text-amber-500">Vault</span>
            </h1>
            <p className="text-[#8A94A6] text-[10px] font-bold uppercase tracking-[0.3em] mt-3">
              Elite Modules Engineered for Professional Performance.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <span className="text-[9px] text-[#8A94A6] uppercase tracking-[0.3em] font-black">
              Sort Logic
            </span>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(Number(e.target.value))}
              className="bg-black/40 border border-white/[0.05] text-[#E5E7EB] text-[10px] font-black uppercase tracking-widest px-6 py-4 rounded-[12px] outline-none focus:border-amber-500/50 transition-all cursor-pointer appearance-none shadow-inner"
            >
              <option value={0} className="bg-[#0F1724]">
                All Levels
              </option>
              <option value={4} className="bg-[#0F1724]">
                4.0+ Analytics
              </option>
              <option value={3} className="bg-[#0F1724]">
                3.0+ Analytics
              </option>
            </select>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
          {filteredCourses.map((course) => {
            const isOwned = ownedCourses.includes(course._id);
            return (
              <div
                key={course._id}
                className="group relative flex flex-col bg-[#0F1724]/80 backdrop-blur-md border border-white/[0.05] rounded-[24px] overflow-hidden transition-all duration-500 hover:border-amber-500/30 shadow-[0_15px_35px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                {/* Visual Cover Asset */}
                <div className="relative aspect-video bg-black/60 overflow-hidden">
                  <img
                    src={course.thumbnailUrl?.replace("http://", "https://")}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 opacity-60 group-hover:opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F1724] via-transparent to-transparent" />

                  {/* Rating Telemetry */}
                  <div className="absolute bottom-4 left-6 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/[0.05] shadow-lg">
                    <Star size={10} className="text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-black text-[#E5E7EB] tracking-tighter">
                      {course.averageRating?.toFixed(1) || "NEW"}
                    </span>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1 relative">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

                  <div className="relative z-10">
                    <h2 className="text-xl font-black text-[#E5E7EB] tracking-tighter mb-3 uppercase italic leading-tight group-hover:text-amber-500 transition-colors">
                      {course.title}
                    </h2>
                    <p className="text-[11px] text-[#8A94A6] line-clamp-3 leading-relaxed mb-10 font-medium">
                      {course.description}
                    </p>
                  </div>

                  <div className="relative z-10 mt-auto flex justify-between items-center pt-8 border-t border-white/[0.05]">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-[#8A94A6] uppercase tracking-[0.2em] mb-1">
                        Authorization Fee
                      </span>
                      <span className="text-2xl font-black text-[#E5E7EB] italic tracking-tighter">
                        ₹{course.price.toLocaleString()}
                      </span>
                    </div>

                    {isOwned ? (
                      <div className="flex items-center gap-2 px-6 py-3 rounded-[12px] bg-green-500/5 text-green-500 text-[10px] font-black uppercase tracking-[0.2em] border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)] backdrop-blur-md">
                        <CheckCircle size={14} strokeWidth={3} /> Verified
                      </div>
                    ) : (
                      <button
                        onClick={() => handleBuy(course._id)}
                        className="flex items-center gap-3 px-8 py-4 bg-[#E5E7EB] text-black text-[10px] font-black uppercase tracking-widest rounded-[12px] hover:bg-amber-500 hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all active:scale-95 shadow-[0_10px_20px_rgba(0,0,0,0.2)]"
                      >
                        <ShoppingCart size={14} strokeWidth={3} /> Acquire
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 🎬 PREMIUM GLASSMORPHIC "COMING SOON" EMPTY STATE */}
        {filteredCourses.length === 0 && (
          <div className="relative w-full max-w-4xl mx-auto overflow-hidden rounded-[24px] bg-[#0F1724]/60 backdrop-blur-2xl border border-white/[0.05] shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] py-20 md:py-28 flex flex-col items-center justify-center group mb-10">
            {/* Ambient Amber Core Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />

            {/* Subtle Tactical Grid Overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

            <div className="relative z-10 flex flex-col items-center">
              {/* Glowing Megaphone Icon */}
              <div className="mb-10 relative">
                <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full animate-pulse" />
                <div className="w-20 h-20 rounded-2xl bg-black/40 border border-amber-500/20 shadow-inner flex items-center justify-center relative z-10 transform -rotate-12 group-hover:scale-110 transition-transform duration-500">
                  <Megaphone
                    size={36}
                    className="text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                  />
                </div>
              </div>

              {/* Premium Skewed Typography */}
              <div className="flex flex-col items-center leading-none space-y-2">
                <div className="bg-black/60 backdrop-blur-md border border-white/5 px-10 pt-5 pb-3 transform -skew-x-12 shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-20">
                  <h2 className="text-5xl md:text-[70px] font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-white/40 uppercase tracking-tighter italic transform skew-x-12 leading-none drop-shadow-md">
                    Coming
                  </h2>
                </div>
                <div className="bg-black/60 backdrop-blur-md border border-amber-500/20 px-10 pt-4 pb-4 transform -skew-x-12 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative md:-right-10 z-10 overflow-hidden">
                  <div className="absolute inset-0 bg-amber-500/5" />
                  <h2 className="text-5xl md:text-[70px] font-black text-amber-500 uppercase tracking-tighter italic transform skew-x-12 leading-none drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                    Soon
                  </h2>
                </div>
              </div>

              {/* Lower Frosted Tagline */}
              <div className="mt-12 bg-black/40 backdrop-blur-md px-8 py-4 rounded-[12px] border border-white/5 shadow-inner">
                <span className="text-[#8A94A6] text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                  Elite Training Modules Pending
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* System Info */}
        <div className="pt-12 border-t border-white/[0.05] flex justify-between items-center text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">
          <div>Core Node: R2-GLOBAL-ACTIVE</div>
          <div>Training Vault V.2.0.4-SECURE</div>
        </div>
      </div>
    </div>
  );
}
