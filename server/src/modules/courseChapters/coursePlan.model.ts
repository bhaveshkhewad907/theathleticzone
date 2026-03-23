import mongoose, { Schema, Document } from "mongoose";

export interface ICoursePlan extends Document {
  courseId: mongoose.Types.ObjectId;
  days: {
    dayNumber: number;
    templateId: mongoose.Types.ObjectId;
  }[];
}

const CoursePlanSchema = new Schema(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      unique: true,
    },
    days: [
      {
        dayNumber: { type: Number, required: true },
        templateId: {
          type: Schema.Types.ObjectId,
          ref: "DayTemplate",
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model<ICoursePlan>("CoursePlan", CoursePlanSchema);
