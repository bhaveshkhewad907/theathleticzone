import { PlayCircle, UploadCloud, CheckCircle, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import api from "../../services/api";

interface Props {
  data: { sprint30mSeconds: string; sprintVideoUrl: string };
  updateData: (
    category: "mobility" | "power" | "sprinting" | "strength",
    field: string,
    value: string,
  ) => void;
}

export default function SprintStep({ data, updateData }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeDemoVideo, setActiveDemoVideo] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 50MB.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const res = await api.post("/courses/get-upload-url", {
        fileName: file.name,
        contentType: file.type,
        folder: "assessments",
      });

      const { uploadUrl, fileKey } = res.data.data;

      await axios.put(uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1),
          );
          setUploadProgress(percentCompleted);
        },
      });

      updateData("sprinting", "sprintVideoUrl", fileKey);
      toast.success("Tape uploaded securely!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed. Please check your connection and try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="animate-fade-up relative">
      <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">
        Phase 3: <span className="text-amber-500">The Tape</span>
      </h2>
      <p className="text-white/60 text-sm mb-8">
        Numbers tell us half the story. The tape tells us the rest.
      </p>

      {/* 30m SPRINT TIME INPUT */}
      <div className="mb-10">
        <label className="text-sm font-bold uppercase tracking-widest text-white/90 block mb-3">
          1. 30m Sprint Time
        </label>

        <div className="relative">
          <input
            type="number"
            step="0.01"
            value={data.sprint30mSeconds}
            onChange={(e) =>
              updateData("sprinting", "sprint30mSeconds", e.target.value)
            }
            placeholder="e.g. 4.25"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white text-lg font-bold placeholder:text-white/20 focus:border-amber-500 focus:outline-none transition-all shadow-inner"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">
            sec
          </span>
        </div>
      </div>

      {/* VIDEO UPLOAD ZONE */}
      <div>
        <div className="flex items-start justify-between mb-4">
          <label className="text-sm font-bold uppercase tracking-widest text-white/90 block">
            2. Upload Sprint Video
          </label>
          <button
            onClick={() =>
              setActiveDemoVideo(
                "https://media.theathleticzone.in/assessment-demo-videos/30m%20sprint.MOV",
              )
            }
            className="flex items-center gap-1.5 text-amber-500 text-[10px] font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition-colors"
            aria-label="Watch video demonstration for How to Film Sprint"
          >
            <PlayCircle size={14} /> How to Film
          </button>
        </div>

        <p className="text-xs text-white/40 mb-3">
          Upload a side-view video of your 30m sprint. Ensure your full body is
          in the frame. Max size: 50MB.
        </p>

        <label
          className={`relative overflow-hidden flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
            data.sprintVideoUrl
              ? "border-green-500/50 bg-green-500/5"
              : "border-white/20 hover:border-amber-500/50 bg-black/40 hover:bg-amber-500/5 shadow-inner"
          }`}
        >
          {isUploading && (
            <div
              className="absolute left-0 bottom-0 h-full bg-amber-500/10 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          )}

          {isUploading ? (
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">
                Uploading...
              </span>
              <span className="text-xl font-black text-white">
                {uploadProgress}%
              </span>
            </div>
          ) : data.sprintVideoUrl ? (
            <div className="relative z-10 flex flex-col items-center text-green-500">
              <CheckCircle size={32} className="mb-2" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Tape Secured
              </span>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col items-center text-white/40 group-hover:text-amber-500 transition-colors">
              <UploadCloud size={32} className="mb-2" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Tap to Browse Files
              </span>
            </div>
          )}

          <input
            type="file"
            accept="video/mp4,video/quicktime"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading || !!data.sprintVideoUrl}
          />
        </label>
      </div>

      {/* 🎥 DYNAMIC ASSESSMENT VIDEO DEMO MODAL */}
      {activeDemoVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-3 border-b border-white/5 bg-zinc-950">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">
                Movement Demonstration
              </span>
              <button
                onClick={() => setActiveDemoVideo(null)}
                className="text-white/60 hover:text-white transition-colors p-1"
                aria-label="Close demo player"
              >
                <X size={18} />
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              <video
                src={activeDemoVideo}
                controls
                autoPlay
                className="w-full h-full object-contain"
                controlsList="nodownload"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
