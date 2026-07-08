import { Prisma } from "@prisma/client";
import { AuditLogService } from "./audit-log.service.js";
import { AuthorizationService, type AuthenticatedUser } from "./authorization.service.js";
import { LightningArresterRepository } from "../repositories/lightning-arrester.repository.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreateLightningArresterBody,
  ListLightningArrestersQuery,
  UpdateLightningArresterBody
} from "../validators/lightning-arrester.validator.js";

export class LightningArresterService {
  constructor(
    private readonly lightningArresterRepository = new LightningArresterRepository(),
    private readonly auditLogService = new AuditLogService(),
    private readonly authorizationService = new AuthorizationService()
  ) {}

  async create(payload: CreateLightningArresterBody, actor: AuthenticatedUser) {
    try {
      return await this.lightningArresterRepository.runInTransaction(async (tx) => {
        const substation = await this.lightningArresterRepository.findActiveSubstationById(tx, payload.substationId);

        if (!substation) {
          throw new AppError("Active Substation hierarchy not found", 422);
        }

        await this.authorizationService.checkAreaAccess(actor, { substationId: payload.substationId });

        const duplicateCode = await this.lightningArresterRepository.findDuplicateByArresterCode(tx, payload);

        if (duplicateCode) {
          throw new AppError("Lightning Arrester code already exists within this Substation", 409);
        }

        const duplicateSerial = await this.lightningArresterRepository.findDuplicateBySerialNumber(tx, payload);

        if (duplicateSerial) {
          throw new AppError("Lightning Arrester serial number already exists", 409);
        }

        const lightningArrester = await this.lightningArresterRepository.create(tx, {
          ...payload,
          createdById: actor.id
        });

        this.auditLogService.record({
          userId: actor.id,
          action: "CREATE",
          entity: "LightningArrester",
          entityId: lightningArrester.id
        });

        return lightningArrester;
      });
    } catch (error) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async getById(id: string, actor: AuthenticatedUser) {
    const lightningArrester = await this.lightningArresterRepository.findById(id);

    if (!lightningArrester) {
      throw new AppError("Lightning Arrester not found", 404);
    }

    await this.authorizationService.checkAreaAccess(actor, {
      substationId: lightningArrester.substationId
    });

    return lightningArrester;
  }

  async list(query: ListLightningArrestersQuery, access: { userId: string; role: string }) {
    const { items, total } = await this.lightningArresterRepository.list(query, access);
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

  async update(id: string, payload: UpdateLightningArresterBody, actor: AuthenticatedUser) {
    try {
      return await this.lightningArresterRepository.runInTransaction(async (tx) => {
        const existing = await this.lightningArresterRepository.findAnyById(tx, id);

        if (!existing) {
          throw new AppError("Lightning Arrester not found", 404);
        }

        if (existing.deletedAt) {
          throw new AppError("Deleted Lightning Arrester cannot be updated", 409);
        }

        const substation = await this.lightningArresterRepository.findActiveSubstationById(tx, existing.substationId);

        if (!substation) {
          throw new AppError("Active Substation hierarchy not found", 422);
        }

        await this.authorizationService.checkAreaAccess(actor, { substationId: existing.substationId });

        if (payload.serialNumber) {
          const duplicateSerial = await this.lightningArresterRepository.findDuplicateBySerialNumber(tx, {
            serialNumber: payload.serialNumber,
            excludeId: id
          });

          if (duplicateSerial) {
            throw new AppError("Lightning Arrester serial number already exists", 409);
          }
        }

        const lightningArrester = await this.lightningArresterRepository.update(tx, id, {
          ...payload,
          updatedById: actor.id
        });

        this.auditLogService.record({
          userId: actor.id,
          action: "UPDATE",
          entity: "LightningArrester",
          entityId: lightningArrester.id
        });

        return lightningArrester;
      });
    } catch (error) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async softDelete(id: string, actor: AuthenticatedUser) {
    return this.lightningArresterRepository.runInTransaction(async (tx) => {
      const existing = await this.lightningArresterRepository.findAnyById(tx, id);

      if (!existing) {
        throw new AppError("Lightning Arrester not found", 404);
      }

      if (existing.deletedAt) {
        throw new AppError("Lightning Arrester is already deleted", 409);
      }

      const substation = await this.lightningArresterRepository.findActiveSubstationById(tx, existing.substationId);

      if (!substation) {
        throw new AppError("Active Substation hierarchy not found", 422);
      }

      await this.authorizationService.checkAreaAccess(actor, { substationId: existing.substationId });

      const lightningArrester = await this.lightningArresterRepository.softDelete(tx, id, actor.id);

      this.auditLogService.record({
        userId: actor.id,
        action: "DELETE",
        entity: "LightningArrester",
        entityId: lightningArrester.id
      });

      return lightningArrester;
    });
  }

  private handleUniqueConstraintError(error: unknown): never | void {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("Lightning Arrester code or serial number already exists", 409);
    }
  }
}
