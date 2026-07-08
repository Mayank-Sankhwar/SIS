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

export const incomingSourceIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const createIncomingSourceBodySchema = z
  .object({
    substationId: z.string().uuid(),
    sourceName: nonEmptyString("sourceName", 150),
    sourceType: optionalNonEmptyString("sourceType", 50),
    voltageLevelKv: decimalNumber("voltageLevelKv").positive("voltageLevelKv must be greater than 0"),
    feederName: optionalNonEmptyString("feederName", 150),
    meterNumber: optionalNonEmptyString("meterNumber", 100),
    isActive: z.boolean().optional()
  })
  .strict();

export const updateIncomingSourceBodySchema = z
  .object({
    sourceName: nonEmptyString("sourceName", 150).optional(),
    sourceType: optionalNonEmptyString("sourceType", 50),
    voltageLevelKv: decimalNumber("voltageLevelKv").positive("voltageLevelKv must be greater than 0").optional(),
    feederName: optionalNonEmptyString("feederName", 150),
    meterNumber: optionalNonEmptyString("meterNumber", 100),
    isActive: z.boolean().optional()
  })
  .strict()
  .refine(
    (value) =>
      value.sourceName !== undefined ||
      value.sourceType !== undefined ||
      value.voltageLevelKv !== undefined ||
      value.feederName !== undefined ||
      value.meterNumber !== undefined ||
      value.isActive !== undefined,
    "At least one field must be provided"
  );

export const listIncomingSourcesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  sortBy: z
    .enum(["sourceName", "sourceType", "voltageLevelKv", "feederName", "meterNumber", "isActive", "createdAt", "updatedAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  substationId: z.string().uuid().optional(),
  subVerticalId: z.string().uuid().optional(),
  verticalId: z.string().uuid().optional(),
  zoneId: z.string().uuid().optional(),
  discomId: z.string().uuid().optional(),
  voltageLevelKv: decimalNumber("voltageLevelKv").positive("voltageLevelKv must be greater than 0").optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  includeDeleted: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .default("false")
});

export type IncomingSourceIdParams = z.infer<typeof incomingSourceIdParamsSchema>;
export type CreateIncomingSourceBody = z.infer<typeof createIncomingSourceBodySchema>;
export type UpdateIncomingSourceBody = z.infer<typeof updateIncomingSourceBodySchema>;
export type ListIncomingSourcesQuery = z.infer<typeof listIncomingSourcesQuerySchema>;
