import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import type {
  CreateSubstationBody,
  UpdateSubstationBody
} from "../validators/substation.validator.js";

export type PrismaTx = Prisma.TransactionClient;

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
        verticalId: true
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
}
