import { RoleName } from "@prisma/client";
import type { RequestHandler } from "express";
import { Router } from "express";
import { OutgoingFeederController } from "../controllers/outgoing-feeder.controller.js";
import { authenticate, authorizeRoles, checkAreaAccess } from "../middlewares/auth.middleware.js";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createOutgoingFeederBodySchema,
  listOutgoingFeedersQuerySchema,
  outgoingFeederIdParamsSchema,
  updateOutgoingFeederBodySchema
} from "../validators/outgoing-feeder.validator.js";

const router = Router();
const outgoingFeederController = new OutgoingFeederController();

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
 * /api/v1/outgoing-feeders:
 *   post:
 *     summary: Create an Outgoing Feeder
 *     tags: [Outgoing Feeders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [substationId, feederName, voltageLevelKv]
 *             properties:
 *               substationId:
 *                 type: string
 *                 format: uuid
 *               feederName:
 *                 type: string
 *                 example: Govindpura Industrial Feeder
 *               feederCode:
 *                 type: string
 *                 example: FD-GOV-IND-01
 *               voltageLevelKv:
 *                 type: number
 *                 example: 11
 *               feederType:
 *                 type: string
 *                 example: INDUSTRIAL
 *               connectedLoadMw:
 *                 type: number
 *                 example: 18.5
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Outgoing Feeder created successfully
 *       403:
 *         description: Role or area access denied
 *       409:
 *         description: Duplicate feeder name or code within this Substation
 *       422:
 *         description: Validation failed or parent hierarchy is inactive/deleted
 */
router.post(
  "/",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE),
  validateBody(createOutgoingFeederBodySchema),
  checkAreaAccess(),
  asyncHandler(outgoingFeederController.create)
);

/**
 * @openapi
 * /api/v1/outgoing-feeders:
 *   get:
 *     summary: List Outgoing Feeders
 *     tags: [Outgoing Feeders]
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
 *           enum: [feederName, feederCode, voltageLevelKv, feederType, connectedLoadMw, isActive, createdAt, updatedAt]
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
 *         name: feederType
 *         schema:
 *           type: string
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
 *         description: Outgoing Feeders fetched successfully
 *       403:
 *         description: Role or area access denied
 *       422:
 *         description: Validation failed
 */
router.get(
  "/",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  validateQuery(listOutgoingFeedersQuerySchema),
  checkExplicitListAreaAccess,
  asyncHandler(outgoingFeederController.list)
);

/**
 * @openapi
 * /api/v1/outgoing-feeders/{id}:
 *   get:
 *     summary: Get Outgoing Feeder by ID
 *     tags: [Outgoing Feeders]
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
 *         description: Outgoing Feeder fetched successfully
 *       403:
 *         description: Role or area access denied
 *       404:
 *         description: Outgoing Feeder not found
 */
router.get(
  "/:id",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  validateParams(outgoingFeederIdParamsSchema),
  asyncHandler(outgoingFeederController.getById)
);

/**
 * @openapi
 * /api/v1/outgoing-feeders/{id}:
 *   patch:
 *     summary: Update Outgoing Feeder
 *     tags: [Outgoing Feeders]
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
 *               feederName:
 *                 type: string
 *               feederCode:
 *                 type: string
 *               voltageLevelKv:
 *                 type: number
 *               feederType:
 *                 type: string
 *               connectedLoadMw:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Outgoing Feeder updated successfully
 *       403:
 *         description: Role or area access denied
 *       404:
 *         description: Outgoing Feeder not found
 *       409:
 *         description: Duplicate or deleted record
 *       422:
 *         description: Validation failed or parent hierarchy is inactive/deleted
 */
router.patch(
  "/:id",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE),
  validateParams(outgoingFeederIdParamsSchema),
  validateBody(updateOutgoingFeederBodySchema),
  asyncHandler(outgoingFeederController.update)
);

/**
 * @openapi
 * /api/v1/outgoing-feeders/{id}:
 *   delete:
 *     summary: Soft delete Outgoing Feeder
 *     tags: [Outgoing Feeders]
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
 *         description: Outgoing Feeder deleted successfully
 *       403:
 *         description: Role or area access denied
 *       404:
 *         description: Outgoing Feeder not found
 *       409:
 *         description: Outgoing Feeder is already deleted
 */
router.delete(
  "/:id",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE),
  validateParams(outgoingFeederIdParamsSchema),
  asyncHandler(outgoingFeederController.softDelete)
);

export { router as outgoingFeederRoutes };
