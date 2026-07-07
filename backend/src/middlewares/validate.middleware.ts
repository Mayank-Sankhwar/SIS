import type { RequestHandler } from "express";
import { validationResult } from "express-validator";
import { ZodError, type ZodTypeAny } from "zod";
import { AppError } from "../utils/app-error.js";

export const handleValidationResult: RequestHandler = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    next(new AppError("Validation failed", 422, errors.array()));
    return;
  }

  next();
};

export function validateBody(schema: ZodTypeAny): RequestHandler {
  return (req, _res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new AppError("Validation failed", 422, error.flatten()));
        return;
      }

      next(error);
    }
  };
}

export function validateParams(schema: ZodTypeAny): RequestHandler {
  return (req, _res, next) => {
    try {
      req.params = schema.parse(req.params) as typeof req.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new AppError("Validation failed", 422, error.flatten()));
        return;
      }

      next(error);
    }
  };
}

export function validateQuery(schema: ZodTypeAny): RequestHandler {
  return (req, _res, next) => {
    try {
      req.query = schema.parse(req.query) as typeof req.query;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new AppError("Validation failed", 422, error.flatten()));
        return;
      }

      next(error);
    }
  };
}
