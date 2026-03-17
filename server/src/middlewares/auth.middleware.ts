import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError";
import User, { IUser } from "../modules/user/user.model";
import { HydratedDocument } from "mongoose";
import { AuthenticatedRequest } from "../types/auth.types";

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    // 🛡️ READ DIRECTLY FROM SECURE COOKIES
    let token = req.cookies?.accessToken;

    // Fallback for developer tools (Postman/Insomnia)
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

    req.user = user;
    next();
  } catch (error) {
    // 🔁 This 401 triggers the auto-refresh in your api.ts
    next(new ApiError(401, "Session invalid or expired."));
  }
};

// 🛡️ THE BULLETPROOF FIX
export const requireRole = (...allowedRoles: (string | string[])[]) => {
  return (req: any, res: any, next: any) => {
    // This flattens the input so requireRole("ADMIN", "COACH") and requireRole(["ADMIN", "COACH"]) BOTH work safely
    const flatRoles = allowedRoles.flat();

    // 🐛 TEMPORARY DEBUGGER: This will print in your terminal when you try to upload
    console.log("--- ROLE DEBUGGER ---");
    console.log("User Role:", req.user?.role);
    console.log("Allowed Roles:", flatRoles);

    if (!req.user) {
      console.log("❌ Blocked: No user found in request.");
      return next(new ApiError(401, "Unauthorized: No user found"));
    }

    if (!flatRoles.includes(req.user.role)) {
      console.log(`❌ Blocked: ${req.user.role} is not in the allowed list!`);
      return next(new ApiError(403, "Forbidden: Access denied"));
    }

    console.log("✅ Access Granted!");
    next();
  };
};
