import { RoleName } from "@prisma/client";
import { Router } from "express";
import { VerticalController } from "../controllers/vertical.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  validateBody,
  validateParams,
  validateQuery
} from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createVerticalBodySchema,
  listVerticalsQuerySchema,
  updateVerticalBodySchema,
  verticalIdParamsSchema
} from "../validators/vertical.validator.js";

const router = Router();
const verticalController = new VerticalController();

router.use(authenticate, authorizeRoles(RoleName.ADMIN));

/**
 * @openapi
 * /api/v1/verticals:
 *   post:
 *     summary: Create a Vertical
 *     tags: [Verticals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [zoneId, name, code]
 *             properties:
 *               zoneId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *                 example: Distribution Vertical
 *               code:
 *                 type: string
 *                 example: DIST-VERT
 *     responses:
 *       201:
 *         description: Vertical created successfully
 *       403:
 *         description: Only ADMIN can access this module
 *       409:
 *         description: Duplicate name or code within this Zone
 *       422:
 *         description: Parent Zone is missing, inactive, or deleted
 */
router.post("/", validateBody(createVerticalBodySchema), asyncHandler(verticalController.create));

/**
 * @openapi
 * /api/v1/verticals:
 *   get:
 *     summary: List Verticals
 *     tags: [Verticals]
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
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Verticals fetched successfully
 */
router.get("/", validateQuery(listVerticalsQuerySchema), asyncHandler(verticalController.list));

/**
 * @openapi
 * /api/v1/verticals/{id}:
 *   get:
 *     summary: Get Vertical by ID
 *     tags: [Verticals]
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
 *         description: Vertical fetched successfully
 *       404:
 *         description: Vertical not found
 */
router.get("/:id", validateParams(verticalIdParamsSchema), asyncHandler(verticalController.getById));

/**
 * @openapi
 * /api/v1/verticals/{id}:
 *   patch:
 *     summary: Update Vertical
 *     tags: [Verticals]
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
 *               zoneId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vertical updated successfully
 *       404:
 *         description: Vertical not found
 *       409:
 *         description: Duplicate or deleted record
 */
router.patch(
  "/:id",
  validateParams(verticalIdParamsSchema),
  validateBody(updateVerticalBodySchema),
  asyncHandler(verticalController.update)
);

/**
 * @openapi
 * /api/v1/verticals/{id}:
 *   delete:
 *     summary: Soft delete Vertical
 *     tags: [Verticals]
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
 *         description: Vertical deleted successfully
 *       404:
 *         description: Vertical not found
 *       409:
 *         description: Vertical contains SubVerticals or is already deleted
 */
router.delete("/:id", validateParams(verticalIdParamsSchema), asyncHandler(verticalController.softDelete));

export { router as verticalRoutes };
