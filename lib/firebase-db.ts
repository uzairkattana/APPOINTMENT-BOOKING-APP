/**
 * Firebase Firestore CRUD Layer (Safe Null-Guarded)
 * Mirrors the API surface of lib/supabase.ts so it can be used as a drop-in replacement.
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "./firebase"

export interface Patient {
  id: string
  name: string
  phone: string
  email?: string
  profession?: string
  session_type: "in_clinic" | "video"
  appointment_date: string
  appointment_time?: string
  chief_complaint?: string
  status: "pending" | "confirmed" | "completed" | "cancelled" | "scheduled"
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

// ─── Collection names ───────────────────────────────────────────────────────
const PATIENTS = "patients"
const STAFF = "staff_accounts"
const AUDIT_LOGS = "audit_logs"
const CLINIC_SETTINGS = "clinic_settings"
const APPOINTMENT_QUEUE = "appointment_queue"

function stripUndefined(obj: Record<string, any>): Record<string, any> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined))
}

// ─── PATIENTS ─────────────────────────────────────────────────────────────────

export async function createPatientFirestore(
  patient: Omit<Patient, "id" | "created_at" | "updated_at"> & { id?: string }
): Promise<Patient | null> {
  if (!db) {
    console.warn("[Firestore] ⚠️ Database not initialized, skipping createPatientFirestore")
    return null
  }
  try {
    const now = new Date().toISOString()
    const patientRef = patient.id ? doc(db, PATIENTS, patient.id) : doc(collection(db, PATIENTS))
    const patientName =
      (patient as any).name ||
      (patient as any).patient_name ||
      (patient as any).full_name ||
      "Unnamed Patient"
    const payload = stripUndefined({
      ...patient,
      id: patientRef.id,
      name: patientName,
      patient_name: patientName,
      full_name: patientName,
      created_at: now,
      updated_at: now,
    })
    await setDoc(patientRef, payload)
    console.log("[Firestore] ✅ Patient created:", patientRef.id)
    return payload as unknown as Patient
  } catch (error) {
    console.error("[Firestore] ❌ createPatient failed:", error)
    return null
  }
}

export function normalizeFirestorePatient(docId: string, data: Record<string, any>): Patient {
  const patientName =
    data.patient_name ||
    data.name ||
    data.full_name ||
    data.fullName ||
    data.patientName ||
    data.Name ||
    data.PatientName ||
    "Unnamed Patient"

  const phone =
    data.phone ||
    data.mobile ||
    data.phone_number ||
    data.phoneNumber ||
    data.Phone ||
    ""

  const created_at =
    data.created_at ||
    data.createdAt ||
    data.timestamp ||
    data.date ||
    new Date().toISOString()

  return {
    id: docId,
    name: patientName,
    patient_name: patientName,
    full_name: patientName,
    phone: String(phone),
    gender: data.gender || data.Gender || "not_specified",
    age: Number(data.age || data.Age || 0),
    dob: data.dob || data.date_of_birth || data.dateOfBirth || "",
    address: data.address || data.Address || "",
    city: data.city || data.City || "",
    chief_complaint: data.chief_complaint || data.chiefComplaint || data.complaint || "",
    notes: data.notes || data.Notes || "",
    status: data.status || data.Status || "scheduled",
    appointment_date: data.appointment_date || data.appointmentDate || data.date || new Date().toISOString().split("T")[0],
    appointment_time: data.appointment_time || data.appointmentTime || data.time || "10:00 AM",
    payment_status: data.payment_status || data.paymentStatus || "pending",
    payment_method: data.payment_method || data.paymentMethod || "cash",
    fee_amount: Number(data.fee_amount || data.feeAmount || data.fee || 0),
    cnic: data.cnic || data.CNIC || "",
    created_at,
    updated_at: data.updated_at || data.updatedAt || created_at,
  } as unknown as Patient
}

export async function getPatientsFirestore(): Promise<Patient[]> {
  if (!db) {
    console.warn("[Firestore] ⚠️ Database not initialized, skipping getPatientsFirestore")
    return []
  }
  try {
    const patientsMap = new Map<string, Patient>()
    const candidateCollections = ["patients", "Patients", "patient_records", "appointments"]

    for (const colName of candidateCollections) {
      try {
        const snap = await getDocs(collection(db, colName))
        snap.docs.forEach((d) => {
          if (!patientsMap.has(d.id)) {
            const normalized = normalizeFirestorePatient(d.id, d.data())
            patientsMap.set(d.id, normalized)
          }
        })
      } catch (e) {
        // Skip missing collections
      }
    }

    let patients = Array.from(patientsMap.values())

    // If Firestore is empty, auto-seed an initial demo patient directly into Firestore!
    if (patients.length === 0 && db) {
      console.log("[Firestore] ℹ️ Collection is empty. Auto-seeding initial patient record into Firestore...")
      try {
        const seedRef = doc(collection(db, PATIENTS))
        const seedData = {
          id: seedRef.id,
          patient_name: "Dr. Bashir Khan (Demo)",
          full_name: "Dr. Bashir Khan (Demo)",
          phone: "+92 300 1234567",
          gender: "Male",
          age: 45,
          dob: "1979-05-15",
          address: "Clinic Central Suite 101",
          city: "Lahore",
          chief_complaint: "Lumbar Subluxation & Postural Fatigue",
          notes: "Initial Gonstead Chiropractic assessment completed.",
          status: "scheduled",
          appointment_date: new Date().toISOString().split("T")[0],
          appointment_time: "10:30 AM",
          payment_status: "paid",
          payment_method: "cash",
          fee_amount: 3500,
          cnic: "35202-1234567-1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        await setDoc(seedRef, seedData)
        patients = [normalizeFirestorePatient(seedRef.id, seedData)]
        console.log("[Firestore] ✅ Successfully seeded initial patient record into Firestore:", seedRef.id)
      } catch (seedErr) {
        console.warn("[Firestore] Auto-seed note:", seedErr)
      }
    }

    patients.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    console.log("[Firestore] ✅ Total fetched & normalized patients from Firestore:", patients.length)
    return patients
  } catch (error) {
    console.error("[Firestore] ❌ getPatients failed:", error)
    return []
  }
}

export async function getPatientByIdFirestore(id: string): Promise<Patient | null> {
  if (!db) return null
  try {
    const snap = await getDoc(doc(db, PATIENTS, id))
    if (!snap.exists()) return null
    return { ...snap.data(), id: snap.id } as Patient
  } catch (error) {
    console.error("[Firestore] ❌ getPatientById failed:", error)
    return null
  }
}

export async function updatePatientFirestore(
  id: string,
  updates: Partial<Patient>
): Promise<Patient | null> {
  if (!db) return null
  try {
    const ref = doc(db, PATIENTS, id)
    const payload = stripUndefined({ ...updates, updated_at: new Date().toISOString() })
    await updateDoc(ref, payload)
    const updated = await getDoc(ref)
    console.log("[Firestore] ✅ Patient updated:", id)
    return updated.exists() ? ({ ...updated.data(), id: updated.id } as Patient) : null
  } catch (error) {
    console.error("[Firestore] ❌ updatePatient failed:", error)
    return null
  }
}

export async function deletePatientFirestore(id: string): Promise<boolean> {
  if (!db) return false
  try {
    await deleteDoc(doc(db, PATIENTS, id))
    console.log("[Firestore] ✅ Patient deleted:", id)
    return true
  } catch (error) {
    console.error("[Firestore] ❌ deletePatient failed:", error)
    return false
  }
}

/** Real-time listener for patients collection */
export function subscribeToPatients(
  callback: (patients: Patient[]) => void
): Unsubscribe {
  if (!db) {
    console.warn("[Firestore] ⚠️ Database not initialized, subscribeToPatients disabled")
    return () => { }
  }
  const q = query(collection(db, PATIENTS), orderBy("created_at", "desc"))
  return onSnapshot(
    q,
    (snapshot) => {
      const patients = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as Patient)
      console.log("[Firestore] 🔄 Real-time patients update:", patients.length)
      callback(patients)
    },
    (error) => {
      console.error("[Firestore] ❌ onSnapshot error:", error)
    }
  )
}

