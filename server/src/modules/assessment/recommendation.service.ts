import Course from "../course/course.model";
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

  // Beginner Checks
  if (trainingAgeYears < 2) beginnerPoints++;
  if (relativeSquat < 1.5) beginnerPoints++;
  if (sprint30mSeconds > 4.6) beginnerPoints++;
  if (broadJumpMeters < 2.0) beginnerPoints++;

  // Intermediate Checks
  if (trainingAgeYears >= 2) intermediatePoints++;
  if (relativeSquat >= 1.5) intermediatePoints++;
  if (broadJumpMeters > 2.1) intermediatePoints++;
  if (sprint30mSeconds <= 4.5) intermediatePoints++;

  // The Verdict
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

  // The logic runs in a specific order. Mobility overrides everything else.
  const hasMobilityDeficit = kneeToWallCm < 8 || deepSquatHold === "Poor";

  if (assignedLevel === "Beginner") {
    if (hasMobilityDeficit) {
      identifiedDeficit = "Mobility";
    } else if (relativeSquat < 1.4) {
      identifiedDeficit = "Strength";
    } else if (relativeSquat >= 1.4 && broadJumpMeters < 2.0) {
      identifiedDeficit = "Power";
    } else {
      // Squat is good, Broad Jump is good, Mobility is good -> Technique issue
      identifiedDeficit = "Technique";
    }
  }

  if (assignedLevel === "Intermediate") {
    if (hasMobilityDeficit) {
      identifiedDeficit = "Mobility";
    } else if (relativeSquat < 1.8) {
      identifiedDeficit = "Strength";
    } else if (relativeSquat >= 1.8 && broadJumpMeters < 2.3) {
      identifiedDeficit = "Power";
    } else {
      // Squat is elite, Broad Jump is elite, Mobility is good -> Technique issue
      identifiedDeficit = "Technique";
    }
  }

  // ==========================================
  // 3. AUTOMATIC COURSE ASSIGNMENT
  // ==========================================
  // We search the database for a Course whose title contains BOTH the Level and the Deficit
  // (e.g., looking for a course named "Beginner Power Cycle" or "Intermediate Strength Block")
  const assignedCourse = await Course.findOne({
    "meta.title": { $regex: new RegExp(assignedLevel, "i") },
    $and: [{ "meta.title": { $regex: new RegExp(identifiedDeficit, "i") } }],
  });

  if (!assignedCourse) {
    throw new ApiError(
      404,
      `Engine evaluated athlete as [${assignedLevel} - ${identifiedDeficit}], but no matching course was found in the database. Please create a course with these keywords in the title.`,
    );
  }

  return {
    assignedLevel,
    identifiedDeficit,
    assignedCourseId: assignedCourse._id,
  };
};
