import User from "../user/user.model";
import Assessment from "../assessment/assessment.model";
import CoursePurchase from "../course/coursePurchase.model";

// 🚀 EXACT MATCH to your Entry Controller
const COUPONS: Record<string, number> = {
  JAYSON30: 30, // 30% off
};
const BASE_PRICE = 10; // ₹10

export const getAdminDashboard = async () => {
  const totalAthletes = await User.countDocuments({ role: "ATHLETE" });
  const athletesInTraining = await User.countDocuments({
    role: "ATHLETE",
    "platformState.status": "ACTIVE_TRAINING",
  });
  const athletesNeedingAssessment = await User.countDocuments({
    role: "ATHLETE",
    "platformState.status": "NEEDS_ASSESSMENT",
  });

  const totalAssessments = await Assessment.countDocuments({
    status: "COMPLETED",
  });

  // 🚀 1. EXACT REVENUE MATH (Dynamically calculates ₹10 vs ₹7 based on the coupon)
  const entryFeeAggregation = await User.aggregate([
    { $match: { "platformState.hasPaidEntryFee": true } },
    {
      $addFields: {
        actualPaid: {
          $switch: {
            branches: Object.entries(COUPONS).map(([code, discount]) => ({
              case: { $eq: ["$platformState.usedCoupon", code] },
              then: BASE_PRICE - (BASE_PRICE * discount) / 100, // 10 - 3 = 7
            })),
            default: BASE_PRICE, // 10
          },
        },
      },
    },
    { $group: { _id: null, total: { $sum: "$actualPaid" } } },
  ]);
  const entryFeeRevenue =
    entryFeeAggregation.length > 0 ? entryFeeAggregation[0].total : 0;

  // 🚀 2. LEGACY REVENUE (Catches any old purchases from the CoursePurchase collection)
  const coursePurchaseAggregation = await CoursePurchase.aggregate([
    { $match: { status: "PURCHASED" } },
    { $group: { _id: null, total: { $sum: "$priceAtPurchase" } } },
  ]);
  const courseRevenue =
    coursePurchaseAggregation.length > 0
      ? coursePurchaseAggregation[0].total
      : 0;

  // 🚀 3. TOTAL PLATFORM REVENUE
  const totalRevenue = entryFeeRevenue + courseRevenue;

  // 🚀 4. INFLUENCER TRACKING (Accurately counts how many unique athletes used each code)
  const couponUsage = await User.aggregate([
    { $match: { "platformState.usedCoupon": { $exists: true, $ne: null } } },
    {
      $group: {
        _id: "$platformState.usedCoupon",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        code: "$_id",
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);

  // Return the data directly to your admin.controller.ts
  return {
    totalAthletes,
    athletesInTraining,
    athletesNeedingAssessment,
    totalAssessments,
    totalRevenue,
    couponUsage,
  };
};
