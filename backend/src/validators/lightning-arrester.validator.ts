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

const installationDateSchema = z.coerce
  .date({
    invalid_type_error: "installationDate must be a valid date"
  })
  .refine((value) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return value <= today;
  }, "installationDate cannot be in the future");

export const lightningArresterIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const createLightningArresterBodySchema = z
  .object({
    substationId: z.string().uuid(),
    arresterCode: nonEmptyString("arresterCode", 100),
    locationDescription: optionalNonEmptyString("locationDescription", 255),
    voltageRatingKv: decimalNumber("voltageRatingKv").positive("voltageRatingKv must be greater than 0"),
    make: optionalNonEmptyString("make", 150),
    serialNumber: optionalNonEmptyString("serialNumber", 150),
    installationDate: installationDateSchema.optional(),
    isActive: z.boolean().optional()
  })
  .strict();

export const updateLightningArresterBodySchema = z
  .object({
    locationDescription: optionalNonEmptyString("locationDescription", 255),
    voltageRatingKv: decimalNumber("voltageRatingKv").positive("voltageRatingKv must be greater than 0").optional(),
    make: optionalNonEmptyString("make", 150),
    serialNumber: optionalNonEmptyString("serialNumber", 150),
    installationDate: installationDateSchema.optional(),
    isActive: z.boolean().optional()
  })
  .strict()
  .refine(
    (value) =>
      value.locationDescription !== undefined ||
      value.voltageRatingKv !== undefined ||
      value.make !== undefined ||
      value.serialNumber !== undefined ||
      value.installationDate !== undefined ||
      value.isActive !== undefined,
    "At least one field must be provided"
  );

export const listLightningArrestersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  sortBy: z
    .enum([
      "arresterCode",
      "locationDescription",
      "voltageRatingKv",
      "make",
      "serialNumber",
      "installationDate",
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
  voltageRatingKv: decimalNumber("voltageRatingKv").positive("voltageRatingKv must be greater than 0").optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  includeDeleted: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .default("false")
});

export type LightningArresterIdParams = z.infer<typeof lightningArresterIdParamsSchema>;
export type CreateLightningArresterBody = z.infer<typeof createLightningArresterBodySchema>;
export type UpdateLightningArresterBody = z.infer<typeof updateLightningArresterBodySchema>;
export type ListLightningArrestersQuery = z.infer<typeof listLightningArrestersQuerySchema>;
