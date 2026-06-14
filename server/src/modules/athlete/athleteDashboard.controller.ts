import { RequestHandler } from "express";
import { getAthleteDashboard } from "./athleteDashboard.service";

export const dashboard: RequestHandler = async (req: any, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Fetch dashboard data (Active Course & Progress) from the cleaned service
    const dashboardData = await getAthleteDashboard(userId);

    // 2. Return the clean response
    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    next(error);
  }
};
