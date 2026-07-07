import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import type { LoginBody } from "../validators/auth.validator.js";
import { sendSuccess } from "../utils/api-response.js";
import { AppError } from "../utils/app-error.js";

export class AuthController {
  constructor(private readonly authService = new AuthService()) {}

  login = async (req: Request<unknown, unknown, LoginBody>, res: Response): Promise<Response> => {
    const result = await this.authService.login(req.body);
    return sendSuccess(res, 200, "Login successful", result);
  };

  profile = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user?.sub) {
      throw new AppError("Authentication required", 401);
    }

    const result = await this.authService.getProfile(req.user.sub);
    return sendSuccess(res, 200, "Profile fetched successfully", result);
  };
}
