import { Router } from "express";
import { HealthController } from "../controllers/health.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
import { healthQueryValidator } from "../validators/health.validator.js";
import { handleValidationResult } from "../middlewares/validate.middleware.js";

const router = Router();
const healthController = new HealthController();

router.get("/", healthQueryValidator, handleValidationResult, asyncHandler(healthController.health));

export { router as healthRoutes };
