import { Request, Response, NextFunction } from "express";
import Assessment from "./assessment.model";
import User from "../user/user.model";
import ApiError from "../../utils/apiError";
import { runRecommendationEngine } from "./recommendation.service"; // 🚀 Import the Engine
import CoursePurchase from "../course/coursePurchase.model";

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
      engineResult,
    });

    // 🚀 THE FIX: Formally assign the course to the athlete!
    // This creates the zero-dollar ticket so it shows up on their dashboard
    const existingAssignment = await CoursePurchase.findOne({
      user: userId,
      course: engineResult.assignedCourseId,
    });

    if (!existingAssignment) {
      await CoursePurchase.create({
        user: userId,
        course: engineResult.assignedCourseId,
        priceAtPurchase: 0,
        status: "PURCHASED",
      });
    }

    // 3. Update the User's State Machine
    await User.findByIdAndUpdate(userId, {
      $set: {
        "platformState.status": "ACTIVE_TRAINING",
        "platformState.activeCourseId": engineResult.assignedCourseId,
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
