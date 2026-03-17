import multer from "multer";
import ApiError from "../utils/apiError";

// 1. Use MemoryStorage so the file is held in RAM (buffer) temporarily
// This is safe because we are strictly limiting the size to 2MB.
const storage = multer.memoryStorage();

// 2. Define the strict rules
export const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 🚀 HARD LIMIT: 2MB (in bytes)
  },
  fileFilter: (req, file, cb) => {
    // 🚀 SECURITY: Only accept standard web images
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(400, "Only JPG, PNG, and WebP images are allowed."));
    }
  },
});
