import mongoose, { Schema, Document } from "mongoose";

export interface IDayTemplate extends Document {
  name: string;
  description?: string;
  steps: mongoose.Types.ObjectId[]; // Preserves order implicitly via array index
}

const DayTemplateSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    // Array of references maintains exact sequence
    steps: [{ type: Schema.Types.ObjectId, ref: "Step" }],
  },
  { timestamps: true },
);

export default mongoose.model<IDayTemplate>("DayTemplate", DayTemplateSchema);
