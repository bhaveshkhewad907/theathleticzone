import { Request, Response, NextFunction, RequestHandler } from "express";
import { registerAthlete } from "./auth.service";
import { registerSchema } from "./auth.validation";
import ApiError from "../../utils/apiError";
import { loginSchema } from "./auth.validation";
import { loginAthlete } from "./auth.service";
import { refreshSession } from "./auth.service";
import { logoutSession } from "./auth.service";
import bcrypt from "bcrypt";
import CoachInvitation from "../admin/coachInvitation.model";
import User from "../user/user.model";
import jwt from "jsonwebtoken";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../../services/email.service";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0].message;
      throw new ApiError(400, firstError);
    }

    const { name, email, password, sportId } = parsed.data;

    const user = await registerAthlete({
      name,
      email,
      password,
      sportId,
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.verificationOTP = otp;
    user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, otp);

    res.status(201).json({
      success: true,
      message:
        "Tactical account initialized. Security code dispatched to your email.",
      data: {
        id: user._id,
        email: user.email,
        isVerified: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail: RequestHandler = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({
      email,
      verificationOTP: otp,
      verificationExpires: { $gt: new Date() },
    });

    if (!user) throw new ApiError(400, "Invalid or expired activation code.");

    user.isVerified = true;
    user.verificationOTP = null;
    user.verificationExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Account activated. Welcome to the elite roster.",
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0].message;
      throw new ApiError(400, firstError);
    }

    const { email, password } = parsed.data;

    const { user, accessToken, refreshToken } = await loginAthlete(
      email,
      password,
    );
    if (user.isBlocked) throw new ApiError(403, "Account suspended.");
    if (!user.isVerified) {
      throw new ApiError(
        403,
        "Account inactive. Please verify your email first.",
      );
    }

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new ApiError(401, "Refresh token missing");
    }

    const { accessToken, newRefreshToken } = await refreshSession(refreshToken);
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ success: true, message: "Session refreshed" });
  } catch (error) {
    const isProduction = process.env.NODE_ENV === "production";

    // 🚀 THE FIX: Fully match cookie flags for deletion
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
    });

    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const isProduction = process.env.NODE_ENV === "production";

    // 🚀 THE FIX: Fully match cookie flags for deletion
    const clearCookieOptions = {
      httpOnly: true,
      secure: isProduction,
      // 🚀 THE FIX: Explicitly cast the output so TS knows it's safe
      sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
      path: "/",
    };

    if (!refreshToken) {
      res.clearCookie("refreshToken", clearCookieOptions);
      res.clearCookie("accessToken", clearCookieOptions);
      return res.status(200).json({
        success: true,
        message: "Logged out",
      });
    }

    await logoutSession(refreshToken);

    res.clearCookie("refreshToken", clearCookieOptions);
    res.clearCookie("accessToken", clearCookieOptions);

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const acceptCoachInvite: RequestHandler = async (req, res, next) => {
  try {
    const { token, name, password } = req.body;

    if (!token || !name || !password) {
      throw new ApiError(400, "All fields are required");
    }

    const invitation = await CoachInvitation.findOne({ token });

    if (!invitation || invitation.expiresAt < new Date()) {
      throw new ApiError(400, "Invalid or expired invitation");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const coach = await User.create({
      name,
      email: invitation.email,
      password: hashedPassword,
      role: "COACH",
      provider: "LOCAL",
      sports: invitation.sports,
      isVerified: true,
    });

    const accessToken = jwt.sign(
      { id: coach._id, role: coach.role },
      process.env.JWT_ACCESS_SECRET as string,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { id: coach._id },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: "7d" },
    );

    await User.updateOne(
      { _id: coach._id },
      {
        $push: {
          refreshTokens: {
            token: await bcrypt.hash(refreshToken, 12),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      },
    );

    // 🚀 ULTIMATE FAILSAFE: Update by exact token and log the result
    const updatedInvite = await CoachInvitation.findOneAndUpdate(
      { token: token },
      { $set: { status: "ACCEPTED" } },
      { new: true }, // This tells Mongoose to return the freshly updated document
    );

    // 🕵️ DEBUG LOG: This will print to your Render server logs
    console.log(
      "SYSTEM CHECK - Invite Status Updated To:",
      updatedInvite?.status,
    );

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "Account created and authorized.",
      data: {
        id: coach._id,
        name: coach.name,
        email: coach.email,
        role: coach.role,
        profileImage: coach.profileImage || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const validateCoachInvite: RequestHandler = async (req, res, next) => {
  try {
    const { token } = req.query;

    if (!token) {
      throw new ApiError(400, "Token is required");
    }

    const invitation = await CoachInvitation.findOne({ token });

    if (!invitation) {
      throw new ApiError(400, "Invalid invitation");
    }

    if (invitation.expiresAt < new Date()) {
      throw new ApiError(400, "Invitation expired");
    }

    res.status(200).json({
      success: true,
      email: invitation.email,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists, an OTP has been dispatched.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.passwordResetOTP = otp;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendPasswordResetEmail(user.email, otp);

    res.status(200).json({
      success: true,
      message: "Security code dispatched to your registered email.",
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword: RequestHandler = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      passwordResetOTP: otp,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new ApiError(400, "Invalid or expired security code.");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetOTP = null;
    user.passwordResetExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Credentials updated successfully. You can now log in.",
    });
  } catch (error) {
    next(error);
  }
};

export const googleCallback = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { accessToken, refreshToken } = req.user as any;
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.redirect(`${process.env.CLIENT_URL}/athlete`);
  } catch (error) {
    res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
  }
};
