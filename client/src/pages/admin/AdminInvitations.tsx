import { useEffect, useState } from "react";
import api from "../../services/api";
import axios from "axios";
import { toast } from "react-hot-toast";

interface Invitation {
  _id: string;
  email: string;
  expiresAt: string;
  status: "PENDING" | "EXPIRED" | "ACCEPTED";
}

export default function AdminInvitations() {
  const [data, setData] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = async () => {
    try {
      const res = await api.get("/admin/invitations");
      setData(res.data.data);
    } catch {
      toast.error("Failed to load invitations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleResend = async (email: string) => {
    try {
      await api.post("/admin/resend-invite", { email });
      toast.success("Invitation resent successfully");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Resend failed");
      }
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await api.delete(`/admin/invite-coach/${id}`);
      setData((prev) => prev.filter((invite) => invite._id !== id));
      toast.success("Access revoked");
    } catch (error) {
      console.error("Failed to revoke invite", error);
      toast.error("Revocation failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-full">
      {/* Ambient Radial Lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
        {/* Premium Header Section */}
        <div className="relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] p-8 rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] gap-6">
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />

          <div className="relative z-10">
            <h1 className="text-3xl font-black tracking-tighter text-white">
              Access <span className="text-amber-500">Registry</span>
            </h1>
            <p className="text-[#8A94A6] text-xs font-bold uppercase tracking-[0.2em] mt-2">
              Coach Invitation Protocols
            </p>
          </div>
          <div className="h-px flex-1 bg-white/5 hidden md:block opacity-50" />
        </div>

        {data.length === 0 && (
          <div className="p-20 bg-[#0F1724]/40 backdrop-blur-sm border-2 border-dashed border-white/5 rounded-[16px] text-center text-[#8A94A6]/40 uppercase font-black tracking-widest text-[10px]">
            No Active Transmissions Found
          </div>
        )}

        <div className="grid gap-4">
          {data.map((invite) => (
            <div
              key={invite._id}
              className="group relative bg-[#0F1724]/80 backdrop-blur-md p-6 rounded-[16px] border border-white/[0.05] flex flex-col md:flex-row justify-between items-center transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] hover:shadow-[0_15px_40px_rgba(245,158,11,0.1)]"
            >
              {/* Inner Glass Highlight */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

              <div className="relative z-10 flex items-center gap-6 w-full md:w-auto">
                <div
                  className={`h-14 w-14 rounded-[12px] flex items-center justify-center text-lg font-black border backdrop-blur-sm transition-colors ${
                    invite.status === "PENDING"
                      ? "bg-amber-500/5 border-amber-500/20 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                      : "bg-red-500/5 border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                  }`}
                >
                  {invite.email[0].toUpperCase()}
                </div>
                <div className="truncate">
                  <div className="text-base font-bold text-[#E5E7EB] tracking-tight truncate">
                    {invite.email}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black text-[#8A94A6] uppercase tracking-widest">
                      Expiry Signal:
                    </span>
                    <span className="text-[9px] font-black text-amber-500/60 uppercase tracking-widest">
                      {new Date(invite.expiresAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-6 mt-6 md:mt-0 w-full md:w-auto justify-end">
                {" "}
                <div
                  className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border backdrop-blur-sm ${
                    invite.status === "PENDING"
                      ? "border-amber-500/20 text-amber-500 bg-amber-500/5"
                      : invite.status === "ACCEPTED"
                        ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5"
                        : "border-red-500/20 text-red-400 bg-red-500/5"
                  }`}
                >
                  {invite.status}
                </div>
                {invite.status !== "ACCEPTED" && (
                  <>
                    <button
                      onClick={() => handleRevoke(invite._id)}
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/40 hover:text-red-500 transition-colors py-2"
                    >
                      Revoke
                    </button>
                    <button
                      onClick={() => handleResend(invite.email)}
                      className="bg-[#E5E7EB] text-black text-[10px] font-black uppercase tracking-[0.2em] px-8 py-3 rounded-[12px] hover:bg-amber-500 transition-all active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                    >
                      Resend
                    </button>
                  </>
                )}
              </div>

              {/* Hover Glow Background */}
              <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-amber-500/5 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>

        {/* System Footer Info */}
        <div className="pt-8 border-t border-white/[0.05] flex justify-between items-center text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">
          <div>Protocol R2 Active</div>
          <div>Registry V.2.0.4</div>
        </div>
      </div>
    </div>
  );
}