// ─── APPOINTMENT QUEUE ────────────────────────────────────────────────────────

export async function upsertAppointmentQueueFirestore(entry: {
  appointment_id: string
  patient_id: string
  patient_name: string
  patient_phone: string
  appointment_date: string
  status: string
}): Promise<boolean> {
  if (!db) return false
  try {
    const ref = doc(db, APPOINTMENT_QUEUE, entry.appointment_id)
    await setDoc(ref, { ...entry, updated_at: new Date().toISOString() }, { merge: true })
    console.log("[Firestore] ✅ Appointment queue updated:", entry.appointment_id)
    return true
  } catch (error) {
    console.error("[Firestore] ❌ upsertAppointmentQueue failed:", error)
    return false
  }
}

// ─── AUDIT LOGS ───────────────────────────────────────────────────────────────

export async function addAuditLogFirestore(entry: {
  action: string
  entity_type: string
  entity_id?: string
  actor_email?: string
  source?: string
  reversible?: boolean
  meta?: Record<string, any>
}): Promise<boolean> {
  if (!db) return false
  try {
    await addDoc(collection(db, AUDIT_LOGS), {
      ...entry,
      created_at: new Date().toISOString(),
    })
    return true
  } catch (error) {
    console.error("[Firestore] ❌ addAuditLog failed:", error)
    return false
  }
}

