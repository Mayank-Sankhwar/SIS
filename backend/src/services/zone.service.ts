import { AppError } from "../utils/app-error.js";
import { ZoneRepository } from "../repositories/zone.repository.js";
import type {
  CreateZoneBody,
  ListZonesQuery,
  UpdateZoneBody
} from "../validators/zone.validator.js";

export class ZoneService {
  constructor(private readonly zoneRepository = new ZoneRepository()) {}

  async create(payload: CreateZoneBody, actorUserId: string) {
    return this.zoneRepository.runInTransaction(async (tx) => {
      const discom = await this.zoneRepository.findActiveDiscomById(tx, payload.discomId);

      if (!discom) {
        throw new AppError("Active Discom not found", 422);
      }

      const duplicate = await this.zoneRepository.findDuplicateByNameOrCode(tx, payload);

      if (duplicate) {
        this.throwDuplicateError(duplicate, payload);
      }

      return this.zoneRepository.create(tx, {
        ...payload,
        createdById: actorUserId
      });
    });
  }

  async getById(id: string) {
    const zone = await this.zoneRepository.findById(id);

    if (!zone) {
      throw new AppError("Zone not found", 404);
    }

    return zone;
  }

  async list(query: ListZonesQuery) {
    const { items, total } = await this.zoneRepository.list(query);
    const totalPages = Math.ceil(total / query.limit);

    return {
      items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPreviousPage: query.page > 1
      }
    };
  }

  async update(id: string, payload: UpdateZoneBody, actorUserId: string) {
    return this.zoneRepository.runInTransaction(async (tx) => {
      const existing = await this.zoneRepository.findAnyById(tx, id);

      if (!existing) {
        throw new AppError("Zone not found", 404);
      }

      if (existing.deletedAt) {
        throw new AppError("Deleted zone cannot be updated", 409);
      }

      const targetDiscomId = payload.discomId ?? existing.discomId;
      const discom = await this.zoneRepository.findActiveDiscomById(tx, targetDiscomId);

      if (!discom) {
        throw new AppError("Active Discom not found", 422);
      }

      const duplicate = await this.zoneRepository.findDuplicateByNameOrCode(tx, {
        discomId: targetDiscomId,
        name: payload.name,
        code: payload.code,
        excludeId: id
      });

      if (duplicate) {
        this.throwDuplicateError(duplicate, payload);
      }

      return this.zoneRepository.update(tx, id, {
        ...payload,
        updatedById: actorUserId
      });
    });
  }

  async softDelete(id: string, actorUserId: string) {
    return this.zoneRepository.runInTransaction(async (tx) => {
      const existing = await this.zoneRepository.findAnyById(tx, id);

      if (!existing) {
        throw new AppError("Zone not found", 404);
      }

      if (existing.deletedAt) {
        throw new AppError("Zone is already deleted", 409);
      }

      const verticalCount = await this.zoneRepository.countVerticals(tx, id);

      if (verticalCount > 0) {
        throw new AppError("Zone cannot be deleted because it contains Verticals", 409);
      }

      return this.zoneRepository.softDelete(tx, id, actorUserId);
    });
  }

  private throwDuplicateError(
    duplicate: { name: string; code: string },
    input: { name?: string; code?: string }
  ): never {
    if (input.name && duplicate.name.toLowerCase() === input.name.toLowerCase()) {
      throw new AppError("Zone name already exists within this Discom", 409);
    }

    if (input.code && duplicate.code.toLowerCase() === input.code.toLowerCase()) {
      throw new AppError("Zone code already exists within this Discom", 409);
    }

    throw new AppError("Duplicate zone found within this Discom", 409);
  }
}
