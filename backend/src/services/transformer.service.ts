import { Prisma } from "@prisma/client";
import { AuditLogService } from "./audit-log.service.js";
import { AuthorizationService, type AuthenticatedUser } from "./authorization.service.js";
import { TransformerRepository } from "../repositories/transformer.repository.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreateTransformerBody,
  ListTransformersQuery,
  UpdateTransformerBody
} from "../validators/transformer.validator.js";

export class TransformerService {
  constructor(
    private readonly transformerRepository = new TransformerRepository(),
    private readonly auditLogService = new AuditLogService(),
    private readonly authorizationService = new AuthorizationService()
  ) {}

  async create(payload: CreateTransformerBody, actor: AuthenticatedUser) {
    try {
      return await this.transformerRepository.runInTransaction(async (tx) => {
        const substation = await this.transformerRepository.findActiveSubstationById(tx, payload.substationId);

        if (!substation) {
          throw new AppError("Active Substation hierarchy not found", 422);
        }

        await this.authorizationService.checkAreaAccess(actor, { substationId: payload.substationId });

        const duplicateCode = await this.transformerRepository.findDuplicateByTransformerCode(tx, payload);

        if (duplicateCode) {
          throw new AppError("Transformer code already exists within this Substation", 409);
        }

        const duplicateSerial = await this.transformerRepository.findDuplicateBySerialNumber(tx, payload);

        if (duplicateSerial) {
          throw new AppError("Transformer serial number already exists", 409);
        }

        const transformer = await this.transformerRepository.create(tx, {
          ...payload,
          createdById: actor.id
        });

        this.auditLogService.record({
          userId: actor.id,
          action: "CREATE",
          entity: "Transformer",
          entityId: transformer.id
        });

        return transformer;
      });
    } catch (error) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async getById(id: string, actor: AuthenticatedUser) {
    const transformer = await this.transformerRepository.findById(id);

    if (!transformer) {
      throw new AppError("Transformer not found", 404);
    }

    await this.authorizationService.checkAreaAccess(actor, {
      substationId: transformer.substationId
    });

    return transformer;
  }

  async list(query: ListTransformersQuery, access: { userId: string; role: string }) {
    const { items, total } = await this.transformerRepository.list(query, access);
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

  async update(id: string, payload: UpdateTransformerBody, actor: AuthenticatedUser) {
    try {
      return await this.transformerRepository.runInTransaction(async (tx) => {
        const existing = await this.transformerRepository.findAnyById(tx, id);

        if (!existing) {
          throw new AppError("Transformer not found", 404);
        }

        if (existing.deletedAt) {
          throw new AppError("Deleted Transformer cannot be updated", 409);
        }

        const substation = await this.transformerRepository.findActiveSubstationById(tx, existing.substationId);

        if (!substation) {
          throw new AppError("Active Substation hierarchy not found", 422);
        }

        await this.authorizationService.checkAreaAccess(actor, { substationId: existing.substationId });

        if (payload.serialNumber) {
          const duplicateSerial = await this.transformerRepository.findDuplicateBySerialNumber(tx, {
            serialNumber: payload.serialNumber,
            excludeId: id
          });

          if (duplicateSerial) {
            throw new AppError("Transformer serial number already exists", 409);
          }
        }

        const transformer = await this.transformerRepository.update(tx, id, {
          ...payload,
          updatedById: actor.id
        });

        this.auditLogService.record({
          userId: actor.id,
          action: "UPDATE",
          entity: "Transformer",
          entityId: transformer.id
        });

        return transformer;
      });
    } catch (error) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async softDelete(id: string, actor: AuthenticatedUser) {
    return this.transformerRepository.runInTransaction(async (tx) => {
      const existing = await this.transformerRepository.findAnyById(tx, id);

      if (!existing) {
        throw new AppError("Transformer not found", 404);
      }

      if (existing.deletedAt) {
        throw new AppError("Transformer is already deleted", 409);
      }

      const substation = await this.transformerRepository.findActiveSubstationById(tx, existing.substationId);

      if (!substation) {
        throw new AppError("Active Substation hierarchy not found", 422);
      }

      await this.authorizationService.checkAreaAccess(actor, { substationId: existing.substationId });

      const transformer = await this.transformerRepository.softDelete(tx, id, actor.id);

      this.auditLogService.record({
        userId: actor.id,
        action: "DELETE",
        entity: "Transformer",
        entityId: transformer.id
      });

      return transformer;
    });
  }

  private handleUniqueConstraintError(error: unknown): never | void {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("Transformer code or serial number already exists", 409);
    }
  }
}
