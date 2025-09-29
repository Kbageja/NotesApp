import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../config/jwt';
import User from '../models/User';
import { sendErrorResponse } from '../utils/response';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    isVerified: boolean;
  };
}

/**
 * Authenticate middleware
 * Checks for a valid JWT token and attaches user info to req.user
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return sendErrorResponse(res, 401, 'Access denied. No token provided.');
    }

    const decoded: JWTPayload = verifyToken(token);

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return sendErrorResponse(res, 401, 'Invalid token. User not found.');
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      isVerified: user.isVerified,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return sendErrorResponse(res, 401, 'Token expired. Please log in again.');
    }
    return sendErrorResponse(res, 401, 'Invalid token.');
  }
};

/**
 * Require verification middleware
 * Ensures the authenticated user has a verified account
 */
export const requireVerification = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user?.isVerified) {
    return sendErrorResponse(res, 403, 'Account not verified. Please verify your account.');
  }
  next();
};
