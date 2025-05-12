"use client"

import { SignupForm } from "@/components/auth/signup-form"
import { EmailLinkAuth } from "@/components/auth/email-link-auth"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-teal-700 mb-8">Orbit</h1>

        <SignupForm />

        <div className="my-8 text-center text-gray-500">
          <p>Or use passwordless sign up</p>
        </div>

        <EmailLinkAuth />
      </div>
    </div>
  )
}
