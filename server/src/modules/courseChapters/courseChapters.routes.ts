import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import {
  createStep,
  getSteps,
  updateStep,
  createTemplate,
  getTemplates,
  saveCoursePlan,
  getCoursePlan,
} from "./courseChapters.controller";

const router = Router();

// 🛡️ Lock down the entire architecture to Admins only
router.use(requireAuth, requireRole("ADMIN"));

// Content Vault Routes
router.post("/steps", createStep);
router.get("/steps", getSteps);
router.put("/steps/:id", updateStep);

// Protocol Builder Routes
router.post("/templates", createTemplate);
router.get("/templates", getTemplates);

// Course Architect Routes
router.post("/plan", saveCoursePlan);
router.get("/plan/:courseId", getCoursePlan);

export default router;
