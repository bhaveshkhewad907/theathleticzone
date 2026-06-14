import mongoose, { Schema, Document } from "mongoose";

export interface IAssessment extends Document {
  userId: mongoose.Types.ObjectId;
  status: "PENDING" | "COMPLETED" | "REJECTED";

  metrics: {
    mobility: {
      kneeToWallCm: number;
      deepSquatHold: "Good" | "Acceptable" | "Poor";
    };
    power: {
      broadJumpMeters: number;
      verticalJumpCm: number;
    };
    sprinting: {
      sprint30mSeconds: number;
      sprintVideoUrl?: string;
    };
    strength: {
      backSquatMaxKg: number;
    };
  };

  adminReview?: {
    reviewedBy: mongoose.Types.ObjectId;
    reviewedAt: Date;
    assignedDeficit: string;
    assignedCourseId: mongoose.Types.ObjectId;
    nextCourseId: mongoose.Types.ObjectId;
    coachNotes?: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

const assessmentSchema = new Schema<IAssessment>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "REJECTED"],
      default: "PENDING",
    },

    metrics: {
      mobility: {
        kneeToWallCm: { type: Number, required: true },
        deepSquatHold: {
          type: String,
          enum: ["Good", "Acceptable", "Poor"],
          required: true,
        },
      },
      power: {
        broadJumpMeters: { type: Number, required: true },
        verticalJumpCm: { type: Number, required: true },
      },
      sprinting: {
        sprint30mSeconds: { type: Number, required: true },
        sprintVideoUrl: { type: String }, // Optional, in case upload fails but metrics exist
      },
      strength: {
        backSquatMaxKg: { type: Number, required: true },
      },
    },

    adminReview: {
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reviewedAt: { type: Date },
      assignedDeficit: { type: String },
      assignedCourseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      nextCourseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      coachNotes: { type: String },
    },
  },
  { timestamps: true },
);

// Indexes to help the Admin Dashboard load "Pending" assessments instantly
assessmentSchema.index({ status: 1, createdAt: -1 });
assessmentSchema.index({ userId: 1 });

const Assessment = mongoose.model<IAssessment>(
  "Assessment",
  assessmentSchema,
  "assessments",
);
export default Assessment;
