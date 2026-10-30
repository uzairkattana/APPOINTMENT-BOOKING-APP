/**
 * Patient Authentication & Firestore Account Manager
 * Handled via Firebase Auth + Firestore `patient_accounts` & `patients` collections.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore"
import { auth, db } from "./firebase"
import type { Patient } from "./firebase-db"
import { normalizeFirestorePatient } from "./firebase-db"

export interface PatientAccount {
  uid: string
  name: string
  email: string
  phone: string
  created_at: string
  last_login_at: string
  role: "patient"
  patient_id?: string
  dob?: string
  gender?: string
  address?: string
  emergency_contact?: string
}

const PATIENT_ACCOUNTS = "patient_accounts"
const PATIENTS = "patients"

/**
 * Register a new Patient account in Firebase Auth AND save credentials/profile in Firestore.
 */
export async function registerPatient(params: {
  name: string
  email: string
  phone: string
  password: string
}): Promise<{ user: User | null; account: PatientAccount | null; error: string | null }> {
  if (!auth || !db) {
    return { user: null, account: null, error: "Firebase services not initialized." }
  }

  const cleanEmail = params.email.trim().toLowerCase()
  const cleanPhone = params.phone.trim()
  const cleanName = params.name.trim()

  try {
    // 1. Create Firebase Auth user
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, params.password)
    const user = cred.user

    const now = new Date().toISOString()

    // 2. Link or create Patient document in Firestore
    const patientDocRef = doc(collection(db, PATIENTS))
    const patientData = {
      id: patientDocRef.id,
      auth_uid: user.uid,
      name: cleanName,
      patient_name: cleanName,
      full_name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      status: "scheduled",
      session_type: "in_clinic",
      created_at: now,
      updated_at: now,
      sessions_completed: 0,
      payment_method: "cash",
      booking_source: "patient_portal",
    }
    await setDoc(patientDocRef, patientData)

    // 3. Save Account record in `patient_accounts` Firestore collection
    const accountDocRef = doc(db, PATIENT_ACCOUNTS, user.uid)
    const accountPayload: PatientAccount = {
      uid: user.uid,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      created_at: now,
      last_login_at: now,
      role: "patient",
      patient_id: patientDocRef.id,
    }
    await setDoc(accountDocRef, accountPayload)

    // 4. Store active patient session in localStorage for smooth client rendering
    if (typeof window !== "undefined") {
      localStorage.setItem("patient_authenticated", "true")
      localStorage.setItem("patient_uid", user.uid)
      localStorage.setItem("patient_email", cleanEmail)
      localStorage.setItem("patient_name", cleanName)
      localStorage.setItem("patient_id", patientDocRef.id)
    }

    return { user, account: accountPayload, error: null }
  } catch (err: any) {
    console.error("registerPatient error:", err)
    let msg = err.message || "Failed to create patient account."
    if (err.code === "auth/email-already-in-use") {
      msg = "An account with this email address already exists. Please log in."
    } else if (err.code === "auth/weak-password") {
      msg = "Password should be at least 6 characters long."
    } else if (err.code === "auth/invalid-email") {
      msg = "Please enter a valid email address."
    }
    return { user: null, account: null, error: msg }
  }
}

/**
 * Sign in existing patient with email & password.
 */
export async function loginPatient(
  email: string,
  pass: string
): Promise<{ user: User | null; account: PatientAccount | null; error: string | null }> {
  if (!auth || !db) {
    return { user: null, account: null, error: "Firebase services not initialized." }
  }

  const cleanEmail = email.trim().toLowerCase()

  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass)
    const user = cred.user

    // Fetch account details from Firestore
    const accountRef = doc(db, PATIENT_ACCOUNTS, user.uid)
    const accountSnap = await getDoc(accountRef)

    let account: PatientAccount | null = null

    if (accountSnap.exists()) {
      account = accountSnap.data() as PatientAccount
      // Update last_login_at timestamp in Firestore
      await updateDoc(accountRef, { last_login_at: new Date().toISOString() })
    } else {
      // Fallback: build account if missing in Firestore
      account = {
        uid: user.uid,
        name: user.displayName || user.email?.split("@")[0] || "Patient",
        email: cleanEmail,
        phone: user.phoneNumber || "",
        created_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
        role: "patient",
      }
      await setDoc(accountRef, account)
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("patient_authenticated", "true")
      localStorage.setItem("patient_uid", user.uid)
      localStorage.setItem("patient_email", cleanEmail)
      localStorage.setItem("patient_name", account.name)
      if (account.patient_id) {
        localStorage.setItem("patient_id", account.patient_id)
      }
    }

    return { user, account, error: null }
  } catch (err: any) {
    console.error("loginPatient error:", err)
    let msg = err.message || "Failed to sign in."
    if (
      err.code === "auth/wrong-password" ||
      err.code === "auth/user-not-found" ||
      err.code === "auth/invalid-credential"
    ) {
      msg = "Invalid email or password. Please check your credentials."
    }
    return { user: null, account: null, error: msg }
  }
}

