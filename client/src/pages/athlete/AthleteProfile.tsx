import { useState, useEffect, useContext, Fragment } from "react";
import AuthContext from "../../context/AuthContext";
import { Dialog, Transition } from "@headlessui/react";
import {
  User as UserIcon,
  Mail,
  Activity,
  Shield,
  Save,
  Dumbbell,
  Lock,
  AlertTriangle,
  X,
  Calendar,
  Weight,
  Ruler,
  CheckCircle,
  Camera,
  MessageSquare,
} from "lucide-react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { useLocation } from "react-router-dom";
import LeaveReview from "./LeaveReview";

export default function AthleteProfile() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: "",
    sportId: "",
    age: "",
    height: "",
    weight: "",
  });

  const [sportsRegistry, setSportsRegistry] = useState<
    { _id: string; name: string }[]
  >([]);
  const [isProfileLocked, setIsProfileLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedSportName, setSelectedSportName] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 🛡️ NEW SECURE INSTANT SYNC HANDLER
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 🛡️ LAYER 1 SECURITY: Strict 2MB Limit on the Frontend
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Portrait exceeds 2MB limit. Please select a smaller image.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (JPG, PNG).");
      return;
    }

    try {
      // 1. Instantly show it on screen
      setImagePreview(URL.createObjectURL(file));

      // 2. Prepare the secure FormData payload
      const uploadData = new FormData();
      uploadData.append("avatar", file); // Must match backend multer config

      // 3. Upload safely through the Node.js backend
      await api.post("/users/avatar", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 100),
          );
          setUploadProgress(percent);
        },
      });

      // 4. Update Global Auth State
      if (auth?.setAuth) {
        const meRes = await api.get("/auth/me");
        auth.setAuth(meRes.data.data);
      }

      toast.success("Portrait synchronized globally.");
    } catch (error) {
      // Safely tell TypeScript what the error structure looks like
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Portrait upload failed.");
      console.error(error);
    } finally {
      setUploadProgress(0);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    // 🚀 FIX: Added '!isProfileLocked' so it stops yelling at you once you finish!
    if (searchParams.get("onboarding") === "true" && !isProfileLocked) {
      const timer = setTimeout(() => {
        toast("Deployment incomplete. Sector initialization required.", {
          icon: "🚨",
          style: {
            borderRadius: "12px",
            background: "#0F1724",
            color: "#fff",
            border: "1px solid rgba(245,158,11,0.2)",
          },
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [location, isProfileLocked]); // 🚀 Added isProfileLocked to dependencies

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sportsRes, profileRes, userRes] = await Promise.all([
          api.get("/sports"),
          api.get("/athlete-profile"),
          api.get("/users/me"),
        ]);

        setSportsRegistry(sportsRes.data.data);
        const data = profileRes.data.data;
        const userData = userRes.data.data;

        if (data || userData) {
          const extractId = (val: unknown): string => {
            if (!val) return "";
            if (typeof val === "string") return val;
            if (Array.isArray(val) && val.length > 0) return extractId(val[0]);

            if (typeof val === "object" && val !== null) {
              const obj = val as Record<string, unknown>;
              if (obj._id) return String(obj._id);
              if (obj.id) return String(obj.id);
            }

            return String(val);
          };

          const existingSportId =
            extractId(data?.sport) ||
            extractId(data?.sports) ||
            extractId(userData?.sport) ||
            extractId(userData?.sports);

          const hasValidAge = data?.age && data.age > 0;
          const hasValidWeight = data?.weight && data.weight > 0;
          const hasValidHeight = data?.height && data.height > 0;

          const configStatus = Boolean(
            existingSportId && hasValidAge && hasValidWeight && hasValidHeight,
          );

          setIsProfileLocked(configStatus);
          setImagePreview(userData.profileImage || data?.profileImage || null);

          setFormData({
            name: userData.name || data?.name || "",
            sportId: existingSportId || "",
            age: hasValidAge ? data.age.toString() : "",
            height: hasValidHeight ? data.height.toString() : "",
            weight: hasValidWeight ? data.weight.toString() : "",
          });
        }
      } catch (error) {
        console.error("Failed to retrieve telemetry", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const initiateSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.sportId ||
      !formData.age ||
      !formData.weight ||
      !formData.height
    ) {
      return toast.error("All biometric parameters must be initialized.");
    }

    const sportName =
      sportsRegistry.find((s) => s._id === formData.sportId)?.name ||
      "Unknown Sector";
    setSelectedSportName(sportName);

    if (!isProfileLocked) {
      setIsConfirmModalOpen(true);
    }
  };

  const handleFinalSave = async () => {
    setIsConfirmModalOpen(false);
    setIsSaving(true);
    try {
      await api.put("/athlete-profile", {
        sports: [formData.sportId],
        age: Number(formData.age),
        height: Number(formData.height),
        weight: Number(formData.weight),
      });

      if (auth?.setAuth) {
        const meRes = await api.get("/auth/me");
        auth.setAuth(meRes.data.data);
      }

      toast.success(
        "Biometrics synchronized successfully. Deployment authorized. 🚀",
      );
      setIsProfileLocked(true);

      // 🚀 THE CRITICAL FIX: Instantly push them to the assessment wizard!
      window.location.href = "/assessment";
    } catch (error) {
      console.error("Profile sync failed:", error);
      toast.error("Synchronization failed. Check core connection.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="relative min-h-full overflow-hidden">
        {/* Subtle pulsing animation over the whole skeleton */}
        <div className="relative z-10 space-y-10 max-w-7xl mx-auto animate-pulse">
          {/* Header Skeleton */}
          <div className="bg-[#0F1724]/40 border border-white/[0.02] p-8 rounded-[16px]">
            <div className="h-10 w-64 bg-white/5 rounded-md mb-3" />
            <div className="h-3 w-48 bg-white/5 rounded-md" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card Skeleton */}
              <div className="bg-[#0F1724]/40 border border-white/[0.02] rounded-[16px] p-10 flex flex-col items-center">
                <div className="w-32 h-32 bg-white/5 rounded-[24px] mb-8" />
                <div className="h-6 w-48 bg-white/5 rounded-md mb-4" />
                <div className="h-6 w-32 bg-white/5 rounded-[12px]" />
              </div>

              {/* Info Card Skeleton (Email & ID) */}
              <div className="bg-[#0F1724]/40 border border-white/[0.02] rounded-[16px] p-8 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-lg bg-white/5" />
                  <div className="h-3 w-full bg-white/5 rounded-md" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-lg bg-white/5" />
                  <div className="h-3 w-3/4 bg-white/5 rounded-md" />
                </div>
              </div>

              {/* Debrief Button Skeleton */}
              <div className="h-[56px] w-full bg-white/5 rounded-[16px]" />
            </div>

            {/* Right Column (Biometrics Form) Skeleton */}
            <div className="lg:col-span-2">
              <div className="bg-[#0F1724]/40 border border-white/[0.02] rounded-[16px] p-10 h-full flex flex-col">
                <div className="flex items-center justify-between mb-10 border-b border-white/[0.05] pb-6">
                  <div className="h-6 w-64 bg-white/5 rounded-md" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  {/* Name Input */}
                  <div className="space-y-3 col-span-1 md:col-span-2">
                    <div className="h-3 w-32 bg-white/5 rounded-md ml-2" />
                    <div className="h-[60px] w-full bg-white/5 rounded-[12px]" />
                  </div>

                  {/* Sport Input */}
                  <div className="space-y-3">
                    <div className="h-3 w-32 bg-white/5 rounded-md ml-2" />
                    <div className="h-[60px] w-full bg-white/5 rounded-[12px]" />
                  </div>

                  {/* 3 Biometric Inputs (Age, Mass, Height) */}
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-3">
                      <div className="h-3 w-16 bg-white/5 rounded-md ml-2" />
                      <div className="h-[60px] w-full bg-white/5 rounded-[12px]" />
                    </div>
                  ))}
                </div>

                {/* Submit Button Skeleton */}
                <div className="mt-auto h-[60px] w-full bg-white/5 rounded-[12px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      <div className="relative min-h-full">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.08),transparent_60%)] pointer-events-none" />

        <div className="relative z-10 space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto">
          <div className="relative overflow-hidden bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] p-8 rounded-[16px] shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]">
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">
              Personal <span className="text-amber-500">Profile</span>
            </h1>
            <p className="text-[#8A94A6] text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
              Identity & Biometric Data Configuration
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="relative bg-[#0F1724]/80 backdrop-blur-md border border-white/[0.05] rounded-[16px] p-10 text-center shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />

                <div className="relative w-32 h-32 mx-auto mb-8 group">
                  <div className="w-full h-full bg-black/40 border-2 border-amber-500/20 rounded-[24px] flex items-center justify-center text-5xl font-black text-amber-500 shadow-inner overflow-hidden relative transition-all duration-300 group-hover:border-amber-500/50">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || "A"
                    )}

                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                      <Camera className="text-amber-500 mb-1" size={20} />
                      <span className="text-[8px] font-black text-white uppercase tracking-widest text-center px-2">
                        Update
                        <br />
                        Portrait
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={uploadProgress > 0}
                      />
                    </label>
                  </div>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="absolute -bottom-4 left-0 w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter italic text-[#E5E7EB] truncate">
                  {user?.name || "ATHLETE IDENTITY"}
                </h2>
                <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-[12px] bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 uppercase tracking-widest">
                  <Shield size={12} strokeWidth={3} /> Clearance:{" "}
                  {user?.role || "ACTIVE"}
                </div>
              </div>

              <div className="bg-black/30 backdrop-blur-sm border border-white/[0.05] rounded-[16px] p-8 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Mail size={16} className="text-amber-500" />
                  </div>
                  <div className="text-[10px] font-black text-[#8A94A6] tracking-widest uppercase truncate">
                    {user?.email || "SYNCING..."}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Activity size={16} className="text-amber-500" />
                  </div>
                  <div className="text-[10px] font-black text-[#8A94A6] tracking-widest uppercase">
                    System ID: {user?.id?.slice(-8) || "SYNCING..."}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsReviewModalOpen(true)}
                className="w-full relative overflow-hidden bg-gradient-to-r from-[#121821] to-[#0F1724] border border-white/5 hover:border-amber-500/50 text-[#8A94A6] hover:text-white py-4 rounded-[16px] flex items-center justify-center gap-3 transition-all duration-300 group shadow-[0_8px_16px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_20px_rgba(245,158,11,0.15)] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <MessageSquare
                  size={18}
                  className="text-amber-500/70 group-hover:text-amber-500 group-hover:scale-110 transition-all"
                />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
                  Submit Operational Debrief
                </span>
              </button>
            </div>

            <div className="lg:col-span-2">
              <form
                onSubmit={initiateSave}
                className="relative bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] rounded-[16px] p-10 h-full flex flex-col shadow-[0_10px_30px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] overflow-hidden"
              >
                <div className="flex items-center justify-between mb-10 border-b border-white/[0.05] pb-6">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">
                    Biometric <span className="text-amber-500">Parameters</span>
                  </h3>
                  {isProfileLocked && (
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-4 py-2 rounded-full border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                      <Lock size={12} strokeWidth={3} /> SECURED
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 relative z-10">
                  <div className="space-y-3 col-span-1 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8A94A6] ml-2">
                      Display Directive (Name)
                    </label>
                    <div className="flex items-center bg-black/40 rounded-[12px] px-6 py-5 border border-white/[0.05] opacity-50 cursor-not-allowed">
                      <UserIcon className="text-[#8A94A6]/40 mr-4" size={18} />
                      <input
                        type="text"
                        value={formData.name}
                        readOnly
                        className="bg-transparent text-[#E5E7EB] w-full text-sm font-bold cursor-not-allowed outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8A94A6] ml-2">
                      Primary Sport Sector
                    </label>
                    <div
                      className={`flex items-center bg-black/40 rounded-[12px] px-6 py-5 border transition-all duration-300 ${isProfileLocked ? "border-white/[0.05] opacity-50" : "border-white/[0.05] focus-within:border-amber-500/50"}`}
                    >
                      <Dumbbell
                        className={`${isProfileLocked ? "text-amber-500/30" : "text-[#8A94A6]/40"} mr-4`}
                        size={18}
                      />
                      <select
                        name="sportId"
                        value={String(formData.sportId || "")}
                        onChange={handleChange}
                        disabled={isProfileLocked}
                        className={`w-full bg-transparent text-[#E5E7EB] text-sm font-bold outline-none appearance-none ${isProfileLocked ? "cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <option value="" disabled className="bg-[#0F1724]">
                          -- Initialize Sector --
                        </option>
                        {sportsRegistry.map((sport) => (
                          <option
                            key={sport._id}
                            value={sport._id}
                            className="bg-[#0F1724]"
                          >
                            {sport.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {[
                    {
                      name: "age",
                      label: "Age",
                      unit: "YRS",
                      icon: <Calendar size={18} />,
                    },
                    {
                      name: "weight",
                      label: "Mass",
                      unit: "KG",
                      icon: <Weight size={18} />,
                    },
                    {
                      name: "height",
                      label: "Height",
                      unit: "FT",
                      icon: <Ruler size={18} />,
                    },
                  ].map((field) => (
                    <div key={field.name} className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8A94A6] ml-2">
                        {field.label}
                      </label>
                      <div
                        className={`flex items-center bg-black/40 rounded-[12px] px-6 py-5 border transition-all duration-300 ${isProfileLocked ? "border-white/[0.05] opacity-50" : "border-white/[0.05] focus-within:border-amber-500/50"}`}
                      >
                        <div className="mr-4 opacity-40">{field.icon}</div>
                        <input
                          type="number"
                          step={field.name === "height" ? "0.01" : "1"}
                          name={field.name}
                          value={formData[field.name as keyof typeof formData]}
                          onChange={handleChange}
                          disabled={isProfileLocked}
                          placeholder="0"
                          className={`bg-transparent text-[#E5E7EB] w-full text-sm font-bold outline-none ${isProfileLocked ? "cursor-not-allowed" : ""}`}
                        />
                        <span className="text-[10px] font-black text-[#8A94A6]/40 ml-2">
                          {field.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {!isProfileLocked ? (
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="mt-auto group w-full py-5 rounded-[12px] bg-amber-500 text-black text-[11px] font-black uppercase tracking-[0.2em] hover:bg-amber-400 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center justify-center gap-3 relative z-10 active:scale-95"
                  >
                    <Save size={18} strokeWidth={3} />
                    {isSaving ? "Synchronizing..." : "Initialize Configuration"}
                  </button>
                ) : (
                  <div className="mt-auto w-full py-5 rounded-[12px] bg-black/40 border border-amber-500/10 text-amber-500/40 text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 relative z-10 cursor-not-allowed">
                    <CheckCircle size={18} strokeWidth={3} /> Configuration
                    Secured & Locked
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* 🛡️ BIOMETRIC VERIFICATION MODAL */}
        <Transition appear show={isConfirmModalOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50"
            onClose={() => setIsConfirmModalOpen(false)}
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
              <div className="fixed inset-0 bg-black/90 backdrop-blur-xl" />
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
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[24px] bg-[#0F1724] border border-white/10 p-8 text-left shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all relative">
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/10 rounded-full blur-[50px] pointer-events-none" />

                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                      <Dialog.Title
                        as="h3"
                        className="text-xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3"
                      >
                        <AlertTriangle
                          className="text-amber-500"
                          size={24}
                          strokeWidth={3}
                        />
                        Biometric{" "}
                        <span className="text-amber-500">Lock-In</span>
                      </Dialog.Title>
                      <button
                        onClick={() => setIsConfirmModalOpen(false)}
                        className="text-white/20 hover:text-white transition-colors"
                      >
                        <X size={20} strokeWidth={3} />
                      </button>
                    </div>

                    <div className="space-y-6 mb-10">
                      <p className="text-[11px] font-black text-[#8A94A6] uppercase tracking-[0.2em] leading-relaxed text-center">
                        Confirm telemetry. Once deployed, these parameters are
                        locked permanently.
                      </p>

                      <div className="grid grid-cols-2 gap-4">
                        {[
                          {
                            label: "Sector",
                            value: selectedSportName,
                            icon: (
                              <Dumbbell className="text-amber-500" size={16} />
                            ),
                          },
                          {
                            label: "Age",
                            value: `${formData.age} YRS`,
                            icon: (
                              <Calendar className="text-amber-500" size={16} />
                            ),
                          },
                          {
                            label: "Mass",
                            value: `${formData.weight} KG`,
                            icon: (
                              <Weight className="text-amber-500" size={16} />
                            ),
                          },
                          {
                            label: "Height",
                            value: `${formData.height} FT`,
                            icon: (
                              <Ruler className="text-amber-500" size={16} />
                            ),
                          },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-black/40 border border-white/5 rounded-[12px] p-4 flex items-center gap-4"
                          >
                            {item.icon}
                            <div>
                              <p className="text-[8px] font-black text-[#8A94A6]/40 uppercase tracking-widest">
                                {item.label}
                              </p>
                              <p className="text-xs font-black text-[#E5E7EB] tracking-widest uppercase">
                                {item.value}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-start gap-4 p-5 rounded-[12px] bg-red-500/5 border border-red-500/20 shadow-inner">
                        <Lock
                          size={18}
                          className="text-red-500 flex-shrink-0 mt-0.5"
                          strokeWidth={3}
                        />
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-relaxed">
                          I acknowledge these metrics will be permanently
                          synchronized for performance analytics.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setIsConfirmModalOpen(false)}
                        className="py-4 rounded-[12px] bg-black/60 border border-white/10 text-[#8A94A6] text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
                      >
                        Abort Request
                      </button>
                      <button
                        type="button"
                        onClick={handleFinalSave}
                        className="py-4 rounded-[12px] bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all"
                      >
                        Confirm & Lock
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* 🗣️ OPERATIONAL DEBRIEF (REVIEW) MODAL */}
        <Transition appear show={isReviewModalOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50"
            onClose={() => setIsReviewModalOpen(false)}
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
              <div className="fixed inset-0 bg-black/90 backdrop-blur-xl" />
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
                  <Dialog.Panel className="w-full max-w-xl transform transition-all relative">
                    <button
                      onClick={() => setIsReviewModalOpen(false)}
                      className="absolute top-4 right-4 text-white/50 hover:text-white bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10 hover:border-white/30 z-10 transition-all shadow-lg active:scale-95"
                    >
                      <X size={18} strokeWidth={3} />
                    </button>

                    <LeaveReview
                      onSuccess={() => setIsReviewModalOpen(false)}
                    />
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </Fragment>
  );
}
