import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app"
import { getFirestore, Firestore } from "firebase/firestore"
import { getAuth, Auth } from "firebase/auth"
import { getStorage, FirebaseStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCGw0Fvo-QO9PCvtXOiOSGFMJI4dDJK32I",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "gonstead-chiropractic-clinic.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://gonstead-chiropractic-clinic-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "gonstead-chiropractic-clinic",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "gonstead-chiropractic-clinic.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "473167186593",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:473167186593:web:69026d84215afa8fa83ee0",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-DE9FB4M1EK",
}

let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null
let storage: FirebaseStorage | null = null

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
    db = getFirestore(app)
    auth = getAuth(app)
    storage = getStorage(app)
    console.log("[Firebase] ✅ Firebase initialized successfully for project:", firebaseConfig.projectId)
  } else {
    console.warn("[Firebase] ⚠️ Firebase config missing apiKey or projectId. Firestore will be disabled.")
  }
} catch (error) {
  console.error("[Firebase] ❌ Firebase initialization error:", error)
}

export { app, db, auth, storage }
export default app
