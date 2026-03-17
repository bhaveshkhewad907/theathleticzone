import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import {
  dashboard,
  startSession,
  endSession,
} from "./coachDashboard.controller";
import { history } from "./coachHistory.controller";
import { createNotes } from "./coachNotes.controller";
import { getSessionAthletes } from "./coachNotes.controller";

const router = Router();

router.get("/dashboard", requireAuth, requireRole("COACH"), dashboard);
router.post(
  "/start/:sessionId",
  requireAuth,
  requireRole("COACH"),
  startSession,
);
router.post("/end/:sessionId", requireAuth, requireRole("COACH"), endSession);
router.get("/history", requireAuth, requireRole("COACH"), history);
router.get(
  "/sessions/:id/athletes",
  requireAuth,
  requireRole("COACH"),
  getSessionAthletes,
);
router.post(
  "/notes/:sessionId",
  requireAuth,
  requireRole("COACH"),
  createNotes,
);

export default router;
