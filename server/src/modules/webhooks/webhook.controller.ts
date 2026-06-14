import { Request, Response } from "express";
import crypto from "crypto";
import CoursePurchase from "../course/coursePurchase.model";
import { logger } from "../../utils/logger";

export const razorpayWebhook = async (req: Request, res: Response) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

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
    }

    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(200).send("Webhook handled with error");
  }
};
