import { useState } from "react";
import { X, UploadCloud, Video } from "lucide-react";
import axios from "axios";
import api from "../../services/api";
import toast from "react-hot-toast";

interface CreateStepModalProps {
  onClose: () => void;
  onSuccess: () => void; // Call this to refresh your list of steps
}

export default function CreateStepModal({
  onClose,
  onSuccess,
}: CreateStepModalProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("EXERCISE");
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) return toast.error("Title and Video are required");

    setIsUploading(true);
    try {
      // 1. Ask Backend for a VIP VIP Upload Pass (Pre-signed URL)
      const extension = file.name.split(".").pop();
      const urlRes = await api.post("/chapters/steps/upload-url", {
        contentType: file.type,
        extension,
      });

      const { uploadUrl, publicUrl } = urlRes.data.data;

      // 2. Upload DIRECTLY to Cloudflare R2 (Bypasses your Node.js server!)
      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1),
          );
          setUploadProgress(percentCompleted);
        },
      });

      // 3. Save the actual Step data to your database
      await api.post("/chapters/steps", {
        title,
        type,
        videoUrl: publicUrl,
      });

      toast.success("Training Step added to Vault!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0F1724] border border-white/10 rounded-[24px] w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h2 className="text-xl font-black italic uppercase text-white">
            Create Protocol Step
          </h2>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleUpload} className="p-6 space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] mb-2 block">
              Step Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Kettlebell Swing - Form Review"
              className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-500/50 transition-colors"
              required
              disabled={isUploading}
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] mb-2 block">
              Classification
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-500/50 appearance-none"
              disabled={isUploading}
            >
              <option value="WARMUP">Warmup Protocol</option>
              <option value="EXERCISE">Primary Exercise</option>
              <option value="COOLDOWN">Cooldown / Recovery</option>
              <option value="EDUCATION">Educational / Briefing</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] mb-2 block">
              Video Asset (Direct to Vault)
            </label>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-amber-500/30 transition-colors relative">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <Video className="mx-auto text-amber-500/50 mb-2" size={32} />
              <p className="text-sm font-bold text-white">
                {file ? file.name : "Click or drag video file to attach"}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-amber-500">
                <span>Transmitting</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-black rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isUploading || !file || !title}
            className="w-full py-4 rounded-xl bg-amber-500 text-black font-black text-[10px] uppercase tracking-[0.2em] hover:bg-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isUploading ? "Uploading to Secure Vault..." : "Initialize Step"}
            {!isUploading && <UploadCloud size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}
