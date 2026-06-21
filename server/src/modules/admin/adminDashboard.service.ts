import User from "../user/user.model";
import Assessment from "../assessment/assessment.model";

// TODO (Post-Launch Phase 2): Move pricing and coupons to a Database Collection or ENV
// to prevent DRY violations with the Payment Controller.
const COUPONS: Record<string, number> = {
  JAYSON30: 30,
};
const BASE_PRICE = 10;

export const getAdminDashboard = async () => {
  // 🚀 PERFORMANCE FIX: Fire all 6 database queries concurrently
  const [
    totalAthletes,
    totalAdmins,
    athletesInTraining,
    athletesNeedingAssessment,
    totalAssessments,
    financialData,
  ] = await Promise.all([
    User.countDocuments({ role: "ATHLETE" }),
    User.countDocuments({ role: "ADMIN" }),
    User.countDocuments({ "platformState.status": "ACTIVE_TRAINING" }),
    User.countDocuments({
      "platformState.status": "NEEDS_ASSESSMENT",
      role: "ATHLETE",
    }),
    Assessment.countDocuments(),
    User.aggregate([
      { $match: { "platformState.hasPaidEntryFee": true } },
      { $group: { _id: "$platformState.usedCoupon", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  let totalRevenue = 0;
  const couponUsage: { code: string; count: number }[] = [];

  financialData.forEach((group) => {
    const code = group._id;
    const count = group.count;

    if (code) {
      couponUsage.push({ code, count });
      const discount = COUPONS[code.toUpperCase()] || 0;
      const pricePaid = BASE_PRICE - (BASE_PRICE * discount) / 100;
      totalRevenue += pricePaid * count;
    } else {
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
    totalRevenue,
  };
};
