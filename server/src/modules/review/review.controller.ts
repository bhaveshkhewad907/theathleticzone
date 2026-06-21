import { Request, Response, NextFunction, RequestHandler } from "express";
import Review from "./review.model";
import ApiError from "../../utils/apiError";
import { AuthenticatedRequest } from "../../types/auth.types"; // Adjust path if necessary

export const createReview: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { rating, content } = req.body;

    if (!rating || !content) {
      throw new ApiError(400, "Rating and content are required.");
    }

    const existingReview = await Review.findOne({ user: authReq.user.id });
    if (existingReview) {
      existingReview.rating = rating;
      existingReview.content = content;
      await existingReview.save();
      res.status(200).json({ success: true, data: existingReview });
      return;
    }

    const newReview = await Review.create({
      user: authReq.user.id,
      rating,
      content,
    });

    res.status(201).json({ success: true, data: newReview });
  } catch (error) {
    next(error);
  }
};

export const getPublicReviews: RequestHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name profileImage") // 🚀 FIX: Ghost 'sport' request removed
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};
