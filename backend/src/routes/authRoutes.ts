import { Router, Request, Response, NextFunction } from 'express';
import authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import {
  registerValidation,
  loginValidation,
  otpValidation
} from '../utils/validation';

const router = Router();

// Public routes
router.post('/register', registerValidation, handleValidationErrors, authController.register);
router.post('/login', 
  (req: Request, res: Response, next: NextFunction) => {
    console.log('🌟 Login route hit');
    console.log('Request body:', req.body);
    next();
  },
  loginValidation, 
  handleValidationErrors, 
  authController.login
);
router.post('/google', authController.googleAuth);

// Protected routes
router.use(authenticate);
router.get('/profile', authController.getProfile);
router.post('/send-otp', authController.sendOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/verify-otp', otpValidation, handleValidationErrors, authController.verifyOTP);

export default router;