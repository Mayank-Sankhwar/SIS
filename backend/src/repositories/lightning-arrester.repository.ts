import { Prisma, type AreaType } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import type {
  CreateLightningArresterBody,
  ListLightningArrestersQuery,
  UpdateLightningArresterBody
} from "../validators/lightning-arrester.validator.js";

export type PrismaTx = Prisma.TransactionClient;

interface UserAreaAssignment {
  areaType: AreaType;
  discomId: string | null;
  zoneId: string | null;
  verticalId: string | null;
  subVerticalId: string | null;
  substationId: string | null;
}

interface ListLightningArrestersAccess {
  userId: string;
  role: string;
}

const hierarchySelect = {
  id: true,
  name: true,
  code: true,
  isActive: true,
  deletedAt: true,
  subVertical: {
    select: {
      id: true,
      name: true,
      code: true,
      isActive: true,
      deletedAt: true,
      vertical: {
        select: {
          id: true,
          name: true,
          code: true,
          isActive: true,
          deletedAt: true,
          zone: {
            select: {
              id: true,
              name: true,
              code: true,
              isActive: true,
              deletedAt: true,
              discom: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  isActive: true,
                  deletedAt: true
                }
              }
            }
          }
        }
      }
    }
  }
} satisfies Prisma.SubstationSelect;

const lightningArresterListSelect = {
  id: true,
  substationId: true,
  arresterCode: true,
  locationDescription: true,
  voltageRatingKv: true,
  make: true,
  serialNumber: true,
  installationDate: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  substation: {
    select: hierarchySelect
  }
} satisfies Prisma.LightningArresterSelect;

const lightningArresterDetailSelect = {
  id: true,
  substationId: true,
  arresterCode: true,
  locationDescription: true,
  voltageRatingKv: true,
  make: true,
  serialNumber: true,
  installationDate: true,
  isActive: true,
  createdById: true,
  updatedById: true,
  deletedById: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  substation: {
    select: hierarchySelect
  },
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
  updatedBy: {
    select: {
      id: true,
      name: true,
      email: true
    }
  },
  deletedBy: {
    select: {
      id: true,
      name: true,
      email: true
    }
  }
} satisfies Prisma.LightningArresterSelect;

export class LightningArresterRepository {
  runInTransaction<T>(callback: (tx: PrismaTx) => Promise<T>): Promise<T> {
    return prisma.$transaction(callback);
  }

  findActiveSubstationById(tx: PrismaTx, substationId: string) {
    return tx.substation.findFirst({
      where: {
        id: substationId,
        isActive: true,
        deletedAt: null,
        subVertical: {
          isActive: true,
          deletedAt: null,
          vertical: {
            isActive: true,
            deletedAt: null,
            zone: {
              isActive: true,
              deletedAt: null,
              discom: {
                isActive: true,
                deletedAt: null
              }
            }
          }
        }
      },
      select: {
        id: true
      }
    });
  }

  findDuplicateByArresterCode(
    tx: PrismaTx,
    input: { substationId: string; arresterCode: string; excludeId?: string }
  ) {
    return tx.lightningArrester.findFirst({
      where: {
        substationId: input.substationId,
        arresterCode: {
          equals: input.arresterCode,
          mode: Prisma.QueryMode.insensitive
        },
        ...(input.excludeId ? { id: { not: input.excludeId } } : {})
      },
      select: {
        id: true,
        arresterCode: true
      }
    });
  }

  findDuplicateBySerialNumber(tx: PrismaTx, input: { serialNumber?: string; excludeId?: string }) {
    if (!input.serialNumber) {
      return null;
    }

    return tx.lightningArrester.findFirst({
      where: {
        serialNumber: {
          equals: input.serialNumber,
          mode: Prisma.QueryMode.insensitive
        },
        ...(input.excludeId ? { id: { not: input.excludeId } } : {})
      },
      select: {
        id: true,
        serialNumber: true
      }
    });
  }

