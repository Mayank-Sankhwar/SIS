import type { Prisma, RoleName } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export type PrismaTx = Prisma.TransactionClient;

export class UserManagementRepository {
  runInTransaction<T>(callback: (tx: PrismaTx) => Promise<T>): Promise<T> {
    return prisma.$transaction(callback, {
      maxWait: 10_000,
      timeout: 120_000
    });
  }

  findRoleByName(tx: PrismaTx, name: RoleName) {
    return tx.role.findUnique({
      where: { name },
      select: {
        id: true,
        name: true
      }
    });
  }

  findUserByEmail(tx: PrismaTx, email: string) {
    return tx.user.findUnique({
      where: { email },
      select: {
        id: true
      }
    });
  }

  findUserByEmployeeId(tx: PrismaTx, employeeId: string, excludeUserId?: string) {
    return tx.user.findFirst({
      where: {
        employeeId,
        ...(excludeUserId ? { id: { not: excludeUserId } } : {})
      },
      select: {
        id: true
      }
    });
  }

  findUserByMobileNumber(tx: PrismaTx, mobileNumber: string, excludeUserId?: string) {
    return tx.user.findFirst({
      where: {
        mobileNumber,
        ...(excludeUserId ? { id: { not: excludeUserId } } : {})
      },
      select: {
        id: true
      }
    });
  }

  findCreatorWithAssignments(tx: PrismaTx, creatorId: string) {
    return tx.user.findFirst({
      where: {
        id: creatorId,
        isActive: true,
        deletedAt: null
      },
      select: {
        id: true,
        role: {
          select: {
            name: true
          }
        },
        areaMappings: {
          where: {
            isActive: true,
            deletedAt: null
          },
          select: {
            areaType: true,
            discomId: true,
            zoneId: true,
            verticalId: true,
            subVerticalId: true,
            substationId: true
          }
        }
      }
    });
  }

  createUser(
    tx: PrismaTx,
    data: {
      roleId: string;
      parentUserId: string;
      name: string;
      email: string;
      employeeId?: string;
      designation?: string;
      passwordHash: string;
      createdById: string;
    }
  ) {
    return tx.user.create({
      data: {
        roleId: data.roleId,
        parentUserId: data.parentUserId,
        name: data.name,
        email: data.email,
        employeeId: data.employeeId,
        designation: data.designation,
        passwordHash: data.passwordHash,
        requirePasswordChange: true,
        profileCompleted: false,
        isActive: true,
        createdById: data.createdById,
        updatedById: data.createdById
      },
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        designation: true,
        requirePasswordChange: true,
        role: {
          select: {
            name: true
          }
        },
        parentUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  createAreaMapping(
    tx: PrismaTx,
    data: {
      userId: string;
      areaType: "DISCOM" | "ZONE" | "VERTICAL" | "SUB_VERTICAL" | "SUBSTATION";
      discomId?: string;
      zoneId?: string;
      verticalId?: string;
      subVerticalId?: string;
      substationId?: string;
      isPrimary: boolean;
      createdById: string;
    }
  ) {
    return tx.userAreaMapping.create({
      data: {
        userId: data.userId,
        areaType: data.areaType,
        discomId: data.discomId,
        zoneId: data.zoneId,
        verticalId: data.verticalId,
        subVerticalId: data.subVerticalId,
        substationId: data.substationId,
        isPrimary: data.isPrimary,
        isActive: true,
        createdById: data.createdById,
        updatedById: data.createdById
      }
    });
  }

  updateProfile(
    tx: PrismaTx,
    userId: string,
    data: {
      mobileNumber: string;
      employeeId: string;
      designation: string;
      profileData: Prisma.InputJsonValue;
    }
  ) {
    return tx.user.update({
      where: { id: userId },
      data: {
        mobileNumber: data.mobileNumber,
        employeeId: data.employeeId,
        designation: data.designation,
        profileData: data.profileData,
        profileCompleted: true,
        updatedById: userId
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobileNumber: true,
        employeeId: true,
        designation: true,
        profileCompleted: true,
        requirePasswordChange: true
      }
    });
  }

  async findAreaHierarchy(
    tx: PrismaTx,
    area: {
      discomId?: string;
      zoneId?: string;
      verticalId?: string;
      subVerticalId?: string;
      substationId?: string;
    }
  ) {
    if (area.substationId) {
      const substation = await tx.substation.findFirst({
        where: { id: area.substationId, isActive: true, deletedAt: null },
        select: {
          id: true,
          subVertical: {
            select: {
              id: true,
              vertical: {
                select: {
                  id: true,
                  zone: {
                    select: {
                      id: true,
                      discomId: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      return substation
        ? {
            discomId: substation.subVertical.vertical.zone.discomId,
            zoneId: substation.subVertical.vertical.zone.id,
            verticalId: substation.subVertical.vertical.id,
            subVerticalId: substation.subVertical.id,
            substationId: substation.id
          }
        : null;
    }

    if (area.subVerticalId) {
      const subVertical = await tx.subVertical.findFirst({
        where: { id: area.subVerticalId, isActive: true, deletedAt: null },
        select: {
          id: true,
          vertical: {
            select: {
              id: true,
              zone: {
                select: {
                  id: true,
                  discomId: true
                }
              }
            }
          }
        }
      });

      return subVertical
        ? {
            discomId: subVertical.vertical.zone.discomId,
            zoneId: subVertical.vertical.zone.id,
            verticalId: subVertical.vertical.id,
            subVerticalId: subVertical.id
          }
        : null;
    }

    if (area.verticalId) {
      const vertical = await tx.vertical.findFirst({
        where: { id: area.verticalId, isActive: true, deletedAt: null },
        select: {
          id: true,
          zone: {
            select: {
              id: true,
              discomId: true
            }
          }
        }
      });

      return vertical
        ? {
            discomId: vertical.zone.discomId,
            zoneId: vertical.zone.id,
            verticalId: vertical.id
          }
        : null;
    }

    if (area.zoneId) {
      const zone = await tx.zone.findFirst({
        where: { id: area.zoneId, isActive: true, deletedAt: null },
        select: { id: true, discomId: true }
      });

      return zone ? { discomId: zone.discomId, zoneId: zone.id } : null;
    }

    if (area.discomId) {
      const discom = await tx.discom.findFirst({
        where: { id: area.discomId, isActive: true, deletedAt: null },
        select: { id: true }
      });

      return discom ? { discomId: discom.id } : null;
    }

    return null;
  }
}
