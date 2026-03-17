import Course from "./course.model";
import ApiError from "../../utils/apiError";
import CoursePurchase from "./coursePurchase.model";
import { getPresignedUrl } from "../../utils/s3";

export interface CreateCourseInput {
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  price: number;
}

// 🛡️ THE R2 INTERCEPTOR
// Converts broken Cloudflare Dev URLs into highly secure, authenticated AWS Presigned URLs
const enforceSecureUrl = async (url: string) => {
  if (!url) return url;
  try {
    // 1. If it is a blocked Cloudflare Dev URL, extract the specific file key and sign it
    if (url.includes(".r2.dev/")) {
      const fileKey = url.split(".r2.dev/")[1];
      return await getPresignedUrl(fileKey);
    }
    // 2. If it is already a raw key (no http), securely sign it
    if (!url.startsWith("http")) {
      return await getPresignedUrl(url);
    }
    // 3. If it is a safe external placeholder (like placehold.co), leave it untouched
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
  // 🛡️ Security Fix: Catch ghost fields using $ne: true
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

export const deactivateCourse = async (id: string) => {
  // 🛡️ Security Fix: Catch ghost fields using $ne: true
  const courseCheck = await Course.findOne({
    _id: id,
    isDeleted: { $ne: true },
  });

  if (!courseCheck) {
    throw new ApiError(404, "Course not found or has been securely removed");
  }

  const purchaseCount = await CoursePurchase.countDocuments({
    course: id,
    status: "PURCHASED",
  });

  if (purchaseCount > 0) {
    throw new ApiError(
      400,
      "Cannot deactivate a course that has active purchases",
    );
  }

  const course = await Course.findByIdAndUpdate(
    id,
    { isActive: false },
    { returnDocument: "after" },
  );

  return course;
};

export const reactivateCourse = async (id: string) => {
  // 🛡️ Ensure we don't accidentally reactivate a permanently deleted course
  const course = await Course.findOneAndUpdate(
    { _id: id, isDeleted: { $ne: true } },
    { isActive: true },
    { returnDocument: "after" },
  );

  if (!course) {
    throw new ApiError(404, "Course not found or has been securely removed");
  }

  return course;
};

export const getAllCoursesAdmin = async () => {
  const courses = await Course.aggregate([
    // Bulletproof Match (Catches undefined/missing fields too)
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

  // Generate signed URLs for Admin view
  return Promise.all(
    courses.map(async (course) => ({
      ...course,
      thumbnailUrl: await enforceSecureUrl(course.thumbnailUrl),
    })),
  );
};

export const getActiveCourses = async () => {
  const courses = await Course.aggregate([
    // Bulletproof Match (Catches undefined/missing fields too)
    {
      $match: {
        isDeleted: { $ne: true },
        isActive: { $ne: false },
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

  // Convert R2 storage paths into working temporary links
  return Promise.all(
    courses.map(async (course) => ({
      ...course,
      thumbnailUrl: await enforceSecureUrl(course.thumbnailUrl),
    })),
  );
};

export const deleteCourseSoft = async (courseId: string) => {
  const course = await Course.findById(courseId);

  if (!course || course.isDeleted) {
    throw new ApiError(404, "Course not found");
  }

  // Perform the soft delete
  course.isDeleted = true;
  course.isActive = false; // Also deactivate it to prevent any edge-case storefront leaks
  await course.save();

  return course;
};
