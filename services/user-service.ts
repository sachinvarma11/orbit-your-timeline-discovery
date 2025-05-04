import { db } from "@/lib/firebase"
import { doc, setDoc, getDoc, updateDoc, arrayUnion } from "firebase/firestore"

// User profile type
export interface UserProfile {
  uid: string
  email: string
  displayName?: string
  birthYear?: number
  createdAt: number
  lastLogin: number
}

// Timeline search history type
export interface TimelineSearch {
  personName: string
  timestamp: number
}

// Save user profile to Firestore
export async function saveUserProfile(profile: UserProfile) {
  const userRef = doc(db, "users", profile.uid)
  await setDoc(userRef, profile, { merge: true })
  return profile
}

// Get user profile from Firestore
export async function getUserProfile(uid: string) {
  const userRef = doc(db, "users", uid)
  const docSnap = await getDoc(userRef)

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile
  }

  return null
}

// Update user's birth year
export async function updateBirthYear(uid: string, birthYear: number) {
  const userRef = doc(db, "users", uid)
  await updateDoc(userRef, { birthYear })
}

// Save search history
export async function saveSearchHistory(uid: string, personName: string) {
  const userRef = doc(db, "users", uid)
  await updateDoc(userRef, {
    searchHistory: arrayUnion({
      personName,
      timestamp: Date.now(),
    }),
  })
}

// Get user's search history
export async function getSearchHistory(uid: string) {
  const userRef = doc(db, "users", uid)
  const docSnap = await getDoc(userRef)

  if (docSnap.exists() && docSnap.data().searchHistory) {
    return docSnap.data().searchHistory as TimelineSearch[]
  }

  return []
}

// Save timeline data to Firestore
export async function saveTimelineData(uid: string, personName: string, timelineData: any) {
  const timelineRef = doc(db, "timelines", `${uid}_${personName.toLowerCase().replace(/\s+/g, "_")}`)
  await setDoc(timelineRef, {
    uid,
    personName,
    timelineData,
    createdAt: Date.now(),
  })
}

// Get saved timeline data
export async function getTimelineData(uid: string, personName: string) {
  const timelineRef = doc(db, "timelines", `${uid}_${personName.toLowerCase().replace(/\s+/g, "_")}`)
  const docSnap = await getDoc(timelineRef)

  if (docSnap.exists()) {
    return docSnap.data().timelineData
  }

  return null
}
