import mongoose, { Schema, Document } from "mongoose";

export interface IStep extends Document {
  title: string;
  type: "WARMUP" | "EXERCISE" | "COOLDOWN" | "EDUCATION";
  videoUrl: string; // Cloudflare R2 URL
  durationInSeconds?: number;
}

const StepSchema = new Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["WARMUP", "EXERCISE", "COOLDOWN", "EDUCATION"],
      required: true,
    },
    videoUrl: { type: String, required: true },
    durationInSeconds: { type: Number },
  },
  { timestamps: true },
);

export default mongoose.model<IStep>("Step", StepSchema);
