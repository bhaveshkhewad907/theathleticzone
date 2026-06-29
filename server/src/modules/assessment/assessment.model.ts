import mongoose, { Schema, Document } from "mongoose";

export interface IAssessment extends Document {
  userId: mongoose.Types.ObjectId;

  // 🚀 Absorbed from legacy AthleteProfile/User
  physical: {
    age: number;
    heightCm: number;
    bodyweightKg: number;
    trainingAgeYears: number;
    trainingAgeMonths?: number;
  };

  // 🏃‍♂️ Core Sprint Metrics
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
      sprint100mSeconds?: number; // 🚀 NEW
      sprint200mSeconds?: number; // 🚀 NEW
      sprintVideoUrl?: string;
    };
    strength: {
      backSquatMaxKg: number;
    };
  };

  // 🤖 The Automated Recommendation Engine Output
  engineResult: {
    assignedCourseId: mongoose.Types.ObjectId;
    assignedLevel: string; // e.g., "Beginner Level 2"
    identifiedDeficit: string; // e.g., "Power"
  };

  // 🛡️ Optional Admin Override (Phase 6 Requirement)
  adminOverride?: {
    overriddenBy: mongoose.Types.ObjectId;
    reason: string;
    newCourseId: mongoose.Types.ObjectId;
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

    physical: {
      age: { type: Number, required: true },
      heightCm: { type: Number, required: true },
      bodyweightKg: { type: Number, required: true },
      trainingAgeYears: { type: Number, required: true },
      trainingAgeMonths: { type: Number, default: 0 },
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
        sprint100mSeconds: { type: Number },
        sprint200mSeconds: { type: Number },
        sprintVideoUrl: { type: String }, // Optional, if upload fails
      },
      strength: {
        backSquatMaxKg: { type: Number, required: true },
      },
    },

    engineResult: {
      assignedCourseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      assignedLevel: { type: String },
      identifiedDeficit: { type: String },
    },

    adminOverride: {
      overriddenBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reason: { type: String },
      newCourseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    },
  },
  { timestamps: true },
);

// Index to quickly fetch an athlete's assessment history chronologically
assessmentSchema.index({ userId: 1, createdAt: -1 });

const Assessment = mongoose.model<IAssessment>(
  "Assessment",
  assessmentSchema,
  "assessments",
);
export default Assessment;
