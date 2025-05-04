/**
 * Checks if the current environment is likely a preview environment
 * where Firebase authentication popups might not work due to domain restrictions
 */
export function isPreviewEnvironment(): boolean {
  if (typeof window === "undefined") return false

  const hostname = window.location.hostname

  // Check for common preview/development environments
  return (
    hostname.includes("vercel.app") ||
    hostname.includes("netlify.app") ||
    hostname.includes("github.io") ||
    hostname.includes("localhost") ||
    hostname.includes("127.0.0.1") ||
    // Add any other preview domains you might use
    hostname.includes("preview")
  )
}

/**
 * Gets the current hostname for display purposes
 */
export function getCurrentHostname(): string {
  if (typeof window === "undefined") return ""
  return window.location.hostname
}
