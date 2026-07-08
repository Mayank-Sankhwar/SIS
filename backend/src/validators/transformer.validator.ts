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

const commissioningDateSchema = z.coerce
  .date({
    invalid_type_error: "commissioningDate must be a valid date"
  })
  .refine((value) => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return value <= today;
  }, "commissioningDate cannot be in the future");

export const transformerIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const createTransformerBodySchema = z
  .object({
    substationId: z.string().uuid(),
    transformerCode: nonEmptyString("transformerCode", 100),
    capacityMva: decimalNumber("capacityMva").positive("capacityMva must be greater than 0"),
    primaryVoltageKv: decimalNumber("primaryVoltageKv").positive("primaryVoltageKv must be greater than 0"),
    secondaryVoltageKv: decimalNumber("secondaryVoltageKv").positive("secondaryVoltageKv must be greater than 0"),
    make: optionalNonEmptyString("make", 150),
    serialNumber: optionalNonEmptyString("serialNumber", 150),
    commissioningDate: commissioningDateSchema.optional(),
    isActive: z.boolean().optional()
  })
  .strict();

export const updateTransformerBodySchema = z
  .object({
    capacityMva: decimalNumber("capacityMva").positive("capacityMva must be greater than 0").optional(),
    primaryVoltageKv: decimalNumber("primaryVoltageKv").positive("primaryVoltageKv must be greater than 0").optional(),
    secondaryVoltageKv: decimalNumber("secondaryVoltageKv").positive("secondaryVoltageKv must be greater than 0").optional(),
    make: optionalNonEmptyString("make", 150),
    serialNumber: optionalNonEmptyString("serialNumber", 150),
    commissioningDate: commissioningDateSchema.optional(),
    isActive: z.boolean().optional()
  })
  .strict()
  .refine(
    (value) =>
      value.capacityMva !== undefined ||
      value.primaryVoltageKv !== undefined ||
      value.secondaryVoltageKv !== undefined ||
      value.make !== undefined ||
      value.serialNumber !== undefined ||
      value.commissioningDate !== undefined ||
      value.isActive !== undefined,
    "At least one field must be provided"
  );

export const listTransformersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  sortBy: z
    .enum([
      "transformerCode",
      "capacityMva",
      "primaryVoltageKv",
      "secondaryVoltageKv",
      "make",
      "serialNumber",
      "commissioningDate",
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
  capacityMva: decimalNumber("capacityMva").positive("capacityMva must be greater than 0").optional(),
  primaryVoltageKv: decimalNumber("primaryVoltageKv").positive("primaryVoltageKv must be greater than 0").optional(),
  secondaryVoltageKv: decimalNumber("secondaryVoltageKv").positive("secondaryVoltageKv must be greater than 0").optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  includeDeleted: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .default("false")
});

export type TransformerIdParams = z.infer<typeof transformerIdParamsSchema>;
export type CreateTransformerBody = z.infer<typeof createTransformerBodySchema>;
export type UpdateTransformerBody = z.infer<typeof updateTransformerBodySchema>;
export type ListTransformersQuery = z.infer<typeof listTransformersQuerySchema>;
