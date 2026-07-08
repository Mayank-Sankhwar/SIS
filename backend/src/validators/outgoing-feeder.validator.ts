import { z } from "zod";

const nonEmptyString = (field: string, max: number) =>
  z.string().trim().min(1, `${field} is required`).max(max);

const optionalNonEmptyString = (field: string, max: number) =>
  z.string().trim().min(1, `${field} cannot be empty`).max(max).optional();

const decimalNumber = (field: string) =>
  z.coerce
    .number({
      invalid_type_error: `${field} must be a valid number`
    })
    .finite(`${field} must be a valid number`);

export const outgoingFeederIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const createOutgoingFeederBodySchema = z
  .object({
    substationId: z.string().uuid(),
    feederName: nonEmptyString("feederName", 150),
    feederCode: optionalNonEmptyString("feederCode", 100),
    voltageLevelKv: decimalNumber("voltageLevelKv").positive("voltageLevelKv must be greater than 0"),
    feederType: optionalNonEmptyString("feederType", 50),
    connectedLoadMw: decimalNumber("connectedLoadMw").nonnegative("connectedLoadMw cannot be negative").optional(),
    isActive: z.boolean().optional()
  })
  .strict();

export const updateOutgoingFeederBodySchema = z
  .object({
    feederName: nonEmptyString("feederName", 150).optional(),
    feederCode: optionalNonEmptyString("feederCode", 100),
    voltageLevelKv: decimalNumber("voltageLevelKv").positive("voltageLevelKv must be greater than 0").optional(),
    feederType: optionalNonEmptyString("feederType", 50),
    connectedLoadMw: decimalNumber("connectedLoadMw").nonnegative("connectedLoadMw cannot be negative").optional(),
    isActive: z.boolean().optional()
  })
  .strict()
  .refine(
    (value) =>
      value.feederName !== undefined ||
      value.feederCode !== undefined ||
      value.voltageLevelKv !== undefined ||
      value.feederType !== undefined ||
      value.connectedLoadMw !== undefined ||
      value.isActive !== undefined,
    "At least one field must be provided"
  );

export const listOutgoingFeedersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  sortBy: z
    .enum([
      "feederName",
      "feederCode",
      "voltageLevelKv",
      "feederType",
      "connectedLoadMw",
      "isActive",
      "createdAt",
      "updatedAt"
    ])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  substationId: z.string().uuid().optional(),
  subVerticalId: z.string().uuid().optional(),
  verticalId: z.string().uuid().optional(),
  zoneId: z.string().uuid().optional(),
  discomId: z.string().uuid().optional(),
  voltageLevelKv: decimalNumber("voltageLevelKv").positive("voltageLevelKv must be greater than 0").optional(),
  feederType: z.string().trim().min(1, "feederType cannot be empty").optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  includeDeleted: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .default("false")
});

export type OutgoingFeederIdParams = z.infer<typeof outgoingFeederIdParamsSchema>;
export type CreateOutgoingFeederBody = z.infer<typeof createOutgoingFeederBodySchema>;
export type UpdateOutgoingFeederBody = z.infer<typeof updateOutgoingFeederBodySchema>;
export type ListOutgoingFeedersQuery = z.infer<typeof listOutgoingFeedersQuerySchema>;
