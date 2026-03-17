import { Request, Response, NextFunction } from "express";
import {
  createCourseOrder,
  verifyCoursePayment,
  getMyCourses,
} from "./coursePurchase.service";
import {
  createCourseOrderSchema,
  verifyCoursePaymentSchema,
} from "./coursePurchase.validation";
import ApiError from "../../utils/apiError";

export const createOrder = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = createCourseOrderSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0].message);
    }

    const result = await createCourseOrder(parsed.data.courseId, req.user.id);

    res.status(201).json({
      success: true,
      data: {
        // Map the data exactly as returned by your service
        razorpayOrder: {
          id: result.razorpayOrder.id,
          amount: result.razorpayOrder.amount,
          currency: result.razorpayOrder.currency,
          key: result.razorpayOrder.key,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verify = async (req: any, res: Response, next: NextFunction) => {
  try {
    const parsed = verifyCoursePaymentSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0].message);
    }

    const purchase = await verifyCoursePayment(
      req.user.id,
      parsed.data.courseId,
      parsed.data.razorpay_order_id,
      parsed.data.razorpay_payment_id,
      parsed.data.razorpay_signature,
    );

    res.status(200).json({
      success: true,
      message: "Course unlocked successfully",
      data: purchase,
    });
  } catch (error) {
    next(error);
  }
};

export const myCourses = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const courses = await getMyCourses(req.user.id);

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};
