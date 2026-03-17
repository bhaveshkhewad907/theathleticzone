import mongoose, { Schema, Document } from "mongoose";
import { SessionStatus } from "./sessionStatus";

export interface ISchedule extends Document {
  type: "ONE_ON_ONE" | "GROUP";
  sport: mongoose.Types.ObjectId;
  coach: mongoose.Types.ObjectId;
  athletes: mongoose.Types.ObjectId[];
  relatedSubscriptions: mongoose.Types.ObjectId[];
  scheduledDate: Date;
  scheduledTime: string; // e.g., "06:30 AM"
  meetingLink: string;
  status: SessionStatus;
  notes?: {
    summary: string;
    intensity: "LOW" | "MEDIUM" | "HIGH";
    coachFeedback: {
      athlete: mongoose.Types.ObjectId;
      feedback: string;
    }[];
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  attendance: {
    athlete: mongoose.Types.ObjectId;
    joinedAt?: Date;
    leftAt?: Date;
    durationMinutes?: number;
    status: "PRESENT" | "LATE" | "NO_SHOW";
  }[];
  coachJoinedAt?: Date;
  coachLeftAt?: Date;
}

const scheduleSchema = new Schema<ISchedule>(
  {
    type: {
      type: String,
      enum: ["ONE_ON_ONE", "GROUP"],
      required: true,
    },
    sport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sport",
      required: true,
    },
    coach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    athletes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    relatedSubscriptions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LiveSubscription",
      },
    ],
    scheduledDate: {
      type: Date,
      required: true,
    },
    scheduledTime: {
      type: String,
      required: true,
    },
    meetingLink: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SessionStatus),
      default: SessionStatus.SCHEDULED,
    },
    notes: {
      summary: { type: String },
      intensity: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH"],
      },
      coachFeedback: [
        {
          athlete: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          feedback: String,
        },
      ],
      createdAt: Date,
    },
    attendance: [
      {
        athlete: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        joinedAt: Date,
        leftAt: Date,
        durationMinutes: Number,
        status: {
          type: String,
          enum: ["PRESENT", "LATE", "NO_SHOW"],
          default: "NO_SHOW",
        },
      },
    ],
    coachJoinedAt: Date,
    coachLeftAt: Date,
  },
  {
    timestamps: true,
  },
);

// Prevent coach double booking (DB-level protection)
scheduleSchema.index(
  { coach: 1, scheduledDate: 1, scheduledTime: 1 },
  { unique: true },
);

// Coach dashboard queries
scheduleSchema.index({ coach: 1, scheduledDate: 1 });

// Athlete dashboard queries
scheduleSchema.index({ athletes: 1, scheduledDate: 1 });

// Admin tomorrow sessions
scheduleSchema.index({ scheduledDate: 1, status: 1 });
scheduleSchema.index({ "attendance.athlete": 1, status: 1 });
// Lookup by subscription
scheduleSchema.index({ relatedSubscriptions: 1 });

const Schedule = mongoose.model<ISchedule>("Schedule", scheduleSchema);

export default Schedule;
