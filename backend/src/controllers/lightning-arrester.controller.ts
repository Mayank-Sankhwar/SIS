import type { Request, Response } from "express";
import { LightningArresterService } from "../services/lightning-arrester.service.js";
import { AppError } from "../utils/app-error.js";
import { sendSuccess } from "../utils/api-response.js";
import type {
  CreateLightningArresterBody,
  LightningArresterIdParams,
  ListLightningArrestersQuery,
  UpdateLightningArresterBody
} from "../validators/lightning-arrester.validator.js";

export class LightningArresterController {
  constructor(private readonly lightningArresterService = new LightningArresterService()) {}

  create = async (
    req: Request<unknown, unknown, CreateLightningArresterBody>,
    res: Response
  ): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const lightningArrester = await this.lightningArresterService.create(req.body, req.user);
    return sendSuccess(res, 201, "Lightning Arrester created successfully", lightningArrester);
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const { id } = req.params as LightningArresterIdParams;
    const lightningArrester = await this.lightningArresterService.getById(id, req.user);
    return sendSuccess(res, 200, "Lightning Arrester fetched successfully", lightningArrester);
  };

  list = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const query = req.query as unknown as ListLightningArrestersQuery;
    const result = await this.lightningArresterService.list(query, {
      userId: req.user.id,
      role: req.user.role
    });

    return res.status(200).json({
      success: true,
      data: result.items,
      pagination: result.pagination
    });
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const { id } = req.params as LightningArresterIdParams;
    const body = req.body as UpdateLightningArresterBody;
    const lightningArrester = await this.lightningArresterService.update(id, body, req.user);
    return sendSuccess(res, 200, "Lightning Arrester updated successfully", lightningArrester);
  };

  softDelete = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const { id } = req.params as LightningArresterIdParams;
    const lightningArrester = await this.lightningArresterService.softDelete(id, req.user);
    return sendSuccess(res, 200, "Lightning Arrester deleted successfully", lightningArrester);
  };
}
