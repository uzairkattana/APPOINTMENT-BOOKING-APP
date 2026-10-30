/**
 * Firestore Real-Time Patient-Doctor-Staff WhatsApp-Style Chat Service
 * Handles 1-on-1 private messaging channels between patients & Dr. Bashir Khan,
 * as well as a dedicated internal Staff-Doctor communication channel.
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore"
import { db } from "./firebase"

export interface ChatThread {
  id: string
  patient_id: string
  patient_name: string
  patient_phone: string
  patient_email: string
  last_message: string
  last_updated: string
  unread_doctor_count: number
  unread_patient_count: number
  created_at: string
  is_staff_internal?: boolean
}

export interface ChatMessage {
  id: string
  sender: "patient" | "doctor" | "staff"
  sender_name: string
  text: string
  created_at: string
  read: boolean
}

const CHATS_COLLECTION = "patient_chats"
const MESSAGES_SUBCOLLECTION = "messages"
export const STAFF_DOCTOR_CHAT_ID = "chat_staff_doctor_internal"

/**
 * Extract clean 10-digit normalized phone string (handles +92, 0300, 0304-699-6267, etc.)
 */
export function normalizePhone(phone?: string): string {
  if (!phone) return ""
  const digits = phone.replace(/\D/g, "")
  if (digits.length >= 7) {
    return digits.slice(-10)
  }
  return ""
}

/**
 * Extract clean normalized email string.
 */
export function normalizeEmail(email?: string): string {
  if (!email || !email.trim()) return ""
  const clean = email.trim().toLowerCase()
  if (clean === "guest@clinic.com" || clean === "patient_guest" || clean === "no email provided") {
    return ""
  }
  return clean.replace(/[^a-z0-9]/g, "_")
}

/**
 * Generate a clean, single static Chat Document ID for a patient across all portals.
 */
export function getPatientChatId(patientId: string, email?: string, phone?: string): string {
  if (!patientId) return "chat_patient_guest"
  if (patientId.startsWith("chat_")) return patientId.trim()

  const phoneKey = normalizePhone(phone)
  if (phoneKey) {
    return `chat_p_${phoneKey}`
  }

  const emailKey = normalizeEmail(email)
  if (emailKey) {
    return `chat_e_${emailKey}`
  }

  const embeddedPhone = normalizePhone(patientId)
  if (embeddedPhone) {
    return `chat_p_${embeddedPhone}`
  }

  const embeddedEmail = normalizeEmail(patientId)
  if (embeddedEmail) {
    return `chat_e_${embeddedEmail}`
  }

  const cleanId = patientId.trim().toLowerCase().replace(/[^a-z0-9]/g, "_")
  if (cleanId && cleanId !== "patient_guest" && !cleanId.startsWith("guest_")) {
    return `chat_id_${cleanId}`
  }

  return `chat_patient_guest`
}

/**
 * Ensure a single unified chat thread document exists for a given patient.
 */
