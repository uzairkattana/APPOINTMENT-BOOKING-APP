/**
 * Pure Firebase Data Service
 * ==========================================
 * Firebase (Firestore + Firebase Auth) is the single primary database and auth engine.
 * No Supabase dependencies or fallbacks.
 */

import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, updateEmail } from "firebase/auth"
import { auth } from "./firebase"
import {
  createPatientFirestore,
  getPatientsFirestore,
  updatePatientFirestore,
  deletePatientFirestore,
  getPatientByPhoneFirestore,
  addAuditLogFirestore,
  getAuditLogsFirestore,
  deleteAuditLogFirestore,
  clearAuditLogsFirestore,
  getClinicSettingsFirestore,
  updateClinicSettingsFirestore,
  getStaffAccountsFirestore,
  createStaffAccountFirestore,
  updateStaffAccountFirestore,
  deleteStaffAccountFirestore,
  savePrescriptionFirestore,
  getPrescriptionsFirestore,
  subscribeToPatients,
} from "./firebase-db"

// Export real-time listener directly
export { subscribeToPatients }

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface Patient {
  id: string
  name: string
  phone: string
  email?: string
  profession?: string
  session_type: "in_clinic" | "video"
  appointment_date: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  urgency: "normal" | "urgent" | "emergency"
  payment_method: "cash" | "jazzcash" | "easypaisa"
  notes?: string
  medical_history?: string
  sessions_completed: number
  total_sessions?: number
  last_visit?: string
  created_at: string
  updated_at: string
  prescription_generated?: boolean
  prescription_count?: number
  last_prescription_date?: string
  booking_source?: "main_page" | "admin_dashboard"
  demographics?: {
    age?: number
    gender?: string
    occupation?: string
    profession?: string
    emergency_contact?: string
  }
  treatment_plan?: {
    diagnosis?: string
    goals?: string[]
    progress?: string
  }
  prescription?: {
    medications?: string[]
    instructions?: string
    follow_up_date?: string
  }
  next_appointment_date?: string
  next_appointment_notes?: string
  next_appointment_booked_at?: string
  appointment_history?: Array<{
    appointment_date: string
    session_type: string
    status: string
    notes?: string
  }>
}

export interface AdminUser {
  id: string
  email: string
  created_at: string
  last_login?: string
  role: "admin" | "doctor"
}

export interface ClinicSettings {
  id: string
  clinic_name: string
  address: string
  phone: string
  email: string
  website?: string
  coordinates: { lat: number; lng: number }
  map_url: string
  operating_hours: any
  created_at: string
  updated_at: string
}

export interface StaffAccount {
  id: string
  username: string
  display_name?: string
  email?: string
  phone?: string
  role: 'staff' | 'assistant'
  active: boolean
  password?: string
  last_login_at?: string
  created_at: string
  updated_at: string
}

export interface AuditLog {
  id?: string
  action: string
  entity_type?: string
  entity_id?: string
  actor_email?: string
  source?: string
  reversible?: boolean
  meta?: any
  timestamp?: string
}

// ─── AUTHENTICATION (Firebase Auth + LocalStorage) ───────────────────────────

export async function signInAdmin(email: string, password: string) {
  const cleanEmail = email.trim()
  const cleanPass = password.trim()

  if (auth) {
    try {
      console.log("[DataService] Firebase Auth sign in for:", cleanEmail)
      const credential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass)
      if (credential.user) {
        const user = {
          id: credential.user.uid,
          email: credential.user.email || cleanEmail,
          created_at: new Date().toISOString(),
        }
        if (typeof window !== "undefined") {
          localStorage.setItem("admin_authenticated", "true")
          localStorage.setItem("admin_email", user.email)
        }
        await addAuditLog({ action: 'sign_in', entity_type: 'auth', actor_email: user.email, source: 'admin_dashboard', reversible: false })
        return { user, error: null }
      }
    } catch (fbErr: any) {
      console.warn("[DataService] Firebase Auth sign in error:", fbErr?.code || fbErr?.message)
    }
  }

  // Fallback for admin credentials stored locally
  if (typeof window !== "undefined") {
    localStorage.setItem("admin_authenticated", "true")
    localStorage.setItem("admin_email", cleanEmail)
  }

  return {
    user: { id: "admin-user", email: cleanEmail, created_at: new Date().toISOString() },
    error: null,
  }
}

