import { randomBytes } from "node:crypto";
import { RoleName } from "@prisma/client";
import type { AreaType, Prisma } from "@prisma/client";
import { hashPassword } from "../utils/password.js";
import { AppError } from "../utils/app-error.js";
import type { AuthenticatedUser } from "./authorization.service.js";
import {
  type CompleteProfileBody,
  type CreateUserAreaMappingBody,
  type CreateUserBody
} from "../validators/user-management.validator.js";
import {
  type PrismaTx,
  UserManagementRepository
} from "../repositories/user-management.repository.js";

interface AreaHierarchy {
  discomId?: string;
  zoneId?: string;
  verticalId?: string;
  subVerticalId?: string;
  substationId?: string;
}

interface CreatorAssignment {
  areaType: AreaType;
  discomId: string | null;
  zoneId: string | null;
  verticalId: string | null;
  subVerticalId: string | null;
  substationId: string | null;
}

export class UserManagementService {
  constructor(private readonly userManagementRepository = new UserManagementRepository()) {}

  async createUser(authenticatedUser: AuthenticatedUser | undefined, payload: CreateUserBody) {
    if (!authenticatedUser) {
      throw new AppError("Authentication required", 401);
    }

    const temporaryPassword = this.generateTemporaryPassword();
    const passwordHash = await hashPassword(temporaryPassword);
    const email = payload.email.toLowerCase();

    return this.userManagementRepository.runInTransaction(async (tx) => {
      const creator = await this.userManagementRepository.findCreatorWithAssignments(tx, authenticatedUser.id);

      if (!creator) {
        throw new AppError("Creator account is inactive", 403);
      }

      this.assertRoleHierarchy(creator.role.name, payload.role);
      this.assertAreaMappings(payload.areaMappings);

      const [existingEmail, targetRole, existingEmployee] = await Promise.all([
        this.userManagementRepository.findUserByEmail(tx, email),
        this.userManagementRepository.findRoleByName(tx, payload.role),
        payload.employeeId
          ? this.userManagementRepository.findUserByEmployeeId(tx, payload.employeeId)
          : Promise.resolve(null)
      ]);

      if (existingEmail) {
        throw new AppError("Email already exists", 409);
      }

      if (existingEmployee) {
        throw new AppError("Employee ID already exists", 409);
      }

      if (!targetRole) {
        throw new AppError("Invalid role", 422);
      }

      await this.validateCreatorAreaScope(tx, creator.areaMappings, payload.areaMappings);

      const user = await this.userManagementRepository.createUser(tx, {
        roleId: targetRole.id,
        parentUserId: creator.id,
        name: payload.name,
        email,
        employeeId: payload.employeeId,
        designation: payload.designation,
        passwordHash,
        createdById: creator.id
      });

      const mappings = [];
      for (const mapping of payload.areaMappings) {
        mappings.push(
          await this.userManagementRepository.createAreaMapping(tx, {
            userId: user.id,
            areaType: mapping.areaType,
            discomId: mapping.discomId,
            zoneId: mapping.zoneId,
            verticalId: mapping.verticalId,
            subVerticalId: mapping.subVerticalId,
            substationId: mapping.substationId,
            isPrimary: mapping.isPrimary,
            createdById: creator.id
          })
        );
      }

      return {
        user,
        temporaryPassword,
        areaMappings: mappings.map((mapping) => ({
          id: mapping.id,
          areaType: mapping.areaType,
          isPrimary: mapping.isPrimary,
          discomId: mapping.discomId,
          zoneId: mapping.zoneId,
          verticalId: mapping.verticalId,
          subVerticalId: mapping.subVerticalId,
          substationId: mapping.substationId
        }))
      };
    });
  }

