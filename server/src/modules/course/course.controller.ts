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
import User from "../user/user.model";

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
    const course = await createCourse(parsed.data as any);
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
    const course = await updateCourse(
      req.params.id as string,
      parsed.data as any,
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
    const requestedVideoKey = req.query.videoKey as string;

    if (!requestedVideoKey) {
      throw new ApiError(400, "You must provide a videoKey to stream.");
    }

    const course = await Course.findById(courseId);
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

    const secureUrl = await generateSecureVideoUrl(requestedVideoKey);

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

// 🚀 Sprint Platform - Fetch Athlete's Active Course
export const getAthleteCurrentCourse = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // 1. Enforce the State Machine Lockout
    if (user.platformState?.status === "NEEDS_ASSESSMENT") {
      return res.status(403).json({
        success: false,
        state: "NEEDS_ASSESSMENT",
        message: "You must complete your assessment to unlock your dashboard.",
      });
    }

    // 2. Ensure they have a course
    if (!user.platformState?.activeCourseId) {
      throw new ApiError(400, "No active course assigned by the engine yet.");
    }

    const activeCourse = await Course.findById(
      user.platformState.activeCourseId,
    );

    res.status(200).json({
      success: true,
      data: {
        activeCourse,
      },
    });
  } catch (error) {
    next(error);
  }
};
