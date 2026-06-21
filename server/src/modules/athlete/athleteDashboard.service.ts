import User from "../user/user.model";
import CourseProgress from "../course/courseProgress.model";
import Course from "../course/course.model";
import ApiError from "../../utils/apiError";

export const getAthleteDashboard = async (userId: string) => {
  // 🚀 PERFORMANCE FIX: Use .lean() for read-only queries to bypass heavy Mongoose hydration
  const user = await User.findById(userId).select("platformState").lean();

  // 🛡️ ARCHITECTURE FIX: Secure fallback if user document no longer exists
  if (!user) {
    throw new ApiError(404, "Athlete profile not found.");
  }

  const activeCourseId = user.platformState?.activeCourseId;

  // Early return if they haven't been assigned a course yet
  if (!activeCourseId) {
    return {
      platformState: user.platformState,
      activeCourse: null,
      progress: { progressPercentage: 0, lastWatchedSeconds: 0 },
    };
  }

  // 🚀 PERFORMANCE FIX: Run independent database queries concurrently
  const [activeCourse, progress] = await Promise.all([
    Course.findById(activeCourseId).select("meta").lean(),
    CourseProgress.findOne({ user: userId, course: activeCourseId }).lean(),
  ]);

  return {
    platformState: user.platformState,
    activeCourse,
    progress: progress || { progressPercentage: 0, lastWatchedSeconds: 0 },
  };
};
