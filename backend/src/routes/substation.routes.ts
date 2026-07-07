import { RoleName } from "@prisma/client";
import type { RequestHandler } from "express";
import { Router } from "express";
import { SubstationController } from "../controllers/substation.controller.js";
import { authenticate, authorizeRoles, checkAreaAccess } from "../middlewares/auth.middleware.js";
import { validateBody, validateParams } from "../middlewares/validate.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";
import {
  createSubstationBodySchema,
  substationIdParamsSchema,
  updateSubstationBodySchema
} from "../validators/substation.validator.js";

const router = Router();
const substationController = new SubstationController();

const exposeIdAsSubstationId: RequestHandler = (req, _res, next) => {
  const { id } = req.params;

  if (id) {
    req.params.substationId = id;
  }

  next();
};

/**
 * @openapi
 * /api/v1/substations:
 *   post:
 *     summary: Create a Substation
 *     tags: [Substations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [subVerticalId, name, code, voltageLevelKv]
 *             properties:
 *               subVerticalId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *                 example: Central 33/11 KV Substation
 *               code:
 *                 type: string
 *                 example: SS-CENTRAL-01
 *               voltageLevelKv:
 *                 type: number
 *                 example: 33
 *               address:
 *                 type: string
 *               latitude:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *               longitude:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *               commissioningDate:
 *                 type: string
 *                 format: date
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Substation created successfully
 *       403:
 *         description: Role or area access denied
 *       409:
 *         description: Duplicate name or code within this SubVertical
 *       422:
 *         description: Validation failed or parent hierarchy is inactive/deleted
 */
router.post(
  "/",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE),
  validateBody(createSubstationBodySchema),
  checkAreaAccess(),
  asyncHandler(substationController.create)
);

/**
 * @openapi
 * /api/v1/substations/{id}:
 *   get:
 *     summary: Get Substation by ID
 *     tags: [Substations]
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
 *         description: Substation fetched successfully
 *       403:
 *         description: Role or area access denied
 *       404:
 *         description: Substation not found
 */
router.get(
  "/:id",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE, RoleName.JE),
  validateParams(substationIdParamsSchema),
  exposeIdAsSubstationId,
  checkAreaAccess(),
  asyncHandler(substationController.getById)
);

/**
 * @openapi
 * /api/v1/substations/{id}:
 *   patch:
 *     summary: Update Substation
 *     tags: [Substations]
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
 *               voltageLevelKv:
 *                 type: number
 *               address:
 *                 type: string
 *               latitude:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *               longitude:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *               commissioningDate:
 *                 type: string
 *                 format: date
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Substation updated successfully
 *       403:
 *         description: Role or area access denied
 *       404:
 *         description: Substation not found
 *       409:
 *         description: Duplicate or deleted record
 *       422:
 *         description: Validation failed or parent hierarchy is inactive/deleted
 */
router.patch(
  "/:id",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE),
  validateParams(substationIdParamsSchema),
  validateBody(updateSubstationBodySchema),
  exposeIdAsSubstationId,
  checkAreaAccess(),
  asyncHandler(substationController.update)
);

export { router as substationRoutes };
