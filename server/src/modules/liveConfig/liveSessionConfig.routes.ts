import { Router } from "express";
import { update, get } from "./liveSessionConfig.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";

const router = Router();

router.put("/", requireAuth, requireRole("ADMIN"), update);

router.get("/", get);

export default router;
