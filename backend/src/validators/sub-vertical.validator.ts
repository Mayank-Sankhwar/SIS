import { z } from "zod";

export const subVerticalIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const createSubVerticalBodySchema = z.object({
  verticalId: z.string().uuid(),
  name: z.string().trim().min(1, "name is required").max(150),
  code: z.string().trim().min(1, "code is required").max(50)
});

export const updateSubVerticalBodySchema = createSubVerticalBodySchema.partial().refine(
  (value) => value.verticalId !== undefined || value.name !== undefined || value.code !== undefined,
  "At least one field must be provided"
);

export const listSubVerticalsQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(["name", "code", "createdAt", "updatedAt", "isActive"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  verticalId: z.string().uuid().optional(),
  zoneId: z.string().uuid().optional(),
  discomId: z.string().uuid().optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional()
});

export type SubVerticalIdParams = z.infer<typeof subVerticalIdParamsSchema>;
export type CreateSubVerticalBody = z.infer<typeof createSubVerticalBodySchema>;
export type UpdateSubVerticalBody = z.infer<typeof updateSubVerticalBodySchema>;
export type ListSubVerticalsQuery = z.infer<typeof listSubVerticalsQuerySchema>;
