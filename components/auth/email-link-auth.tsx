"use client"

import type React from "react"

import { useState } from "react"
import { sendSignInLinkToEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, AlertCircle, CheckCircle } from "lucide-react"
import { isPreviewEnvironment } from "@/utils/environment"

export function EmailLinkAuth() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Check if we're in a preview environment
  const isPreview = isPreviewEnvironment()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsLoading(true)

    try {
      // Configure the action code settings
      const actionCodeSettings = {
        url: window.location.origin + "/login/email-link-callback",
        handleCodeInApp: true,
      }

      // Send the sign-in link
      await sendSignInLinkToEmail(auth, email, actionCodeSettings)

      // Save the email in localStorage to use it later
      window.localStorage.setItem("emailForSignIn", email)

      setSuccess(true)
    } catch (err: any) {
      console.error("Email link error:", err)
      if (err.code === "auth/unauthorized-domain") {
        setError(
          "Authentication domain not authorized. Please add this domain to your Firebase authorized domains list.",
        )
      } else {
        setError(err.message || "Failed to send login link")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={`w-full max-w-md mx-auto ${isPreview ? "border-2 border-yellow-300" : "mt-8"}`}>
      <CardHeader>
        <CardTitle className="text-xl text-center">
          {isPreview ? "Recommended: Sign in with Email Link" : "Sign in with Email Link"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        {success ? (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-600">
              We've sent a sign-in link to {email}. Please check your email.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className={`w-full ${isPreview ? "bg-yellow-600 hover:bg-yellow-700" : "bg-teal-600 hover:bg-teal-700"}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Sending link...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Mail size={18} />
                  <span>Send Sign-in Link</span>
                </div>
              )}
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              {isPreview
                ? "This method works in all environments, including preview deployments."
                : "We'll email you a magic link that will sign you in instantly."}
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
