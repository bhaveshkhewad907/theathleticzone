import { Router } from "express";
import {
  create,
  update,
  deactivate,
  getAdmin,
  getPublic,
  reactivate,
  softDelete,
  getSecureCourseAccess, // 🚀 NEW: Import the secure access controller
  saveCourseProgress, // 🚀 NEW: Import the progress telemetry controller
} from "./course.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { generatePresignedUrl } from "./course.upload.service";
import ApiError from "../../utils/apiError";

const router = Router();

// --- UPLOAD ROUTE ---
router.post(
  "/get-upload-url",
  requireAuth,
  requireRole("ADMIN", "COACH", "ATHLETE"),
  async (req, res, next) => {
    try {
      const { fileName, contentType, folder } = req.body;
      if (!fileName || !contentType || !folder) {
        throw new ApiError(
          400,
          "fileName, contentType, and folder are required",
        );
      }
      const data = await generatePresignedUrl(fileName, contentType, folder);
      res.status(200).json({ success: true, data: data });
    } catch (error) {
      next(error);
    }
  },
);

// 🚀 NEW: SECURE ATHLETE ACCESS & TELEMETRY ROUTES
// These allow authorized athletes to get the R2 video stream and save their watch time
router.get("/:id/secure-access", requireAuth, getSecureCourseAccess);
router.post("/:id/progress", requireAuth, saveCourseProgress);

// --- ADMIN ROUTES ---
router.post("/", requireAuth, requireRole("ADMIN"), create);
router.put("/:id", requireAuth, requireRole("ADMIN"), update);
router.patch("/:id/deactivate", requireAuth, requireRole("ADMIN"), deactivate);
router.get("/admin", requireAuth, requireRole("ADMIN"), getAdmin);
router.delete("/:id", requireAuth, requireRole("ADMIN"), softDelete);
router.patch("/:id/reactivate", requireAuth, requireRole("ADMIN"), reactivate);

// --- PUBLIC ROUTE ---
router.get("/public", getPublic);

export default router;
