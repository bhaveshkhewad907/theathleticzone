import { Request, Response, NextFunction, RequestHandler } from "express";
import { Step, Template, CoursePlan } from "./courseArchitect.model";
import CourseProgress from "../course/courseProgress.model";
import { AuthenticatedRequest } from "../../types/auth.types"; // Adjust path if needed
import ApiError from "../../utils/apiError";

// ==============================
// CONTENT VAULT (STEPS)
// ==============================
export const createStep: RequestHandler = async (req, res, next) => {
  try {
    const step = await Step.create(req.body);
    res.status(201).json({ success: true, data: step });
  } catch (error) {
    next(error);
  }
};

export const getSteps: RequestHandler = async (_req, res, next) => {
  try {
    // 🚀 PERFORMANCE FIX: Added .lean() to save memory on heavy array reads
    const steps = await Step.find().sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, data: steps });
  } catch (error) {
    next(error);
  }
};

export const updateStep: RequestHandler = async (req, res, next) => {
  try {
    const step = await Step.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({ success: true, data: step });
  } catch (error) {
    next(error);
  }
};

// ==============================
// PROTOCOL BUILDER (TEMPLATES)
// ==============================
export const createTemplate: RequestHandler = async (req, res, next) => {
  try {
    const template = await Template.create(req.body);
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
};

export const getTemplates: RequestHandler = async (_req, res, next) => {
  try {
    // 🚀 PERFORMANCE FIX: Added .lean()
    const templates = await Template.find()
      .populate("steps.step")
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    next(error);
  }
};

// ==============================
// COURSE ARCHITECT (PLANS)
// ==============================
export const saveCoursePlan: RequestHandler = async (req, res, next) => {
  try {
    const { courseId, days } = req.body;
    const plan = await CoursePlan.findOneAndUpdate(
      { courseId },
      { courseId, days },
      { new: true, upsert: true },
    );
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

export const getCoursePlan: RequestHandler = async (req, res, next) => {
  try {
    // 🚀 PERFORMANCE & ARCHITECTURE UPGRADE:
    // We now populate BOTH the Morning and Evening block templates!
    const plan = await CoursePlan.findOne({ courseId: req.params.courseId })
      .populate({
        path: "days.morning.templateId",
        populate: { path: "steps.step" },
      })
      .populate({
        path: "days.evening.templateId",
        populate: { path: "steps.step" },
      })
      .lean();

    res.status(200).json({ success: true, data: plan || null });
  } catch (error) {
    next(error);
  }
};

// ==============================
// USER PROGRESS TRACKING
// ==============================

export const getCourseProgress: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const progress = await CourseProgress.findOne({
      user: authReq.user.id,
      course: req.params.courseId,
    }).lean(); // 🚀 PERFORMANCE FIX
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};

export const updateCourseProgress: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { courseId, stepId, dayNumber, isDayComplete } = req.body;
    const userId = authReq.user.id;

    // 🚀 ARCHITECTURE FIX: Race-Condition proof upsert query
    // If multiple requests hit simultaneously, Mongo guarantees exactly ONE document is created.
    let progress = await CourseProgress.findOneAndUpdate(
      { user: userId, course: courseId },
      {
        $setOnInsert: {
          completedSteps: [],
          completedDays: [],
          lastWatchedSeconds: 0,
          progressPercentage: 0,
          isCompleted: false,
        },
      },
      { new: true, upsert: true },
    );

    if (!progress) {
      throw new ApiError(500, "Failed to initialize athlete progress ledger.");
    }

    // Toggle individual steps
    if (stepId) {
      const stepIndex = progress.completedSteps.indexOf(stepId);
      if (stepIndex > -1) {
        progress.completedSteps.splice(stepIndex, 1); // Un-tick
      } else {
        progress.completedSteps.push(stepId); // Tick
      }
    }

    // Mark whole day as complete
    if (isDayComplete && dayNumber !== undefined) {
      if (!progress.completedDays.includes(dayNumber)) {
        progress.completedDays.push(dayNumber);
      }
    }

    await progress.save();
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};
