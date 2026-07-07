import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import type {
  CreateDiscomBody,
  ListDiscomsQuery,
  UpdateDiscomBody
} from "../validators/discom.validator.js";

export type PrismaTx = Prisma.TransactionClient;

const discomSelect = {
  id: true,
  name: true,
  code: true,
  isActive: true,
  createdById: true,
  updatedById: true,
  deletedById: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.DiscomSelect;

export class DiscomRepository {
  runInTransaction<T>(callback: (tx: PrismaTx) => Promise<T>): Promise<T> {
    return prisma.$transaction(callback);
  }

  findDuplicateByNameOrCode(tx: PrismaTx, input: { name?: string; code?: string; excludeId?: string }) {
    return tx.discom.findFirst({
      where: {
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

  create(tx: PrismaTx, data: CreateDiscomBody & { createdById: string }) {
    return tx.discom.create({
      data: {
        name: data.name,
        code: data.code,
        createdById: data.createdById,
        updatedById: data.createdById
      },
      select: discomSelect
    });
  }

  findById(id: string) {
    return prisma.discom.findFirst({
      where: {
        id,
        deletedAt: null
      },
      select: discomSelect
    });
  }

  findAnyById(tx: PrismaTx, id: string) {
    return tx.discom.findUnique({
      where: { id },
      select: discomSelect
    });
  }

  async list(query: ListDiscomsQuery) {
    const where: Prisma.DiscomWhereInput = {
      deletedAt: null,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: Prisma.QueryMode.insensitive } },
              { code: { contains: query.search, mode: Prisma.QueryMode.insensitive } }
            ]
          }
        : {})
    };
    const skip = (query.page - 1) * query.limit;

    const [items, total] = await Promise.all([
      prisma.discom.findMany({
        where,
        select: discomSelect,
        orderBy: {
          [query.sortBy]: query.sortOrder
        },
        skip,
        take: query.limit
      }),
      prisma.discom.count({ where })
    ]);

    return { items, total };
  }

  update(tx: PrismaTx, id: string, data: UpdateDiscomBody & { updatedById: string }) {
    return tx.discom.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.code !== undefined ? { code: data.code } : {}),
        updatedById: data.updatedById
      },
      select: discomSelect
    });
  }

  softDelete(tx: PrismaTx, id: string, deletedById: string) {
    return tx.discom.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById,
        updatedById: deletedById,
        isActive: false
      },
      select: discomSelect
    });
  }
}
