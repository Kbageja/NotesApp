import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Button } from "@/components/ui/Button"
import Input  from "@/components/ui/Input"
import { Eye, EyeOff } from "lucide-react"

const SignIn: React.FC = () => {
  const navigate = useNavigate()
  const { login, verifyOTP, sendOTP } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: localStorage.getItem("user_email") || "",
    password: "",
  })
  const [originalPassword, setOriginalPassword] = useState("") // Store original password to prevent reset during OTP flow
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [otpTimer, setOtpTimer] = useState(0)
  const [needsVerification, setNeedsVerification] = useState(localStorage.getItem("needs_verification") === "true")
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
        localStorage.removeItem("needs_verification")
        localStorage.removeItem("user_email")
        navigate("/dashboard")
        return
      }

      const response = await login(formData.email, formData.password)
      console.log("Login response:", response)
      navigate("/dashboard")
    } catch (error: any) {
      if (error.response?.data?.message?.includes("verify")) {
        setNeedsVerification(true)
        localStorage.setItem("needs_verification", "true")
        localStorage.setItem("user_email", formData.email)
        setFormData((prev) => ({ ...prev, password: originalPassword }))
        handleSendOTP()
      }
    } finally {
      setIsLoading(false)
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
                    readOnly={needsVerification} // Don't disable password field during verification, just make it readonly
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

              <Button type="submit" size="lg" className="w-full h-12" disabled={isLoading}>
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
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </div>
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
                    readOnly={needsVerification} // Don't disable password field during verification, just make it readonly
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
