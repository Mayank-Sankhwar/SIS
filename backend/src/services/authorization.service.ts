import type { AreaType, RoleName } from "@prisma/client";
import {
  type AreaHierarchy,
  AuthorizationRepository,
  type UserAreaAssignment
} from "../repositories/authorization.repository.js";
import { AppError } from "../utils/app-error.js";
import type { JwtPayload } from "../utils/jwt.js";

export interface AuthenticatedUser extends JwtPayload {
  id: string;
  sub: string;
  name: string;
  email: string;
  role: string;
}

export class AuthorizationService {
  constructor(private readonly authorizationRepository = new AuthorizationRepository()) {}

  async authenticatePayload(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload.sub) {
      throw new AppError("Invalid token payload", 401);
    }

    const user = await this.authorizationRepository.findActiveUserById(payload.sub);

    if (!user) {
      throw new AppError("User account is inactive", 403);
    }

    return {
      sub: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roles: [user.role]
    };
  }

  authorizeRoles(user: AuthenticatedUser | undefined, allowedRoles: RoleName[]): void {
    if (!user) {
      throw new AppError("Authentication required", 401);
    }

    if (user.role === "ADMIN") {
      return;
    }

    if (!allowedRoles.includes(user.role as RoleName)) {
      throw new AppError("You are not allowed to perform this action", 403);
    }
  }

  async checkAreaAccess(user: AuthenticatedUser | undefined, requestedArea: AreaHierarchy): Promise<void> {
    if (!user) {
      throw new AppError("Authentication required", 401);
    }

    if (user.role === "ADMIN") {
      return;
    }

    const hierarchy = await this.authorizationRepository.findAreaHierarchy(requestedArea);

    if (!hierarchy) {
      throw new AppError("Requested area was not found", 404);
    }

    const assignments = await this.authorizationRepository.findActiveAreaAssignments(user.id);

    if (!assignments.some((assignment) => this.assignmentCoversArea(assignment, hierarchy))) {
      throw new AppError("You do not have access to this area", 403);
    }
  }

  private assignmentCoversArea(assignment: UserAreaAssignment, area: AreaHierarchy): boolean {
    const checks: Record<AreaType, boolean> = {
      DISCOM: Boolean(assignment.discomId && assignment.discomId === area.discomId),
      ZONE: Boolean(assignment.zoneId && assignment.zoneId === area.zoneId),
      VERTICAL: Boolean(assignment.verticalId && assignment.verticalId === area.verticalId),
      SUB_VERTICAL: Boolean(assignment.subVerticalId && assignment.subVerticalId === area.subVerticalId),
      SUBSTATION: Boolean(assignment.substationId && assignment.substationId === area.substationId)
    };

    return checks[assignment.areaType];
  }
}
