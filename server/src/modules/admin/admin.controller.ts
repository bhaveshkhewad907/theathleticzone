import { RequestHandler } from "express";
import { getAdminDashboard } from "./adminDashboard.service";

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
