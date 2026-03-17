import { Request, Response, NextFunction } from "express";
import {
  addOrUpdateReview,
  getCourseRatingStats,
} from "./courseReview.service";
import ApiError from "../../utils/apiError";

export const addReview = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { courseId, rating, review } = req.body;

    if (!courseId || !rating) {
      throw new ApiError(400, "CourseId and rating are required");
    }

    const result = await addOrUpdateReview(
      req.user.id,
      courseId,
      rating,
      review,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getRatingStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { courseId } = req.params;

    if (!courseId || typeof courseId !== "string") {
      throw new ApiError(400, "Invalid courseId");
    }

    const stats = await getCourseRatingStats(courseId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
