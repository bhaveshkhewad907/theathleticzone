import { useState, useEffect } from "react";
import api from "../../services/api";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Trash2,
  AlertTriangle,
  X,
  Database,
  LayoutTemplate,
  Network,
} from "lucide-react";

import CreateStepModal from "./CreateStepModal";
import CreateTemplateModal from "./CreateTemplateModal";
import CourseArchitectModal from "./CourseArchitectModal";

interface Protocol {
  _id: string;
  meta: {
    title: string;
    description: string;
    tier: string;
    targetDeficit: string;
    coverImageUrl: string;
  };
}

export default function AdminCourses() {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [showStepModal, setShowStepModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [architectCourse, setArchitectCourse] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    level: "Beginner",
    deficit: "Strength",
    customTitle: "",
    description: "",
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);

  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    courseId: string | null;
    courseTitle: string;
  }>({ isOpen: false, courseId: null, courseTitle: "" });

  const [isProcessingAction, setIsProcessingAction] = useState(false);

  useEffect(() => {
    fetchProtocols();
  }, []);

  const fetchProtocols = async () => {
    try {
      const res = await api.get("/courses/admin");
      setProtocols(res.data.data);
    } catch (error) {
      console.error("Failed to fetch protocols", error);
    }
  };

  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbPreview(URL.createObjectURL(file));
    }
  };

  const uploadThumbnailToR2 = async (file: File) => {
    const { data } = await api.post("/courses/get-upload-url", {
      fileName: file.name,
      contentType: file.type,
      folder: "thumbnails",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!thumbnailFile) {
      return toast.error("Please provide a visual cover (thumbnail).");
    }

    try {
      setIsUploading(true);

      const thumbUrl = await uploadThumbnailToR2(thumbnailFile);
      setUploadProgress(100);

      const finalTitle = `${formData.level} ${formData.deficit} Track: ${formData.customTitle}`;

      await api.post("/courses", {
        meta: {
          title: finalTitle,
          description: formData.description,
          tier: formData.level,
          targetDeficit: formData.deficit,
          coverImageUrl: thumbUrl,
        },
      });
      setShowModal(false);
      resetForm();
      fetchProtocols();
      toast.success("Protocol Container initialized successfully! 🚀");
    } catch (err) {
      const error = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };

      console.error("Deployment Error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message ||
          "Failed to deploy protocol. Verify network integrity.",
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleConfirmDelete = async () => {
    if (!actionModal.courseId) return;
    setIsProcessingAction(true);

    try {
      await api.delete(`/courses/${actionModal.courseId}`);
      toast.success("Protocol permanently purged from the vault.");
      fetchProtocols();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Purge failed. Contact Super Admin.",
      );
    } finally {
      setIsProcessingAction(false);
      setActionModal({ isOpen: false, courseId: null, courseTitle: "" });
    }
  };

  const resetForm = () => {
    setFormData({
      level: "Beginner",
      deficit: "Strength",
      customTitle: "",
      description: "",
    });
    setThumbnailFile(null);
    setThumbPreview(null);
  };

  return (
    <>
      <div className="relative min-h-screen space-y-6 md:space-y-10 p-2 md:p-4 animate-in fade-in duration-700">
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-[#121821] p-6 md:p-8 rounded-3xl border border-white/5 relative overflow-hidden gap-6 shadow-2xl">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase text-white">
              Protocol <span className="text-amber-500">Vault</span>
            </h1>
            <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase mt-2">
              Manage internal training programs for algorithmic assignment.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 w-full xl:w-auto">
            <button
              onClick={() => setShowStepModal(true)}
              className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-5 py-4 bg-black/40 border border-white/10 hover:border-amber-500/50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-inner hover:bg-black/60"
            >
              <Database size={14} className="text-amber-500" />
              Content Vault
            </button>

            <button
              onClick={() => setShowTemplateModal(true)}
              className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-5 py-4 bg-black/40 border border-white/10 hover:border-amber-500/50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-inner hover:bg-black/60"
            >
              <LayoutTemplate size={14} className="text-amber-500" />
              Day Builder
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="w-full xl:w-auto bg-amber-500 text-black px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-400 transition-all active:scale-95 shadow-xl shadow-amber-500/10"
            >
              Deploy New Protocol
            </button>
          </div>
        </div>

        {/* Protocols Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {protocols.map((protocol) => (
            <div
              key={protocol._id}
              className="group bg-[#121821] border border-white/5 p-4 rounded-[2rem] transition-all duration-300 hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.05)] flex flex-col"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-4">
                <img
                  src={protocol.meta?.coverImageUrl?.replace(
                    "http://",
                    "https://",
                  )}
                  alt={protocol.meta?.title || "Protocol Thumbnail"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] to-transparent opacity-60" />
                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black text-amber-500 uppercase tracking-widest">
                  {protocol.meta?.tier || "LEVEL"} •{" "}
                  {protocol.meta?.targetDeficit || "DEFICIT"}
                </div>
              </div>

              <h3 className="font-bold text-white tracking-tight px-2 truncate text-base md:text-lg uppercase italic">
                {protocol.meta?.title}
              </h3>

              <div className="mt-auto pt-4 flex flex-col gap-4">
                <div className="flex justify-between items-center px-2">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                      Algorithmic Ready
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      setActionModal({
                        isOpen: true,
                        courseId: protocol._id,
                        courseTitle: protocol.meta?.title,
                      })
                    }
                    className="p-2 rounded-xl bg-[#0B0F14] border border-white/5 text-red-500/50 hover:text-red-500 hover:border-red-500/30 transition-all"
                    title="Permanently Purge"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <button
                  onClick={() =>
                    setArchitectCourse({
                      id: protocol._id,
                      name: protocol.meta?.title,
                    })
                  }
                  className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-black border border-amber-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300"
                >
                  <Network size={14} />
                  Architect Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🚀 RESTORED: Create New Protocol Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#0F1724]/90 border border-white/10 p-6 md:p-10 rounded-[24px] max-w-lg w-[95vw] md:w-full space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] relative overflow-hidden my-auto">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-40" />

            <div className="space-y-1 pt-2">
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase italic leading-none">
                Protocol <span className="text-amber-500">Deployment</span>
              </h2>
              <p className="text-[8px] md:text-[9px] text-[#8A94A6] font-black uppercase tracking-[0.3em] opacity-60">
                Container Initialization Protocol
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] ml-2">
                  Target Level
                </label>
                <select
                  className="w-full bg-black/40 border border-white/[0.05] p-4 rounded-[12px] text-sm text-[#E5E7EB] focus:border-amber-500/50 outline-none transition-all appearance-none"
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({ ...formData, level: e.target.value })
                  }
                >
                  <option value="Beginner">
                    Level 1 - Foundation (Beginner)
                  </option>
                  <option value="Intermediate">
                    Level 2 - Performance (Intermediate)
                  </option>
                  <option value="Advanced">Level 3 - Elite (Advanced)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] ml-2">
                  Target Deficit
                </label>
                <select
                  className="w-full bg-black/40 border border-white/[0.05] p-4 rounded-[12px] text-sm text-[#E5E7EB] focus:border-amber-500/50 outline-none transition-all appearance-none"
                  value={formData.deficit}
                  onChange={(e) =>
                    setFormData({ ...formData, deficit: e.target.value })
                  }
                >
                  <option value="Strength">Strength Deficit</option>
                  <option value="Power">Power Deficit</option>
                  <option value="Mobility">Mobility Deficit</option>
                  <option value="Technique">Technique Deficit</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] ml-2">
                  Module Descriptor (Appended)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Tactical Movement Alpha"
                  className="w-full bg-black/40 border border-white/[0.05] p-4 rounded-[12px] text-sm text-[#E5E7EB] focus:border-amber-500/50 outline-none transition-all placeholder:text-white/5 font-medium"
                  value={formData.customTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, customTitle: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] ml-2">
                  Instructional Summary
                </label>
                <textarea
                  placeholder="Describe the training objectives..."
                  className="w-full bg-black/40 border border-white/[0.05] p-4 rounded-[12px] text-sm h-24 text-[#E5E7EB] focus:border-amber-500/50 outline-none resize-none transition-all placeholder:text-white/5 font-medium"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8A94A6] text-center">
                  Visual Cover
                </p>
                <div className="relative h-32 md:h-40 w-full border-2 border-dashed border-white/5 rounded-[16px] bg-black/40 overflow-hidden group transition-all hover:border-amber-500/30">
                  {thumbPreview ? (
                    <>
                      <img
                        src={thumbPreview}
                        alt="Preview"
                        className="w-full h-full object-cover opacity-70"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setThumbnailFile(null);
                          setThumbPreview(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white px-3 py-1.5 rounded-md text-[8px] font-black uppercase transition-all backdrop-blur-md"
                      >
                        Reset Cover
                      </button>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                      <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-amber-500/20 transition-all">
                        <span className="text-amber-500 text-xl">+</span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                        Upload Display Thumbnail
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {isUploading && (
              <div className="space-y-3 bg-black/40 p-4 rounded-[12px] border border-white/5">
                <div className="flex justify-between text-[9px] text-amber-500 font-black tracking-[0.2em] uppercase">
                  <span className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-amber-500 animate-ping" />
                    Transmitting to R2 Node
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all duration-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-white/[0.05]">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="w-full sm:flex-1 text-[10px] py-4 uppercase font-black tracking-widest text-[#8A94A6] hover:text-white border border-white/5 rounded-[12px] transition-all hover:bg-white/5"
              >
                Abort
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  isUploading || !formData.customTitle || !thumbnailFile
                }
                className="w-full sm:flex-[2] bg-amber-500 py-4 rounded-[12px] text-[10px] font-black uppercase tracking-[0.2em] text-black disabled:opacity-20 hover:bg-amber-400 transition-all shadow-[0_10px_20px_rgba(245,158,11,0.2)] active:scale-95"
              >
                {isUploading ? "Executing Upload..." : "Authorize Deployment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modals */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 z-[60] animate-in fade-in">
          <div className="bg-[#121821] border border-white/10 p-6 md:p-8 rounded-[2rem] max-w-sm w-[95vw] md:w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />

            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
              <h2 className="text-lg md:text-xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
                <AlertTriangle className="text-red-500" size={20} />
                Confirm Deletion
              </h2>
              <button
                onClick={() =>
                  setActionModal({
                    isOpen: false,
                    courseId: null,
                    courseTitle: "",
                  })
                }
                className="text-white/20 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 mb-8 text-center">
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-relaxed">
                Target Protocol:
              </p>
              <p className="text-base md:text-lg font-black text-white italic tracking-tight">
                "{actionModal.courseTitle}"
              </p>

              <div className="mt-4 p-4 rounded-xl border bg-red-500/10 border-red-500/20 text-red-500">
                <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed">
                  CRITICAL WARNING: This will permanently purge the protocol. Do
                  not delete if athletes are currently assigned to this track.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() =>
                  setActionModal({
                    isOpen: false,
                    courseId: null,
                    courseTitle: "",
                  })
                }
                disabled={isProcessingAction}
                className="flex-1 py-4 rounded-xl bg-[#0B0F14] border border-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest hover:border-white/10 hover:text-white transition-all disabled:opacity-50"
              >
                Abort
              </button>

              <button
                onClick={handleConfirmDelete}
                disabled={isProcessingAction}
                className="flex-1 py-4 rounded-xl text-black text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 bg-red-500 hover:bg-red-400 shadow-xl shadow-red-500/10"
              >
                {isProcessingAction ? "Executing..." : "Purge Protocol"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showStepModal && (
        <CreateStepModal
          onClose={() => setShowStepModal(false)}
          onSuccess={() => {}}
        />
      )}

      {showTemplateModal && (
        <CreateTemplateModal
          onClose={() => setShowTemplateModal(false)}
          onSuccess={() => {}}
        />
      )}

      {architectCourse && (
        <CourseArchitectModal
          courseId={architectCourse.id}
          courseName={architectCourse.name}
          onClose={() => setArchitectCourse(null)}
          onSuccess={() => {}}
        />
      )}
    </>
  );
}
