import { Request, Response } from "express";
import crypto from "crypto";
import CoursePurchase from "../course/coursePurchase.model";
import LiveSubscription from "../liveSubscription/liveSubscription.model";
import { logger } from "../../utils/logger";

export const razorpayWebhook = async (req: Request, res: Response) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET; // Add this to your .env

    if (!webhookSecret) {
      throw new Error("Webhook secret not configured");
    }

    // 1. Verify the webhook is authentically from Razorpay
    const generatedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (generatedSignature !== webhookSignature) {
      return res.status(400).send("Invalid webhook signature");
    }

    // 2. Only process successful order payments
    if (req.body.event === "order.paid") {
      const paymentEntity = req.body.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      // --- SCENARIO A: Is this a Course Purchase? ---
      const pendingCourse = await CoursePurchase.findOne({
        razorpayOrderId: orderId,
      });

      if (pendingCourse && pendingCourse.status !== "PURCHASED") {
        pendingCourse.status = "PURCHASED";
        pendingCourse.razorpayPaymentId = paymentId;
        await pendingCourse.save();

        logger.info("Webhook unlocked Course", { orderId, paymentId });
        return res.status(200).send("Course unlocked via webhook");
      }

      // --- SCENARIO B: Is this a Subscription / Renewal? ---
      const pendingSub = await LiveSubscription.findOne({
        $or: [
          { razorpayOrderId: orderId }, // New Subscription
          { renewalOrderId: orderId }, // Renewal
        ],
      });

      if (pendingSub) {
        // If it's a completely new subscription that hasn't been activated
        if (
          pendingSub.status !== "ACTIVE" &&
          pendingSub.razorpayOrderId === orderId
        ) {
          pendingSub.status = "ACTIVE";
          pendingSub.razorpayPaymentId = paymentId;
          pendingSub.startDate = new Date();

          // Calculate months (simplistic version for the webhook)
          const months = pendingSub.plan.includes("ONE")
            ? 1
            : pendingSub.plan.includes("THREE")
              ? 3
              : pendingSub.plan.includes("SIX")
                ? 6
                : 12;
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + months);
          pendingSub.endDate = endDate;

          await pendingSub.save();
          logger.info("Webhook activated Subscription", { orderId, paymentId });
          return res.status(200).send("Subscription activated via webhook");
        }

        // If it's a pending renewal
        if (pendingSub.renewalOrderId === orderId) {
          pendingSub.status = "ACTIVE";
          const months = pendingSub.pendingRenewalPlan?.includes("ONE")
            ? 1
            : pendingSub.pendingRenewalPlan?.includes("THREE")
              ? 3
              : pendingSub.pendingRenewalPlan?.includes("SIX")
                ? 6
                : 12;

          const baseDate =
            pendingSub.endDate && pendingSub.endDate > new Date()
              ? pendingSub.endDate
              : new Date();
          baseDate.setMonth(baseDate.getMonth() + months);

          pendingSub.endDate = baseDate;
          pendingSub.renewalOrderId = undefined;
          pendingSub.pendingRenewalPlan = undefined;
          pendingSub.renewalStatus = undefined;

          await pendingSub.save();
          logger.info("Webhook renewed Subscription", { orderId, paymentId });
          return res.status(200).send("Subscription renewed via webhook");
        }
      }
    }

    // Always return 200 OK so Razorpay knows we received it
    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Webhook Error:", error);
    // Return 200 even on error so Razorpay doesn't infinitely retry broken logic
    res.status(200).send("Webhook handled with error");
  }
};
