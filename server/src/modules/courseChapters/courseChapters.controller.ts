import { Request, Response, NextFunction } from "express";
import { Step, Template, CoursePlan } from "./courseArchitect.model";
import CourseProgress from "../course/courseProgress.model";

// ==============================
// CONTENT VAULT (STEPS)
// ==============================
export const createStep = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const step = await Step.create(req.body);
    res.status(201).json({ success: true, data: step });
  } catch (error) {
    next(error);
  }
};

export const getSteps = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const steps = await Step.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: steps });
  } catch (error) {
    next(error);
  }
};

export const updateStep = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
export const createTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const template = await Template.create(req.body);
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
};

export const getTemplates = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const templates = await Template.find()
      .populate("steps")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: templates });
  } catch (error) {
    next(error);
  }
};

// ==============================
// COURSE ARCHITECT (PLANS)
// ==============================
export const saveCoursePlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { courseId, days } = req.body;
    const plan = await CoursePlan.findOneAndUpdate(
      { courseId },
      { courseId, days },
      { new: true, upsert: true }, // Creates it if it doesn't exist, updates if it does
    );
    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

export const getCoursePlan = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const plan = await CoursePlan.findOne({
      courseId: req.params.courseId,
    }).populate({
      path: "days.templateId",
      populate: { path: "steps" }, // 🚀 THE FIX: This fetches the actual step details!
    });

    res.status(200).json({ success: true, data: plan || null });
  } catch (error) {
    next(error);
  }
};

// ==============================
// USER PROGRESS TRACKING
// ==============================

export const getCourseProgress = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const progress = await CourseProgress.findOne({
      user: req.user.id, // 🚀 Changed from userId to user
      course: req.params.courseId, // 🚀 Changed from courseId to course
    });
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};

export const updateCourseProgress = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { courseId, stepId, dayNumber, isDayComplete } = req.body;
    const userId = req.user.id;

    // Find or create a progress document for this user & course
    let progress = await CourseProgress.findOne({
      user: userId,
      course: courseId,
    });
    if (!progress) {
      progress = await CourseProgress.create({
        user: userId,
        course: courseId,
        completedSteps: [],
        completedDays: [],
      });
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
