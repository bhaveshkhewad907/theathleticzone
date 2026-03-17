import mongoose, { Schema, Document } from "mongoose";

export interface ICourse extends Document {
  title: string;
  description: string;
  thumbnailUrl: string;
  videoKey: string;
  price: number;
  isActive: boolean;
  isDeleted: boolean;
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    videoKey: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true },
);

courseSchema.index({ isActive: 1, isDeleted: 1 });
courseSchema.index({ createdAt: -1 });

const Course = mongoose.model<ICourse>("Course", courseSchema, "courses");
export default Course;
