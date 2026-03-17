import { z } from "zod";

export const createSubscriptionSchema = z.object({
  type: z.enum(["GROUP", "ONE_ON_ONE"]),
  plan: z.enum(["ONE_MONTH", "THREE_MONTHS", "SIX_MONTHS", "YEARLY"]),
});

export const verifySubscriptionSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});
