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
} from "lucide-react";

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

export default function AdminAthletes() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
      case "ACTIVE":
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
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center overflow-hidden">
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
                          <p className="text-sm font-bold text-white uppercase tracking-tight">
                            {athlete.name}
                          </p>
                          <p className="text-[10px] font-black tracking-widest text-[#8A94A6] uppercase mt-0.5">
                            {athlete.email}
                          </p>
                        </div>
                      </div>
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
    </div>
  );
}
