import jwt, { SignOptions } from "jsonwebtoken";
import { IUser } from "../modules/user/user.model";

const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

if (!accessSecret || !refreshSecret) {
  throw new Error("JWT secrets are not defined in environment variables");
}

export const generateAccessToken = (user: IUser) => {
  const options: SignOptions = {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES as SignOptions["expiresIn"],
  };

  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    accessSecret,
    options,
  );
};

export const generateRefreshToken = (user: IUser) => {
  const options: SignOptions = {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES as SignOptions["expiresIn"],
  };

  return jwt.sign(
    {
      id: user._id,
    },
    refreshSecret,
    options,
  );
};
