import CoursePurchase from "./coursePurchase.model";
import { getPresignedUrl } from "../../utils/s3";
import razorpay from "../../config/razorpay";
import ApiError from "../../utils/apiError";
import Course from "./course.model";
import crypto from "crypto";
import mongoose from "mongoose";
import { logger } from "../../utils/logger";

export const getMyCourses = async (userId: string) => {
  const purchases = await CoursePurchase.find({
    user: userId,
    status: "PURCHASED",
  })
    .populate({
      path: "course",
      // 🚀 THE FIX: Removed the `isDeleted` match filter.
      // If a user bought it, they get to keep it, even if it's no longer sold!
    })
    .lean();

  // Filter out truly null courses (only happens if an admin HARD deletes from the database)
  const validPurchases = purchases.filter((p) => p.course !== null);

  const updatedPurchases = await Promise.all(
    validPurchases.map(async (purchase: any) => {
      const [signedThumbnail, signedVideo] = await Promise.all([
        getPresignedUrl(purchase.course.thumbnailUrl),
        // Safely check for videoKey (DB schema) or videoUrl (legacy)
        getPresignedUrl(purchase.course.videoKey || purchase.course.videoUrl),
      ]);

      return {
        ...purchase,
        course: {
          ...purchase.course,
          thumbnailUrl: signedThumbnail,
          videoUrl: signedVideo,
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
    amount: course.price * 100,
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

  if (!razorpayOrder || razorpayOrder.amount !== course.price * 100) {
    console.error(
      `🚨 PAYLOAD SWAP DETECTED. User ${userId} attempted to unlock Course ${courseId} using a cheaper order payload.`,
    );
    throw new ApiError(400, "Payment amount mismatch. Access denied.");
  }

  const purchase = await CoursePurchase.create({
    course: courseId,
    user: userId,
    priceAtPurchase: course.price,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    status: "PURCHASED",
  });

  logger.info("Course unlocked successfully", {
    event: "PAYMENT_VERIFIED",
    service: "PaymentEngine",
    userId,
    courseId,
    amountPaid: course.price,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
  });

  return purchase;
};
