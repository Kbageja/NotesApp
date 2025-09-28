import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import type { User } from "@/types"
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
        needsVerification: state.needsVerification, // ⚡ preserve OTP state
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

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  verifyOTP: (otp: string) => Promise<void>
  resendOTP: () => Promise<void>
  sendOTP: () => Promise<void>
}

interface RegisterData {
  name: string
  email: string
  password: string
  dateOfBirth?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Restore state from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user_data")
    const token = localStorage.getItem("auth_token")
    const needsVerification = localStorage.getItem("needs_verification") === "true"

    if (userData) {
      const user = JSON.parse(userData)
      if (!user.isVerified || needsVerification) {
        dispatch({ type: "SET_NEEDS_VERIFICATION", payload: true })
      } else if (token) {
        dispatch({ type: "SET_USER", payload: { user, token } })
      } else {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    } else {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log("[v0] Starting login process...")
      const response = await apiService.login({ email, password })

      if (response.success && response.data) {
        const { user, token } = response.data
        console.log("[v0] Login successful, user verified:", user.isVerified)

        localStorage.setItem("auth_token", token)
        localStorage.setItem("user_data", JSON.stringify(user))

        if (user.isVerified) {
          localStorage.removeItem("needs_verification")
          dispatch({ type: "SET_USER", payload: { user, token } })
          toast.success("Login successful!")
        } else {
          localStorage.setItem("needs_verification", "true")
          dispatch({ type: "SET_NEEDS_VERIFICATION", payload: true })
          toast.error("Email verification required")
        }
      }
    } catch (error: any) {
      console.log("[v0] Login error caught:", error.response?.data)
      if (!error.response) throw error

      const errorData = error.response.data
      if (errorData?.errors && errorData.errors.length > 0) {
        const userError = errorData.errors[0]
        if (userError.token) {
          console.log("[v0] Storing token from verification error:", userError.token)

          // Store token and user data from errors array
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
          localStorage.setItem("needs_verification", "true")

          dispatch({ type: "SET_NEEDS_VERIFICATION", payload: true })
          toast.error(errorData.message || "Email verification required")
          return
        }
      }

      // Fallback for other verification errors
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
          localStorage.removeItem("needs_verification")
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
      dispatch({ type: "SET_LOADING", payload: true })
      console.log("[v0] Starting registration process...")
      const response = await apiService.register(data)

      if (response.success && response.data) {
        console.log("[v0] Registration successful, token received:", response.data.token)
        const { user, token } = response.data

        // Store token and user data from successful registration response
        localStorage.setItem("auth_token", token)
        localStorage.setItem("user_data", JSON.stringify(user))
        localStorage.setItem("needs_verification", "true")

        dispatch({ type: "SET_NEEDS_VERIFICATION", payload: true })
        toast.success("Registration successful! Please verify your email.")
      }
    } catch (error: any) {
      dispatch({ type: "SET_LOADING", payload: false })
      console.log("[v0] Registration error:", error.response?.data)
      const message = error.response?.data?.message || "Registration failed"
      toast.error(message)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    localStorage.removeItem("needs_verification")
    dispatch({ type: "CLEAR_USER" })
    toast.success("Logged out successfully")
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
