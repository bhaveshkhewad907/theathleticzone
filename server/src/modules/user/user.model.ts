import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  // Existing Auth Fields
  name: string;
  email: string;
  password?: string;
  passwordResetOTP: string | null;
  passwordResetExpires: Date | null;
  role: "ADMIN" | "COACH" | "ATHLETE";
  isVerified: boolean;
  verificationOTP?: string | null;
  verificationExpires?: Date | null;
  profileImage?: string;
  provider: "LOCAL" | "GOOGLE";
  refreshTokens: {
    token: string;
    expiresAt: Date;
  }[];
  isBlocked: boolean;
  invitationToken?: string;
  invitationExpires?: Date;

  // 🚀 NEW: Sprint Platform Fields
  personalInfo: {
    gender?: "Male" | "Female" | "Other";
    dateOfBirth?: Date;
    bodyweightKg?: number;
    trainingAgeYears?: number;
  };
  subscription: {
    isActive: boolean;
    planId?: string;
    renewalDate?: Date;
  };
  platformState: {
    status: "NEEDS_ASSESSMENT" | "UNDER_REVIEW" | "ACTIVE_TRAINING";
    activeCourseId?: mongoose.Types.ObjectId;
    nextCourseId?: mongoose.Types.ObjectId;
  };
  assessmentHistory: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String },
    passwordResetOTP: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
    role: {
      type: String,
      enum: ["ADMIN", "COACH", "ATHLETE"],
      default: "ATHLETE",
    },
    isVerified: { type: Boolean, default: false },
    verificationOTP: { type: String, default: null },
    verificationExpires: { type: Date, default: null },
    profileImage: { type: String },
    provider: { type: String, enum: ["LOCAL", "GOOGLE"], default: "LOCAL" },
    refreshTokens: [{ token: String, expiresAt: Date }],
    isBlocked: { type: Boolean, default: false },
    invitationToken: { type: String },
    invitationExpires: { type: Date },

    // 🚀 NEW: Embedded Sub-Documents
    personalInfo: {
      gender: { type: String, enum: ["Male", "Female", "Other"] },
      dateOfBirth: { type: Date },
      bodyweightKg: { type: Number },
      trainingAgeYears: { type: Number },
    },
    subscription: {
      isActive: { type: Boolean, default: false },
      planId: { type: String },
      renewalDate: { type: Date },
    },
    platformState: {
      status: {
        type: String,
        enum: ["NEEDS_ASSESSMENT", "UNDER_REVIEW", "ACTIVE_TRAINING"],
        default: "NEEDS_ASSESSMENT",
      },
      activeCourseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      nextCourseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    },
    assessmentHistory: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Assessment" },
    ],
  },
  { timestamps: true },
);

// Explicit indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ "platformState.status": 1 });

// Remove sensitive fields automatically before sending to frontend
userSchema.set("toJSON", {
  transform: function (_doc, ret: any) {
    const {
      password,
      refreshTokens,
      invitationToken,
      invitationExpires,
      __v,
      ...cleaned
    } = ret;
    return cleaned;
  },
});

const User = mongoose.model<IUser>("User", userSchema);
export default User;
