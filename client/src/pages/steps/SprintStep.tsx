import { PlayCircle, UploadCloud, CheckCircle, X } from "lucide-react";
import { memo, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import api from "../../services/api";

interface Props {
  data: {
    sprint30mSeconds: string;
    sprint100mSeconds?: string;
    sprint200mSeconds?: string;
    sprintVideoUrl: string;
  };
  updateData: (
    category: "mobility" | "power" | "sprinting" | "strength",
    field: string,
    value: string,
  ) => void;
}

function SprintStep({ data, updateData }: Props) {
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

      {/* 🚀 SPRINT TIMES GRID */}
      <div className="mb-10">
        <label className="text-sm font-bold uppercase tracking-widest text-white/90 block mb-3">
          1. Track Metrics
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 30m Input */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 text-[10px] font-black uppercase tracking-widest">
              30m
            </span>
            <input
              type="number"
              step="0.01"
              value={data.sprint30mSeconds}
              onChange={(e) =>
                updateData("sprinting", "sprint30mSeconds", e.target.value)
              }
              placeholder="e.g. 4.25"
              className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-14 pr-12 text-white text-base font-bold placeholder:text-white/20 focus:border-amber-500 focus:outline-none transition-all shadow-inner"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-bold text-sm">
              sec
            </span>
          </div>

          {/* 100m Input */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 text-[10px] font-black uppercase tracking-widest">
              100m
            </span>
            <input
              type="number"
              step="0.01"
              value={data.sprint100mSeconds || ""}
              onChange={(e) =>
                updateData("sprinting", "sprint100mSeconds", e.target.value)
              }
              placeholder="e.g. 11.50"
              className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-14 pr-12 text-white text-base font-bold placeholder:text-white/20 focus:border-amber-500 focus:outline-none transition-all shadow-inner"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-bold text-sm">
              sec
            </span>
          </div>

          {/* 200m Input */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500 text-[10px] font-black uppercase tracking-widest">
              200m
            </span>
            <input
              type="number"
              step="0.01"
              value={data.sprint200mSeconds || ""}
              onChange={(e) =>
                updateData("sprinting", "sprint200mSeconds", e.target.value)
              }
              placeholder="e.g. 23.20"
              className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-14 pr-12 text-white text-base font-bold placeholder:text-white/20 focus:border-amber-500 focus:outline-none transition-all shadow-inner"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-bold text-sm">
              sec
            </span>
          </div>
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

      {/* 🎬 DYNAMIC VERTICAL REEL DEMO MODAL */}
      {activeDemoVideo && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#0B0F14]/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <button
            onClick={() => setActiveDemoVideo(null)}
            className="absolute top-6 right-6 md:top-10 md:right-10 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md transition-all active:scale-90 z-10"
            aria-label="Close demo player"
          >
            <X size={20} className="md:w-6 md:h-6" />
          </button>

          <div className="relative w-full max-w-[45vh] aspect-[9/16] bg-black rounded-[2rem] overflow-hidden border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-10 zoom-in-95 duration-500">
            <video
              src={activeDemoVideo}
              controls
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              controlsList="nodownload"
            />
          </div>
        </div>
      )}
    </div>
  );
}
export default memo(SprintStep);
