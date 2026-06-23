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
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

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

export const getCourseUploadUrl: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { fileName, contentType, folder: requestedFolder } = req.body;

    // 1. 🛡️ STRICT MIME-TYPE WHITELIST (Prevents .exe or malicious HTML uploads)
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/quicktime",
    ];
    if (!allowedTypes.includes(contentType)) {
      return next(
        new ApiError(
          415,
          "Unsupported Media Type. Only images and standard video formats are allowed.",
        ),
      );
    }

    // 2. 🛡️ ENTERPRISE ROLE-BASED FOLDER ROUTING (Never trust the frontend)
    let secureFolder = "";

    if (authReq.user.role === "ADMIN") {
      // Admins can upload to specific course folders, but we sanitize the path
      const allowedAdminFolders = ["thumbnails", "videos", "assets"];
      secureFolder = allowedAdminFolders.includes(requestedFolder)
        ? requestedFolder
        : "assets";
    } else if (authReq.user.role === "ATHLETE") {
      // 🚀 Athletes are permanently locked into their own specific assessment directory!
      // They cannot access or overwrite Admin courses.
      secureFolder = `assessments/${authReq.user.id}`;
    } else {
      return next(new ApiError(403, "Unauthorized storage access."));
    }

    // 3. 🛡️ FILENAME SANITIZATION (Prevents Path Traversal attacks like "../../malicious.mp4")
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${sanitizedFileName}`;
    const fileKey = `${secureFolder}/${uniqueFileName}`;

    // 4. Generate the presigned URL using AWS S3 SDK / Cloudflare R2
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
    const publicUrl = `${process.env.R2_PUBLIC_DOMAIN}/${fileKey}`;

    res.status(200).json({
      success: true,
      data: { uploadUrl, publicUrl, fileKey },
    });
  } catch (error) {
    next(error);
  }
};
