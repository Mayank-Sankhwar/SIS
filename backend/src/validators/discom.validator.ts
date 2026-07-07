import { z } from "zod";

export const discomIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const createDiscomBodySchema = z.object({
  name: z.string().trim().min(1, "name is required").max(150),
  code: z.string().trim().min(1, "code is required").max(50)
});

export const updateDiscomBodySchema = createDiscomBodySchema.partial().refine(
  (value) => value.name !== undefined || value.code !== undefined,
  "At least one field must be provided"
);

export const listDiscomsQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(["name", "code", "createdAt", "updatedAt", "isActive"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
});

export type DiscomIdParams = z.infer<typeof discomIdParamsSchema>;
export type CreateDiscomBody = z.infer<typeof createDiscomBodySchema>;
export type UpdateDiscomBody = z.infer<typeof updateDiscomBodySchema>;
export type ListDiscomsQuery = z.infer<typeof listDiscomsQuerySchema>;
