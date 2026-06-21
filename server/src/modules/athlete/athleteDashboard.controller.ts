import { Request, Response, NextFunction, RequestHandler } from "express";
import { getAthleteDashboard } from "./athleteDashboard.service";
import { AuthenticatedRequest } from "../../types/auth.types"; // Adjust path if needed

export const dashboard: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user.id;

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
