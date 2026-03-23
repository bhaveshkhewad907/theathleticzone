import { RequestHandler } from "express";
import CoursePlan from "./coursePlan.model";
import UserProgress from "./userProgress.model";

// GET: Fetch full structured course plan
export const getCoursePlan: RequestHandler = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Deep populate: Get Plan -> Populate Templates -> Populate Steps
    const plan = await CoursePlan.findOne({ courseId }).populate({
      path: "days.templateId",
      populate: {
        path: "steps",
        model: "Step",
      },
    });

    if (!plan) {
      return res
        .status(404)
        .json({ success: false, message: "Structured plan not found" });
    }

    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// POST: Mark Step or Day as Complete
export const updateProgress: RequestHandler = async (req: any, res, next) => {
  try {
    const { courseId, stepId, dayNumber, isDayComplete } = req.body;
    const userId = req.user._id;

    // Find or create progress ledger
    let progress = await UserProgress.findOne({ userId, courseId });
    if (!progress) {
      progress = new UserProgress({
        userId,
        courseId,
        completedSteps: [],
        completedDays: [],
      });
    }

    // Mark Step Complete
    if (stepId && !progress.completedSteps.includes(stepId)) {
      progress.completedSteps.push(stepId);
    }

    // Mark Day Complete
    if (
      isDayComplete &&
      dayNumber &&
      !progress.completedDays.includes(dayNumber)
    ) {
      progress.completedDays.push(dayNumber);
    }

    await progress.save();

    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};

// GET: Fetch user's progress for a specific course
export const getProgress: RequestHandler = async (req: any, res, next) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // Find the progress ledger for this specific user and course
    const progress = await UserProgress.findOne({ userId, courseId });

    // If no progress exists yet, just return null data gracefully
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    next(error);
  }
};

// POST: Admin creates or updates the Master Course Plan
export const saveCoursePlan: RequestHandler = async (req, res, next) => {
  try {
    const { courseId, days } = req.body;

    // This will create a new plan if it doesn't exist, or update the existing one
    const plan = await CoursePlan.findOneAndUpdate(
      { courseId },
      { courseId, days },
      { new: true, upsert: true },
    ).populate("days.templateId");

    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};
