import { env } from "../config/env.js";
import type { HealthCheckResponse } from "../types/api.js";
import { HealthRepository } from "../repositories/health.repository.js";

export class HealthService {
  constructor(private readonly healthRepository = new HealthRepository()) {}

  async getHealth(): Promise<HealthCheckResponse & { database: "up" | "down" }> {
    let database: "up" | "down" = "down";

    try {
      await this.healthRepository.databaseIsReachable();
      database = "up";
    } catch {
      database = "down";
    }

    return {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      database
    };
  }
}
