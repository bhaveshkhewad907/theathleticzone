import { Request, Response, NextFunction } from "express";
import Review from "./review.model";
import ApiError from "../../utils/apiError";

// Athletes submit reviews here
export const createReview = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 🛡️ FIX 1: Grab 'sport' from the request body
    const { rating, content, sport } = req.body;

    // 🛡️ FIX 2: Make sure they actually sent the sport
    if (!rating || !content || !sport) {
      throw new ApiError(400, "Rating, content, and sport are required");
    }

    const existingReview = await Review.findOne({ user: req.user.id });
    if (existingReview) {
      existingReview.rating = rating;
      existingReview.content = content;
      existingReview.sport = sport; // 🛡️ FIX 3: Update existing sport
      await existingReview.save();
      return res.status(200).json({ success: true, data: existingReview });
    }

    const newReview = await Review.create({
      user: req.user.id,
      rating,
      content,
      sport, // 🛡️ FIX 4: Save new sport
    });

    res.status(201).json({ success: true, data: newReview });
  } catch (error) {
    next(error);
  }
};

// Landing page fetches recent public reviews here
export const getPublicReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 🛡️ SYNC FIX: Populate the user's name, profileImage, and SPORT
    const reviews = await Review.find()
      .populate("user", "name profileImage sport")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};
