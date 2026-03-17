import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  rating: number;
  content: string;
  sport: string; // 🛡️ NEW: Captures the athlete's sector
}

const reviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    content: { type: String, required: true, maxlength: 500 },
    sport: { type: String, required: true, maxlength: 100 }, // 🛡️ NEW
  },
  { timestamps: true },
);

export default mongoose.model<IReview>("Review", reviewSchema);
