import { Request, Response, NextFunction, RequestHandler } from "express";
import User from "./user.model";
import ApiError from "../../utils/apiError";
import { deleteFileFromR2, uploadBufferToR2 } from "../../services/r2.service";
import { AuthenticatedRequest } from "../../types/auth.types";

export const getMe: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = await User.findById(authReq.user.id).select(
      "name email role profileImage platformState personalInfo",
    );

    if (!user) throw new ApiError(404, "User not found");

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as AuthenticatedRequest;

    // 🚀 ARCHITECTURE FIX: This endpoint now cleanly handles text-based profile updates
    // Avatar logic is strictly isolated to `uploadProfilePicture`.
    const { name, personalInfo } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      authReq.user.id,
      { $set: { name, personalInfo } },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) throw new ApiError(404, "User not found");

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const uploadProfilePicture: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authReq = req as AuthenticatedRequest;
    if (!req.file) throw new ApiError(400, "No image file provided.");

    const existingUser = await User.findById(authReq.user.id);
    if (!existingUser) throw new ApiError(404, "User not found");

    const publicAvatarUrl = await uploadBufferToR2(
      req.file.buffer,
      req.file.mimetype,
      "avatars",
    );

    // Clean up old avatar from R2
    if (existingUser.profileImage) {
      const publicDomain = process.env.R2_PUBLIC_DOMAIN as string;
      if (existingUser.profileImage.startsWith(publicDomain)) {
        const oldFileKey = existingUser.profileImage.split(
          `${publicDomain}/`,
        )[1];
        if (oldFileKey) {
          deleteFileFromR2(oldFileKey).catch((err) =>
            console.error("R2 Cleanup Error:", err),
          );
        }
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      authReq.user.id,
      { profileImage: publicAvatarUrl },
      { new: true },
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    if (error.message === "File too large") {
      return next(
        new ApiError(400, "Image exceeds the 2MB strict size limit."),
      );
    }
    next(error);
  }
};
