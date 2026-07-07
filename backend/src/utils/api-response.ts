import type { Response } from "express";
import type { ApiResponse } from "../types/api.js";

export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
): Response<ApiResponse<T>> {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data === undefined ? {} : { data })
  });
}
