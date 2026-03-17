import mongoose, { Schema, Document } from "mongoose";

export interface IAvailability extends Document {
  subscription: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  availableForDate: Date;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const availabilitySchema = new Schema<IAvailability>(
  {
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveSubscription",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    availableForDate: {
      type: Date,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate daily availability per subscription
availabilitySchema.index(
  { subscription: 1, availableForDate: 1 },
  { unique: true },
);

// Admin queries (tomorrow availability)
availabilitySchema.index({ availableForDate: 1 });

// Athlete history lookup
availabilitySchema.index({ user: 1, availableForDate: 1 });

const Availability = mongoose.model<IAvailability>(
  "Availability",
  availabilitySchema,
);

export default Availability;
