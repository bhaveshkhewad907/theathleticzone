import mongoose, { Schema, Document } from "mongoose";

export interface ICourseReview extends Document {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  rating: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const courseReviewSchema = new Schema<ICourseReview>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

// Prevent duplicate reviews
courseReviewSchema.index({ user: 1, course: 1 }, { unique: true });

export default mongoose.model<ICourseReview>(
  "CourseReview",
  courseReviewSchema,
);
