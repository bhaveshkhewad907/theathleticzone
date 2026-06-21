import mongoose from "mongoose";
import ApiError from "../../utils/apiError";

interface PhysicalData {
  age: number;
  heightCm: number;
  bodyweightKg: number;
  trainingAgeYears: number;
}

interface MetricsData {
  mobility: { kneeToWallCm: number; deepSquatHold: string };
  power: { broadJumpMeters: number; verticalJumpCm: number };
  sprinting: { sprint30mSeconds: number };
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
  const { trainingAgeYears } = physical;

  // ==========================================
  // 1. DETERMINE ATHLETE LEVEL
  // ==========================================
  let beginnerPoints = 0;
  let intermediatePoints = 0;

  if (trainingAgeYears < 2) beginnerPoints++;
  if (relativeSquat < 1.5) beginnerPoints++;
  if (sprint30mSeconds > 4.6) beginnerPoints++;
  if (broadJumpMeters < 2.0) beginnerPoints++;

  if (trainingAgeYears >= 2) intermediatePoints++;
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
  // 2. DETERMINE SPECIFIC DEFICIT
  // ==========================================
  let identifiedDeficit = "";
  const hasMobilityDeficit = kneeToWallCm < 8 || deepSquatHold === "Poor";

  if (assignedLevel === "Beginner") {
    if (hasMobilityDeficit) identifiedDeficit = "Mobility";
    else if (relativeSquat < 1.4) identifiedDeficit = "Strength";
    else if (relativeSquat >= 1.4 && broadJumpMeters < 2.0)
      identifiedDeficit = "Power";
    else identifiedDeficit = "Technique";
  }

  if (assignedLevel === "Intermediate") {
    if (hasMobilityDeficit) identifiedDeficit = "Mobility";
    else if (relativeSquat < 1.8) identifiedDeficit = "Strength";
    else if (relativeSquat >= 1.8 && broadJumpMeters < 2.3)
      identifiedDeficit = "Power";
    else identifiedDeficit = "Technique";
  }

  // ==========================================
  // 3. AUTOMATIC COURSE ASSIGNMENT
  // ==========================================
  // 🚀 ARCHITECTURE FIX: Query explicitly against the structured metadata fields
  const Course = mongoose.model("Course");
  const assignedCourse = await Course.findOne({
    "meta.tier": assignedLevel,
    "meta.targetDeficit": identifiedDeficit,
    isDeleted: { $ne: true },
  });

  if (!assignedCourse) {
    // Return null so the controller can safely assign the fallback course
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
