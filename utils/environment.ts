/**
 * Gets the current hostname for display purposes
 */
export function getCurrentHostname(): string {
  if (typeof window === "undefined") return ""
  return window.location.hostname
}

/**
 * This function is no longer used to disable Google Sign-In
 * It's kept for backward compatibility with other parts of the code
 */
export function isPreviewEnvironment(): boolean {
  return false
}
