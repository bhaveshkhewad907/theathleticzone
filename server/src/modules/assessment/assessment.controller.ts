import { Request, Response, NextFunction, RequestHandler } from "express";
import Assessment from "./assessment.model";
import User from "../user/user.model";
import mongoose from "mongoose";
import ApiError from "../../utils/apiError";
import { runRecommendationEngine } from "./recommendation.service";
import CoursePurchase from "../course/coursePurchase.model";
import { AuthenticatedRequest } from "../../types/auth.types";

export const submitAssessment: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;
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
          "Protocol Vault is empty! Admin must upload at least one course.",
        );
      }
      engineResult.assignedCourseId = fallbackCourse._id;
    }

    // 1. Create the Assessment Document
    const assessment = await Assessment.create({
      userId,
      physical,
      metrics,
      engineResult,
    });

    // 2. Concurrently update User Profile and provision Course Access
    // 🚀 ARCHITECTURE FIX: Eliminated the sequential waterfall and fixed the variable naming bug
    await Promise.all([
      User.findByIdAndUpdate(userId, {
        $set: {
          "platformState.status": "ACTIVE_TRAINING",
          "platformState.activeCourseId": engineResult.assignedCourseId,
          age: physical.age,
          weight: physical.bodyweightKg, // Fixed from physical.weight
          height: physical.heightCm, // Fixed from physical.height
        },
        $push: { assessmentHistory: assessment._id },
      }),
      CoursePurchase.findOneAndUpdate(
        { user: userId, course: engineResult.assignedCourseId },
        { $setOnInsert: { priceAtPurchase: 0, status: "PURCHASED" } },
        { upsert: true, new: true }, // Upsert combined find & create into 1 operation
      ),
    ]);

    res.status(201).json({
      success: true,
      message: "Assessment complete! Protocol assigned successfully.",
      data: assessment,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAssessments: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const assessments = await Assessment.find({ userId: authReq.user.id }).sort(
      {
        createdAt: -1,
      },
    );
    res.status(200).json({ success: true, data: assessments });
  } catch (error) {
    next(error);
  }
};

export const getAllAssessmentsAdmin: RequestHandler = async (
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

export const resetCycle: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    await User.findByIdAndUpdate(authReq.user.id, {
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
