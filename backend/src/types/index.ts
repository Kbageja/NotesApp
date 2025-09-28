export interface DBUser {
  _id: string;
  name: string;
  email: string;
  dateOfBirth?: Date;
  isVerified: boolean;
  authProvider: 'local' | 'google';
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface LoginUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  dateOfBirth?: Date;
  isVerified: boolean;
  authProvider: 'local' | 'google';
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}
export interface User {
  _id: string;
  name: string;
  email: string;
  dateOfBirth?: Date;
  isVerified: boolean;
  authProvider: 'local' | 'google';
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface ApiSuccess<T = any> {
  success: true;
  message: string;
  data?: T;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;