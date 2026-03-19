import { RequestHandler } from "express";
import {
  generateGroupSuggestions,
  getPendingOneOnOneRequests,
} from "./groupSuggestion.service";
import { getAdminDashboard } from "./adminDashboard.service";
import { getAllCoaches, getAllSports } from "./admin.service";
import { getAdminSessions } from "./adminSession.service";
import crypto from "crypto";
import CoachInvitation from "./coachInvitation.model";
import ApiError from "../../utils/apiError";
import { AuthenticatedRequest } from "../../types/auth.types";
import { sendCoachInviteEmail } from "../../services/email.service";
import User from "../user/user.model";

export const generateGroups: RequestHandler = async (_req, res, next) => {
  try {
    const suggestions = await generateGroupSuggestions();

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    next(error);
  }
};

export const dashboard: RequestHandler = async (_req, res, next) => {
  try {
    const data = await getAdminDashboard();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getCoaches: RequestHandler = async (req, res, next) => {
  try {
    // Just fetch all coaches. No populate needed!
    const coaches = await User.find({ role: "COACH" }).select("-password");

    const formattedCoaches = coaches.map((coach: any) => ({
      _id: coach._id,
      name: coach.name,
      email: coach.email,
    }));

    res.status(200).json({
      success: true,
      data: formattedCoaches,
    });
  } catch (error) {
    next(error);
  }
};

export const getSports: RequestHandler = async (_req, res, next) => {
  try {
    const sports = await getAllSports();

    res.status(200).json({
      success: true,
      data: sports,
    });
  } catch (error) {
    next(error);
  }
};

export const sessions: RequestHandler = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as "SCHEDULED" | "COMPLETED" | undefined;

    const data = await getAdminSessions(page, limit, status);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const inviteCoach: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest;

    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    const existingInvite = await CoachInvitation.findOne({ email });

    if (existingInvite) {
      if (existingInvite.expiresAt > new Date()) {
        throw new ApiError(
          400,
          "An active invitation already exists for this email",
        );
      }

      // If expired → regenerate instead of creating new document
      existingInvite.token = crypto.randomBytes(32).toString("hex");
      existingInvite.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await existingInvite.save();

      const inviteLink = `${process.env.CLIENT_URL}/accept-coach-invite?token=${existingInvite.token}`;

      await sendCoachInviteEmail(email, inviteLink);

      return res.status(200).json({
        success: true,
        message: "Expired invitation regenerated and sent",
      });
    }

    if (!authReq.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await CoachInvitation.create({
      email,
      token,
      expiresAt,
      createdBy: authReq.user._id,
    });

    const inviteLink = `${process.env.CLIENT_URL}/accept-coach-invite?token=${token}`;

    await sendCoachInviteEmail(email, inviteLink);

    res.status(201).json({
      success: true,
      message: "Invitation email sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const resendCoachInvite: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    const invitation = await CoachInvitation.findOne({ email });

    if (!invitation) {
      throw new ApiError(404, "No invitation found for this email");
    }

    const now = new Date();

    if (invitation.expiresAt < now) {
      invitation.token = crypto.randomBytes(32).toString("hex");
      invitation.expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      await invitation.save();
    }

    const inviteLink = `${process.env.CLIENT_URL}/accept-coach-invite?token=${invitation.token}`;

    await sendCoachInviteEmail(email, inviteLink);

    res.status(200).json({
      success: true,
      message: "Invitation resent successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getCoachInvitations: RequestHandler = async (_req, res, next) => {
  try {
    const invitations = await CoachInvitation.find()
      .sort({ createdAt: -1 })
      .lean();

    const now = new Date();

    const formatted = invitations.map((invite) => {
      // 🚀 THE FIX: If the database says ACCEPTED, do not overwrite it!
      if (invite.status === "ACCEPTED") {
        return invite;
      }

      // Otherwise, calculate if it is PENDING or EXPIRED based on the clock
      return {
        ...invite,
        status: invite.expiresAt > now ? "PENDING" : "EXPIRED",
      };
    });

    res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

export const revokeCoachInvite: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const invitation = await CoachInvitation.findById(id);

    if (!invitation) {
      throw new ApiError(404, "Invitation not found");
    }

    await invitation.deleteOne();

    res.status(200).json({
      success: true,
      message: "Invitation revoked successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getPendingOneOnOne: RequestHandler = async (req, res, next) => {
  try {
    const data = await getPendingOneOnOneRequests();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
