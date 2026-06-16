import { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../user/user.model";

// 🚀 YOUR INFLUENCER CODES (Hardcoded discounts in percentage)
const COUPONS: Record<string, number> = {
  JAYSON30: 30, // 30% off
};

const BASE_PRICE_INR = 10; // Base cost of the program

export const createEntryOrder = async (req: any, res: Response) => {
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

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    });

    const options = {
      amount: Math.round(price * 100), // Razorpay expects paise
      currency: "INR",
      receipt: `entry_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      price,
      appliedCoupon,
      // 🚀 THE FIX: Sending the Live API Key to the frontend so it stops using the Test key!
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Entry Order Error:", error);
    res.status(500).json({ success: false, message: "Order creation failed" });
  }
};

export const verifyEntryPayment = async (req: any, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      appliedCoupon,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    // 🚀 PAYMENT SUCCESS: Unlock the assessment and record the influencer code!
    await User.findByIdAndUpdate(req.user.id, {
      $set: {
        "platformState.hasPaidEntryFee": true,
        "platformState.usedCoupon": appliedCoupon || null,
      },
    });

    res
      .status(200)
      .json({ success: true, message: "Welcome to the Elite Track." });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};
