import { RoleName } from "@prisma/client";
import type { RequestHandler } from "express";
import { Router } from "express";
import { BatteryBankController } from "../controllers/battery-bank.controller.js";
import { authenticate, authorizeRoles, checkAreaAccess } from "../middlewares/auth.middleware.js";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  batteryBankIdParamsSchema,
  createBatteryBankBodySchema,
  listBatteryBanksQuerySchema,
  updateBatteryBankBodySchema
} from "../validators/battery-bank.validator.js";

const router = Router();
const batteryBankController = new BatteryBankController();

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
 * /api/v1/battery-banks:
 *   post:
 *     summary: Create a Battery Bank
 *     tags: [Battery Banks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [substationId, batteryBankCode, voltageV, capacityAh]
 *             properties:
 *               substationId:
 *                 type: string
 *                 format: uuid
 *               batteryBankCode:
 *                 type: string
 *                 example: BB-GOV-01
 *               batteryType:
 *                 type: string
 *                 example: VRLA
 *               voltageV:
 *                 type: number
 *                 example: 220
 *               capacityAh:
 *                 type: number
 *                 example: 300
 *               cellCount:
 *                 type: integer
 *                 minimum: 0
 *                 example: 110
 *               make:
 *                 type: string
 *                 example: Exide
 *               installationDate:
 *                 type: string
 *                 format: date
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Battery Bank created successfully
 *       403:
 *         description: Role or area access denied
 *       409:
 *         description: Duplicate battery bank code within this Substation
 *       422:
 *         description: Validation failed or parent hierarchy is inactive/deleted
 */
router.post(
  "/",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE),
  validateBody(createBatteryBankBodySchema),
  checkAreaAccess(),
  asyncHandler(batteryBankController.create)
);

/**
 * @openapi
 * /api/v1/battery-banks:
 *   get:
 *     summary: List Battery Banks
 *     tags: [Battery Banks]
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
 *           enum: [batteryBankCode, batteryType, voltageV, capacityAh, cellCount, make, installationDate, isActive, createdAt, updatedAt]
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
 *         name: voltageV
 *         schema:
 *           type: number
 *       - in: query
 *         name: capacityAh
 *         schema:
 *           type: number
 *       - in: query
 *         name: batteryType
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
 *         description: Battery Banks fetched successfully
 *       403:
 *         description: Role or area access denied
 *       422:
 *         description: Validation failed
 */
router.get(
  "/",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  validateQuery(listBatteryBanksQuerySchema),
  checkExplicitListAreaAccess,
  asyncHandler(batteryBankController.list)
);

/**
 * @openapi
 * /api/v1/battery-banks/{id}:
 *   get:
 *     summary: Get Battery Bank by ID
 *     tags: [Battery Banks]
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
 *         description: Battery Bank fetched successfully
 *       403:
 *         description: Role or area access denied
 *       404:
 *         description: Battery Bank not found
 */
router.get(
  "/:id",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  validateParams(batteryBankIdParamsSchema),
  asyncHandler(batteryBankController.getById)
);

/**
 * @openapi
 * /api/v1/battery-banks/{id}:
 *   patch:
 *     summary: Update Battery Bank
 *     tags: [Battery Banks]
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
 *               batteryType:
 *                 type: string
 *               voltageV:
 *                 type: number
 *               capacityAh:
 *                 type: number
 *               cellCount:
 *                 type: integer
 *                 minimum: 0
 *               make:
 *                 type: string
 *               installationDate:
 *                 type: string
 *                 format: date
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Battery Bank updated successfully
 *       403:
 *         description: Role or area access denied
 *       404:
 *         description: Battery Bank not found
 *       409:
 *         description: Deleted record
 *       422:
 *         description: Validation failed or parent hierarchy is inactive/deleted
 */
router.patch(
  "/:id",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE),
  validateParams(batteryBankIdParamsSchema),
  validateBody(updateBatteryBankBodySchema),
  asyncHandler(batteryBankController.update)
);

/**
 * @openapi
 * /api/v1/battery-banks/{id}:
 *   delete:
 *     summary: Soft delete Battery Bank
 *     tags: [Battery Banks]
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
 *         description: Battery Bank deleted successfully
 *       403:
 *         description: Role or area access denied
 *       404:
 *         description: Battery Bank not found
 *       409:
 *         description: Battery Bank is already deleted
 */
router.delete(
  "/:id",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE),
  validateParams(batteryBankIdParamsSchema),
  asyncHandler(batteryBankController.softDelete)
);

export { router as batteryBankRoutes };
