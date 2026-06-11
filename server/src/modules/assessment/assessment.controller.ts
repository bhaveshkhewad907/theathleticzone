import { Request, Response, NextFunction } from "express";
import Assessment from "./assessment.model";
import User from "../user/user.model";

/**
 * @route   POST /api/assessments/submit
 * @desc    Athlete submits their 9-point combine data
 * @access  Private (Athlete Only)
 */
export const submitAssessment = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user.id;
    const { mobility, power, sprinting, strength } = req.body;

    // 1. Save their test results to the database
    const assessment = await Assessment.create({
      athlete: userId,
      mobility,
      power,
      sprinting,
      strength,
      status: "PENDING", // This means pending coach review
    } as any);

    // 2. 🚀 CRITICAL FIX: Flip the User's master switch to UNDER_REVIEW
    await User.findByIdAndUpdate(userId, {
      $set: {
        "platformState.status": "UNDER_REVIEW",
      },
    });

    res.status(201).json({ success: true, data: assessment });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/assessments/pending
 * @desc    Get all pending assessments for the Admin Dashboard
 * @access  Private (Admin/Coach Only)
 */
export const getPendingAssessments = async (req: Request, res: Response) => {
  try {
    // Fetch oldest first (First In, First Out) and populate the athlete's core info
    const pendingAssessments = await Assessment.find({
      status: "PENDING_ADMIN_REVIEW",
    })
      .sort({ createdAt: 1 })
      .populate("userId", "name personalInfo profileImage email");

    res.status(200).json({
      success: true,
      count: pendingAssessments.length,
      data: pendingAssessments,
    });
  } catch (error: any) {
    console.error("Fetch Pending Assessments Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch pending queue" });
  }
};

/**
 * @route   POST /api/assessments/:id/review
 * @desc    Coach approves assessment and assigns Phase 1 & Phase 2 courses
 * @access  Private (Admin/Coach Only)
 */
export const reviewAssessment = async (req: Request, res: Response) => {
  try {
    const assessmentId = req.params.id;
    const coachId = (req as any).user.id;
    const { assignedDeficit, assignedCourseId, nextCourseId, coachNotes } =
      req.body;

    // 1. Find the assessment
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res
        .status(404)
        .json({ success: false, message: "Assessment not found" });
    }

    if (assessment.status === "REVIEWED") {
      return res
        .status(400)
        .json({ success: false, message: "Assessment is already reviewed" });
    }

    // 2. Update the Assessment document with Coach's decision
    assessment.status = "REVIEWED";
    assessment.adminReview = {
      reviewedBy: coachId,
      reviewedAt: new Date(),
      assignedDeficit,
      assignedCourseId,
      nextCourseId,
      coachNotes,
    };
    await assessment.save();

    // 3. Update the Athlete's profile to unlock their dashboard
    await User.findByIdAndUpdate(assessment.userId, {
      $set: {
        "platformState.status": "ACTIVE_TRAINING",
        "platformState.activeCourseId": assignedCourseId,
        "platformState.nextCourseId": nextCourseId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Athlete has been successfully assigned to their protocol.",
      data: assessment,
    });
  } catch (error: any) {
    console.error("Review Assessment Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to process review" });
  }
};
