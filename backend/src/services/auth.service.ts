import type { LoginBody } from "../validators/auth.validator.js";
import { AuthRepository } from "../repositories/auth.repository.js";
import { AppError } from "../utils/app-error.js";
import { comparePassword } from "../utils/password.js";
import { signAccessToken } from "../utils/jwt.js";
import type { AreaType } from "@prisma/client";

export interface LoginResult {
  accessToken: string;
  tokenType: "Bearer";
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface AssignedArea {
  id: string;
  areaType: AreaType;
  isPrimary: boolean;
  area: {
    id: string;
    name: string;
    code: string;
  };
}

export interface ProfileResult {
  id: string;
  name: string;
  email: string;
  role: string;
  reportingParent: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  assignedAreas: AssignedArea[];
}

export class AuthService {
  constructor(private readonly authRepository = new AuthRepository()) {}

  async login(payload: LoginBody): Promise<LoginResult> {
    const user = await this.authRepository.findUserByEmail(payload.email.toLowerCase());

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    if (!user.isActive || user.deletedAt) {
      throw new AppError("User account is inactive", 403);
    }

    const passwordMatches = await comparePassword(payload.password, user.passwordHash);

    if (!passwordMatches) {
      throw new AppError("Invalid email or password", 401);
    }

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      roles: [user.role.name]
    });

    return {
      accessToken,
      tokenType: "Bearer",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name
      }
    };
  }

  async getProfile(userId: string): Promise<ProfileResult> {
    const user = await this.authRepository.findActiveUserProfileById(userId);

    if (!user) {
      throw new AppError("Authenticated user not found", 401);
    }

    if (!user.isActive || user.deletedAt) {
      throw new AppError("User account is inactive", 403);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      reportingParent: user.parentUser
        ? {
            id: user.parentUser.id,
            name: user.parentUser.name,
            email: user.parentUser.email,
            role: user.parentUser.role.name
          }
        : null,
      assignedAreas: user.areaMappings.map((mapping) => {
        const area =
          mapping.discom ??
          mapping.zone ??
          mapping.vertical ??
          mapping.subVertical ??
          mapping.substation;

        if (!area) {
          throw new AppError("Invalid user area mapping", 500);
        }

        return {
          id: mapping.id,
          areaType: mapping.areaType,
          isPrimary: mapping.isPrimary,
          area
        };
      })
    };
  }
}
