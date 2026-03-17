import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { requireRole } from "../../middlewares/auth.middleware";
import { addReview, getRatingStats } from "./courseReview.controller";

const router = Router();

router.post("/", requireAuth, requireRole("ATHLETE"), addReview);
router.get("/:courseId/stats", getRatingStats);

export default router;
