import { useEffect, useState, Fragment } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  X,
  FileText,
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";

/* ================================
   Types & Interfaces
================================ */
interface HistoryItem {
  _id?: string;
  scheduledDate: string;
  scheduledTime: string;
  notes?: {
    summary: string;
    intensity: "LOW" | "MEDIUM" | "HIGH" | string;
  };
  personalFeedback?: string;
  type: string;
  attendance: {
    status: "PRESENT" | "LATE" | "NO_SHOW" | string;
  };
}

export default function AttendanceHistory() {
  const [data, setData] = useState<HistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<HistoryItem | null>(
    null,
  );

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await api.get(
          `/athlete/attendance-history?page=${page}&limit=10`,
        );
        setData(res.data.data.data || []);
        setTotal(res.data.data.total || 0);
      } catch (error) {
        console.error("Failed to load performance ledger", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [page]);

  /* ================================
     Badge Resolver
  ================================ */
  const getStatusBadge = (status: string) => {
    const baseClass =
      "flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md border shadow-inner";

    switch (status) {
      case "PRESENT":
        return (
          <span
            className={`${baseClass} bg-green-500/10 border-green-500/20 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]`}
          >
            <CheckCircle2 size={12} strokeWidth={3} /> Full Completion
          </span>
        );
      case "LATE":
        return (
          <span
            className={`${baseClass} bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]`}
          >
            <AlertCircle size={12} strokeWidth={3} /> Late Entry
          </span>
        );
      case "NO_SHOW":
      case "MISSED":
        return (
          <span
            className={`${baseClass} bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]`}
          >
            <XCircle size={12} strokeWidth={3} /> Critical Miss
          </span>
        );
      default:
        return (
          <span
            className={`${baseClass} bg-white/5 border-white/10 text-[#8A94A6]`}
          >
            {status}
          </span>
        );
    }
  };

  return (
    <div className="relative min-h-full">
      {/* 🔦 Ambient Radial Lighting Spotlight */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 space-y-10 animate-in fade-in duration-700 max-w-5xl mx-auto">
        {/* Premium Header */}
        <div className="relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] p-8 rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] gap-6">
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
              Performance <span className="text-amber-500">Ledger</span>
            </h1>
            <p className="text-[#8A94A6] text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
              Historical Deployment & Attendance Records
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 px-6 py-3 rounded-full bg-black/40 border border-white/[0.05] shadow-inner">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#8A94A6]">
              Total Records
            </span>
            <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
            <span className="text-sm font-black italic text-[#E5E7EB]">
              {total}
            </span>
          </div>
        </div>

        {/* Ledger Main Panel */}
        <div className="bg-[#0F1724]/80 backdrop-blur-md border border-white/[0.05] rounded-[24px] p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] min-h-[500px] flex flex-col overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

          {loading ? (
            <div className="flex-1 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-amber-500 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
              Querying Intelligence Database...
            </div>
          ) : data.length === 0 ? (
            <div className="flex-1 flex items-center justify-center flex-col gap-5 text-[#8A94A6]/20">
              <Calendar size={64} strokeWidth={1} />
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">
                No historical telemetry detected
              </p>
            </div>
          ) : (
            <div className="space-y-4 flex-1 relative z-10">
              {data.map((item, index) => (
                <motion.button
                  key={item._id || index}
                  onClick={() => setSelectedReport(item)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="w-full flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-[16px] bg-black/30 border border-white/[0.03] hover:border-amber-500/30 hover:bg-black/50 transition-all duration-300 group shadow-inner"
                >
                  <div className="flex items-center gap-8">
                    {/* Date Block */}
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-[12px] bg-black/40 border border-white/[0.05] group-hover:border-amber-500/40 transition-all">
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                        {new Date(item.scheduledDate).toLocaleDateString(
                          "en-US",
                          { month: "short" },
                        )}
                      </span>
                      <span className="text-2xl font-black italic text-[#E5E7EB] leading-none mt-1">
                        {new Date(item.scheduledDate).getDate()}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8A94A6]">
                          {item.type.replace("_", " ")} Protocol
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-base font-black text-[#E5E7EB] tracking-widest uppercase italic">
                        <Clock size={16} className="text-amber-500/60" />
                        {item.scheduledTime}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-4">
                    <div className="hidden group-hover:block animate-in fade-in slide-in-from-right-2 text-[9px] font-black uppercase tracking-widest text-amber-500/40">
                      View Debrief
                    </div>
                    {getStatusBadge(item.attendance.status)}
                  </div>
                </motion.button>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          <div className="mt-10 pt-8 border-t border-white/[0.05] flex items-center justify-between relative z-10">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="flex items-center gap-3 px-6 py-4 rounded-[12px] bg-black/40 border border-white/[0.05] text-[10px] font-black uppercase tracking-widest text-[#8A94A6] hover:text-white hover:border-amber-500/30 disabled:opacity-20 disabled:pointer-events-none transition-all"
            >
              <ChevronLeft size={16} strokeWidth={3} /> Previous Page
            </button>

            <div className="px-5 py-2 rounded-full bg-white/[0.02] border border-white/[0.05] hidden md:block">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8A94A6]/60">
                Hub Page <span className="text-white">{page}</span> /{" "}
                {Math.ceil(total / 10) || 1}
              </span>
            </div>

            <button
              disabled={page * 10 >= total || loading}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-3 px-6 py-4 rounded-[12px] bg-black/40 border border-white/[0.05] text-[10px] font-black uppercase tracking-widest text-[#8A94A6] hover:text-white hover:border-amber-500/30 disabled:opacity-20 disabled:pointer-events-none transition-all"
            >
              Next Page <ChevronRight size={16} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      {/* 🛡️ ENCRYPTED ACTION REPORT MODAL */}
      <Transition appear show={!!selectedReport} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setSelectedReport(null)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/95 backdrop-blur-xl" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-[24px] bg-[#0F1724] border border-white/10 p-10 text-left shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all relative">
                  {/* Decorative Glow */}
                  <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/10 rounded-full blur-[70px] pointer-events-none" />

                  <div className="flex items-center justify-between mb-10 border-b border-white/[0.05] pb-6 relative z-10">
                    <div>
                      <Dialog.Title className="text-2xl font-black uppercase italic tracking-tighter text-white">
                        Action <span className="text-amber-500">Report</span>
                      </Dialog.Title>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8A94A6] mt-2 flex items-center gap-2">
                        <FileText size={12} className="text-amber-500" />{" "}
                        Decrypted Coach Feedback
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="text-[#8A94A6] hover:text-white bg-black/40 p-3 rounded-xl border border-white/[0.05] transition-colors"
                    >
                      <X size={18} strokeWidth={3} />
                    </button>
                  </div>

                  <div className="space-y-8 relative z-10">
                    <div className="flex justify-between items-center bg-black/40 p-5 rounded-[12px] border border-white/[0.05] shadow-inner">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6]">
                        Load Intensity
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border ${
                          selectedReport?.notes?.intensity === "HIGH"
                            ? "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                            : selectedReport?.notes?.intensity === "MEDIUM"
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                              : "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                        }`}
                      >
                        {selectedReport?.notes?.intensity || "UNCLASSIFIED"}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8A94A6] ml-2">
                        Global Objective
                      </p>
                      <div className="bg-black/30 p-6 rounded-[16px] border border-white/[0.05] text-[13px] text-[#E5E7EB] leading-relaxed font-medium shadow-inner">
                        {selectedReport?.notes?.summary ||
                          "No global summary provided by command."}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/60 ml-2 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Personal Debrief
                      </p>
                      <div className="bg-amber-500/[0.03] p-6 rounded-[16px] border border-amber-500/10 text-[13px] text-amber-100/80 leading-relaxed font-medium shadow-inner italic">
                        "
                        {selectedReport?.personalFeedback ||
                          "No specific individual feedback filed for this deployment."}
                        "
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
