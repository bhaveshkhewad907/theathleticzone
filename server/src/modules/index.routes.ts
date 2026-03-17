import { Router } from "express";

// Import all domain modules
import authRoutes from "./auth/auth.routes";
import sportRoutes from "./sport/sport.routes";
import availabilityRoutes from "./availability/availability.routes";
import adminRoutes from "./admin/admin.routes";
import athleteRoutes from "./athlete/athlete.routes";
import coachRoutes from "./coach/coach.routes";
import courseRoutes from "./course/course.routes";
import coursePurchaseRoutes from "./course/coursePurchase.routes";
import liveSubscriptionRoutes from "./liveSubscription/liveSubscription.routes";
import userRoutes from "./user/user.routes";
import courseReviewRoutes from "./course/courseReview.routes";
import athleteProfileRoutes from "./athlete/athleteProfile.routes";
import systemRoutes from "./system/system.routes";
import reviewRoutes from "./review/review.routes";
import liveConfigRoutes from "./liveConfig/liveSessionConfig.routes";
import { razorpayWebhook } from "./webhooks/webhook.controller";

const router = Router();

// 🛡️ Mount all module routes to their respective paths
router.use("/auth", authRoutes);
router.use("/sports", sportRoutes);
router.use("/availability", availabilityRoutes);
router.use("/admin", adminRoutes);
router.use("/athlete", athleteRoutes);
router.use("/coach", coachRoutes);
router.use("/courses", courseRoutes);
router.use("/course-purchase", coursePurchaseRoutes);
router.use("/live-subscription", liveSubscriptionRoutes);
router.use("/users", userRoutes);
router.use("/course-reviews", courseReviewRoutes);
router.use("/athlete-profile", athleteProfileRoutes);
router.use("/system", systemRoutes);
router.use("/reviews", reviewRoutes);
router.use("/live-config", liveConfigRoutes);
router.post("/webhooks/razorpay", razorpayWebhook);

export default router;
