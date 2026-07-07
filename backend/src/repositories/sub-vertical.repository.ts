import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import type {
  CreateSubVerticalBody,
  ListSubVerticalsQuery,
  UpdateSubVerticalBody
} from "../validators/sub-vertical.validator.js";

export type PrismaTx = Prisma.TransactionClient;

const subVerticalListSelect = {
  id: true,
  verticalId: true,
  name: true,
  code: true,
  isActive: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
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
} satisfies Prisma.SubVerticalSelect;

const subVerticalDetailSelect = {
  id: true,
  verticalId: true,
  name: true,
  code: true,
  isActive: true,
  createdById: true,
  updatedById: true,
  deletedById: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
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
} satisfies Prisma.SubVerticalSelect;

export class SubVerticalRepository {
  runInTransaction<T>(callback: (tx: PrismaTx) => Promise<T>): Promise<T> {
    return prisma.$transaction(callback);
  }

  findActiveVerticalById(tx: PrismaTx, verticalId: string) {
    return tx.vertical.findFirst({
      where: {
        id: verticalId,
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
      },
      select: {
        id: true,
        name: true,
        code: true,
        zoneId: true
      }
    });
  }

  findDuplicateByNameOrCode(
    tx: PrismaTx,
    input: { verticalId: string; name?: string; code?: string; excludeId?: string }
  ) {
    return tx.subVertical.findFirst({
      where: {
        verticalId: input.verticalId,
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

  create(tx: PrismaTx, data: CreateSubVerticalBody & { createdById: string }) {
    return tx.subVertical.create({
      data: {
        verticalId: data.verticalId,
        name: data.name,
        code: data.code,
        createdById: data.createdById,
        updatedById: data.createdById
      },
      select: subVerticalDetailSelect
    });
  }

  findById(id: string) {
    return prisma.subVertical.findFirst({
      where: {
        id,
        deletedAt: null
      },
      select: subVerticalDetailSelect
    });
  }

  findAnyById(tx: PrismaTx, id: string) {
    return tx.subVertical.findUnique({
      where: { id },
      select: {
        id: true,
        verticalId: true,
        name: true,
        code: true,
        deletedAt: true
      }
    });
  }

  async list(query: ListSubVerticalsQuery) {
    const where: Prisma.SubVerticalWhereInput = {
      deletedAt: null,
      ...(query.verticalId ? { verticalId: query.verticalId } : {}),
      ...(query.zoneId ? { vertical: { zoneId: query.zoneId } } : {}),
      ...(query.discomId ? { vertical: { zone: { discomId: query.discomId } } } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
              { code: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
              { vertical: { name: { contains: query.search, mode: Prisma.QueryMode.insensitive } } },
              { vertical: { code: { contains: query.search, mode: Prisma.QueryMode.insensitive } } },
              { vertical: { zone: { name: { contains: query.search, mode: Prisma.QueryMode.insensitive } } } },
              { vertical: { zone: { code: { contains: query.search, mode: Prisma.QueryMode.insensitive } } } },
              {
                vertical: {
                  zone: { discom: { name: { contains: query.search, mode: Prisma.QueryMode.insensitive } } }
                }
              },
              {
                vertical: {
                  zone: { discom: { code: { contains: query.search, mode: Prisma.QueryMode.insensitive } } }
                }
              }
            ]
          }
        : {})
    };
    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      prisma.subVertical.findMany({
        where,
        select: subVerticalListSelect,
        orderBy: {
          [query.sortBy]: query.sortOrder
        },
        skip,
        take: query.limit
      }),
      prisma.subVertical.count({ where })
    ]);

    return { items, total };
  }

  update(tx: PrismaTx, id: string, data: UpdateSubVerticalBody & { updatedById: string }) {
    return tx.subVertical.update({
      where: { id },
      data: {
        ...(data.verticalId !== undefined ? { verticalId: data.verticalId } : {}),
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.code !== undefined ? { code: data.code } : {}),
        updatedById: data.updatedById
      },
      select: subVerticalDetailSelect
    });
  }

  countSubstations(tx: PrismaTx, subVerticalId: string): Promise<number> {
    return tx.substation.count({
      where: {
        subVerticalId
      }
    });
  }

  softDelete(tx: PrismaTx, id: string, deletedById: string) {
    return tx.subVertical.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        deletedById,
        updatedById: deletedById
      },
      select: subVerticalDetailSelect
    });
  }
}
