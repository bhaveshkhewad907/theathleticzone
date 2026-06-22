import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import {
  create,
  update,
  getAdmin,
  getPublic,
  softDelete,
  getSecureCourseAccess,
  saveCourseProgress,
  getAthleteCurrentCourse,
  getCourseUploadUrl,
} from "./course.controller";

const router = Router();

router.get(
  "/current",
  requireAuth,
  requireRole("ATHLETE"),
  getAthleteCurrentCourse,
);
router.post("/get-upload-url", requireAuth, getCourseUploadUrl);

// Landing page fetches active courses
router.get("/public", getPublic);

const adminOnly = requireRole("ADMIN");

router.get("/admin", requireAuth, adminOnly, getAdmin);
router.post("/", requireAuth, adminOnly, create);

router.put("/:id", requireAuth, adminOnly, update);
router.delete("/:id", requireAuth, adminOnly, softDelete);

// Secure Video Streaming & Telemetry
router.get("/:id/secure-access", requireAuth, getSecureCourseAccess);
router.post("/:id/progress", requireAuth, saveCourseProgress);

export default router;
