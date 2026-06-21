import { Router } from "express";

// Import all active domain modules
import authRoutes from "./auth/auth.routes";
import adminRoutes from "./admin/admin.routes";
import athleteRoutes from "./athlete/athlete.routes";
import courseRoutes from "./course/course.routes";
import userRoutes from "./user/user.routes";
import reviewRoutes from "./review/review.routes";
import { razorpayWebhook } from "./webhooks/webhook.controller"; // Ensure this folder matches your actual webhook filename
import assessmentRoutes from "./assessment/assessment.routes";
import courseChaptersRoutes from "./courseChapters/courseChapters.routes";
import entryRoutes from "./payment/entry.routes";

const router = Router();

// 🛡️ Mount all module routes to their respective paths
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/athlete", athleteRoutes);
router.use("/courses", courseRoutes);
router.use("/users", userRoutes);
router.use("/reviews", reviewRoutes);
router.post("/webhooks/razorpay", razorpayWebhook);
router.use("/assessments", assessmentRoutes);
router.use("/chapters", courseChaptersRoutes);
router.use("/entry", entryRoutes);

export default router;
