import User from "../user/user.model";
import LiveSubscription from "../liveSubscription/liveSubscription.model";
import Schedule from "../schedule/schedule.model";
// 🛡️ NEW: Import Availability to track athlete submissions
import Availability from "../availability/availability.model";

// 🛡️ Hardened UTC-to-IST Tomorrow Calculator
const getTomorrowIST = () => {
  const nowUTC = new Date();
  const IST_OFFSET = 5.5 * 60;
  const nowIST = new Date(nowUTC.getTime() + IST_OFFSET * 60000);

  const tomorrowIST = new Date(nowIST);
  tomorrowIST.setUTCDate(nowIST.getUTCDate() + 1);
  tomorrowIST.setUTCHours(0, 0, 0, 0);

  return tomorrowIST;
};

// 🛡️ Algorithm to check if we have passed the 9:30 PM cutoff
const isAfterISTCutoff = () => {
  const nowUTC = new Date();
  const IST_OFFSET = 5.5 * 60;
  const nowIST = new Date(nowUTC.getTime() + IST_OFFSET * 60000);

  const hours = nowIST.getUTCHours();
  const minutes = nowIST.getUTCMinutes();

  const currentMinutes = hours * 60 + minutes;
  const cutoff = 21 * 60 + 30; // 9:30 PM

  return currentMinutes >= cutoff;
};

export const getAdminDashboard = async () => {
  // Total users
  const totalAthletes = await User.countDocuments({ role: "ATHLETE" });
  const totalCoaches = await User.countDocuments({ role: "COACH" });

  // Active subscriptions breakdown
  const totalGroupSubscriptions = await LiveSubscription.countDocuments({
    type: "GROUP",
    status: "ACTIVE",
  });

  const totalOneOnOneSubscriptions = await LiveSubscription.countDocuments({
    type: "ONE_ON_ONE",
    status: "ACTIVE",
  });

  // Revenue (all successful subscriptions)
  const revenueResult = await LiveSubscription.aggregate([
    { $match: { status: { $in: ["ACTIVE", "EXPIRED"] } } },
    { $group: { _id: null, totalRevenue: { $sum: "$priceAtPurchase" } } },
  ]);

  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  // 🚀 THE FIX: Date Range for Tomorrow (Catches all times within the 24h window)
  const tomorrowIST = getTomorrowIST();
  const endOfTomorrow = new Date(tomorrowIST);
  endOfTomorrow.setUTCHours(23, 59, 59, 999);

  const tomorrowRange = {
    $gte: tomorrowIST,
    $lte: endOfTomorrow,
  };

  // Sessions scheduled for tomorrow
  const sessionsScheduledTomorrow = await Schedule.countDocuments({
    scheduledDate: tomorrowRange,
    status: { $in: ["SCHEDULED", "LIVE"] },
  });

  // ============================================================================
  // 🚀 NEW: PLATFORM INTELLIGENCE (TELEMETRY STRIP) LOGIC
  // ============================================================================

  // 1. Calculate Athletes Submitted
  const availabilities = await Availability.find({
    availableForDate: tomorrowRange,
  }).populate({
    path: "subscription",
    match: { type: "GROUP", status: "ACTIVE" },
  });

  const athletesSubmitted = availabilities.filter(
    (a: any) => a.subscription !== null,
  ).length;

  // 2. Calculate athletes ALREADY scheduled
  const existingSchedules = await Schedule.find({
    scheduledDate: tomorrowRange,
    status: { $in: ["SCHEDULED", "LIVE"] },
  });

  let scheduledAthleteCount = 0;
  existingSchedules.forEach((schedule) => {
    if (schedule.relatedSubscriptions) {
      scheduledAthleteCount += schedule.relatedSubscriptions.length;
    }
  });

  // 3. Calculate Pending Assignments (Assume ~4 athletes per cluster)
  const pendingAthletes = Math.max(
    0,
    athletesSubmitted - scheduledAthleteCount,
  );
  const pendingAssignments =
    pendingAthletes > 0 ? Math.ceil(pendingAthletes / 4) : 0;

  const groupsGenerated = pendingAssignments + existingSchedules.length;

  // 4. Calculate Engine Status String
  const isReady = isAfterISTCutoff();
  let engineStatus = "AWAITING CUTOFF"; // Before 9:30 PM

  if (isReady && pendingAssignments > 0) {
    engineStatus = "ACTIVE"; // Needs Admin Action!
  } else if (isReady && pendingAssignments === 0 && athletesSubmitted > 0) {
    engineStatus = "COMPLETED"; // All assigned!
  } else if (isReady && athletesSubmitted === 0) {
    engineStatus = "STANDBY"; // Cutoff passed, but zero athletes submitted
  }

  const sysStats = {
    engineStatus,
    isReady,
    athletesSubmitted,
    groupsGenerated,
    pendingAssignments,
  };

  // ============================================================================

  return {
    totalAthletes,
    totalCoaches,
    totalGroupSubscriptions,
    totalOneOnOneSubscriptions,
    totalRevenue,
    sessionsScheduledTomorrow,
    sysStats, // 🚀 Now we are actually returning the Telemetry data to React!
  };
};
