import mongoose, { Schema, Document } from "mongoose";

export interface ISport extends Document {
  name: string;
  isActive: boolean;
  description: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const sportSchema = new Schema<ISport>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Sport = mongoose.model<ISport>("Sport", sportSchema);

export default Sport;
