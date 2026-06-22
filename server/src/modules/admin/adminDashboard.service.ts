import User from "../user/user.model";
import Assessment from "../assessment/assessment.model";
import CoursePurchase from "../course/coursePurchase.model";
// 🚀 NEW: Import the permanent financial ledger
import PaymentLedger from "../payment/paymentLedger.model";

export const getAdminDashboard = async () => {
  const totalAthletes = await User.countDocuments({ role: "ATHLETE" });
  const athletesInTraining = await User.countDocuments({
    role: "ATHLETE",
    "platformState.status": "ACTIVE_TRAINING",
  });
  const athletesNeedingAssessment = await User.countDocuments({
    role: "ATHLETE",
    $or: [
      { "platformState.status": "NEEDS_ASSESSMENT" },
      { "platformState.status": { $exists: false } },
      { "platformState.status": null },
    ],
  });

  const totalAssessments = await Assessment.countDocuments({
    status: "COMPLETED",
  });

  // 🚀 1. EXACT REVENUE MATH (Sums all transactions in the permanent Ledger)
  const ledgerAggregation = await PaymentLedger.aggregate([
    { $group: { _id: null, total: { $sum: "$amountPaid" } } },
  ]);
  const entryFeeRevenue =
    ledgerAggregation.length > 0 ? ledgerAggregation[0].total : 0;

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

  // 🚀 4. INFLUENCER TRACKING (Accurately tracks EVERY individual transaction)
  const couponUsage = await PaymentLedger.aggregate([
    { $match: { appliedCoupon: { $ne: null } } },
    {
      $group: {
        _id: "$appliedCoupon",
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
