import type { Request, Response } from "express";
import { OutgoingFeederService } from "../services/outgoing-feeder.service.js";
import { AppError } from "../utils/app-error.js";
import { sendSuccess } from "../utils/api-response.js";
import type {
  CreateOutgoingFeederBody,
  ListOutgoingFeedersQuery,
  OutgoingFeederIdParams,
  UpdateOutgoingFeederBody
} from "../validators/outgoing-feeder.validator.js";

export class OutgoingFeederController {
  constructor(private readonly outgoingFeederService = new OutgoingFeederService()) {}

  create = async (
    req: Request<unknown, unknown, CreateOutgoingFeederBody>,
    res: Response
  ): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const outgoingFeeder = await this.outgoingFeederService.create(req.body, req.user);
    return sendSuccess(res, 201, "Outgoing Feeder created successfully", outgoingFeeder);
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const { id } = req.params as OutgoingFeederIdParams;
    const outgoingFeeder = await this.outgoingFeederService.getById(id, req.user);
    return sendSuccess(res, 200, "Outgoing Feeder fetched successfully", outgoingFeeder);
  };

  list = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const query = req.query as unknown as ListOutgoingFeedersQuery;
    const result = await this.outgoingFeederService.list(query, {
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

    const { id } = req.params as OutgoingFeederIdParams;
    const body = req.body as UpdateOutgoingFeederBody;
    const outgoingFeeder = await this.outgoingFeederService.update(id, body, req.user);
    return sendSuccess(res, 200, "Outgoing Feeder updated successfully", outgoingFeeder);
  };

  softDelete = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const { id } = req.params as OutgoingFeederIdParams;
    const outgoingFeeder = await this.outgoingFeederService.softDelete(id, req.user);
    return sendSuccess(res, 200, "Outgoing Feeder deleted successfully", outgoingFeeder);
  };
}
