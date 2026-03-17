import { Router } from "express";
import { create, getAll, getAdminAll, toggleStatus } from "./sport.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";

const router = Router();

// Admin routes
router.post("/", requireAuth, requireRole("ADMIN"), create);
router.get("/admin", requireAuth, requireRole("ADMIN"), getAdminAll);
router.patch("/:id/toggle", requireAuth, requireRole("ADMIN"), toggleStatus);

// Public route (used by Athletes during profile setup)
router.get("/", getAll);

export default router;
