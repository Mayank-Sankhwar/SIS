import type { Request, Response } from "express";
import { SubstationService } from "../services/substation.service.js";
import { AppError } from "../utils/app-error.js";
import { sendSuccess } from "../utils/api-response.js";
import type {
  CreateSubstationBody,
  ListSubstationsQuery,
  SubstationIdParams,
  UpdateSubstationBody
} from "../validators/substation.validator.js";

export class SubstationController {
  constructor(private readonly substationService = new SubstationService()) {}

  create = async (
    req: Request<unknown, unknown, CreateSubstationBody>,
    res: Response
  ): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const substation = await this.substationService.create(req.body, req.user.id);
    return sendSuccess(res, 201, "Substation created successfully", substation);
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params as SubstationIdParams;
    const substation = await this.substationService.getById(id);
    return sendSuccess(res, 200, "Substation fetched successfully", substation);
  };

  list = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const query = req.query as unknown as ListSubstationsQuery;
    const result = await this.substationService.list(query, {
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

    const { id } = req.params as SubstationIdParams;
    const body = req.body as UpdateSubstationBody;
    const substation = await this.substationService.update(id, body, req.user.id);
    return sendSuccess(res, 200, "Substation updated successfully", substation);
  };

  softDelete = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const { id } = req.params as SubstationIdParams;
    const substation = await this.substationService.softDelete(id, req.user.id);
    return sendSuccess(res, 200, "Substation deleted successfully", substation);
  };
}
