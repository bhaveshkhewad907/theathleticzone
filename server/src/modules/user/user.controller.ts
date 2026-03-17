import { Request, Response, NextFunction } from "express";
import User from "./user.model";
import ApiError from "../../utils/apiError";
import AthleteProfile from "../athlete/athleteProfile.model";
import {
  generatePresignedUrl,
  deleteFileFromR2,
  uploadBufferToR2, // 🚀 NEW Import
} from "../../services/r2.service";

export const getMe = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email role profileImage sport title experience",
    );

    if (!user) throw new ApiError(404, "User not found");

    let isProfileLocked = false;
    let sports: string[] = [];
    const userSport = (user as any).sport;
    if (userSport) sports = [userSport.toString()];

    if (user.role === "ATHLETE") {
      const profile = await AthleteProfile.findOne({ user: user._id });
      if (profile) {
        sports =
          profile.sport && profile.sport.length > 0
            ? profile.sport.map((id) => id.toString())
            : [];

        const hasValidAge = profile.age && profile.age > 0;
        const hasValidWeight = profile.weight && profile.weight > 0;
        const hasValidHeight = profile.height && profile.height > 0;
        const hasSport = sports.length > 0;

        isProfileLocked = Boolean(
          hasSport && hasValidAge && hasValidWeight && hasValidHeight,
        );
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        sports,
        isProfileLocked,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicCoaches = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const coaches = await User.find({ role: "COACH" })
      .select("name profileImage title experience")
      .lean();

    res.status(200).json({ success: true, data: coaches });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: any, res: any, next: any) => {
  try {
    const { title, experience, profileImage } = req.body;
    const existingUser = await User.findById(req.user?.id);

    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (
      profileImage &&
      existingUser.profileImage &&
      existingUser.profileImage !== profileImage
    ) {
      const publicDomain = process.env.R2_PUBLIC_DOMAIN as string;
      if (existingUser.profileImage.startsWith(publicDomain)) {
        const oldFileKey = existingUser.profileImage.split(
          `${publicDomain}/`,
        )[1];
        if (oldFileKey) await deleteFileFromR2(oldFileKey);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user?.id,
      { title, experience, profileImage },
      { returnDocument: "after", runValidators: true },
    ).select("-password");

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const getProfileUploadUrl = async (req: any, res: any, next: any) => {
  try {
    const { fileName, contentType, folder } = req.body;
    if (!fileName || !contentType || !folder) {
      throw new ApiError(400, "fileName, contentType, and folder are required");
    }
    const data = await generatePresignedUrl(fileName, contentType, folder);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

// 🚀 NEW: Secure, Server-Side Avatar Upload Controller
export const uploadProfilePicture = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) throw new ApiError(400, "No image file provided.");

    // 1. Fetch the user to check for an old avatar
    const existingUser = await User.findById(req.user?.id);
    if (!existingUser) throw new ApiError(404, "User not found");

    // 2. Safely upload the new 2MB buffer to R2
    const publicAvatarUrl = await uploadBufferToR2(
      req.file.buffer,
      req.file.mimetype,
      "avatars",
    );

    // 3. Delete the old avatar from Cloudflare to save space!
    if (existingUser.profileImage) {
      const publicDomain = process.env.R2_PUBLIC_DOMAIN as string;
      if (existingUser.profileImage.startsWith(publicDomain)) {
        const oldFileKey = existingUser.profileImage.split(
          `${publicDomain}/`,
        )[1];
        if (oldFileKey) {
          // Fire-and-forget deletion so we don't slow down the response
          deleteFileFromR2(oldFileKey).catch((err) => console.error(err));
        }
      }
    }

    // 4. Save the new URL to the user's database record
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: publicAvatarUrl },
      { new: true },
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    // Gracefully handle Multer's File Size Error
    if (error.message === "File too large") {
      return next(
        new ApiError(400, "Image exceeds the 2MB strict size limit."),
      );
    }
    next(error);
  }
};
