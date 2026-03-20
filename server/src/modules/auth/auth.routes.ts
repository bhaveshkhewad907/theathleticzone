import { Router } from "express";
import {
  acceptCoachInvite,
  register,
  validateCoachInvite,
  verifyEmail,
} from "./auth.controller";
import { login } from "./auth.controller";
import { refresh } from "./auth.controller";
import { logout } from "./auth.controller";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware";
import { authLimiter } from "../../middlewares/rateLimit.middleware";
import passport from "passport";
import { forgotPassword, resetPassword } from "./auth.controller";
import User from "../user/user.model";

const router = Router();

/*
  Athlete Registration
*/
router.post("/register", authLimiter, register);
router.post("/verify-email", verifyEmail);
router.post("/login", authLimiter, login);
router.post("/refresh", authLimiter, refresh);
router.post("/logout", logout);
router.post("/accept-coach-invite", acceptCoachInvite);
// GOOGLE LOGIN
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);
router.get("/validate-coach-invite", validateCoachInvite);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", authLimiter, resetPassword);

// GOOGLE CALLBACK
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login`,
  }),
  (req, res) => {
    try {
      const { accessToken, refreshToken } = req.user as {
        accessToken: string;
        refreshToken: string;
      };

      // Automatically detect if we are on Render vs Localhost
      const isProduction = process.env.NODE_ENV === "production";

      // 🍪 Set Refresh Token Cookie (HttpOnly)
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction, // 🚀 THE FIX: True in production
        sameSite: isProduction ? "none" : "lax", // 🚀 THE FIX: "none" for cross-domain
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // 🍪 Set Access Token Cookie (To match your regular login flow!)
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/",
        maxAge: 15 * 60 * 1000,
      });

      // 🔁 Redirect to frontend
      // You can keep the token in the URL if your frontend relies on it,
      // but since we just set the cookies above, the frontend doesn't even need it anymore!
      res.redirect(
        `${process.env.CLIENT_URL}/oauth-success?token=${accessToken}`,
      );
    } catch (error) {
      res.redirect(`${process.env.CLIENT_URL}/login`);
    }
  },
);

router.get("/me", requireAuth, async (req: any, res) => {
  try {
    // Fetch the full identity from the core database
    const user = await User.findById(req.user.id).select(
      "name email role isVerified sports",
    );

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Core sync failed" });
  }
});

export default router;