export async function getOrCreateChatThread(params: {
  patient_id: string
  patient_name: string
  patient_phone: string
  patient_email: string
}): Promise<ChatThread> {
  const chatId = getPatientChatId(params.patient_id, params.patient_email, params.patient_phone)
  if (!db) {
    return {
      id: chatId,
      patient_id: params.patient_id,
      patient_name: params.patient_name || "Patient",
      patient_phone: params.patient_phone || "",
      patient_email: params.patient_email || "",
      last_message: "",
      last_updated: new Date().toISOString(),
      unread_doctor_count: 0,
      unread_patient_count: 0,
      created_at: new Date().toISOString(),
    }
  }
  const chatRef = doc(db, CHATS_COLLECTION, chatId)

  try {
    const snap = await getDoc(chatRef)
    if (snap.exists()) {
      const data = snap.data()
      const updates: Partial<ChatThread> = {}
      if (params.patient_phone && (!data.patient_phone || data.patient_phone !== params.patient_phone)) {
        updates.patient_phone = params.patient_phone
      }
      if (params.patient_name && data.patient_name === "Patient" && params.patient_name !== "Patient") {
        updates.patient_name = params.patient_name
      }
      if (Object.keys(updates).length > 0) {
        await updateDoc(chatRef, updates)
      }
      return { id: snap.id, ...data, ...updates } as ChatThread
    }

    const now = new Date().toISOString()
    const newThread: ChatThread = {
      id: chatId,
      patient_id: params.patient_id,
      patient_name: params.patient_name || "Patient",
      patient_phone: params.patient_phone || "",
      patient_email: params.patient_email || "",
      last_message: "Chat thread initialized. How can Dr. Bashir Khan help your spinal health today?",
      last_updated: now,
      unread_doctor_count: 0,
      unread_patient_count: 0,
      created_at: now,
    }

    await setDoc(chatRef, newThread)
    return newThread
  } catch (err) {
    console.error("getOrCreateChatThread error:", err)
    return {
      id: chatId,
      patient_id: params.patient_id,
      patient_name: params.patient_name,
      patient_phone: params.patient_phone,
      patient_email: params.patient_email,
      last_message: "",
      last_updated: new Date().toISOString(),
      unread_doctor_count: 0,
      unread_patient_count: 0,
      created_at: new Date().toISOString(),
    }
  }
}

/**
 * Subscribe to real-time messages for a specific chat thread.
 */
export function subscribeToChatMessages(
  chatId: string,
  callback: (messages: ChatMessage[]) => void
): Unsubscribe {
  if (!db || !chatId) return () => {}

  const messagesRef = collection(db, CHATS_COLLECTION, chatId, MESSAGES_SUBCOLLECTION)
  const q = query(messagesRef, orderBy("created_at", "asc"))

  return onSnapshot(
    q,
    (snapshot) => {
      const msgs: ChatMessage[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<ChatMessage, "id">),
      }))
      callback(msgs)
    },
    (err) => {
      console.warn("subscribeToChatMessages snapshot note:", err)
      callback([])
    }
  )
}

/**
 * Subscribe to all patient chat threads (For Doctor / Admin WhatsApp Inbox view).
 * Excludes internal staff chats from patient list, and appends Pinned Staff Desk at top.
 */
export function subscribeToAllPatientChats(
  callback: (threads: ChatThread[]) => void
): Unsubscribe {
  if (!db) return () => {}

  const chatsRef = collection(db, CHATS_COLLECTION)
  const q = query(chatsRef, orderBy("last_updated", "desc"))

  return onSnapshot(
    q,
    (snapshot) => {
      const threads: ChatThread[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ChatThread, "id">),
      }))

      // Separate staff internal thread from patient threads
      const patientThreads: ChatThread[] = []
      let staffInternalThread: ChatThread | null = null

      const threadMap = new Map<string, ChatThread>()

      for (const t of threads) {
        if (t.id === STAFF_DOCTOR_CHAT_ID || t.is_staff_internal) {
          staffInternalThread = t
          continue
        }

        const key = normalizePhone(t.patient_phone) || normalizeEmail(t.patient_email) || t.id
        if (!threadMap.has(key)) {
          threadMap.set(key, t)
        }
      }

      const deduplicatedPatients = Array.from(threadMap.values())

      // If staff internal thread exists, pin it at the top for Doctor
      const result: ChatThread[] = []
      if (staffInternalThread) {
        result.push({
          ...staffInternalThread,
          patient_name: "🏥 Staff Internal Desk (Doctor Only)",
          patient_phone: "Internal Clinic Chat",
          is_staff_internal: true,
        })
      } else {
        result.push({
          id: STAFF_DOCTOR_CHAT_ID,
          patient_id: "staff_internal",
          patient_name: "🏥 Staff Internal Desk (Doctor Only)",
          patient_phone: "Internal Clinic Chat",
          patient_email: "staff@clinic.com",
          last_message: "Direct internal desk messaging channel between Clinic Staff and Dr. Bashir Khan",
          last_updated: new Date().toISOString(),
          unread_doctor_count: 0,
          unread_patient_count: 0,
          created_at: new Date().toISOString(),
          is_staff_internal: true,
        })
      }

      result.push(...deduplicatedPatients)
      callback(result)
    },
    (err) => {
      console.warn("subscribeToAllPatientChats note:", err)
      callback([])
    }
  )
}

