import { Request, Response, NextFunction, RequestHandler } from "express";
import { createCourseSchema, updateCourseSchema } from "./course.validation";
import {
  createCourse,
  updateCourse,
  getAllCoursesAdmin,
  getActiveCourses,
  deleteCourseSoft,
} from "./course.service";
import ApiError from "../../utils/apiError";
import CourseProgress from "./courseProgress.model";
import Course from "./course.model";
import User from "../user/user.model";
import { AuthenticatedRequest } from "../../types/auth.types";
import { getPresignedUrl } from "../../services/r2.service";

export const create: RequestHandler = async (req, res, next) => {
  try {
    const parsed = createCourseSchema.safeParse(req.body);
    if (!parsed.success)
      throw new ApiError(400, parsed.error.issues[0].message);

    const course = await createCourse(parsed.data as any);
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const update: RequestHandler = async (req, res, next) => {
  try {
    const parsed = updateCourseSchema.safeParse(req.body);
    if (!parsed.success)
      throw new ApiError(400, parsed.error.issues[0].message);

    // 🚀 FIX: Strongly typed ID
    const courseId = req.params.id as string;
    const course = await updateCourse(courseId, parsed.data as any);
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const getAdmin: RequestHandler = async (_req, res, next) => {
  try {
    const courses = await getAllCoursesAdmin();
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};

export const getPublic: RequestHandler = async (_req, res, next) => {
  try {
    const courses = await getActiveCourses();
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};

export const softDelete: RequestHandler = async (req, res, next) => {
  try {
    // 🚀 FIX: Strongly typed ID
    const courseId = req.params.id as string;
    await deleteCourseSoft(courseId);
    res
      .status(200)
      .json({ success: true, message: "Course removed securely." });
  } catch (error) {
    next(error);
  }
};

export const getSecureCourseAccess: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
    // 🚀 FIX: Strongly typed ID
    const courseId = req.params.id as string;
    const requestedVideoKey = req.query.videoKey as string;

    if (!requestedVideoKey) {
      throw new ApiError(400, "You must provide a videoKey to stream.");
    }

    const course = await Course.findById(courseId).lean();
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

    const secureUrl = await getPresignedUrl(requestedVideoKey);

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

export const saveCourseProgress: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { lastWatchedSeconds, progressPercentage } = req.body;
    const isCompleted = progressPercentage >= 95;

    // 🚀 FIX: Strongly typed ID here prevents the Render crash on line 103!
    const courseId = req.params.id as string;

    const progress = await CourseProgress.findOneAndUpdate(
      { user: authReq.user.id, course: courseId },
      { $set: { lastWatchedSeconds, progressPercentage, isCompleted } },
      { new: true, upsert: true },
    );

    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};

export const getAthleteCurrentCourse: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = await User.findById(authReq.user.id).lean();
    if (!user) throw new ApiError(404, "User not found");

    if (user.platformState?.status === "NEEDS_ASSESSMENT") {
      return res.status(403).json({
        success: false,
        state: "NEEDS_ASSESSMENT",
        message: "You must complete your assessment to unlock your dashboard.",
      });
    }

    if (!user.platformState?.activeCourseId) {
      throw new ApiError(400, "No active course assigned by the engine yet.");
    }

    const activeCourse = await Course.findById(
      user.platformState.activeCourseId,
    ).lean();

    res.status(200).json({ success: true, data: { activeCourse } });
  } catch (error) {
    next(error);
  }
};
