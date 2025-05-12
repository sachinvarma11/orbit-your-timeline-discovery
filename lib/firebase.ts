import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getAnalytics, isSupported } from "firebase/analytics"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGaXfWnPulxGG970zqb2ePiVik9nx4jeM",
  authDomain: "orbit-timeline.firebaseapp.com",
  projectId: "orbit-timeline",
  storageBucket: "orbit-timeline.firebasestorage.app",
  messagingSenderId: "309163027588",
  appId: "1:309163027588:web:730f4959a34841e547e6d1",
  measurementId: "G-LDP0ZJNMDC",
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Initialize Firebase services
const auth = getAuth(app)
const db = getFirestore(app)

// Initialize Analytics (with client-side check)
const initializeAnalytics = async () => {
  if (typeof window !== "undefined") {
    try {
      const analyticsSupported = await isSupported()
      if (analyticsSupported) {
        return getAnalytics(app)
      }
    } catch (error) {
      console.error("Analytics initialization error:", error)
    }
  }
  return null
}

export { app, auth, db, initializeAnalytics }
