import rateLimit from "express-rate-limit";

export const inviteRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 invites per 15 mins
  message: {
    success: false,
    message: "Too many invitations sent. Try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
