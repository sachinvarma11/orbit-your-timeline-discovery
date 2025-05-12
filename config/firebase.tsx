import { initializeApp, getApps } from "firebase/app"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGaXfWnPulxGG970zqb2ePiVik9nx4jeM",
  authDomain: "orbit-timeline.firebaseapp.com",
  projectId: "orbit-timeline",
  storageBucket: "orbit-timeline.firebasestorage.app",
  messagingSenderId: "309163027588",
  appId: "1:309163027588:web:730f4959a34841e547e6d1",
  measurementId: "G-LDP0ZJNMDC"
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export { app }
