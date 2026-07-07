import { AreaType, RoleName } from "@prisma/client";
import { z } from "zod";

const areaMappingSchema = z
  .object({
    areaType: z.nativeEnum(AreaType),
    discomId: z.string().uuid().optional(),
    zoneId: z.string().uuid().optional(),
    verticalId: z.string().uuid().optional(),
    subVerticalId: z.string().uuid().optional(),
    substationId: z.string().uuid().optional(),
    isPrimary: z.boolean().default(false)
  })
  .superRefine((value, ctx) => {
    const keys = ["discomId", "zoneId", "verticalId", "subVerticalId", "substationId"] as const;
    const populatedKeys = keys.filter((key) => Boolean(value[key]));

    if (populatedKeys.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Exactly one area id must be provided"
      });
      return;
    }

    const expectedKeyByType: Record<AreaType, (typeof keys)[number]> = {
      DISCOM: "discomId",
      ZONE: "zoneId",
      VERTICAL: "verticalId",
      SUB_VERTICAL: "subVerticalId",
      SUBSTATION: "substationId"
    };

    if (populatedKeys[0] !== expectedKeyByType[value.areaType]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "areaType must match the provided area id"
      });
    }
  });

export const createUserBodySchema = z.object({
  name: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(255),
  role: z.enum([RoleName.EE, RoleName.AE, RoleName.JE]),
  employeeId: z.string().trim().min(2).max(100).optional(),
  designation: z.string().trim().min(2).max(150).optional(),
  areaMappings: z.array(areaMappingSchema).min(1)
});

export const completeProfileBodySchema = z.object({
  mobileNumber: z.string().trim().min(8).max(20),
  employeeId: z.string().trim().min(2).max(100),
  designation: z.string().trim().min(2).max(150),
  profileData: z.record(z.unknown()).default({})
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;
export type CreateUserAreaMappingBody = z.infer<typeof areaMappingSchema>;
export type CompleteProfileBody = z.infer<typeof completeProfileBodySchema>;
