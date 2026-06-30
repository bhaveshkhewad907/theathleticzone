import mongoose, { Schema, Document } from "mongoose";

// ==========================================
// 1. STEP MODEL (The Content Vault)
// ==========================================
export interface IStep extends Document {
  title: string;
  type: "WARMUP" | "EXERCISE" | "COOLDOWN" | "EDUCATION";
  videoUrl: string;
}
const stepSchema = new Schema<IStep>(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["WARMUP", "EXERCISE", "COOLDOWN", "EDUCATION"],
      required: true,
    },
    videoUrl: { type: String, required: true },
  },
  { timestamps: true },
);
export const Step = mongoose.model<IStep>("Step", stepSchema);

// ==========================================
// 🚀 REUSABLE STEP STRUCTURE (For both Templates and Plans)
// ==========================================
const inlineStepSchema = new Schema(
  {
    step: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Step",
      required: true,
    },
    sets: { type: String, default: "-" },
    reps: { type: String, default: "-" },
    // 🚀 NEW: Programming Variables
    intensityType: {
      type: String,
      enum: ["Effort", "Load", "Custom", "None"],
      default: "None",
    },
    intensityValue: { type: String, default: "-" },
    recovery: { type: String, default: "-" },
  },
  { _id: false }, // Prevent Mongoose from making sub-IDs for every single row
);

// ==========================================
// 2. TEMPLATE MODEL (The Blueprint)
// ==========================================
export interface ITemplate extends Document {
  name: string;
  description?: string;
  steps: {
    step: mongoose.Types.ObjectId;
    sets?: string;
    reps?: string;
    intensityType?: "Effort" | "Load" | "Custom" | "None";
    intensityValue?: string;
    recovery?: string;
  }[];
}
const templateSchema = new Schema<ITemplate>(
  {
    name: { type: String, required: true },
    description: { type: String },
    steps: [inlineStepSchema], // Uses the new comprehensive step schema
  },
  { timestamps: true },
);
export const Template = mongoose.model<ITemplate>("Template", templateSchema);

// ==========================================
// 3. COURSE PLAN MODEL (The Editable Instance)
// ==========================================
export interface ICoursePlan extends Document {
  courseId: mongoose.Types.ObjectId;
  days: {
    dayNumber: number;
    morning: {
      isRest: boolean;
      templateRefName?: string; // Remembers what blueprint was used to create this
      steps: {
        step: mongoose.Types.ObjectId;
        sets?: string;
        reps?: string;
        intensityType?: "Effort" | "Load" | "Custom" | "None";
        intensityValue?: string;
        recovery?: string;
      }[];
    };
    evening: {
      isRest: boolean;
      templateRefName?: string;
      steps: {
        step: mongoose.Types.ObjectId;
        sets?: string;
        reps?: string;
        intensityType?: "Effort" | "Load" | "Custom" | "None";
        intensityValue?: string;
        recovery?: string;
      }[];
    };
  }[];
}

const coursePlanSchema = new Schema<ICoursePlan>(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      unique: true,
    },
    days: [
      {
        dayNumber: { type: Number, required: true },
        // ☀️ MORNING BLOCK
        morning: {
          isRest: { type: Boolean, default: false },
          templateRefName: { type: String, default: "" }, // 🚀 Tracks origin instead of locking to ID
          steps: [inlineStepSchema], // 🚀 Inline array allows per-day, per-week editing!
        },
        // 🌙 EVENING BLOCK
        evening: {
          isRest: { type: Boolean, default: false },
          templateRefName: { type: String, default: "" },
          steps: [inlineStepSchema],
        },
      },
    ],
  },
  { timestamps: true },
);
export const CoursePlan = mongoose.model<ICoursePlan>(
  "CoursePlan",
  coursePlanSchema,
);
