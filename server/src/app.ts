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

const app = express();

// ==========================================
// 1. CORE SETUP & TRUST PROXY
// ==========================================
// Required for Rate Limiting & IPs behind Render/Cloudflare
app.set("trust proxy", 1);

// ==========================================
// 2. OBSERVABILITY & METRICS (Must be first)
// ==========================================
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

// ==========================================
// 3. CORS (Must be early for preflight requests)
// ==========================================
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
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  }),
);

// ==========================================
// 4. SECURITY HEADERS
// ==========================================
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://checkout.razorpay.com"],
        frameSrc: ["'self'", "https://checkout.razorpay.com"],
        imgSrc: ["'self'", "data:", "https:"],
        mediaSrc: ["'self'", "https:", "blob:"], // Allows R2 videos to play
        connectSrc: [
          "'self'",
          "https://api.razorpay.com",
          "https://*.r2.cloudflarestorage.com",
        ], // Allow hitting R2 securely
      },
    },
  }),
);

// ==========================================
// 5. 🏥 HIGH-PRIORITY INFRASTRUCTURE ROUTES
// ==========================================
// Render Health Check - MUST bypass rate limits and body parsers!
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).send("OK");
});

// ==========================================
// 6. RATE LIMITING
// ==========================================
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
app.use(globalLimiter);

// ==========================================
// 7. BODY PARSERS & COOKIES
// ==========================================
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));

// ==========================================
// 8. DATA SANITIZATION
// ==========================================
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);
  if (req.query) {
    for (const key in req.query) {
      req.query[key] = mongoSanitize.sanitize(req.query[key] as any);
    }
  }
  next();
});

// ==========================================
// 9. AUTHENTICATION INIT
// ==========================================
app.use(passport.initialize());

// ==========================================
// 10. API ROUTES
// ==========================================
app.use("/api", apiRoutes);

/* Welcome / Root Route */
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Athletic Zone API is running 🚀",
  });
});

// ==========================================
// 11. 404 HANDLER
// ==========================================
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ==========================================
// 12. ERROR HANDLING (Order is strictly required)
// ==========================================
// 12a. Sentry Error Catcher
Sentry.setupExpressErrorHandler(app);

// 12b. Custom Error Logger
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
  next(err); // Pass down to global handler
});

// 12c. Global Error Response Formatter
app.use(errorHandler);

export default app;
