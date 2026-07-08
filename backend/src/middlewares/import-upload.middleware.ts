import type { RequestHandler } from "express";
import multer from "multer";
import { AppError } from "../utils/app-error.js";

const XLSX_MIME_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const MAX_IMPORT_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMPORT_FILE_SIZE_BYTES
  },
  fileFilter(_req, file, callback) {
    const isXlsx = file.originalname.toLowerCase().endsWith(".xlsx");
    const isExpectedMimeType = file.mimetype === XLSX_MIME_TYPE || file.mimetype === "application/octet-stream";

    if (!isXlsx || !isExpectedMimeType) {
      callback(new AppError("Only .xlsx workbook files are supported", 400));
      return;
    }

    callback(null, true);
  }
});

export const importWorkbookUpload: RequestHandler = (req, res, next) => {
  upload.single("file")(req, res, (error: unknown) => {
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      next(new AppError("Workbook file size must not exceed 10 MB", 400));
      return;
    }

    if (error) {
      next(error);
      return;
    }

    if (!req.file) {
      next(new AppError("Workbook file is required", 400));
      return;
    }

    next();
  });
};
