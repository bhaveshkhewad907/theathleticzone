import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { dashboard } from "./admin.controller";
import { getAthletesRoster } from "./admin.controller";

const router = Router();

// ==========================
// ADMIN METRICS & DASHBOARD
// ==========================
router.get("/dashboard", requireAuth, requireRole("ADMIN"), dashboard);
router.get("/athletes", getAthletesRoster);

export default router;
