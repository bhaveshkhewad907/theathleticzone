import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Activity,
  Zap,
  Timer,
  BookOpen,
  Plus,
} from "lucide-react";
import api from "../../services/api";

interface Step {
  _id: string;
  title: string;
  type: string;
}

interface StepPickerModalProps {
  onClose: () => void;
  onSelect: (step: Step) => void;
}

export default function StepPickerModal({
  onClose,
  onSelect,
}: StepPickerModalProps) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });

  const fetchSteps = async (page: number, search: string, type: string) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/chapters/steps?page=${page}&limit=5&search=${search}&type=${type}`,
      );
      setSteps(res.data.data);
      if (res.data.pagination) setPagination(res.data.pagination);
    } catch (error) {
      console.error("Failed to fetch steps", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSteps(currentPage, searchTerm, filterType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filterType]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchSteps(1, searchTerm, filterType);
    }, 500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const getStepIcon = (type: string) => {
    switch (type) {
      case "WARMUP":
        return <Activity size={14} className="text-emerald-500" />;
      case "EXERCISE":
        return <Zap size={14} className="text-amber-500" />;
      case "COOLDOWN":
        return <Timer size={14} className="text-blue-400" />;
      case "EDUCATION":
        return <BookOpen size={14} className="text-purple-400" />;
      default:
        return null;
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0F1724] border border-white/10 rounded-[24px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#121821]">
          <div>
            <h2 className="text-xl font-black italic uppercase text-white">
              Select Asset
            </h2>
            <p className="text-[10px] text-[#8A94A6] uppercase tracking-widest mt-1">
              Search the Content Vault
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-white/5 bg-black/20 flex gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
              size={14}
            />
            <input
              type="text"
              placeholder="Search exercise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold text-white outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="relative w-1/3 min-w-[120px]">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
              size={14}
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full appearance-none bg-black/40 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-[10px] font-black uppercase tracking-widest text-white outline-none cursor-pointer"
            >
              <option value="">ALL</option>
              <option value="WARMUP">Warmup</option>
              <option value="EXERCISE">Exercise</option>
              <option value="COOLDOWN">Cooldown</option>
            </select>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-2">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-6 h-6 border-2 border-amber-500/50 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : steps.length === 0 ? (
            <p className="text-center text-white/40 text-xs font-black uppercase tracking-widest p-8">
              No results found.
            </p>
          ) : (
            steps.map((step) => (
              <div
                key={step._id}
                className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 hover:border-amber-500/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-amber-500/10 transition-colors">
                    {getStepIcon(step.type)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{step.title}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-[#8A94A6]">
                      {step.type}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onSelect(step)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-amber-500 hover:text-black transition-all flex items-center gap-1"
                >
                  <Plus size={12} /> Add
                </button>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-white/5 bg-[#121821] flex justify-between items-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#8A94A6]">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/40 border border-white/10 text-white disabled:opacity-30"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={currentPage === pagination.totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-black/40 border border-white/10 text-white disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
