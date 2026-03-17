import Availability from "../availability/availability.model";
import LiveSubscription from "../liveSubscription/liveSubscription.model";
import ApiError from "../../utils/apiError";
import Sport from "../sport/sport.model";
// 🛡️ NEW: Import Schedule model to cross-reference existing deployments
import Schedule from "../schedule/schedule.model";

const isAfterISTCutoff = () => {
  const nowUTC = new Date();
  const IST_OFFSET = 5.5 * 60;
  const nowIST = new Date(nowUTC.getTime() + IST_OFFSET * 60000);

  const hours = nowIST.getUTCHours();
  const minutes = nowIST.getUTCMinutes();

  const currentMinutes = hours * 60 + minutes;
  const cutoff = 21 * 60 + 30;

  return currentMinutes > cutoff;
};

const distributeEvenly = (users: any[]) => {
  const N = users.length;
  if (N === 0) return [];

  const groupCount = Math.ceil(N / 4);
  const baseSize = Math.floor(N / groupCount);
  let remainder = N % groupCount;

  const groups: any[] = [];
  let index = 0;

  for (let i = 0; i < groupCount; i++) {
    let size = baseSize;
    if (remainder > 0) {
      size += 1;
      remainder--;
    }
    groups.push(users.slice(index, index + size));
    index += size;
  }
  return groups;
};

export const generateGroupSuggestions = async () => {
  if (!isAfterISTCutoff()) {
    throw new ApiError(400, "Group generation allowed only after cutoff");
  }

  const nowUTC = new Date();
  const IST_OFFSET = 5.5 * 60;
  const nowIST = new Date(nowUTC.getTime() + IST_OFFSET * 60000);

  const tomorrowIST = new Date(nowIST);
  tomorrowIST.setUTCDate(nowIST.getUTCDate() + 1); // 🛡️ UTC Hardened
  tomorrowIST.setUTCHours(0, 0, 0, 0);

  // 1. Fetch availability for tomorrow
  const availabilities = await Availability.find({
    availableForDate: tomorrowIST,
  }).populate({
    path: "subscription",
    match: { type: "GROUP", status: "ACTIVE" },
    populate: {
      path: "user",
      select: "name email sport sports profileImage",
    },
  });

  // =========================================================================
  // 🚀 NEW ALGORITHM: The Cross-Reference Filter
  // =========================================================================

  // 2. Fetch existing schedules for tomorrow to see who is already booked
  const existingSchedules = await Schedule.find({
    scheduledDate: tomorrowIST,
    status: { $in: ["SCHEDULED", "LIVE"] }, // Only look at active sessions
  });

  // 3. Extract all subscription IDs that have ALREADY been scheduled
  const scheduledSubscriptionIds = new Set<string>();
  existingSchedules.forEach((schedule) => {
    if (schedule.relatedSubscriptions) {
      schedule.relatedSubscriptions.forEach((subId) => {
        scheduledSubscriptionIds.add(subId.toString());
      });
    }
  });

  // 4. Filter the availability pool: remove invalid subscriptions AND already scheduled athletes
  const valid = availabilities.filter((a: any) => {
    if (a.subscription === null) return false; // Filter invalid/inactive

    // If the athlete's subscription is in the "already scheduled" Set, REMOVE them from suggestions
    const subId = a.subscription._id.toString();
    if (scheduledSubscriptionIds.has(subId)) return false;

    return true; // Keep them in the pool!
  });

  // =========================================================================

  const sportMap: Record<string, any[]> = {};

  for (const entry of valid) {
    const subscription: any = entry.subscription;
    const user = subscription.user;

    const sportObj = user?.sport || (user?.sports && user.sports[0]);

    if (!sportObj) continue;

    const sportId = sportObj.toString();

    if (!sportMap[sportId]) {
      sportMap[sportId] = [];
    }

    sportMap[sportId].push({
      userId: user._id,
      name: user.name,
      subscriptionId: subscription._id,
    });
  }

  const suggestions: any[] = [];

  for (const sportId in sportMap) {
    const sport = await Sport.findById(sportId);
    const groups = distributeEvenly(sportMap[sportId]);

    suggestions.push({
      sportId,
      sportName: sport?.name || "Unknown Sport",
      groups,
    });
  }

  return suggestions;
};

// Add this to your backend service file
export const getPendingOneOnOneRequests = async () => {
  if (!isAfterISTCutoff()) {
    throw new ApiError(400, "1-on-1 allocation allowed only after cutoff");
  }

  const nowUTC = new Date();
  const IST_OFFSET = 5.5 * 60;
  const nowIST = new Date(nowUTC.getTime() + IST_OFFSET * 60000);

  const tomorrowIST = new Date(nowIST);
  tomorrowIST.setUTCDate(nowIST.getUTCDate() + 1);
  tomorrowIST.setUTCHours(0, 0, 0, 0);

  // 1. Fetch only 1-on-1 Availabilities
  const availabilities = await Availability.find({
    availableForDate: tomorrowIST,
  }).populate({
    path: "subscription",
    match: { type: "ONE_ON_ONE", status: "ACTIVE" },
    populate: {
      path: "user",
      select: "name email sport sports profileImage",
    },
  });

  // 2. Cross-reference to ensure they aren't already scheduled
  const existingSchedules = await Schedule.find({
    scheduledDate: tomorrowIST,
    status: { $in: ["SCHEDULED", "LIVE"] },
  });

  const scheduledSubscriptionIds = new Set<string>();
  existingSchedules.forEach((schedule) => {
    if (schedule.relatedSubscriptions) {
      schedule.relatedSubscriptions.forEach((subId) => {
        scheduledSubscriptionIds.add(subId.toString());
      });
    }
  });

  const valid = availabilities.filter((a: any) => {
    if (!a.subscription) return false;
    if (scheduledSubscriptionIds.has(a.subscription._id.toString()))
      return false;
    return true;
  });

  // 3. Format and return
  return valid.map((entry: any) => {
    const user = entry.subscription.user;
    const sportObj = user?.sport || (user?.sports && user.sports[0]);
    return {
      userId: user._id,
      name: user.name,
      subscriptionId: entry.subscription._id,
      sportId: sportObj,
    };
  });
};
