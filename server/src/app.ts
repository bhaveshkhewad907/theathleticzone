import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import passport from "./modules/auth/oauth/google.strategy";
import errorHandler from "./middlewares/error.middleware";
import * as Sentry from "@sentry/node";
import promBundle from "express-prom-bundle";
import { logger } from "./utils/logger";
import { AuthenticatedRequest } from "./types/auth.types"; // Adjust path if needed

import apiRoutes from "./modules/index.routes";

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "High traffic detected from this IP. Please wait 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const app = express();
app.set("trust proxy", 1);

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  customLabels: { project_name: "athletic_zone" },
  promClient: {
    collectDefaultMetrics: {},
  },
});
app.use(metricsMiddleware);

/* Security Middleware */
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://checkout.razorpay.com"],
        frameSrc: ["'self'", "https://checkout.razorpay.com"], // Removed Mux since you use R2
        imgSrc: ["'self'", "data:", "https:"],
        mediaSrc: ["'self'", "https:", "blob:"], // 🚀 FIX: Explicitly allows R2 videos to play
        connectSrc: [
          "'self'",
          "https://api.razorpay.com",
          "https://*.r2.cloudflarestorage.com",
        ], // Allow hitting R2 securely
      },
    },
  }),
);
app.use(globalLimiter);

app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:5173",
  "https://theathleticzone.in",
  "https://www.theathleticzone.in",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "10kb" }));

// 🚀 FIX: Replaced custom iteration loop with the native express-mongo-sanitize middleware
app.use(mongoSanitize());

app.use(passport.initialize());

app.use("/api", apiRoutes);

/* Health Check Route */
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Athletic Zone API is running 🚀",
  });
});

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

Sentry.setupExpressErrorHandler(app);

// 🚀 FIX: Added strict typing to the Custom Error Logger
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthenticatedRequest;
  logger.error(err.message, {
    event: "UNHANDLED_EXCEPTION",
    endpoint: req.originalUrl,
    method: req.method,
    userId: authReq.user?.id || "UNAUTHENTICATED",
    stack: err.stack,
    payload: req.body,
  });
  next(err);
});

// 5. GLOBAL ERROR HANDLER
app.use(errorHandler);

export default app;
