import { Request, Response } from 'express';
import authService from '../services/authService';
import otpService from '../services/otpService';
import { sendSuccessResponse, sendErrorResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, dateOfBirth } = req.body;

      const result = await authService.register({
        name,
        email,
        password,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        authProvider: 'local'
      });

      if (!result.success) {
        sendErrorResponse(res, 400, result.message);
        return;
      }

      sendSuccessResponse(res, 201, result.message, {
        user: result.user,
        token: result.token
      });
    } catch (error) {
      console.error('Register Controller Error:', error);
      sendErrorResponse(res, 500, 'Internal server error');
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      console.log("📌 Controller reached before service call");

      const { email, password } = req.body;
      console.log(email,password);

      const result = await authService.login(email, password);

      if (!result.success) {
        sendErrorResponse(res, 400, result.message, result.user ? [result.user] : undefined) ;
        return;
      }

      sendSuccessResponse(res, 200, result.message, {
        user: result.user,
        token: result.token
      });
    } catch (error) {
      console.error('Login Controller Error:', error);
      sendErrorResponse(res, 500, 'Internal server error');
    }
  }

  async googleAuth(req: Request, res: Response): Promise<void> {
    try {
      const { googleId, name, email } = req.body;

      const result = await authService.googleAuth({ googleId, name, email });

      if (!result.success) {
        sendErrorResponse(res, 400, result.message);
        return;
      }

      sendSuccessResponse(res, result.isNewUser ? 201 : 200, result.message, {
        user: result.user,
        token: result.token,
        isNewUser: result.isNewUser
      });
    } catch (error) {
      console.error('Google Auth Controller Error:', error);
      sendErrorResponse(res, 500, 'Internal server error');
    }
  }

  async sendOTP(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      console.log(userId);

      const result = await otpService.sendOTP(userId);
      console.log(result);

      if (!result.success) {
        sendErrorResponse(res, 400, result.message);
        return;
      }

      sendSuccessResponse(res, 200, result.message);
    } catch (error) {
      console.error('Send OTP Controller Error:', error);
      sendErrorResponse(res, 500, 'Internal server error');
    }
  }

  async verifyOTP(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { otp } = req.body;
      const userId = req.user!.id;

      const result = await otpService.verifyOTP(userId, otp);

      if (!result.success) {
        sendErrorResponse(res, 400, result.message);
        return;
      }

      sendSuccessResponse(res, 200, result.message);
    } catch (error) {
      console.error('Verify OTP Controller Error:', error);
      sendErrorResponse(res, 500, 'Internal server error');
    }
  }

  async resendOTP(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const result = await otpService.resendOTP(userId);

      if (!result.success) {
        sendErrorResponse(res, 400, result.message);
        return;
      }

      sendSuccessResponse(res, 200, result.message);
    } catch (error) {
      console.error('Resend OTP Controller Error:', error);
      sendErrorResponse(res, 500, 'Internal server error');
    }
  }

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      sendSuccessResponse(res, 200, 'Profile retrieved successfully', {
        user: req.user
      });
    } catch (error) {
      console.error('Get Profile Controller Error:', error);
      sendErrorResponse(res, 500, 'Internal server error');
    }
  }
}

export default new AuthController();