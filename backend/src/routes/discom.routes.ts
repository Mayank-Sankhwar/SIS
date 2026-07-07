import { RoleName } from "@prisma/client";
import { Router } from "express";
import { DiscomController } from "../controllers/discom.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  validateBody,
  validateParams,
  validateQuery
} from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createDiscomBodySchema,
  discomIdParamsSchema,
  listDiscomsQuerySchema,
  updateDiscomBodySchema
} from "../validators/discom.validator.js";

const router = Router();
const discomController = new DiscomController();

router.use(authenticate, authorizeRoles(RoleName.ADMIN));

/**
 * @openapi
 * /api/v1/discoms:
 *   post:
 *     summary: Create a Discom
 *     tags: [Discoms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Northern Power Distribution Company
 *               code:
 *                 type: string
 *                 example: NDISCOM
 *     responses:
 *       201:
 *         description: Discom created successfully
 *       403:
 *         description: Only ADMIN can access this module
 *       409:
 *         description: Duplicate name or code
 */
router.post("/", validateBody(createDiscomBodySchema), asyncHandler(discomController.create));

/**
 * @openapi
 * /api/v1/discoms:
 *   get:
 *     summary: List Discoms
 *     tags: [Discoms]
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
 *     responses:
 *       200:
 *         description: Discoms fetched successfully
 */
router.get("/", validateQuery(listDiscomsQuerySchema), asyncHandler(discomController.list));

/**
 * @openapi
 * /api/v1/discoms/{id}:
 *   get:
 *     summary: Get Discom by ID
 *     tags: [Discoms]
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
 *         description: Discom fetched successfully
 *       404:
 *         description: Discom not found
 */
router.get("/:id", validateParams(discomIdParamsSchema), asyncHandler(discomController.getById));

/**
 * @openapi
 * /api/v1/discoms/{id}:
 *   patch:
 *     summary: Update Discom
 *     tags: [Discoms]
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
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Discom updated successfully
 *       409:
 *         description: Duplicate or deleted record
 */
router.patch(
  "/:id",
  validateParams(discomIdParamsSchema),
  validateBody(updateDiscomBodySchema),
  asyncHandler(discomController.update)
);

/**
 * @openapi
 * /api/v1/discoms/{id}:
 *   delete:
 *     summary: Soft delete Discom
 *     tags: [Discoms]
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
 *         description: Discom deleted successfully
 *       404:
 *         description: Discom not found
 */
router.delete("/:id", validateParams(discomIdParamsSchema), asyncHandler(discomController.softDelete));

export { router as discomRoutes };
