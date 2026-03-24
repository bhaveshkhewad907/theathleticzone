import { useState, useEffect } from "react";
import api from "../../services/api";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Trash2,
  PowerOff,
  Power,
  AlertTriangle,
  X,
  Database,
  LayoutTemplate,
  Network,
} from "lucide-react";

// 🚀 IMPORTS: Protocol Command Center Modals
import CreateStepModal from "./CreateStepModal";
import CreateTemplateModal from "./CreateTemplateModal";
import CourseArchitectModal from "./CourseArchitectModal";

interface Course {
  _id: string;
  title: string;
  price: number;
  isActive: boolean;
  videoUrl: string;
  thumbnailUrl: string;
}

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // 🚀 STATE: Protocol Builder Modals
  const [showStepModal, setShowStepModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [architectCourse, setArchitectCourse] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);

  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: "DEACTIVATE" | "REACTIVATE" | "DELETE" | null;
    courseId: string | null;
    courseTitle: string;
  }>({ isOpen: false, type: null, courseId: null, courseTitle: "" });
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/courses/admin");
      setCourses(res.data.data);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };

  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbPreview(URL.createObjectURL(file));
    }
  };

  const uploadToR2 = async (file: File, folder: "videos" | "thumbnails") => {
    const { data } = await api.post("/courses/get-upload-url", {
      fileName: file.name,
      contentType: file.type,
      folder: folder,
    });

    const { uploadUrl, publicUrl, fileKey } = data.data;

    await axios.put(uploadUrl, file, {
      headers: { "Content-Type": file.type },
      onUploadProgress: (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 100),
        );
        setUploadProgress(percent);
      },
    });

    return { publicUrl, fileKey: fileKey || `${folder}/${file.name}` };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thumbnailFile || !videoFile) {
      return toast.error("Please select both a thumbnail and a video");
    }

    try {
      setIsUploading(true);

      const thumbData = await uploadToR2(thumbnailFile, "thumbnails");
      setUploadProgress(0);
      const videoData = await uploadToR2(videoFile, "videos");

      // 🚀 Zod-Compliant Payload
      await api.post("/courses", {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        thumbnailUrl: thumbData.publicUrl,
        videoUrl: videoData.fileKey, // Strictly mapped to what the backend expects
      });

      setShowModal(false);
      resetForm();
      fetchCourses();
      toast.success("Course published successfully! 🚀");
    } catch (error) {
      console.error(error);
      toast.error("Failed to publish course. Verify network integrity.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleConfirmAction = async () => {
    if (!actionModal.courseId) return;
    setIsProcessingAction(true);

    try {
      if (actionModal.type === "DEACTIVATE") {
        await api.patch(`/courses/${actionModal.courseId}/deactivate`);
        toast.success("Module taken offline successfully.");
      } else if (actionModal.type === "REACTIVATE") {
        await api.patch(`/courses/${actionModal.courseId}/reactivate`);
        toast.success("Module is now live on the storefront.");
      } else if (actionModal.type === "DELETE") {
        await api.delete(`/courses/${actionModal.courseId}`);
        toast.success("Module permanently purged from storefront.");
      }
      fetchCourses();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Execution failed. Contact Super Admin.",
      );
    } finally {
      setIsProcessingAction(false);
      setActionModal({
        isOpen: false,
        type: null,
        courseId: null,
        courseTitle: "",
      });
    }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", price: "" });
    setThumbnailFile(null);
    setVideoFile(null);
    setThumbPreview(null);
  };

  return (
    <>
      <div className="relative min-h-screen space-y-6 md:space-y-10 p-2 md:p-4 animate-in fade-in duration-700">
        {/* 🚀 UPGRADED: Protocol Command Center Header */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-[#121821] p-6 md:p-8 rounded-3xl border border-white/5 relative overflow-hidden gap-6 shadow-2xl">
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase text-white">
              Course <span className="text-amber-500">Management</span>
            </h1>
            <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase mt-2">
              Manage storefront and structured training protocols.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Tier 1: Vault */}
            <button
              onClick={() => setShowStepModal(true)}
              className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-5 py-4 bg-black/40 border border-white/10 hover:border-amber-500/50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-inner hover:bg-black/60"
            >
              <Database size={14} className="text-amber-500" />
              Content Vault
            </button>

            {/* Tier 2: Template Builder */}
            <button
              onClick={() => setShowTemplateModal(true)}
              className="flex-1 xl:flex-none flex items-center justify-center gap-2 px-5 py-4 bg-black/40 border border-white/10 hover:border-amber-500/50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-inner hover:bg-black/60"
            >
              <LayoutTemplate size={14} className="text-amber-500" />
              Protocol Builder
            </button>

            {/* Legacy Drop Course */}
            <button
              onClick={() => setShowModal(true)}
              className="w-full xl:w-auto bg-amber-500 text-black px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-400 transition-all active:scale-95 shadow-xl shadow-amber-500/10"
            >
              Deploy New Course
            </button>
          </div>
        </div>

        {/* Grid of Courses */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course._id}
              className="group bg-[#121821] border border-white/5 p-4 rounded-[2rem] transition-all duration-300 hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.05)] flex flex-col"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-4">
                <img
                  src={course.thumbnailUrl?.replace("http://", "https://")}
                  alt={course.title}
                  className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${!course.isActive && "grayscale opacity-50"}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] to-transparent opacity-60" />
                <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black text-amber-500 uppercase tracking-widest">
                  ₹{course.price}
                </div>
              </div>

              <h3 className="font-bold text-white tracking-tight px-2 truncate text-base md:text-lg uppercase italic">
                {course.title}
              </h3>

              <div className="mt-auto pt-4 flex flex-col gap-4">
                {/* Status & Quick Actions */}
                <div className="flex justify-between items-center px-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${
                        course.isActive
                          ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"
                          : "bg-red-500"
                      }`}
                    />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                      {course.isActive ? "Active" : "Offline"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {course.isActive ? (
                      <button
                        onClick={() =>
                          setActionModal({
                            isOpen: true,
                            type: "DEACTIVATE",
                            courseId: course._id,
                            courseTitle: course.title,
                          })
                        }
                        className="p-2 rounded-xl bg-[#0B0F14] border border-white/5 text-amber-500/50 hover:text-amber-500 hover:border-amber-500/30 transition-all"
                        title="Take Offline"
                      >
                        <PowerOff size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          setActionModal({
                            isOpen: true,
                            type: "REACTIVATE",
                            courseId: course._id,
                            courseTitle: course.title,
                          })
                        }
                        className="p-2 rounded-xl bg-[#0B0F14] border border-white/5 text-green-500/50 hover:text-green-500 hover:border-green-500/30 transition-all shadow-[0_0_15px_rgba(34,197,94,0)] hover:shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                        title="Bring Online"
                      >
                        <Power size={14} />
                      </button>
                    )}

                    <button
                      onClick={() =>
                        setActionModal({
                          isOpen: true,
                          type: "DELETE",
                          courseId: course._id,
                          courseTitle: course.title,
                        })
                      }
                      className="p-2 rounded-xl bg-[#0B0F14] border border-white/5 text-red-500/50 hover:text-red-500 hover:border-red-500/30 transition-all"
                      title="Permanently Purge"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* 🚀 UPGRADED: Architect Plan Button (Tier 3) */}
                <button
                  onClick={() =>
                    setArchitectCourse({ id: course._id, name: course.title })
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

      {/* 📱 RESPONSIVE MODAL: Action Confirmation */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 z-[60] animate-in fade-in">
          <div className="bg-[#121821] border border-white/10 p-6 md:p-8 rounded-[2rem] max-w-sm w-[95vw] md:w-full shadow-2xl relative overflow-hidden">
            <div
              className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${
                actionModal.type === "DELETE"
                  ? "via-red-500"
                  : actionModal.type === "REACTIVATE"
                    ? "via-green-500"
                    : "via-amber-500"
              } to-transparent`}
            />

            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
              <h2 className="text-lg md:text-xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
                <AlertTriangle
                  className={
                    actionModal.type === "DELETE"
                      ? "text-red-500"
                      : actionModal.type === "REACTIVATE"
                        ? "text-green-500"
                        : "text-amber-500"
                  }
                  size={20}
                />
                {actionModal.type === "DELETE"
                  ? "Confirm Deletion"
                  : actionModal.type === "REACTIVATE"
                    ? "Confirm Deployment"
                    : "Confirm Offline"}
              </h2>
              <button
                onClick={() =>
                  setActionModal({
                    isOpen: false,
                    type: null,
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
                Target Module:
              </p>
              <p className="text-base md:text-lg font-black text-white italic tracking-tight">
                "{actionModal.courseTitle}"
              </p>

              <div
                className={`mt-4 p-4 rounded-xl border ${
                  actionModal.type === "DELETE"
                    ? "bg-red-500/10 border-red-500/20 text-red-500"
                    : actionModal.type === "REACTIVATE"
                      ? "bg-green-500/10 border-green-500/20 text-green-500"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                }`}
              >
                <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed">
                  {actionModal.type === "DELETE" &&
                    "CRITICAL WARNING: This will permanently remove the module from the storefront. Existing licenses remain active."}
                  {actionModal.type === "DEACTIVATE" &&
                    "WARNING: This module will be taken offline. It cannot be deactivated if active purchases currently exist."}
                  {actionModal.type === "REACTIVATE" &&
                    "SYSTEM UPDATE: This module will immediately become visible and purchasable on the public storefront."}
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() =>
                  setActionModal({
                    isOpen: false,
                    type: null,
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
                onClick={handleConfirmAction}
                disabled={isProcessingAction}
                className={`flex-1 py-4 rounded-xl text-black text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 ${
                  actionModal.type === "DELETE"
                    ? "bg-red-500 hover:bg-red-400 shadow-xl shadow-red-500/10"
                    : actionModal.type === "REACTIVATE"
                      ? "bg-green-500 hover:bg-green-400 shadow-xl shadow-green-500/10"
                      : "bg-amber-500 hover:bg-amber-400 shadow-xl shadow-amber-500/10"
                }`}
              >
                {isProcessingAction ? "Executing..." : "Execute"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📱 RESPONSIVE MODAL: Legacy Course Creation Protocol */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#0F1724]/90 border border-white/10 p-6 md:p-10 rounded-[24px] max-w-lg w-[95vw] md:w-full space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)] relative overflow-hidden my-auto">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-40" />

            <div className="space-y-1 pt-2">
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase italic leading-none">
                Course <span className="text-amber-500">Deployment</span>
              </h2>
              <p className="text-[8px] md:text-[9px] text-[#8A94A6] font-black uppercase tracking-[0.3em] opacity-60">
                Intelligence Asset Protocol V.2.0.4
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] ml-2">
                  Sector Designation
                </label>
                <input
                  type="text"
                  placeholder="e.g., Tactical Movement Alpha"
                  className="w-full bg-black/40 border border-white/[0.05] p-4 rounded-[12px] text-sm text-[#E5E7EB] focus:border-amber-500/50 outline-none transition-all placeholder:text-white/5 font-medium"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
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
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8A94A6] ml-2">
                  Access Valuation (INR)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full bg-black/40 border border-white/[0.05] p-4 rounded-[12px] text-sm text-[#E5E7EB] focus:border-amber-500/50 outline-none transition-all placeholder:text-white/5 font-black"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8A94A6] text-center">
                  Visual Cover
                </p>
                <div className="relative h-24 sm:h-32 border-2 border-dashed border-white/5 rounded-[16px] bg-black/40 overflow-hidden group transition-all hover:border-amber-500/30">
                  {thumbPreview ? (
                    <>
                      <img
                        src={thumbPreview}
                        alt="Preview"
                        className="w-full h-full object-cover opacity-70"
                      />
                      <button
                        onClick={() => {
                          setThumbnailFile(null);
                          setThumbPreview("");
                        }}
                        className="absolute top-2 right-2 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white p-1 rounded-md text-[8px] font-black uppercase transition-all backdrop-blur-md"
                      >
                        Reset
                      </button>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                      <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:bg-amber-500/20 transition-all">
                        <span className="text-amber-500 text-sm sm:text-lg">
                          +
                        </span>
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/20">
                        Upload Image
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

              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#8A94A6] text-center">
                  Primary Stream
                </p>
                <div className="relative h-24 sm:h-32 border-2 border-dashed border-white/5 rounded-[16px] bg-black/40 overflow-hidden group transition-all hover:border-amber-500/30">
                  {videoFile ? (
                    <div className="flex flex-col items-center justify-center h-full p-2 sm:p-4 text-center">
                      <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-green-500/20 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                        <span className="text-green-500 text-xs">✓</span>
                      </div>
                      <p className="text-[8px] text-amber-500 font-black uppercase truncate w-full">
                        {videoFile.name}
                      </p>
                      <button
                        onClick={() => setVideoFile(null)}
                        className="mt-2 text-[8px] font-black text-red-500/40 hover:text-red-500 uppercase tracking-widest transition-colors"
                      >
                        Remove Asset
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                      <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:bg-amber-500/20 transition-all">
                        <span className="text-amber-500 text-sm sm:text-lg">
                          +
                        </span>
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/20">
                        Select MP4/MOV
                      </span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) =>
                          setVideoFile(e.target.files?.[0] || null)
                        }
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
                    Active Link: R2 Node
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
                  isUploading || !formData.title || !videoFile || !thumbnailFile
                }
                className="w-full sm:flex-[2] bg-amber-500 py-4 rounded-[12px] text-[10px] font-black uppercase tracking-[0.2em] text-black disabled:opacity-20 hover:bg-amber-400 transition-all shadow-[0_10px_20px_rgba(245,158,11,0.2)] active:scale-95"
              >
                {isUploading ? "Executing Upload..." : "Authorize Deployment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 THE FIX: Render Protocol Command Center Modals */}
      {showStepModal && (
        <CreateStepModal
          onClose={() => setShowStepModal(false)}
          onSuccess={() => {
            /* Optionally reload steps elsewhere if needed */
          }}
        />
      )}

      {showTemplateModal && (
        <CreateTemplateModal
          onClose={() => setShowTemplateModal(false)}
          onSuccess={() => {
            /* Optionally reload templates */
          }}
        />
      )}

      {architectCourse && (
        <CourseArchitectModal
          courseId={architectCourse.id}
          courseName={architectCourse.name}
          onClose={() => setArchitectCourse(null)}
          onSuccess={() => {
            /* Let the toast handle success message */
          }}
        />
      )}
    </>
  );
}
