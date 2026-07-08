import { Prisma, type AreaType } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import type {
  CreateIncomingSourceBody,
  ListIncomingSourcesQuery,
  UpdateIncomingSourceBody
} from "../validators/incoming-source.validator.js";

export type PrismaTx = Prisma.TransactionClient;

interface UserAreaAssignment {
  areaType: AreaType;
  discomId: string | null;
  zoneId: string | null;
  verticalId: string | null;
  subVerticalId: string | null;
  substationId: string | null;
}

interface ListIncomingSourcesAccess {
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

const incomingSourceListSelect = {
  id: true,
  substationId: true,
  sourceName: true,
  sourceType: true,
  voltageLevelKv: true,
  feederName: true,
  meterNumber: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  substation: {
    select: hierarchySelect
  }
} satisfies Prisma.IncomingSourceSelect;

const incomingSourceDetailSelect = {
  id: true,
  substationId: true,
  sourceName: true,
  sourceType: true,
  voltageLevelKv: true,
  feederName: true,
  meterNumber: true,
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
} satisfies Prisma.IncomingSourceSelect;

export class IncomingSourceRepository {
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

  findDuplicateBySourceName(
    tx: PrismaTx,
    input: { substationId: string; sourceName: string; excludeId?: string }
  ) {
    return tx.incomingSource.findFirst({
      where: {
        substationId: input.substationId,
        sourceName: {
          equals: input.sourceName,
          mode: Prisma.QueryMode.insensitive
        },
        ...(input.excludeId ? { id: { not: input.excludeId } } : {})
      },
      select: {
        id: true,
        sourceName: true
      }
    });
  }

  create(tx: PrismaTx, data: CreateIncomingSourceBody & { createdById: string }) {
    return tx.incomingSource.create({
      data: {
        substationId: data.substationId,
        sourceName: data.sourceName,
        ...(data.sourceType !== undefined ? { sourceType: data.sourceType } : {}),
        voltageLevelKv: data.voltageLevelKv,
        ...(data.feederName !== undefined ? { feederName: data.feederName } : {}),
        ...(data.meterNumber !== undefined ? { meterNumber: data.meterNumber } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        createdById: data.createdById,
        updatedById: data.createdById
      },
      select: incomingSourceDetailSelect
    });
  }

  findById(id: string) {
    return prisma.incomingSource.findUnique({
      where: { id },
      select: incomingSourceDetailSelect
    });
  }

  findAnyById(tx: PrismaTx, id: string) {
    return tx.incomingSource.findUnique({
      where: { id },
      select: {
        id: true,
        substationId: true,
        sourceName: true,
        deletedAt: true
      }
    });
  }

  update(tx: PrismaTx, id: string, data: UpdateIncomingSourceBody & { updatedById: string }) {
    return tx.incomingSource.update({
      where: { id },
      data: {
        ...(data.sourceName !== undefined ? { sourceName: data.sourceName } : {}),
        ...(data.sourceType !== undefined ? { sourceType: data.sourceType } : {}),
        ...(data.voltageLevelKv !== undefined ? { voltageLevelKv: data.voltageLevelKv } : {}),
        ...(data.feederName !== undefined ? { feederName: data.feederName } : {}),
        ...(data.meterNumber !== undefined ? { meterNumber: data.meterNumber } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        updatedById: data.updatedById
      },
      select: incomingSourceDetailSelect
    });
  }

  async list(query: ListIncomingSourcesQuery, access: ListIncomingSourcesAccess) {
    const where = await this.buildListWhere(query, access);
    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      prisma.incomingSource.findMany({
        where,
        select: incomingSourceListSelect,
        orderBy: {
          [query.sortBy]: query.sortOrder
        },
        skip,
        take: query.limit
      }),
      prisma.incomingSource.count({ where })
    ]);

    return { items, total };
  }

  softDelete(tx: PrismaTx, id: string, deletedById: string) {
    return tx.incomingSource.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        deletedById,
        updatedById: deletedById
      },
      select: incomingSourceDetailSelect
    });
  }

  private async buildListWhere(query: ListIncomingSourcesQuery, access: ListIncomingSourcesAccess) {
    const filters: Prisma.IncomingSourceWhereInput[] = [];

    if (!query.includeDeleted) {
      filters.push({ deletedAt: null });
    }

    if (query.search) {
      filters.push({
        OR: [
          { sourceName: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
          { feederName: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
          { meterNumber: { contains: query.search, mode: Prisma.QueryMode.insensitive } }
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

    if (query.voltageLevelKv !== undefined) {
      filters.push({ voltageLevelKv: query.voltageLevelKv });
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

  private async buildAreaAccessFilters(userId: string): Promise<Prisma.IncomingSourceWhereInput[]> {
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

    return assignments.flatMap((assignment) => this.toIncomingSourceScope(assignment));
  }

  private toIncomingSourceScope(assignment: UserAreaAssignment): Prisma.IncomingSourceWhereInput[] {
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
