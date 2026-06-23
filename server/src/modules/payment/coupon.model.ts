import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  discountPercentage: number;
  isActive: boolean;
  currentUses: number;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    currentUses: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// 🚀 PERFORMANCE: Index the code for lightning-fast lookups during checkout
couponSchema.index({ code: 1, isActive: 1 });

export default mongoose.model<ICoupon>("Coupon", couponSchema);
