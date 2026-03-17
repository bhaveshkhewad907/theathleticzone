import { Router } from "express";
import { createOrder, verify } from "./liveSubscription.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { mySubscriptions } from "./liveSubscription.controller";
import { renewOrder, renewVerify } from "./liveSubscription.controller";

const router = Router();

router.post("/order", requireAuth, requireRole("ATHLETE"), createOrder);

router.post("/verify", requireAuth, requireRole("ATHLETE"), verify);
router.get("/my", requireAuth, requireRole("ATHLETE"), mySubscriptions);
router.post("/renew/order", requireAuth, requireRole("ATHLETE"), renewOrder);

router.post("/renew/verify", requireAuth, requireRole("ATHLETE"), renewVerify);

export default router;
