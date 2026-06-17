import { Request, Response, NextFunction } from "express";
import Assessment from "./assessment.model";
import User from "../user/user.model";
import mongoose from "mongoose";
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
    let engineResult = await runRecommendationEngine(physical, metrics);

    // 🚀 FIX 1: THE COURSE FALLBACK
    // If the algorithm doesn't find a perfectly matching course in your Protocol Vault,
    // we fallback to assigning the most recently created active course!
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
      // Guarantee an assignment
      engineResult = { ...engineResult, assignedCourseId: fallbackCourse._id };
    }

    // 2. Save the Assessment Record
    const assessment = await Assessment.create({
      userId,
      physical,
      metrics,
      engineResult,
    });

    // 🚀 FIX 2: SYNC STATS TO CORE PROFILE
    // This ensures the dashboard instantly shows the Age, Weight, and Height!
    await User.findByIdAndUpdate(userId, {
      $set: {
        "platformState.status": "ACTIVE_TRAINING",
        "platformState.activeCourseId": engineResult.assignedCourseId,
        // Syncing core metrics dynamically
        age: physical.age,
        weight: physical.weight,
        height: physical.height,
      },
      $push: { assessmentHistory: assessment._id },
    });

    // 🛡️ Dynamic Profile Catch: If you have a separate dedicated Profile collection, update it too
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
      // Silently continue if no separate profile model exists
    }

    // 3. Formally assign the zero-dollar course ticket so it appears on the dashboard
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
