import { Response } from 'express';

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: any[];
}

export const sendSuccessResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any
): void => {
  const response: ApiResponse = {
    success: true,
    message,
    ...(data && { data })
  };

  res.status(statusCode).json(response);
};

export const sendErrorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  errors?: any[]
): void => {
  const response: ApiResponse = {
    success: false,
    message,
    ...(errors && { errors })
  };

  res.status(statusCode).json(response);
};