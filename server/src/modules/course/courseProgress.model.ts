import mongoose, { Schema, Document } from "mongoose";

export interface ICourseProgress extends Document {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  lastWatchedSeconds: number; // Exactly where the video paused
  progressPercentage: number; // 0 to 100
  isCompleted: boolean;
  updatedAt: Date;
}

const courseProgressSchema = new Schema<ICourseProgress>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lastWatchedSeconds: { type: Number, default: 0 },
    progressPercentage: { type: Number, default: 0, max: 100 },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// ⚡ PERFORMANCE UPGRADE: Fast lookup for resuming a video
courseProgressSchema.index({ user: 1, course: 1 }, { unique: true });

const CourseProgress = mongoose.model<ICourseProgress>(
  "CourseProgress",
  courseProgressSchema,
);
export default CourseProgress;
