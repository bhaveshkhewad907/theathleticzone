import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { createEntryOrder, verifyEntryPayment } from "./entry.controller";

const router = Router();

router.use(requireAuth);
router.post("/create-order", createEntryOrder);
router.post("/verify", verifyEntryPayment);

export default router;
