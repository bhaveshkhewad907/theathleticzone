import { Request, Response, NextFunction } from "express";
import Assessment from "./assessment.model";
import User from "../user/user.model";
import mongoose from "mongoose";
import ApiError from "../../utils/apiError";
import { runRecommendationEngine } from "./recommendation.service";
import CoursePurchase from "../course/coursePurchase.model";

export const submitAssessment = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    const { physical, metrics } = req.body;

    let engineResult = await runRecommendationEngine(physical, metrics);

    if (!engineResult?.assignedCourseId) {
      console.warn(
        `[ALGORITHM] No exact match for User ${userId}. Using fallback course.`,
      );
      const fallbackCourse = await mongoose
        .model("Course")
        .findOne({ isDeleted: { $ne: true } })
        .sort({ createdAt: -1 });

      if (!fallbackCourse) {
        throw new ApiError(
          400,
          "Protocol Vault is entirely empty! Admin must upload at least one course.",
        );
      }
      engineResult = { ...engineResult, assignedCourseId: fallbackCourse._id };
    }

    const assessment = await Assessment.create({
      userId,
      physical,
      metrics,
      engineResult,
    });

    await User.findByIdAndUpdate(userId, {
      $set: {
        "platformState.status": "ACTIVE_TRAINING",
        "platformState.activeCourseId": engineResult.assignedCourseId,
        age: physical.age,
        weight: physical.weight,
        height: physical.height,
      },
      $push: { assessmentHistory: assessment._id },
    });

    try {
      const ProfileModel =
        mongoose.models.Profile || mongoose.models.AthleteProfile;
      if (ProfileModel) {
        await ProfileModel.findOneAndUpdate(
          { user: userId },
          {
            $set: {
              age: physical.age,
              weight: physical.weight,
              height: physical.height,
            },
          },
          { upsert: true },
        );
      }
    } catch (e) {
      // Silently continue
    }

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

    res.status(201).json({
      success: true,
      message: "Assessment complete! Protocol assigned successfully.",
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

// 🚀 THE NEW RESET LOOP LOGIC!
export const resetCycle = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    await User.findByIdAndUpdate(userId, {
      $set: {
        "platformState.status": "COMPLETED_TRAINING",
        "platformState.hasPaidEntryFee": false,
        "platformState.usedCoupon": null,
      },
    });
    res
      .status(200)
      .json({ success: true, message: "Cycle reset successfully." });
  } catch (error) {
    next(error);
  }
};
