import { Prisma, type AreaType } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import type {
  CreateTransformerBody,
  ListTransformersQuery,
  UpdateTransformerBody
} from "../validators/transformer.validator.js";

export type PrismaTx = Prisma.TransactionClient;

interface UserAreaAssignment {
  areaType: AreaType;
  discomId: string | null;
  zoneId: string | null;
  verticalId: string | null;
  subVerticalId: string | null;
  substationId: string | null;
}

interface ListTransformersAccess {
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

const transformerListSelect = {
  id: true,
  substationId: true,
  transformerCode: true,
  capacityMva: true,
  primaryVoltageKv: true,
  secondaryVoltageKv: true,
  make: true,
  serialNumber: true,
  commissioningDate: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  substation: {
    select: hierarchySelect
  }
} satisfies Prisma.TransformerSelect;

const transformerDetailSelect = {
  id: true,
  substationId: true,
  transformerCode: true,
  capacityMva: true,
  primaryVoltageKv: true,
  secondaryVoltageKv: true,
  make: true,
  serialNumber: true,
  commissioningDate: true,
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
} satisfies Prisma.TransformerSelect;

export class TransformerRepository {
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

  findDuplicateByTransformerCode(
    tx: PrismaTx,
    input: { substationId: string; transformerCode: string; excludeId?: string }
  ) {
    return tx.transformer.findFirst({
      where: {
        substationId: input.substationId,
        transformerCode: {
          equals: input.transformerCode,
          mode: Prisma.QueryMode.insensitive
        },
        ...(input.excludeId ? { id: { not: input.excludeId } } : {})
      },
      select: {
        id: true,
        transformerCode: true
      }
    });
  }

  findDuplicateBySerialNumber(tx: PrismaTx, input: { serialNumber?: string; excludeId?: string }) {
    if (!input.serialNumber) {
      return null;
    }

    return tx.transformer.findFirst({
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

  create(tx: PrismaTx, data: CreateTransformerBody & { createdById: string }) {
    return tx.transformer.create({
      data: {
        substationId: data.substationId,
        transformerCode: data.transformerCode,
        capacityMva: data.capacityMva,
        primaryVoltageKv: data.primaryVoltageKv,
        secondaryVoltageKv: data.secondaryVoltageKv,
        ...(data.make !== undefined ? { make: data.make } : {}),
        ...(data.serialNumber !== undefined ? { serialNumber: data.serialNumber } : {}),
        ...(data.commissioningDate !== undefined ? { commissioningDate: data.commissioningDate } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        createdById: data.createdById,
        updatedById: data.createdById
      },
      select: transformerDetailSelect
    });
  }

  findById(id: string) {
    return prisma.transformer.findUnique({
      where: { id },
      select: transformerDetailSelect
    });
  }

  findAnyById(tx: PrismaTx, id: string) {
    return tx.transformer.findUnique({
      where: { id },
      select: {
        id: true,
        substationId: true,
        transformerCode: true,
        serialNumber: true,
        deletedAt: true
      }
    });
  }

  update(tx: PrismaTx, id: string, data: UpdateTransformerBody & { updatedById: string }) {
    return tx.transformer.update({
      where: { id },
      data: {
        ...(data.capacityMva !== undefined ? { capacityMva: data.capacityMva } : {}),
        ...(data.primaryVoltageKv !== undefined ? { primaryVoltageKv: data.primaryVoltageKv } : {}),
        ...(data.secondaryVoltageKv !== undefined ? { secondaryVoltageKv: data.secondaryVoltageKv } : {}),
        ...(data.make !== undefined ? { make: data.make } : {}),
        ...(data.serialNumber !== undefined ? { serialNumber: data.serialNumber } : {}),
        ...(data.commissioningDate !== undefined ? { commissioningDate: data.commissioningDate } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
        updatedById: data.updatedById
      },
      select: transformerDetailSelect
    });
  }

  async list(query: ListTransformersQuery, access: ListTransformersAccess) {
    const where = await this.buildListWhere(query, access);
    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      prisma.transformer.findMany({
        where,
        select: transformerListSelect,
        orderBy: {
          [query.sortBy]: query.sortOrder
        },
        skip,
        take: query.limit
      }),
      prisma.transformer.count({ where })
    ]);

    return { items, total };
  }

  softDelete(tx: PrismaTx, id: string, deletedById: string) {
    return tx.transformer.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        deletedById,
        updatedById: deletedById
      },
      select: transformerDetailSelect
    });
  }

  private async buildListWhere(query: ListTransformersQuery, access: ListTransformersAccess) {
    const filters: Prisma.TransformerWhereInput[] = [];

    if (!query.includeDeleted) {
      filters.push({ deletedAt: null });
    }

    if (query.search) {
      filters.push({
        OR: [
          { transformerCode: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
          { serialNumber: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
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

    if (query.capacityMva !== undefined) {
      filters.push({ capacityMva: query.capacityMva });
    }

    if (query.primaryVoltageKv !== undefined) {
      filters.push({ primaryVoltageKv: query.primaryVoltageKv });
    }

    if (query.secondaryVoltageKv !== undefined) {
      filters.push({ secondaryVoltageKv: query.secondaryVoltageKv });
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

  private async buildAreaAccessFilters(userId: string): Promise<Prisma.TransformerWhereInput[]> {
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

    return assignments.flatMap((assignment) => this.toTransformerScope(assignment));
  }

  private toTransformerScope(assignment: UserAreaAssignment): Prisma.TransformerWhereInput[] {
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
