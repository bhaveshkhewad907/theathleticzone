import Schedule from "../schedule/schedule.model";
import { SessionStatus } from "../schedule/sessionStatus";
import { assertValidTransition } from "../schedule/sessionStateMachine";
import ApiError from "../../utils/apiError";
import {
  EARLY_JOIN_WINDOW_MINUTES,
  SESSION_DURATION_MINUTES,
} from "../schedule/schedule.service";

const getNowIST = () => {
  const nowUTC = new Date();
  const IST_OFFSET = 5.5 * 60;
  return new Date(nowUTC.getTime() + IST_OFFSET * 60000);
};

// 🚀 THE FIX 1: Retrieve a Window covering Today AND Tomorrow
const getWindowIST = () => {
  const nowUTC = new Date();
  const IST_OFFSET = 5.5 * 60;
  const nowIST = new Date(nowUTC.getTime() + IST_OFFSET * 60000);

  const startOfToday = new Date(nowIST);
  startOfToday.setUTCHours(0, 0, 0, 0);

  const endOfTomorrow = new Date(nowIST);
  endOfTomorrow.setUTCDate(nowIST.getUTCDate() + 1);
  endOfTomorrow.setUTCHours(23, 59, 59, 999);

  return { startOfToday, endOfTomorrow };
};

// 🚀 THE FIX 2: Safely parse "09:30AM" without resulting in NaN crashes
const combineDateTime = (date: Date, timeStr: string) => {
  const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  let hours = 0,
    minutes = 0;

  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    minutes = parseInt(timeMatch[2], 10);
    const modifier = timeMatch[3]?.toUpperCase();

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
  }

  const combined = new Date(date);
  combined.setUTCHours(hours, minutes, 0, 0);
  return combined;
};

export const getCoachDashboard = async (coachId: string) => {
  const { startOfToday, endOfTomorrow } = getWindowIST();
  const now = getNowIST();

  const sessions = await Schedule.find({
    coach: coachId,
    // 🛡️ Range Query covering the active 48-hour window
    scheduledDate: { $gte: startOfToday, $lte: endOfTomorrow },
    status: { $in: [SessionStatus.SCHEDULED, SessionStatus.LIVE] },
  })
    .select("scheduledDate scheduledTime type meetingLink athletes")
    .populate("athletes", "name")
    .lean();

  return sessions.map((session) => {
    const sessionDateTime = combineDateTime(
      session.scheduledDate,
      session.scheduledTime,
    );

    const joinAvailableAt = new Date(
      sessionDateTime.getTime() - EARLY_JOIN_WINDOW_MINUTES * 60 * 1000,
    );
    const sessionEndAt = new Date(
      sessionDateTime.getTime() + SESSION_DURATION_MINUTES * 60 * 1000,
    );

    const isJoinAllowed = now >= joinAvailableAt && now <= sessionEndAt;
    const isLive = now >= sessionDateTime && now <= sessionEndAt;

    return {
      id: session._id,
      scheduledTime: session.scheduledTime,
      type: session.type,
      meetingLink: session.meetingLink,
      athletes: session.athletes.map((a: any) => a.name),
      isJoinAllowed,
      isLive,
      joinAvailableAt,
    };
  });
};

export const coachStartSession = async (sessionId: string, coachId: string) => {
  const session = await Schedule.findById(sessionId);

  if (!session) throw new ApiError(404, "Session not found");
  if (session.coach.toString() !== coachId)
    throw new ApiError(403, "Not authorized");

  // 🛡️ Safely parse using the fixed function
  const sessionDateTime = combineDateTime(
    session.scheduledDate,
    session.scheduledTime,
  );
  const now = getNowIST();

  const earlyStartAllowedAt = new Date(
    sessionDateTime.getTime() - EARLY_JOIN_WINDOW_MINUTES * 60 * 1000,
  );
  const sessionEndTime = new Date(
    sessionDateTime.getTime() + SESSION_DURATION_MINUTES * 60 * 1000,
  );

  if (now < earlyStartAllowedAt) {
    throw new ApiError(
      400,
      `Session can only be started ${EARLY_JOIN_WINDOW_MINUTES} minutes before scheduled time`,
    );
  }

  if (now > sessionEndTime) {
    throw new ApiError(400, "Session time has already passed");
  }

  if (session.status === "LIVE") {
    // If it's already live, just hand them the keys to get back in as a plain string.
    // Do NOT trigger the state machine.
    return session.meetingLink;
  }

  assertValidTransition(session.status, SessionStatus.LIVE);

  await Schedule.findOneAndUpdate(
    { _id: sessionId, status: SessionStatus.SCHEDULED },
    {
      $set: {
        status: SessionStatus.LIVE,
        coachJoinedAt: now,
      },
    },
  );

  return session.meetingLink;
};

export const coachEndSession = async (sessionId: string, coachId: string) => {
  const session = await Schedule.findById(sessionId);

  if (!session) throw new ApiError(404, "Session not found");
  if (session.coach.toString() !== coachId)
    throw new ApiError(403, "Not authorized");

  assertValidTransition(session.status, SessionStatus.COMPLETED);

  session.status = SessionStatus.COMPLETED;
  session.coachLeftAt = new Date();

  await session.save();
};
