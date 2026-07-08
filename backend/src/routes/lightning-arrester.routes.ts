import { RoleName } from "@prisma/client";
import type { RequestHandler } from "express";
import { Router } from "express";
import { LightningArresterController } from "../controllers/lightning-arrester.controller.js";
import { authenticate, authorizeRoles, checkAreaAccess } from "../middlewares/auth.middleware.js";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createLightningArresterBodySchema,
  lightningArresterIdParamsSchema,
  listLightningArrestersQuerySchema,
  updateLightningArresterBodySchema
} from "../validators/lightning-arrester.validator.js";

const router = Router();
const lightningArresterController = new LightningArresterController();

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
 * /api/v1/lightning-arresters:
 *   post:
 *     summary: Create a Lightning Arrester
 *     tags: [Lightning Arresters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [substationId, arresterCode, voltageRatingKv]
 *             properties:
 *               substationId:
 *                 type: string
 *                 format: uuid
 *               arresterCode:
 *                 type: string
 *                 example: LA-GOV-01
 *               locationDescription:
 *                 type: string
 *                 example: 33 KV incoming bay
 *               voltageRatingKv:
 *                 type: number
 *                 example: 33
 *               make:
 *                 type: string
 *                 example: Siemens
 *               serialNumber:
 *                 type: string
 *                 example: LA-BPL-001
 *               installationDate:
 *                 type: string
 *                 format: date
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Lightning Arrester created successfully
 *       403:
 *         description: Role or area access denied
 *       409:
 *         description: Duplicate arrester code or serial number
 *       422:
 *         description: Validation failed or parent hierarchy is inactive/deleted
 */
router.post(
  "/",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE),
  validateBody(createLightningArresterBodySchema),
  checkAreaAccess(),
  asyncHandler(lightningArresterController.create)
);

/**
 * @openapi
 * /api/v1/lightning-arresters:
 *   get:
 *     summary: List Lightning Arresters
 *     tags: [Lightning Arresters]
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
 *           enum: [arresterCode, locationDescription, voltageRatingKv, make, serialNumber, installationDate, isActive, createdAt, updatedAt]
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
 *         name: voltageRatingKv
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
 *         description: Lightning Arresters fetched successfully
 *       403:
 *         description: Role or area access denied
 *       422:
 *         description: Validation failed
 */
router.get(
  "/",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  validateQuery(listLightningArrestersQuerySchema),
  checkExplicitListAreaAccess,
  asyncHandler(lightningArresterController.list)
);

/**
 * @openapi
 * /api/v1/lightning-arresters/{id}:
 *   get:
 *     summary: Get Lightning Arrester by ID
 *     tags: [Lightning Arresters]
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
 *         description: Lightning Arrester fetched successfully
 *       403:
 *         description: Role or area access denied
 *       404:
 *         description: Lightning Arrester not found
 */
router.get(
  "/:id",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  validateParams(lightningArresterIdParamsSchema),
  asyncHandler(lightningArresterController.getById)
);

/**
 * @openapi
 * /api/v1/lightning-arresters/{id}:
 *   patch:
 *     summary: Update Lightning Arrester
 *     tags: [Lightning Arresters]
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
 *               locationDescription:
 *                 type: string
 *               voltageRatingKv:
 *                 type: number
 *               make:
 *                 type: string
 *               serialNumber:
 *                 type: string
 *               installationDate:
 *                 type: string
 *                 format: date
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Lightning Arrester updated successfully
 *       403:
 *         description: Role or area access denied
 *       404:
 *         description: Lightning Arrester not found
 *       409:
 *         description: Duplicate serial number or deleted record
 *       422:
 *         description: Validation failed or parent hierarchy is inactive/deleted
 */
router.patch(
  "/:id",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE),
  validateParams(lightningArresterIdParamsSchema),
  validateBody(updateLightningArresterBodySchema),
  asyncHandler(lightningArresterController.update)
);

/**
 * @openapi
 * /api/v1/lightning-arresters/{id}:
 *   delete:
 *     summary: Soft delete Lightning Arrester
 *     tags: [Lightning Arresters]
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
 *         description: Lightning Arrester deleted successfully
 *       403:
 *         description: Role or area access denied
 *       404:
 *         description: Lightning Arrester not found
 *       409:
 *         description: Lightning Arrester is already deleted
 */
router.delete(
  "/:id",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE),
  validateParams(lightningArresterIdParamsSchema),
  asyncHandler(lightningArresterController.softDelete)
);

export { router as lightningArresterRoutes };
