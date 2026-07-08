import { Prisma, type AreaType } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import type {
  CreateOutgoingFeederBody,
  ListOutgoingFeedersQuery,
  UpdateOutgoingFeederBody
} from "../validators/outgoing-feeder.validator.js";

export type PrismaTx = Prisma.TransactionClient;

interface UserAreaAssignment {
  areaType: AreaType;
  discomId: string | null;
  zoneId: string | null;
  verticalId: string | null;
  subVerticalId: string | null;
  substationId: string | null;
}

interface ListOutgoingFeedersAccess {
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

const outgoingFeederListSelect = {
  id: true,
  substationId: true,
  feederName: true,
  feederCode: true,
  voltageLevelKv: true,
  feederType: true,
  connectedLoadMw: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  substation: {
    select: hierarchySelect
  }
} satisfies Prisma.OutgoingFeederSelect;

const outgoingFeederDetailSelect = {
  id: true,
  substationId: true,
  feederName: true,
  feederCode: true,
  voltageLevelKv: true,
  feederType: true,
  connectedLoadMw: true,
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
} satisfies Prisma.OutgoingFeederSelect;

export class OutgoingFeederRepository {
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

  findDuplicateByFeederNameOrCode(
    tx: PrismaTx,
    input: { substationId: string; feederName?: string; feederCode?: string; excludeId?: string }
  ) {
    if (!input.feederName && !input.feederCode) {
      return null;
    }

    return tx.outgoingFeeder.findFirst({
      where: {
        substationId: input.substationId,
        ...(input.excludeId ? { id: { not: input.excludeId } } : {}),
        OR: [
          ...(input.feederName
            ? [{ feederName: { equals: input.feederName, mode: Prisma.QueryMode.insensitive } }]
            : []),
          ...(input.feederCode
            ? [{ feederCode: { equals: input.feederCode, mode: Prisma.QueryMode.insensitive } }]
            : [])
        ]
      },
      select: {
        id: true,
        feederName: true,
        feederCode: true
      }
    });
  }

  create(tx: PrismaTx, data: CreateOutgoingFeederBody & { createdById: string }) {
    return tx.outgoingFeeder.create({
      data: {
        substationId: data.substationId,
        feederName: data.feederName,
        ...(data.feederCode !== undefined ? { feederCode: data.feederCode } : {}),
        voltageLevelKv: data.voltageLevelKv,
        ...(data.feederType !== undefined ? { feederType: data.feederType } : {}),
        ...(data.connectedLoadMw !== undefined ? { connectedLoadMw: data.connectedLoadMw } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        createdById: data.createdById,
        updatedById: data.createdById
      },
      select: outgoingFeederDetailSelect
    });
  }

  findById(id: string) {
    return prisma.outgoingFeeder.findUnique({
      where: { id },
      select: outgoingFeederDetailSelect
    });
  }

  findAnyById(tx: PrismaTx, id: string) {
    return tx.outgoingFeeder.findUnique({
      where: { id },
      select: {
        id: true,
        substationId: true,
        feederName: true,
        feederCode: true,
        deletedAt: true
      }
    });
  }

  update(tx: PrismaTx, id: string, data: UpdateOutgoingFeederBody & { updatedById: string }) {
    return tx.outgoingFeeder.update({
      where: { id },
      data: {
        ...(data.feederName !== undefined ? { feederName: data.feederName } : {}),
        ...(data.feederCode !== undefined ? { feederCode: data.feederCode } : {}),
        ...(data.voltageLevelKv !== undefined ? { voltageLevelKv: data.voltageLevelKv } : {}),
        ...(data.feederType !== undefined ? { feederType: data.feederType } : {}),
        ...(data.connectedLoadMw !== undefined ? { connectedLoadMw: data.connectedLoadMw } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        updatedById: data.updatedById
      },
      select: outgoingFeederDetailSelect
    });
  }

  async list(query: ListOutgoingFeedersQuery, access: ListOutgoingFeedersAccess) {
    const where = await this.buildListWhere(query, access);
    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      prisma.outgoingFeeder.findMany({
        where,
        select: outgoingFeederListSelect,
        orderBy: {
          [query.sortBy]: query.sortOrder
        },
        skip,
        take: query.limit
      }),
      prisma.outgoingFeeder.count({ where })
    ]);

    return { items, total };
  }

  softDelete(tx: PrismaTx, id: string, deletedById: string) {
    return tx.outgoingFeeder.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        deletedById,
        updatedById: deletedById
      },
      select: outgoingFeederDetailSelect
    });
  }

  private async buildListWhere(query: ListOutgoingFeedersQuery, access: ListOutgoingFeedersAccess) {
    const filters: Prisma.OutgoingFeederWhereInput[] = [];

    if (!query.includeDeleted) {
      filters.push({ deletedAt: null });
    }

    if (query.search) {
      filters.push({
        OR: [
          { feederName: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
          { feederCode: { contains: query.search, mode: Prisma.QueryMode.insensitive } }
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

    if (query.feederType) {
      filters.push({ feederType: { equals: query.feederType, mode: Prisma.QueryMode.insensitive } });
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

  private async buildAreaAccessFilters(userId: string): Promise<Prisma.OutgoingFeederWhereInput[]> {
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

    return assignments.flatMap((assignment) => this.toOutgoingFeederScope(assignment));
  }

  private toOutgoingFeederScope(assignment: UserAreaAssignment): Prisma.OutgoingFeederWhereInput[] {
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
