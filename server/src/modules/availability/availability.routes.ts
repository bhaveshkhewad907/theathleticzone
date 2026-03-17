import { Router } from "express";
import { submitAvailability } from "./availability.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/submit", requireAuth, requireRole("ATHLETE"), submitAvailability);

export default router;
