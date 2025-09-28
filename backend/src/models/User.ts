import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Base interface for user fields
 */
export interface IUser {
  name: string;
  email: string;
  password?: string;
  dateOfBirth?: Date;
  phoneNumber?: string;
  isVerified: boolean;
  authProvider: 'local' | 'google';
  googleId?: string;
  otp?: {
    code: string;
    expiresAt: Date;
    attempts: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Document interface = IUser + mongoose Document + custom methods
 */
export interface IUserDocument extends IUser, Document {
 _id: Types.ObjectId; 
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * Model interface for static methods (if needed later)
 */
export interface IUserModel extends Model<IUserDocument> {}

/**
 * User schema
 */
const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 8,
      select: false, // important: exclude password unless explicitly selected
    },
    dateOfBirth: {
      type: Date,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    googleId: {
      type: String,
      sparse: true,
    },
    otp: {
      code: String,
      expiresAt: Date,
      attempts: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save hook for hashing password
 */
UserSchema.pre<IUserDocument>('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

/**
 * Compare password method
 */
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Final model export
 */
const User = mongoose.model<IUserDocument, IUserModel>('User', UserSchema);
export default User;
