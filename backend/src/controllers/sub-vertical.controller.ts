import type { Request, Response } from "express";
import { SubVerticalService } from "../services/sub-vertical.service.js";
import type {
  CreateSubVerticalBody,
  ListSubVerticalsQuery,
  SubVerticalIdParams,
  UpdateSubVerticalBody
} from "../validators/sub-vertical.validator.js";
import { AppError } from "../utils/app-error.js";
import { sendSuccess } from "../utils/api-response.js";

export class SubVerticalController {
  constructor(private readonly subVerticalService = new SubVerticalService()) {}

  create = async (
    req: Request<unknown, unknown, CreateSubVerticalBody>,
    res: Response
  ): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const subVertical = await this.subVerticalService.create(req.body, req.user.id);
    return sendSuccess(res, 201, "SubVertical created successfully", subVertical);
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params as SubVerticalIdParams;
    const subVertical = await this.subVerticalService.getById(id);
    return sendSuccess(res, 200, "SubVertical fetched successfully", subVertical);
  };

  list = async (req: Request, res: Response): Promise<Response> => {
    const query = req.query as unknown as ListSubVerticalsQuery;
    const result = await this.subVerticalService.list(query);
    return sendSuccess(res, 200, "SubVerticals fetched successfully", result);
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const { id } = req.params as SubVerticalIdParams;
    const body = req.body as UpdateSubVerticalBody;
    const subVertical = await this.subVerticalService.update(id, body, req.user.id);
    return sendSuccess(res, 200, "SubVertical updated successfully", subVertical);
  };

  softDelete = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const { id } = req.params as SubVerticalIdParams;
    const subVertical = await this.subVerticalService.softDelete(id, req.user.id);
    return sendSuccess(res, 200, "SubVertical deleted successfully", subVertical);
  };
}
