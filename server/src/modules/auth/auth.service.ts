import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../user/user.model";
import ApiError from "../../utils/apiError";
import { generateAccessToken, generateRefreshToken } from "../../utils/token";

export interface RegisterInput {
  name: string;
  email: string;
  password?: string;
}

export const registerAthlete = async (data: RegisterInput) => {
  const existingUser = await User.findOne({ email: data.email });

  if (existingUser) {
    throw new ApiError(400, "An account with this email already exists.");
  }

  let hashedPassword;
  if (data.password) {
    hashedPassword = await bcrypt.hash(data.password, 10);
  }

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: "ATHLETE",
    provider: "LOCAL",
  });

  return user;
};

export const loginAthlete = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select("+password");

  if (!user || !user.password) {
    throw new ApiError(401, "Invalid credentials.");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials.");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);

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

  return { user, accessToken, refreshToken };
};

export const refreshSession = async (incomingRefreshToken: string) => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET as string;
  let decoded: any;

  try {
    decoded = jwt.verify(incomingRefreshToken, refreshSecret);
  } catch {
    throw new ApiError(403, "Invalid refresh token");
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(403, "User not found");

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

  if (!matchedHashedToken)
    throw new ApiError(403, "Refresh token reuse detected");

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);
  const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 12);

  await User.updateOne(
    { _id: user._id },
    { $pull: { refreshTokens: { token: matchedHashedToken } } },
  );

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

  return { accessToken: newAccessToken, newRefreshToken };
};

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

  await User.updateOne(
    { _id: user._id },
    { $pull: { refreshTokens: { token: matchedHashedToken } } },
  );
};
