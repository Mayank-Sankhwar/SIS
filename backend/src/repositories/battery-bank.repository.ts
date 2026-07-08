import { Prisma, type AreaType } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import type {
  CreateBatteryBankBody,
  ListBatteryBanksQuery,
  UpdateBatteryBankBody
} from "../validators/battery-bank.validator.js";

export type PrismaTx = Prisma.TransactionClient;

interface UserAreaAssignment {
  areaType: AreaType;
  discomId: string | null;
  zoneId: string | null;
  verticalId: string | null;
  subVerticalId: string | null;
  substationId: string | null;
}

interface ListBatteryBanksAccess {
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

const batteryBankListSelect = {
  id: true,
  substationId: true,
  batteryBankCode: true,
  batteryType: true,
  voltageV: true,
  capacityAh: true,
  cellCount: true,
  make: true,
  installationDate: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  substation: {
    select: hierarchySelect
  }
} satisfies Prisma.BatteryBankSelect;

const batteryBankDetailSelect = {
  id: true,
  substationId: true,
  batteryBankCode: true,
  batteryType: true,
  voltageV: true,
  capacityAh: true,
  cellCount: true,
  make: true,
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
} satisfies Prisma.BatteryBankSelect;

export class BatteryBankRepository {
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

  findDuplicateByBatteryBankCode(
    tx: PrismaTx,
    input: { substationId: string; batteryBankCode: string; excludeId?: string }
  ) {
    return tx.batteryBank.findFirst({
      where: {
        substationId: input.substationId,
        batteryBankCode: {
          equals: input.batteryBankCode,
          mode: Prisma.QueryMode.insensitive
        },
        ...(input.excludeId ? { id: { not: input.excludeId } } : {})
      },
      select: {
        id: true,
        batteryBankCode: true
      }
    });
  }

  create(tx: PrismaTx, data: CreateBatteryBankBody & { createdById: string }) {
    return tx.batteryBank.create({
      data: {
        substationId: data.substationId,
        batteryBankCode: data.batteryBankCode,
        ...(data.batteryType !== undefined ? { batteryType: data.batteryType } : {}),
        voltageV: data.voltageV,
        capacityAh: data.capacityAh,
        ...(data.cellCount !== undefined ? { cellCount: data.cellCount } : {}),
        ...(data.make !== undefined ? { make: data.make } : {}),
        ...(data.installationDate !== undefined ? { installationDate: data.installationDate } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        createdById: data.createdById,
        updatedById: data.createdById
      },
      select: batteryBankDetailSelect
    });
  }

  findById(id: string) {
    return prisma.batteryBank.findUnique({
      where: { id },
      select: batteryBankDetailSelect
    });
  }

  findAnyById(tx: PrismaTx, id: string) {
    return tx.batteryBank.findUnique({
      where: { id },
      select: {
        id: true,
        substationId: true,
        batteryBankCode: true,
        deletedAt: true
      }
    });
  }

  update(tx: PrismaTx, id: string, data: UpdateBatteryBankBody & { updatedById: string }) {
    return tx.batteryBank.update({
      where: { id },
      data: {
        ...(data.batteryType !== undefined ? { batteryType: data.batteryType } : {}),
        ...(data.voltageV !== undefined ? { voltageV: data.voltageV } : {}),
        ...(data.capacityAh !== undefined ? { capacityAh: data.capacityAh } : {}),
        ...(data.cellCount !== undefined ? { cellCount: data.cellCount } : {}),
        ...(data.make !== undefined ? { make: data.make } : {}),
        ...(data.installationDate !== undefined ? { installationDate: data.installationDate } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        updatedById: data.updatedById
      },
      select: batteryBankDetailSelect
    });
  }

  async list(query: ListBatteryBanksQuery, access: ListBatteryBanksAccess) {
    const where = await this.buildListWhere(query, access);
    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      prisma.batteryBank.findMany({
        where,
        select: batteryBankListSelect,
        orderBy: {
          [query.sortBy]: query.sortOrder
        },
        skip,
        take: query.limit
      }),
      prisma.batteryBank.count({ where })
    ]);

    return { items, total };
  }

  softDelete(tx: PrismaTx, id: string, deletedById: string) {
    return tx.batteryBank.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        deletedById,
        updatedById: deletedById
      },
      select: batteryBankDetailSelect
    });
  }

  private async buildListWhere(query: ListBatteryBanksQuery, access: ListBatteryBanksAccess) {
    const filters: Prisma.BatteryBankWhereInput[] = [];

    if (!query.includeDeleted) {
      filters.push({ deletedAt: null });
    }

    if (query.search) {
      filters.push({
        OR: [
          { batteryBankCode: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
          { batteryType: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
          { make: { contains: query.search, mode: Prisma.QueryMode.insensitive } }
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

    if (query.voltageV !== undefined) {
      filters.push({ voltageV: query.voltageV });
    }

    if (query.capacityAh !== undefined) {
      filters.push({ capacityAh: query.capacityAh });
    }

    if (query.batteryType) {
      filters.push({ batteryType: { equals: query.batteryType, mode: Prisma.QueryMode.insensitive } });
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

  private async buildAreaAccessFilters(userId: string): Promise<Prisma.BatteryBankWhereInput[]> {
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

    return assignments.flatMap((assignment) => this.toBatteryBankScope(assignment));
  }

  private toBatteryBankScope(assignment: UserAreaAssignment): Prisma.BatteryBankWhereInput[] {
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
