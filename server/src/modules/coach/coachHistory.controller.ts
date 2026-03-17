import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../../types/auth.types";
import { getCoachSessionHistory } from "./coachHistory.service";

export const history: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const data = await getCoachSessionHistory(authReq.user.id, page, limit);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
