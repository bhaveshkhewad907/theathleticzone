import { Request, Response, NextFunction, RequestHandler } from "express";
import { getAdminDashboard } from "./adminDashboard.service";
import User from "../../modules/user/user.model";
import Assessment from "../../modules/assessment/assessment.model";

export const dashboard: RequestHandler = async (_req, res, next) => {
  try {
    const data = await getAdminDashboard();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getAthletesRoster: RequestHandler = async (_req, res, next) => {
  try {
    const athletes = await User.find({ role: "ATHLETE" })
      .select("name email profileImage platformState createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: athletes });
  } catch (error) {
    // 🛡️ Passes error to global error handler instead of hardcoding 500
    next(error);
  }
};

export const getAthleteAssessmentForAdmin: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const assessment = await Assessment.findOne({ userId: id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: assessment || null,
    });
  } catch (error) {
    next(error);
  }
};
