import Schedule from "../schedule/schedule.model";
import ApiError from "../../utils/apiError";
import mongoose from "mongoose";
import { PipelineStage, Types } from "mongoose";
import LiveSubscription from "../liveSubscription/liveSubscription.model";

export const athleteJoinSession = async (
  sessionId: string,
  athleteId: string,
) => {
  const session = await Schedule.findById(sessionId);

  if (!session) throw new ApiError(404, "Session not found");

  const attendance = session.attendance.find(
    (a) => a.athlete.toString() === athleteId,
  );

  if (!attendance) {
    throw new ApiError(403, "Not part of this session");
  }

  // 🛡️ Idempotency check: If they already successfully joined previously,
  // skip database writes and just give them the link again.
  if (attendance.joinedAt) {
    return session.meetingLink;
  }

  // 🚀 STABILITY UPGRADE: Use the robust Regex parser so it never crashes on "09:30AM"
  const timeMatch = session.scheduledTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  let hours = 0,
    minutes = 0;

  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    minutes = parseInt(timeMatch[2], 10);
    const modifier = timeMatch[3]?.toUpperCase();

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
  }

  const sessionStart = new Date(session.scheduledDate);
  // 🛡️ HARDENED: Upgraded to setUTCHours to perfectly match your coach logic
  sessionStart.setUTCHours(hours, minutes, 0, 0);

  // 🚀 THE FIX: Expanded the Late Threshold to a 10-minute grace period
  const lateThreshold = new Date(sessionStart.getTime() + 10 * 60 * 1000);
  const now = new Date();

  // If they click 'Join' after the 10-minute mark, they get tagged "LATE", otherwise "PRESENT"
  const status = now > lateThreshold ? "LATE" : "PRESENT";

  // 🛡️ Atomic Array Update (Replaces session.save())
  await Schedule.findOneAndUpdate(
    {
      _id: sessionId,
      "attendance.athlete": athleteId,
      "attendance.joinedAt": { $exists: false },
    },
    {
      $set: {
        "attendance.$.joinedAt": now,
        "attendance.$.status": status,
      },
    },
  );

  return session.meetingLink;
};

export const athleteLeaveSession = async (
  sessionId: string,
  athleteId: string,
) => {
  const session = await Schedule.findById(sessionId);
  if (!session) throw new ApiError(404, "Session not found");

  const attendance = session.attendance.find(
    (a) => a.athlete.toString() === athleteId,
  );

  if (!attendance || !attendance.joinedAt) {
    throw new ApiError(400, "Join session first");
  }

  // Calculate duration in Node
  const now = new Date();
  const duration =
    (now.getTime() - attendance.joinedAt.getTime()) / (1000 * 60);

  // 🛡️ THE FIX: Atomic Array Update prevents document locking/overwrites
  await Schedule.updateOne(
    {
      _id: sessionId,
      "attendance.athlete": athleteId,
    },
    {
      $set: {
        "attendance.$.leftAt": now,
        "attendance.$.durationMinutes": Math.round(duration),
      },
    },
  );
};

export const getAthleteAttendanceSummary = async (athleteId: string) => {
  const objectId = new mongoose.Types.ObjectId(athleteId);

  const result = await Schedule.aggregate([
    {
      $unwind: "$attendance",
    },
    {
      $match: {
        "attendance.athlete": objectId,
        status: { $in: ["COMPLETED", "MISSED"] },
      },
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        present: {
          $sum: {
            $cond: [{ $eq: ["$attendance.status", "PRESENT"] }, 1, 0],
          },
        },
        late: {
          $sum: {
            $cond: [{ $eq: ["$attendance.status", "LATE"] }, 1, 0],
          },
        },
        missed: {
          $sum: {
            $cond: [{ $eq: ["$attendance.status", "NO_SHOW"] }, 1, 0],
          },
        },
      },
    },
  ]);

  const summary = result[0] || {
    totalSessions: 0,
    present: 0,
    late: 0,
    missed: 0,
  };

  const attendancePercentage =
    summary.totalSessions > 0
      ? Math.round(
          ((summary.present + summary.late) / summary.totalSessions) * 100,
        )
      : 0;

  return {
    ...summary,
    attendancePercentage,
  };
};

export const getAthleteAttendanceHistory = async (
  athleteId: string,
  page = 1,
  limit = 10,
) => {
  const objectId = new Types.ObjectId(athleteId);

  const skip = (page - 1) * limit;

  const pipeline: PipelineStage[] = [
    { $unwind: "$attendance" },
    {
      $match: {
        "attendance.athlete": objectId,
        status: { $in: ["COMPLETED", "MISSED"] },
      },
    },
    {
      $project: {
        scheduledDate: 1,
        scheduledTime: 1,
        type: 1,
        attendance: 1,
        "notes.summary": 1,
        "notes.intensity": 1,
        personalFeedback: {
          $let: {
            vars: {
              matchedFeedback: {
                $filter: {
                  input: { $ifNull: ["$notes.coachFeedback", []] },
                  as: "fb",
                  cond: { $eq: ["$$fb.athlete", objectId] },
                },
              },
            },
            in: { $arrayElemAt: ["$$matchedFeedback.feedback", 0] },
          },
        },
      },
    },
    { $sort: { scheduledDate: -1 } },
    { $skip: skip },
    { $limit: limit },
  ];

  const sessions = await Schedule.aggregate(pipeline);

  const totalCount = await Schedule.aggregate<{ count: number }>([
    { $unwind: "$attendance" },
    {
      $match: {
        "attendance.athlete": objectId,
        status: { $in: ["COMPLETED", "MISSED"] },
      },
    },
    { $count: "count" },
  ]);

  return {
    data: sessions,
    total: totalCount[0]?.count || 0,
    page,
    limit,
  };
};

export const getLast30DaysAttendanceSummary = async (athleteId: string) => {
  const objectId = new mongoose.Types.ObjectId(athleteId);

  // 🚀 NEW: Fetch the athlete's currently active subscription
  const activeSub = await LiveSubscription.findOne({
    user: objectId,
    status: "ACTIVE",
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // 🛡️ THE FIX: The "Clean Slate" Logic
  // If they have an active subscription that started LESS than 30 days ago,
  // we use that start date instead! This instantly resets their dashboard to 0.
  const queryStartDate =
    activeSub && activeSub.startDate > thirtyDaysAgo
      ? activeSub.startDate
      : thirtyDaysAgo;

  const pipeline = [
    {
      $unwind: "$attendance",
    },
    {
      $match: {
        "attendance.athlete": objectId,
        scheduledDate: { $gte: queryStartDate }, // 👈 Dynamic boundary applied here!
        status: { $in: ["COMPLETED", "MISSED"] },
      },
    },
    {
      $group: {
        _id: "$attendance.status",
        count: { $sum: 1 },
      },
    },
  ];

  const result = await Schedule.aggregate(pipeline);

  const summary = {
    total: 0,
    PRESENT: 0,
    LATE: 0,
    NO_SHOW: 0,
  };

  result.forEach((r: any) => {
    summary.total += r.count;
    summary[r._id as keyof typeof summary] = r.count;
  });

  const attendanceRate =
    summary.total > 0
      ? Math.round(((summary.PRESENT + summary.LATE) / summary.total) * 100)
      : 0;

  return {
    ...summary,
    attendanceRate,
  };
};
