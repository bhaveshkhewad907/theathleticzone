import { Request, Response, NextFunction } from "express";

const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("❌ Operational Error:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  let statusCode = err.statusCode || 500;
  let message = err.message;

  if (err.name === "CastError") {
    message = `Resource not found. Invalid: ${err.path}`;
    statusCode = 400;
  }

  if (err.code === 11000) {
    const value = Object.keys(err.keyValue)[0];
    message = `Duplicate field entered: ${value}. Please use another value.`;
    statusCode = 400;
  }

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((el: any) => el.message);
    message = `Invalid input data: ${errors.join(". ")}`;
    statusCode = 400;
  }

  if (process.env.NODE_ENV === "production" && statusCode === 500) {
    message =
      "An unexpected technical error occurred. Our engineers have been notified.";
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
