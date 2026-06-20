import { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Search,
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Tag,
  FileText,
  Video,
  Activity,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface Athlete {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  createdAt: string;
  platformState?: {
    status: string;
    hasPaidEntryFee: boolean;
    usedCoupon: string | null;
  };
}
interface AssessmentData {
  // targetEvent and pastInjuries removed!
  physical?: {
    age?: number;
    bodyweightKg?: number;
    heightCm?: number;
    trainingAgeYears?: number; // 🚀 Added this instead!
  };
  metrics?: {
    sprinting?: {
      sprintVideoUrl?: string;
    };
  };
}
export default function AdminAthletes() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(
    null,
  );
  const [loadingAssessment, setLoadingAssessment] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🚀 NEW: Fetch Assessment Function
  const openAssessmentReview = async (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setIsModalOpen(true);
    setLoadingAssessment(true);
    setAssessmentData(null);

    try {
      // 🚀 FIX 1: Point to the dedicated Admin endpoint we just created
      const res = await api.get(`/admin/athletes/${athlete._id}/assessment`);

      // 🚀 FIX 2: Our new backend controller sends the exact object, so we don't need messy Array checks!
      setAssessmentData(res.data.data);
    } catch (err) {
      // 🚀 FIX: Remove 'any' from the catch parameter, and safely cast it inside!
      const apiError = err as {
        response?: { data?: unknown };
        message?: string;
      };
      console.error(
        "Backend Error:",
        apiError.response?.data || apiError.message,
      );
    } finally {
      setLoadingAssessment(false);
    }
  };

  useEffect(() => {
    fetchAthletes();
  }, []);

  const fetchAthletes = async () => {
    try {
      const res = await api.get("/admin/athletes");
      setAthletes(res.data.data);
    } catch (error) {
      console.error("Failed to fetch athletes", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter athletes based on the search term (name or email)
  const filteredAthletes = athletes.filter(
    (athlete) =>
      athlete.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      athlete.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Helper to render the correct UI badge for their algorithm status
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "ACTIVE_TRAINING":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg text-[9px] font-black tracking-widest uppercase">
            <CheckCircle size={10} /> Active
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg text-[9px] font-black tracking-widest uppercase">
            <Clock size={10} /> Processing
          </span>
        );
      case "NEEDS_ASSESSMENT":
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[9px] font-black tracking-widest uppercase">
            <AlertTriangle size={10} /> Assessment Required
          </span>
        );
    }
  };

  return (
    <div className="relative min-h-screen space-y-6 md:space-y-10 p-2 md:p-4 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-[#121821] p-6 md:p-8 rounded-3xl border border-white/5 relative overflow-hidden gap-6 shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase text-white">
            Athlete <span className="text-amber-500">Roster</span>
          </h1>
          <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase mt-2">
            Monitor admissions, financial status, and algorithmic deployment.
          </p>
        </div>

        {/* Live Search Bar */}
        <div className="relative w-full xl:w-96 z-10">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
            size={18}
          />
          <input
            type="text"
            placeholder="Search roster by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-[11px] font-black text-white placeholder:text-white/20 uppercase tracking-widest focus:border-amber-500/50 outline-none transition-all"
          />
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-[#121821] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl relative">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : filteredAthletes.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-white/30 space-y-4">
            <User size={48} className="opacity-20" />
            <p className="text-xs font-black uppercase tracking-widest">
              No athletes found on roster.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-black/40 border-b border-white/5">
                  <th className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6]">
                    Athlete Identity
                  </th>
                  <th className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6]">
                    Join Date
                  </th>
                  <th className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6]">
                    Financial Status
                  </th>
                  <th className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6]">
                    Promo Code
                  </th>
                  <th className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6]">
                    System Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAthletes.map((athlete) => (
                  <tr
                    key={athlete._id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Athlete Identity */}

                    <td className="py-4 px-6">
                      {/* 🚀 NEW: Wrapped in a button to trigger the modal */}
                      <button
                        onClick={() => openAssessmentReview(athlete)}
                        className="flex items-center gap-4 text-left group/btn cursor-pointer transition-all w-full"
                      >
                        <div className="h-10 w-10 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center overflow-hidden group-hover/btn:border-amber-500/50 group-hover/btn:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all">
                          {athlete.profileImage ? (
                            <img
                              src={athlete.profileImage}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={16} className="text-amber-500/50" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white uppercase tracking-tight group-hover/btn:text-amber-500 transition-colors">
                            {athlete.name}
                          </p>
                          <p className="text-[10px] font-black tracking-widest text-[#8A94A6] uppercase mt-0.5">
                            {athlete.email}
                          </p>
                        </div>
                      </button>
                    </td>

                    {/* Join Date */}
                    <td className="py-4 px-6">
                      <p className="text-[11px] font-black text-white/70 uppercase tracking-widest">
                        {new Date(athlete.createdAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}
                      </p>
                    </td>

                    {/* Financial Status */}
                    <td className="py-4 px-6">
                      {athlete.platformState?.hasPaidEntryFee ? (
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-green-500 uppercase tracking-widest">
                          <ShieldCheck size={14} /> CLEARED
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-red-500/50 uppercase tracking-widest">
                          PENDING PAYMENT
                        </div>
                      )}
                    </td>

                    {/* Promo Code Used */}
                    <td className="py-4 px-6">
                      {athlete.platformState?.usedCoupon ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg text-[9px] font-black tracking-widest uppercase">
                          <Tag size={10} /> {athlete.platformState.usedCoupon}
                        </div>
                      ) : (
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                          - NONE -
                        </span>
                      )}
                    </td>

                    {/* System Status */}
                    <td className="py-4 px-6">
                      {getStatusBadge(athlete.platformState?.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* 🚀 NEW: THE ASSESSMENT REVIEW MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#0B0F14]/90 backdrop-blur-md cursor-pointer"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-[#121821] border border-white/10 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/20">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                    <Activity size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">
                      Assessment <span className="text-amber-500">Review</span>
                    </h3>
                    <p className="text-[10px] font-black text-[#8A94A6] uppercase tracking-[0.2em] mt-1">
                      Athlete: {selectedAthlete?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                {loadingAssessment ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-4">
                    <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6]">
                      Retrieving Assessment Files...
                    </p>
                  </div>
                ) : !assessmentData ? (
                  <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                    <AlertTriangle size={48} className="text-red-500/30" />
                    <div>
                      <p className="text-sm font-bold text-white uppercase tracking-widest">
                        No Assessment Found
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] mt-2">
                        This athlete has not completed their form yet.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: The Sprint Video */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-amber-500 text-[10px] font-black uppercase tracking-widest">
                        <Video size={14} /> Sprint Footage
                      </div>
                      <div className="aspect-video bg-black rounded-2xl border border-white/10 overflow-hidden relative group">
                        {/* 🚀 FIXED: Pointed to metrics.sprinting.sprintVideoUrl */}
                        {assessmentData.metrics?.sprinting?.sprintVideoUrl ? (
                          <video
                            src={
                              assessmentData.metrics.sprinting.sprintVideoUrl
                            }
                            controls
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-white/20 text-xs font-black uppercase tracking-widest">
                            No Video Provided
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: The Data Points */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-amber-500 text-[10px] font-black uppercase tracking-widest">
                        <FileText size={14} /> Physical Metrics
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/30 border border-white/5 p-4 rounded-xl">
                          <p className="text-[9px] font-black text-[#8A94A6] uppercase tracking-[0.2em] mb-1">
                            Age
                          </p>
                          <p className="text-lg font-black text-white">
                            {assessmentData.physical?.age || "--"} Yrs
                          </p>
                        </div>
                        <div className="bg-black/30 border border-white/5 p-4 rounded-xl">
                          <p className="text-[9px] font-black text-[#8A94A6] uppercase tracking-[0.2em] mb-1">
                            Weight
                          </p>
                          <p className="text-lg font-black text-white">
                            {assessmentData.physical?.bodyweightKg || "--"} KG
                          </p>
                        </div>
                        <div className="bg-black/30 border border-white/5 p-4 rounded-xl">
                          <p className="text-[9px] font-black text-[#8A94A6] uppercase tracking-[0.2em] mb-1">
                            Height
                          </p>
                          <p className="text-lg font-black text-white">
                            {assessmentData.physical?.heightCm || "--"} CM
                          </p>
                        </div>
                        <div className="bg-black/30 border border-white/5 p-4 rounded-xl">
                          <p className="text-[9px] font-black text-[#8A94A6] uppercase tracking-[0.2em] mb-1">
                            Training Age
                          </p>
                          {/* 🚀 Swapped Focus Event for Training Age */}
                          <p className="text-lg font-black text-white">
                            {assessmentData.physical?.trainingAgeYears || "0"}{" "}
                            Yrs
                          </p>
                        </div>
                      </div>

                      {/* Note: The Past Injuries block has been completely removed! */}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
