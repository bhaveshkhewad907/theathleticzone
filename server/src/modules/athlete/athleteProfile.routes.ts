import { Router } from "express";
import { getProfile, updateProfile } from "./athleteProfile.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";

const router = Router();

// Secure these routes strictly for Athletes
router.use(requireAuth, requireRole("ATHLETE"));

router.get("/", getProfile);
router.put("/", updateProfile);

export default router;
