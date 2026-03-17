import { useEffect, useState } from "react";
import api from "../../services/api";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Users, User } from "lucide-react";

/* ================================
   Types
================================ */
interface GroupMember {
  userId: string;
  name: string;
  subscriptionId: string;
  sportId?: string;
}

interface SportGroup {
  sportId: string;
  sportName: string;
  groups: GroupMember[][];
}

interface Coach {
  _id: string;
  name: string;
  email: string;
}

interface ScheduleFormState {
  coachId: string;
  scheduledTime: string;
}

/* ================================
   Component
================================ */
export default function AdminGroupSuggestions() {
  const [activeTab, setActiveTab] = useState<"GROUP" | "ONE_ON_ONE">("GROUP");

  // Data States
  const [groupData, setGroupData] = useState<SportGroup[] | null>(null);
  const [oneOnOneData, setOneOnOneData] = useState<GroupMember[] | null>(null);

  const [loading, setLoading] = useState(false);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [forms, setForms] = useState<Record<string, ScheduleFormState>>({});
  const [scheduling, setScheduling] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const res = await api.get<{ success: boolean; data: Coach[] }>(
          "/admin/coaches",
        );
        setCoaches(res.data.data);
      } catch (error) {
        console.error("Failed to load coaches", error);
      }
    };
    fetchCoaches();
  }, []);

  /* ================================
     Fetch Data Actions
  ================================= */
  const fetchDeployments = async () => {
    setLoading(true);
    try {
      if (activeTab === "GROUP") {
        const res = await api.post<{ success: boolean; data: SportGroup[] }>(
          "/admin/generate-groups",
        );
        setGroupData(res.data.data);
      } else {
        // Ensure you create this GET route in your backend mapping to the new service function!
        const res = await api.get<{ success: boolean; data: GroupMember[] }>(
          "/admin/pending-1on1",
        );
        setOneOnOneData(res.data.data);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to sync deployments",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (
    key: string,
    field: keyof ScheduleFormState,
    value: string,
  ) => {
    setForms((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  /* ================================
     Confirm Schedule
  ================================= */
  const confirmSchedule = async (
    sportId: string,
    formKey: string,
    subscriptionIds: string[],
    type: "GROUP" | "ONE_ON_ONE",
  ) => {
    const form = forms[formKey];

    if (!form || !form.coachId || !form.scheduledTime) {
      toast.error("Please assign a Technical Coach and a Deployment Time.");
      return;
    }

    try {
      setScheduling((prev) => ({ ...prev, [formKey]: true }));

      await api.post("/admin/schedule", {
        type,
        sport: sportId,
        coach: form.coachId,
        subscriptionIds,
        scheduledTime: form.scheduledTime,
      });

      toast.success("Deployment Authorized.");

      // Remove from UI after successful schedule
      if (type === "GROUP") {
        setGroupData((prev) => {
          if (!prev) return prev;
          return prev
            .map((sport) => {
              if (sport.sportId !== sportId) return sport;
              // We extract the group index from the formKey (e.g., "sportId-2")
              const groupIndex = parseInt(formKey.split("-")[1]);
              const updatedGroups = sport.groups.filter(
                (_, idx) => idx !== groupIndex,
              );
              return { ...sport, groups: updatedGroups };
            })
            .filter((sport) => sport.groups.length > 0);
        });
      } else {
        setOneOnOneData((prev) => {
          if (!prev) return prev;
          return prev.filter((m) => m.subscriptionId !== subscriptionIds[0]);
        });
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to schedule session",
        );
      }
    } finally {
      setScheduling((prev) => ({ ...prev, [formKey]: false }));
    }
  };

  const allCompleted =
    activeTab === "GROUP"
      ? groupData && groupData.length === 0
      : oneOnOneData && oneOnOneData.length === 0;

  return (
    <div className="relative min-h-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto">
        {/* Premium Header */}
        <div className="relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] p-8 rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] gap-6">
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />

          <div className="relative z-10">
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
              Deployment <span className="text-amber-500">Engine</span>
            </h1>
            <p className="text-[#8A94A6] text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
              Algorithmic athlete routing and coach assignment.
            </p>
          </div>

          <button
            onClick={fetchDeployments}
            disabled={loading}
            className="relative z-10 bg-amber-500 text-black px-8 py-4 rounded-[12px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-amber-400 transition-all disabled:opacity-30 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]"
          >
            {loading ? "Calculating..." : "Compute Deployments"}
          </button>
        </div>

        {/* 🎚️ THE PREMIUM TOGGLE SWITCH */}
        <div className="flex justify-center">
          <div className="bg-black/40 p-1.5 rounded-full border border-white/[0.05] flex items-center shadow-inner relative">
            <div
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#E5E7EB] rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-out z-0
              ${activeTab === "ONE_ON_ONE" ? "translate-x-full" : "translate-x-0"}`}
            />

            <button
              onClick={() => setActiveTab("GROUP")}
              className={`relative z-10 flex items-center justify-center gap-2 px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-full transition-colors duration-300 w-48
              ${activeTab === "GROUP" ? "text-black" : "text-[#8A94A6] hover:text-white"}`}
            >
              <Users size={14} strokeWidth={3} />
              Group Clusters
            </button>

            <button
              onClick={() => setActiveTab("ONE_ON_ONE")}
              className={`relative z-10 flex items-center justify-center gap-2 px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-full transition-colors duration-300 w-48
              ${activeTab === "ONE_ON_ONE" ? "text-black" : "text-[#8A94A6] hover:text-white"}`}
            >
              <User size={14} strokeWidth={3} />
              1-on-1 Routing
            </button>
          </div>
        </div>

        {allCompleted && (
          <div className="relative overflow-hidden bg-green-500/5 backdrop-blur-md border border-green-500/20 rounded-[16px] p-12 text-center shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
            <div className="relative z-10 text-green-500 text-2xl font-black tracking-tighter mb-2">
              QUEUE SYNCHRONIZED ✓
            </div>
            <p className="relative z-10 text-[#8A94A6] text-[10px] font-bold uppercase tracking-[0.2em]">
              All available athletes have been deployed for tomorrow.
            </p>
          </div>
        )}

        {/* --- GROUP TAB RENDER --- */}
        {activeTab === "GROUP" && groupData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {groupData.map((sport) => (
              <div key={sport.sportId} className="space-y-6">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8A94A6] ml-2 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {sport.sportName} Clusters
                </h2>
                {sport.groups.map((group, index) => {
                  const formKey = `${sport.sportId}-${index}`;
                  const form = forms[formKey] || {
                    coachId: "",
                    scheduledTime: "",
                  };

                  return (
                    <div
                      key={formKey}
                      className="group relative bg-[#0F1724]/80 backdrop-blur-md border border-white/[0.05] rounded-[16px] p-8 space-y-6 shadow-lg hover:border-amber-500/30 transition-all"
                    >
                      <div className="relative z-10 flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6]">
                          Cluster 0{index + 1}
                        </span>
                      </div>

                      <div className="relative z-10 space-y-2">
                        {group.map((member) => (
                          <div
                            key={member.userId}
                            className="flex justify-between items-center bg-black/40 p-4 rounded-[12px] border border-white/[0.02]"
                          >
                            <span className="text-sm font-bold text-[#E5E7EB]">
                              {member.name}
                            </span>
                            <span className="text-[9px] font-bold text-[#8A94A6] uppercase tracking-widest">
                              ID: {member.subscriptionId.slice(-6)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="relative z-10 grid gap-3 pt-4 border-t border-white/[0.05]">
                        <select
                          className="w-full bg-black/40 border border-white/[0.05] rounded-[12px] px-4 py-4 text-xs font-medium text-[#E5E7EB] outline-none"
                          value={form.coachId}
                          onChange={(e) =>
                            handleFormChange(formKey, "coachId", e.target.value)
                          }
                        >
                          <option value="" className="text-[#8A94A6]">
                            Assign Technical Coach
                          </option>
                          {coaches.map((c) => (
                            <option
                              key={c._id}
                              value={c._id}
                              className="bg-[#0F1724]"
                            >
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Deployment Time (e.g. 07:00 AM)"
                          className="w-full bg-black/40 border border-white/[0.05] rounded-[12px] px-4 py-4 text-xs font-medium text-[#E5E7EB] outline-none"
                          value={form.scheduledTime}
                          onChange={(e) =>
                            handleFormChange(
                              formKey,
                              "scheduledTime",
                              e.target.value,
                            )
                          }
                        />
                      </div>

                      <button
                        onClick={() =>
                          confirmSchedule(
                            sport.sportId,
                            formKey,
                            group.map((m) => m.subscriptionId),
                            "GROUP",
                          )
                        }
                        disabled={scheduling[formKey]}
                        className={`w-full py-4 rounded-[12px] text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                          scheduling[formKey]
                            ? "bg-white/5 border-transparent text-white/20"
                            : "bg-amber-500/5 border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-black"
                        }`}
                      >
                        {scheduling[formKey]
                          ? "Deploying..."
                          : "Finalize Cluster"}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* --- ONE_ON_ONE TAB RENDER --- */}
        {activeTab === "ONE_ON_ONE" && oneOnOneData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {oneOnOneData.map((athlete) => {
              const formKey = `1on1-${athlete.subscriptionId}`;
              const form = forms[formKey] || { coachId: "", scheduledTime: "" };

              return (
                <div
                  key={formKey}
                  className="group relative bg-[#0F1724]/80 backdrop-blur-md border border-white/[0.05] rounded-[16px] p-6 space-y-6 shadow-lg hover:border-amber-500/30 transition-all flex flex-col"
                >
                  <div className="flex items-center gap-4 border-b border-white/[0.05] pb-4">
                    <div className="h-10 w-10 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 border border-amber-500/20">
                      <User size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">
                        {athlete.name}
                      </h3>
                      <p className="text-[9px] font-bold text-[#8A94A6] uppercase tracking-widest mt-1">
                        ID: {athlete.subscriptionId.slice(-6)}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 flex-1">
                    <select
                      className="w-full bg-black/40 border border-white/[0.05] rounded-[12px] px-4 py-3 text-[11px] font-medium text-[#E5E7EB] outline-none"
                      value={form.coachId}
                      onChange={(e) =>
                        handleFormChange(formKey, "coachId", e.target.value)
                      }
                    >
                      <option value="" className="text-[#8A94A6]">
                        Select Coach
                      </option>
                      {coaches.map((c) => (
                        <option
                          key={c._id}
                          value={c._id}
                          className="bg-[#0F1724]"
                        >
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Time (e.g. 09:00 AM)"
                      className="w-full bg-black/40 border border-white/[0.05] rounded-[12px] px-4 py-3 text-[11px] font-medium text-[#E5E7EB] outline-none"
                      value={form.scheduledTime}
                      onChange={(e) =>
                        handleFormChange(
                          formKey,
                          "scheduledTime",
                          e.target.value,
                        )
                      }
                    />
                  </div>

                  <button
                    onClick={() =>
                      confirmSchedule(
                        athlete.sportId || "DEFAULT",
                        formKey,
                        [athlete.subscriptionId],
                        "ONE_ON_ONE",
                      )
                    }
                    disabled={scheduling[formKey]}
                    className={`w-full py-3 rounded-[12px] text-[10px] font-black uppercase tracking-[0.2em] transition-all border mt-auto ${
                      scheduling[formKey]
                        ? "bg-white/5 border-transparent text-white/20"
                        : "bg-amber-500/5 border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-black"
                    }`}
                  >
                    {scheduling[formKey] ? "Deploying..." : "Lock 1-on-1"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
