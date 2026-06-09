import { Router } from "express";
import {
  submitAssessment,
  getPendingAssessments,
  reviewAssessment,
} from "./assessment.controller";
// 🚀 FIX: Swapped 'protect' for 'requireAuth' to match your middleware file
import { requireAuth, restrictTo } from "../../middlewares/auth.middleware";

const router = Router();

// 1. Athlete Route: Submit the 4-page assessment
router.post("/submit", requireAuth, restrictTo("ATHLETE"), submitAssessment);

// 2. Admin/Coach Route: Fetch the inbox of pending assessments
router.get(
  "/pending",
  requireAuth,
  restrictTo("ADMIN", "COACH"),
  getPendingAssessments,
);

// 3. Admin/Coach Route: Submit the review and assign the courses
router.post(
  "/:id/review",
  requireAuth,
  restrictTo("ADMIN", "COACH"),
  reviewAssessment,
);

export default router;
