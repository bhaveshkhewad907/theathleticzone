import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  passwordResetOTP: String | null;
  passwordResetExpires: Date | null;
  role: "ADMIN" | "COACH" | "ATHLETE";
  isVerified: boolean;
  verificationOTP?: string | null;
  verificationExpires?: Date | null;
  profileImage?: string;
  title: { type: String; default: "Technical Commander" };
  experience: { type: String; default: "Elite Tier" };
  sports?: mongoose.Types.ObjectId[];
  provider: "LOCAL" | "GOOGLE";
  refreshTokens: {
    token: string;
    expiresAt: Date;
  }[];
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
    },
    passwordResetOTP: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ["ADMIN", "COACH", "ATHLETE"],
      default: "ATHLETE",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationOTP: {
      type: String,
      default: null,
    },
    verificationExpires: {
      type: Date,
      default: null,
    },
    profileImage: {
      type: String,
    },
    title: {
      type: String,
      default: "Technical Commander",
    },
    experience: {
      type: String,
      default: "Elite Tier",
    },
    sports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sport",
      },
    ],
    provider: {
      type: String,
      enum: ["LOCAL", "GOOGLE"],
      default: "LOCAL",
    },

    refreshTokens: [
      {
        token: String,
        expiresAt: Date,
      },
    ],
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);
// Explicit indexes for performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

// Remove sensitive fields automatically
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
