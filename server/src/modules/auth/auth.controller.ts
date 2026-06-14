import { Request, Response, NextFunction, RequestHandler } from "express";
import {
  registerAthlete,
  loginAthlete,
  refreshSession,
  logoutSession,
} from "./auth.service";
import { registerSchema, loginSchema } from "./auth.validation";
import ApiError from "../../utils/apiError";
import User from "../user/user.model";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../../services/email.service";
import bcrypt from "bcryptjs";

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

    const { name, email, password } = parsed.data;

    const user = (await registerAthlete({ name, email, password })) as any;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.verificationOTP = otp;
    user.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(user.email, otp);

    res.status(201).json({
      success: true,
      message: "Account initialized. Security code dispatched to your email.",
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

    const { user, accessToken, refreshToken } = (await loginAthlete(
      email,
      password,
    )) as any;

    if (user.isBlocked) throw new ApiError(403, "Account suspended.");
    if (!user.isVerified) {
      throw new ApiError(
        403,
        "Account inactive. Please verify your email first.",
      );
    }

    const isProduction = process.env.NODE_ENV === "production";

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax" as const,
      domain: isProduction ? ".theathleticzone.in" : undefined,
      path: "/",
    };

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
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
        platformState: user.platformState,
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

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax" as const,
      domain: isProduction ? ".theathleticzone.in" : undefined,
      path: "/",
    };

    res.cookie("refreshToken", newRefreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ success: true, message: "Session refreshed" });
  } catch (error) {
    const isProduction = process.env.NODE_ENV === "production";
    const clearCookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax" as const,
      domain: isProduction ? ".theathleticzone.in" : undefined,
      path: "/",
    };

    res.clearCookie("refreshToken", clearCookieOptions);
    res.clearCookie("accessToken", clearCookieOptions);
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const isProduction = process.env.NODE_ENV === "production";
  const clearCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    domain: isProduction ? ".theathleticzone.in" : undefined,
    path: "/",
  };

  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await logoutSession(refreshToken);
    }
  } catch (error) {
    console.warn(
      "Failed to delete session in DB, but proceeding to clear cookies:",
      error,
    );
  }

  res.clearCookie("refreshToken", clearCookieOptions);
  res.clearCookie("accessToken", clearCookieOptions);

  res.status(200).json({ success: true, message: "Logged out successfully" });
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

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax" as const,
      domain: isProduction ? ".theathleticzone.in" : undefined,
      path: "/",
    };

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.redirect(`${process.env.CLIENT_URL}/athlete`);
  } catch (error) {
    res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
  }
};
