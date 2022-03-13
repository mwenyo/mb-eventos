import { Response } from "express";
import { validationResult } from "express-validator";
import { ICustomRequest } from "models/custom-request";

export const validationRoute = (req: ICustomRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
}