import { SubVerticalRepository } from "../repositories/sub-vertical.repository.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreateSubVerticalBody,
  ListSubVerticalsQuery,
  UpdateSubVerticalBody
} from "../validators/sub-vertical.validator.js";

export class SubVerticalService {
  constructor(private readonly subVerticalRepository = new SubVerticalRepository()) {}

  async create(payload: CreateSubVerticalBody, actorUserId: string) {
    return this.subVerticalRepository.runInTransaction(async (tx) => {
      const vertical = await this.subVerticalRepository.findActiveVerticalById(tx, payload.verticalId);

      if (!vertical) {
        throw new AppError("Active Vertical not found", 422);
      }

      const duplicate = await this.subVerticalRepository.findDuplicateByNameOrCode(tx, payload);

      if (duplicate) {
        this.throwDuplicateError(duplicate, payload);
      }

      return this.subVerticalRepository.create(tx, {
        ...payload,
        createdById: actorUserId
      });
    });
  }

  async getById(id: string) {
    const subVertical = await this.subVerticalRepository.findById(id);

    if (!subVertical) {
      throw new AppError("SubVertical not found", 404);
    }

    return subVertical;
  }

  async list(query: ListSubVerticalsQuery) {
    const { items, total } = await this.subVerticalRepository.list(query);
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

  async update(id: string, payload: UpdateSubVerticalBody, actorUserId: string) {
    return this.subVerticalRepository.runInTransaction(async (tx) => {
      const existing = await this.subVerticalRepository.findAnyById(tx, id);

      if (!existing) {
        throw new AppError("SubVertical not found", 404);
      }

      if (existing.deletedAt) {
        throw new AppError("Deleted subvertical cannot be updated", 409);
      }

      const targetVerticalId = payload.verticalId ?? existing.verticalId;
      const vertical = await this.subVerticalRepository.findActiveVerticalById(tx, targetVerticalId);

      if (!vertical) {
        throw new AppError("Active Vertical not found", 422);
      }

      const duplicate = await this.subVerticalRepository.findDuplicateByNameOrCode(tx, {
        verticalId: targetVerticalId,
        name: payload.name,
        code: payload.code,
        excludeId: id
      });

      if (duplicate) {
        this.throwDuplicateError(duplicate, payload);
      }

      return this.subVerticalRepository.update(tx, id, {
        ...payload,
        updatedById: actorUserId
      });
    });
  }

  async softDelete(id: string, actorUserId: string) {
    return this.subVerticalRepository.runInTransaction(async (tx) => {
      const existing = await this.subVerticalRepository.findAnyById(tx, id);

      if (!existing) {
        throw new AppError("SubVertical not found", 404);
      }

      if (existing.deletedAt) {
        throw new AppError("SubVertical is already deleted", 409);
      }

      const substationCount = await this.subVerticalRepository.countSubstations(tx, id);

      if (substationCount > 0) {
        throw new AppError("SubVertical cannot be deleted because it contains Substations", 409);
      }

      return this.subVerticalRepository.softDelete(tx, id, actorUserId);
    });
  }

  private throwDuplicateError(
    duplicate: { name: string; code: string },
    input: { name?: string; code?: string }
  ): never {
    if (input.name && duplicate.name.toLowerCase() === input.name.toLowerCase()) {
      throw new AppError("SubVertical name already exists within this Vertical", 409);
    }

    if (input.code && duplicate.code.toLowerCase() === input.code.toLowerCase()) {
      throw new AppError("SubVertical code already exists within this Vertical", 409);
    }

    throw new AppError("Duplicate subvertical found within this Vertical", 409);
  }
}
