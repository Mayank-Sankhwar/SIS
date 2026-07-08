import { Prisma } from "@prisma/client";
import { AuditLogService } from "./audit-log.service.js";
import { AuthorizationService, type AuthenticatedUser } from "./authorization.service.js";
import { BatteryBankRepository } from "../repositories/battery-bank.repository.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreateBatteryBankBody,
  ListBatteryBanksQuery,
  UpdateBatteryBankBody
} from "../validators/battery-bank.validator.js";

export class BatteryBankService {
  constructor(
    private readonly batteryBankRepository = new BatteryBankRepository(),
    private readonly auditLogService = new AuditLogService(),
    private readonly authorizationService = new AuthorizationService()
  ) {}

  async create(payload: CreateBatteryBankBody, actor: AuthenticatedUser) {
    try {
      return await this.batteryBankRepository.runInTransaction(async (tx) => {
        const substation = await this.batteryBankRepository.findActiveSubstationById(tx, payload.substationId);

        if (!substation) {
          throw new AppError("Active Substation hierarchy not found", 422);
        }

        await this.authorizationService.checkAreaAccess(actor, { substationId: payload.substationId });

        const duplicate = await this.batteryBankRepository.findDuplicateByBatteryBankCode(tx, payload);

        if (duplicate) {
          throw new AppError("Battery Bank code already exists within this Substation", 409);
        }

        const batteryBank = await this.batteryBankRepository.create(tx, {
          ...payload,
          createdById: actor.id
        });

        this.auditLogService.record({
          userId: actor.id,
          action: "CREATE",
          entity: "BatteryBank",
          entityId: batteryBank.id
        });

        return batteryBank;
      });
    } catch (error) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async getById(id: string, actor: AuthenticatedUser) {
    const batteryBank = await this.batteryBankRepository.findById(id);

    if (!batteryBank) {
      throw new AppError("Battery Bank not found", 404);
    }

    await this.authorizationService.checkAreaAccess(actor, {
      substationId: batteryBank.substationId
    });

    return batteryBank;
  }

  async list(query: ListBatteryBanksQuery, access: { userId: string; role: string }) {
    const { items, total } = await this.batteryBankRepository.list(query, access);
    const totalPages = Math.ceil(total / query.limit);

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPreviousPage: query.page > 1
      }
    };
  }

  async update(id: string, payload: UpdateBatteryBankBody, actor: AuthenticatedUser) {
    return this.batteryBankRepository.runInTransaction(async (tx) => {
      const existing = await this.batteryBankRepository.findAnyById(tx, id);

      if (!existing) {
        throw new AppError("Battery Bank not found", 404);
      }

      if (existing.deletedAt) {
        throw new AppError("Deleted Battery Bank cannot be updated", 409);
      }

      const substation = await this.batteryBankRepository.findActiveSubstationById(tx, existing.substationId);

      if (!substation) {
        throw new AppError("Active Substation hierarchy not found", 422);
      }

      await this.authorizationService.checkAreaAccess(actor, { substationId: existing.substationId });

      const batteryBank = await this.batteryBankRepository.update(tx, id, {
        ...payload,
        updatedById: actor.id
      });

      this.auditLogService.record({
        userId: actor.id,
        action: "UPDATE",
        entity: "BatteryBank",
        entityId: batteryBank.id
      });

      return batteryBank;
    });
  }

  async softDelete(id: string, actor: AuthenticatedUser) {
    return this.batteryBankRepository.runInTransaction(async (tx) => {
      const existing = await this.batteryBankRepository.findAnyById(tx, id);

      if (!existing) {
        throw new AppError("Battery Bank not found", 404);
      }

      if (existing.deletedAt) {
        throw new AppError("Battery Bank is already deleted", 409);
      }

      const substation = await this.batteryBankRepository.findActiveSubstationById(tx, existing.substationId);

      if (!substation) {
        throw new AppError("Active Substation hierarchy not found", 422);
      }

      await this.authorizationService.checkAreaAccess(actor, { substationId: existing.substationId });

      const batteryBank = await this.batteryBankRepository.softDelete(tx, id, actor.id);

      this.auditLogService.record({
        userId: actor.id,
        action: "DELETE",
        entity: "BatteryBank",
        entityId: batteryBank.id
      });

      return batteryBank;
    });
  }

  private handleUniqueConstraintError(error: unknown): never | void {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("Battery Bank code already exists within this Substation", 409);
    }
  }
}
