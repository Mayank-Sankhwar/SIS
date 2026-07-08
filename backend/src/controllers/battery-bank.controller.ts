import type { Request, Response } from "express";
import { BatteryBankService } from "../services/battery-bank.service.js";
import { AppError } from "../utils/app-error.js";
import { sendSuccess } from "../utils/api-response.js";
import type {
  BatteryBankIdParams,
  CreateBatteryBankBody,
  ListBatteryBanksQuery,
  UpdateBatteryBankBody
} from "../validators/battery-bank.validator.js";

export class BatteryBankController {
  constructor(private readonly batteryBankService = new BatteryBankService()) {}

  create = async (
    req: Request<unknown, unknown, CreateBatteryBankBody>,
    res: Response
  ): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const batteryBank = await this.batteryBankService.create(req.body, req.user);
    return sendSuccess(res, 201, "Battery Bank created successfully", batteryBank);
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const { id } = req.params as BatteryBankIdParams;
    const batteryBank = await this.batteryBankService.getById(id, req.user);
    return sendSuccess(res, 200, "Battery Bank fetched successfully", batteryBank);
  };

  list = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const query = req.query as unknown as ListBatteryBanksQuery;
    const result = await this.batteryBankService.list(query, {
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

    const { id } = req.params as BatteryBankIdParams;
    const body = req.body as UpdateBatteryBankBody;
    const batteryBank = await this.batteryBankService.update(id, body, req.user);
    return sendSuccess(res, 200, "Battery Bank updated successfully", batteryBank);
  };

  softDelete = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const { id } = req.params as BatteryBankIdParams;
    const batteryBank = await this.batteryBankService.softDelete(id, req.user);
    return sendSuccess(res, 200, "Battery Bank deleted successfully", batteryBank);
  };
}
