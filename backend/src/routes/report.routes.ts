import { RoleName } from "@prisma/client";
import { Router } from "express";
import { ReportController } from "../controllers/report.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();
const reportController = new ReportController();

/**
 * @openapi
 * /api/v1/reports/substations:
 *   get:
 *     summary: Export filtered substation report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, xlsx]
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
 *       - in: query
 *         name: voltageLevelKv
 *         schema:
 *           type: number
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Substation report fetched successfully
 */
router.get(
  "/substations",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  asyncHandler(reportController.substations)
);

/**
 * @openapi
 * /api/v1/reports/transformers:
 *   get:
 *     summary: Export filtered transformer report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transformer report fetched successfully
 */
router.get(
  "/transformers",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  asyncHandler(reportController.transformers)
);

/**
 * @openapi
 * /api/v1/reports/feeders:
 *   get:
 *     summary: Export filtered outgoing feeder report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Feeder report fetched successfully
 */
router.get(
  "/feeders",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  asyncHandler(reportController.feeders)
);

/**
 * @openapi
 * /api/v1/reports/equipment-summary:
 *   get:
 *     summary: Export equipment summary report grouped by hierarchy
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Equipment summary report fetched successfully
 */
router.get(
  "/equipment-summary",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  asyncHandler(reportController.equipmentSummary)
);

/**
 * @openapi
 * /api/v1/reports/substations/pdf:
 *   get:
 *     summary: Export printable substation PDF report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Substation PDF report fetched successfully
 */
router.get(
  "/substations/pdf",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  asyncHandler(reportController.substationsPdf)
);

/**
 * @openapi
 * /api/v1/reports/transformers/pdf:
 *   get:
 *     summary: Export printable transformer PDF report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Transformer PDF report fetched successfully
 */
router.get(
  "/transformers/pdf",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  asyncHandler(reportController.transformersPdf)
);

/**
 * @openapi
 * /api/v1/reports/feeders/pdf:
 *   get:
 *     summary: Export printable feeder PDF report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Feeder PDF report fetched successfully
 */
router.get(
  "/feeders/pdf",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  asyncHandler(reportController.feedersPdf)
);

/**
 * @openapi
 * /api/v1/reports/equipment-summary/pdf:
 *   get:
 *     summary: Export printable equipment summary PDF report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Equipment summary PDF report fetched successfully
 */
router.get(
  "/equipment-summary/pdf",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  asyncHandler(reportController.equipmentSummaryPdf)
);

/**
 * @openapi
 * /api/v1/reports/import-history:
 *   get:
 *     summary: Export import history report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Import history report fetched successfully
 */
router.get(
  "/import-history",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  asyncHandler(reportController.importHistory)
);

/**
 * @openapi
 * /api/v1/reports/import-errors:
 *   get:
 *     summary: Export import error report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Import error report fetched successfully
 */
router.get(
  "/import-errors",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  asyncHandler(reportController.importErrors)
);

/**
 * @openapi
 * /api/v1/reports/audit-log:
 *   get:
 *     summary: Export audit log report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit log report fetched successfully
 */
router.get(
  "/audit-log",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  asyncHandler(reportController.auditLog)
);

export { router as reportRoutes };
