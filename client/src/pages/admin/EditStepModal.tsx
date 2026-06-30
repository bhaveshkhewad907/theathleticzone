import { useState } from "react";
import { createPortal } from "react-dom";
import { X, UploadCloud, Video, FileText } from "lucide-react";
import axios from "axios";
import api from "../../services/api";
import toast from "react-hot-toast";

interface Step {
  _id: string;
  title: string;
  type: string;
  videoUrl?: string;
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
  // Pre-populate with existing data
  const [title, setTitle] = useState(step.title);
  const [type, setType] = useState(step.type);
  const [file, setFile] = useState<File | null>(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return toast.error("Step Title is required.");

    setIsProcessing(true);
    try {
      let finalVideoUrl = undefined;

      // 1. Only process Cloudflare upload IF a new video was selected
      if (file) {
        const urlRes = await api.post("/courses/get-upload-url", {
          fileName: file.name,
          contentType: file.type,
          folder: "videos",
        });

        const { uploadUrl, publicUrl } = urlRes.data.data;

        await axios.put(uploadUrl, file, {
          headers: { "Content-Type": file.type },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1),
            );
            setUploadProgress(percentCompleted);
          },
        });

        finalVideoUrl = publicUrl;
      }

      // 2. Submit partial or full update to backend
      const updatePayload = {
        title,
        type,
        ...(finalVideoUrl && { videoUrl: finalVideoUrl }),
      };

      await api.put(`/chapters/steps/${step._id}`, updatePayload);

      toast.success("Protocol Step Updated Successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      console.error(error);
      toast.error(
        error.response?.data?.message || "Update failed. Check console.",
      );
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0F1724] border border-white/10 rounded-[24px] w-[90%] max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center p-6 border-b border-white/5 sticky top-0 bg-[#0F1724]/90 backdrop-blur-md z-10">
          <div>
            <h2 className="text-xl font-black italic uppercase text-white">
              Edit Vault Asset
            </h2>
            <p className="text-[10px] text-amber-500 uppercase tracking-widest mt-1">
              ID: {step._id.slice(-6)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="p-6 space-y-6">
          {/* Metadata Editing */}
          <div className="space-y-4 border-b border-white/5 pb-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] mb-2 flex items-center gap-2">
                <FileText size={12} /> Step Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-500/50 transition-colors"
                required
                disabled={isProcessing}
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
                disabled={isProcessing}
              >
                <option value="WARMUP">Warmup Protocol</option>
                <option value="EXERCISE">Primary Exercise</option>
                <option value="COOLDOWN">Cooldown / Recovery</option>
                <option value="EDUCATION">Educational / Briefing</option>
              </select>
            </div>
          </div>

          {/* Media Editing */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] mb-2 block">
              Replace Video Asset (Optional)
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors relative ${file ? "border-amber-500/50 bg-amber-500/5" : "border-white/10 hover:border-amber-500/30"}`}
            >
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isProcessing}
              />
              <Video
                className={`mx-auto mb-2 ${file ? "text-amber-500" : "text-amber-500/50"}`}
                size={32}
              />
              <p className="text-sm font-bold text-white">
                {file ? file.name : "Click or drag to replace current video"}
              </p>
              {!file && step.videoUrl && (
                <p className="text-[9px] text-[#8A94A6] mt-2 uppercase tracking-widest">
                  Current video will be retained if empty
                </p>
              )}
            </div>
          </div>

          {/* Progress Indicator */}
          {isProcessing && file && (
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

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 py-4 rounded-xl border border-white/10 text-white/50 font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all disabled:opacity-50"
            >
              Abort
            </button>
            <button
              type="submit"
              disabled={isProcessing || !title}
              className="flex-[2] py-4 rounded-xl bg-amber-500 text-black font-black text-[10px] uppercase tracking-[0.2em] hover:bg-amber-400 transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-[0_10px_30px_rgba(245,158,11,0.2)]"
            >
              {isProcessing ? "Saving Changes..." : "Commit Changes"}
              {!isProcessing && <UploadCloud size={16} />}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
