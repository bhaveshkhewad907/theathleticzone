import { Request, Response, NextFunction, RequestHandler } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../user/user.model";
import ApiError from "../../utils/apiError";
import { AuthenticatedRequest } from "../../types/auth.types"; // Adjust path if needed

// 🚀 YOUR INFLUENCER CODES (Hardcoded discounts in percentage)
const COUPONS: Record<string, number> = {
  JAYSON30: 30, // 30% off
};

const BASE_PRICE_INR = 10; // Base cost of the program

// 🚀 PERFORMANCE FIX: Instantiate the SDK once at server boot, not on every request
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export const createEntryOrder: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { couponCode } = req.body;
    let price = BASE_PRICE_INR;
    let appliedCoupon = null;

    // Validate and apply discount
    if (couponCode && COUPONS[couponCode.toUpperCase()]) {
      const discount = COUPONS[couponCode.toUpperCase()];
      price = price - (price * discount) / 100;
      appliedCoupon = couponCode.toUpperCase();
    }

    const options = {
      amount: Math.round(price * 100), // Razorpay expects paise
      currency: "INR",
      receipt: `entry_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      notes: {
        userId: (req as AuthenticatedRequest).user.id,
        appliedCoupon: appliedCoupon || "NONE",
      },
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      price,
      appliedCoupon,
      key: process.env.RAZORPAY_KEY_ID, // Safe to expose public key to frontend
    });
  } catch (error) {
    next(new ApiError(500, "Failed to initialize secure payment gateway."));
  }
};

export const verifyEntryPayment: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      appliedCoupon,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new ApiError(
        400,
        "Missing required payment verification parameters.",
      );
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body.toString())
      .digest("hex");

    // 🚀 SECURITY FIX: Use timingSafeEqual to prevent cryptographic timing attacks
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature),
    );

    if (!isSignatureValid) {
      throw new ApiError(
        400,
        "Digital signature verification failed. Payment rejected.",
      );
    }

    // 🚀 PAYMENT SUCCESS: Unlock the assessment and record the influencer code!
    await User.findByIdAndUpdate(authReq.user.id, {
      $set: {
        "platformState.hasPaidEntryFee": true,
        "platformState.usedCoupon": appliedCoupon || null,
      },
    });

    res
      .status(200)
      .json({ success: true, message: "Welcome to the Elite Track." });
  } catch (error) {
    next(error);
  }
};
