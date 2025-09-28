import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { sendErrorResponse } from '../utils/response';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg
    }));

    sendErrorResponse(res, 400, 'Validation failed', errorMessages);
    return;
  }
  
  next();
};