import { Prisma } from "@prisma/client";
import { AuditLogService } from "./audit-log.service.js";
import { AuthorizationService, type AuthenticatedUser } from "./authorization.service.js";
import { OutgoingFeederRepository } from "../repositories/outgoing-feeder.repository.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreateOutgoingFeederBody,
  ListOutgoingFeedersQuery,
  UpdateOutgoingFeederBody
} from "../validators/outgoing-feeder.validator.js";

export class OutgoingFeederService {
  constructor(
    private readonly outgoingFeederRepository = new OutgoingFeederRepository(),
    private readonly auditLogService = new AuditLogService(),
    private readonly authorizationService = new AuthorizationService()
  ) {}

  async create(payload: CreateOutgoingFeederBody, actor: AuthenticatedUser) {
    try {
      return await this.outgoingFeederRepository.runInTransaction(async (tx) => {
        const substation = await this.outgoingFeederRepository.findActiveSubstationById(tx, payload.substationId);

        if (!substation) {
          throw new AppError("Active Substation hierarchy not found", 422);
        }

        await this.authorizationService.checkAreaAccess(actor, { substationId: payload.substationId });

        const duplicate = await this.outgoingFeederRepository.findDuplicateByFeederNameOrCode(tx, payload);

        if (duplicate) {
          this.throwDuplicateError(duplicate, payload);
        }

        const outgoingFeeder = await this.outgoingFeederRepository.create(tx, {
          ...payload,
          createdById: actor.id
        });

        this.auditLogService.record({
          userId: actor.id,
          action: "CREATE",
          entity: "OutgoingFeeder",
          entityId: outgoingFeeder.id
        });

        return outgoingFeeder;
      });
    } catch (error) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async getById(id: string, actor: AuthenticatedUser) {
    const outgoingFeeder = await this.outgoingFeederRepository.findById(id);

    if (!outgoingFeeder) {
      throw new AppError("Outgoing Feeder not found", 404);
    }

    await this.authorizationService.checkAreaAccess(actor, {
      substationId: outgoingFeeder.substationId
    });

    return outgoingFeeder;
  }

  async list(query: ListOutgoingFeedersQuery, access: { userId: string; role: string }) {
    const { items, total } = await this.outgoingFeederRepository.list(query, access);
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

  async update(id: string, payload: UpdateOutgoingFeederBody, actor: AuthenticatedUser) {
    try {
      return await this.outgoingFeederRepository.runInTransaction(async (tx) => {
        const existing = await this.outgoingFeederRepository.findAnyById(tx, id);

        if (!existing) {
          throw new AppError("Outgoing Feeder not found", 404);
        }

        if (existing.deletedAt) {
          throw new AppError("Deleted Outgoing Feeder cannot be updated", 409);
        }

        const substation = await this.outgoingFeederRepository.findActiveSubstationById(tx, existing.substationId);

        if (!substation) {
          throw new AppError("Active Substation hierarchy not found", 422);
        }

        await this.authorizationService.checkAreaAccess(actor, { substationId: existing.substationId });

        if (payload.feederName || payload.feederCode) {
          const duplicate = await this.outgoingFeederRepository.findDuplicateByFeederNameOrCode(tx, {
            substationId: existing.substationId,
            feederName: payload.feederName,
            feederCode: payload.feederCode,
            excludeId: id
          });

          if (duplicate) {
            this.throwDuplicateError(duplicate, payload);
          }
        }

        const outgoingFeeder = await this.outgoingFeederRepository.update(tx, id, {
          ...payload,
          updatedById: actor.id
        });

        this.auditLogService.record({
          userId: actor.id,
          action: "UPDATE",
          entity: "OutgoingFeeder",
          entityId: outgoingFeeder.id
        });

        return outgoingFeeder;
      });
    } catch (error) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async softDelete(id: string, actor: AuthenticatedUser) {
    return this.outgoingFeederRepository.runInTransaction(async (tx) => {
      const existing = await this.outgoingFeederRepository.findAnyById(tx, id);

      if (!existing) {
        throw new AppError("Outgoing Feeder not found", 404);
      }

      if (existing.deletedAt) {
        throw new AppError("Outgoing Feeder is already deleted", 409);
      }

      const substation = await this.outgoingFeederRepository.findActiveSubstationById(tx, existing.substationId);

      if (!substation) {
        throw new AppError("Active Substation hierarchy not found", 422);
      }

      await this.authorizationService.checkAreaAccess(actor, { substationId: existing.substationId });

      const outgoingFeeder = await this.outgoingFeederRepository.softDelete(tx, id, actor.id);

      this.auditLogService.record({
        userId: actor.id,
        action: "DELETE",
        entity: "OutgoingFeeder",
        entityId: outgoingFeeder.id
      });

      return outgoingFeeder;
    });
  }

  private handleUniqueConstraintError(error: unknown): never | void {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("Outgoing Feeder name or code already exists within this Substation", 409);
    }
  }

  private throwDuplicateError(
    duplicate: { feederName: string; feederCode: string | null },
    input: { feederName?: string; feederCode?: string }
  ): never {
    if (input.feederName && duplicate.feederName.toLowerCase() === input.feederName.toLowerCase()) {
      throw new AppError("Outgoing Feeder name already exists within this Substation", 409);
    }

    if (input.feederCode && duplicate.feederCode?.toLowerCase() === input.feederCode.toLowerCase()) {
      throw new AppError("Outgoing Feeder code already exists within this Substation", 409);
    }

    throw new AppError("Duplicate Outgoing Feeder found within this Substation", 409);
  }
}
