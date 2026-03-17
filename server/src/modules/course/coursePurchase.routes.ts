import { Router } from "express";
import { createOrder, verify, myCourses } from "./coursePurchase.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/create-order", requireAuth, requireRole("ATHLETE"), createOrder);

router.post("/verify", requireAuth, requireRole("ATHLETE"), verify);

router.get("/my", requireAuth, requireRole("ATHLETE"), myCourses);

export default router;