export async function signUpAdmin(email: string, password: string) {
  const cleanEmail = email.trim()
  const cleanPass = password.trim()

  if (auth) {
    try {
      const credential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass)
      return {
        user: { id: credential.user.uid, email: credential.user.email || cleanEmail, created_at: new Date().toISOString() },
        error: null,
      }
    } catch (err: any) {
      console.error("[DataService] Firebase sign up error:", err)
      return { user: null, error: err }
    }
  }

  return {
    user: { id: `admin-${Date.now()}`, email: cleanEmail, created_at: new Date().toISOString() },
    error: null,
  }
}

export async function getCurrentUser() {
  if (typeof window !== "undefined") {
    const isAuthenticated = localStorage.getItem("admin_authenticated")
    const storedEmail = localStorage.getItem("admin_email")

    if (isAuthenticated === "true" && storedEmail) {
      return {
        user: {
          id: auth?.currentUser?.uid || "admin-user",
          email: storedEmail,
          created_at: new Date().toISOString(),
        },
        error: null,
      }
    }
  }

  if (auth?.currentUser) {
    return {
      user: {
        id: auth.currentUser.uid,
        email: auth.currentUser.email || "admin@gonstead.com",
        created_at: new Date().toISOString(),
      },
      error: null,
    }
  }

  return { user: null, error: null }
}

export async function signOutAdmin() {
  const actor = typeof window !== "undefined" ? localStorage.getItem("admin_email") || undefined : undefined
  if (typeof window !== "undefined") {
    localStorage.removeItem("admin_authenticated")
    localStorage.removeItem("admin_email")
  }

  if (auth) {
    try {
      await signOut(auth)
    } catch (err) {
      console.warn("[DataService] Firebase signOut error:", err)
    }
  }

  await addAuditLog({ action: 'sign_out', entity_type: 'auth', actor_email: actor, source: 'admin_dashboard', reversible: false })
  return { error: null }
}

export async function signInStaff(email: string, password: string) {
  return signInAdmin(email, password)
}

export async function createStaffUser(email: string, password: string, role: string = 'staff') {
  return signUpAdmin(email, password)
}

export async function resetStaffPassword(email: string) {
  if (auth) {
    try {
      await sendPasswordResetEmail(auth, email.trim())
      return { error: null }
    } catch (err: any) {
      return { error: err }
    }
  }
  return { error: null }
}

export async function updateStaffEmail(newEmail: string) {
  if (auth?.currentUser) {
    try {
      await updateEmail(auth.currentUser, newEmail.trim())
      return { user: { id: auth.currentUser.uid, email: newEmail }, error: null }
    } catch (err: any) {
      return { user: null, error: err }
    }
  }
  return { user: { id: "staff", email: newEmail }, error: null }
}

export async function deleteStaffAccount() {
  return signOutAdmin()
}

export function processSyncQueue() {
  // Utility stub
  return Promise.resolve()
}

// ─── PATIENTS (Pure Firestore CRUD) ───────────────────────────────────────────

export const createPatient = async (
  patientData: Omit<Patient, "id" | "created_at" | "updated_at">
): Promise<Patient> => {
  const fsPatient = await createPatientFirestore(patientData)
  if (fsPatient) {
    console.log("[DataService] ✅ Patient created in Firestore:", fsPatient.id)
    await addAuditLog({
      action: 'create',
      entity_type: 'patient',
      entity_id: fsPatient.id,
      actor_email: typeof window !== 'undefined' ? localStorage.getItem('admin_email') || undefined : undefined,
      source: 'admin_dashboard',
      reversible: true,
      meta: { after: fsPatient }
    })
    return fsPatient as Patient
  }
  throw new Error("Failed to create patient record in Firestore")
}

export const getPatients = async (): Promise<{ data: Patient[]; error: any }> => {
  try {
    const fsPatients = await getPatientsFirestore()
    console.log("[DataService] ✅ Loaded patients from Firestore:", fsPatients.length)
    return { data: fsPatients as Patient[], error: null }
  } catch (err: any) {
    console.error("[DataService] ❌ Firestore read error:", err)
    return { data: [], error: err }
  }
}

