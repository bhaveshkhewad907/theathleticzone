import mongoose, { Schema, Document } from "mongoose";

export interface IAthleteProfile extends Document {
  user: mongoose.Types.ObjectId;
  sport: mongoose.Types.ObjectId[];
  age: number;
  height: number;
  weight: number;
}

const athleteProfileSchema = new Schema<IAthleteProfile>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Ensures one profile per athlete
    },
    sport: [{ type: Schema.Types.ObjectId, ref: "Sport" }],
    age: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model<IAthleteProfile>(
  "AthleteProfile",
  athleteProfileSchema,
);
