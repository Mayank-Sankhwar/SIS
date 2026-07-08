import type { Request, Response } from "express";
import { IncomingSourceService } from "../services/incoming-source.service.js";
import { AppError } from "../utils/app-error.js";
import { sendSuccess } from "../utils/api-response.js";
import type {
  CreateIncomingSourceBody,
  IncomingSourceIdParams,
  ListIncomingSourcesQuery,
  UpdateIncomingSourceBody
} from "../validators/incoming-source.validator.js";

export class IncomingSourceController {
  constructor(private readonly incomingSourceService = new IncomingSourceService()) {}

  create = async (
    req: Request<unknown, unknown, CreateIncomingSourceBody>,
    res: Response
  ): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const incomingSource = await this.incomingSourceService.create(req.body, req.user);
    return sendSuccess(res, 201, "Incoming Source created successfully", incomingSource);
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const { id } = req.params as IncomingSourceIdParams;
    const incomingSource = await this.incomingSourceService.getById(id, req.user);
    return sendSuccess(res, 200, "Incoming Source fetched successfully", incomingSource);
  };

  list = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const query = req.query as unknown as ListIncomingSourcesQuery;
    const result = await this.incomingSourceService.list(query, {
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

    const { id } = req.params as IncomingSourceIdParams;
    const body = req.body as UpdateIncomingSourceBody;
    const incomingSource = await this.incomingSourceService.update(id, body, req.user);
    return sendSuccess(res, 200, "Incoming Source updated successfully", incomingSource);
  };

  softDelete = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const { id } = req.params as IncomingSourceIdParams;
    const incomingSource = await this.incomingSourceService.softDelete(id, req.user);
    return sendSuccess(res, 200, "Incoming Source deleted successfully", incomingSource);
  };
}
