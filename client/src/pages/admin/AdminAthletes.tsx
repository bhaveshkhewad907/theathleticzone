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
  Zap,
  Timer,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  History,
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

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// 🚀 UPDATED INTERFACE: Includes History, Months, and 100m/200m
interface AssessmentData {
  _id: string;
  createdAt: string;
  physical?: {
    age?: number;
    bodyweightKg?: number;
    heightCm?: number;
    trainingAgeYears?: number;
    trainingAgeMonths?: number;
  };
  metrics?: {
    mobility?: { kneeToWallCm?: number; deepSquatHold?: string };
    power?: { broadJumpMeters?: number; verticalJumpCm?: number };
    sprinting?: {
      sprint30mSeconds?: number;
      sprint100mSeconds?: number;
      sprint200mSeconds?: number;
      sprintVideoUrl?: string;
    };
    strength?: { backSquatMaxKg?: number };
  };
}

export default function AdminAthletes() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingAssessment, setLoadingAssessment] = useState(false);

  // 🚀 HISTORY STATE: Holds all assessments and tracks which one is currently selected
  const [assessmentHistory, setAssessmentHistory] = useState<AssessmentData[]>(
    [],
  );
  const [selectedAssessmentIndex, setSelectedAssessmentIndex] = useState(0);

  const openAssessmentReview = async (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setIsModalOpen(true);
    setLoadingAssessment(true);
    setAssessmentHistory([]);
    setSelectedAssessmentIndex(0);

    try {
      // Fetch the array of assessments from the updated backend
      const res = await api.get(`/admin/athletes/${athlete._id}/assessments`);
      setAssessmentHistory(res.data.data);
    } catch (err) {
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

  const fetchAthletes = async (page: number, search: string) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/admin/athletes?page=${page}&limit=10&search=${search}`,
      );
      setAthletes(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error("Failed to fetch athletes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAthletes(currentPage, searchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchAthletes(1, searchTerm);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "ACTIVE_TRAINING":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg text-[9px] font-black tracking-widest uppercase w-max">
            <CheckCircle size={10} /> Active
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg text-[9px] font-black tracking-widest uppercase w-max">
            <Clock size={10} /> Processing
          </span>
        );
      case "NEEDS_ASSESSMENT":
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[9px] font-black tracking-widest uppercase w-max">
            <AlertTriangle size={10} /> Assessment Required
          </span>
        );
    }
  };

  // 🚀 ACTIVE DATA SELECTOR
  const currentAssessment = assessmentHistory[selectedAssessmentIndex];

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
            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-[11px] font-black text-white placeholder:text-white/20 uppercase tracking-widest focus:border-amber-500/50 outline-none transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-[#121821] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl relative flex flex-col">
        {loading && athletes.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : athletes.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-white/30 space-y-4">
            <User size={48} className="opacity-20" />
            <p className="text-xs font-black uppercase tracking-widest">
              No athletes found.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1">
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
                  {athletes.map((athlete) => (
                    <tr
                      key={athlete._id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="py-4 px-6">
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
                      <td className="py-4 px-6">
                        <p className="text-[11px] font-black text-white/70 uppercase tracking-widest">
                          {new Date(athlete.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </p>
                      </td>
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
                      <td className="py-4 px-6">
                        {getStatusBadge(athlete.platformState?.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* SERVER-SIDE PAGINATION CONTROLS */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-black/20 border-t border-white/5 gap-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8A94A6]">
                  Showing{" "}
                  <span className="text-white">
                    {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="text-white">
                    {Math.min(
                      pagination.currentPage * pagination.itemsPerPage,
                      pagination.totalItems,
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="text-amber-500">
                    {pagination.totalItems}
                  </span>{" "}
                  Athletes
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/40 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 disabled:opacity-30 disabled:hover:bg-black/40 disabled:hover:border-white/10 transition-all shadow-inner"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="flex items-center gap-1 px-2">
                    {[...Array(pagination.totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl text-[11px] font-black transition-all ${currentPage === pageNum ? "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "bg-transparent text-white/50 hover:bg-white/5 hover:text-white"}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/40 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 disabled:opacity-30 disabled:hover:bg-black/40 disabled:hover:border-white/10 transition-all shadow-inner"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 🚀 THE ASSESSMENT REVIEW MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#0B0F14]/90 backdrop-blur-md cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-[#121821] border border-white/10 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-white/5 bg-black/20 gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
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

                <div className="flex items-center gap-4 w-full sm:w-auto">
                  {/* 🚀 HISTORY SELECTOR DROPDOWN */}
                  {assessmentHistory.length > 0 && (
                    <div className="relative w-full sm:w-auto flex-1">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none">
                        <History size={14} />
                      </div>
                      <select
                        value={selectedAssessmentIndex}
                        onChange={(e) =>
                          setSelectedAssessmentIndex(Number(e.target.value))
                        }
                        className="w-full sm:w-48 appearance-none bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-[10px] font-black text-white uppercase tracking-widest focus:border-amber-500 outline-none cursor-pointer shadow-inner"
                      >
                        {assessmentHistory.map((assessment, index) => (
                          <option
                            key={assessment._id}
                            value={index}
                            className="bg-[#121821] text-white"
                          >
                            {index === 0 ? "Latest: " : "History: "}
                            {new Date(assessment.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                        <ChevronRight size={14} className="rotate-90" />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-10 h-10 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar bg-[#0B0F14]/50">
                {loadingAssessment ? (
                  <div className="h-64 flex flex-col items-center justify-center gap-4">
                    <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6]">
                      Retrieving Assessment History...
                    </p>
                  </div>
                ) : !currentAssessment ? (
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
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 w-full col-span-2">
                      <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-2 text-amber-500 text-[10px] font-black uppercase tracking-widest">
                          <Video size={14} /> Sprint Footage
                        </div>
                        <div className="aspect-[9/16] md:aspect-video bg-black rounded-2xl border border-white/10 overflow-hidden relative group lg:sticky lg:top-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                          {(() => {
                            const rawUrl =
                              currentAssessment.metrics?.sprinting
                                ?.sprintVideoUrl;
                            if (!rawUrl)
                              return (
                                <div className="absolute inset-0 flex items-center justify-center text-white/20 text-xs font-black uppercase tracking-widest">
                                  No Tape Provided
                                </div>
                              );
                            const R2_PUBLIC_DOMAIN =
                              "https://media.theathleticzone.in";
                            const videoSrc = rawUrl.startsWith("http")
                              ? rawUrl
                              : `${R2_PUBLIC_DOMAIN}/${rawUrl}`;
                            return (
                              <video
                                src={videoSrc}
                                controls
                                playsInline
                                className="w-full h-full object-contain bg-black"
                              />
                            );
                          })()}
                        </div>
                      </div>

                      <div className="lg:col-span-3 space-y-8 pr-2 pb-8 lg:max-h-[60vh] overflow-y-auto custom-scrollbar">
                        {/* PHYSICAL PROFILE */}
                        <div>
                          <div className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-widest border-b border-white/10 pb-2 mb-4">
                            <FileText size={14} className="text-amber-500" /> 1.
                            Physical Profile
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-[#121821]/80 border border-white/5 p-4 rounded-xl shadow-inner">
                              <p className="text-[9px] font-black text-[#8A94A6] uppercase tracking-[0.2em] mb-1">
                                Age
                              </p>
                              <p className="text-sm font-black text-white">
                                {currentAssessment.physical?.age || "--"} Yrs
                              </p>
                            </div>
                            <div className="bg-[#121821]/80 border border-white/5 p-4 rounded-xl shadow-inner">
                              <p className="text-[9px] font-black text-[#8A94A6] uppercase tracking-[0.2em] mb-1">
                                Weight
                              </p>
                              <p className="text-sm font-black text-white">
                                {currentAssessment.physical?.bodyweightKg ||
                                  "--"}{" "}
                                KG
                              </p>
                            </div>
                            <div className="bg-[#121821]/80 border border-white/5 p-4 rounded-xl shadow-inner">
                              <p className="text-[9px] font-black text-[#8A94A6] uppercase tracking-[0.2em] mb-1">
                                Height
                              </p>
                              <p className="text-sm font-black text-white">
                                {currentAssessment.physical?.heightCm || "--"}{" "}
                                CM
                              </p>
                            </div>
                            <div className="bg-[#121821]/80 border border-white/5 p-4 rounded-xl shadow-inner">
                              <p className="text-[9px] font-black text-[#8A94A6] uppercase tracking-[0.2em] mb-1">
                                Training
                              </p>
                              <p className="text-sm font-black text-white">
                                {/* 🚀 RENDERS BOTH YEARS AND MONTHS */}
                                {currentAssessment.physical?.trainingAgeYears ||
                                  "0"}
                                y{" "}
                                {currentAssessment.physical?.trainingAgeMonths
                                  ? `${currentAssessment.physical.trainingAgeMonths}m`
                                  : ""}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* MOBILITY */}
                        <div>
                          <div className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-widest border-b border-white/10 pb-2 mb-4">
                            <Activity size={14} className="text-amber-500" /> 2.
                            Mobility
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-[#121821]/80 border border-white/5 p-4 rounded-xl shadow-inner">
                              <p className="text-[9px] font-black text-[#8A94A6] uppercase tracking-[0.2em] mb-1">
                                Knee-to-Wall
                              </p>
                              <p className="text-lg font-black text-white">
                                {currentAssessment.metrics?.mobility
                                  ?.kneeToWallCm || "--"}{" "}
                                <span className="text-xs text-white/40">
                                  CM
                                </span>
                              </p>
                            </div>
                            <div className="bg-[#121821]/80 border border-white/5 p-4 rounded-xl shadow-inner">
                              <p className="text-[9px] font-black text-[#8A94A6] uppercase tracking-[0.2em] mb-1">
                                Deep Squat
                              </p>
                              <p
                                className={`text-sm font-black uppercase tracking-widest ${currentAssessment.metrics?.mobility?.deepSquatHold === "Good" ? "text-green-500" : currentAssessment.metrics?.mobility?.deepSquatHold === "Acceptable" ? "text-amber-500" : "text-red-500"}`}
                              >
                                {currentAssessment.metrics?.mobility
                                  ?.deepSquatHold || "--"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* POWER */}
                        <div>
                          <div className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-widest border-b border-white/10 pb-2 mb-4">
                            <Zap size={14} className="text-amber-500" /> 3.
                            Power
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-[#121821]/80 border border-white/5 p-4 rounded-xl shadow-inner">
                              <p className="text-[9px] font-black text-[#8A94A6] uppercase tracking-[0.2em] mb-1">
                                Broad Jump
                              </p>
                              <p className="text-lg font-black text-white">
                                {currentAssessment.metrics?.power
                                  ?.broadJumpMeters || "--"}{" "}
                                <span className="text-xs text-white/40">M</span>
                              </p>
                            </div>
                            <div className="bg-[#121821]/80 border border-white/5 p-4 rounded-xl shadow-inner">
                              <p className="text-[9px] font-black text-[#8A94A6] uppercase tracking-[0.2em] mb-1">
                                Vertical Jump
                              </p>
                              <p className="text-lg font-black text-white">
                                {currentAssessment.metrics?.power
                                  ?.verticalJumpCm || "--"}{" "}
                                <span className="text-xs text-white/40">
                                  CM
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* SPEED (Now displays 30m, 100m, 200m) */}
                        <div>
                          <div className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-widest border-b border-white/10 pb-2 mb-4">
                            <Timer size={14} className="text-amber-500" /> 4.
                            Speed Metrics
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl shadow-inner text-center">
                              <p className="text-[9px] font-black text-amber-500/80 uppercase tracking-[0.2em] mb-1">
                                30m Time
                              </p>
                              <p className="text-xl font-black italic text-amber-500">
                                {currentAssessment.metrics?.sprinting
                                  ?.sprint30mSeconds || "--"}{" "}
                                <span className="text-xs text-amber-500/50 not-italic">
                                  s
                                </span>
                              </p>
                            </div>
                            <div className="bg-[#121821]/80 border border-white/5 p-4 rounded-xl shadow-inner text-center">
                              <p className="text-[9px] font-black text-[#8A94A6] uppercase tracking-[0.2em] mb-1">
                                100m Time
                              </p>
                              <p className="text-xl font-black italic text-white">
                                {currentAssessment.metrics?.sprinting
                                  ?.sprint100mSeconds || "--"}{" "}
                                <span className="text-xs text-white/40 not-italic">
                                  s
                                </span>
                              </p>
                            </div>
                            <div className="bg-[#121821]/80 border border-white/5 p-4 rounded-xl shadow-inner text-center">
                              <p className="text-[9px] font-black text-[#8A94A6] uppercase tracking-[0.2em] mb-1">
                                200m Time
                              </p>
                              <p className="text-xl font-black italic text-white">
                                {currentAssessment.metrics?.sprinting
                                  ?.sprint200mSeconds || "--"}{" "}
                                <span className="text-xs text-white/40 not-italic">
                                  s
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* STRENGTH */}
                        <div>
                          <div className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-widest border-b border-white/10 pb-2 mb-4">
                            <Dumbbell size={14} className="text-amber-500" /> 5.
                            Strength
                          </div>
                          <div className="bg-[#121821]/80 border border-white/5 p-5 rounded-xl shadow-inner">
                            <p className="text-[9px] font-black text-[#8A94A6] uppercase tracking-[0.2em] mb-1">
                              Back Squat Max
                            </p>
                            <p className="text-2xl font-black italic text-white">
                              {currentAssessment.metrics?.strength
                                ?.backSquatMaxKg || "--"}{" "}
                              <span className="text-sm text-white/40 not-italic">
                                KG
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
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
