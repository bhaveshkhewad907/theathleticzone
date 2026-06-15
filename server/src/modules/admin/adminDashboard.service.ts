import User from "../user/user.model";
import Assessment from "../assessment/assessment.model";

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

  // 🚀 NEW: Count how many athletes used each promo code
  const rawCoupons = await User.aggregate([
    { $match: { "platformState.usedCoupon": { $type: "string", $ne: null } } },
    { $group: { _id: "$platformState.usedCoupon", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const couponUsage = rawCoupons.map((c) => ({ code: c._id, count: c.count }));

  return {
    totalAthletes,
    totalAdmins,
    athletesInTraining,
    athletesNeedingAssessment,
    totalAssessments,
    couponUsage, // Send this to the frontend
  };
};
