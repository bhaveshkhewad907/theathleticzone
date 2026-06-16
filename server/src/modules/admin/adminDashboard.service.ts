import User from "../user/user.model";
import Assessment from "../assessment/assessment.model";

// 🚀 NEW: Mirroring the coupon dictionary from your payment controller
const COUPONS: Record<string, number> = {
  JAYSON30: 30, // 30% off
};
const BASE_PRICE = 10;

export const getAdminDashboard = async () => {
  const totalAthletes = await User.countDocuments({ role: "ATHLETE" });
  const totalAdmins = await User.countDocuments({ role: "ADMIN" });
  const athletesInTraining = await User.countDocuments({
    "platformState.status": "ACTIVE_TRAINING",
  });
  const athletesNeedingAssessment = await User.countDocuments({
    "platformState.status": "NEEDS_ASSESSMENT",
    role: "ATHLETE",
  });
  const totalAssessments = await Assessment.countDocuments();

  // 🚀 NEW: Financial Aggregation
  // Only look at users who have successfully paid the entry fee
  const financialData = await User.aggregate([
    { $match: { "platformState.hasPaidEntryFee": true } },
    { $group: { _id: "$platformState.usedCoupon", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  let totalRevenue = 0;
  const couponUsage: { code: string; count: number }[] = [];

  // Calculate exact revenue based on who paid what
  financialData.forEach((group) => {
    const code = group._id;
    const count = group.count;

    if (code) {
      // They used a promo code
      couponUsage.push({ code, count });
      const discount = COUPONS[code.toUpperCase()] || 0;
      const pricePaid = BASE_PRICE - (BASE_PRICE * discount) / 100;
      totalRevenue += pricePaid * count;
    } else {
      // They paid full price (no code)
      totalRevenue += BASE_PRICE * count;
    }
  });

  return {
    totalAthletes,
    totalAdmins,
    athletesInTraining,
    athletesNeedingAssessment,
    totalAssessments,
    couponUsage,
    totalRevenue, // 🚀 Sending the calculated money to the frontend!
  };
};
