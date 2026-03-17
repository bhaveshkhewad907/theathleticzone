import { Request, Response, NextFunction } from "express";
import AthleteProfile from "./athleteProfile.model";
import User from "../user/user.model"; // 👈 CRITICAL: Import User model
import ApiError from "../../utils/apiError";

export const getProfile = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    let profile = await AthleteProfile.findOne({ user: req.user.id });

    // If no profile exists yet, return an empty default structure
    if (!profile) {
      profile = await AthleteProfile.create({ user: req.user.id });
    }

    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 👇 Grab 'sports' (the array) instead of the old 'sport' string
    const { sports, age, height, weight } = req.body;

    // 1. Update the Athlete Profile biometrics
    const profile = await AthleteProfile.findOneAndUpdate(
      { user: req.user.id },
      { sport: sports, age, height, weight }, // 👈 Save as sports array
      { new: true, upsert: true },
    );

    // 2. 👇 CRITICAL SYNC: Update the core User identity!
    // This tells the system the Google SSO user has successfully selected a sector
    if (sports && sports.length > 0) {
      await User.findByIdAndUpdate(req.user.id, { sports });
    }

    res.status(200).json({
      success: true,
      message: "Biometric data synchronized successfully.",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};
