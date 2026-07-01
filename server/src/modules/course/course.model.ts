import mongoose, { Schema, Document } from "mongoose";

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
    videoUrl?: string; // 🚀 FIX: Added Intro Reel URL support
    tier: "Beginner" | "Intermediate" | "Advanced"; // 🚀 FIX: Aligned with frontend

    // 🚀 THE BOLD FIX: "Technique" completely removed from the TypeScript interface
    targetDeficit: "Strength" | "Power" | "Mobility" | "Seasonal";
  };

  isDeleted: boolean;
  cycleType: "Linear" | "Off-Season" | "Pre-Season" | "In-Season";
  defaultNextCourseId?: mongoose.Schema.Types.ObjectId;
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
      videoUrl: { type: String }, // 🚀 FIX: Database will now save this
      tier: {
        type: String,
        enum: ["Beginner", "Intermediate"],
        required: true,
      },
      targetDeficit: {
        type: String,
        // 🚀 ALIGNED: Matches the TypeScript interface perfectly
        enum: ["Strength", "Power", "Mobility"],
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

courseSchema.index({ isDeleted: 1 });
courseSchema.index({ "meta.tier": 1, "meta.targetDeficit": 1 });

const Course = mongoose.model<ICourse>("Course", courseSchema, "courses");
export default Course;
