import { RoleName } from "@prisma/client";
import { Router } from "express";
import { ZoneController } from "../controllers/zone.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  validateBody,
  validateParams,
  validateQuery
} from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createZoneBodySchema,
  listZonesQuerySchema,
  updateZoneBodySchema,
  zoneIdParamsSchema
} from "../validators/zone.validator.js";

const router = Router();
const zoneController = new ZoneController();

router.use(authenticate, authorizeRoles(RoleName.ADMIN));

/**
 * @openapi
 * /api/v1/zones:
 *   post:
 *     summary: Create a Zone
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [discomId, name, code]
 *             properties:
 *               discomId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *                 example: North Zone
 *               code:
 *                 type: string
 *                 example: NZONE
 *     responses:
 *       201:
 *         description: Zone created successfully
 *       403:
 *         description: Only ADMIN can access this module
 *       409:
 *         description: Duplicate name or code within this Discom
 *       422:
 *         description: Parent Discom is missing, inactive, or deleted
 */
router.post("/", validateBody(createZoneBodySchema), asyncHandler(zoneController.create));

/**
 * @openapi
 * /api/v1/zones:
 *   get:
 *     summary: List Zones
 *     tags: [Zones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, code, createdAt, updatedAt, isActive]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: discomId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Zones fetched successfully
 */
router.get("/", validateQuery(listZonesQuerySchema), asyncHandler(zoneController.list));

/**
 * @openapi
 * /api/v1/zones/{id}:
 *   get:
 *     summary: Get Zone by ID
 *     tags: [Zones]
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
 *         description: Zone fetched successfully
 *       404:
 *         description: Zone not found
 */
router.get("/:id", validateParams(zoneIdParamsSchema), asyncHandler(zoneController.getById));

/**
 * @openapi
 * /api/v1/zones/{id}:
 *   patch:
 *     summary: Update Zone
 *     tags: [Zones]
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
 *               discomId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Zone updated successfully
 *       404:
 *         description: Zone not found
 *       409:
 *         description: Duplicate or deleted record
 */
router.patch(
  "/:id",
  validateParams(zoneIdParamsSchema),
  validateBody(updateZoneBodySchema),
  asyncHandler(zoneController.update)
);

/**
 * @openapi
 * /api/v1/zones/{id}:
 *   delete:
 *     summary: Soft delete Zone
 *     tags: [Zones]
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
 *         description: Zone deleted successfully
 *       404:
 *         description: Zone not found
 *       409:
 *         description: Zone contains Verticals or is already deleted
 */
router.delete("/:id", validateParams(zoneIdParamsSchema), asyncHandler(zoneController.softDelete));

export { router as zoneRoutes };
