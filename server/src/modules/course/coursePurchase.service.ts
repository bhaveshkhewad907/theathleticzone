import CoursePurchase from "./coursePurchase.model";
import { getPresignedUrl } from "../../utils/s3";
import razorpay from "../../config/razorpay";
import ApiError from "../../utils/apiError";
import Course from "./course.model";
import crypto from "crypto";
import mongoose from "mongoose";
import { logger } from "../../utils/logger";

// 🛡️ THE R2 INTERCEPTOR (Fixes the 403 Forbidden Video Errors)
const enforceSecureUrl = async (url: string) => {
  if (!url) return url;
  try {
    // If it's a Cloudflare Dev URL, extract the raw key and securely sign it
    if (url.includes(".r2.dev/")) {
      const fileKey = url.split(".r2.dev/")[1];
      return await getPresignedUrl(fileKey);
    }
    // If it's already a raw key (no http), securely sign it
    if (!url.startsWith("http")) {
      return await getPresignedUrl(url);
    }
    // Leave external placeholders untouched
    return url;
  } catch (error) {
    console.error("URL Security Extraction Failed:", error);
    return url;
  }
};

export const getMyCourses = async (userId: string) => {
  const purchases = await CoursePurchase.find({
    user: userId,
    status: "PURCHASED",
  })
    .populate({
      path: "course",
    })
    .lean();

  const validPurchases = purchases.filter((p) => p.course !== null);

  const updatedPurchases = await Promise.all(
    validPurchases.map(async (purchase: any) => {
      // 🚀 THE SCHEMA FIX: Check both legacy fields AND the new 'meta' fields
      const rawThumbnail =
        purchase.course.meta?.coverImageUrl || purchase.course.thumbnailUrl;
      const rawVideo =
        purchase.course.meta?.videoUrl ||
        purchase.course.videoKey ||
        purchase.course.videoUrl;

      // 🛡️ Route them through the Interceptor!
      const [signedThumbnail, signedVideo] = await Promise.all([
        enforceSecureUrl(rawThumbnail),
        enforceSecureUrl(rawVideo),
      ]);

      return {
        ...purchase,
        course: {
          ...purchase.course,
          // Overwrite root properties for legacy components
          thumbnailUrl: signedThumbnail,
          videoUrl: signedVideo,
          // 🚀 Inject into the meta object so the new Dashboard maps it perfectly!
          meta: purchase.course.meta
            ? {
                ...purchase.course.meta,
                coverImageUrl: signedThumbnail,
              }
            : undefined,
        },
      };
    }),
  );

  return updatedPurchases;
};

export const createCourseOrder = async (courseId: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new ApiError(400, "Invalid Course ID format");
  }

  const course = await Course.findById(new mongoose.Types.ObjectId(courseId));

  if (!course) {
    console.error("CRITICAL: Course not in DB. Attempted ID:", courseId);
    throw new ApiError(404, "Course not found");
  }

  const options = {
    amount: 0,
    currency: "INR",
    receipt: `rcpt_${Date.now()}`,
  };

  const order = await razorpay.orders.create(options);

  return {
    razorpayOrder: {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    },
  };
};

export const verifyCoursePayment = async (
  userId: string,
  courseId: string,
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
) => {
  const existingPurchase = await CoursePurchase.findOne({
    razorpayOrderId: razorpay_order_id,
  });

  if (existingPurchase) {
    throw new ApiError(
      400,
      "Payment already processed. Replay attack blocked.",
    );
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new ApiError(400, "Invalid payment signature. Forgery detected.");
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, "Course not found during verification");
  }

  const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);

  if (!razorpayOrder || razorpayOrder.amount !== 0) {
    console.error(
      `🚨 PAYLOAD SWAP DETECTED. User ${userId} attempted to unlock Course ${courseId}.`,
    );
    throw new ApiError(400, "Payment amount mismatch. Access denied.");
  }

  const purchase = await CoursePurchase.create({
    course: courseId,
    user: userId,
    priceAtPurchase: 0,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    status: "PURCHASED",
  });

  logger.info("Course unlocked successfully", {
    event: "PAYMENT_VERIFIED",
    service: "PaymentEngine",
    userId,
    courseId,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
  });

  return purchase;
};
