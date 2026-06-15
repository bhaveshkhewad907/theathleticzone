import { useContext, useState } from "react";
import AuthContext from "../../context/AuthContext";
import { Mail, Shield, Camera } from "lucide-react";
import api from "../../services/api";
import { toast } from "react-hot-toast";

export default function AthleteProfile() {
  const auth = useContext(AuthContext);
  const user = auth?.user;

  const [imagePreview, setImagePreview] = useState<string | null>(
    (user as { profileImage?: string })?.profileImage || null,
  );
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error("Image exceeds 2MB limit.");
    }

    try {
      setImagePreview(URL.createObjectURL(file));
      const uploadData = new FormData();
      uploadData.append("avatar", file);

      await api.post("/users/avatar", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
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
      toast.success("Profile picture updated.");
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploadProgress(0);
    }
  };

  return (
    <div className="relative min-h-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.05),transparent_60%)] pointer-events-none" />

      <div className="relative z-10 space-y-8 animate-in fade-in duration-700 max-w-3xl mx-auto">
        <div className="relative overflow-hidden bg-[#0F1724]/60 backdrop-blur-md border border-white/[0.05] p-8 rounded-[16px] shadow-xl">
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white leading-none">
            My <span className="text-amber-500">Profile</span>
          </h1>
        </div>

        <div className="relative bg-[#0F1724]/80 backdrop-blur-md border border-white/[0.05] rounded-[16px] p-10 text-center shadow-xl overflow-hidden">
          <div className="relative w-32 h-32 mx-auto mb-8 group">
            <div className="w-full h-full bg-black/40 border-2 border-amber-500/20 rounded-[24px] flex items-center justify-center text-5xl font-black text-amber-500 overflow-hidden relative transition-all group-hover:border-amber-500/50">
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
                  Change Image
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
                  className="bg-amber-500 h-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>

          <h2 className="text-2xl font-black uppercase tracking-tighter italic text-white mb-6">
            {user?.name || "Athlete"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="bg-black/30 border border-white/5 rounded-xl p-4 flex items-center gap-4">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                <Mail size={16} />
              </div>
              <div className="text-xs font-black text-[#8A94A6] uppercase">
                {user?.email}
              </div>
            </div>
            <div className="bg-black/30 border border-white/5 rounded-xl p-4 flex items-center gap-4">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                <Shield size={16} />
              </div>
              <div className="text-xs font-black text-[#8A94A6] uppercase">
                {user?.role || "ATHLETE"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
