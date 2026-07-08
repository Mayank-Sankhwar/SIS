import { RoleName } from "@prisma/client";
import { Router } from "express";
import { ImportController } from "../controllers/import.controller.js";
import { authenticate, authorizeRoles } from "../middlewares/auth.middleware.js";
import { importWorkbookUpload } from "../middlewares/import-upload.middleware.js";
import { asyncHandler } from "../utils/async-handler.js";

const router = Router();
const importController = new ImportController();

/**
 * @openapi
 * /api/v1/imports/validate:
 *   post:
 *     summary: Validate Substation Information System Excel workbook
 *     tags: [Imports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Official .xlsx workbook. Maximum size is 10 MB.
 *     responses:
 *       200:
 *         description: Workbook validation completed. No master data is inserted.
 *       400:
 *         description: Missing, unsupported, empty, oversized, or unreadable workbook file
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Role access denied
 */
router.post(
  "/validate",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE),
  importWorkbookUpload,
  asyncHandler(importController.validate)
);

/**
 * @openapi
 * /api/v1/imports:
 *   post:
 *     summary: Import Substation Information System Excel workbook
 *     tags: [Imports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Official .xlsx workbook. Maximum size is 10 MB.
 *               mode:
 *                 type: string
 *                 enum: [INSERT_ONLY, UPSERT]
 *                 default: UPSERT
 *     responses:
 *       200:
 *         description: Workbook import completed with row-level summary and validation errors
 *       400:
 *         description: Missing, unsupported, empty, oversized, or unreadable workbook file
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Role access denied
 *       422:
 *         description: Invalid import mode
 */
router.post(
  "/",
  authenticate,
  authorizeRoles(RoleName.ADMIN, RoleName.EE, RoleName.AE),
  importWorkbookUpload,
  asyncHandler(importController.execute)
);

export { router as importRoutes };
