import Schedule from "../schedule/schedule.model";
import ApiError from "../../utils/apiError";
import mongoose from "mongoose";

interface FeedbackInput {
  athlete: string;
  feedback: string;
}

export const addSessionNotes = async (
  sessionId: string,
  coachId: string,
  summary: string,
  intensity: "LOW" | "MEDIUM" | "HIGH",
  feedback: FeedbackInput[],
) => {
  const session = await Schedule.findById(sessionId);

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  if (session.coach.toString() !== coachId) {
    throw new ApiError(403, "Not authorized");
  }

  if (session.status !== "COMPLETED") {
    throw new ApiError(400, "Notes can only be added to completed sessions");
  }

  const formattedFeedback = feedback.map((f) => ({
    athlete: new mongoose.Types.ObjectId(f.athlete),
    feedback: f.feedback,
  }));

  session.notes = {
    summary,
    intensity,
    coachFeedback: formattedFeedback,
    createdAt: new Date(),
  };

  await session.save();

  return true;
};
