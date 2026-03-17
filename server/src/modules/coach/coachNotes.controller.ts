import { RequestHandler } from "express";
import { AuthenticatedRequest } from "../../types/auth.types";
import { addSessionNotes } from "./coachNotes.service";
import Schedule from "../schedule/schedule.model";
import ApiError from "../../utils/apiError";

export const createNotes: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { sessionId } = req.params;

    if (typeof sessionId !== "string") {
      throw new Error("Invalid session id");
    }

    const { summary, intensity, coachFeedback } = req.body;

    await addSessionNotes(
      sessionId,
      authReq.user.id,
      summary,
      intensity,
      coachFeedback,
    );

    res.status(200).json({
      success: true,
      message: "Session notes saved",
    });
  } catch (error) {
    next(error);
  }
};

export const getSessionAthletes: RequestHandler = async (req, res, next) => {
  try {
    const { id: sessionId } = req.params;

    // 🛡️ FIX: Added 'age height weight sports' to the populate selection
    // so the Coach Dashboard and Notes page can access biometric data.
    const session = await Schedule.findById(sessionId).populate(
      "athletes",
      "name age height weight sports",
    );

    if (!session) {
      throw new ApiError(404, "Session not found");
    }

    res.status(200).json({
      success: true,
      data: session.athletes,
    });
  } catch (error) {
    next(error);
  }
};
