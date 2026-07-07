import { prisma } from "../config/prisma.js";

export class HealthRepository {
  async databaseIsReachable(): Promise<boolean> {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  }
}
