import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import {
  getMe,
  updateProfile,
  getProfileUploadUrl,
  uploadProfilePicture,
  completeTrainingCycle,
} from "./user.controller";
import multer from "multer";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});

router.get("/me", requireAuth, getMe);
router.put("/profile", requireAuth, updateProfile);
router.post("/get-profile-upload-url", requireAuth, getProfileUploadUrl);
router.post(
  "/upload-avatar",
  requireAuth,
  upload.single("avatar"),
  uploadProfilePicture,
);
router.post("/cycle/complete", completeTrainingCycle);

export default router;
