import { z } from "zod";

const nonEmptyString = (field: string, max: number) =>
  z.string().trim().min(1, `${field} is required`).max(max);

const optionalNonEmptyString = (field: string) =>
  z.string().trim().min(1, `${field} cannot be empty`).optional();

const decimalNumber = (field: string) =>
  z.coerce
    .number({
      invalid_type_error: `${field} must be a valid number`
    })
    .finite(`${field} must be a valid number`);

const commissioningDateSchema = z.coerce
  .date({
    invalid_type_error: "commissioningDate must be a valid date"
  })
  .refine((value) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return value <= today;
  }, "commissioningDate cannot be in the future");

export const substationIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const createSubstationBodySchema = z
  .object({
    subVerticalId: z.string().uuid(),
    name: nonEmptyString("name", 150),
    code: nonEmptyString("code", 50),
    voltageLevelKv: decimalNumber("voltageLevelKv").positive("voltageLevelKv must be greater than 0"),
    address: optionalNonEmptyString("address"),
    latitude: decimalNumber("latitude").min(-90).max(90).optional(),
    longitude: decimalNumber("longitude").min(-180).max(180).optional(),
    commissioningDate: commissioningDateSchema.optional(),
    isActive: z.boolean().optional()
  })
  .strict();

export const updateSubstationBodySchema = z
  .object({
    name: nonEmptyString("name", 150).optional(),
    code: nonEmptyString("code", 50).optional(),
    voltageLevelKv: decimalNumber("voltageLevelKv").positive("voltageLevelKv must be greater than 0").optional(),
    address: optionalNonEmptyString("address"),
    latitude: decimalNumber("latitude").min(-90).max(90).optional(),
    longitude: decimalNumber("longitude").min(-180).max(180).optional(),
    commissioningDate: commissioningDateSchema.optional(),
    isActive: z.boolean().optional()
  })
  .strict()
  .refine(
    (value) =>
      value.name !== undefined ||
      value.code !== undefined ||
      value.voltageLevelKv !== undefined ||
      value.address !== undefined ||
      value.latitude !== undefined ||
      value.longitude !== undefined ||
      value.commissioningDate !== undefined ||
      value.isActive !== undefined,
    "At least one field must be provided"
  );

export const listSubstationsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  sortBy: z
    .enum(["name", "code", "createdAt", "updatedAt", "commissioningDate", "voltageLevelKv"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
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

export type SubstationIdParams = z.infer<typeof substationIdParamsSchema>;
export type CreateSubstationBody = z.infer<typeof createSubstationBodySchema>;
export type UpdateSubstationBody = z.infer<typeof updateSubstationBodySchema>;
export type ListSubstationsQuery = z.infer<typeof listSubstationsQuerySchema>;
