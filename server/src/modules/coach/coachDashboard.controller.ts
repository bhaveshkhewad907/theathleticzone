import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../../types/auth.types";
import {
  getCoachDashboard,
  coachStartSession,
  coachEndSession,
} from "./coachDashboard.service";

export const dashboard: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;

    const sessions = await getCoachDashboard(authReq.user.id);

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

export const startSession: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { sessionId } = req.params;

    if (typeof sessionId !== "string") {
      throw new Error("Invalid session id");
    }

    const link = await coachStartSession(sessionId, authReq.user.id);

    res.status(200).json({
      success: true,
      meetingLink: link,
    });
  } catch (error) {
    next(error);
  }
};

export const endSession: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { sessionId } = req.params;

    if (typeof sessionId !== "string") {
      throw new Error("Invalid session id");
    }

    await coachEndSession(sessionId, authReq.user.id);

    res.status(200).json({
      success: true,
      message: "Session completed",
    });
  } catch (error) {
    next(error);
  }
};
