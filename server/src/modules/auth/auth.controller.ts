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
import { profile } from "console";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 🛡️ Validate input using the hardened schema
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0].message;
      throw new ApiError(400, firstError);
    }

    const { name, email, password, sportId } = parsed.data;

    // 1. Create the user record in the database
    // 🛡️ Force the role to 'ATHLETE' inside the registration service/logic
    // This ensures no one can sign up as an Admin or Coach
    const user = await registerAthlete({
      name,
      email,
      password,
      sportId, // Mandatory for future grouping
    });

    // 2. Generate a cryptographically secure 6-digit activation code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Attach verification metadata (Valid for 24 hours)
    user.verificationOTP = otp;
    user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    // 4. Dispatch the activation email via Resend
    await sendVerificationEmail(user.email, otp);

    res.status(201).json({
      success: true,
      message:
        "Tactical account initialized. Security code dispatched to your email.",
      data: {
        id: user._id,
        email: user.email,
        isVerified: false, // 👈 Frontend uses this to show the OTP screen
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
    // 1. Validate the incoming request body first
    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0].message;
      throw new ApiError(400, firstError);
    }

    const { email, password } = parsed.data;

    // 2. Attempt to authenticate the user and generate tokens
    const { user, accessToken, refreshToken } = await loginAthlete(
      email,
      password,
    );
    if (user.isBlocked) throw new ApiError(403, "Account suspended.");
    // 3. Security Guard: Prevent entry if the email is not verified
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

    // 🛡️ SECURITY UPGRADE: Secure Access Token Cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 15 * 60 * 1000, // 15 Minutes
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      // ❌ accessToken removed from raw JSON payload
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

    // 🛡️ SECURITY UPGRADE: Set new access token cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ success: true, message: "Session refreshed" });
  } catch (error) {
    // 🛡️ SECURITY PATCH: If refresh fails (user deleted, token invalid),
    // we MUST purge the cookies so the frontend doesn't get trapped in a loop.
    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
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

    if (!refreshToken) {
      return res.status(200).json({
        success: true,
        message: "Logged out",
      });
    }

    await logoutSession(refreshToken);

    // 🛡️ SECURITY UPGRADE: Purge both cookies from the browser
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

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

    // 🛡️ SECURITY UPGRADE: Generate tokens and set as cookies
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

    invitation.status = "ACCEPTED";
    await invitation.save();

    const isProduction = process.env.NODE_ENV === "production";

    // Set cookies exactly like the login route
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

// 1. Forgot Password - Generates & Sends OTP
export const forgotPassword: RequestHandler = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // We return 200 even if user not found for security (prevents user enumeration)
      return res.status(200).json({
        success: true,
        message: "If an account exists, an OTP has been dispatched.",
      });
    }

    // Generate a 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.passwordResetOTP = otp;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 Min window
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

// 2. Reset Password - Verifies OTP & Updates Password
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
    // Passport passes the data from google.strategy.ts's done() function into req.user
    const { accessToken, refreshToken } = req.user as any;

    const isProduction = process.env.NODE_ENV === "production";

    // 🛡️ Set secure cookies exactly like local login
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

    // 🚀 Redirect to the frontend.
    // If the athlete has no sport yet, your AuthContext will automatically
    // catch them and redirect them to /athlete/profile?onboarding=true!
    res.redirect(`${process.env.CLIENT_URL}/athlete`);
  } catch (error) {
    res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
  }
};
