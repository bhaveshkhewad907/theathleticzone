import { Request, Response, NextFunction } from "express";
import User from "./user.model";
import ApiError from "../../utils/apiError";
import {
  generatePresignedUrl,
  deleteFileFromR2,
  uploadBufferToR2,
} from "../../services/r2.service";

export const getMe = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user.id).select(
      "name email role profileImage platformState",
    );

    if (!user) throw new ApiError(404, "User not found");

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: any, res: any, next: any) => {
  try {
    const { profileImage } = req.body;
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
      { profileImage },
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

export const uploadProfilePicture = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) throw new ApiError(400, "No image file provided.");

    const existingUser = await User.findById(req.user?.id);
    if (!existingUser) throw new ApiError(404, "User not found");

    const publicAvatarUrl = await uploadBufferToR2(
      req.file.buffer,
      req.file.mimetype,
      "avatars",
    );

    if (existingUser.profileImage) {
      const publicDomain = process.env.R2_PUBLIC_DOMAIN as string;
      if (existingUser.profileImage.startsWith(publicDomain)) {
        const oldFileKey = existingUser.profileImage.split(
          `${publicDomain}/`,
        )[1];
        if (oldFileKey) {
          deleteFileFromR2(oldFileKey).catch((err) => console.error(err));
        }
      }
    }

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
    if (error.message === "File too large") {
      return next(
        new ApiError(400, "Image exceeds the 2MB strict size limit."),
      );
    }
    next(error);
  }
};
