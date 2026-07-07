import { SubstationRepository } from "../repositories/substation.repository.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreateSubstationBody,
  UpdateSubstationBody
} from "../validators/substation.validator.js";

export class SubstationService {
  constructor(private readonly substationRepository = new SubstationRepository()) {}

  async create(payload: CreateSubstationBody, actorUserId: string) {
    return this.substationRepository.runInTransaction(async (tx) => {
      const subVertical = await this.substationRepository.findActiveSubVerticalById(tx, payload.subVerticalId);

      if (!subVertical) {
        throw new AppError("Active SubVertical hierarchy not found", 422);
      }

      const duplicate = await this.substationRepository.findDuplicateByNameOrCode(tx, payload);

      if (duplicate) {
        this.throwDuplicateError(duplicate, payload);
      }

      return this.substationRepository.create(tx, {
        ...payload,
        createdById: actorUserId
      });
    });
  }

  async getById(id: string) {
    const substation = await this.substationRepository.findById(id);

    if (!substation) {
      throw new AppError("Substation not found", 404);
    }

    return substation;
  }

  async update(id: string, payload: UpdateSubstationBody, actorUserId: string) {
    return this.substationRepository.runInTransaction(async (tx) => {
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

      return this.substationRepository.update(tx, id, {
        ...payload,
        updatedById: actorUserId
      });
    });
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
