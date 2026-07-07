import type { Request, Response } from "express";
import { HealthService } from "../services/health.service.js";
import { sendSuccess } from "../utils/api-response.js";

export class HealthController {
  constructor(private readonly healthService = new HealthService()) {}

  health = async (_req: Request, res: Response): Promise<Response> => {
    const health = await this.healthService.getHealth();
    return sendSuccess(res, 200, "Service is healthy", health);
  };
}
