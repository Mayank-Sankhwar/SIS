import { RoleName } from "@prisma/client";
import { Router } from "express";
import { UserManagementController } from "../controllers/user-management.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  completeProfileBodySchema,
  createUserBodySchema
} from "../validators/user-management.validator.js";

const router = Router();
const userManagementController = new UserManagementController();

router.post(
  "/",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE),
  validateBody(createUserBodySchema),
  asyncHandler(userManagementController.createUser)
);

router.patch(
  "/me/profile",
  authenticate,
  validateBody(completeProfileBodySchema),
  asyncHandler(userManagementController.completeProfile)
);

export { router as userManagementRoutes };