export async function getAuditLogsFirestore(): Promise<any[]> {
  if (!db) return []
  try {
    const snapshot = await getDocs(collection(db, AUDIT_LOGS))
    return snapshot.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        ...data,
        timestamp: data.created_at || data.timestamp || new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error("[Firestore] ❌ getAuditLogs failed:", error)
    return []
  }
}

export async function deleteAuditLogFirestore(id: string): Promise<boolean> {
  if (!db) return false
  try {
    await deleteDoc(doc(db, AUDIT_LOGS, id))
    return true
  } catch (error) {
    console.error("[Firestore] ❌ deleteAuditLog failed:", error)
    return false
  }
}

export async function clearAuditLogsFirestore(): Promise<boolean> {
  if (!db) return false
  try {
    const snapshot = await getDocs(collection(db, AUDIT_LOGS))
    const batch = Array.from(snapshot.docs).map((d) => deleteDoc(d.ref))
    await Promise.all(batch)
    return true
  } catch (error) {
    console.error("[Firestore] ❌ clearAuditLogs failed:", error)
    return false
  }
}

// ─── CLINIC SETTINGS ─────────────────────────────────────────────────────────

export async function getClinicSettingsFirestore(): Promise<ClinicSettings | null> {
  if (!db) return null
  try {
    const snap = await getDoc(doc(db, CLINIC_SETTINGS, "main"))
    if (!snap.exists()) return null
    return { ...snap.data(), id: snap.id } as ClinicSettings
  } catch (error) {
    console.error("[Firestore] ❌ getClinicSettings failed:", error)
    return null
  }
}

export async function updateClinicSettingsFirestore(
  updates: Partial<ClinicSettings>
): Promise<boolean> {
  if (!db) return false
  try {
    const ref = doc(db, CLINIC_SETTINGS, "main")
    await setDoc(
      ref,
      stripUndefined({ ...updates, updated_at: new Date().toISOString() }),
      { merge: true }
    )
    console.log("[Firestore] ✅ Clinic settings updated")
    return true
  } catch (error) {
    console.error("[Firestore] ❌ updateClinicSettings failed:", error)
    return false
  }
}

// ─── STAFF ACCOUNTS ───────────────────────────────────────────────────────────

export async function getStaffAccountsFirestore(): Promise<StaffAccount[]> {
  if (!db) return []
  try {
    const snapshot = await getDocs(collection(db, STAFF))
    return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as StaffAccount)
  } catch (error) {
    console.error("[Firestore] ❌ getStaffAccounts failed:", error)
    return []
  }
}

export async function createStaffAccountFirestore(
  staff: Omit<StaffAccount, "id" | "created_at" | "updated_at"> & { id?: string }
): Promise<StaffAccount | null> {
  if (!db) return null
  try {
    const now = new Date().toISOString()
    const ref = staff.id ? doc(db, STAFF, staff.id) : doc(collection(db, STAFF))
    const payload = stripUndefined({ ...staff, id: ref.id, created_at: now, updated_at: now })
    await setDoc(ref, payload)
    return payload as StaffAccount
  } catch (error) {
    console.error("[Firestore] ❌ createStaffAccount failed:", error)
    return null
  }
}

