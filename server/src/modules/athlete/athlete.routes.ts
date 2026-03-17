import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import {
  attendanceHistory,
  attendanceSummary,
  dashboard,
  joinSession,
} from "./athleteDashboard.controller";

const router = Router();

router.get("/dashboard", requireAuth, requireRole("ATHLETE"), dashboard);
router.get(
  "/attendance-summary",
  requireAuth,
  requireRole("ATHLETE"),
  attendanceSummary,
);

router.get(
  "/attendance-history",
  requireAuth,
  requireRole("ATHLETE"),
  attendanceHistory,
);
router.post(
  "/join-session/:sessionId",
  requireAuth,
  requireRole("ATHLETE"),
  joinSession,
);

export default router;
