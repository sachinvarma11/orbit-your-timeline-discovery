import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getAnalytics, isSupported } from "firebase/analytics"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA1sk6ZW1zXPEuCx5IXfGr1bP9VC0nSORw",
  authDomain: "orbittimelineauth.firebaseapp.com",
  projectId: "orbittimelineauth",
  storageBucket: "orbittimelineauth.firebasestorage.app",
  messagingSenderId: "601193809620",
  appId: "1:601193809620:web:55f64c2a1f39c05bc0dd41",
  measurementId: "G-PEREY2QY40",
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

// Initialize Analytics conditionally (only in browser)
export const initializeAnalytics = async () => {
  if (typeof window !== "undefined") {
    const analyticsSupported = await isSupported()
    if (analyticsSupported) {
      return getAnalytics(app)
    }
  }
  return null
}

export default app
