import CourseReview from "./courseReview.model";
import mongoose from "mongoose";
import CoursePurchase from "./coursePurchase.model";
import Course from "./course.model";
import ApiError from "../../utils/apiError";

export const addOrUpdateReview = async (
  userId: string,
  courseId: string,
  rating: number,
  review?: string,
) => {
  if (rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  // Verify purchase
  const purchase = await CoursePurchase.findOne({
    user: userId,
    course: courseId,
    status: "PURCHASED",
  });

  if (!purchase) {
    throw new ApiError(403, "You must purchase this course to review it");
  }

  // Save the review
  const savedReview = await CourseReview.findOneAndUpdate(
    { user: userId, course: courseId },
    { rating, review },
    { upsert: true, new: true },
  );

  // 🔥 NEW: Trigger the average update
  await updateCourseRating(courseId);

  return savedReview;
};

// Internal function to sync ratings
async function updateCourseRating(courseId: string) {
  const stats = await CourseReview.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: null,
        average: { $avg: "$rating" },
        total: { $sum: 1 },
      },
    },
  ]);

  const { average, total } = stats[0] || { average: 0, total: 0 };

  await Course.findByIdAndUpdate(courseId, {
    averageRating: Math.round(average * 10) / 10, // Round to 1 decimal place
    totalReviews: total,
  });
}

export const getCourseRatingStats = async (courseId: string) => {
  const stats = await CourseReview.aggregate([
    { $match: { course: new mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: null,
        average: { $avg: "$rating" },
        total: { $sum: 1 },
      },
    },
  ]);

  return stats[0] || { average: 0, total: 0 };
};
