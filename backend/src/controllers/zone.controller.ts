import type { Request, Response } from "express";
import { ZoneService } from "../services/zone.service.js";
import type {
  CreateZoneBody,
  ListZonesQuery,
  UpdateZoneBody,
  ZoneIdParams
} from "../validators/zone.validator.js";
import { AppError } from "../utils/app-error.js";
import { sendSuccess } from "../utils/api-response.js";

export class ZoneController {
  constructor(private readonly zoneService = new ZoneService()) {}

  create = async (req: Request<unknown, unknown, CreateZoneBody>, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const zone = await this.zoneService.create(req.body, req.user.id);
    return sendSuccess(res, 201, "Zone created successfully", zone);
  };

  getById = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params as ZoneIdParams;
    const zone = await this.zoneService.getById(id);
    return sendSuccess(res, 200, "Zone fetched successfully", zone);
  };

  list = async (req: Request, res: Response): Promise<Response> => {
    const query = req.query as unknown as ListZonesQuery;
    const result = await this.zoneService.list(query);
    return sendSuccess(res, 200, "Zones fetched successfully", result);
  };

  update = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const { id } = req.params as ZoneIdParams;
    const body = req.body as UpdateZoneBody;
    const zone = await this.zoneService.update(id, body, req.user.id);
    return sendSuccess(res, 200, "Zone updated successfully", zone);
  };

  softDelete = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const { id } = req.params as ZoneIdParams;
    const zone = await this.zoneService.softDelete(id, req.user.id);
    return sendSuccess(res, 200, "Zone deleted successfully", zone);
  };
}
