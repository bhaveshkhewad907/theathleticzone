import User from "../user/user.model";
import Assessment from "../assessment/assessment.model";

export const getAdminDashboard = async () => {
  // Total user counts
  const totalAthletes = await User.countDocuments({ role: "ATHLETE" });
  const totalAdmins = await User.countDocuments({ role: "ADMIN" });

  // 🚀 NEW: Platform State Tracking
  const athletesInTraining = await User.countDocuments({
    role: "ATHLETE",
    "platformState.status": "ACTIVE_TRAINING",
  });

  const athletesNeedingAssessment = await User.countDocuments({
    role: "ATHLETE",
    "platformState.status": "NEEDS_ASSESSMENT",
  });

  // Total Assessments in the system
  const totalAssessments = await Assessment.countDocuments();

  return {
    totalAthletes,
    totalAdmins,
    athletesInTraining,
    athletesNeedingAssessment,
    totalAssessments,
  };
};
