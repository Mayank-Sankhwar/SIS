import { query } from "express-validator";

export const healthQueryValidator = [
  query("verbose").optional().isBoolean().withMessage("verbose must be a boolean")
];
