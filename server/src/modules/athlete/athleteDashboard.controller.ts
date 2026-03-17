import { RequestHandler } from "express";
import { getAthleteDashboard } from "./athleteDashboard.service";
import {
  getAthleteAttendanceSummary,
  getAthleteAttendanceHistory,
} from "../attendence/attendence.service";
import AthleteProfile from "./athleteProfile.model";
import { athleteJoinSession } from "../attendence/attendence.service";

export const dashboard: RequestHandler = async (req: any, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Fetch dashboard data (Upcoming Session & Attendance) from your service
    const dashboardData = await getAthleteDashboard(userId);

    // 2. Fetch the biometric profile from MongoDB
    const profile = await AthleteProfile.findOne({ user: userId });

    // 3. Combine them all into one clean response
    res.status(200).json({
      success: true,
      data: {
        ...dashboardData, // This spreads upcomingSession and attendanceSummary automatically
        profile: profile || null, // Adds the new profile data
      },
    });
  } catch (error) {
    next(error);
  }
};

export const attendanceSummary: RequestHandler = async (
  req: any,
  res,
  next,
) => {
  try {
    const summary = await getAthleteAttendanceSummary(req.user.id);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

export const attendanceHistory: RequestHandler = async (
  req: any,
  res,
  next,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const history = await getAthleteAttendanceHistory(req.user.id, page, limit);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

// Add this to your existing exports:
export const joinSession: RequestHandler = async (req: any, res, next) => {
  try {
    const { sessionId } = req.params;

    // This records the timestamp and calculates PRESENT or LATE
    const meetingLink = await athleteJoinSession(sessionId, req.user.id);

    res.status(200).json({
      success: true,
      data: { meetingLink },
    });
  } catch (error) {
    next(error);
  }
};