/**
 * Send a message from Patient to Doctor.
 */
export async function sendPatientChatMessage(params: {
  chatId: string
  patientName: string
  text: string
}): Promise<boolean> {
  if (!db || !params.chatId || !params.text.trim()) return false

  const cleanText = params.text.trim()
  const now = new Date().toISOString()

  try {
    const messagesRef = collection(db, CHATS_COLLECTION, params.chatId, MESSAGES_SUBCOLLECTION)
    await addDoc(messagesRef, {
      sender: "patient",
      sender_name: params.patientName || "Patient",
      text: cleanText,
      created_at: now,
      read: false,
    })

    const chatRef = doc(db, CHATS_COLLECTION, params.chatId)
    const snap = await getDoc(chatRef)
    const currentUnread = snap.exists() ? (snap.data().unread_doctor_count || 0) : 0

    await updateDoc(chatRef, {
      last_message: cleanText,
      last_updated: now,
      unread_doctor_count: currentUnread + 1,
    })

    return true
  } catch (err) {
    console.error("sendPatientChatMessage error:", err)
    return false
  }
}

/**
 * Send a message from Doctor to Patient or Staff.
 */
export async function sendDoctorChatMessage(params: {
  chatId: string
  doctorName?: string
  text: string
}): Promise<boolean> {
  if (!db || !params.chatId || !params.text.trim()) return false

  const cleanText = params.text.trim()
  const now = new Date().toISOString()
  const docName = params.doctorName || "Dr. Bashir Khan"

  try {
    const messagesRef = collection(db, CHATS_COLLECTION, params.chatId, MESSAGES_SUBCOLLECTION)
    await addDoc(messagesRef, {
      sender: "doctor",
      sender_name: docName,
      text: cleanText,
      created_at: now,
      read: false,
    })

    const chatRef = doc(db, CHATS_COLLECTION, params.chatId)
    const snap = await getDoc(chatRef)
    const currentUnread = snap.exists() ? (snap.data().unread_patient_count || 0) : 0

    await updateDoc(chatRef, {
      last_message: `${docName}: ${cleanText}`,
      last_updated: now,
      unread_doctor_count: 0,
      unread_patient_count: currentUnread + 1,
    })

    return true
  } catch (err) {
    console.error("sendDoctorChatMessage error:", err)
    return false
  }
}

/**
 * Send a message from Staff to Doctor ONLY (Internal Staff Desk).
 */
export async function sendStaffDoctorChatMessage(params: {
  staffName?: string
  text: string
}): Promise<boolean> {
  if (!db || !params.text.trim()) return false

  const cleanText = params.text.trim()
  const now = new Date().toISOString()
  const sName = params.staffName || "Staff Member"
  const chatId = STAFF_DOCTOR_CHAT_ID

  try {
    // Ensure thread doc exists
    const chatRef = doc(db, CHATS_COLLECTION, chatId)
    const snap = await getDoc(chatRef)
    if (!snap.exists()) {
      await setDoc(chatRef, {
        id: chatId,
        patient_id: "staff_internal",
        patient_name: "🏥 Staff Internal Desk (Doctor Only)",
        patient_phone: "Internal Clinic Chat",
        patient_email: "staff@clinic.com",
        last_message: `${sName} (Staff): ${cleanText}`,
        last_updated: now,
        unread_doctor_count: 1,
        unread_patient_count: 0,
        created_at: now,
        is_staff_internal: true,
      })
    }

    const messagesRef = collection(db, CHATS_COLLECTION, chatId, MESSAGES_SUBCOLLECTION)
    await addDoc(messagesRef, {
      sender: "staff",
      sender_name: sName,
      text: cleanText,
      created_at: now,
      read: false,
    })

    const currentUnreadDoc = snap.exists() ? (snap.data().unread_doctor_count || 0) : 0

    await updateDoc(chatRef, {
      last_message: `${sName} (Staff): ${cleanText}`,
      last_updated: now,
      unread_doctor_count: currentUnreadDoc + 1,
    })

    return true
  } catch (err) {
    console.error("sendStaffDoctorChatMessage error:", err)
    return false
  }
}

