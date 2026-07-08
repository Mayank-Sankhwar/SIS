import type { Request, Response } from "express";
import { ReportService, type ReportFormat, type ReportRequest, type ReportResult } from "../services/report.service.js";
import { AppError } from "../utils/app-error.js";
import { sendSuccess } from "../utils/api-response.js";

export class ReportController {
  constructor(private readonly reportService = new ReportService()) {}

  substations = async (req: Request, res: Response): Promise<Response | void> => {
    const result = await this.reportService.getSubstationReport(this.getAccess(req), this.parseRequest(req));
    return this.sendReport(res, "Substation report fetched successfully", result);
  };

  transformers = async (req: Request, res: Response): Promise<Response | void> => {
    const result = await this.reportService.getTransformerReport(this.getAccess(req), this.parseRequest(req));
    return this.sendReport(res, "Transformer report fetched successfully", result);
  };

  feeders = async (req: Request, res: Response): Promise<Response | void> => {
    const result = await this.reportService.getFeederReport(this.getAccess(req), this.parseRequest(req));
    return this.sendReport(res, "Feeder report fetched successfully", result);
  };

  equipmentSummary = async (req: Request, res: Response): Promise<Response | void> => {
    const result = await this.reportService.getEquipmentSummaryReport(this.getAccess(req), this.parseRequest(req));
    return this.sendReport(res, "Equipment summary report fetched successfully", result);
  };

  substationsPdf = async (req: Request, res: Response): Promise<Response | void> => {
    const result = await this.reportService.getSubstationReport(this.getAccess(req), this.parseRequest(req, "pdf"));
    return this.sendReport(res, "Substation PDF report fetched successfully", result);
  };

  transformersPdf = async (req: Request, res: Response): Promise<Response | void> => {
    const result = await this.reportService.getTransformerReport(this.getAccess(req), this.parseRequest(req, "pdf"));
    return this.sendReport(res, "Transformer PDF report fetched successfully", result);
  };

  feedersPdf = async (req: Request, res: Response): Promise<Response | void> => {
    const result = await this.reportService.getFeederReport(this.getAccess(req), this.parseRequest(req, "pdf"));
    return this.sendReport(res, "Feeder PDF report fetched successfully", result);
  };

  equipmentSummaryPdf = async (req: Request, res: Response): Promise<Response | void> => {
    const result = await this.reportService.getEquipmentSummaryReport(this.getAccess(req), this.parseRequest(req, "pdf"));
    return this.sendReport(res, "Equipment summary PDF report fetched successfully", result);
  };

  importHistory = async (req: Request, res: Response): Promise<Response | void> => {
    const result = await this.reportService.getImportHistoryReport(this.getAccess(req), this.parseRequest(req));
    return this.sendReport(res, "Import history report fetched successfully", result);
  };

  importErrors = async (req: Request, res: Response): Promise<Response | void> => {
    const result = await this.reportService.getImportErrorReport(this.getAccess(req), this.parseRequest(req));
    return this.sendReport(res, "Import error report fetched successfully", result);
  };

  auditLog = async (req: Request, res: Response): Promise<Response | void> => {
    const result = await this.reportService.getAuditLogReport(this.getAccess(req), this.parseRequest(req));
    return this.sendReport(res, "Audit log report fetched successfully", result);
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

  private parseRequest(req: Request, forcedFormat?: ReportFormat): ReportRequest {
    const format = forcedFormat ?? this.parseFormat(req.query.format);

    return {
      format,
      discomId: this.readString(req.query.discomId),
      zoneId: this.readString(req.query.zoneId),
      verticalId: this.readString(req.query.verticalId),
      subVerticalId: this.readString(req.query.subVerticalId),
      substationId: this.readString(req.query.substationId),
      voltageLevelKv: this.parseOptionalNumber(req.query.voltageLevelKv, "voltageLevelKv"),
      isActive: this.parseOptionalBoolean(req.query.isActive, "isActive"),
      dateFrom: this.parseOptionalDate(req.query.dateFrom, "dateFrom"),
      dateTo: this.parseOptionalDate(req.query.dateTo, "dateTo")
    };
  }

  private parseFormat(value: unknown): ReportFormat {
    if (value === undefined) return "json";
    if (value === "json" || value === "xlsx" || value === "pdf") return value;
    throw new AppError("format must be json, xlsx, or pdf", 422);
  }

  private readString(value: unknown): string | undefined {
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
  }

  private parseOptionalNumber(value: unknown, fieldName: string): number | undefined {
    if (typeof value !== "string" || !value.trim()) {
      return undefined;
    }

    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      throw new AppError(`${fieldName} must be a valid number`, 422);
    }

    return numericValue;
  }

  private parseOptionalBoolean(value: unknown, fieldName: string): boolean | undefined {
    if (typeof value !== "string" || !value.trim()) {
      return undefined;
    }

    if (value === "true") return true;
    if (value === "false") return false;

    throw new AppError(`${fieldName} must be true or false`, 422);
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

  private sendReport(res: Response, message: string, result: ReportResult): Response | void {
    if (result.format === "json") {
      return sendSuccess(res, 200, message, result.table.rows);
    }

    if (result.format === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}.pdf"`);
      res.send(result.buffer);
      return;
    }

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}.xlsx"`);
    res.send(result.buffer);
  }
}
