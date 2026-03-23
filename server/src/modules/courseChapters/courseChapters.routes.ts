import express from "express";
import { generateUploadUrl, createStep, getSteps } from "./step.controller";
import {
  getCoursePlan,
  updateProgress,
  getProgress,
  saveCoursePlan,
} from "./coursePlan.controller";
import { requireAuth, restrictTo } from "../../middlewares/auth.middleware";
import { getTemplates, createTemplate } from "./dayTemplate.controller";

const router = express.Router();

// 🛡️ Protect all chapter routes (User must be logged in)
router.use(requireAuth);

// ==========================================
// 🏗️ VAULT / STEP ROUTES (Admins & Coaches Only)
// ==========================================
router.post(
  "/steps/upload-url",
  restrictTo("ADMIN", "COACH"),
  generateUploadUrl,
);
router.post("/steps", restrictTo("ADMIN", "COACH"), createStep);

// ==========================================
// 🗺️ COURSE PLAN ROUTES (Public to authenticated users)
// ==========================================
router.get("/plan/:courseId", getCoursePlan);

// ==========================================
// 📈 PROGRESS TRACKING ROUTES (Athletes)
// ==========================================
router.get("/progress/:courseId", getProgress);
router.post("/progress", updateProgress);

router.get("/steps", restrictTo("ADMIN", "COACH"), getSteps); // 🚀 NEW
router.post("/templates", restrictTo("ADMIN", "COACH"), createTemplate); // 🚀 NEW
router.get("/templates", restrictTo("ADMIN", "COACH"), getTemplates);
router.post("/plan", restrictTo("ADMIN", "COACH"), saveCoursePlan);

export default router;
