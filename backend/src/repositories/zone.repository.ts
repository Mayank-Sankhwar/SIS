import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import type {
  CreateZoneBody,
  ListZonesQuery,
  UpdateZoneBody
} from "../validators/zone.validator.js";

export type PrismaTx = Prisma.TransactionClient;

const zoneListSelect = {
  id: true,
  discomId: true,
  name: true,
  code: true,
  isActive: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  discom: {
    select: {
      id: true,
      name: true,
      code: true
    }
  }
} satisfies Prisma.ZoneSelect;

const zoneDetailSelect = {
  id: true,
  discomId: true,
  name: true,
  code: true,
  isActive: true,
  createdById: true,
  updatedById: true,
  deletedById: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  discom: {
    select: {
      id: true,
      name: true,
      code: true,
      isActive: true,
      deletedAt: true
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
} satisfies Prisma.ZoneSelect;

export class ZoneRepository {
  runInTransaction<T>(callback: (tx: PrismaTx) => Promise<T>): Promise<T> {
    return prisma.$transaction(callback);
  }

  findActiveDiscomById(tx: PrismaTx, discomId: string) {
    return tx.discom.findFirst({
      where: {
        id: discomId,
        isActive: true,
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        code: true
      }
    });
  }

  findDuplicateByNameOrCode(
    tx: PrismaTx,
    input: { discomId: string; name?: string; code?: string; excludeId?: string }
  ) {
    return tx.zone.findFirst({
      where: {
        discomId: input.discomId,
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

  create(tx: PrismaTx, data: CreateZoneBody & { createdById: string }) {
    return tx.zone.create({
      data: {
        discomId: data.discomId,
        name: data.name,
        code: data.code,
        createdById: data.createdById,
        updatedById: data.createdById
      },
      select: zoneDetailSelect
    });
  }

  findById(id: string) {
    return prisma.zone.findFirst({
      where: {
        id,
        deletedAt: null
      },
      select: zoneDetailSelect
    });
  }

  findAnyById(tx: PrismaTx, id: string) {
    return tx.zone.findUnique({
      where: { id },
      select: {
        id: true,
        discomId: true,
        name: true,
        code: true,
        deletedAt: true
      }
    });
  }

  async list(query: ListZonesQuery) {
    const where: Prisma.ZoneWhereInput = {
      deletedAt: null,
      ...(query.discomId ? { discomId: query.discomId } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
              { code: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
              { discom: { name: { contains: query.search, mode: Prisma.QueryMode.insensitive } } },
              { discom: { code: { contains: query.search, mode: Prisma.QueryMode.insensitive } } }
            ]
          }
        : {})
    };
    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      prisma.zone.findMany({
        where,
        select: zoneListSelect,
        orderBy: {
          [query.sortBy]: query.sortOrder
        },
        skip,
        take: query.limit
      }),
      prisma.zone.count({ where })
    ]);

    return { items, total };
  }

  update(tx: PrismaTx, id: string, data: UpdateZoneBody & { updatedById: string }) {
    return tx.zone.update({
      where: { id },
      data: {
        ...(data.discomId !== undefined ? { discomId: data.discomId } : {}),
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.code !== undefined ? { code: data.code } : {}),
        updatedById: data.updatedById
      },
      select: zoneDetailSelect
    });
  }

  countVerticals(tx: PrismaTx, zoneId: string): Promise<number> {
    return tx.vertical.count({
      where: {
        zoneId
      }
    });
  }

  softDelete(tx: PrismaTx, id: string, deletedById: string) {
    return tx.zone.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        deletedById,
        updatedById: deletedById
      },
      select: zoneDetailSelect
    });
  }
}
