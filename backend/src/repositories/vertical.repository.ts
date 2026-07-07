import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import type {
  CreateVerticalBody,
  ListVerticalsQuery,
  UpdateVerticalBody
} from "../validators/vertical.validator.js";

export type PrismaTx = Prisma.TransactionClient;

const verticalListSelect = {
  id: true,
  zoneId: true,
  name: true,
  code: true,
  isActive: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
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
} satisfies Prisma.VerticalSelect;

const verticalDetailSelect = {
  id: true,
  zoneId: true,
  name: true,
  code: true,
  isActive: true,
  createdById: true,
  updatedById: true,
  deletedById: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
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
} satisfies Prisma.VerticalSelect;

export class VerticalRepository {
  runInTransaction<T>(callback: (tx: PrismaTx) => Promise<T>): Promise<T> {
    return prisma.$transaction(callback);
  }

  findActiveZoneById(tx: PrismaTx, zoneId: string) {
    return tx.zone.findFirst({
      where: {
        id: zoneId,
        isActive: true,
        deletedAt: null,
        discom: {
          isActive: true,
          deletedAt: null
        }
      },
      select: {
        id: true,
        name: true,
        code: true,
        discomId: true
      }
    });
  }

  findDuplicateByNameOrCode(
    tx: PrismaTx,
    input: { zoneId: string; name?: string; code?: string; excludeId?: string }
  ) {
    return tx.vertical.findFirst({
      where: {
        zoneId: input.zoneId,
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

  create(tx: PrismaTx, data: CreateVerticalBody & { createdById: string }) {
    return tx.vertical.create({
      data: {
        zoneId: data.zoneId,
        name: data.name,
        code: data.code,
        createdById: data.createdById,
        updatedById: data.createdById
      },
      select: verticalDetailSelect
    });
  }

  findById(id: string) {
    return prisma.vertical.findFirst({
      where: {
        id,
        deletedAt: null
      },
      select: verticalDetailSelect
    });
  }

  findAnyById(tx: PrismaTx, id: string) {
    return tx.vertical.findUnique({
      where: { id },
      select: {
        id: true,
        zoneId: true,
        name: true,
        code: true,
        deletedAt: true
      }
    });
  }

  async list(query: ListVerticalsQuery) {
    const where: Prisma.VerticalWhereInput = {
      deletedAt: null,
      ...(query.zoneId ? { zoneId: query.zoneId } : {}),
      ...(query.discomId ? { zone: { discomId: query.discomId } } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
              { code: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
              { zone: { name: { contains: query.search, mode: Prisma.QueryMode.insensitive } } },
              { zone: { code: { contains: query.search, mode: Prisma.QueryMode.insensitive } } },
              { zone: { discom: { name: { contains: query.search, mode: Prisma.QueryMode.insensitive } } } },
              { zone: { discom: { code: { contains: query.search, mode: Prisma.QueryMode.insensitive } } } }
            ]
          }
        : {})
    };
    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      prisma.vertical.findMany({
        where,
        select: verticalListSelect,
        orderBy: {
          [query.sortBy]: query.sortOrder
        },
        skip,
        take: query.limit
      }),
      prisma.vertical.count({ where })
    ]);

    return { items, total };
  }

  update(tx: PrismaTx, id: string, data: UpdateVerticalBody & { updatedById: string }) {
    return tx.vertical.update({
      where: { id },
      data: {
        ...(data.zoneId !== undefined ? { zoneId: data.zoneId } : {}),
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.code !== undefined ? { code: data.code } : {}),
        updatedById: data.updatedById
      },
      select: verticalDetailSelect
    });
  }

  countSubVerticals(tx: PrismaTx, verticalId: string): Promise<number> {
    return tx.subVertical.count({
      where: {
        verticalId
      }
    });
  }

  softDelete(tx: PrismaTx, id: string, deletedById: string) {
    return tx.vertical.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        deletedById,
        updatedById: deletedById
      },
      select: verticalDetailSelect
    });
  }
}
