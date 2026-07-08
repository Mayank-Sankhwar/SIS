import { Prisma } from "@prisma/client";
import { AuditLogService } from "./audit-log.service.js";
import { SubstationRepository } from "../repositories/substation.repository.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreateSubstationBody,
  ListSubstationsQuery,
  UpdateSubstationBody
} from "../validators/substation.validator.js";

export class SubstationService {
  constructor(
    private readonly substationRepository = new SubstationRepository(),
    private readonly auditLogService = new AuditLogService()
  ) {}

  async create(payload: CreateSubstationBody, actorUserId: string) {
    try {
      return await this.substationRepository.runInTransaction(async (tx) => {
        const subVertical = await this.substationRepository.findActiveSubVerticalById(tx, payload.subVerticalId);

        if (!subVertical) {
          throw new AppError("Active SubVertical hierarchy not found", 422);
        }

        const duplicate = await this.substationRepository.findDuplicateByNameOrCode(tx, payload);

        if (duplicate) {
          this.throwDuplicateError(duplicate, payload);
        }

        const duplicateCoordinates = await this.substationRepository.findDuplicateCoordinates(tx, payload);

        if (duplicateCoordinates) {
          throw new AppError("Substation GIS coordinates already exist", 409);
        }

        const substation = await this.substationRepository.create(tx, {
          ...payload,
          createdById: actorUserId
        });

        this.auditLogService.record({
          userId: actorUserId,
          action: "CREATE",
          entity: "Substation",
          entityId: substation.id
        });

        return substation;
      });
    } catch (error) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async getById(id: string) {
    const substation = await this.substationRepository.findById(id);

    if (!substation) {
      throw new AppError("Substation not found", 404);
    }

    return substation;
  }

  async list(query: ListSubstationsQuery, access: { userId: string; role: string }) {
    const { items, total } = await this.substationRepository.list(query, access);
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

  async update(id: string, payload: UpdateSubstationBody, actorUserId: string) {
    try {
      return await this.substationRepository.runInTransaction(async (tx) => {
        const existing = await this.substationRepository.findAnyById(tx, id);

        if (!existing) {
          throw new AppError("Substation not found", 404);
        }

        if (existing.deletedAt) {
          throw new AppError("Deleted substation cannot be updated", 409);
        }

        const subVertical = await this.substationRepository.findActiveSubVerticalById(tx, existing.subVerticalId);

        if (!subVertical) {
          throw new AppError("Active SubVertical hierarchy not found", 422);
        }

        const duplicate = await this.substationRepository.findDuplicateByNameOrCode(tx, {
          subVerticalId: existing.subVerticalId,
          name: payload.name,
          code: payload.code,
          excludeId: id
        });

        if (duplicate) {
          this.throwDuplicateError(duplicate, payload);
        }

        const existingLatitude = existing.latitude === null ? undefined : Number(existing.latitude);
        const existingLongitude = existing.longitude === null ? undefined : Number(existing.longitude);
        const targetLatitude = payload.latitude ?? existingLatitude;
        const targetLongitude = payload.longitude ?? existingLongitude;
        const duplicateCoordinates = await this.substationRepository.findDuplicateCoordinates(tx, {
          latitude: targetLatitude,
          longitude: targetLongitude,
          excludeId: id
        });

        if (duplicateCoordinates) {
          throw new AppError("Substation GIS coordinates already exist", 409);
        }

        const substation = await this.substationRepository.update(tx, id, {
          ...payload,
          updatedById: actorUserId
        });

        this.auditLogService.record({
          userId: actorUserId,
          action: "UPDATE",
          entity: "Substation",
          entityId: substation.id
        });

        return substation;
      });
    } catch (error) {
      this.handleUniqueConstraintError(error);
      throw error;
    }
  }

  async softDelete(id: string, actorUserId: string) {
    return this.substationRepository.runInTransaction(async (tx) => {
      const existing = await this.substationRepository.findAnyById(tx, id);

      if (!existing) {
        throw new AppError("Substation not found", 404);
      }

      if (existing.deletedAt) {
        throw new AppError("Substation is already deleted", 409);
      }

      const equipmentCounts = await this.substationRepository.countEquipment(tx, id);
      const blockingEquipment = Object.entries(equipmentCounts)
        .filter(([, count]) => count > 0)
        .map(([name]) => name);

      if (blockingEquipment.length > 0) {
        throw new AppError(
          `Substation cannot be deleted because it contains ${blockingEquipment.join(", ")}`,
          409
        );
      }

      const substation = await this.substationRepository.softDelete(tx, id, actorUserId);

      this.auditLogService.record({
        userId: actorUserId,
        action: "DELETE",
        entity: "Substation",
        entityId: substation.id
      });

      return substation;
    });
  }

  private handleUniqueConstraintError(error: unknown): never | void {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("Substation name or code already exists within this SubVertical", 409);
    }
  }

  private throwDuplicateError(
    duplicate: { name: string; code: string },
    input: { name?: string; code?: string }
  ): never {
    if (input.name && duplicate.name.toLowerCase() === input.name.toLowerCase()) {
      throw new AppError("Substation name already exists within this SubVertical", 409);
    }

    if (input.code && duplicate.code.toLowerCase() === input.code.toLowerCase()) {
      throw new AppError("Substation code already exists within this SubVertical", 409);
    }

    throw new AppError("Duplicate substation found within this SubVertical", 409);
  }
}
