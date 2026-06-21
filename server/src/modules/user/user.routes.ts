import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
// 🚀 SECURITY FIX: Import the hardened Multer config with MIME-type protections
import { uploadAvatar } from "../../middlewares/upload.middleware";
import { getMe, updateProfile, uploadProfilePicture } from "./user.controller";

const router = Router();

router.get("/me", requireAuth, getMe);
router.put("/profile", requireAuth, updateProfile);

// 🚀 SECURITY FIX: Replaced inline multer with the global uploadAvatar middleware
router.post(
  "/upload-avatar",
  requireAuth,
  uploadAvatar.single("avatar"),
  uploadProfilePicture,
);

export default router;