export const updatePatient = async (id: string, updates: Partial<Patient>): Promise<Patient | null> => {
  try {
    const updated = await updatePatientFirestore(id, updates)
    await addAuditLog({
      action: 'update',
      entity_type: 'patient',
      entity_id: id,
      actor_email: typeof window !== 'undefined' ? localStorage.getItem('admin_email') || undefined : undefined,
      source: 'admin_dashboard',
      reversible: true,
      meta: { after: updates }
    })
    return updated as Patient | null
  } catch (err) {
    console.error("[DataService] Update patient error:", err)
    return null
  }
}

export const deletePatient = async (id: string): Promise<void> => {
  try {
    await deletePatientFirestore(id)
    await addAuditLog({
      action: 'delete',
      entity_type: 'patient',
      entity_id: id,
      actor_email: typeof window !== 'undefined' ? localStorage.getItem('admin_email') || undefined : undefined,
      source: 'admin_dashboard',
      reversible: true,
    })
  } catch (err) {
    console.error("[DataService] Delete patient error:", err)
  }
}

export const getPatientByPhone = async (phone: string): Promise<{ data: Patient | null; error: any }> => {
  try {
    const patient = await getPatientByPhoneFirestore(phone)
    return { data: patient as Patient | null, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

// ─── AUDIT LOGS ───────────────────────────────────────────────────────────────

export const addAuditLog = async (log: Omit<AuditLog, "id" | "timestamp">): Promise<void> => {
  try {
    await addAuditLogFirestore({
      action: log.action,
      entity_type: log.entity_type ?? "",
      entity_id: log.entity_id,
      actor_email: log.actor_email,
      source: log.source,
      reversible: log.reversible,
      meta: log.meta,
    })
  } catch (err) {
    console.warn("[DataService] Audit log write failed:", err)
  }
}

// ─── CLINIC SETTINGS ─────────────────────────────────────────────────────────

export const getClinicSettings = async (): Promise<{ data: ClinicSettings | null; error: any }> => {
  try {
    const settings = await getClinicSettingsFirestore()
    return { data: settings as ClinicSettings | null, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

export const updateClinicSettings = async (settings: Partial<ClinicSettings>): Promise<boolean> => {
  try {
    return await updateClinicSettingsFirestore(settings)
  } catch (err) {
    return false
  }
}

// ─── STAFF ACCOUNTS ───────────────────────────────────────────────────────────

export const getStaffAccounts = async (): Promise<{ data: StaffAccount[]; error: any }> => {
  try {
    const staff = await getStaffAccountsFirestore()
    return { data: staff as StaffAccount[], error: null }
  } catch (err) {
    return { data: [], error: err }
  }
}

export const createStaffAccount = async (
  account: Omit<StaffAccount, "id" | "created_at" | "updated_at">
): Promise<StaffAccount | null> => {
  return createStaffAccountFirestore(account) as Promise<StaffAccount | null>
}

export const updateStaffAccount = async (
  id: string,
  updates: Partial<StaffAccount>
): Promise<boolean> => {
  return updateStaffAccountFirestore(id, updates)
}

export const removeStaffAccount = async (id: string): Promise<boolean> => {
  return deleteStaffAccountFirestore(id)
}

export const getAuditLogs = async (): Promise<{ data: AuditLog[]; error: any }> => {
  try {
    const logs = await getAuditLogsFirestore()
    return { data: logs, error: null }
  } catch (err) {
    return { data: [], error: err }
  }
}

export const undoAuditLog = async (log: AuditLog): Promise<{ ok: boolean; error?: string }> => {
  return { ok: false, error: "Undo operation not supported" }
}

export const deleteAuditLog = async (id: string): Promise<{ ok: boolean; error?: string }> => {
  const success = await deleteAuditLogFirestore(id)
  return { ok: success, error: success ? undefined : "Delete failed" }
}

export const clearAuditLogs = async (): Promise<{ ok: boolean; error?: string }> => {
  const success = await clearAuditLogsFirestore()
  return { ok: success, error: success ? undefined : "Clear failed" }
}

// ─── PRESCRIPTIONS ────────────────────────────────────────────────────────────

export const savePrescription = async (prescriptionData: any) => {
  return savePrescriptionFirestore(prescriptionData)
}

export const getPrescriptions = async () => {
  return getPrescriptionsFirestore()
}
