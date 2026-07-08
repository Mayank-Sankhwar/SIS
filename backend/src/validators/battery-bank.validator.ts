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

export const batteryBankIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const createBatteryBankBodySchema = z
  .object({
    substationId: z.string().uuid(),
    batteryBankCode: nonEmptyString("batteryBankCode", 100),
    batteryType: optionalNonEmptyString("batteryType", 100),
    voltageV: decimalNumber("voltageV").positive("voltageV must be greater than 0"),
    capacityAh: decimalNumber("capacityAh").positive("capacityAh must be greater than 0"),
    cellCount: z.coerce.number().int().nonnegative("cellCount cannot be negative").optional(),
    make: optionalNonEmptyString("make", 150),
    installationDate: installationDateSchema.optional(),
    isActive: z.boolean().optional()
  })
  .strict();

export const updateBatteryBankBodySchema = z
  .object({
    batteryType: optionalNonEmptyString("batteryType", 100),
    voltageV: decimalNumber("voltageV").positive("voltageV must be greater than 0").optional(),
    capacityAh: decimalNumber("capacityAh").positive("capacityAh must be greater than 0").optional(),
    cellCount: z.coerce.number().int().nonnegative("cellCount cannot be negative").optional(),
    make: optionalNonEmptyString("make", 150),
    installationDate: installationDateSchema.optional(),
    isActive: z.boolean().optional()
  })
  .strict()
  .refine(
    (value) =>
      value.batteryType !== undefined ||
      value.voltageV !== undefined ||
      value.capacityAh !== undefined ||
      value.cellCount !== undefined ||
      value.make !== undefined ||
      value.installationDate !== undefined ||
      value.isActive !== undefined,
    "At least one field must be provided"
  );

export const listBatteryBanksQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
  sortBy: z
    .enum([
      "batteryBankCode",
      "batteryType",
      "voltageV",
      "capacityAh",
      "cellCount",
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
  voltageV: decimalNumber("voltageV").positive("voltageV must be greater than 0").optional(),
  capacityAh: decimalNumber("capacityAh").positive("capacityAh must be greater than 0").optional(),
  batteryType: z.string().trim().min(1, "batteryType cannot be empty").optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  includeDeleted: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .default("false")
});

export type BatteryBankIdParams = z.infer<typeof batteryBankIdParamsSchema>;
export type CreateBatteryBankBody = z.infer<typeof createBatteryBankBodySchema>;
export type UpdateBatteryBankBody = z.infer<typeof updateBatteryBankBodySchema>;
export type ListBatteryBanksQuery = z.infer<typeof listBatteryBanksQuerySchema>;
