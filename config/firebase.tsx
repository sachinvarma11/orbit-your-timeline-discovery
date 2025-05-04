import { initializeApp, getApps } from "firebase/app"

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

export { app }
