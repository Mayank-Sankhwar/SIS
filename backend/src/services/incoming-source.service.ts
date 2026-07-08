import { Prisma } from "@prisma/client";
import { AuditLogService } from "./audit-log.service.js";
import { AuthorizationService, type AuthenticatedUser } from "./authorization.service.js";
import { IncomingSourceRepository } from "../repositories/incoming-source.repository.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreateIncomingSourceBody,
  ListIncomingSourcesQuery,
  UpdateIncomingSourceBody
} from "../validators/incoming-source.validator.js";

export class IncomingSourceService {
  constructor(
    private readonly incomingSourceRepository = new IncomingSourceRepository(),
    private readonly auditLogService = new AuditLogService(),
    private readonly authorizationService = new AuthorizationService()
  ) {}

  async create(payload: CreateIncomingSourceBody, actor: AuthenticatedUser) {
    try {
      return await this.incomingSourceRepository.runInTransaction(async (tx) => {
        const substation = await this.incomingSourceRepository.findActiveSubstationById(tx, payload.substationId);

        if (!substation) {
          throw new AppError("Active Substation hierarchy not found", 422);
        }

        await this.authorizationService.checkAreaAccess(actor, { substationId: payload.substationId });

        const duplicate = await this.incomingSourceRepository.findDuplicateBySourceName(tx, payload);

        if (duplicate) {
          throw new AppError("Incoming Source name already exists within this Substation", 409);
        }

        const incomingSource = await this.incomingSourceRepository.create(tx, {
          ...payload,
          createdById: actor.id
        });

        this.auditLogService.record({
          userId: actor.id,
          action: "CREATE",
          entity: "IncomingSource",
          entityId: incomingSource.id
        });

        return incomingSource;
      });
    } catch (error) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async getById(id: string, actor: AuthenticatedUser) {
    const incomingSource = await this.incomingSourceRepository.findById(id);

    if (!incomingSource) {
      throw new AppError("Incoming Source not found", 404);
    }

    await this.authorizationService.checkAreaAccess(actor, {
      substationId: incomingSource.substationId
    });

    return incomingSource;
  }

  async list(query: ListIncomingSourcesQuery, access: { userId: string; role: string }) {
    const { items, total } = await this.incomingSourceRepository.list(query, access);
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

  async update(id: string, payload: UpdateIncomingSourceBody, actor: AuthenticatedUser) {
    try {
      return await this.incomingSourceRepository.runInTransaction(async (tx) => {
        const existing = await this.incomingSourceRepository.findAnyById(tx, id);

        if (!existing) {
          throw new AppError("Incoming Source not found", 404);
        }

        if (existing.deletedAt) {
          throw new AppError("Deleted Incoming Source cannot be updated", 409);
        }

        const substation = await this.incomingSourceRepository.findActiveSubstationById(tx, existing.substationId);

        if (!substation) {
          throw new AppError("Active Substation hierarchy not found", 422);
        }

        await this.authorizationService.checkAreaAccess(actor, { substationId: existing.substationId });

        if (payload.sourceName) {
          const duplicate = await this.incomingSourceRepository.findDuplicateBySourceName(tx, {
            substationId: existing.substationId,
            sourceName: payload.sourceName,
            excludeId: id
          });

          if (duplicate) {
            throw new AppError("Incoming Source name already exists within this Substation", 409);
          }
        }

        const incomingSource = await this.incomingSourceRepository.update(tx, id, {
          ...payload,
          updatedById: actor.id
        });

        this.auditLogService.record({
          userId: actor.id,
          action: "UPDATE",
          entity: "IncomingSource",
          entityId: incomingSource.id
        });

        return incomingSource;
      });
    } catch (error) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async softDelete(id: string, actor: AuthenticatedUser) {
    return this.incomingSourceRepository.runInTransaction(async (tx) => {
      const existing = await this.incomingSourceRepository.findAnyById(tx, id);

      if (!existing) {
        throw new AppError("Incoming Source not found", 404);
      }

      if (existing.deletedAt) {
        throw new AppError("Incoming Source is already deleted", 409);
      }

      const substation = await this.incomingSourceRepository.findActiveSubstationById(tx, existing.substationId);

      if (!substation) {
        throw new AppError("Active Substation hierarchy not found", 422);
      }

      await this.authorizationService.checkAreaAccess(actor, { substationId: existing.substationId });

      const incomingSource = await this.incomingSourceRepository.softDelete(tx, id, actor.id);

      this.auditLogService.record({
        userId: actor.id,
        action: "DELETE",
        entity: "IncomingSource",
        entityId: incomingSource.id
      });

      return incomingSource;
    });
  }

  private handleUniqueConstraintError(error: unknown): never | void {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("Incoming Source name already exists within this Substation", 409);
    }
  }
}
