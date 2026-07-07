import type { AreaType } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export interface ActiveUserForAuth {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface UserAreaAssignment {
  areaType: AreaType;
  discomId: string | null;
  zoneId: string | null;
  verticalId: string | null;
  subVerticalId: string | null;
  substationId: string | null;
}

export interface AreaHierarchy {
  discomId?: string;
  zoneId?: string;
  verticalId?: string;
  subVerticalId?: string;
  substationId?: string;
}

export class AuthorizationRepository {
  findActiveUserById(userId: string): Promise<ActiveUserForAuth | null> {
    return prisma.user.findFirst({
      where: {
        id: userId,
        isActive: true,
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            name: true
          }
        }
      }
    }).then((user) =>
      user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role.name
          }
        : null
    );
  }

  findActiveAreaAssignments(userId: string): Promise<UserAreaAssignment[]> {
    return prisma.userAreaMapping.findMany({
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
  }

  async findAreaHierarchy(area: AreaHierarchy): Promise<AreaHierarchy | null> {
    if (area.substationId) {
      const substation = await prisma.substation.findFirst({
        where: {
          id: area.substationId,
          isActive: true,
          deletedAt: null
        },
        select: {
          id: true,
          subVertical: {
            select: {
              id: true,
              vertical: {
                select: {
                  id: true,
                  zone: {
                    select: {
                      id: true,
                      discomId: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!substation) {
        return null;
      }

      return {
        discomId: substation.subVertical.vertical.zone.discomId,
        zoneId: substation.subVertical.vertical.zone.id,
        verticalId: substation.subVertical.vertical.id,
        subVerticalId: substation.subVertical.id,
        substationId: substation.id
      };
    }

    if (area.subVerticalId) {
      const subVertical = await prisma.subVertical.findFirst({
        where: {
          id: area.subVerticalId,
          isActive: true,
          deletedAt: null
        },
        select: {
          id: true,
          vertical: {
            select: {
              id: true,
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

      if (!subVertical) {
        return null;
      }

      return {
        discomId: subVertical.vertical.zone.discomId,
        zoneId: subVertical.vertical.zone.id,
        verticalId: subVertical.vertical.id,
        subVerticalId: subVertical.id
      };
    }

    if (area.verticalId) {
      const vertical = await prisma.vertical.findFirst({
        where: {
          id: area.verticalId,
          isActive: true,
          deletedAt: null
        },
        select: {
          id: true,
          zone: {
            select: {
              id: true,
              discomId: true
            }
          }
        }
      });

      if (!vertical) {
        return null;
      }

      return {
        discomId: vertical.zone.discomId,
        zoneId: vertical.zone.id,
        verticalId: vertical.id
      };
    }

    if (area.zoneId) {
      const zone = await prisma.zone.findFirst({
        where: {
          id: area.zoneId,
          isActive: true,
          deletedAt: null
        },
        select: {
          id: true,
          discomId: true
        }
      });

      if (!zone) {
        return null;
      }

      return {
        discomId: zone.discomId,
        zoneId: zone.id
      };
    }

    if (area.discomId) {
      const discom = await prisma.discom.findFirst({
        where: {
          id: area.discomId,
          isActive: true,
          deletedAt: null
        },
        select: {
          id: true
        }
      });

      return discom ? { discomId: discom.id } : null;
    }

    return null;
  }
}
