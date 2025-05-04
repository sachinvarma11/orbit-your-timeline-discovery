"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth"
import { auth } from "@/lib/firebase"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      setError(null)
    } catch (err: any) {
      console.error("Sign up error:", err)
      if (err.code === "auth/unauthorized-domain") {
        setError(
          "Authentication domain not authorized. Please add this domain to your Firebase authorized domains list.",
        )
      } else {
        setError(err.message || "Failed to create account")
      }
      throw err
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      setError(null)
    } catch (err: any) {
      console.error("Sign in error:", err)
      if (err.code === "auth/unauthorized-domain") {
        setError(
          "Authentication domain not authorized. Please add this domain to your Firebase authorized domains list.",
        )
      } else {
        setError(err.message || "Failed to sign in")
      }
      throw err
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      setError(null)
    } catch (err: any) {
      console.error("Google sign in error:", err)
      if (err.code === "auth/unauthorized-domain") {
        setError(
          "Authentication domain not authorized. Please add this domain to your Firebase authorized domains list.",
        )
      } else {
        setError(err.message || "Failed to sign in with Google")
      }
      throw err
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setError(null)
    } catch (err: any) {
      setError(err.message || "Failed to sign out")
      throw err
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      setError(null)
    } catch (err: any) {
      setError(err.message || "Failed to reset password")
      throw err
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    resetPassword,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
