import { useEffect, useState, useCallback } from "react";
import api from "../../services/api";

interface Session {
  _id: string;
  sport: { _id: string; name: string };
  coach: { _id: string; name: string };
  athletesCount: number;
  scheduledDate: string;
  scheduledTime: string;
  status: "SCHEDULED" | "COMPLETED" | "LIVE" | "MISSED";
  meetingLink: string | null;
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [statusFilter, setStatusFilter] = useState<
    "SCHEDULED" | "COMPLETED" | "LIVE" | "MISSED" | ""
  >("");
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);

        const res = await api.get<{
          success: boolean;
          data: {
            sessions: Session[];
            pagination: Pagination;
          };
        }>(`/admin/sessions?page=${page}&limit=10&status=${statusFilter}`);

        setSessions(res.data.data.sessions);
        setPagination(res.data.data.pagination);
      } catch (error) {
        console.error("Failed to fetch sessions", error);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter],
  );

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const isSessionStarted = (dateStr: string, timeStr: string) => {
    const sessionTime = new Date(
      `${new Date(dateStr).toDateString()} ${timeStr}`,
    );
    return new Date() >= sessionTime;
  };

  return (
    <div className="relative min-h-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.05),transparent_60%)] pointer-events-none" />

      {/* 📱 RESPONSIVE: Scaled down spacing on mobile */}
      <div className="relative z-10 space-y-6 md:space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto px-2 md:px-0">
        {/* 📱 RESPONSIVE: Stacked header for mobile */}
        <div className="relative overflow-hidden flex flex-col lg:flex-row justify-between items-start lg:items-center bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] p-6 md:p-8 lg:p-10 rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] gap-6">
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />

          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-white">
              Operations <span className="text-amber-500">Ledger</span>
            </h1>
            <p className="text-[#8A94A6] text-xs md:text-sm mt-2 font-medium">
              Global telemetry of all deployed coaching sessions.
            </p>
          </div>

          <div className="relative z-10 w-full lg:w-auto">
            <select
              className="w-full lg:w-auto bg-black/40 border border-white/[0.05] rounded-[12px] px-6 py-4 text-xs font-black uppercase tracking-widest text-amber-500 outline-none focus:border-amber-500/50 transition-all appearance-none cursor-pointer shadow-inner"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as
                    | "SCHEDULED"
                    | "COMPLETED"
                    | "LIVE"
                    | "MISSED"
                    | "",
                )
              }
            >
              <option value="" className="bg-[#0F1724] text-[#8A94A6]">
                All States
              </option>
              <option value="LIVE" className="bg-[#0F1724] text-amber-500">
                Live Now
              </option>
              <option value="SCHEDULED" className="bg-[#0F1724]">
                Scheduled
              </option>
              <option value="COMPLETED" className="bg-[#0F1724]">
                Completed
              </option>
              <option value="MISSED" className="bg-[#0F1724]">
                Missed
              </option>
            </select>
          </div>
        </div>

        <div className="bg-[#0F1724]/80 backdrop-blur-md border border-white/[0.05] rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] overflow-hidden">
          {/* 📱 RESPONSIVE: The Critical Scroll Wrapper */}
          <div className="overflow-x-auto w-full">
            {/* Force minimum width so columns don't crush on mobile */}
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-black/40 border-b border-white/[0.05]">
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6]">
                    Timeline
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6]">
                    Sector / Roster
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6]">
                    Commander
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6]">
                    Stream
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 animate-pulse">
                        <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                        Syncing Ledger...
                      </div>
                    </td>
                  </tr>
                ) : sessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8A94A6]/40">
                        No telemetry matches current filters
                      </p>
                    </td>
                  </tr>
                ) : (
                  sessions.map((session) => (
                    <tr
                      key={session._id}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="text-sm font-bold text-[#E5E7EB]">
                          {session.scheduledTime}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-[#8A94A6] mt-1">
                          {new Date(session.scheduledDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-black italic text-amber-500 uppercase">
                          {session.sport.name}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-[#8A94A6] mt-1">
                          {session.athletesCount} Personnel Assigned
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="inline-flex items-center gap-3 bg-black/30 px-4 py-2 rounded-full border border-white/[0.02]">
                          <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[10px] font-black text-amber-500">
                            {session.coach.name.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-[#E5E7EB]">
                            {session.coach.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {session.meetingLink ? (
                          session.status === "COMPLETED" ||
                          session.status === "MISSED" ? (
                            <span className="text-[9px] font-bold text-[#8A94A6]/50 uppercase tracking-widest">
                              Stream Ended
                            </span>
                          ) : session.status === "SCHEDULED" &&
                            !isSessionStarted(
                              session.scheduledDate,
                              session.scheduledTime,
                            ) ? (
                            // 🔒 NEW: Simple locked state before exact start time
                            <span className="inline-block px-4 py-2 bg-black/40 text-[#8A94A6]/50 text-[9px] font-black uppercase tracking-widest rounded-[8px] border border-white/[0.05] cursor-not-allowed">
                              Awaiting Start Time
                            </span>
                          ) : (
                            // 🟢 Active button
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-4 py-2 bg-[#E5E7EB] text-black text-[9px] font-black uppercase tracking-widest rounded-[8px] hover:bg-amber-500 transition-colors shadow-[0_5px_15px_rgba(0,0,0,0.2)]"
                            >
                              Launch Stream
                            </a>
                          )
                        ) : (
                          <span className="text-[10px] font-bold text-[#8A94A6]/50 uppercase tracking-widest">
                            No Link Generated
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border backdrop-blur-sm ${
                            session.status === "COMPLETED"
                              ? "border-green-500/20 text-green-500 bg-green-500/5"
                              : session.status === "LIVE"
                                ? "border-red-500/20 text-red-500 bg-red-500/5 animate-pulse"
                                : session.status === "MISSED"
                                  ? "border-gray-500/20 text-gray-500 bg-gray-500/5"
                                  : "border-amber-500/20 text-amber-500 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                          }`}
                        >
                          {session.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Premium Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-3 pt-6 pb-10">
            {Array.from({ length: pagination.totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => fetchSessions(i + 1)}
                className={`w-10 h-10 rounded-[12px] text-[10px] font-black transition-all duration-300 border ${
                  pagination.page === i + 1
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                    : "bg-black/40 border-white/[0.05] text-[#8A94A6] hover:bg-white/5 hover:text-white"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
