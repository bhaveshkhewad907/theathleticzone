import Schedule from "../modules/schedule/schedule.model";
import { SessionStatus } from "../modules/schedule/sessionStatus";

const IST_OFFSET = 5.5 * 60;
const SESSION_DURATION_MINUTES = 60;

const getNowIST = () => {
  const nowUTC = new Date();
  return new Date(nowUTC.getTime() + IST_OFFSET * 60000);
};

export const processSessionLifecycle = async () => {
  try {
    const now = getNowIST();
    const report = { scheduledToLive: 0, missed: 0, completed: 0 };

    const sessions = await Schedule.find({
      status: { $in: [SessionStatus.SCHEDULED, SessionStatus.LIVE] },
    });

    // 🚀 PERFORMANCE UPGRADE: Array to hold all DB instructions
    const bulkOps: any[] = [];

    for (const session of sessions) {
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
      sessionStart.setUTCHours(hours, minutes, 0, 0);

      const sessionEnd = new Date(
        sessionStart.getTime() + SESSION_DURATION_MINUTES * 60 * 1000,
      );

      // 🔹 Transition: SCHEDULED → LIVE
      if (
        session.status === SessionStatus.SCHEDULED &&
        now >= sessionStart &&
        now < sessionEnd
      ) {
        bulkOps.push({
          updateOne: {
            filter: { _id: session._id },
            update: { $set: { status: SessionStatus.LIVE } },
          },
        });
        report.scheduledToLive++;
        continue;
      }

      // 🔹 Transition: SCHEDULED → MISSED
      if (session.status === SessionStatus.SCHEDULED && now >= sessionEnd) {
        bulkOps.push({
          updateOne: {
            filter: { _id: session._id },
            update: { $set: { status: SessionStatus.MISSED } },
          },
        });
        report.missed++;
        continue;
      }

      // 🔹 Transition: LIVE → COMPLETED
      if (session.status === SessionStatus.LIVE && now >= sessionEnd) {
        const updateDoc: any = { status: SessionStatus.COMPLETED };
        if (!session.coachLeftAt) updateDoc.coachLeftAt = now;

        bulkOps.push({
          updateOne: {
            filter: { _id: session._id },
            update: { $set: updateDoc },
          },
        });
        report.completed++;
      }
    }

    // 🚀 EXECUTE ALL UPDATES IN A SINGLE DATABASE CALL!
    if (bulkOps.length > 0) {
      await Schedule.bulkWrite(bulkOps);
    }

    console.log(`[Lifecycle Pulse] ${now.toISOString()} | Result:`, report);
    return report;
  } catch (error) {
    console.error("Lifecycle processing failed:", error);
    throw error;
  }
};
