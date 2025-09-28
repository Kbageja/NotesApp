import User, { IUser, IUserDocument } from '../models/User';
import { generateToken } from '../config/jwt';
import otpService from './otpService';
import { DBUser } from '../types';
import { compareSync } from 'bcryptjs';

export const mapToDBUser = (user: IUserDocument): DBUser => ({
  _id: user._id.toString(),
  name: user.name,
  email: user.email,
  dateOfBirth: user.dateOfBirth,
  isVerified: user.isVerified,
  authProvider: user.authProvider,
  googleId: user.googleId,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});
export class AuthService {
  async register(userData: {
    name: string;
    email: string;
    password?: string;
    dateOfBirth?: Date;
    authProvider?: 'local' | 'google';
    googleId?: string;
  }): Promise<{ success: boolean; message: string; user?: any; token?: string }> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        return { success: false, message: 'User already exists with this email' };
      }

      const user = new User({
        ...userData,
        isVerified: userData.authProvider === 'google' // Google users are auto-verified
      });

      await user.save();
      const dbUser = user;

      const token = generateToken({
        userId: dbUser._id.toString(),
        email: dbUser.email
      });

      const userResponse = {
        id: dbUser._id,
        name: dbUser.name,
        email: dbUser.email,
        dateOfBirth: dbUser.dateOfBirth,
        isVerified: dbUser.isVerified,
        authProvider: dbUser.authProvider
      };

      // Send OTP for local registration
      if (userData.authProvider === 'local') {
        await otpService.sendOTP(dbUser._id.toString());
      }

      return {
        success: true,
        message: userData.authProvider === 'google' ? 
          'Registration successful' : 
          'Please check your email for verification code.',
        user: userResponse,
        token
      };
    } catch (error: any) {
      console.error('Registration Error:', error);
      return { success: false, message: error.message || 'Registration failed' };
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string; user?: any; token?: string }> {
    try {
      console.log("📌 Inside authService.login just before returning");
  const user = await User.findOne({ email }).select('+password') ;
  console.log(user,"login user");
      if (!user) {
        return { success: false, message: 'Invalid credentials' };
      }

      if (user.authProvider === 'google') {
        return { success: false, message: 'Please sign in with Google' };
      }

      if (!user.password || !(await user.comparePassword(password))) {
        return { success: false, message: 'Invalid credentials' };
      }
      const token = generateToken({
        userId: user._id.toString(),
        email: user.email
      });

      if (!user.isVerified) {
        await otpService.sendOTP(user._id.toString());
        return { 
          success: false, 
          message: 'Please verify your email first. A new verification code has been sent.',
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            isVerified: false,
            authProvider: user.authProvider,
            token,
          },
          token,
        };
      }

     

      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        isVerified: user.isVerified,
        authProvider: user.authProvider
      };

      return {
        success: true,
        message: 'Login successful',
        user: userResponse,
        token
      };
    } catch (error: any) {
      console.error('Login Error:', error);
      return { success: false, message: 'Login failed' };
    }
  }

  async googleAuth(googleData: {
    googleId: string;
    name: string;
    email: string;
  }): Promise<{ success: boolean; message: string; user?: any; token?: string; isNewUser?: boolean }> {
    try {
      let user = await User.findOne({ 
        $or: [{ googleId: googleData.googleId }, { email: googleData.email }]
      }) as import('../types').DBUser | null;

      let isNewUser = false;

      if (!user) {
        // Create new user
        const newUser = new User({
          ...googleData,
          authProvider: 'google',
          isVerified: true
        });
        await newUser.save();
        user = mapToDBUser(newUser);;
        isNewUser = true;
      } else if (!user.googleId) {
        // Link existing account with Google
        user.googleId = googleData.googleId;
        user.authProvider = 'google';
        user.isVerified = true;
        await User.updateOne({ _id: user._id }, { $set: { googleId: user.googleId, authProvider: user.authProvider, isVerified: user.isVerified } });
      }

      const token = generateToken({
        userId: user._id.toString(),
        email: user.email
      });

      const userResponse = {
        id: user._id,
        name: user.name,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        isVerified: user.isVerified,
        authProvider: user.authProvider
      };

      return {
        success: true,
        message: isNewUser ? 'Account created successfully' : 'Login successful',
        user: userResponse,
        token,
        isNewUser
      };
    } catch (error: any) {
      console.error('Google Auth Error:', error);
      return { success: false, message: 'Authentication failed' };
    }
  }
}

export default new AuthService();