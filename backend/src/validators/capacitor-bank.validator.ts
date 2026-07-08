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

export const capacitorBankIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const createCapacitorBankBodySchema = z
  .object({
    substationId: z.string().uuid(),
    capacitorBankCode: nonEmptyString("capacitorBankCode", 100),
    capacityMvar: decimalNumber("capacityMvar").positive("capacityMvar must be greater than 0"),
    voltageLevelKv: decimalNumber("voltageLevelKv").positive("voltageLevelKv must be greater than 0"),
    stepsCount: z.coerce.number().int().nonnegative("stepsCount cannot be negative").optional(),
    make: optionalNonEmptyString("make", 150),
    installationDate: installationDateSchema.optional(),
    isActive: z.boolean().optional()
  })
  .strict();

export const updateCapacitorBankBodySchema = z
  .object({
    capacityMvar: decimalNumber("capacityMvar").positive("capacityMvar must be greater than 0").optional(),
    voltageLevelKv: decimalNumber("voltageLevelKv").positive("voltageLevelKv must be greater than 0").optional(),
    stepsCount: z.coerce.number().int().nonnegative("stepsCount cannot be negative").optional(),
    make: optionalNonEmptyString("make", 150),
    installationDate: installationDateSchema.optional(),
    isActive: z.boolean().optional()
  })
  .strict()
  .refine(
    (value) =>
      value.capacityMvar !== undefined ||
      value.voltageLevelKv !== undefined ||
      value.stepsCount !== undefined ||
      value.make !== undefined ||
      value.installationDate !== undefined ||
      value.isActive !== undefined,
    "At least one field must be provided"
  );

export const listCapacitorBanksQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  sortBy: z
    .enum([
      "capacitorBankCode",
      "capacityMvar",
      "voltageLevelKv",
      "stepsCount",
      "make",
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
  capacityMvar: decimalNumber("capacityMvar").positive("capacityMvar must be greater than 0").optional(),
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

export type CapacitorBankIdParams = z.infer<typeof capacitorBankIdParamsSchema>;
export type CreateCapacitorBankBody = z.infer<typeof createCapacitorBankBodySchema>;
export type UpdateCapacitorBankBody = z.infer<typeof updateCapacitorBankBodySchema>;
export type ListCapacitorBanksQuery = z.infer<typeof listCapacitorBanksQuerySchema>;
