import { Router } from "express";

// Import all active domain modules
import authRoutes from "./auth/auth.routes";
import adminRoutes from "./admin/admin.routes";
import athleteRoutes from "./athlete/athlete.routes";
import courseRoutes from "./course/course.routes";
import coursePurchaseRoutes from "./course/coursePurchase.routes";
import userRoutes from "./user/user.routes";
import courseReviewRoutes from "./course/courseReview.routes";
import systemRoutes from "./system/system.routes";
import reviewRoutes from "./review/review.routes";
import { razorpayWebhook } from "./webhooks/webhook.controller";
import assessmentRoutes from "./assessment/assessment.routes";

const router = Router();

// 🛡️ Mount all module routes to their respective paths
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/athlete", athleteRoutes);
router.use("/courses", courseRoutes);
router.use("/course-purchase", coursePurchaseRoutes);
router.use("/users", userRoutes);
router.use("/course-reviews", courseReviewRoutes);
router.use("/system", systemRoutes);
router.use("/reviews", reviewRoutes);
router.post("/webhooks/razorpay", razorpayWebhook);
router.use("/assessments", assessmentRoutes);

export default router;
