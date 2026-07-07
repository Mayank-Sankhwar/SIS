import type { Request, Response } from "express";
import { UserManagementService } from "../services/user-management.service.js";
import type {
  CompleteProfileBody,
  CreateUserBody
} from "../validators/user-management.validator.js";
import { AppError } from "../utils/app-error.js";
import { sendSuccess } from "../utils/api-response.js";

export class UserManagementController {
  constructor(private readonly userManagementService = new UserManagementService()) {}

  createUser = async (
    req: Request<unknown, unknown, CreateUserBody>,
    res: Response
  ): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const result = await this.userManagementService.createUser(req.user, req.body);
    return sendSuccess(res, 201, "User created successfully", result);
  };

  completeProfile = async (
    req: Request<unknown, unknown, CompleteProfileBody>,
    res: Response
  ): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const result = await this.userManagementService.completeProfile(req.user, req.body);
    return sendSuccess(res, 200, "Profile completed successfully", result);
  };
}
