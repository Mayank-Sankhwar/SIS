import { RoleName } from "@prisma/client";
import type { RequestHandler } from "express";
import { Router } from "express";
import { IncomingSourceController } from "../controllers/incoming-source.controller.js";
import { authenticate, authorizeRoles, checkAreaAccess } from "../middlewares/auth.middleware.js";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createIncomingSourceBodySchema,
  incomingSourceIdParamsSchema,
  listIncomingSourcesQuerySchema,
  updateIncomingSourceBodySchema
} from "../validators/incoming-source.validator.js";

const router = Router();
const incomingSourceController = new IncomingSourceController();

const explicitListAreaAccess = checkAreaAccess();
const checkExplicitListAreaAccess: RequestHandler = (req, res, next) => {
  const hasAreaFilter = Boolean(
    req.query.discomId ||
      req.query.zoneId ||
      req.query.verticalId ||
      req.query.subVerticalId ||
      req.query.substationId
  );

  if (!hasAreaFilter) {
    next();
    return;
  }

  explicitListAreaAccess(req, res, next);
};

/**
 * @openapi
 * /api/v1/incoming-sources:
 *   post:
 *     summary: Create an Incoming Source
 *     tags: [Incoming Sources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [substationId, sourceName, voltageLevelKv]
 *             properties:
 *               substationId:
 *                 type: string
 *                 format: uuid
 *               sourceName:
 *                 type: string
 *                 example: 132 KV Bhopal Grid
 *               sourceType:
 *                 type: string
 *                 example: GRID
 *               voltageLevelKv:
 *                 type: number
 *                 example: 132
 *               feederName:
 *                 type: string
 *                 example: BPL-GRID-1
 *               meterNumber:
 *                 type: string
 *                 example: MTR-BPL-1001
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Incoming Source created successfully
 *       403:
 *         description: Role or area access denied
 *       409:
 *         description: Duplicate source name within this Substation
 *       422:
 *         description: Validation failed or parent hierarchy is inactive/deleted
 */
router.post(
  "/",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE),
  validateBody(createIncomingSourceBodySchema),
  checkAreaAccess(),
  asyncHandler(incomingSourceController.create)
);

/**
 * @openapi
 * /api/v1/incoming-sources:
 *   get:
 *     summary: List Incoming Sources
 *     tags: [Incoming Sources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [sourceName, sourceType, voltageLevelKv, feederName, meterNumber, isActive, createdAt, updatedAt]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: substationId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: subVerticalId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: verticalId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: zoneId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: discomId
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
 *       - in: query
 *         name: includeDeleted
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Incoming Sources fetched successfully
 *       403:
 *         description: Role or area access denied
 *       422:
 *         description: Validation failed
 */
router.get(
  "/",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  validateQuery(listIncomingSourcesQuerySchema),
  checkExplicitListAreaAccess,
  asyncHandler(incomingSourceController.list)
);

/**
 * @openapi
 * /api/v1/incoming-sources/{id}:
 *   get:
 *     summary: Get Incoming Source by ID
 *     tags: [Incoming Sources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Incoming Source fetched successfully
 *       403:
 *         description: Role or area access denied
 *       404:
 *         description: Incoming Source not found
 */
router.get(
  "/:id",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  validateParams(incomingSourceIdParamsSchema),
  asyncHandler(incomingSourceController.getById)
);

/**
 * @openapi
 * /api/v1/incoming-sources/{id}:
 *   patch:
 *     summary: Update Incoming Source
 *     tags: [Incoming Sources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sourceName:
 *                 type: string
 *               sourceType:
 *                 type: string
 *               voltageLevelKv:
 *                 type: number
 *               feederName:
 *                 type: string
 *               meterNumber:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Incoming Source updated successfully
 *       403:
 *         description: Role or area access denied
 *       404:
 *         description: Incoming Source not found
 *       409:
 *         description: Duplicate or deleted record
 *       422:
 *         description: Validation failed or parent hierarchy is inactive/deleted
 */
router.patch(
  "/:id",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE),
  validateParams(incomingSourceIdParamsSchema),
  validateBody(updateIncomingSourceBodySchema),
  asyncHandler(incomingSourceController.update)
);

/**
 * @openapi
 * /api/v1/incoming-sources/{id}:
 *   delete:
 *     summary: Soft delete Incoming Source
 *     tags: [Incoming Sources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Incoming Source deleted successfully
 *       403:
 *         description: Role or area access denied
 *       404:
 *         description: Incoming Source not found
 *       409:
 *         description: Incoming Source is already deleted
 */
router.delete(
  "/:id",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE),
  validateParams(incomingSourceIdParamsSchema),
  asyncHandler(incomingSourceController.softDelete)
);

export { router as incomingSourceRoutes };
