import { sendOTPEmail } from '../config/emails';
import User, { IUser } from '../models/User';

export class OTPService {
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await User.findById(userId);
      console.log(user,"sendOtp")
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Check if user has exceeded OTP attempts
      if (user.otp && user.otp.attempts >= 3) {
        const now = new Date();
        const lastAttempt = user.otp.expiresAt;
        const timeDiff = now.getTime() - lastAttempt.getTime();
        const minutesDiff = timeDiff / (1000 * 60);

        if (minutesDiff < 30) {
          return { 
            success: false, 
            message: `Too many attempts. Try again after ${Math.ceil(30 - minutesDiff)} minutes` 
          };
        }
        
        // Reset attempts after 30 minutes
        user.otp.attempts = 0;
      }

      const otpCode = this.generateOTP();
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes

      user.otp = {
        code: otpCode,
        expiresAt,
        attempts: user.otp ? user.otp.attempts : 0
      };

      await user.save();

      const emailSent = await sendOTPEmail(user.email, otpCode, user.name);
      console.log(emailSent,"emailSent");

      if (!emailSent) {
        return { success: false, message: 'Failed to send verification email' };
      }

      return { success: true, message: 'Verification code sent to your email' };
    } catch (error) {
      console.error('OTP Service Error:', error);
      return { success: false, message: 'Internal server error' };
    }
  }

  async verifyOTP(userId: string, otpCode: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await User.findById(userId);
      if (!user || !user.otp) {
        return { success: false, message: 'Invalid or expired verification code' };
      }

      const now = new Date();
      if (now > user.otp.expiresAt) {
        return { success: false, message: 'Verification code has expired' };
      }

      if (user.otp.code !== otpCode) {
        user.otp.attempts += 1;
        await user.save();
        return { success: false, message: 'Invalid verification code' };
      }

      // OTP is valid
      user.isVerified = true;
      user.otp = undefined;
      await user.save();

      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      console.error('OTP Verification Error:', error);
      return { success: false, message: 'Internal server error' };
    }
  }

  async resendOTP(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      if (user.isVerified) {
        return { success: false, message: 'Email is already verified' };
      }

      // Check if last OTP was sent recently (prevent spam)
      if (user.otp && user.otp.expiresAt) {
        const now = new Date();
        const lastSent = new Date(user.otp.expiresAt.getTime() - 10 * 60 * 1000); // OTP created time
        const timeDiff = now.getTime() - lastSent.getTime();
        const minutesDiff = timeDiff / (1000 * 60);

        if (minutesDiff < 2) {
          return { 
            success: false, 
            message: `Please wait ${Math.ceil(2 - minutesDiff)} minutes before requesting a new code` 
          };
        }
      }

      return await this.sendOTP(userId);
    } catch (error) {
      console.error('Resend OTP Error:', error);
      return { success: false, message: 'Internal server error' };
    }
  }
}

export default new OTPService();