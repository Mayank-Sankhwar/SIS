import morgan from "morgan";
import { env } from "./env.js";

export const httpLogger = morgan(env.LOG_FORMAT);

export const logger = {
  info: (message: string, meta?: unknown) => console.info(message, meta ?? ""),
  warn: (message: string, meta?: unknown) => console.warn(message, meta ?? ""),
  error: (message: string, meta?: unknown) => console.error(message, meta ?? "")
};
