import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import {
  createStep,
  getSteps,
  updateStep,
  deleteStep, // 🚀 NEW: Import added!
  createTemplate,
  getTemplates,
  saveCoursePlan,
  getCoursePlan,
  getCourseProgress,
  updateCourseProgress,
} from "./courseChapters.controller";

const router = Router();

// 🛡️ Require users to be logged in for all routes
router.use(requireAuth);

// Define the Admin middleware variable for cleaner code
const adminOnly = requireRole("ADMIN");

// ==========================================
// 🔒 ADMIN ONLY ROUTES (Building & Editing)
// ==========================================

// Content Vault
router.post("/steps", adminOnly, createStep);
router.get("/steps", adminOnly, getSteps);
router.put("/steps/:id", adminOnly, updateStep);
router.delete("/steps/:id", adminOnly, deleteStep); // 🚀 NEW: Delete Route Wired Up!

// Protocol Builder
router.post("/templates", adminOnly, createTemplate);
router.get("/templates", adminOnly, getTemplates);

// Course Architect
router.post("/plan", adminOnly, saveCoursePlan);

// ==========================================
// 🟢 PUBLIC ROUTES (Athletes & Admins)
// ==========================================

// 🚀 THE FIX: Athletes are now allowed to fetch the structured plan!
router.get("/plan/:courseId", getCoursePlan);
router.get("/progress/:courseId", getCourseProgress);
router.post("/progress", updateCourseProgress);

export default router;
