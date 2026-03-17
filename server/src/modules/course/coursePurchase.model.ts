import mongoose, { Schema, Document } from "mongoose";

export interface ICoursePurchase extends Document {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  priceAtPurchase: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: "PENDING_PAYMENT" | "PURCHASED";
  createdAt: Date;
  updatedAt: Date;
}

const coursePurchaseSchema = new Schema<ICoursePurchase>(
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
    priceAtPurchase: {
      type: Number,
      required: true,
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    status: {
      type: String,
      enum: ["PENDING_PAYMENT", "PURCHASED"],
      default: "PENDING_PAYMENT",
    },
  },
  {
    timestamps: true,
  },
);

// ⚡ PERFORMANCE UPGRADE: Compound Indexes
// This perfectly maps to the exact query executed in coursePurchase.service.ts
coursePurchaseSchema.index({ user: 1, status: 1 });

// Keep these as single-field indexes as they are queried independently
coursePurchaseSchema.index({ course: 1 });
coursePurchaseSchema.index(
  { razorpayOrderId: 1 },
  { unique: true, sparse: true },
);

coursePurchaseSchema.set("toJSON", {
  transform: function (_doc, ret: any) {
    const { razorpayOrderId, razorpayPaymentId, __v, ...cleaned } = ret;
    return cleaned;
  },
});

const CoursePurchase = mongoose.model<ICoursePurchase>(
  "CoursePurchase",
  coursePurchaseSchema,
);

export default CoursePurchase;
