import { Router } from "express";
import {
  create,
  update,
  getAdmin,
  getPublic,
  softDelete,
  getSecureCourseAccess,
  saveCourseProgress,
} from "./course.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
// 🚀 FIX: Import from the unified R2 service
import { generatePresignedUrl } from "../../services/r2.service";
import ApiError from "../../utils/apiError";

const router = Router();

// --- UPLOAD ROUTE ---
router.post(
  "/get-upload-url",
  requireAuth,
  requireRole("ADMIN", "ATHLETE"),
  async (req, res, next) => {
    try {
      const { fileName, contentType, folder } = req.body;
      if (!fileName || !contentType || !folder) {
        throw new ApiError(
          400,
          "fileName, contentType, and folder are required",
        );
      }
      // This now perfectly hits the R2 service!
      const data = await generatePresignedUrl(fileName, contentType, folder);
      res.status(200).json({ success: true, data: data });
    } catch (error) {
      next(error);
    }
  },
);

// 🚀 SECURE ATHLETE ACCESS & TELEMETRY ROUTES
router.get("/:id/secure-access", requireAuth, getSecureCourseAccess);
router.post("/:id/progress", requireAuth, saveCourseProgress);

// --- ADMIN ROUTES ---
router.post("/", requireAuth, requireRole("ADMIN"), create);
router.put("/:id", requireAuth, requireRole("ADMIN"), update);
router.get("/admin", requireAuth, requireRole("ADMIN"), getAdmin);
router.delete("/:id", requireAuth, requireRole("ADMIN"), softDelete);

// --- PUBLIC ROUTE ---
router.get("/public", getPublic);

export default router;
