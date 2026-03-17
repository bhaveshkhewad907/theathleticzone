import { z } from "zod";

export const createCourseOrderSchema = z.object({
  courseId: z.string(),
});

export const verifyCoursePaymentSchema = z.object({
  courseId: z.string(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});
