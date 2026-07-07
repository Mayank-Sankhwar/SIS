import type { AuthenticatedUser } from "../services/authorization.service.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
