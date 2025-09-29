"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Button } from "../components/ui/Button"
import Input from "../components/ui/Input"
import { Eye, EyeOff } from "lucide-react"
import { useSignIn } from "@clerk/clerk-react"
import { toast } from "react-hot-toast"

const SignIn: React.FC = () => {
  const navigate = useNavigate()
  const { login, verifyOTP, sendOTP } = useAuth()
  const { signIn } = useSignIn()

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [originalPassword, setOriginalPassword] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [otpTimer, setOtpTimer] = useState(0)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (needsVerification) {
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    }
  }, [needsVerification])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === "password") {
      setOriginalPassword(value)
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) otpRefs.current[index + 1]?.focus()
    if (errors.otp) setErrors((prev) => ({ ...prev, otp: "" }))
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Enter a valid email"

    if (!formData.password && !needsVerification) newErrors.password = "Password is required"

    if (needsVerification) {
      const otpCode = otp.join("")
      if (!otpCode) newErrors.otp = "OTP is required"
      else if (otpCode.length !== 6) newErrors.otp = "Enter all 6 digits"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSendOTP = async () => {
    try {
      await sendOTP()
      setOtpSent(true)
      setOtpTimer(60)

      const timer = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch {}
  }

  const handleResendOTP = () => {
    if (otpTimer > 0) return
    setOtp(["", "", "", "", "", ""])
    handleSendOTP()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      if (needsVerification) {
        const otpCode = otp.join("")
        await verifyOTP(otpCode)
        navigate("/dashboard")
        return
      }

      const response = await login(formData.email, formData.password)
      console.log("Login response:", response)
      navigate("/dashboard")
    } catch (error: any) {
      if (error.response?.data?.message?.includes("verify")) {
        setNeedsVerification(true)
        setFormData((prev) => ({ ...prev, password: originalPassword }))
        handleSendOTP()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!signIn) {
      console.error("SignIn object not available")
      toast.error("Google sign in not available")
      return
    }

    try {
      setIsLoading(true)
      console.log("Starting Google sign in process")

      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: `${window.location.origin}/sso-callback`,
      })
    } catch (error: any) {
      console.error("Google sign in error:", error)
      setIsLoading(false)
      toast.error(`Failed to start Google sign in: ${error.message || "Unknown error"}`)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile View */}
      <div className="md:hidden mobile-container">
        <div className="flex flex-col min-h-screen">
          <div className="flex items-center justify-center pt-12 pb-8">
            <img src="/logo.png" alt="HD Logo" className="h-10 w-auto" />
          </div>

          <div className="flex-1 px-6">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Sign in</h1>
              <p className="text-muted-foreground">Welcome back to HD Notes</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="jonas_kahnwald@gmail.com"
                  className="h-12"
                  disabled={needsVerification}
                />
                {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="h-12 pr-10"
                    readOnly={needsVerification}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={needsVerification}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
              </div>

              {/* OTP Input - Mobile */}
              {needsVerification && (
                <div className="space-y-4 animate-slide-up">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-foreground">Enter verification code</label>
                    <div className="flex justify-center space-x-2">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            otpRefs.current[index] = el
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ""))}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                        />
                      ))}
                    </div>
                    {errors.otp && <p className="text-destructive text-sm text-center">{errors.otp}</p>}
                  </div>

                  <div className="text-center">
                    {otpSent && <p className="text-sm text-green-600 mb-2">✅ Verification code sent to your email</p>}

                    {otpTimer > 0 ? (
                      <p className="text-sm text-muted-foreground">Resend code in {otpTimer}s</p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        className="text-sm text-primary font-medium hover:underline"
                      >
                        Resend verification code
                      </button>
                    )}
                  </div>
                </div>
              )}

              <Button type="submit" size="lg" className="w-full h-12 bg-blue-500 text-white rounded-xl font-semibold" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="loading-spinner mr-2"></div>
                    Please wait...
                  </div>
                ) : needsVerification ? (
                  "Verify & Sign in"
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/signup" className="text-blue-500 underline font-medium hover:text-blue-600">
                Sign up
              </Link>
            </div>
             <div className="relative mt-6">
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              className="w-full h-14 text-base font-semibold mt-4 border-gray-300 bg-transparent"
              disabled={isLoading || needsVerification}
            >
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex max-h-[900px] mx-2">
        <div className="flex w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Left Panel */}
          <div className="w-2/5 px-16 flex flex-col justify-center bg-card">
            <div className="pb-12 ">
              <img src="/logo.png" alt="HD Logo" className="h-6 w-auto" />
            </div>

            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-3">Sign in</h1>
              <p className="text-muted-foreground text-lg">Welcome back to HD Notes</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="jonas_kahnwald@gmail.com"
                  className="h-14 text-base "
                  disabled={needsVerification}
                />
                {errors.email && <p className="text-amber-500 font-semibold text-sm">{errors.email}!</p>}
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="h-14 text-base pr-12"
                    readOnly={needsVerification}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={needsVerification}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-amber-500 font-semibold text-sm">{errors.password}!</p>}
              </div>

              {/* OTP Input - Desktop */}
              {needsVerification && (
                <div className="space-y-4 animate-slide-up">
                  <div className="space-y-4">
                    <label className="block text-base font-medium text-foreground">
                      Enter 6-digit verification code
                    </label>
                    <div className="flex justify-center space-x-3">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            otpRefs.current[index] = el
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ""))}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-14 h-14 text-center text-2xl font-semibold border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-colors"
                        />
                      ))}
                    </div>
                    {errors.otp && <p className="text-amber-500 font-semibold text-sm text-center">{errors.otp}!</p>}
                  </div>

                  <div className="text-center">
                    {otpSent && (
                      <p className="text-sm text-green-600 mb-2">✅ Verification code sent to {formData.email}</p>
                    )}

                    {otpTimer > 0 ? (
                      <p className="text-sm text-muted-foreground">Resend code in {otpTimer} seconds</p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        className="text-sm text-blue-500 hover:text-blue-700 font-semibold underline"
                      >
                        Resend verification code
                      </button>
                    )}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full h-14 text-base font-semibold mt-2 bg-blue-500 text-white rounded-xl "
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="loading-spinner mr-2"></div>
                    Please wait...
                  </div>
                ) : needsVerification ? (
                  "Verify & Sign in"
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/signup" className="text-blue-500 underline font-semibold ">
                Sign up
              </Link>
            </div>

            {/* Divider and Google Button */}
            <div className="relative mt-6">
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              className="w-full h-14 text-base font-semibold mt-4 border-gray-300 bg-transparent"
              disabled={isLoading || needsVerification}
            >
              <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </div>

          {/* Right Panel */}
          <div className="w-[60%] h-screen relative overflow-hidden rounded-r-3xl py-2">
            <img src="/signin.png" alt="Abstract blue waves" className="w-full h-full object-fit" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignIn