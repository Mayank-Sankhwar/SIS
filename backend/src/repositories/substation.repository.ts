import { Prisma, type AreaType } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import type {
  CreateSubstationBody,
  ListSubstationsQuery,
  UpdateSubstationBody
} from "../validators/substation.validator.js";

export type PrismaTx = Prisma.TransactionClient;

interface UserAreaAssignment {
  areaType: AreaType;
  discomId: string | null;
  zoneId: string | null;
  verticalId: string | null;
  subVerticalId: string | null;
  substationId: string | null;
}

interface ListSubstationsAccess {
  userId: string;
  role: string;
}

const substationListSelect = {
  id: true,
  name: true,
  code: true,
  voltageLevelKv: true,
  address: true,
  latitude: true,
  longitude: true,
  commissioningDate: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  subVertical: {
    select: {
      id: true,
      name: true,
      code: true,
      vertical: {
        select: {
          id: true,
          name: true,
          code: true,
          zone: {
            select: {
              id: true,
              name: true,
              code: true,
              discom: {
                select: {
                  id: true,
                  name: true,
                  code: true
                }
              }
            }
          }
        }
      }
    }
  }
} satisfies Prisma.SubstationSelect;

const substationDetailSelect = {
  id: true,
  subVerticalId: true,
  name: true,
  code: true,
  voltageLevelKv: true,
  address: true,
  latitude: true,
  longitude: true,
  commissioningDate: true,
  isActive: true,
  createdById: true,
  updatedById: true,
  deletedById: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
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
  }
} satisfies Prisma.SubstationSelect;

export class SubstationRepository {
  runInTransaction<T>(callback: (tx: PrismaTx) => Promise<T>): Promise<T> {
    return prisma.$transaction(callback);
  }

  findActiveSubVerticalById(tx: PrismaTx, subVerticalId: string) {
    return tx.subVertical.findFirst({
      where: {
        id: subVerticalId,
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
      },
      select: {
        id: true,
        name: true,
        code: true,
        verticalId: true,
        vertical: {
          select: {
            id: true,
            zoneId: true,
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
  }

  findDuplicateByNameOrCode(
    tx: PrismaTx,
    input: { subVerticalId: string; name?: string; code?: string; excludeId?: string }
  ) {
    if (!input.name && !input.code) {
      return null;
    }

    return tx.substation.findFirst({
      where: {
        subVerticalId: input.subVerticalId,
        ...(input.excludeId ? { id: { not: input.excludeId } } : {}),
        OR: [
          ...(input.name ? [{ name: { equals: input.name, mode: Prisma.QueryMode.insensitive } }] : []),
          ...(input.code ? [{ code: { equals: input.code, mode: Prisma.QueryMode.insensitive } }] : [])
        ]
      },
      select: {
        id: true,
        name: true,
        code: true
      }
    });
  }

  findDuplicateCoordinates(
    tx: PrismaTx,
    input: { latitude?: number; longitude?: number; excludeId?: string }
  ) {
    if (input.latitude === undefined || input.longitude === undefined) {
      return null;
    }

    return tx.substation.findFirst({
      where: {
        latitude: input.latitude,
        longitude: input.longitude,
        deletedAt: null,
        ...(input.excludeId ? { id: { not: input.excludeId } } : {})
      },
      select: {
        id: true,
        name: true,
        code: true
      }
    });
  }

  create(tx: PrismaTx, data: CreateSubstationBody & { createdById: string }) {
    return tx.substation.create({
      data: {
        subVerticalId: data.subVerticalId,
        name: data.name,
        code: data.code,
        voltageLevelKv: data.voltageLevelKv,
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.latitude !== undefined ? { latitude: data.latitude } : {}),
        ...(data.longitude !== undefined ? { longitude: data.longitude } : {}),
        ...(data.commissioningDate !== undefined ? { commissioningDate: data.commissioningDate } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        createdById: data.createdById,
        updatedById: data.createdById
      },
      select: substationDetailSelect
    });
  }

  findById(id: string) {
    return prisma.substation.findFirst({
      where: {
        id,
        deletedAt: null
      },
      select: substationDetailSelect
    });
  }

  findAnyById(tx: PrismaTx, id: string) {
    return tx.substation.findUnique({
      where: { id },
      select: {
        id: true,
        subVerticalId: true,
        name: true,
        code: true,
        latitude: true,
        longitude: true,
        deletedAt: true
      }
    });
  }

  update(tx: PrismaTx, id: string, data: UpdateSubstationBody & { updatedById: string }) {
    return tx.substation.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.code !== undefined ? { code: data.code } : {}),
        ...(data.voltageLevelKv !== undefined ? { voltageLevelKv: data.voltageLevelKv } : {}),
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.latitude !== undefined ? { latitude: data.latitude } : {}),
        ...(data.longitude !== undefined ? { longitude: data.longitude } : {}),
        ...(data.commissioningDate !== undefined ? { commissioningDate: data.commissioningDate } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        updatedById: data.updatedById
      },
      select: substationDetailSelect
    });
  }

  async list(query: ListSubstationsQuery, access: ListSubstationsAccess) {
    const where = await this.buildListWhere(query, access);
    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      prisma.substation.findMany({
        where,
        select: substationListSelect,
        orderBy: {
          [query.sortBy]: query.sortOrder
        },
        skip,
        take: query.limit
      }),
      prisma.substation.count({ where })
    ]);

    return { items, total };
  }

  async countEquipment(tx: PrismaTx, substationId: string) {
    const [
      incomingSources,
      transformers,
      outgoingFeeders,
      lightningArresters,
      batteryBanks,
      capacitorBanks
    ] = await Promise.all([
      tx.incomingSource.count({ where: { substationId, deletedAt: null } }),
      tx.transformer.count({ where: { substationId, deletedAt: null } }),
      tx.outgoingFeeder.count({ where: { substationId, deletedAt: null } }),
      tx.lightningArrester.count({ where: { substationId, deletedAt: null } }),
      tx.batteryBank.count({ where: { substationId, deletedAt: null } }),
      tx.capacitorBank.count({ where: { substationId, deletedAt: null } })
    ]);

    return {
      incomingSources,
      transformers,
      outgoingFeeders,
      lightningArresters,
      batteryBanks,
      capacitorBanks
    };
  }

  softDelete(tx: PrismaTx, id: string, deletedById: string) {
    return tx.substation.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        deletedById,
        updatedById: deletedById
      },
      select: substationDetailSelect
    });
  }

  private async buildListWhere(query: ListSubstationsQuery, access: ListSubstationsAccess) {
    const filters: Prisma.SubstationWhereInput[] = [];

    if (!query.includeDeleted) {
      filters.push({ deletedAt: null });
    }

    if (query.search) {
      filters.push({
        OR: [
          { name: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
          { code: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
          { address: { contains: query.search, mode: Prisma.QueryMode.insensitive } }
        ]
      });
    }

    if (query.subVerticalId) {
      filters.push({ subVerticalId: query.subVerticalId });
    }

    if (query.verticalId) {
      filters.push({ subVertical: { verticalId: query.verticalId } });
    }

    if (query.zoneId) {
      filters.push({ subVertical: { vertical: { zoneId: query.zoneId } } });
    }

    if (query.discomId) {
      filters.push({ subVertical: { vertical: { zone: { discomId: query.discomId } } } });
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

  private async buildAreaAccessFilters(userId: string): Promise<Prisma.SubstationWhereInput[]> {
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

    return assignments.flatMap((assignment) => this.toSubstationScope(assignment));
  }

  private toSubstationScope(assignment: UserAreaAssignment): Prisma.SubstationWhereInput[] {
    if (assignment.areaType === "DISCOM" && assignment.discomId) {
      return [{ subVertical: { vertical: { zone: { discomId: assignment.discomId } } } }];
    }

    if (assignment.areaType === "ZONE" && assignment.zoneId) {
      return [{ subVertical: { vertical: { zoneId: assignment.zoneId } } }];
    }

    if (assignment.areaType === "VERTICAL" && assignment.verticalId) {
      return [{ subVertical: { verticalId: assignment.verticalId } }];
    }

    if (assignment.areaType === "SUB_VERTICAL" && assignment.subVerticalId) {
      return [{ subVerticalId: assignment.subVerticalId }];
    }

    if (assignment.areaType === "SUBSTATION" && assignment.substationId) {
      return [{ id: assignment.substationId }];
    }

    return [];
  }
}
