import { useState, useEffect } from "react";
import api from "../../services/api";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Plus,
  Activity,
  Power,
  PowerOff,
  Image as ImageIcon,
} from "lucide-react";

interface Sport {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

export default function ManageSports() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form State
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchSports = async () => {
    try {
      const res = await api.get("/sports/admin");
      setSports(res.data.data);
    } catch {
      toast.error("Failed to load sports registry");
    }
  };

  useEffect(() => {
    fetchSports();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 🛡️ Secure R2 Upload Pipeline (Reused from Courses)
  const uploadToR2 = async (file: File) => {
    const { data } = await api.post("/courses/get-upload-url", {
      fileName: `sports/${Date.now()}-${file.name}`,
      contentType: file.type,
      folder: "thumbnails", // We can reuse the thumbnails folder or create a "sports" one
    });

    const { uploadUrl, publicUrl } = data.data;

    await axios.put(uploadUrl, file, {
      headers: { "Content-Type": file.type },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 100),
        );
        setUploadProgress(percent);
      },
    });

    return publicUrl;
  };

  const handleCreateSport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim() || !imageFile) {
      return toast.error("Please provide a name, description, and image.");
    }

    setLoading(true);
    setIsUploading(true);
    try {
      const imageUrl = await uploadToR2(imageFile);

      await api.post("/sports", {
        name: formData.name,
        description: formData.description,
        imageUrl,
      });

      toast.success(`${formData.name} sector initialized.`);

      // Reset Form
      setFormData({ name: "", description: "" });
      setImageFile(null);
      setImagePreview(null);
      setUploadProgress(0);

      fetchSports();
    } catch {
      toast.error("Failed to create sector");
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/sports/${id}/toggle`, { isActive: !currentStatus });
      toast.success("Sector status updated.");
      fetchSports();
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="space-y-6 md:space-y-10 p-2 md:p-4 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#121821] p-6 md:p-8 rounded-3xl border border-white/5 relative overflow-hidden gap-6">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase text-white">
            Sector <span className="text-amber-500">Registry</span>
          </h1>
          <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase mt-2">
            Initialize and manage athletic disciplines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creation Form Panel */}
        <div className="lg:col-span-1 bg-[#121821] border border-white/5 p-6 rounded-3xl h-fit">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-6 flex items-center gap-2">
            <Plus size={14} /> Initialize New Sector
          </h2>

          <form onSubmit={handleCreateSport} className="space-y-4">
            <input
              type="text"
              placeholder="Sector Name (e.g. Cricket)"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-all"
            />

            <textarea
              placeholder="Short Description for Landing Page..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500/50 outline-none transition-all resize-none h-24"
            />

            <div className="relative h-32 border-2 border-dashed border-white/5 rounded-xl bg-black/40 overflow-hidden group transition-all hover:border-amber-500/30">
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover opacity-70"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white px-2 py-1 rounded text-[8px] font-black uppercase transition-all backdrop-blur-md"
                  >
                    Reset
                  </button>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                  <ImageIcon
                    className="text-white/20 mb-2 group-hover:text-amber-500 transition-colors"
                    size={24}
                  />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/20 group-hover:text-amber-500 transition-colors">
                    Upload Cover Image
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

            {isUploading && (
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all duration-500"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || isUploading}
              className="w-full bg-amber-500 text-black py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-50"
            >
              {isUploading ? "Uploading to R2..." : "Deploy Sector"}
            </button>
          </form>
        </div>

        {/* Existing Sectors Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sports.map((sport) => (
            <div
              key={sport._id}
              className="group bg-[#121821] border border-white/5 p-4 rounded-3xl transition-all duration-300 hover:border-amber-500/30"
            >
              <div className="relative h-32 rounded-xl overflow-hidden mb-4">
                <img
                  src={
                    sport.imageUrl ||
                    "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=800"
                  }
                  alt={sport.name}
                  className={`w-full h-full object-cover ${!sport.isActive && "grayscale opacity-50"}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] to-transparent opacity-80" />
                <h3 className="absolute bottom-3 left-3 font-black text-white italic tracking-tighter uppercase text-lg">
                  {sport.name}
                </h3>
              </div>

              <div className="flex justify-between items-center px-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${sport.isActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
                  />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                    {sport.isActive ? "Active Deployment" : "Offline"}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleStatus(sport._id, sport.isActive)}
                  className={`p-2 rounded-xl border transition-all ${
                    sport.isActive
                      ? "bg-green-500/10 border-green-500/20 text-green-500 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/30"
                      : "bg-white/5 border-white/5 text-white/20 hover:bg-green-500/20 hover:text-green-500 hover:border-green-500/30"
                  }`}
                >
                  {sport.isActive ? (
                    <Power size={14} strokeWidth={3} />
                  ) : (
                    <PowerOff size={14} strokeWidth={3} />
                  )}
                </button>
              </div>
            </div>
          ))}

          {sports.length === 0 && (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-white/5 rounded-[16px] bg-black/20">
              <Activity className="mx-auto text-white/10 mb-4" size={32} />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8A94A6]/30">
                No sectors initialized in core database.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
