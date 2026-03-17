import { Request, Response, NextFunction } from "express";
import {
  createSubscriptionOrder,
  getMySubscriptionState,
  verifySubscriptionPayment,
} from "./liveSubscription.service";
import {
  createSubscriptionSchema,
  verifySubscriptionSchema,
} from "./liveSubscription.validation";
import {
  createRenewalOrder,
  verifyRenewalPayment,
} from "./liveSubscription.service";

import {
  createRenewalSchema,
  verifyRenewalSchema,
} from "./liveSubscriptionRenewal.validation";

import ApiError from "../../utils/apiError";
import { getMySubscriptions } from "./liveSubscription.service";

export const createOrder = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = createSubscriptionSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0].message);
    }

    const result = await createSubscriptionOrder(
      req.user.id,
      parsed.data.type,
      parsed.data.plan,
    );

    res.status(201).json({
      success: true,
      data: {
        subscription: result.subscription,
        razorpayOrder: {
          id: result.order.id,
          amount: result.order.amount,
          currency: result.order.currency,
          key: process.env.RAZORPAY_KEY_ID,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verify = async (req: any, res: Response, next: NextFunction) => {
  try {
    const parsed = verifySubscriptionSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0].message);
    }

    const subscription = await verifySubscriptionPayment(
      req.user.id,
      parsed.data.razorpay_order_id,
      parsed.data.razorpay_payment_id,
      parsed.data.razorpay_signature,
    );

    res.status(200).json({
      success: true,
      message: "Subscription activated successfully",
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

export const mySubscriptions = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const subscriptionState = await getMySubscriptionState(req.user.id);

    res.status(200).json({
      success: true,
      data: subscriptionState,
    });
  } catch (error) {
    next(error);
  }
};

export const renewOrder = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = createRenewalSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0].message);
    }

    const result = await createRenewalOrder(
      req.user.id,
      parsed.data.subscriptionId,
      parsed.data.newPlan,
    );

    res.status(201).json({
      success: true,
      data: {
        subscriptionId: result.subscriptionId,
        newPlan: result.newPlan,
        price: result.price,
        razorpayOrder: {
          id: result.order.id,
          amount: result.order.amount,
          currency: result.order.currency,
          key: process.env.RAZORPAY_KEY_ID,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const renewVerify = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = verifyRenewalSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0].message);
    }

    const subscription = await verifyRenewalPayment(
      req.user.id,
      parsed.data.subscriptionId,
      parsed.data.razorpay_order_id,
      parsed.data.razorpay_payment_id,
      parsed.data.razorpay_signature,
    );

    res.status(200).json({
      success: true,
      message: "Subscription renewed successfully",
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};
