import { Router } from "express";
import { dashboard } from "./athleteDashboard.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/dashboard", requireAuth, requireRole("ATHLETE"), dashboard);

export default router;