  create(tx: PrismaTx, data: CreateLightningArresterBody & { createdById: string }) {
    return tx.lightningArrester.create({
      data: {
        substationId: data.substationId,
        arresterCode: data.arresterCode,
        ...(data.locationDescription !== undefined ? { locationDescription: data.locationDescription } : {}),
        voltageRatingKv: data.voltageRatingKv,
        ...(data.make !== undefined ? { make: data.make } : {}),
        ...(data.serialNumber !== undefined ? { serialNumber: data.serialNumber } : {}),
        ...(data.installationDate !== undefined ? { installationDate: data.installationDate } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        createdById: data.createdById,
        updatedById: data.createdById
      },
      select: lightningArresterDetailSelect
    });
  }

  findById(id: string) {
    return prisma.lightningArrester.findUnique({
      where: { id },
      select: lightningArresterDetailSelect
    });
  }

  findAnyById(tx: PrismaTx, id: string) {
    return tx.lightningArrester.findUnique({
      where: { id },
      select: {
        id: true,
        substationId: true,
        arresterCode: true,
        serialNumber: true,
        deletedAt: true
      }
    });
  }

  update(tx: PrismaTx, id: string, data: UpdateLightningArresterBody & { updatedById: string }) {
    return tx.lightningArrester.update({
      where: { id },
      data: {
        ...(data.locationDescription !== undefined ? { locationDescription: data.locationDescription } : {}),
        ...(data.voltageRatingKv !== undefined ? { voltageRatingKv: data.voltageRatingKv } : {}),
        ...(data.make !== undefined ? { make: data.make } : {}),
        ...(data.serialNumber !== undefined ? { serialNumber: data.serialNumber } : {}),
        ...(data.installationDate !== undefined ? { installationDate: data.installationDate } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        updatedById: data.updatedById
      },
      select: lightningArresterDetailSelect
    });
  }

  async list(query: ListLightningArrestersQuery, access: ListLightningArrestersAccess) {
    const where = await this.buildListWhere(query, access);
    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      prisma.lightningArrester.findMany({
        where,
        select: lightningArresterListSelect,
        orderBy: {
          [query.sortBy]: query.sortOrder
        },
        skip,
        take: query.limit
      }),
      prisma.lightningArrester.count({ where })
    ]);

    return { items, total };
  }

  softDelete(tx: PrismaTx, id: string, deletedById: string) {
    return tx.lightningArrester.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        deletedById,
        updatedById: deletedById
      },
      select: lightningArresterDetailSelect
    });
  }

  private async buildListWhere(query: ListLightningArrestersQuery, access: ListLightningArrestersAccess) {
    const filters: Prisma.LightningArresterWhereInput[] = [];

    if (!query.includeDeleted) {
      filters.push({ deletedAt: null });
    }

    if (query.search) {
      filters.push({
        OR: [
          { arresterCode: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
          { serialNumber: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
          { make: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
          { locationDescription: { contains: query.search, mode: Prisma.QueryMode.insensitive } }
        ]
      });
    }

    if (query.substationId) {
      filters.push({ substationId: query.substationId });
    }

    if (query.subVerticalId) {
      filters.push({ substation: { subVerticalId: query.subVerticalId } });
    }

    if (query.verticalId) {
      filters.push({ substation: { subVertical: { verticalId: query.verticalId } } });
    }

    if (query.zoneId) {
      filters.push({ substation: { subVertical: { vertical: { zoneId: query.zoneId } } } });
    }

    if (query.discomId) {
      filters.push({ substation: { subVertical: { vertical: { zone: { discomId: query.discomId } } } } });
    }

    if (query.voltageRatingKv !== undefined) {
      filters.push({ voltageRatingKv: query.voltageRatingKv });
    }

    if (query.isActive !== undefined) {
      filters.push({ isActive: query.isActive });
    }

    if (access.role !== "ADMIN") {
      const accessFilters = await this.buildAreaAccessFilters(access.userId);
      filters.push(accessFilters.length > 0 ? { OR: accessFilters } : { id: "__no_assigned_area__" });
    }

    return filters.length > 0 ? { AND: filters } : {};
  }

  private async buildAreaAccessFilters(userId: string): Promise<Prisma.LightningArresterWhereInput[]> {
    const assignments = await prisma.userAreaMapping.findMany({
      where: {
        userId,
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
    });

    return assignments.flatMap((assignment) => this.toLightningArresterScope(assignment));
  }

  private toLightningArresterScope(assignment: UserAreaAssignment): Prisma.LightningArresterWhereInput[] {
    if (assignment.areaType === "DISCOM" && assignment.discomId) {
      return [{ substation: { subVertical: { vertical: { zone: { discomId: assignment.discomId } } } } }];
    }

    if (assignment.areaType === "ZONE" && assignment.zoneId) {
      return [{ substation: { subVertical: { vertical: { zoneId: assignment.zoneId } } } }];
    }

    if (assignment.areaType === "VERTICAL" && assignment.verticalId) {
      return [{ substation: { subVertical: { verticalId: assignment.verticalId } } }];
    }

    if (assignment.areaType === "SUB_VERTICAL" && assignment.subVerticalId) {
      return [{ substation: { subVerticalId: assignment.subVerticalId } }];
    }

    if (assignment.areaType === "SUBSTATION" && assignment.substationId) {
      return [{ substationId: assignment.substationId }];
    }

    return [];
  }
}