  async completeProfile(authenticatedUser: AuthenticatedUser | undefined, payload: CompleteProfileBody) {
    if (!authenticatedUser) {
      throw new AppError("Authentication required", 401);
    }

    return this.userManagementRepository.runInTransaction(async (tx) => {
      const [existingEmployee, existingMobile] = await Promise.all([
        this.userManagementRepository.findUserByEmployeeId(tx, payload.employeeId, authenticatedUser.id),
        this.userManagementRepository.findUserByMobileNumber(tx, payload.mobileNumber, authenticatedUser.id)
      ]);

      if (existingEmployee) {
        throw new AppError("Employee ID already exists", 409);
      }

      if (existingMobile) {
        throw new AppError("Mobile number already exists", 409);
      }

      return this.userManagementRepository.updateProfile(tx, authenticatedUser.id, {
        mobileNumber: payload.mobileNumber,
        employeeId: payload.employeeId,
        designation: payload.designation,
        profileData: this.toJsonValue(payload.profileData)
      });
    });
  }

  private assertRoleHierarchy(creatorRole: RoleName, requestedRole: RoleName): void {
    const allowedChildRoleByCreator: Partial<Record<RoleName, RoleName>> = {
      ADMIN: RoleName.EE,
      EE: RoleName.AE,
      AE: RoleName.JE
    };

    if (allowedChildRoleByCreator[creatorRole] !== requestedRole) {
      throw new AppError("Invalid role hierarchy", 403);
    }
  }

  private assertAreaMappings(areaMappings: CreateUserAreaMappingBody[]): void {
    const primaryCount = areaMappings.filter((mapping) => mapping.isPrimary).length;

    if (primaryCount !== 1) {
      throw new AppError("Exactly one primary area mapping is required", 422);
    }

    const seenMappings = new Set<string>();
    for (const mapping of areaMappings) {
      const key = this.getMappingKey(mapping);

      if (seenMappings.has(key)) {
        throw new AppError("Duplicate area mapping", 409);
      }

      seenMappings.add(key);
    }
  }

  private async validateCreatorAreaScope(
    tx: PrismaTx,
    creatorAssignments: CreatorAssignment[],
    requestedMappings: CreateUserAreaMappingBody[]
  ): Promise<void> {
    if (!creatorAssignments.length) {
      throw new AppError("Creator does not have assigned areas", 403);
    }

    for (const mapping of requestedMappings) {
      const hierarchy = await this.userManagementRepository.findAreaHierarchy(tx, mapping);

      if (!hierarchy) {
        throw new AppError("Assigned area was not found", 422);
      }

      const hasAccess = creatorAssignments.some((assignment) =>
        this.assignmentCoversHierarchy(assignment, hierarchy)
      );

      if (!hasAccess) {
        throw new AppError("Cannot assign area outside your control", 403);
      }
    }
  }

  private assignmentCoversHierarchy(assignment: CreatorAssignment, hierarchy: AreaHierarchy): boolean {
    const checks: Record<AreaType, boolean> = {
      DISCOM: Boolean(assignment.discomId && assignment.discomId === hierarchy.discomId),
      ZONE: Boolean(assignment.zoneId && assignment.zoneId === hierarchy.zoneId),
      VERTICAL: Boolean(assignment.verticalId && assignment.verticalId === hierarchy.verticalId),
      SUB_VERTICAL: Boolean(assignment.subVerticalId && assignment.subVerticalId === hierarchy.subVerticalId),
      SUBSTATION: Boolean(assignment.substationId && assignment.substationId === hierarchy.substationId)
    };

    return checks[assignment.areaType];
  }

  private getMappingKey(mapping: CreateUserAreaMappingBody): string {
    return [
      mapping.areaType,
      mapping.discomId,
      mapping.zoneId,
      mapping.verticalId,
      mapping.subVerticalId,
      mapping.substationId
    ]
      .filter(Boolean)
      .join(":");
  }

  private generateTemporaryPassword(): string {
    return `${randomBytes(18).toString("base64url")}Aa1!`;
  }

  private toJsonValue(value: Record<string, unknown>): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
  }
}
