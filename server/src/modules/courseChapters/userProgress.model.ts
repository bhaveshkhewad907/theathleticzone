import mongoose, { Schema, Document } from "mongoose";

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  completedSteps: mongoose.Types.ObjectId[];
  completedDays: number[];
}

const UserProgressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    // Store unique IDs of completed steps to prevent duplicates
    completedSteps: [{ type: Schema.Types.ObjectId, ref: "Step" }],
    // Store completed day numbers
    completedDays: [{ type: Number }],
  },
  { timestamps: true },
);

// Ensure a user only has one progress tracker per course
UserProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model<IUserProgress>(
  "UserProgress",
  UserProgressSchema,
);
