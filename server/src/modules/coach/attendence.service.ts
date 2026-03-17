import Schedule from "../schedule/schedule.model";
import ApiError from "../../utils/apiError";
import { SessionStatus } from "../schedule/sessionStatus";

export const coachJoinSession = async (sessionId: string, coachId: string) => {
  const session = await Schedule.findById(sessionId);

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  if (session.coach.toString() !== coachId) {
    throw new ApiError(403, "Not authorized");
  }

  if (session.status !== SessionStatus.SCHEDULED) {
    throw new ApiError(400, "Session not available");
  }

  if (session.status !== "SCHEDULED") {
    throw new ApiError(400, "Session not available");
  }

  session.status = SessionStatus.LIVE;
  session.coachJoinedAt = new Date();

  await session.save();

  return session.meetingLink;
};

export const coachEndSession = async (sessionId: string, coachId: string) => {
  const session = await Schedule.findById(sessionId);

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  if (session.coach.toString() !== coachId) {
    throw new ApiError(403, "Not authorized");
  }

  session.status = SessionStatus.COMPLETED;
  session.coachLeftAt = new Date();

  await session.save();

  return true;
};
