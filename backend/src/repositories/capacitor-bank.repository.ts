import { Prisma, type AreaType } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import type {
  CreateCapacitorBankBody,
  ListCapacitorBanksQuery,
  UpdateCapacitorBankBody
} from "../validators/capacitor-bank.validator.js";

export type PrismaTx = Prisma.TransactionClient;

interface UserAreaAssignment {
  areaType: AreaType;
  discomId: string | null;
  zoneId: string | null;
  verticalId: string | null;
  subVerticalId: string | null;
  substationId: string | null;
}

interface ListCapacitorBanksAccess {
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

const capacitorBankListSelect = {
  id: true,
  substationId: true,
  capacitorBankCode: true,
  capacityMvar: true,
  voltageLevelKv: true,
  stepsCount: true,
  make: true,
  installationDate: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  substation: {
    select: hierarchySelect
  }
} satisfies Prisma.CapacitorBankSelect;

const capacitorBankDetailSelect = {
  id: true,
  substationId: true,
  capacitorBankCode: true,
  capacityMvar: true,
  voltageLevelKv: true,
  stepsCount: true,
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
} satisfies Prisma.CapacitorBankSelect;

export class CapacitorBankRepository {
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

  findDuplicateByCapacitorBankCode(
    tx: PrismaTx,
    input: { substationId: string; capacitorBankCode: string; excludeId?: string }
  ) {
    return tx.capacitorBank.findFirst({
      where: {
        substationId: input.substationId,
        capacitorBankCode: {
          equals: input.capacitorBankCode,
          mode: Prisma.QueryMode.insensitive
        },
        ...(input.excludeId ? { id: { not: input.excludeId } } : {})
      },
      select: {
        id: true,
        capacitorBankCode: true
      }
    });
  }

  create(tx: PrismaTx, data: CreateCapacitorBankBody & { createdById: string }) {
    return tx.capacitorBank.create({
      data: {
        substationId: data.substationId,
        capacitorBankCode: data.capacitorBankCode,
        capacityMvar: data.capacityMvar,
        voltageLevelKv: data.voltageLevelKv,
        ...(data.stepsCount !== undefined ? { stepsCount: data.stepsCount } : {}),
        ...(data.make !== undefined ? { make: data.make } : {}),
        ...(data.installationDate !== undefined ? { installationDate: data.installationDate } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        createdById: data.createdById,
        updatedById: data.createdById
      },
      select: capacitorBankDetailSelect
    });
  }

  findById(id: string) {
    return prisma.capacitorBank.findUnique({
      where: { id },
      select: capacitorBankDetailSelect
    });
  }

  findAnyById(tx: PrismaTx, id: string) {
    return tx.capacitorBank.findUnique({
      where: { id },
      select: {
        id: true,
        substationId: true,
        capacitorBankCode: true,
        deletedAt: true
      }
    });
  }

  update(tx: PrismaTx, id: string, data: UpdateCapacitorBankBody & { updatedById: string }) {
    return tx.capacitorBank.update({
      where: { id },
      data: {
        ...(data.capacityMvar !== undefined ? { capacityMvar: data.capacityMvar } : {}),
        ...(data.voltageLevelKv !== undefined ? { voltageLevelKv: data.voltageLevelKv } : {}),
        ...(data.stepsCount !== undefined ? { stepsCount: data.stepsCount } : {}),
        ...(data.make !== undefined ? { make: data.make } : {}),
        ...(data.installationDate !== undefined ? { installationDate: data.installationDate } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        updatedById: data.updatedById
      },
      select: capacitorBankDetailSelect
    });
  }

  async list(query: ListCapacitorBanksQuery, access: ListCapacitorBanksAccess) {
    const where = await this.buildListWhere(query, access);
    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      prisma.capacitorBank.findMany({
        where,
        select: capacitorBankListSelect,
        orderBy: {
          [query.sortBy]: query.sortOrder
        },
        skip,
        take: query.limit
      }),
      prisma.capacitorBank.count({ where })
    ]);

    return { items, total };
  }

  softDelete(tx: PrismaTx, id: string, deletedById: string) {
    return tx.capacitorBank.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        deletedById,
        updatedById: deletedById
      },
      select: capacitorBankDetailSelect
    });
  }

  private async buildListWhere(query: ListCapacitorBanksQuery, access: ListCapacitorBanksAccess) {
    const filters: Prisma.CapacitorBankWhereInput[] = [];

    if (!query.includeDeleted) {
      filters.push({ deletedAt: null });
    }

    if (query.search) {
      filters.push({
        OR: [
          { capacitorBankCode: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
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

    if (query.capacityMvar !== undefined) {
      filters.push({ capacityMvar: query.capacityMvar });
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

  private async buildAreaAccessFilters(userId: string): Promise<Prisma.CapacitorBankWhereInput[]> {
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

    return assignments.flatMap((assignment) => this.toCapacitorBankScope(assignment));
  }

  private toCapacitorBankScope(assignment: UserAreaAssignment): Prisma.CapacitorBankWhereInput[] {
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
