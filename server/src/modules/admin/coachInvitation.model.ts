import mongoose, { Schema, Document } from "mongoose";

export interface ICoachInvitation extends Document {
  email: string;
  sports: mongoose.Types.ObjectId[];
  token: string;
  expiresAt: Date;
  status: "PENDING" | "ACCEPTED" | "EXPIRED";
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const coachInvitationSchema = new Schema<ICoachInvitation>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    sports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sport",
        required: true,
      },
    ],
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "EXPIRED"],
      default: "PENDING",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// Auto-expire invitations (Mongo TTL index)
coachInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const CoachInvitation = mongoose.model<ICoachInvitation>(
  "CoachInvitation",
  coachInvitationSchema,
);

export default CoachInvitation;
