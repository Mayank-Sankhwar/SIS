import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import { loginBodySchema } from "../validators/auth.validator.js";

const router = Router();
const authController = new AuthController();

router.post("/login", validateBody(loginBodySchema), asyncHandler(authController.login));
router.get("/profile", authenticate, asyncHandler(authController.profile));

export { router as authRoutes };
