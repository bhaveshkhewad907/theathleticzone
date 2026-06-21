import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError";
import User from "../modules/user/user.model";
import { AuthenticatedRequest } from "../types/auth.types";

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    let token = req.cookies?.accessToken;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) throw new ApiError(401, "Authentication signal missing.");

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string,
    ) as { id: string };

    const user = await User.findById(decoded.id);
    if (!user) throw new ApiError(401, "User no longer recognized.");

    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    next(new ApiError(401, "Session invalid or expired."));
  }
};

export const requireRole = (...allowedRoles: (string | string[])[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const flatRoles = allowedRoles.flat();
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return next(new ApiError(401, "Unauthorized: No user found"));
    }

    if (!flatRoles.includes(authReq.user.role)) {
      return next(new ApiError(403, "Forbidden: Access denied"));
    }

    next();
  };
};