export async function updateStaffAccountFirestore(
  id: string,
  updates: Partial<StaffAccount>
): Promise<boolean> {
  if (!db) return false
  try {
    await updateDoc(doc(db, STAFF, id), stripUndefined({ ...updates, updated_at: new Date().toISOString() }))
    return true
  } catch (error) {
    console.error("[Firestore] ❌ updateStaffAccount failed:", error)
    return false
  }
}

export async function deleteStaffAccountFirestore(id: string): Promise<boolean> {
  if (!db) return false
  try {
    await deleteDoc(doc(db, STAFF, id))
    return true
  } catch (error) {
    console.error("[Firestore] ❌ deleteStaffAccount failed:", error)
    return false
  }
}

// ─── PATIENT SEARCH BY PHONE ──────────────────────────────────────────────────

export async function getPatientByPhoneFirestore(phone: string): Promise<Patient | null> {
  if (!db || !phone) return null
  try {
    const q = query(collection(db, PATIENTS), where("phone", "==", phone.trim()))
    const snapshot = await getDocs(q)
    if (!snapshot.empty) {
      const docData = snapshot.docs[0]
      return normalizeFirestorePatient(docData.id, docData.data())
    }
    return null
  } catch (error) {
    console.error("[Firestore] ❌ getPatientByPhone failed:", error)
    return null
  }
}

// ─── PRESCRIPTIONS ────────────────────────────────────────────────────────────

export async function savePrescriptionFirestore(prescriptionData: any): Promise<any> {
  if (!db) return null
  try {
    const id = prescriptionData.id || `presc_${Date.now()}`
    const ref = doc(db, "prescriptions", id)
    const payload = stripUndefined({
      ...prescriptionData,
      id,
      created_at: new Date().toISOString(),
    })
    await setDoc(ref, payload, { merge: true })
    console.log("[Firestore] ✅ Prescription saved:", id)
    return payload
  } catch (error) {
    console.error("[Firestore] ❌ savePrescription failed:", error)
    return null
  }
}

export async function getPrescriptionsFirestore(): Promise<any[]> {
  if (!db) return []
  try {
    const snapshot = await getDocs(collection(db, "prescriptions"))
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (error) {
    console.error("[Firestore] ❌ getPrescriptions failed:", error)
    return []
  }
}

// ─── PAYMENT RECORDS ─────────────────────────────────────────────────────────

export async function getPaymentRecordsFirestore(limitCount: number = 200, offsetCount: number = 0): Promise<{ items: any[]; total: number }> {
  if (!db) return { items: [], total: 0 }
  try {
    const snapshot = await getDocs(collection(db, "payment_records"))
    const all = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    const items = all.slice(offsetCount, offsetCount + limitCount)
    return { items, total: all.length }
  } catch (error) {
    console.error("[Firestore] ❌ getPaymentRecords failed:", error)
    return { items: [], total: 0 }
  }
}

export async function createPaymentRecordFirestore(recordData: any): Promise<any> {
  if (!db) return null
  try {
    const ref = doc(collection(db, "payment_records"))
    const payload = stripUndefined({
      ...recordData,
      id: ref.id,
      transaction_id: recordData.transaction_id || ref.id,
      created_at: new Date().toISOString(),
    })
    await setDoc(ref, payload)
    return payload
  } catch (error) {
    console.error("[Firestore] ❌ createPaymentRecord failed:", error)
    return null
  }
}

export async function updatePaymentRecordFirestore(transactionId: string, updates: any): Promise<any> {
  if (!db || !transactionId) return null
  try {
    const q = query(collection(db, "payment_records"), where("transaction_id", "==", transactionId))
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    const targetDoc = snapshot.docs[0]
    await updateDoc(targetDoc.ref, stripUndefined({ ...updates, updated_at: new Date().toISOString() }))
    return { id: targetDoc.id, ...targetDoc.data(), ...updates }
  } catch (error) {
    console.error("[Firestore] ❌ updatePaymentRecord failed:", error)
    return null
  }
}

export async function deletePaymentRecordFirestore(transactionId: string): Promise<boolean> {
  if (!db || !transactionId) return false
  try {
    const q = query(collection(db, "payment_records"), where("transaction_id", "==", transactionId))
    const snapshot = await getDocs(q)
    if (snapshot.empty) return false
    await deleteDoc(snapshot.docs[0].ref)
    return true
  } catch (error) {
    console.error("[Firestore] ❌ deletePaymentRecord failed:", error)
    return false
  }
}

