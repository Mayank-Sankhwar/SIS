import { Router } from "express";
import { authRoutes } from "./auth.routes.js";
import { discomRoutes } from "./discom.routes.js";
import { healthRoutes } from "./health.routes.js";
import { substationRoutes } from "./substation.routes.js";
import { subVerticalRoutes } from "./sub-vertical.routes.js";
import { userManagementRoutes } from "./user-management.routes.js";
import { verticalRoutes } from "./vertical.routes.js";
import { zoneRoutes } from "./zone.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/discoms", discomRoutes);
router.use("/health", healthRoutes);
router.use("/substations", substationRoutes);
router.use("/sub-verticals", subVerticalRoutes);
router.use("/users", userManagementRoutes);
router.use("/verticals", verticalRoutes);
router.use("/zones", zoneRoutes);

export { router as apiRoutes };
