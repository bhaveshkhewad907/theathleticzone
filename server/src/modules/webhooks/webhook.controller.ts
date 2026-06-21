import { Request, Response } from "express";
import crypto from "crypto";
import User from "../user/user.model";
import { logger } from "../../utils/logger";

export const razorpayWebhook = async (req: Request, res: Response) => {
  try {
    const webhookSignature = req.headers["x-razorpay-signature"] as string;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSignature || !webhookSecret) {
      logger.error("Webhook missing signature or secret configuration.");
      return res.status(400).send("Configuration error");
    }

    // 1. Verify the webhook is authentically from Razorpay
    const generatedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    // 🚀 SECURITY FIX: Prevent cryptographic timing attacks
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(webhookSignature),
    );

    if (!isSignatureValid) {
      logger.warn("Invalid Razorpay webhook signature attempt blocked.");
      return res.status(400).send("Invalid webhook signature");
    }

    // 🚀 ARCHITECTURE FIX: Align with the Global Entry Paywall
    if (req.body.event === "order.paid") {
      const paymentEntity = req.body.payload.payment.entity;

      // We extract the userId from the notes object passed during order creation
      const userId = paymentEntity.notes?.userId;

      if (userId) {
        await User.findByIdAndUpdate(userId, {
          $set: { "platformState.hasPaidEntryFee": true },
        });
        logger.info("Webhook successfully unlocked Global Entry Fee", {
          userId,
          paymentId: paymentEntity.id,
        });
      } else {
        logger.warn(
          "Webhook received but no userId found in Razorpay notes payload.",
          { paymentId: paymentEntity.id },
        );
      }
    }

    res.status(200).send("Webhook processed successfully");
  } catch (error: any) {
    logger.error("Webhook processing failed", { error: error.message });
    // We intentionally return 200 so Razorpay doesn't aggressively retry and spam our servers
    // due to internal processing errors, but we rely on our logger to notify us.
    res.status(200).send("Webhook handled with internal error");
  }
};
