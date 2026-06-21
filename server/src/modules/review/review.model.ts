import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  rating: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    content: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true },
);

// 🚀 PERFORMANCE FIX: Indexes applied for instant DB lookups
reviewSchema.index({ user: 1 });
reviewSchema.index({ createdAt: -1 });

export default mongoose.model<IReview>("Review", reviewSchema);
