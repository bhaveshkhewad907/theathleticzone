import mongoose, { Schema, Document } from "mongoose";

// Sub-interfaces for the deeply nested Curriculum
interface IWorkout {
  videoUrl: string;
  title: string;
  sets: number;
  reps: string;
  restNotes: string;
}

interface IDay {
  dayNumber: number;
  focus: string;
  workouts: IWorkout[];
}

interface IWeek {
  weekNumber: number;
  days: IDay[];
}

export interface ICourse extends Document {
  meta: {
    title: string;
    description: string;
    coverImageUrl: string;
    tier: "Beginner" | "Intermediate" | "Elite";
    targetDeficit: "Strength" | "Power" | "Mobility" | "Technique" | "Seasonal";
  };

  isDeleted: boolean;

  // Progression Logic
  cycleType: "Linear" | "Off-Season" | "Pre-Season" | "In-Season";
  defaultNextCourseId?: mongoose.Types.ObjectId;

  // The Actual Curriculum
  weeks: IWeek[];

  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    meta: {
      title: { type: String, required: true, trim: true },
      description: { type: String, required: true },
      coverImageUrl: { type: String, required: true },
      tier: {
        type: String,
        enum: ["Beginner", "Intermediate", "Elite"],
        required: true,
      },
      targetDeficit: {
        type: String,
        enum: ["Strength", "Power", "Mobility", "Technique", "Seasonal"],
        required: true,
      },
    },

    isDeleted: { type: Boolean, default: false },

    cycleType: {
      type: String,
      enum: ["Linear", "Off-Season", "Pre-Season", "In-Season"],
      default: "Linear",
    },
    defaultNextCourseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },

    weeks: [
      {
        weekNumber: { type: Number, required: true },
        days: [
          {
            dayNumber: { type: Number, required: true },
            focus: { type: String, required: true },
            workouts: [
              {
                videoUrl: { type: String, required: true },
                title: { type: String, required: true },
                sets: { type: Number },
                reps: { type: String },
                restNotes: { type: String },
              },
            ],
          },
        ],
      },
    ],
  },
  { timestamps: true },
);

courseSchema.index({ isActive: 1, isDeleted: 1 });
courseSchema.index({ "meta.tier": 1, "meta.targetDeficit": 1 });

const Course = mongoose.model<ICourse>("Course", courseSchema, "courses");
export default Course;
