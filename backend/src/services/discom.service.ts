import { AppError } from "../utils/app-error.js";
import { DiscomRepository } from "../repositories/discom.repository.js";
import type {
  CreateDiscomBody,
  ListDiscomsQuery,
  UpdateDiscomBody
} from "../validators/discom.validator.js";

export class DiscomService {
  constructor(private readonly discomRepository = new DiscomRepository()) {}

  async create(payload: CreateDiscomBody, actorUserId: string) {
    return this.discomRepository.runInTransaction(async (tx) => {
      const duplicate = await this.discomRepository.findDuplicateByNameOrCode(tx, payload);

      if (duplicate) {
        this.throwDuplicateError(duplicate, payload);
      }

      return this.discomRepository.create(tx, {
        name: payload.name,
        code: payload.code,
        createdById: actorUserId
      });
    });
  }

  async getById(id: string) {
    const discom = await this.discomRepository.findById(id);

    if (!discom) {
      throw new AppError("Discom not found", 404);
    }

    return discom;
  }

  async list(query: ListDiscomsQuery) {
    const { items, total } = await this.discomRepository.list(query);
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

  async update(id: string, payload: UpdateDiscomBody, actorUserId: string) {
    return this.discomRepository.runInTransaction(async (tx) => {
      const existing = await this.discomRepository.findAnyById(tx, id);

      if (!existing) {
        throw new AppError("Discom not found", 404);
      }

      if (existing.deletedAt) {
        throw new AppError("Deleted discom cannot be updated", 409);
      }

      const duplicate = await this.discomRepository.findDuplicateByNameOrCode(tx, {
        name: payload.name,
        code: payload.code,
        excludeId: id
      });

      if (duplicate) {
        this.throwDuplicateError(duplicate, payload);
      }

      return this.discomRepository.update(tx, id, {
        ...payload,
        updatedById: actorUserId
      });
    });
  }

  async softDelete(id: string, actorUserId: string) {
    return this.discomRepository.runInTransaction(async (tx) => {
      const existing = await this.discomRepository.findAnyById(tx, id);

      if (!existing) {
        throw new AppError("Discom not found", 404);
      }

      if (existing.deletedAt) {
        throw new AppError("Discom is already deleted", 409);
      }

      return this.discomRepository.softDelete(tx, id, actorUserId);
    });
  }

  private throwDuplicateError(
    duplicate: { name: string; code: string },
    input: { name?: string; code?: string }
  ): never {
    if (input.name && duplicate.name.toLowerCase() === input.name.toLowerCase()) {
      throw new AppError("Discom name already exists", 409);
    }

    if (input.code && duplicate.code.toLowerCase() === input.code.toLowerCase()) {
      throw new AppError("Discom code already exists", 409);
    }

    throw new AppError("Duplicate discom found", 409);
  }
}
