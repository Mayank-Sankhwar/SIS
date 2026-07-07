import type { Request, Response } from "express";
import { VerticalService } from "../services/vertical.service.js";
import type {
  CreateVerticalBody,
  ListVerticalsQuery,
  UpdateVerticalBody,
  VerticalIdParams
} from "../validators/vertical.validator.js";
import { AppError } from "../utils/app-error.js";
import { sendSuccess } from "../utils/api-response.js";

export class VerticalController {
  constructor(private readonly verticalService = new VerticalService()) {}

  create = async (
    req: Request<unknown, unknown, CreateVerticalBody>,
    res: Response
  ): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const vertical = await this.verticalService.create(req.body, req.user.id);
    return sendSuccess(res, 201, "Vertical created successfully", vertical);
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params as VerticalIdParams;
    const vertical = await this.verticalService.getById(id);
    return sendSuccess(res, 200, "Vertical fetched successfully", vertical);
  };

  list = async (req: Request, res: Response): Promise<Response> => {
    const query = req.query as unknown as ListVerticalsQuery;
    const result = await this.verticalService.list(query);
    return sendSuccess(res, 200, "Verticals fetched successfully", result);
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const { id } = req.params as VerticalIdParams;
    const body = req.body as UpdateVerticalBody;
    const vertical = await this.verticalService.update(id, body, req.user.id);
    return sendSuccess(res, 200, "Vertical updated successfully", vertical);
  };

  softDelete = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const { id } = req.params as VerticalIdParams;
    const vertical = await this.verticalService.softDelete(id, req.user.id);
    return sendSuccess(res, 200, "Vertical deleted successfully", vertical);
  };
}
