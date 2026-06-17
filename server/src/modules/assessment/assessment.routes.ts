import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import {
  submitAssessment,
  getMyAssessments,
  getAllAssessmentsAdmin,
  resetCycle, // 🚀 Imported new function
} from "./assessment.controller";

const router = Router();

// ==========================
// ATHLETE ROUTES
// ==========================
router.post("/", requireAuth, requireRole("ATHLETE"), submitAssessment);
router.get("/me", requireAuth, requireRole("ATHLETE"), getMyAssessments);

// 🚀 THE NEW RESET ROUTE
router.post("/reset-cycle", requireAuth, requireRole("ATHLETE"), resetCycle);

// ==========================
// ADMIN ROUTES
// ==========================
router.get("/admin", requireAuth, requireRole("ADMIN"), getAllAssessmentsAdmin);

export default router;
