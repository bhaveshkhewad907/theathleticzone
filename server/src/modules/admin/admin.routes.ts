import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { dashboard } from "./admin.controller";

const router = Router();

// ==========================
// ADMIN METRICS & DASHBOARD
// ==========================
router.get("/dashboard", requireAuth, requireRole("ADMIN"), dashboard);

export default router;
