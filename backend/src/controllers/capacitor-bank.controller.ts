import type { Request, Response } from "express";
import { CapacitorBankService } from "../services/capacitor-bank.service.js";
import { AppError } from "../utils/app-error.js";
import { sendSuccess } from "../utils/api-response.js";
import type {
  CapacitorBankIdParams,
  CreateCapacitorBankBody,
  ListCapacitorBanksQuery,
  UpdateCapacitorBankBody
} from "../validators/capacitor-bank.validator.js";

export class CapacitorBankController {
  constructor(private readonly capacitorBankService = new CapacitorBankService()) {}

  create = async (
    req: Request<unknown, unknown, CreateCapacitorBankBody>,
    res: Response
  ): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const capacitorBank = await this.capacitorBankService.create(req.body, req.user);
    return sendSuccess(res, 201, "Capacitor Bank created successfully", capacitorBank);
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const { id } = req.params as CapacitorBankIdParams;
    const capacitorBank = await this.capacitorBankService.getById(id, req.user);
    return sendSuccess(res, 200, "Capacitor Bank fetched successfully", capacitorBank);
  };

  list = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const query = req.query as unknown as ListCapacitorBanksQuery;
    const result = await this.capacitorBankService.list(query, {
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

    const { id } = req.params as CapacitorBankIdParams;
    const body = req.body as UpdateCapacitorBankBody;
    const capacitorBank = await this.capacitorBankService.update(id, body, req.user);
    return sendSuccess(res, 200, "Capacitor Bank updated successfully", capacitorBank);
  };

  softDelete = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const { id } = req.params as CapacitorBankIdParams;
    const capacitorBank = await this.capacitorBankService.softDelete(id, req.user);
    return sendSuccess(res, 200, "Capacitor Bank deleted successfully", capacitorBank);
  };
}
