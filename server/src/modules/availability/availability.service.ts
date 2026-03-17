import Availability from "./availability.model";
import LiveSubscription from "../liveSubscription/liveSubscription.model";
import ApiError from "../../utils/apiError";

const isWithinISTWindow = () => {
  const nowUTC = new Date();
  const IST_OFFSET = 5.5 * 60;
  const nowIST = new Date(nowUTC.getTime() + IST_OFFSET * 60000);

  // 🛡️ THE FIX: Use getUTC to prevent the double-timezone bug on local machines
  const hours = nowIST.getUTCHours();
  const minutes = nowIST.getUTCMinutes();
  const currentMinutes = hours * 60 + minutes;

  const start = 17 * 60; // 5:00 PM
  const end = 21 * 60 + 30; // 9:30 PM

  return currentMinutes >= start && currentMinutes <= end;
};

const isSaturdayIST = () => {
  const nowUTC = new Date();
  const IST_OFFSET = 5.5 * 60;
  const nowIST = new Date(nowUTC.getTime() + IST_OFFSET * 60000);
  return nowIST.getUTCDay() === 6; // 6 represents Saturday
};

const getTomorrowIST = () => {
  const nowUTC = new Date();
  const IST_OFFSET = 5.5 * 60;
  const nowIST = new Date(nowUTC.getTime() + IST_OFFSET * 60000);

  const tomorrow = new Date(nowIST);
  // 🛡️ THE FIX: Match the Admin grouping engine exactly!
  tomorrow.setUTCDate(nowIST.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);

  return tomorrow;
};
export const sendAvailability = async (
  subscriptionId: string,
  userId: string,
) => {
  // 🚀 NEW: Absolute block on Saturday submissions
  if (isSaturdayIST()) {
    throw new ApiError(400, "Facility is closed on Sundays. Take a rest day!");
  }

  if (!isWithinISTWindow()) {
    throw new ApiError(
      400,
      "Availability can only be submitted between 5:00 PM and 9:30 PM IST",
    );
  }

  const subscription = await LiveSubscription.findById(subscriptionId);

  if (!subscription) {
    throw new ApiError(404, "Subscription not found");
  }

  if (subscription.user.toString() !== userId) {
    throw new ApiError(403, "Unauthorized");
  }

  if (subscription.status !== "ACTIVE") {
    throw new ApiError(400, "Subscription is not active");
  }

  const today = new Date();
  if (subscription.endDate && today > subscription.endDate) {
    subscription.status = "EXPIRED";
    await subscription.save();
    throw new ApiError(400, "Subscription has expired");
  }

  const tomorrow = getTomorrowIST();

  // Prevent duplicate submission for tomorrow
  const existing = await Availability.findOne({
    subscription: subscriptionId,
    availableForDate: tomorrow,
  });

  if (existing) {
    throw new ApiError(400, "Availability already submitted for tomorrow");
  }

  const availability = await Availability.create({
    subscription: subscription._id,
    user: userId,
    availableForDate: tomorrow,
  });

  return availability;
};
