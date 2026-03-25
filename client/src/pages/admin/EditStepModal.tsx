import { useState } from "react";
import { createPortal } from "react-dom";
import { X, UploadCloud, Video } from "lucide-react";
import axios from "axios";
import api from "../../services/api";
import toast from "react-hot-toast";

interface Step {
  _id: string;
  title: string;
  type: string;
}

interface EditStepModalProps {
  step: Step;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditStepModal({
  step,
  onClose,
  onSuccess,
}: EditStepModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a new video file.");

    setIsUploading(true);
    try {
      // 1. Get the VIP Upload URL from Backend
      const extension = file.name.split(".").pop();
      const urlRes = await api.post("/chapters/steps/upload-url", {
        contentType: file.type,
        extension,
      });

      const { uploadUrl, publicUrl } = urlRes.data.data;

      // 2. Upload the new video DIRECTLY to Cloudflare R2
      await axios.put(uploadUrl, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1),
          );
          setUploadProgress(percentCompleted);
        },
      });

      // 3. 🚀 THE FIX: Tell the database to update this specific Step ID with the new URL
      await api.put(`/chapters/steps/${step._id}`, {
        videoUrl: publicUrl,
      });

      toast.success("Video Asset Updated Successfully!");
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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0F1724] border border-white/10 rounded-[24px] w-[85%] max-w-md overflow-hidden shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-black italic uppercase text-white">
              Fix Video Asset
            </h2>
            <p className="text-[10px] text-amber-500 uppercase tracking-widest mt-1">
              Target: {step.title}
            </p>
          </div>
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
              Upload Replacement Video
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
                {file ? file.name : "Click or drag new video file here"}
              </p>
            </div>
          </div>

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
            disabled={isUploading || !file}
            className="w-full py-4 rounded-xl bg-amber-500 text-black font-black text-[10px] uppercase tracking-[0.2em] hover:bg-amber-400 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isUploading ? "Replacing Asset..." : "Confirm Replacement"}
            {!isUploading && <UploadCloud size={16} />}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}
