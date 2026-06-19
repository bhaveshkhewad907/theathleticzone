import mongoose, { Schema, Document } from "mongoose";

export interface ICourseProgress extends Document {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  // Legacy Fields
  lastWatchedSeconds: number;
  progressPercentage: number;
  isCompleted: boolean;
  // 🚀 NEW: Structured Protocol Fields
  completedSteps: string[];
  completedDays: number[];
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
    // Legacy Tracking
    lastWatchedSeconds: { type: Number, default: 0 },
    progressPercentage: { type: Number, default: 0, max: 100 },
    isCompleted: { type: Boolean, default: false },
    // 🚀 NEW Tracking Arrays
    completedSteps: [{ type: String }],
    completedDays: [{ type: Number }],
  },
  { timestamps: true },
);

// ⚡ PERFORMANCE UPGRADE: Fast lookup for resuming a video or loading protocol
courseProgressSchema.index({ user: 1, course: 1 }, { unique: true });

const CourseProgress = mongoose.model<ICourseProgress>(
  "CourseProgress",
  courseProgressSchema,
);
export default CourseProgress;
