import { RoleName } from "@prisma/client";
import type { RequestHandler } from "express";
import { Router } from "express";
import { CapacitorBankController } from "../controllers/capacitor-bank.controller.js";
import { authenticate, authorizeRoles, checkAreaAccess } from "../middlewares/auth.middleware.js";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  capacitorBankIdParamsSchema,
  createCapacitorBankBodySchema,
  listCapacitorBanksQuerySchema,
  updateCapacitorBankBodySchema
} from "../validators/capacitor-bank.validator.js";

const router = Router();
const capacitorBankController = new CapacitorBankController();

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
 * /api/v1/capacitor-banks:
 *   post:
 *     summary: Create a Capacitor Bank
 *     tags: [Capacitor Banks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [substationId, capacitorBankCode, capacityMvar, voltageLevelKv]
 *             properties:
 *               substationId:
 *                 type: string
 *                 format: uuid
 *               capacitorBankCode:
 *                 type: string
 *                 example: CB-GOV-01
 *               capacityMvar:
 *                 type: number
 *                 example: 2.5
 *               voltageLevelKv:
 *                 type: number
 *                 example: 11
 *               stepsCount:
 *                 type: integer
 *                 minimum: 0
 *                 example: 5
 *               make:
 *                 type: string
 *                 example: L&T
 *               installationDate:
 *                 type: string
 *                 format: date
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Capacitor Bank created successfully
 *       403:
 *         description: Role or area access denied
 *       409:
 *         description: Duplicate capacitor bank code within this Substation
 *       422:
 *         description: Validation failed or parent hierarchy is inactive/deleted
 */
router.post(
  "/",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE),
  validateBody(createCapacitorBankBodySchema),
  checkAreaAccess(),
  asyncHandler(capacitorBankController.create)
);

/**
 * @openapi
 * /api/v1/capacitor-banks:
 *   get:
 *     summary: List Capacitor Banks
 *     tags: [Capacitor Banks]
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
 *           enum: [capacitorBankCode, capacityMvar, voltageLevelKv, stepsCount, make, installationDate, isActive, createdAt, updatedAt]
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
 *         name: capacityMvar
 *         schema:
 *           type: number
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
 *         description: Capacitor Banks fetched successfully
 *       403:
 *         description: Role or area access denied
 *       422:
 *         description: Validation failed
 */
router.get(
  "/",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  validateQuery(listCapacitorBanksQuerySchema),
  checkExplicitListAreaAccess,
  asyncHandler(capacitorBankController.list)
);

/**
 * @openapi
 * /api/v1/capacitor-banks/{id}:
 *   get:
 *     summary: Get Capacitor Bank by ID
 *     tags: [Capacitor Banks]
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
 *         description: Capacitor Bank fetched successfully
 *       403:
 *         description: Role or area access denied
 *       404:
 *         description: Capacitor Bank not found
 */
router.get(
  "/:id",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  validateParams(capacitorBankIdParamsSchema),
  asyncHandler(capacitorBankController.getById)
);

/**
 * @openapi
 * /api/v1/capacitor-banks/{id}:
 *   patch:
 *     summary: Update Capacitor Bank
 *     tags: [Capacitor Banks]
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
 *               capacityMvar:
 *                 type: number
 *               voltageLevelKv:
 *                 type: number
 *               stepsCount:
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
 *         description: Capacitor Bank updated successfully
 *       403:
 *         description: Role or area access denied
 *       404:
 *         description: Capacitor Bank not found
 *       409:
 *         description: Deleted record
 *       422:
 *         description: Validation failed or parent hierarchy is inactive/deleted
 */
router.patch(
  "/:id",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE),
  validateParams(capacitorBankIdParamsSchema),
  validateBody(updateCapacitorBankBodySchema),
  asyncHandler(capacitorBankController.update)
);

/**
 * @openapi
 * /api/v1/capacitor-banks/{id}:
 *   delete:
 *     summary: Soft delete Capacitor Bank
 *     tags: [Capacitor Banks]
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
 *         description: Capacitor Bank deleted successfully
 *       403:
 *         description: Role or area access denied
 *       404:
 *         description: Capacitor Bank not found
 *       409:
 *         description: Capacitor Bank is already deleted
 */
router.delete(
  "/:id",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE),
  validateParams(capacitorBankIdParamsSchema),
  asyncHandler(capacitorBankController.softDelete)
);

export { router as capacitorBankRoutes };
