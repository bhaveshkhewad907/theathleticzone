import { useState, useEffect } from "react";
import api from "../../services/api";
import {
  Search,
  Database,
  Edit2,
  Trash2,
  Plus,
  Video,
  Activity,
  Zap,
  Timer,
  BookOpen,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

// Lazy loaded modals
import CreateStepModal from "./CreateStepModal";
import EditStepModal from "./EditStepModal";

interface Step {
  _id: string;
  title: string;
  type: string;
  videoUrl?: string;
  createdAt: string;
}

export default function AdminSteps() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStep, setEditingStep] = useState<Step | null>(null);

  const fetchSteps = async (page: number, search: string, type: string) => {
    setLoading(true);
    try {
      const res = await api.get(
        `/chapters/steps?page=${page}&limit=10&search=${search}&type=${type}`,
      );
      setSteps(res.data.data);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error("Failed to fetch steps", error);
      toast.error("Failed to retrieve Content Vault.");
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
  }, [searchTerm]);

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "CRITICAL WARNING: Deleting this step will break any Course Templates using it. Are you sure?",
      )
    )
      return;

    try {
      await api.delete(`/chapters/steps/${id}`);
      toast.success("Step permanently purged.");
      fetchSteps(currentPage, searchTerm, filterType);
    } catch {
      toast.error("Failed to delete step.");
    }
  };

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
        return <Database size={14} className="text-white/50" />;
    }
  };

  return (
    <div className="relative min-h-screen space-y-6 p-2 md:p-4 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-[#121821] p-6 md:p-8 rounded-3xl border border-white/5 relative overflow-hidden gap-6 shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase text-white">
            Content <span className="text-amber-500">Vault</span>
          </h1>
          <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase mt-2">
            Global repository for all protocol blocks and exercises.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Filters & Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
              size={16}
            />
            <input
              type="text"
              placeholder="Search steps..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-[10px] font-black text-white uppercase tracking-widest focus:border-amber-500/50 outline-none"
            />
          </div>

          <div className="relative">
            <Filter
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
              size={16}
            />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-8 text-[10px] font-black text-white uppercase tracking-widest focus:border-amber-500/50 outline-none cursor-pointer"
            >
              <option value="">ALL TYPES</option>
              <option value="WARMUP">Warmup</option>
              <option value="EXERCISE">Exercise</option>
              <option value="COOLDOWN">Cooldown</option>
              <option value="EDUCATION">Education</option>
            </select>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto bg-amber-500 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-400 flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(245,158,11,0.2)]"
          >
            <Plus size={16} /> Initialize Step
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#121821] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">
        {loading && steps.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : steps.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-white/30 space-y-4">
            <AlertTriangle size={48} className="opacity-20" />
            <p className="text-xs font-black uppercase tracking-widest">
              No steps found in vault.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-black/40 border-b border-white/5">
                    <th className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6]">
                      Asset ID & Title
                    </th>
                    <th className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6]">
                      Classification
                    </th>
                    <th className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6]">
                      Media Payload
                    </th>
                    <th className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {steps.map((step) => (
                    <tr
                      key={step._id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-sm font-bold text-white uppercase tracking-tight">
                            {step.title}
                          </p>
                          <p className="text-[9px] font-black tracking-[0.2em] text-[#8A94A6] mt-0.5">
                            ID: {step._id.slice(-6)}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black tracking-widest uppercase">
                          {getStepIcon(step.type)} {step.type}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {step.videoUrl ? (
                          <div className="flex items-center gap-2 text-[10px] font-black text-green-500 uppercase tracking-widest">
                            <Video size={14} /> SECURED
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-[10px] font-black text-red-500/50 uppercase tracking-widest">
                            MISSING
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingStep(step)}
                            className="p-2.5 rounded-xl bg-black/40 hover:bg-amber-500/10 hover:text-amber-500 border border-white/5 transition-all text-white/50"
                            title="Edit Step"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(step._id)}
                            className="p-2.5 rounded-xl bg-black/40 hover:bg-red-500/10 hover:text-red-500 border border-white/5 transition-all text-white/50"
                            title="Purge"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-black/20 border-t border-white/5 gap-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8A94A6]">
                  Showing{" "}
                  <span className="text-white">
                    {(currentPage - 1) * 10 + 1}
                  </span>{" "}
                  to{" "}
                  <span className="text-white">
                    {Math.min(currentPage * 10, pagination.totalItems)}
                  </span>{" "}
                  of{" "}
                  <span className="text-amber-500">
                    {pagination.totalItems}
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/40 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(pagination.totalPages, p + 1),
                      )
                    }
                    disabled={currentPage === pagination.totalPages}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/40 border border-white/10 text-white hover:bg-white/10 disabled:opacity-30 transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateStepModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => fetchSteps(currentPage, searchTerm, filterType)}
        />
      )}

      {editingStep && (
        <EditStepModal
          step={editingStep}
          onClose={() => setEditingStep(null)}
          onSuccess={() => fetchSteps(currentPage, searchTerm, filterType)}
        />
      )}
    </div>
  );
}
