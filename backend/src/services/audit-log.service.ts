import { logger } from "../config/logger.js";

type AuditAction = "CREATE" | "UPDATE" | "DELETE";

interface AuditLogInput {
  userId: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  timestamp?: Date;
}

export class AuditLogService {
  record(input: AuditLogInput): void {
    logger.info("Audit event recorded", {
      userId: input.userId,
      timestamp: (input.timestamp ?? new Date()).toISOString(),
      action: input.action,
      entity: input.entity,
      entityId: input.entityId
    });
  }
}
