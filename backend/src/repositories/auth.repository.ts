import { prisma } from "../config/prisma.js";

export class AuthRepository {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        isActive: true,
        deletedAt: true,
        role: {
          select: {
            name: true
          }
        }
      }
    });
  }

  findActiveUserProfileById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        deletedAt: true,
        role: {
          select: {
            name: true
          }
        },
        parentUser: {
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
        },
        areaMappings: {
          where: {
            isActive: true,
            deletedAt: null
          },
          select: {
            id: true,
            areaType: true,
            isPrimary: true,
            discom: {
              select: {
                id: true,
                name: true,
                code: true
              }
            },
            zone: {
              select: {
                id: true,
                name: true,
                code: true
              }
            },
            vertical: {
              select: {
                id: true,
                name: true,
                code: true
              }
            },
            subVertical: {
              select: {
                id: true,
                name: true,
                code: true
              }
            },
            substation: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          },
          orderBy: [
            {
              isPrimary: "desc"
            },
            {
              createdAt: "asc"
            }
          ]
        }
      }
    });
  }
}
