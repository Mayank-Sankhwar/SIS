import type { Request, Response } from "express";
import type { DashboardFilters } from "../services/dashboard.service.js";
import { DashboardService } from "../services/dashboard.service.js";
import { AppError } from "../utils/app-error.js";
import { sendSuccess } from "../utils/api-response.js";

export class DashboardController {
  constructor(private readonly dashboardService = new DashboardService()) {}

  summary = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const result = await this.dashboardService.getSummary({
      userId: req.user.id,
      role: req.user.role
    });

    return sendSuccess(res, 200, "Dashboard summary fetched successfully", result);
  };

  equipmentSummary = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const result = await this.dashboardService.getEquipmentSummary({
      userId: req.user.id,
      role: req.user.role
    });

    return sendSuccess(res, 200, "Dashboard equipment summary fetched successfully", result);
  };

  hierarchySummary = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const result = await this.dashboardService.getHierarchySummary({
      userId: req.user.id,
      role: req.user.role
    });

    return sendSuccess(res, 200, "Dashboard hierarchy summary fetched successfully", result);
  };

  equipmentDistribution = async (req: Request, res: Response): Promise<Response> => {
    const access = this.getAccess(req);
    const result = await this.dashboardService.getEquipmentDistribution(access, this.parseFilters(req));
    return sendSuccess(res, 200, "Dashboard equipment distribution fetched successfully", result);
  };

  substationStatus = async (req: Request, res: Response): Promise<Response> => {
    const access = this.getAccess(req);
    const result = await this.dashboardService.getSubstationStatus(access, this.parseFilters(req));
    return sendSuccess(res, 200, "Dashboard substation status fetched successfully", result);
  };

  transformerCapacity = async (req: Request, res: Response): Promise<Response> => {
    const access = this.getAccess(req);
    const result = await this.dashboardService.getTransformerCapacity(access, this.parseFilters(req));
    return sendSuccess(res, 200, "Dashboard transformer capacity fetched successfully", result);
  };

  feederLoad = async (req: Request, res: Response): Promise<Response> => {
    const access = this.getAccess(req);
    const result = await this.dashboardService.getFeederLoad(access, this.parseFilters(req));
    return sendSuccess(res, 200, "Dashboard feeder load fetched successfully", result);
  };

  importHistory = async (req: Request, res: Response): Promise<Response> => {
    const access = this.getAccess(req);
    const result = await this.dashboardService.getImportHistory(access, this.parseFilters(req));
    return sendSuccess(res, 200, "Dashboard import history fetched successfully", result);
  };

  recentImportErrors = async (req: Request, res: Response): Promise<Response> => {
    const access = this.getAccess(req);
    const result = await this.dashboardService.getRecentImportErrors(access, this.parseFilters(req));
    return sendSuccess(res, 200, "Dashboard recent import errors fetched successfully", result);
  };

  map = async (req: Request, res: Response): Promise<Response> => {
    const access = this.getAccess(req);
    const result = await this.dashboardService.getMap(access, this.parseFilters(req));
    return sendSuccess(res, 200, "Dashboard map data fetched successfully", result);
  };

  private getAccess(req: Request) {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    return {
      userId: req.user.id,
      role: req.user.role
    };
  }

  private parseFilters(req: Request): DashboardFilters {
    const filters: DashboardFilters = {};

    for (const key of ["discomId", "zoneId", "verticalId", "subVerticalId", "substationId"] as const) {
      const value = req.query[key];
      if (typeof value === "string" && value.trim()) {
        filters[key] = value.trim();
      }
    }

    filters.dateFrom = this.parseOptionalDate(req.query.dateFrom, "dateFrom");
    filters.dateTo = this.parseOptionalDate(req.query.dateTo, "dateTo");

    return filters;
  }

  private parseOptionalDate(value: unknown, fieldName: string): Date | undefined {
    if (typeof value !== "string" || !value.trim()) {
      return undefined;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new AppError(`${fieldName} must be a valid date`, 422);
    }

    return date;
  }
}
