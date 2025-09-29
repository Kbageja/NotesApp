"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import type { User } from "../types"
import apiService from "../services/api"
import toast from "react-hot-toast"


interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  needsVerification: boolean
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_USER"; payload: { user: User; token: string } }
  | { type: "UPDATE_USER"; payload: Partial<User> }
  | { type: "SET_NEEDS_VERIFICATION"; payload: boolean }
  | { type: "CLEAR_USER" }

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  needsVerification: false,
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_USER":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        needsVerification: state.needsVerification,
      }
    case "UPDATE_USER":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
        needsVerification: false,
      }
    case "SET_NEEDS_VERIFICATION":
      return { ...state, needsVerification: action.payload, isLoading: false }
    case "CLEAR_USER":
      return { ...initialState, isLoading: false }
    default:
      return state
  }
}

interface RegisterData {
  name: string
  email: string
  password: string
  dateOfBirth?: string
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  verifyOTP: (otp: string) => Promise<void>
  resendOTP: () => Promise<void>
  sendOTP: () => Promise<void>
  googleAuth: (googleData: { googleId: string; name: string; email: string }) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Restore state from memory variables only (no localStorage)
  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    const userData = localStorage.getItem("user_data")

    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        dispatch({ type: "SET_USER", payload: { user, token } })
      } catch (e) {
        console.error("Failed to parse user data:", e)
        dispatch({ type: "SET_LOADING", payload: false })
      }
    } else {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log("Starting login process...")
      const response = await apiService.login({ email, password })

      if (response.success && response.data) {
        const { user, token } = response.data
        console.log("Login successful, user verified:", user.isVerified)

        localStorage.setItem("auth_token", token)
        localStorage.setItem("user_data", JSON.stringify(user))

        if (user.isVerified) {
          dispatch({ type: "SET_USER", payload: { user, token } })
          toast.success("Login successful!")
        } else {
          dispatch({ type: "SET_NEEDS_VERIFICATION", payload: true })
          toast.error("Email verification required")
        }
      }
    } catch (error: any) {
      console.log("Login error caught:", error.response?.data)
      if (!error.response) throw error

      const errorData = error.response.data
      if (errorData?.errors && errorData.errors.length > 0) {
        const userError = errorData.errors[0]
        if (userError.token) {
          console.log("Storing token from verification error:", userError.token)

          localStorage.setItem("auth_token", userError.token)
          localStorage.setItem(
            "user_data",
            JSON.stringify({
              id: userError.id,
              name: userError.name,
              email: userError.email,
              isVerified: userError.isVerified,
              authProvider: userError.authProvider,
            }),
          )

          dispatch({ type: "SET_NEEDS_VERIFICATION", payload: true })
          toast.error(errorData.message || "Email verification required")
          return
        }
      }

      if (errorData?.message?.includes("verify")) {
        dispatch({ type: "SET_NEEDS_VERIFICATION", payload: true })
        toast.error(errorData.message || "Email verification required")
        return
      }

      throw error
    }
  }

  const verifyOTP = async (otp: string) => {
    try {
      const response = await apiService.verifyOTP(otp)
      if (response.success) {
        const userData = localStorage.getItem("user_data")
        const token = localStorage.getItem("auth_token")
        if (userData && token) {
          const user = JSON.parse(userData)
          const updatedUser = { ...user, isVerified: true }
          localStorage.setItem("user_data", JSON.stringify(updatedUser))
          dispatch({ type: "SET_USER", payload: { user: updatedUser, token } })
        }
        toast.success("Email verified successfully!")
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "OTP verification failed"
      toast.error(message)
      throw error
    }
  }

  const sendOTP = async () => {
    try {
      const response = await apiService.sendOTP()
      if (response.success) toast.success("Verification code sent to your email!")
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to send OTP"
      toast.error(message)
      throw error
    }
  }

  const resendOTP = async () => {
    try {
      const response = await apiService.resendOTP()
      if (response.success) toast.success("New verification code sent to your email!")
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to resend OTP"
      toast.error(message)
      throw error
    }
  }

  const register = async (data: RegisterData) => {
    try {
      
      const response = await apiService.register(data)

      if (response.success && response.data) {
        console.log("Registration successful, token received:", response.data.token)
        const { user, token } = response.data

        localStorage.setItem("auth_token", token)
        localStorage.setItem("user_data", JSON.stringify(user))

        dispatch({ type: "SET_NEEDS_VERIFICATION", payload: true })
        toast.success("Registration successful! Please verify your email.")
      }
    } catch (error: any) {
      dispatch({ type: "SET_LOADING", payload: false })
      console.log("Registration error:", error.response?.data)
      const message = error.response?.data?.message || "Registration failed"
      toast.error(message)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    dispatch({ type: "CLEAR_USER" })
    toast.success("Logged out successfully")
  }

  const googleAuth = async (googleData: { googleId: string; name: string; email: string }): Promise<boolean> => {
    try {
      console.log("AuthContext - Starting Google auth with data:", googleData)

      if (!googleData.googleId || !googleData.email) {
        console.error("AuthContext - Invalid Google data:", googleData)
        toast.error("Invalid Google authentication data")
        return false
      }

      const response = await apiService.googleAuth(googleData)
      console.log("AuthContext - Google auth API response:", response)

      if (response.success && response.data) {
        const { user, token } = response.data
        console.log("AuthContext - Google auth successful:", {
          userId: user.id,
          userEmail: user.email,
          isVerified: user.isVerified,
        })

        // Store in localStorage
        localStorage.setItem("auth_token", token)
        localStorage.setItem("user_data", JSON.stringify(user))

        // Update context state
        dispatch({ type: "SET_USER", payload: { user, token } })
        
        toast.success("Signed in successfully!")
        return true
      } else {
        console.error("AuthContext - Google auth failed:", response.message)
        toast.error(response.message || "Google sign in failed")
        return false
      }
    } catch (error: any) {
      console.error("AuthContext - Google auth error:", error)
      const message = error.response?.data?.message || error.message || "Google sign in failed"
      toast.error(message)
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        verifyOTP,
        resendOTP,
        sendOTP,
        googleAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}