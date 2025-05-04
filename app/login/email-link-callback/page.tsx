"use client"

import { useEffect, useState } from "react"
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export default function EmailLinkCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    const handleEmailLink = async () => {
      // Check if the URL contains a sign-in link
      if (isSignInWithEmailLink(auth, window.location.href)) {
        // Get the email from localStorage
        let email = window.localStorage.getItem("emailForSignIn")

        // If missing email, prompt the user for it
        if (!email) {
          email = window.prompt("Please provide your email for confirmation")
        }

        if (!email) {
          setStatus("error")
          setMessage("Email is required to complete sign in.")
          return
        }

        try {
          // Sign in with the email link
          await signInWithEmailLink(auth, email, window.location.href)

          // Clear the email from storage
          window.localStorage.removeItem("emailForSignIn")

          setStatus("success")
          setMessage("You have successfully signed in!")

          // Redirect to home page after a short delay
          setTimeout(() => {
            router.push("/")
          }, 2000)
        } catch (error: any) {
          console.error("Error signing in with email link:", error)
          setStatus("error")
          setMessage(error.message || "Failed to sign in with email link.")
        }
      } else {
        setStatus("error")
        setMessage("Invalid sign-in link.")
      }
    }

    handleEmailLink()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-teal-700 mb-8">Orbit</h1>
        <Card>
          <CardContent className="p-6">
            {status === "loading" && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
                <p className="mt-4 text-gray-600">Signing you in...</p>
              </div>
            )}

            {status === "success" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-600">{message}</AlertDescription>
              </Alert>
            )}

            {status === "error" && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-600">{message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
