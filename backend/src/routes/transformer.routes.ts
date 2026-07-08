import { RoleName } from "@prisma/client";
import type { RequestHandler } from "express";
import { Router } from "express";
import { TransformerController } from "../controllers/transformer.controller.js";
import { authenticate, authorizeRoles, checkAreaAccess } from "../middlewares/auth.middleware.js";
import { validateBody, validateParams, validateQuery } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createTransformerBodySchema,
  listTransformersQuerySchema,
  transformerIdParamsSchema,
  updateTransformerBodySchema
} from "../validators/transformer.validator.js";

const router = Router();
const transformerController = new TransformerController();

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
 * /api/v1/transformers:
 *   post:
 *     summary: Create a Transformer
 *     tags: [Transformers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [substationId, transformerCode, capacityMva, primaryVoltageKv, secondaryVoltageKv]
 *             properties:
 *               substationId:
 *                 type: string
 *                 format: uuid
 *               transformerCode:
 *                 type: string
 *                 example: PTR-GOV-01
 *               capacityMva:
 *                 type: number
 *                 example: 10
 *               primaryVoltageKv:
 *                 type: number
 *                 example: 33
 *               secondaryVoltageKv:
 *                 type: number
 *                 example: 11
 *               make:
 *                 type: string
 *                 example: BHEL
 *               serialNumber:
 *                 type: string
 *                 example: TR-BPL-2018-001
 *               commissioningDate:
 *                 type: string
 *                 format: date
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Transformer created successfully
 *       403:
 *         description: Role or area access denied
 *       409:
 *         description: Duplicate transformer code or serial number
 *       422:
 *         description: Validation failed or parent hierarchy is inactive/deleted
 */
router.post(
  "/",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE),
  validateBody(createTransformerBodySchema),
  checkAreaAccess(),
  asyncHandler(transformerController.create)
);

/**
 * @openapi
 * /api/v1/transformers:
 *   get:
 *     summary: List Transformers
 *     tags: [Transformers]
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
 *           enum: [transformerCode, capacityMva, primaryVoltageKv, secondaryVoltageKv, make, serialNumber, commissioningDate, isActive, createdAt, updatedAt]
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
 *         name: capacityMva
 *         schema:
 *           type: number
 *       - in: query
 *         name: primaryVoltageKv
 *         schema:
 *           type: number
 *       - in: query
 *         name: secondaryVoltageKv
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
 *         description: Transformers fetched successfully
 *       403:
 *         description: Role or area access denied
 *       422:
 *         description: Validation failed
 */
router.get(
  "/",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  validateQuery(listTransformersQuerySchema),
  checkExplicitListAreaAccess,
  asyncHandler(transformerController.list)
);

/**
 * @openapi
 * /api/v1/transformers/{id}:
 *   get:
 *     summary: Get Transformer by ID
 *     tags: [Transformers]
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
 *         description: Transformer fetched successfully
 *       403:
 *         description: Role or area access denied
 *       404:
 *         description: Transformer not found
 */
router.get(
  "/:id",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  validateParams(transformerIdParamsSchema),
  asyncHandler(transformerController.getById)
);

/**
 * @openapi
 * /api/v1/transformers/{id}:
 *   patch:
 *     summary: Update Transformer
 *     tags: [Transformers]
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
 *               capacityMva:
 *                 type: number
 *               primaryVoltageKv:
 *                 type: number
 *               secondaryVoltageKv:
 *                 type: number
 *               make:
 *                 type: string
 *               serialNumber:
 *                 type: string
 *               commissioningDate:
 *                 type: string
 *                 format: date
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Transformer updated successfully
 *       403:
 *         description: Role or area access denied
 *       404:
 *         description: Transformer not found
 *       409:
 *         description: Duplicate serial number or deleted record
 *       422:
 *         description: Validation failed or parent hierarchy is inactive/deleted
 */
router.patch(
  "/:id",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE),
  validateParams(transformerIdParamsSchema),
  validateBody(updateTransformerBodySchema),
  asyncHandler(transformerController.update)
);

/**
 * @openapi
 * /api/v1/transformers/{id}:
 *   delete:
 *     summary: Soft delete Transformer
 *     tags: [Transformers]
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
 *         description: Transformer deleted successfully
 *       403:
 *         description: Role or area access denied
 *       404:
 *         description: Transformer not found
 *       409:
 *         description: Transformer is already deleted
 */
router.delete(
  "/:id",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE),
  validateParams(transformerIdParamsSchema),
  asyncHandler(transformerController.softDelete)
);

export { router as transformerRoutes };
