import { RequestHandler } from "express";
import { getAdminDashboard } from "./adminDashboard.service";
import User from "../../modules/user/user.model";

export const dashboard: RequestHandler = async (_req, res, next) => {
  try {
    const data = await getAdminDashboard();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Add this to the bottom of admin.controller.ts
export const getAthletesRoster = async (req: any, res: any) => {
  try {
    // Fetch all athletes, sorted by newest first
    const athletes = await User.find({ role: "ATHLETE" })
      .select("name email profileImage platformState createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: athletes,
    });
  } catch (error) {
    console.error("Error fetching athlete roster:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch roster." });
  }
};
