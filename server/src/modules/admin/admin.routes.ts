import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import {
  generateGroups,
  getCoachInvitations,
  inviteCoach,
  resendCoachInvite,
  sessions,
  revokeCoachInvite,
  getPendingOneOnOne,
} from "./admin.controller";
import { confirmSchedule } from "../schedule/schedule.controller";
import { dashboard } from "./admin.controller";
import { getCoaches, getSports } from "./admin.controller";
import { inviteRateLimiter } from "../../middlewares/rateLimiter.middleware";

const router = Router();

router.post(
  "/generate-groups",
  requireAuth,
  requireRole("ADMIN"),
  generateGroups,
);
router.get(
  "/pending-1on1",
  requireAuth,
  requireRole("ADMIN"),
  getPendingOneOnOne,
);
router.post("/schedule", requireAuth, requireRole("ADMIN"), confirmSchedule);
router.get("/dashboard", requireAuth, requireRole("ADMIN"), dashboard);
router.get("/coaches", requireAuth, requireRole("ADMIN"), getCoaches);
router.get("/sports", requireAuth, requireRole("ADMIN"), getSports);
router.get("/sessions", requireAuth, requireRole("ADMIN"), sessions);
router.post("/invite-coach", requireAuth, requireRole("ADMIN"), inviteCoach);
router.post(
  "/resend-invite",
  requireAuth,
  requireRole("ADMIN"),
  resendCoachInvite,
);
router.get(
  "/invitations",
  requireAuth,
  requireRole("ADMIN"),
  getCoachInvitations,
);
router.post(
  "/invite-coach",
  requireAuth,
  requireRole("ADMIN"),
  inviteRateLimiter,
  inviteCoach,
);
router.delete(
  "/invite-coach/:id",
  requireAuth,
  requireRole("ADMIN"),
  revokeCoachInvite,
);

export default router;
