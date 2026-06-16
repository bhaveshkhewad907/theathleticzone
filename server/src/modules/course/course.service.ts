import Course from "./course.model";
import ApiError from "../../utils/apiError";
import CoursePurchase from "./coursePurchase.model";
import { getPresignedUrl } from "../../utils/s3";

// 🚀 THE FIX: Redefined the interface to perfectly match the nested Mongoose Schema
export interface CreateCourseInput {
  meta: {
    title: string;
    description: string;
    coverImageUrl: string;
    tier: "Beginner" | "Intermediate" | "Elite";
    targetDeficit: "Strength" | "Power" | "Mobility" | "Technique" | "Seasonal";
  };
}

// 🛡️ THE R2 INTERCEPTOR
// Converts broken Cloudflare Dev URLs into highly secure, authenticated AWS Presigned URLs
const enforceSecureUrl = async (url: string) => {
  if (!url) return url;
  try {
    if (url.includes(".r2.dev/")) {
      const fileKey = url.split(".r2.dev/")[1];
      return await getPresignedUrl(fileKey);
    }
    if (!url.startsWith("http")) {
      return await getPresignedUrl(url);
    }
    return url;
  } catch (error) {
    console.error("URL Security Extraction Failed:", error);
    return url;
  }
};

export const createCourse = async (data: CreateCourseInput) => {
  return Course.create(data);
};

export const updateCourse = async (
  id: string,
  data: Partial<CreateCourseInput>,
) => {
  const course = await Course.findOneAndUpdate(
    { _id: id, isDeleted: { $ne: true } },
    data,
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!course) {
    throw new ApiError(404, "Course not found or has been securely removed");
  }

  return course;
};

// 🚀 Safely neutered
export const deactivateCourse = async (id: string) => {
  throw new ApiError(
    400,
    "Offline toggling is deprecated. Use protocol deletion.",
  );
};

// 🚀 Safely neutered
export const reactivateCourse = async (id: string) => {
  throw new ApiError(
    400,
    "Offline toggling is deprecated. Use protocol deletion.",
  );
};

export const getAllCoursesAdmin = async () => {
  const courses = await Course.aggregate([
    {
      $match: { isDeleted: { $ne: true } },
    },
    {
      $lookup: {
        from: "coursepurchases",
        localField: "_id",
        foreignField: "course",
        as: "purchases",
      },
    },
    {
      $addFields: {
        totalPurchases: {
          $size: {
            $filter: {
              input: "$purchases",
              as: "p",
              cond: { $eq: ["$$p.status", "PURCHASED"] },
            },
          },
        },
        totalRevenue: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: "$purchases",
                  as: "p",
                  cond: { $eq: ["$$p.status", "PURCHASED"] },
                },
              },
              as: "p",
              in: "$$p.priceAtPurchase",
            },
          },
        },
      },
    },
    {
      $project: {
        purchases: 0,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);

  // 🚀 THE FIX: Updated to securely sign the nested 'meta.coverImageUrl'
  return Promise.all(
    courses.map(async (course) => {
      if (course.meta && course.meta.coverImageUrl) {
        course.meta.coverImageUrl = await enforceSecureUrl(
          course.meta.coverImageUrl,
        );
      }
      return course;
    }),
  );
};

export const getActiveCourses = async () => {
  const courses = await Course.aggregate([
    {
      $match: {
        isDeleted: { $ne: true },
      },
    },
    {
      $lookup: {
        from: "coursereviews",
        localField: "_id",
        foreignField: "course",
        as: "reviews",
      },
    },
    {
      $addFields: {
        averageRating: {
          $cond: [
            { $gt: [{ $size: "$reviews" }, 0] },
            { $avg: "$reviews.rating" },
            0,
          ],
        },
        totalReviews: { $size: "$reviews" },
      },
    },
    {
      $project: {
        reviews: 0,
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);

  // 🚀 THE FIX: Updated to securely sign the nested 'meta.coverImageUrl'
  return Promise.all(
    courses.map(async (course) => {
      if (course.meta && course.meta.coverImageUrl) {
        course.meta.coverImageUrl = await enforceSecureUrl(
          course.meta.coverImageUrl,
        );
      }
      return course;
    }),
  );
};

export const deleteCourseSoft = async (courseId: string) => {
  const course = await Course.findById(courseId);

  if (!course || course.isDeleted) {
    throw new ApiError(404, "Course not found");
  }

  course.isDeleted = true;
  await course.save();

  return course;
};
