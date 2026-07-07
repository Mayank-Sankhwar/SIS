import type { ErrorRequestHandler } from "express";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { AppError } from "../utils/app-error.js";

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  const isAppError = error instanceof AppError;
  const statusCode = isAppError ? error.statusCode : 500;
  const message = isAppError ? error.message : "Internal server error";

  logger.error(message, {
    statusCode,
    stack: error instanceof Error ? error.stack : undefined,
    details: isAppError ? error.details : undefined
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(isAppError && error.details ? { details: error.details } : {}),
    ...(env.NODE_ENV !== "production" && error instanceof Error ? { stack: error.stack } : {})
  });
};
