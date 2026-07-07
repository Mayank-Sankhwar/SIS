import { z } from "zod";

export const zoneIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const createZoneBodySchema = z.object({
  discomId: z.string().uuid(),
  name: z.string().trim().min(1, "name is required").max(150),
  code: z.string().trim().min(1, "code is required").max(50)
});

export const updateZoneBodySchema = createZoneBodySchema.partial().refine(
  (value) => value.discomId !== undefined || value.name !== undefined || value.code !== undefined,
  "At least one field must be provided"
);

export const listZonesQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(["name", "code", "createdAt", "updatedAt", "isActive"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  discomId: z.string().uuid().optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional()
});

export type ZoneIdParams = z.infer<typeof zoneIdParamsSchema>;
export type CreateZoneBody = z.infer<typeof createZoneBodySchema>;
export type UpdateZoneBody = z.infer<typeof updateZoneBodySchema>;
export type ListZonesQuery = z.infer<typeof listZonesQuerySchema>;
