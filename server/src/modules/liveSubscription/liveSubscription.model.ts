import mongoose, { Schema, Document } from "mongoose";

export type SubscriptionType = "GROUP" | "ONE_ON_ONE";
export type SubscriptionPlan =
  | "ONE_MONTH"
  | "THREE_MONTHS"
  | "SIX_MONTHS"
  | "YEARLY";

export interface ILiveSubscription extends Document {
  user: mongoose.Types.ObjectId;
  type: SubscriptionType;
  plan: SubscriptionPlan;
  priceAtPurchase: number;
  startDate: Date;
  endDate: Date;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: "PENDING_PAYMENT" | "ACTIVE" | "EXPIRED";

  renewalOrderId?: string;
  pendingRenewalPlan?: "ONE_MONTH" | "THREE_MONTHS" | "SIX_MONTHS" | "YEARLY";
  renewalStatus?: "PENDING" | "COMPLETED";

  createdAt: Date;
  updatedAt: Date;
}

const liveSubscriptionSchema = new Schema<ILiveSubscription>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["GROUP", "ONE_ON_ONE"],
      required: true,
    },
    plan: {
      type: String,
      enum: ["ONE_MONTH", "THREE_MONTHS", "SIX_MONTHS", "YEARLY"],
      required: true,
    },
    priceAtPurchase: {
      type: Number,
      required: true,
    },
    renewalOrderId: {
      type: String,
    },

    pendingRenewalPlan: {
      type: String,
      enum: ["ONE_MONTH", "THREE_MONTHS", "SIX_MONTHS", "YEARLY"],
    },

    renewalStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED"],
    },

    startDate: Date,
    endDate: Date,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    status: {
      type: String,
      enum: ["PENDING_PAYMENT", "ACTIVE", "EXPIRED"],
      default: "PENDING_PAYMENT",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes

// Fast dashboard queries
liveSubscriptionSchema.index({ user: 1, status: 1 });

// Expiry checks
liveSubscriptionSchema.index({ endDate: 1 });

// Razorpay lookup
liveSubscriptionSchema.index({ razorpayOrderId: 1 });

// Prevent duplicate ACTIVE subscription of same type per user
liveSubscriptionSchema.index(
  { user: 1, type: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "ACTIVE" },
  },
);

// Sanitization
liveSubscriptionSchema.set("toJSON", {
  transform: function (_doc, ret: any) {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      renewalOrderId,
      pendingRenewalPlan,
      renewalStatus,
      __v,
      ...cleaned
    } = ret;
    return cleaned;
  },
});

const LiveSubscription = mongoose.model<ILiveSubscription>(
  "LiveSubscription",
  liveSubscriptionSchema,
);

export default LiveSubscription;
