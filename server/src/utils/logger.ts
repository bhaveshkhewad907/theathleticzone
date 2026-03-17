import winston from "winston";

// Standardized Log Structure
const logFormat = winston.format.printf(
  ({ timestamp, level, message, service, event, ...meta }) => {
    return JSON.stringify({
      timestamp,
      service: service || "athletic-zone-api",
      level,
      event: event || "SYSTEM_LOG",
      message,
      metadata: Object.keys(meta).length ? meta : undefined,
    });
  },
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(winston.format.timestamp(), logFormat),
  transports: [
    new winston.transports.Console(),
    // In production, add File or Cloud transports here
  ],
});
