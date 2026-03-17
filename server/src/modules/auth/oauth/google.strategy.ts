import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../../user/user.model";

if (
  !process.env.GOOGLE_CLIENT_ID ||
  !process.env.GOOGLE_CLIENT_SECRET ||
  !process.env.GOOGLE_CALLBACK_URL ||
  !process.env.JWT_ACCESS_SECRET ||
  !process.env.JWT_REFRESH_SECRET
) {
  throw new Error("Required OAuth/JWT environment variables are missing");
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done,
    ) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("Google account has no email attached"));
        }

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            role: "ATHLETE",
            provider: "GOOGLE",
            profileImage: profile.photos?.[0]?.value,
          });
        }

        if (user.isBlocked) {
          return done(new Error("Account is blocked"));
        }

        // 🔐 Access token
        const accessToken = jwt.sign(
          { id: user._id.toString(), role: user.role },
          process.env.JWT_ACCESS_SECRET!,
          { expiresIn: "15m" },
        );

        // 🔐 Refresh token
        const refreshToken = jwt.sign(
          { id: user._id.toString() },
          process.env.JWT_REFRESH_SECRET!,
          { expiresIn: "7d" },
        );

        // 🔐 HASH refresh token before storing
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);

        user.refreshTokens.push({
          token: hashedRefreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        await user.save();

        return done(null, {
          accessToken,
          refreshToken,
          user: {
            id: user._id.toString(),
            role: user.role,
          },
        });
      } catch (error) {
        return done(error as Error, undefined);
      }
    },
  ),
);

export default passport;
