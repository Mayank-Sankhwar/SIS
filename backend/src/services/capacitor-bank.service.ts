import { Prisma } from "@prisma/client";
import { AuditLogService } from "./audit-log.service.js";
import { AuthorizationService, type AuthenticatedUser } from "./authorization.service.js";
import { CapacitorBankRepository } from "../repositories/capacitor-bank.repository.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreateCapacitorBankBody,
  ListCapacitorBanksQuery,
  UpdateCapacitorBankBody
} from "../validators/capacitor-bank.validator.js";

export class CapacitorBankService {
  constructor(
    private readonly capacitorBankRepository = new CapacitorBankRepository(),
    private readonly auditLogService = new AuditLogService(),
    private readonly authorizationService = new AuthorizationService()
  ) {}

  async create(payload: CreateCapacitorBankBody, actor: AuthenticatedUser) {
    try {
      return await this.capacitorBankRepository.runInTransaction(async (tx) => {
        const substation = await this.capacitorBankRepository.findActiveSubstationById(tx, payload.substationId);

        if (!substation) {
          throw new AppError("Active Substation hierarchy not found", 422);
        }

        await this.authorizationService.checkAreaAccess(actor, { substationId: payload.substationId });

        const duplicate = await this.capacitorBankRepository.findDuplicateByCapacitorBankCode(tx, payload);

        if (duplicate) {
          throw new AppError("Capacitor Bank code already exists within this Substation", 409);
        }

        const capacitorBank = await this.capacitorBankRepository.create(tx, {
          ...payload,
          createdById: actor.id
        });

        this.auditLogService.record({
          userId: actor.id,
          action: "CREATE",
          entity: "CapacitorBank",
          entityId: capacitorBank.id
        });

        return capacitorBank;
      });
    } catch (error) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async getById(id: string, actor: AuthenticatedUser) {
    const capacitorBank = await this.capacitorBankRepository.findById(id);

    if (!capacitorBank) {
      throw new AppError("Capacitor Bank not found", 404);
    }

    await this.authorizationService.checkAreaAccess(actor, {
      substationId: capacitorBank.substationId
    });

    return capacitorBank;
  }

  async list(query: ListCapacitorBanksQuery, access: { userId: string; role: string }) {
    const { items, total } = await this.capacitorBankRepository.list(query, access);
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

  async update(id: string, payload: UpdateCapacitorBankBody, actor: AuthenticatedUser) {
    return this.capacitorBankRepository.runInTransaction(async (tx) => {
      const existing = await this.capacitorBankRepository.findAnyById(tx, id);

      if (!existing) {
        throw new AppError("Capacitor Bank not found", 404);
      }

      if (existing.deletedAt) {
        throw new AppError("Deleted Capacitor Bank cannot be updated", 409);
      }

      const substation = await this.capacitorBankRepository.findActiveSubstationById(tx, existing.substationId);

      if (!substation) {
        throw new AppError("Active Substation hierarchy not found", 422);
      }

      await this.authorizationService.checkAreaAccess(actor, { substationId: existing.substationId });

      const capacitorBank = await this.capacitorBankRepository.update(tx, id, {
        ...payload,
        updatedById: actor.id
      });

      this.auditLogService.record({
        userId: actor.id,
        action: "UPDATE",
        entity: "CapacitorBank",
        entityId: capacitorBank.id
      });

      return capacitorBank;
    });
  }

  async softDelete(id: string, actor: AuthenticatedUser) {
    return this.capacitorBankRepository.runInTransaction(async (tx) => {
      const existing = await this.capacitorBankRepository.findAnyById(tx, id);

      if (!existing) {
        throw new AppError("Capacitor Bank not found", 404);
      }

      if (existing.deletedAt) {
        throw new AppError("Capacitor Bank is already deleted", 409);
      }

      const substation = await this.capacitorBankRepository.findActiveSubstationById(tx, existing.substationId);

      if (!substation) {
        throw new AppError("Active Substation hierarchy not found", 422);
      }

      await this.authorizationService.checkAreaAccess(actor, { substationId: existing.substationId });

      const capacitorBank = await this.capacitorBankRepository.softDelete(tx, id, actor.id);

      this.auditLogService.record({
        userId: actor.id,
        action: "DELETE",
        entity: "CapacitorBank",
        entityId: capacitorBank.id
      });

      return capacitorBank;
    });
  }

  private handleUniqueConstraintError(error: unknown): never | void {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("Capacitor Bank code already exists within this Substation", 409);
    }
  }
}
