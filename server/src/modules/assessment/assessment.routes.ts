import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import {
  submitAssessment,
  getMyAssessments,
  getAllAssessmentsAdmin,
} from "./assessment.controller";

const router = Router();

// ==========================
// ATHLETE ROUTES
// ==========================
// Submit a new assessment (Triggers the State Machine)
router.post("/", requireAuth, requireRole("ATHLETE"), submitAssessment);

// View personal assessment history
router.get("/me", requireAuth, requireRole("ATHLETE"), getMyAssessments);

// ==========================
// ADMIN ROUTES
// ==========================
// View all assessments across the platform
router.get("/admin", requireAuth, requireRole("ADMIN"), getAllAssessmentsAdmin);

export default router;
