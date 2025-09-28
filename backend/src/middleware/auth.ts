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

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      sendErrorResponse(res, 401, 'Access denied. No token provided.');
      return;
    }

    const decoded: JWTPayload = verifyToken(token);
  const user = await User.findById(decoded.userId).select('-password') as import('../types').DBUser | null;

    if (!user) {
      sendErrorResponse(res, 401, 'Invalid token. User not found.');
      return;
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      isVerified: user.isVerified
    };

    next();
  } catch (error) {
    sendErrorResponse(res, 401, 'Invalid token.');
  }
};

export const requireVerification = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user?.isVerified) {
    sendErrorResponse(res, 403, 'Account not verified. Please verify your account.');
    return;
  }
  next();
};