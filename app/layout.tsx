import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { AnalyticsInitializer } from "@/app/analytics-initializer"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

// Update the metadata title
export const metadata: Metadata = {
  title: "Orbit - Age-Based Timeline",
  description: "Discover the age-based timeline of notable individuals",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <AnalyticsInitializer />
            <Suspense>{children}</Suspense>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
