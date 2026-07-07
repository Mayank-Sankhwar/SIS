import { z } from "zod";

export const verticalIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const createVerticalBodySchema = z.object({
  zoneId: z.string().uuid(),
  name: z.string().trim().min(1, "name is required").max(150),
  code: z.string().trim().min(1, "code is required").max(50)
});

export const updateVerticalBodySchema = createVerticalBodySchema.partial().refine(
  (value) => value.zoneId !== undefined || value.name !== undefined || value.code !== undefined,
  "At least one field must be provided"
);

export const listVerticalsQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(["name", "code", "createdAt", "updatedAt", "isActive"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  zoneId: z.string().uuid().optional(),
  discomId: z.string().uuid().optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional()
});

export type VerticalIdParams = z.infer<typeof verticalIdParamsSchema>;
export type CreateVerticalBody = z.infer<typeof createVerticalBodySchema>;
export type UpdateVerticalBody = z.infer<typeof updateVerticalBodySchema>;
export type ListVerticalsQuery = z.infer<typeof listVerticalsQuerySchema>;
