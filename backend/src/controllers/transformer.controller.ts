import type { Request, Response } from "express";
import { TransformerService } from "../services/transformer.service.js";
import { AppError } from "../utils/app-error.js";
import { sendSuccess } from "../utils/api-response.js";
import type {
  CreateTransformerBody,
  ListTransformersQuery,
  TransformerIdParams,
  UpdateTransformerBody
} from "../validators/transformer.validator.js";

export class TransformerController {
  constructor(private readonly transformerService = new TransformerService()) {}

  create = async (
    req: Request<unknown, unknown, CreateTransformerBody>,
    res: Response
  ): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const transformer = await this.transformerService.create(req.body, req.user);
    return sendSuccess(res, 201, "Transformer created successfully", transformer);
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const { id } = req.params as TransformerIdParams;
    const transformer = await this.transformerService.getById(id, req.user);
    return sendSuccess(res, 200, "Transformer fetched successfully", transformer);
  };

  list = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const query = req.query as unknown as ListTransformersQuery;
    const result = await this.transformerService.list(query, {
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

    const { id } = req.params as TransformerIdParams;
    const body = req.body as UpdateTransformerBody;
    const transformer = await this.transformerService.update(id, body, req.user);
    return sendSuccess(res, 200, "Transformer updated successfully", transformer);
  };

  softDelete = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const { id } = req.params as TransformerIdParams;
    const transformer = await this.transformerService.softDelete(id, req.user);
    return sendSuccess(res, 200, "Transformer deleted successfully", transformer);
  };
}
