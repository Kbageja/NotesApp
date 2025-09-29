"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useClerk, useUser, useAuth as useClerkAuth } from "@clerk/clerk-react"
import { useAuth as useCustomAuth } from "../context/AuthContext"
import { toast } from "react-hot-toast"

const SSOCallback: React.FC = () => {
  const navigate = useNavigate()
  const clerk = useClerk()
  const { user, isLoaded: userLoaded } = useUser()
  const { isSignedIn, isLoaded: authLoaded } = useClerkAuth()
  const { googleAuth } = useCustomAuth()

  const isProcessing = useRef(false)

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent duplicate processing
      if (isProcessing.current) return
      
      try {
        // Step 1: Wait for Clerk to be ready
        if (!clerk.loaded) return
        
        console.log("SSOCallback: Clerk loaded, waiting for auth state...")
        
        // Step 2: Wait for auth to be ready
        if (!authLoaded || !userLoaded) return
        
        // Step 3: Check for errors in URL
        const params = new URLSearchParams(window.location.search)
        if (params.get("__clerk_status") === "error") {
          const errorMsg = params.get("__clerk_message") || "Authentication failed"
          toast.error(errorMsg)
          navigate("/signin", { replace: true })
          return
        }
        
        // Step 4: Ensure user is signed in
        if (!isSignedIn || !user) {
          console.log("SSOCallback: No user found, redirecting to signin")
          navigate("/signin", { replace: true })
          return
        }
        
        // Step 5: Sync with backend (only once)
        if (isProcessing.current) return
        isProcessing.current = true
        
        const primaryEmail =
          user.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ||
          user.emailAddresses?.[0]?.emailAddress ||
          ""

        const googleData = {
          googleId: user.id,
          name: user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "",
          email: primaryEmail,
        }

        console.log("SSOCallback: Syncing with backend...", googleData)
        const success = await googleAuth(googleData)

        if (success) {
          console.log("SSOCallback: Backend sync successful, redirecting to dashboard")
          // Use window.location for hard redirect to avoid Clerk interference
          window.location.href = "/dashboard"
        } else {
          console.log("SSOCallback: Backend sync failed")
          toast.error("Authentication failed. Please try again.")
          navigate("/signin", { replace: true })
        }
      } catch (error: any) {
        console.error("SSOCallback error:", error)
        toast.error("Something went wrong. Please try again.")
        navigate("/signin", { replace: true })
      }
    }

    handleCallback()
  }, [clerk.loaded, authLoaded, userLoaded, isSignedIn, user, googleAuth, navigate])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}

export default SSOCallback