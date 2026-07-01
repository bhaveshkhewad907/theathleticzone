import mongoose from "mongoose";
import ApiError from "../../utils/apiError";

interface PhysicalData {
  age: number;
  heightCm: number;
  bodyweightKg: number;
  trainingAgeYears: number;
  trainingAgeMonths?: number;
}

interface MetricsData {
  mobility: { kneeToWallCm: number; deepSquatHold: string };
  power: { broadJumpMeters: number; verticalJumpCm: number };
  sprinting: {
    sprint30mSeconds: number;
    sprint100mSeconds?: number;
    sprint200mSeconds?: number;
  };
  strength: { backSquatMaxKg: number };
}

export const runRecommendationEngine = async (
  physical: PhysicalData,
  metrics: MetricsData,
) => {
  const relativeSquat = metrics.strength.backSquatMaxKg / physical.bodyweightKg;
  const { broadJumpMeters } = metrics.power;
  const { sprint30mSeconds } = metrics.sprinting;
  const { kneeToWallCm, deepSquatHold } = metrics.mobility;

  const years = physical.trainingAgeYears || 0;
  const months = physical.trainingAgeMonths || 0;
  const preciseTrainingAge = years + months / 12;

  // ==========================================
  // 1. DETERMINE ATHLETE LEVEL
  // ==========================================
  let beginnerPoints = 0;
  let intermediatePoints = 0;

  if (preciseTrainingAge < 1) beginnerPoints++;
  if (relativeSquat < 1.5) beginnerPoints++;
  if (sprint30mSeconds > 4.6) beginnerPoints++;
  if (broadJumpMeters < 2.0) beginnerPoints++;

  if (preciseTrainingAge >= 1) intermediatePoints++;
  if (relativeSquat >= 1.5) intermediatePoints++;
  if (broadJumpMeters > 2.1) intermediatePoints++;
  if (sprint30mSeconds <= 4.5) intermediatePoints++;

  let assignedLevel = "Beginner";
  if (intermediatePoints >= 3) {
    assignedLevel = "Intermediate";
  } else if (beginnerPoints >= 2) {
    assignedLevel = "Beginner";
  }

  // ==========================================
  // 2. DETERMINE SPECIFIC DEFICIT (🚀 FIXED)
  // ==========================================
  let identifiedDeficit = "";
  const hasMobilityDeficit = kneeToWallCm < 6 || deepSquatHold === "Poor";

  if (assignedLevel === "Beginner") {
    if (hasMobilityDeficit) identifiedDeficit = "Mobility";
    else if (relativeSquat < 1.4) identifiedDeficit = "Strength";
    // 🚀 If they pass mobility AND strength, they get POWER as the ultimate capstone.
    else identifiedDeficit = "Power";
  }

  if (assignedLevel === "Intermediate") {
    if (hasMobilityDeficit) identifiedDeficit = "Mobility";
    else if (relativeSquat < 1.8) identifiedDeficit = "Strength";
    // 🚀 Technique removed. Power is now the final fallback.
    else identifiedDeficit = "Power";
  }

  // ==========================================
  // 3. AUTOMATIC COURSE ASSIGNMENT
  // ==========================================
  const Course = mongoose.model("Course");
  const assignedCourse = await Course.findOne({
    "meta.tier": assignedLevel,
    "meta.targetDeficit": identifiedDeficit,
    isDeleted: { $ne: true },
  });

  if (!assignedCourse) {
    return {
      assignedLevel,
      identifiedDeficit,
      assignedCourseId: null,
    };
  }

  return {
    assignedLevel,
    identifiedDeficit,
    assignedCourseId: assignedCourse._id,
  };
};
