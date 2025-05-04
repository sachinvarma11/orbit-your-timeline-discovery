"use client"

import { LoginForm } from "@/components/auth/login-form"
import { EmailLinkAuth } from "@/components/auth/email-link-auth"
import { isPreviewEnvironment } from "@/utils/environment"
import { useEffect, useState } from "react"

export default function LoginPage() {
  const [isPreview, setIsPreview] = useState(false)

  // We need to use useEffect because isPreviewEnvironment uses window
  useEffect(() => {
    setIsPreview(isPreviewEnvironment())
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-teal-700 mb-8">Orbit</h1>

        {/* In preview environments, show email link auth first */}
        {isPreview ? (
          <>
            <EmailLinkAuth />
            <div className="my-8 text-center text-gray-500">
              <p>Or use email and password</p>
            </div>
            <LoginForm />
          </>
        ) : (
          <>
            <LoginForm />
            <div className="my-8 text-center text-gray-500">
              <p>Having trouble signing in?</p>
            </div>
            <EmailLinkAuth />
          </>
        )}
      </div>
    </div>
  )
}
