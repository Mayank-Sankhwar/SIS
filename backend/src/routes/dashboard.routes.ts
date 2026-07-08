import { RoleName } from "@prisma/client";
import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();
const dashboardController = new DashboardController();

/**
 * @openapi
 * /api/v1/dashboard/summary:
 *   get:
 *     summary: Get dashboard summary counts
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Role access denied
 */
router.get(
  "/summary",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  asyncHandler(dashboardController.summary)
);

/**
 * @openapi
 * /api/v1/dashboard/equipment-summary:
 *   get:
 *     summary: Get dashboard equipment aggregate summary
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard equipment summary fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Role access denied
 */
router.get(
  "/equipment-summary",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  asyncHandler(dashboardController.equipmentSummary)
);

/**
 * @openapi
 * /api/v1/dashboard/hierarchy-summary:
 *   get:
 *     summary: Get dashboard hierarchy aggregate summary
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard hierarchy summary fetched successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Role access denied
 */
router.get(
  "/hierarchy-summary",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  asyncHandler(dashboardController.hierarchySummary)
);

/**
 * @openapi
 * /api/v1/dashboard/equipment-distribution:
 *   get:
 *     summary: Get equipment counts grouped by hierarchy
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: discomId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: zoneId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: verticalId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: subVerticalId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: substationId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Dashboard equipment distribution fetched successfully
 */
router.get(
  "/equipment-distribution",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  asyncHandler(dashboardController.equipmentDistribution)
);

/**
 * @openapi
 * /api/v1/dashboard/substation-status:
 *   get:
 *     summary: Get active and inactive substation counts grouped by hierarchy
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard substation status fetched successfully
 */
router.get(
  "/substation-status",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  asyncHandler(dashboardController.substationStatus)
);

/**
 * @openapi
 * /api/v1/dashboard/transformer-capacity:
 *   get:
 *     summary: Get transformer capacity analytics grouped by hierarchy
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard transformer capacity fetched successfully
 */
router.get(
  "/transformer-capacity",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  asyncHandler(dashboardController.transformerCapacity)
);

/**
 * @openapi
 * /api/v1/dashboard/feeder-load:
 *   get:
 *     summary: Get outgoing feeder connected load analytics grouped by hierarchy
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard feeder load fetched successfully
 */
router.get(
  "/feeder-load",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  asyncHandler(dashboardController.feederLoad)
);

/**
 * @openapi
 * /api/v1/dashboard/import-history:
 *   get:
 *     summary: Get recent import history
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Dashboard import history fetched successfully
 */
router.get(
  "/import-history",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  asyncHandler(dashboardController.importHistory)
);

/**
 * @openapi
 * /api/v1/dashboard/recent-import-errors:
 *   get:
 *     summary: Get recent import validation errors
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard recent import errors fetched successfully
 */
router.get(
  "/recent-import-errors",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  asyncHandler(dashboardController.recentImportErrors)
);

/**
 * @openapi
 * /api/v1/dashboard/map:
 *   get:
 *     summary: Get active substations with coordinates and equipment counts
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard map data fetched successfully
 */
router.get(
  "/map",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  asyncHandler(dashboardController.map)
);

export { router as dashboardRoutes };
