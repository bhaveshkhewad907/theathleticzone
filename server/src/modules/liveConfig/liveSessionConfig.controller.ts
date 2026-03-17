import { Request, Response, NextFunction } from "express";
import { updatePricingSchema } from "./liveSessionConfig.validation";
import { updatePricing, getPricing } from "./liveSessionConfig.service";
import ApiError from "../../utils/apiError";

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = updatePricingSchema.safeParse(req.body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0].message;
      throw new ApiError(400, firstError);
    }

    const config = await updatePricing(parsed.data);

    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    next(error);
  }
};

export const get = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await getPricing();

    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    next(error);
  }
};
