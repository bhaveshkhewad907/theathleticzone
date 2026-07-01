import Course from "./course.model";
import ApiError from "../../utils/apiError";
// 🚀 FIX: Point to the actual R2 service we centralized in Batch 2
import { getPresignedUrl } from "../../services/r2.service";

export interface CreateCourseInput {
  meta: {
    title: string;
    description: string;
    coverImageUrl: string;
    videoUrl?: string; // 🚀 FIX
    tier: "Beginner" | "Intermediate" | "Advanced"; // 🚀 FIX
    targetDeficit: "Strength" | "Power" | "Mobility";
  };
}

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

// 🚀 FIX: deactivateCourse and reactivateCourse purged entirely.

export const getAllCoursesAdmin = async () => {
  const courses = await Course.aggregate([
    { $match: { isDeleted: { $ne: true } } },
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
    { $project: { purchases: 0 } },
    { $sort: { createdAt: -1 } },
  ]);

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
  const courses = await Course.find({ isDeleted: { $ne: true } })
    .sort({ createdAt: -1 })
    .lean();

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
