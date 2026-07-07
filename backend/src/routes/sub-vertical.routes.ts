import { RoleName } from "@prisma/client";
import { Router } from "express";
import { SubVerticalController } from "../controllers/sub-vertical.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  validateBody,
  validateParams,
  validateQuery
} from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createSubVerticalBodySchema,
  listSubVerticalsQuerySchema,
  subVerticalIdParamsSchema,
  updateSubVerticalBodySchema
} from "../validators/sub-vertical.validator.js";

const router = Router();
const subVerticalController = new SubVerticalController();

router.use(authenticate, authorizeRoles(RoleName.ADMIN));

/**
 * @openapi
 * /api/v1/sub-verticals:
 *   post:
 *     summary: Create a SubVertical
 *     tags: [SubVerticals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [verticalId, name, code]
 *             properties:
 *               verticalId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *                 example: Operations SubVertical
 *               code:
 *                 type: string
 *                 example: OPS-SV
 *     responses:
 *       201:
 *         description: SubVertical created successfully
 *       403:
 *         description: Only ADMIN can access this module
 *       409:
 *         description: Duplicate name or code within this Vertical
 *       422:
 *         description: Parent Vertical, Zone, or Discom is missing, inactive, or deleted
 */
router.post("/", validateBody(createSubVerticalBodySchema), asyncHandler(subVerticalController.create));

/**
 * @openapi
 * /api/v1/sub-verticals:
 *   get:
 *     summary: List SubVerticals
 *     tags: [SubVerticals]
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
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: SubVerticals fetched successfully
 */
router.get("/", validateQuery(listSubVerticalsQuerySchema), asyncHandler(subVerticalController.list));

/**
 * @openapi
 * /api/v1/sub-verticals/{id}:
 *   get:
 *     summary: Get SubVertical by ID
 *     tags: [SubVerticals]
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
 *         description: SubVertical fetched successfully
 *       404:
 *         description: SubVertical not found
 */
router.get("/:id", validateParams(subVerticalIdParamsSchema), asyncHandler(subVerticalController.getById));

/**
 * @openapi
 * /api/v1/sub-verticals/{id}:
 *   patch:
 *     summary: Update SubVertical
 *     tags: [SubVerticals]
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
 *               verticalId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: SubVertical updated successfully
 *       404:
 *         description: SubVertical not found
 *       409:
 *         description: Duplicate or deleted record
 */
router.patch(
  "/:id",
  validateParams(subVerticalIdParamsSchema),
  validateBody(updateSubVerticalBodySchema),
  asyncHandler(subVerticalController.update)
);

/**
 * @openapi
 * /api/v1/sub-verticals/{id}:
 *   delete:
 *     summary: Soft delete SubVertical
 *     tags: [SubVerticals]
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
 *         description: SubVertical deleted successfully
 *       404:
 *         description: SubVertical not found
 *       409:
 *         description: SubVertical contains Substations or is already deleted
 */
router.delete("/:id", validateParams(subVerticalIdParamsSchema), asyncHandler(subVerticalController.softDelete));

export { router as subVerticalRoutes };
