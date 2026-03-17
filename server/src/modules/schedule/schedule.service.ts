import Schedule from "./schedule.model";
import LiveSubscription from "../liveSubscription/liveSubscription.model";
import ApiError from "../../utils/apiError";
import { ISchedule } from "./schedule.model";
import { tr } from "zod/v4/locales";

// Global constants for Session lifecycle logic
export const SESSION_DURATION_MINUTES = 60;
export const EARLY_JOIN_WINDOW_MINUTES = 10;

const isSundayIST = () => {
  const nowUTC = new Date();
  const IST_OFFSET = 5.5 * 60;
  const nowIST = new Date(nowUTC.getTime() + IST_OFFSET * 60000);
  return nowIST.getUTCDay() === 0; // 🛡️ UTC Hardened
};

const IST_OFFSET = 5.5 * 60;

const getNowIST = () => {
  const nowUTC = new Date();
  return new Date(nowUTC.getTime() + IST_OFFSET * 60000);
};

const parseISTDateTime = (date: Date, timeStr: string) => {
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

export const getSessionTimingMeta = (schedule: ISchedule) => {
  const nowIST = getNowIST(); // Uses your existing hardened IST utility

  const sessionStart = parseISTDateTime(
    schedule.scheduledDate,
    schedule.scheduledTime,
  );

  // 🛡️ THE FIX: Ensure window calculation uses the same UTC-based timestamps
  const joinStart = new Date(
    sessionStart.getTime() - EARLY_JOIN_WINDOW_MINUTES * 60 * 1000,
  );
  const sessionEnd = new Date(
    sessionStart.getTime() + SESSION_DURATION_MINUTES * 60 * 1000,
  );

  const isJoinable = nowIST >= joinStart && nowIST <= sessionEnd;
  const isLive = nowIST >= sessionStart && nowIST <= sessionEnd;
  const isCompleted = nowIST > sessionEnd;

  return {
    sessionStart,
    joinStart,
    sessionEnd,
    isJoinable,
    isLive,
    isCompleted,
  };
};

export const createSchedule = async ({
  type,
  sport,
  coach,
  subscriptionIds,
  scheduledTime,
  meetingLink,
}: {
  type: "ONE_ON_ONE" | "GROUP";
  sport: string;
  coach: string;
  subscriptionIds: string[];
  scheduledTime: string;
  meetingLink: string;
}) => {
  const nowUTC = new Date();
  const IST_OFFSET = 5.5 * 60;
  const nowIST = new Date(nowUTC.getTime() + IST_OFFSET * 60000);

  const scheduledDate = new Date(nowIST);
  scheduledDate.setUTCDate(nowIST.getUTCDate() + 1); // 🛡️ UTC Hardened
  scheduledDate.setUTCHours(0, 0, 0, 0); // 🛡️ UTC Hardened

  // Enforce correct subscription count
  if (type === "ONE_ON_ONE" && subscriptionIds.length !== 1) {
    throw new ApiError(
      400,
      "ONE_ON_ONE sessions must have exactly one subscription",
    );
  }

  // 🛡️ THE FIX: Allow GROUP sessions to proceed even if only 1 athlete is available today
  if (type === "GROUP" && subscriptionIds.length < 1) {
    throw new ApiError(
      400,
      "GROUP sessions must have at least one subscription",
    );
  }

  // Prevent coach double booking
  const existing = await Schedule.findOne({
    coach,
    scheduledDate,
    scheduledTime,
  });

  if (existing) {
    throw new ApiError(400, "Coach already booked at this time");
  }

  const subscriptions = await LiveSubscription.find({
    _id: { $in: subscriptionIds },
    status: "ACTIVE",
  });

  if (subscriptions.length !== subscriptionIds.length) {
    throw new ApiError(400, "Invalid or inactive subscription found");
  }

  const athleteIds = subscriptions.map((sub) => sub.user);

  const attendanceRecords = athleteIds.map((athleteId) => ({
    athlete: athleteId,
    status: "NO_SHOW",
  }));

  const schedule = await Schedule.create({
    type,
    sport,
    coach,
    athletes: athleteIds,
    relatedSubscriptions: subscriptionIds,
    scheduledDate,
    scheduledTime,
    meetingLink,
    attendance: attendanceRecords,
  });

  return schedule;
};
