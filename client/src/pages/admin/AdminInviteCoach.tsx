import { useState } from "react";
import api from "../../services/api";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function AdminInviteCoach() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInvite = async () => {
    try {
      setLoading(true);
      setSuccess(false);

      await api.post("/admin/invite-coach", { email });

      setSuccess(true);
      setEmail("");
      toast.success("Security credentials dispatched.");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            "Protocol failure: Invitation not sent",
        );
      } else {
        toast.error("Unexpected system error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-full py-10">
      {/* Ambient Radial Lighting Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Visual Header Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 uppercase tracking-[0.3em] mb-6 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Security • Access Control
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic text-white leading-tight">
            Invite <span className="text-amber-500">Coach</span>
          </h1>
          <p className="text-[#8A94A6] text-xs font-bold uppercase tracking-[0.2em] mt-4 max-w-sm mx-auto leading-relaxed">
            Issue secure digital credentials for elite platform authorization.
          </p>
        </div>

        {/* Premium Action Card */}
        <div className="group relative bg-[#0F1724]/80 backdrop-blur-md p-10 rounded-[16px] border border-white/[0.05] shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] overflow-hidden transition-all duration-300 hover:border-amber-500/30">
          {/* Inner Glass Highlights and Decorative Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full transition-opacity group-hover:opacity-100 opacity-0" />

          <div className="space-y-8 relative z-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8A94A6] ml-1">
                Recipient Email Directive
              </label>
              <input
                type="email"
                placeholder="coach@theathleticzone.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.05] px-6 py-5 rounded-[12px] text-sm text-[#E5E7EB] placeholder:text-[#8A94A6]/40 outline-none focus:border-amber-500/50 focus:bg-black/60 transition-all duration-300 shadow-inner font-medium"
              />
            </div>

            <button
              onClick={handleInvite}
              disabled={!email || loading}
              className="w-full bg-amber-500 text-black font-black uppercase tracking-[0.2em] text-[11px] py-5 rounded-[12px] transition-all active:scale-95 disabled:opacity-20 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_35px_rgba(245,158,11,0.4)] hover:bg-amber-400"
            >
              {loading ? "Authorizing Protocol..." : "Dispatch Invitation"}
            </button>

            {success && (
              <div className="flex items-center justify-center gap-3 text-green-500 text-[10px] font-black uppercase tracking-[0.2em] pt-4 animate-in fade-in slide-in-from-top-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                Credential Issued Successfully
              </div>
            )}
          </div>

          {/* Subtle Bottom Accent Line */}
          <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-amber-500 transition-all duration-700 group-hover:w-full opacity-40" />
        </div>

        {/* Security Meta Info */}
        <div className="mt-12 text-center space-y-4">
          <p className="text-[9px] text-[#8A94A6] uppercase font-bold tracking-[0.2em] leading-loose max-w-sm mx-auto opacity-60">
            Invitations are cryptographically signed and valid for 24 hours.
            Activation links are single-use only.
          </p>
          <div className="flex justify-center gap-4 text-[8px] font-black text-white/10 uppercase tracking-widest">
            <span>R2 Security Node</span>
            <span>•</span>
            <span>V.2.0.4 Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
}