/**
 * Sign out current patient.
 */
export async function logoutPatient(): Promise<{ error: string | null }> {
  if (typeof window !== "undefined") {
    localStorage.removeItem("patient_authenticated")
    localStorage.removeItem("patient_uid")
    localStorage.removeItem("patient_email")
    localStorage.removeItem("patient_name")
    localStorage.removeItem("patient_id")
  }

  if (auth) {
    try {
      await signOut(auth)
    } catch (err: any) {
      console.warn("logoutPatient error:", err)
    }
  }

  return { error: null }
}

/**
 * Fetch all appointments / patient records matching patient email, phone, name, or auth UID from Firestore.
 * Supports smart matching for doctor-booked appointments from the Admin Dashboard.
 */
export async function getPatientAppointmentsFromFirestore(
  email?: string,
  phone?: string,
  uid?: string,
  patientName?: string
): Promise<Patient[]> {
  if (!db) return []

  try {
    const resultsMap = new Map<string, Patient>()
    const cleanEmail = email?.trim().toLowerCase() || ""
    const cleanPhone = phone?.replace(/\D/g, "") || ""
    const cleanName = patientName?.trim().toLowerCase() || (typeof window !== "undefined" ? localStorage.getItem("patient_name")?.toLowerCase() || "" : "")

    // 1. Direct Queries by UID, Email, and Phone
    const queries = []
    if (uid) queries.push(query(collection(db, PATIENTS), where("auth_uid", "==", uid)))
    if (cleanEmail) {
      queries.push(query(collection(db, PATIENTS), where("email", "==", cleanEmail)))
    }
    if (phone) {
      queries.push(query(collection(db, PATIENTS), where("phone", "==", phone)))
    }

    for (const q of queries) {
      try {
        const snap = await getDocs(q)
        snap.docs.forEach((d) => {
          if (!resultsMap.has(d.id)) {
            resultsMap.set(d.id, normalizeFirestorePatient(d.id, d.data()))
          }
        })
      } catch (e) {
        // Skip query failure
      }
    }

    // 2. Queue & Doctor-Booked Queries
    if (phone) {
      try {
        const qQueue = query(collection(db, "appointment_queue"), where("patient_phone", "==", phone))
        const snapQueue = await getDocs(qQueue)
        snapQueue.docs.forEach((d) => {
          if (!resultsMap.has(d.id)) {
            resultsMap.set(d.id, normalizeFirestorePatient(d.id, d.data()))
          }
        })
      } catch (e) {}
    }

    // 3. Smart Doctor-Booked Match (Scan recent documents if email/phone query returned few matches)
    try {
      const allDocsSnap = await getDocs(collection(db, PATIENTS))
      allDocsSnap.docs.forEach((d) => {
        if (!resultsMap.has(d.id)) {
          const data = d.data()
          const docEmail = (data.email || data.patient_email || "").toString().trim().toLowerCase()
          const docPhone = (data.phone || data.patient_phone || "").toString().replace(/\D/g, "")
          const docName = (data.patient_name || data.name || data.full_name || "").toString().trim().toLowerCase()

          const isEmailMatch = cleanEmail && docEmail && docEmail === cleanEmail
          const isPhoneMatch = cleanPhone && docPhone && (docPhone.includes(cleanPhone) || cleanPhone.includes(docPhone))
          const isNameMatch = cleanName && docName && (docName === cleanName || docName.includes(cleanName) || cleanName.includes(docName))

          if (isEmailMatch || isPhoneMatch || isNameMatch) {
            resultsMap.set(d.id, normalizeFirestorePatient(d.id, data))
          }
        }
      })
    } catch (scanErr) {
      console.warn("Smart Doctor Match note:", scanErr)
    }

    const list = Array.from(resultsMap.values())
    list.sort((a, b) => new Date(b.created_at || b.appointment_date).getTime() - new Date(a.created_at || a.appointment_date).getTime())
    return list
  } catch (err) {
    console.error("getPatientAppointmentsFromFirestore error:", err)
    return []
  }
}
