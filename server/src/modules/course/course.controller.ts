import { Request, Response, NextFunction } from "express";
import { createCourseSchema, updateCourseSchema } from "./course.validation";
import {
  createCourse,
  updateCourse,
  deactivateCourse,
  getAllCoursesAdmin,
  getActiveCourses,
  reactivateCourse,
  deleteCourseSoft,
} from "./course.service";
import ApiError from "../../utils/apiError";
import CoursePurchase from "./coursePurchase.model";
import CourseProgress from "./courseProgress.model";
import Course from "./course.model";
import { generateSecureVideoUrl } from "../../services/r2.service";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = createCourseSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0].message);
    }

    // 🚀 FIX: Bridge the gap between Zod (videoUrl) and Mongoose (videoKey)
    const coursePayload = {
      ...parsed.data,
      videoKey: parsed.data.videoUrl, // Maps the frontend URL to the DB Key!
    };

    const course = await createCourse(coursePayload as any);

    res.status(201).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = updateCourseSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(400, parsed.error.issues[0].message);
    }

    // 🚀 FIX: Bridge the gap for updates too
    const coursePayload = {
      ...parsed.data,
      ...(parsed.data.videoUrl && { videoKey: parsed.data.videoUrl }),
    };

    const course = await updateCourse(
      req.params.id as string,
      coursePayload as any,
    );

    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const deactivate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const course = await deactivateCourse(req.params.id as string);
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const getAdmin = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const courses = await getAllCoursesAdmin();
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};

export const getPublic = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const courses = await getActiveCourses();
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    console.error("Controller Error:", error);
    next(error);
  }
};

export const softDelete = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const courseId = req.params.id as string;
    await deleteCourseSoft(courseId);

    res.status(200).json({
      success: true,
      message: "Course removed securely. Purchase history preserved.",
    });
  } catch (error) {
    next(error);
  }
};

export const reactivate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const course = await reactivateCourse(req.params.id as string);
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

// 🛡️ Secure Access Gate for R2 Videos
export const getSecureCourseAccess = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    const courseId = req.params.id;

    // 1. Verify Legal Ownership First
    const purchase = await CoursePurchase.findOne({
      user: userId,
      course: courseId,
      status: "PURCHASED",
    });

    if (!purchase) {
      throw new ApiError(403, "Access Denied: You do not own this course.");
    }

    const course = await Course.findById(courseId);

    // 🚀 THE FIX: Removed `course.isDeleted` from this check.
    // If the course exists in the database AT ALL, and they bought it, let them watch it!
    if (!course) {
      throw new ApiError(404, "Course data no longer exists on the server.");
    }

    let progress = await CourseProgress.findOne({
      user: userId,
      course: courseId,
    });

    if (!progress) {
      progress = await CourseProgress.create({
        user: userId,
        course: courseId,
      });
    }

    const secureUrl = await generateSecureVideoUrl(course.videoKey);

    res.status(200).json({
      success: true,
      data: {
        secureVideoUrl: secureUrl,
        progress: progress.progressPercentage,
        resumeAtSeconds: progress.lastWatchedSeconds,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 🛡️ Save Playback Telemetry
export const saveCourseProgress = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { lastWatchedSeconds, progressPercentage } = req.body;
    const isCompleted = progressPercentage >= 95;

    const progress = await CourseProgress.findOneAndUpdate(
      { user: req.user.id, course: req.params.id },
      {
        $set: {
          lastWatchedSeconds,
          progressPercentage,
          isCompleted,
        },
      },
      { new: true, upsert: true },
    );

    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};
