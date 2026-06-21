import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { createReview, getPublicReviews } from "./review.controller";

const router = Router();

// Public route for Landing Page
router.get("/public", getPublicReviews);

// Protected route for Athletes only
router.post("/", requireAuth, requireRole("ATHLETE"), createReview); // 🚀 SECURITY FIX: RBAC Enforced

export default router;
