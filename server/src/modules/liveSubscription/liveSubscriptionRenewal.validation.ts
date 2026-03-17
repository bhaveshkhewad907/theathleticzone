import { z } from "zod";

export const createRenewalSchema = z.object({
  subscriptionId: z.string(),
  newPlan: z.enum(["ONE_MONTH", "THREE_MONTHS", "SIX_MONTHS", "YEARLY"]),
});

export const verifyRenewalSchema = createRenewalSchema.extend({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});