/**
 * Subscribe to real-time Staff-Doctor internal messages.
 */
export function subscribeToStaffDoctorChat(
  callback: (messages: ChatMessage[]) => void
): Unsubscribe {
  return subscribeToChatMessages(STAFF_DOCTOR_CHAT_ID, callback)
}

/**
 * Clear all messages in a specific chat thread.
 */
export async function clearChatThread(chatId: string): Promise<boolean> {
  if (!db || !chatId) return false
  const database = db
  try {
    const messagesRef = collection(database, CHATS_COLLECTION, chatId, MESSAGES_SUBCOLLECTION)
    const snapshot = await getDocs(messagesRef)
    const deletePromises = snapshot.docs.map((docSnap) =>
      deleteDoc(doc(database, CHATS_COLLECTION, chatId, MESSAGES_SUBCOLLECTION, docSnap.id))
    )
    await Promise.all(deletePromises)

    const chatRef = doc(database, CHATS_COLLECTION, chatId)
    await updateDoc(chatRef, {
      last_message: "Chat history cleared",
      unread_doctor_count: 0,
      unread_patient_count: 0,
      last_updated: new Date().toISOString(),
    })
    return true
  } catch (err) {
    console.error("clearChatThread error:", err)
    return false
  }
}

/**
 * Completely delete an entire patient chat thread document and all its subcollection messages.
 */
export async function deleteEntireChatThread(chatId: string): Promise<boolean> {
  if (!db || !chatId) return false
  const database = db
  try {
    const messagesRef = collection(database, CHATS_COLLECTION, chatId, MESSAGES_SUBCOLLECTION)
    const snapshot = await getDocs(messagesRef)
    const deletePromises = snapshot.docs.map((docSnap) =>
      deleteDoc(doc(database, CHATS_COLLECTION, chatId, MESSAGES_SUBCOLLECTION, docSnap.id))
    )
    await Promise.all(deletePromises)

    const chatRef = doc(database, CHATS_COLLECTION, chatId)
    await deleteDoc(chatRef)
    return true
  } catch (err) {
    console.error("deleteEntireChatThread error:", err)
    return false
  }
}

/**
 * Clear all messages across all patient chat threads.
 */
export async function clearAllChatThreads(): Promise<boolean> {
  if (!db) return false
  const database = db
  try {
    const chatsRef = collection(database, CHATS_COLLECTION)
    const snapshot = await getDocs(chatsRef)
    const promises = snapshot.docs.map((d) => deleteEntireChatThread(d.id))
    await Promise.all(promises)
    return true
  } catch (err) {
    console.error("clearAllChatThreads error:", err)
    return false
  }
}

/**
 * Mark messages in a chat thread as read by Doctor.
 */
export async function markChatReadByDoctor(chatId: string) {
  if (!db || !chatId) return
  try {
    const chatRef = doc(db, CHATS_COLLECTION, chatId)
    await updateDoc(chatRef, { unread_doctor_count: 0 })
  } catch (e) {}
}

/**
 * Mark messages in a chat thread as read by Patient.
 */
export async function markChatReadByPatient(chatId: string) {
  if (!db || !chatId) return
  try {
    const chatRef = doc(db, CHATS_COLLECTION, chatId)
    await updateDoc(chatRef, { unread_patient_count: 0 })
  } catch (e) {}
}
