import "dotenv/config";
import express from "express";
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

// 👇 ARCHITECTURE UPGRADE: Import the single master router
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

// 1. SENTRY: Initialization (v8 Syntax auto-instruments requests)
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0, // Capture 100% of transactions for performance monitoring
});

// 2. PROMETHEUS: API Performance & System Health Metrics
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeUp: true,
  customLabels: { project_name: "athletic_zone" },
  promClient: {
    collectDefaultMetrics: {}, // Automatically tracks CPU, Memory, Event Loop Lag
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
        frameSrc: [
          "'self'",
          "https://checkout.razorpay.com",
          "https://player.mux.com",
        ],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.razorpay.com"],
      },
    },
  }),
);
app.use(globalLimiter);

app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:5173", // For local testing
  "https://theathleticzone.in", // Your exact production domain
  "https://www.theathleticzone.in", // Include 'www' just in case
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // Crucial for sending cookies/tokens back and forth
  }),
);

app.use(express.json({ limit: "10kb" }));

app.use((req, _res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);
  if (req.query) {
    for (const key in req.query) {
      req.query[key] = mongoSanitize.sanitize(req.query[key] as any);
    }
  }
  next();
});

app.use(passport.initialize());

// 👇 ARCHITECTURE UPGRADE: Mount everything in one line!
app.use("/api", apiRoutes);

/* Health Check Route */
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Athletic Zone API is running 🚀",
  });
});

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// 3. SENTRY: Unhandled Error Capture (v8 Syntax)
// This MUST be placed right before your other error handlers
Sentry.setupExpressErrorHandler(app);

// 4. CUSTOM ERROR LOGGER
app.use((err: any, req: any, res: any, next: any) => {
  logger.error(err.message, {
    event: "UNHANDLED_EXCEPTION",
    endpoint: req.originalUrl,
    method: req.method,
    userId: req.user?.id || "UNAUTHENTICATED",
    stack: err.stack,
    payload: req.body, // Only log non-sensitive payload data
  });
  next(err);
});

// 5. GLOBAL ERROR HANDLER
app.use(errorHandler);

export default app;
