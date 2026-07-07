import type { RequestHandler } from "express";
import type { RoleName } from "@prisma/client";
import { AuthorizationService } from "../services/authorization.service.js";
import { AppError } from "../utils/app-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { type JwtPayload, verifyAccessToken } from "../utils/jwt.js";

const authorizationService = new AuthorizationService();

function readAreaId(req: Parameters<RequestHandler>[0], key: string): string | undefined {
  const value = req.params[key] ?? req.query[key] ?? req.body?.[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

export const authenticate: RequestHandler = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    throw new AppError("Missing or invalid authorization header", 401);
  }

  const token = header.slice("Bearer ".length);
  let payload: JwtPayload;

  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new AppError("Invalid or expired token", 401);
  }

  req.user = await authorizationService.authenticatePayload(payload);
  next();
});

export function authorizeRoles(...roles: RoleName[]): RequestHandler {
  return (req, _res, next) => {
    try {
      authorizationService.authorizeRoles(req.user, roles);
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function checkAreaAccess(): RequestHandler {
  return asyncHandler(async (req, _res, next) => {
    const requestedArea = {
      discomId: readAreaId(req, "discomId"),
      zoneId: readAreaId(req, "zoneId"),
      verticalId: readAreaId(req, "verticalId"),
      subVerticalId: readAreaId(req, "subVerticalId"),
      substationId: readAreaId(req, "substationId")
    };

    await authorizationService.checkAreaAccess(req.user, requestedArea);
    next();
  });
}
