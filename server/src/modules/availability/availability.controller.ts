import { Request, Response, NextFunction } from "express";
import { sendAvailability } from "./availability.service";
import ApiError from "../../utils/apiError";

export const submitAvailability = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      throw new ApiError(400, "Subscription ID is required");
    }

    const availability = await sendAvailability(subscriptionId, req.user.id);

    res.status(201).json({
      success: true,
      message: "Availability submitted for tomorrow",
      data: availability,
    });
  } catch (error) {
    next(error);
  }
};
