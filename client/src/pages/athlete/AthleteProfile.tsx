import { useContext, useState, useEffect } from "react";
import AuthContext from "../../context/AuthContext";
import { Mail, Shield, Camera } from "lucide-react";
import api from "../../services/api";
import { toast } from "react-hot-toast";

interface ExtendedUser {
  name?: string;
  email?: string;
  role?: string;
  profileImage?: string;
}

export default function AthleteProfile() {
  const auth = useContext(AuthContext);
  const user = auth?.user as ExtendedUser | null;

  const [imagePreview, setImagePreview] = useState<string | null>(
    user?.profileImage || null,
  );
  const [uploadProgress, setUploadProgress] = useState(0);

  // =========================================================
  // 🚀 RESTORES THE GLOBAL APP BACKGROUND FEATURE
  // =========================================================
  useEffect(() => {
    const bgImage = user?.profileImage || imagePreview;
    if (bgImage) {
      // Applies the image to the root HTML body so it persists EVERYWHERE in the application!
      // Includes a deep cinematic gradient so text stays readable on all pages.
      document.body.style.backgroundImage = `linear-gradient(to bottom, rgba(11, 15, 20, 0.85), rgba(11, 15, 20, 0.98)), url('${bgImage}')`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center top";
      document.body.style.backgroundAttachment = "fixed";
    }

    // Notice: We purposefully do NOT clean this up on unmount because we want the background to stay when they navigate away!
  }, [user?.profileImage, imagePreview]);

  // Sync preview if user state updates remotely
  useEffect(() => {
    if (user?.profileImage) setImagePreview(user.profileImage);
  }, [user?.profileImage]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 🚀 FIX 1: Matched the Backend 2MB limit!
    if (file.size > 2 * 1024 * 1024) {
      return toast.error("Image exceeds 2MB limit.");
    }

    try {
      setImagePreview(URL.createObjectURL(file));

      const uploadData = new FormData();
      uploadData.append("avatar", file); // The keyword "avatar" matches perfectly!

      // 🚀 FIX 2: Pointed to the exact backend route: /users/upload-avatar
      await api.post("/users/upload-avatar", uploadData, {
        onUploadProgress: (progressEvent) => {
          setUploadProgress(
            Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 100),
            ),
          );
        },
      });

      if (auth?.setAuth) {
        const meRes = await api.get("/auth/me");
        auth.setAuth(meRes.data.data);
      }
      toast.success("Profile picture updated & applied globally.");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed. Please try a different image.");
      setImagePreview(user?.profileImage || null);
    } finally {
      setUploadProgress(0);
    }
  };

  return (
    <div className="relative min-h-full">
      {/* Dynamic ambient lighting for the profile page specifically */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.05),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 space-y-8 animate-in fade-in duration-700 max-w-3xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-[#0F1724]/60 backdrop-blur-xl border border-white/10 p-8 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white leading-none">
            My <span className="text-amber-500">Profile</span>
          </h1>
        </div>

        {/* Main Card */}
        <div className="relative bg-[#0F1724]/60 backdrop-blur-xl border border-white/10 rounded-[24px] p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* Glowing Aura Behind Avatar */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[150px] h-[150px] bg-amber-500/20 blur-[60px] pointer-events-none rounded-full" />

          {/* Avatar Upload Area */}
          <div className="relative w-36 h-36 mx-auto mb-10 group cursor-pointer z-10">
            <div className="w-full h-full bg-black/40 border-2 border-amber-500/30 rounded-[2rem] flex items-center justify-center text-5xl font-black text-amber-500 overflow-hidden relative transition-all duration-300 group-hover:border-amber-500 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                user?.name?.charAt(0).toUpperCase() || "A"
              )}

              <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all duration-300 flex flex-col items-center justify-center cursor-pointer">
                <Camera className="text-amber-500 mb-2" size={24} />
                <span className="text-[9px] font-black text-white uppercase tracking-widest text-center px-2 drop-shadow-md">
                  Update Identity
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

            {/* Smooth Progress Bar */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="absolute -bottom-6 left-0 w-full bg-white/10 h-1.5 rounded-full overflow-hidden shadow-inner">
                <div
                  className="bg-amber-500 h-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(245,158,11,0.8)]"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>

          <h2 className="text-3xl font-black uppercase tracking-tighter italic text-white mb-8 drop-shadow-lg">
            {user?.name || "Athlete"}
          </h2>

          {/* User Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex items-center gap-4 shadow-inner hover:border-amber-500/20 transition-colors">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 shadow-inner">
                <Mail size={18} />
              </div>
              <div className="text-xs font-black text-[#8A94A6] uppercase tracking-wider">
                {user?.email}
              </div>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex items-center gap-4 shadow-inner hover:border-amber-500/20 transition-colors">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 shadow-inner">
                <Shield size={18} />
              </div>
              <div className="text-xs font-black text-[#8A94A6] uppercase tracking-wider">
                {user?.role || "ATHLETE"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
