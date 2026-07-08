import type { Request, Response } from "express";
import { ImportService } from "../services/import.service.js";
import { AppError } from "../utils/app-error.js";
import { sendSuccess } from "../utils/api-response.js";

export class ImportController {
  constructor(private readonly importService = new ImportService()) {}

  validate = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const result = await this.importService.validateWorkbook(req.file, req.user.id);
    return sendSuccess(res, 200, "Workbook validation completed", result);
  };

  execute = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const result = await this.importService.importWorkbook(req.file, req.user.id, req.body?.mode);
    return sendSuccess(res, 200, "Workbook import completed", result);
  };
}
