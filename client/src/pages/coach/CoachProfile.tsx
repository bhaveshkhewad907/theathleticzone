import { useState, useEffect, useContext, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import AuthContext from "../../context/AuthContext";
import {
  User,
  Image as ImageIcon,
  Briefcase,
  Award,
  CheckCircle,
  MessageSquare,
  X,
  Edit2,
  Shield,
} from "lucide-react";
import LeaveReview from "../athlete/LeaveReview";

export default function CoachProfile() {
  const auth = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    experience: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyData = async () => {
      try {
        const res = await api.get("/users/me");
        const user = res.data.data;

        setFormData({
          title: user.title || "",
          experience: user.experience || "",
        });

        if (user.profileImage) {
          setImagePreview(user.profileImage);
        }

        if (user.title && user.experience) {
          setIsEditing(false);
        } else {
          setIsEditing(true);
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };
    fetchMyData();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 🛡️ LAYER 1 SECURITY: Strict 2MB Limit on the Frontend
      const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
      if (file.size > MAX_FILE_SIZE) {
        toast.error(
          "Portrait exceeds 2MB limit. Please select a smaller image.",
        );
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image file (JPG, PNG).");
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. 🛡️ If there is a new image, safely upload it via the Multer pipeline FIRST
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("avatar", imageFile); // Must match backend multer key

        await api.post("/users/avatar", uploadData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 100),
            );
            setUploadProgress(percent);
          },
        });
      }

      // 2. Update the textual data (Title and Experience)
      await api.put("/users/me", {
        title: formData.title,
        experience: formData.experience,
      });

      // 3. 🛡️ SYNC GLOBAL CONTEXT
      if (auth?.setAuth) {
        const meRes = await api.get("/users/me");
        const userData = meRes.data.data;
        auth.setAuth({
          ...userData,
          id: userData._id || userData.id,
        });
      }

      toast.success("Public profile synchronized successfully.");
      setUploadProgress(0);
      setImageFile(null);
      setIsEditing(false);
    } catch (error) {
      // Safely tell TypeScript what the error structure looks like
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Fragment>
      <div className="space-y-6 md:space-y-10 p-2 md:p-4 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-black/40 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden gap-6 shadow-2xl">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase text-white">
              Commander <span className="text-amber-500">Profile</span>
            </h1>
            <p className="text-[#8A94A6] text-[10px] font-bold tracking-widest uppercase mt-2">
              Configure your public Landing Page credentials.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto">
            <div className="bg-black/60 px-6 py-3 rounded-xl border border-white/5 flex items-center justify-center gap-3">
              <User className="text-amber-500" size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#8A94A6]">
                {auth?.user?.email}
              </span>
            </div>

            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="w-full relative overflow-hidden bg-gradient-to-r from-[#121821] to-[#0F1724] border border-white/5 hover:border-amber-500/50 text-[#8A94A6] hover:text-white py-3 px-6 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 group shadow-[0_8px_16px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_20px_rgba(245,158,11,0.15)] active:scale-[0.98]"
            >
              <MessageSquare
                size={16}
                className="text-amber-500/70 group-hover:text-amber-500 group-hover:scale-110 transition-all"
              />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
                Submit Platform SitRep
              </span>
            </button>
          </div>
        </div>

        {!isEditing ? (
          /* ================== VIEW MODE (ID CARD) ================== */
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-10 rounded-[24px] max-w-xl mx-auto shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />

            <div className="w-32 h-32 rounded-[24px] border-2 border-amber-500/20 overflow-hidden mb-6 relative group bg-[#0F1724] shadow-inner flex items-center justify-center text-5xl font-black text-amber-500">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                auth?.user?.name?.charAt(0).toUpperCase() || "C"
              )}
            </div>

            <h2 className="text-3xl font-black uppercase tracking-tighter italic text-white">
              {auth?.user?.name || "COMMANDER"}
            </h2>

            <div className="inline-flex items-center gap-2 mt-4 px-5 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-500 uppercase tracking-widest mb-8">
              <Shield size={14} strokeWidth={3} />{" "}
              {formData.title || "TECHNICAL LEAD"}
            </div>

            <div className="w-full bg-black/50 border border-white/5 rounded-2xl p-6 mb-8 text-left space-y-2">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#8A94A6] flex items-center gap-2">
                <Award size={12} className="text-amber-500" /> Operational
                Experience
              </p>
              <p className="text-[13px] font-bold text-[#E5E7EB] leading-relaxed">
                {formData.experience || "No experience logged on the grid."}
              </p>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="w-full py-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/30 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all duration-300 group"
            >
              <Edit2
                size={16}
                className="text-amber-500 group-hover:scale-110 transition-transform"
              />
              Modify Configuration
            </button>
          </div>
        ) : (
          /* ================== EDIT MODE (FORM) ================== */
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-6 md:p-10 rounded-3xl max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-40" />

            <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/5">
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">
                Edit <span className="text-amber-500">Parameters</span>
              </h3>
              {formData.title && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-[9px] font-black uppercase tracking-widest text-[#8A94A6] hover:text-white px-4 py-2 rounded-lg bg-white/5 border border-white/5 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex flex-col items-center sm:flex-row gap-8">
                <div className="relative h-40 w-40 sm:h-48 sm:w-48 shrink-0 rounded-[24px] bg-black/40 border-2 border-dashed border-white/10 overflow-hidden group transition-all hover:border-amber-500/30 flex items-center justify-center">
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                        <ImageIcon className="text-amber-500 mb-1" size={20} />
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">
                          Change
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-white/5 transition-colors">
                      <ImageIcon
                        className="text-white/20 mb-2 group-hover:text-amber-500 transition-colors"
                        size={28}
                      />
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/20 group-hover:text-amber-500 transition-colors text-center px-4">
                        Upload Portrait
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <h3 className="text-[#E5E7EB] font-black uppercase tracking-widest text-lg">
                    Visual Identity
                  </h3>
                  <p className="text-[#8A94A6] text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed max-w-sm">
                    Upload a high-resolution, professional portrait. This will
                    be visible to all recruits on the public command roster.
                  </p>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-white/5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] ml-2 flex items-center gap-2">
                    <Briefcase size={12} className="text-amber-500" />{" "}
                    Operational Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Head of Tactical Striking"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-4 text-sm text-white font-bold focus:border-amber-500/50 outline-none transition-all placeholder:text-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] ml-2 flex items-center gap-2">
                    <Award size={12} className="text-amber-500" /> Track Record
                    / Experience
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10+ Years Elite Coaching, Ex-National Team"
                    required
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-4 text-sm text-white font-bold focus:border-amber-500/50 outline-none transition-all placeholder:text-white/10"
                  />
                </div>
              </div>

              {loading && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-amber-500">
                    <span>Synchronizing with R2 Node...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full transition-all duration-500"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full relative group overflow-hidden bg-amber-500 text-black py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-50 mt-4 shadow-[0_10px_20px_rgba(245,158,11,0.2)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? "Committing Changes..." : "Lock & Save Profile"}
                  {!loading && <CheckCircle size={14} />}
                </span>
              </button>
            </form>
          </div>
        )}
      </div>

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

                  <LeaveReview onSuccess={() => setIsReviewModalOpen(false)} />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </Fragment>
  );
}
