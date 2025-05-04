"use client"

import { useEffect } from "react"
import { initializeAnalytics } from "@/lib/firebase"

export function AnalyticsInitializer() {
  useEffect(() => {
    const initAnalytics = async () => {
      try {
        await initializeAnalytics()
      } catch (error) {
        console.error("Failed to initialize analytics:", error)
      }
    }

    initAnalytics()
  }, [])

  return null
}
