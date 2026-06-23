import mongoose, { Schema, Document } from "mongoose";

export interface IPaymentLedger extends Document {
  user: mongoose.Types.ObjectId;
  amountPaid: number;
  appliedCoupon: string | null;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  createdAt: Date;
}

const paymentLedgerSchema = new Schema<IPaymentLedger>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amountPaid: { type: Number, required: true },
    appliedCoupon: { type: String, default: null },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model<IPaymentLedger>(
  "PaymentLedger",
  paymentLedgerSchema,
);
