import { Request, Response, NextFunction, RequestHandler } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../user/user.model";
import PaymentLedger from "./paymentLedger.model";
import Coupon from "./coupon.model"; // 🚀 NEW: Import the dynamic Coupon model
import ApiError from "../../utils/apiError";
import { AuthenticatedRequest } from "../../types/auth.types";

// 🚀 Base price is now securely pulled from the environment variables
const BASE_PRICE = parseInt(process.env.BASE_PRICE_INR || "10", 10);

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export const createEntryOrder: RequestHandler = async (req, res, next) => {
  try {
    const { couponCode } = req.body;
    let price = BASE_PRICE;
    let appliedCoupon: string | null = null;

    // 🚀 ENTERPRISE FIX: Dynamically query the database for active coupons
    if (couponCode) {
      const validCoupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
      });

      if (validCoupon) {
        price = price - (price * validCoupon.discountPercentage) / 100;
        appliedCoupon = validCoupon.code;
      }
    }

    const options = {
      amount: Math.round(price * 100), // Paise
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
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    next(new ApiError(500, "Failed to initialize secure payment gateway."));
  }
};

export const verifyEntryPayment: RequestHandler = async (req, res, next) => {
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

    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(razorpay_signature),
    );

    if (!isSignatureValid) {
      throw new ApiError(400, "Digital signature verification failed.");
    }

    // 🚀 IDEMPOTENCY CHECK (Kept from Phase 1)
    const existingTransaction = await PaymentLedger.findOne({
      razorpayOrderId: razorpay_order_id,
    });
    if (existingTransaction) {
      res
        .status(200)
        .json({ success: true, message: "Payment already processed." });
      return;
    }

    // 🚀 ENTERPRISE FIX: Re-calculate price securely using DB during verification
    let finalPrice = BASE_PRICE;
    if (appliedCoupon) {
      const validCoupon = await Coupon.findOne({
        code: appliedCoupon.toUpperCase(),
        isActive: true,
      });

      if (validCoupon) {
        finalPrice =
          finalPrice - (finalPrice * validCoupon.discountPercentage) / 100;

        // 🚀 Increment the coupon's global usage tracker
        validCoupon.currentUses += 1;
        await validCoupon.save();
      }
    }

    await PaymentLedger.create({
      user: authReq.user.id,
      amountPaid: finalPrice,
      appliedCoupon: appliedCoupon ? appliedCoupon.toUpperCase() : null,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

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
