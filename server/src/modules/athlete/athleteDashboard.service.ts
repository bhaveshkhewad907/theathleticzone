import LiveSubscription from "../liveSubscription/liveSubscription.model";
import Schedule from "../schedule/schedule.model";
import CoursePurchase from "../course/coursePurchase.model";
import { getSessionTimingMeta } from "../schedule/schedule.service";
import { getLast30DaysAttendanceSummary } from "../attendence/attendence.service";

const IST_OFFSET = 5.5 * 60;

const nowIST = () => {
  const nowUTC = new Date();
  return new Date(nowUTC.getTime() + IST_OFFSET * 60000);
};

// ⚡ PERFORMANCE UPGRADE: Zero-Dependency In-Memory Cache
const attendanceCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const getAthleteDashboard = async (userId: string) => {
  const now = nowIST();

  // 🚀 THE FIX: Look from the Start of TODAY...
  const todayStart = new Date(now);
  todayStart.setUTCHours(0, 0, 0, 0);

  // ...to the End of TOMORROW
  const tomorrowEnd = new Date(now);
  tomorrowEnd.setUTCDate(now.getUTCDate() + 1);
  tomorrowEnd.setUTCHours(23, 59, 59, 999);

  const schedule = await Schedule.findOne({
    athletes: userId,
    // 🛡️ Query safely covers today's sessions and tomorrow's!
    scheduledDate: { $gte: todayStart, $lte: tomorrowEnd },
    status: { $in: ["SCHEDULED", "LIVE"] },
  }).sort({ scheduledDate: 1, scheduledTime: 1 }); // Sort by soonest

  let upcomingSession = null;

  if (schedule) {
    const timing = getSessionTimingMeta(schedule);

    upcomingSession = {
      _id: schedule._id,
      scheduledDate: schedule.scheduledDate,
      scheduledTime: schedule.scheduledTime,
      meetingLink: timing.isJoinable ? schedule.meetingLink : null,
      status: schedule.status,
      isJoinable: timing.isJoinable,
      isLive: timing.isLive,
    };
  }

  // Cache Logic remains unchanged
  let attendanceSummary;
  const cachedRecord = attendanceCache.get(userId);

  if (cachedRecord && cachedRecord.expiry > Date.now()) {
    attendanceSummary = cachedRecord.data;
  } else {
    attendanceSummary = await getLast30DaysAttendanceSummary(userId);
    attendanceCache.set(userId, {
      data: attendanceSummary,
      expiry: Date.now() + CACHE_TTL_MS,
    });
  }

  return { upcomingSession, attendanceSummary };
};
