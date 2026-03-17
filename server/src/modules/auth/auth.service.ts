import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../user/user.model";
import ApiError from "../../utils/apiError";
import { generateAccessToken, generateRefreshToken } from "../../utils/token";
import crypto from "crypto";
import Sport from "../sport/sport.model";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  sportId: string;
}

/* =====================================================
   REGISTER
===================================================== */

export const registerAthlete = async ({
  name,
  email,
  password,
  sportId,
}: RegisterInput) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(400, "Email already registered");
  }

  const sport = await Sport.findById(sportId);

  if (!sport || !sport.isActive) {
    throw new ApiError(400, "Invalid sport selected");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "ATHLETE",
    provider: "LOCAL",
    sports: [sportId],
  });

  return user;
};

/* =====================================================
   LOGIN
===================================================== */

export const loginAthlete = async (email: string, password: string) => {
  const user = await User.findOne({ email });

  if (!user) throw new ApiError(400, "Invalid credentials");

  if (user.provider !== "LOCAL")
    throw new ApiError(400, "Please login using Google");

  if (!user.password) throw new ApiError(400, "Password not set");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(400, "Invalid credentials");

  if (user.isBlocked) throw new ApiError(403, "Account is blocked");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);

  // 🔥 Use atomic update instead of user.save()
  await User.updateOne(
    { _id: user._id },
    {
      $push: {
        refreshTokens: {
          token: hashedRefreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
    },
  );

  return {
    user,
    accessToken,
    refreshToken,
  };
};

/* =====================================================
   REFRESH (🔥 FIXED — NO .save())
===================================================== */

export const refreshSession = async (incomingRefreshToken: string) => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET as string;

  let decoded: any;

  try {
    decoded = jwt.verify(incomingRefreshToken, refreshSecret);
  } catch {
    throw new ApiError(403, "Invalid refresh token");
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new ApiError(403, "User not found");
  }

  let matchedHashedToken: string | null = null;

  for (const storedToken of user.refreshTokens) {
    const isMatch = await bcrypt.compare(
      incomingRefreshToken,
      storedToken.token,
    );

    if (isMatch) {
      matchedHashedToken = storedToken.token;
      break;
    }
  }

  if (!matchedHashedToken) {
    throw new ApiError(403, "Refresh token reuse detected");
  }

  // 🔐 Generate new tokens
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);
  const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 12);

  // 1️⃣ Remove old refresh token
  await User.updateOne(
    { _id: user._id },
    {
      $pull: { refreshTokens: { token: matchedHashedToken } },
    },
  );

  // 2️⃣ Add new refresh token
  await User.updateOne(
    { _id: user._id },
    {
      $push: {
        refreshTokens: {
          token: hashedNewRefreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
    },
  );

  return {
    accessToken: newAccessToken,
    newRefreshToken,
  };
};

/* =====================================================
   LOGOUT (🔥 FIXED — NO .save())
===================================================== */

export const logoutSession = async (incomingRefreshToken: string) => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET as string;

  let decoded: any;

  try {
    decoded = jwt.verify(incomingRefreshToken, refreshSecret);
  } catch {
    return;
  }

  const user = await User.findById(decoded.id);
  if (!user) return;

  let matchedHashedToken: string | null = null;

  for (const storedToken of user.refreshTokens) {
    const isMatch = await bcrypt.compare(
      incomingRefreshToken,
      storedToken.token,
    );

    if (isMatch) {
      matchedHashedToken = storedToken.token;
      break;
    }
  }

  if (!matchedHashedToken) return;

  // 🔥 Atomic removal
  await User.updateOne(
    { _id: user._id },
    {
      $pull: { refreshTokens: { token: matchedHashedToken } },
    },
  );
};

/* =====================================================
   INVITE COACH (unchanged)
===================================================== */

export const inviteCoach = async (name: string, email: string) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(400, "User with this email already exists");
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = await bcrypt.hash(rawToken, 12);

  const expiration = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const coach = await User.create({
    name,
    email,
    role: "COACH",
    provider: "LOCAL",
    invitationToken: hashedToken,
    invitationExpires: expiration,
  });

  return {
    coach,
    rawToken,
  };
};

export const acceptCoachInvite = async (token: string, password: string) => {
  const coaches = await User.find({
    role: "COACH",
    invitationToken: { $exists: true },
  });

  let matchedCoach: any = null;

  for (const coach of coaches) {
    const isMatch = await bcrypt.compare(token, coach.invitationToken!);
    if (isMatch) {
      matchedCoach = coach;
      break;
    }
  }

  if (!matchedCoach)
    throw new ApiError(400, "Invalid or expired invitation token");

  if (
    !matchedCoach.invitationExpires ||
    matchedCoach.invitationExpires < new Date()
  ) {
    throw new ApiError(400, "Invitation token expired");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  matchedCoach.password = hashedPassword;
  matchedCoach.invitationToken = undefined;
  matchedCoach.invitationExpires = undefined;

  await matchedCoach.save();

  return matchedCoach;
};
