import multer from "multer";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: env.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024
  },
  fileFilter(_req, file, callback) {
    const allowedMimeTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv"
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(new AppError("Only Excel or CSV files are allowed", 400));
      return;
    }

    callback(null, true);
  }
});
