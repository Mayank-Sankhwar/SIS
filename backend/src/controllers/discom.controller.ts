import type { Request, Response } from "express";
import { DiscomService } from "../services/discom.service.js";
import type {
  CreateDiscomBody,
  DiscomIdParams,
  ListDiscomsQuery,
  UpdateDiscomBody
} from "../validators/discom.validator.js";
import { AppError } from "../utils/app-error.js";
import { sendSuccess } from "../utils/api-response.js";

export class DiscomController {
  constructor(private readonly discomService = new DiscomService()) {}

  create = async (
    req: Request<unknown, unknown, CreateDiscomBody>,
    res: Response
  ): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const discom = await this.discomService.create(req.body, req.user.id);
    return sendSuccess(res, 201, "Discom created successfully", discom);
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params as DiscomIdParams;
    const discom = await this.discomService.getById(id);
    return sendSuccess(res, 200, "Discom fetched successfully", discom);
  };

  list = async (req: Request, res: Response): Promise<Response> => {
    const query = req.query as unknown as ListDiscomsQuery;
    const result = await this.discomService.list(query);
    return sendSuccess(res, 200, "Discoms fetched successfully", result);
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const { id } = req.params as DiscomIdParams;
    const body = req.body as UpdateDiscomBody;
    const discom = await this.discomService.update(id, body, req.user.id);
    return sendSuccess(res, 200, "Discom updated successfully", discom);
  };

  softDelete = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const { id } = req.params as DiscomIdParams;
    const discom = await this.discomService.softDelete(id, req.user.id);
    return sendSuccess(res, 200, "Discom deleted successfully", discom);
  };
}
