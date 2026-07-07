import { VerticalRepository } from "../repositories/vertical.repository.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreateVerticalBody,
  ListVerticalsQuery,
  UpdateVerticalBody
} from "../validators/vertical.validator.js";

export class VerticalService {
  constructor(private readonly verticalRepository = new VerticalRepository()) {}

  async create(payload: CreateVerticalBody, actorUserId: string) {
    return this.verticalRepository.runInTransaction(async (tx) => {
      const zone = await this.verticalRepository.findActiveZoneById(tx, payload.zoneId);

      if (!zone) {
        throw new AppError("Active Zone not found", 422);
      }

      const duplicate = await this.verticalRepository.findDuplicateByNameOrCode(tx, payload);

      if (duplicate) {
        this.throwDuplicateError(duplicate, payload);
      }

      return this.verticalRepository.create(tx, {
        ...payload,
        createdById: actorUserId
      });
    });
  }

  async getById(id: string) {
    const vertical = await this.verticalRepository.findById(id);

    if (!vertical) {
      throw new AppError("Vertical not found", 404);
    }

    return vertical;
  }

  async list(query: ListVerticalsQuery) {
    const { items, total } = await this.verticalRepository.list(query);
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

  async update(id: string, payload: UpdateVerticalBody, actorUserId: string) {
    return this.verticalRepository.runInTransaction(async (tx) => {
      const existing = await this.verticalRepository.findAnyById(tx, id);

      if (!existing) {
        throw new AppError("Vertical not found", 404);
      }

      if (existing.deletedAt) {
        throw new AppError("Deleted vertical cannot be updated", 409);
      }

      const targetZoneId = payload.zoneId ?? existing.zoneId;
      const zone = await this.verticalRepository.findActiveZoneById(tx, targetZoneId);

      if (!zone) {
        throw new AppError("Active Zone not found", 422);
      }

      const duplicate = await this.verticalRepository.findDuplicateByNameOrCode(tx, {
        zoneId: targetZoneId,
        name: payload.name,
        code: payload.code,
        excludeId: id
      });

      if (duplicate) {
        this.throwDuplicateError(duplicate, payload);
      }

      return this.verticalRepository.update(tx, id, {
        ...payload,
        updatedById: actorUserId
      });
    });
  }

  async softDelete(id: string, actorUserId: string) {
    return this.verticalRepository.runInTransaction(async (tx) => {
      const existing = await this.verticalRepository.findAnyById(tx, id);

      if (!existing) {
        throw new AppError("Vertical not found", 404);
      }

      if (existing.deletedAt) {
        throw new AppError("Vertical is already deleted", 409);
      }

      const subVerticalCount = await this.verticalRepository.countSubVerticals(tx, id);

      if (subVerticalCount > 0) {
        throw new AppError("Vertical cannot be deleted because it contains SubVerticals", 409);
      }

      return this.verticalRepository.softDelete(tx, id, actorUserId);
    });
  }

  private throwDuplicateError(
    duplicate: { name: string; code: string },
    input: { name?: string; code?: string }
  ): never {
    if (input.name && duplicate.name.toLowerCase() === input.name.toLowerCase()) {
      throw new AppError("Vertical name already exists within this Zone", 409);
    }

    if (input.code && duplicate.code.toLowerCase() === input.code.toLowerCase()) {
      throw new AppError("Vertical code already exists within this Zone", 409);
    }

    throw new AppError("Duplicate vertical found within this Zone", 409);
  }
}
