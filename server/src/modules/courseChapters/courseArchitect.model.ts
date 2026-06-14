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
  steps: mongoose.Types.ObjectId[];
}
const templateSchema = new Schema<ITemplate>(
  {
    name: { type: String, required: true },
    description: { type: String },
    steps: [{ type: mongoose.Schema.Types.ObjectId, ref: "Step" }],
  },
  { timestamps: true },
);
export const Template = mongoose.model<ITemplate>("Template", templateSchema);

// 3. COURSE PLAN MODEL (Mapping templates to days for a specific course)
export interface ICoursePlan extends Document {
  courseId: mongoose.Types.ObjectId;
  days: { dayNumber: number; templateId: mongoose.Types.ObjectId }[];
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
        templateId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Template",
          required: true,
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
