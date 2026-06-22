import mongoose, { Schema, Document } from "mongoose";

// 1. STEP MODEL (Individual Exercises/Videos in the Vault)
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

// 2. TEMPLATE MODEL (A Reusable Day's Routine)
export interface ITemplate extends Document {
  name: string;
  description?: string;
  steps: {
    step: mongoose.Types.ObjectId;
    sets?: string;
    reps?: string;
  }[];
}
const templateSchema = new Schema<ITemplate>(
  {
    name: { type: String, required: true },
    description: { type: String },
    steps: [
      {
        step: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Step",
          required: true,
        },
        sets: { type: String, default: "-" },
        reps: { type: String, default: "-" },
      },
    ],
  },
  { timestamps: true },
);
export const Template = mongoose.model<ITemplate>("Template", templateSchema);

// 3. COURSE PLAN MODEL (Mapping templates to days for a specific course)
export interface ICoursePlan extends Document {
  courseId: mongoose.Types.ObjectId;
  days: {
    dayNumber: number;
    morning: {
      isRest: boolean;
      templateId?: mongoose.Types.ObjectId | null;
    };
    evening: {
      isRest: boolean;
      templateId?: mongoose.Types.ObjectId | null;
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
          templateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Template",
            default: null,
          },
        },
        // 🌙 EVENING BLOCK
        evening: {
          isRest: { type: Boolean, default: false },
          templateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Template",
            default: null,
          },
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
