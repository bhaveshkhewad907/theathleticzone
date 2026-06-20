import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";

import {
  dashboard,
  getAthletesRoster,
  getAthleteAssessmentForAdmin,
} from "./admin.controller";

const router = Router();

// ==========================
// ADMIN METRICS & DASHBOARD
// ==========================
router.get("/dashboard", requireAuth, requireRole("ADMIN"), dashboard);
router.get("/athletes", requireAuth, requireRole("ADMIN"), getAthletesRoster);
router.get(
  "/athletes/:id/assessment",
  requireAuth,
  requireRole("ADMIN"),
  getAthleteAssessmentForAdmin,
);

export default router;
