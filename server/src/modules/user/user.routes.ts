import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { uploadAvatar } from "../../middlewares/upload.middleware"; // 🚀 Added missing import
import {
  getMe,
  getPublicCoaches,
  updateProfile,
  getProfileUploadUrl,
  uploadProfilePicture, // 🚀 Added missing import
} from "./user.controller";

const router = Router();

/* ==========================================================================
   Public Routes
   ========================================================================== */

// Fetches active coaches for the public Landing Page roster
router.get("/coaches/public", getPublicCoaches);

/* ==========================================================================
   Protected Routes (Require Authentication)
   ========================================================================== */

// Get currently authenticated user's core data
router.get("/me", requireAuth, getMe);

// Update user profile (Used by Coaches to set Title, Experience, and R2 Image)
router.put("/me", requireAuth, updateProfile);

// Legacy Presigned URL generation for big files
router.post("/get-upload-url", requireAuth, getProfileUploadUrl);

// 🚀 SECURE AVATAR UPLOAD ROUTE (Strict 2MB Limit)
router.post(
  "/avatar",
  requireAuth,
  uploadAvatar.single("avatar"), // The 'avatar' key must match your React FormData
  uploadProfilePicture,
);

export default router;
