import mongoose, { Schema, Document } from "mongoose";

export interface ILiveSessionConfig extends Document {
  group: {
    ONE_MONTH: number;
    THREE_MONTHS: number;
    SIX_MONTHS: number;
    YEARLY: number;
  };
  oneOnOne: {
    ONE_MONTH: number;
    THREE_MONTHS: number;
    SIX_MONTHS: number;
    YEARLY: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const planPricingSchema = new Schema(
  {
    ONE_MONTH: { type: Number, required: true, min: 0 },
    THREE_MONTHS: { type: Number, required: true, min: 0 },
    SIX_MONTHS: { type: Number, required: true, min: 0 },
    YEARLY: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const liveSessionConfigSchema = new Schema<ILiveSessionConfig>(
  {
    group: {
      type: planPricingSchema,
      required: true,
    },
    oneOnOne: {
      type: planPricingSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const LiveSessionConfig = mongoose.model<ILiveSessionConfig>(
  "LiveSessionConfig",
  liveSessionConfigSchema,
);

export default LiveSessionConfig;
