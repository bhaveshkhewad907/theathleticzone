import User from "../user/user.model";
import CourseProgress from "../course/courseProgress.model";
import Course from "../course/course.model";

export const getAthleteDashboard = async (userId: string) => {
  const user = await User.findById(userId);

  let activeCourse: any = null;
  let progress = null;

  // If the user is in ACTIVE_TRAINING, fetch their course and progress
  if (user?.platformState?.activeCourseId) {
    activeCourse = await Course.findById(
      user.platformState.activeCourseId,
    ).select("meta");
    progress = await CourseProgress.findOne({
      user: userId,
      course: user.platformState.activeCourseId,
    });
  }

  return {
    platformState: user?.platformState,
    activeCourse,
    progress: progress || { progressPercentage: 0, lastWatchedSeconds: 0 },
  };
};
