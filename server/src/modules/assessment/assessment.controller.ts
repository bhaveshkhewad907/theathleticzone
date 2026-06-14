import { Request, Response, NextFunction } from "express";
import Assessment from "./assessment.model";
import User from "../user/user.model";
import ApiError from "../../utils/apiError";
import { runRecommendationEngine } from "./recommendation.service"; // 🚀 Import the Engine

export const submitAssessment = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    const { physical, metrics } = req.body;

    // 1. 🤖 RUN THE ALGORITHM
    const engineResult = await runRecommendationEngine(physical, metrics);

    // 2. Save the Assessment with the Engine's verdict
    const assessment = await Assessment.create({
      userId,
      physical,
      metrics,
      engineResult, // Logs exactly why they got assigned this course
    });

    // 3. Update the User's State Machine
    await User.findByIdAndUpdate(userId, {
      $set: {
        "platformState.status": "ACTIVE_TRAINING",
        "platformState.activeCourseId": engineResult.assignedCourseId, // Automatically assigns the course
      },
      $push: { assessmentHistory: assessment._id },
    });

    res.status(201).json({
      success: true,
      message: `Assessment complete! Assigned to: ${engineResult.assignedLevel} ${engineResult.identifiedDeficit} Track.`,
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAssessments = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const assessments = await Assessment.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: assessments });
  } catch (error) {
    next(error);
  }
};

export const getAllAssessmentsAdmin = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const assessments = await Assessment.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: assessments });
  } catch (error) {
    next(error);
  }
};
