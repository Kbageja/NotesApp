import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from "axios"
import { toast } from "react-hot-toast"

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: any[]
}

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    })

    // ✅ Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("auth_token")
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }
        return config
      },
      (error) => Promise.reject(error),
    )

    // ✅ Response interceptor (handles all API errors globally)
    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => response,
      (error: AxiosError<ApiResponse>) => {
        console.error("[API Error]", error.response?.status, error.response?.data)

        const message =
          (error.response?.data as any)?.message ||
          (error as any).message ||
          "Something went wrong"

        toast.error(message) // 🔥 Show toast for all errors

        if (error.response?.status === 401) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token")
            localStorage.removeItem("user_data")
            localStorage.removeItem("needs_verification")
          }
        }

        return Promise.reject(error)
      },
    )
  }

  async register(userData: {
    name: string
    email: string
    password: string
    dateOfBirth?: string
  }): Promise<ApiResponse> {
    const response = await this.api.post("/auth/register", userData)
    return response.data
  }

  async login(credentials: { email: string; password: string }): Promise<ApiResponse> {
    try {
      const response = await this.api.post("/auth/login", credentials)
      return response.data
    } catch (error: any) {
      // ✅ Additional logic for verification flow
      if (error.response?.data?.user && error.response?.data?.token) {
        const { user, token } = error.response.data
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", token)
          localStorage.setItem("user_data", JSON.stringify(user))
          localStorage.setItem("needs_verification", "true")
        }
      }
      throw error
    }
  }

  async googleAuth(googleData: { googleId: string; name: string; email: string }) {
    const response = await this.api.post("/auth/google", googleData)
    return response.data
  }

  async sendOTP(): Promise<ApiResponse> {
    const response = await this.api.post("/auth/send-otp")
    return response.data
  }

  async resendOTP(): Promise<ApiResponse> {
    const response = await this.api.post("/auth/resend-otp")
    return response.data
  }

  async verifyOTP(otp: string): Promise<ApiResponse> {
    const response = await this.api.post("/auth/verify-otp", { otp })
    return response.data
  }

  async getProfile(): Promise<ApiResponse> {
    const response = await this.api.get("/auth/profile")
    return response.data
  }

  async getNotes(page = 1, limit = 10): Promise<ApiResponse> {
    const response = await this.api.get(`/notes?page=${page}&limit=${limit}`)
    return response.data
  }

  async createNote(noteData: { title: string; content: string }): Promise<ApiResponse> {
    const response = await this.api.post("/notes", noteData)
    return response.data
  }

  async updateNote(id: string, noteData: { title: string; content: string }): Promise<ApiResponse> {
    const response = await this.api.put(`/notes/${id}`, noteData)
    return response.data
  }

  async deleteNote(id: string): Promise<ApiResponse> {
    const response = await this.api.delete(`/notes/${id}`)
    return response.data
  }
}

export default new ApiService()
