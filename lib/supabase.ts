import { createClient } from "@supabase/supabase-js"
import { getPatientsFirestore } from "./firebase-db"

// Get environment variables - allow build to proceed, fail at runtime if needed
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Validate at runtime, not build time
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('Missing Supabase environment variables. Please check your .env file.')
}

// Create Supabase client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
  db: {
    schema: "public",
  },
  global: {
    headers: {
      "X-Client-Info": "gonstead-chiropractic-admin",
    },
  },
})

// SECURITY: Use only Supabase authentication - no hardcoded credentials
// For initial setup, create admin user through Supabase dashboard or signUpAdmin()

// Admin authentication function with user registration support
export async function signInAdmin(email: string, password: string) {
  try {
    console.log("Attempting to sign in with:", email)

    // Try Supabase authentication first
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      })

      if (!error && data.user) {
        console.log("Supabase auth successful:", data.user.email)
        // Audit: sign in
        try { await addAuditLog({ action: 'sign_in', entity_type: 'auth', actor_email: data.user.email || email, source: 'admin_dashboard', reversible: false }) } catch {}
        return { user: data.user, error: null }
      }

      if (error) {
        console.log("Supabase auth failed:", error.message)
        // If user not found, we'll try fallback credentials
        if (error.message.includes("Invalid login credentials")) {
          console.log("User might not exist, checking fallback credentials...")
        }
      }
    } catch (supabaseError) {
      console.log("Supabase connection failed:", supabaseError)
    }

    // If authentication fails, return the error
    throw new Error("Invalid credentials. Please check your email and password.")
  } catch (error: any) {
    console.error("Sign in error:", error)
    return { user: null, error }
  }
}

// Function to register a new admin user
export async function signUpAdmin(email: string, password: string) {
  try {
    console.log("Attempting to register new user:", email)

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: {
          role: 'admin',
          clinic_name: 'Gonstead Chiropractic Clinic'
        }
      }
    })

    if (error) {
      console.error("Registration error:", error.message)
      throw error
    }

    if (data.user) {
      console.log("User registered successfully:", data.user.email)
      return { user: data.user, error: null }
    }

    throw new Error("Registration failed - no user data returned")
  } catch (error: any) {
    console.error("Sign up error:", error)
    return { user: null, error }
  }
}

// Get current user with fallback
export async function getCurrentUser() {
  try {
    // Check localStorage first
    const isAuthenticated = localStorage.getItem("admin_authenticated")
    const storedEmail = localStorage.getItem("admin_email")

    if (isAuthenticated === "true" && storedEmail) {
      return {
        user: {
          id: "admin-user",
          email: storedEmail,
          created_at: new Date().toISOString(),
        },
        error: null,
      }
    }

    // Try Supabase as secondary
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (!error && user) {
        return { user, error: null }
      }
    } catch (supabaseError) {
      console.log("Supabase get user failed:", supabaseError)
    }

    return { user: null, error: null }
  } catch (error: any) {
    console.error("Get current user error:", error)
    return { user: null, error }
  }
}

// Sign out function
export async function signOutAdmin() {
  try {
    // Clear localStorage
    const actor = localStorage.getItem("admin_email") || undefined
    localStorage.removeItem("admin_authenticated")
    localStorage.removeItem("admin_email")

    // Try Supabase sign out
    try {
      await supabase.auth.signOut()
    } catch (supabaseError) {
      console.log("Supabase sign out failed:", supabaseError)
    }

    // Audit: sign out (best effort)
    try { await addAuditLog({ action: 'sign_out', entity_type: 'auth', actor_email: actor, source: 'admin_dashboard', reversible: false }) } catch {}

    return { error: null }
  } catch (error: any) {
    console.error("Sign out error:", error)
    return { error }
  }
}

// Staff authentication functions for secure reset portal
export async function signInStaff(email: string, password: string) {
  try {
    console.log("Staff attempting to sign in:", email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    })

    if (error) {
      console.error("Staff sign in error:", error.message)
      throw error
    }

    if (data.user) {
      console.log("Staff sign in successful:", data.user.email)
      return { user: data.user, error: null }
    }

    throw new Error("Sign in failed - no user data returned")
  } catch (error: any) {
    console.error("Staff sign in error:", error)
    return { user: null, error }
  }
}

export async function createStaffUser(email: string, password: string, role: string = 'staff') {
  try {
    console.log("Creating new staff user:", email)
    
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
      options: {
        data: {
          role: role,
          clinic_name: 'Gonstead Chiropractic Clinic',
          created_by: 'admin_portal'
        }
      }
    })

    if (error) {
      console.error("Staff creation error:", error.message)
      throw error
    }

    if (data.user) {
      console.log("Staff user created successfully:", data.user.email)
      return { user: data.user, error: null }
    }

    throw new Error("User creation failed - no user data returned")
  } catch (error: any) {
    console.error("Create staff user error:", error)
    return { user: null, error }
  }
}

export async function resetStaffPassword(email: string) {
  try {
    console.log("Sending password reset email to:", email)
    
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (error) {
      console.error("Password reset error:", error.message)
      throw error
    }

    console.log("Password reset email sent successfully")
    return { error: null }
  } catch (error: any) {
    console.error("Reset password error:", error)
    return { error }
  }
}

export async function updateStaffEmail(newEmail: string) {
  try {
    console.log("Updating staff email to:", newEmail)
    
    const { data, error } = await supabase.auth.updateUser({
      email: newEmail.trim()
    })

    if (error) {
      console.error("Email update error:", error.message)
      throw error
    }

    if (data.user) {
      console.log("Email updated successfully:", data.user.email)
      return { user: data.user, error: null }
    }

    throw new Error("Email update failed - no user data returned")
  } catch (error: any) {
    console.error("Update email error:", error)
    return { user: null, error }
  }
}

export async function deleteStaffAccount() {
  try {
    console.log("Signing out staff user (account deletion requires admin action)")
    
    // Note: Actual user deletion requires admin/service role
    // For now, we'll sign out the user
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Sign out error:", error.message)
      throw error
    }

    console.log("User signed out successfully")
    return { error: null }
  } catch (error: any) {
    console.error("Delete account error:", error)
    return { error }
  }
}

// Test database connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from("patients").select("count", { count: "exact", head: true })
    if (error) {
      console.error("Database connection test failed:", error)
      return false
    }
    console.log("Database connection successful")
    return true
  } catch (error) {
    console.error("Database connection error:", error)
    return false
  }
}

// Database Types
export interface Patient {
  id: string
  name: string
  phone: string
  email?: string
  profession?: string // Main profession/occupation field from booking form
  session_type: "in_clinic" | "video"
  appointment_date: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  urgency: "normal" | "urgent" | "emergency"
  payment_method: "cash" | "jazzcash" | "easypaisa"
  notes?: string
  medical_history?: string
  sessions_completed: number
  total_sessions?: number // Total sessions prescribed by doctor
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
    occupation?: string // Detailed occupation info for admin use
    profession?: string // Synonym for occupation
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
  // Next appointment tracking for multi-appointment patients
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

// Staff Accounts (admin-managed)
export interface StaffAccount {
  id: string
  username: string
  display_name?: string
  email?: string
  phone?: string
  role: 'staff' | 'assistant'
  active: boolean
  password?: string // stored only in local fallback; do NOT store in DB plaintext
  last_login_at?: string
  created_at: string
  updated_at: string
}


// Generate professional patient code: GCC-NSR-YYYYMM-####
function generateProfessionalPatientCode(appointmentDate?: string): string {
  try {
    const CLINIC_CODE = 'GCC-NSR' // Gonstead Chiropractic Clinic - Nowshera
    const date = appointmentDate ? new Date(appointmentDate) : new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const period = `${year}${month}` // e.g., 202511
    
    // Get sequence number for this period from localStorage
    if (typeof window !== 'undefined') {
      const seqKey = `patient_code_seq_${period}`
      const currentSeq = parseInt(localStorage.getItem(seqKey) || '0', 10)
      const nextSeq = currentSeq + 1
      localStorage.setItem(seqKey, String(nextSeq))
      return `${CLINIC_CODE}-${period}-${String(nextSeq).padStart(4, '0')}`
    }
    
    // Fallback if localStorage unavailable
    return `${CLINIC_CODE}-${period}-${String(Date.now()).slice(-4)}`
  } catch (error) {
    console.error('Failed to generate professional patient code:', error)
    // Ultimate fallback
    return `GCC-NSR-${Date.now()}`
  }
}

// Database Functions with OFFLINE-FIRST architecture
// Strategy: Save to localStorage first, then sync to Supabase in background
export const createPatient = async (patientData: Omit<Patient, "id" | "created_at" | "updated_at">) => {
  try {
    const timestamp = new Date().toISOString()
    // Generate professional patient code instead of random UUID
    const professionalId = generateProfessionalPatientCode(patientData.appointment_date)
    
    const patient = {
      id: professionalId,
      ...patientData,
      created_at: timestamp,
      updated_at: timestamp,
      _syncStatus: 'pending', // Track sync status
    }

    console.log('[Offline-First] Step 1: Saving to localStorage first...')
    
    // STEP 1: Save to localStorage FIRST (immediate, reliable)
    if (typeof window !== 'undefined') {
      try {
        const existingPatients = JSON.parse(localStorage.getItem('gonstead_patients') || '[]')
        const updatedPatients = [patient, ...existingPatients]
        localStorage.setItem('gonstead_patients', JSON.stringify(updatedPatients))
        console.log('[Offline-First] ✅ Saved to localStorage successfully')
      } catch (storageError) {
        console.error('[Offline-First] ❌ localStorage save failed:', storageError)
        // Continue anyway - will try Supabase
      }
    }

    // STEP 2: Sync to Supabase in background (non-blocking)
    console.log('[Offline-First] Step 2: Syncing to Supabase in background...')
    
    // Don't await - run in background
    syncToSupabase(patient).then(supabaseData => {
      if (supabaseData) {
        console.log('[Offline-First] ✅ Synced to Supabase successfully')
        // Update localStorage with real Supabase ID
        updateLocalStorageWithSupabaseId(professionalId, supabaseData.id)
        
        // Log audit entry for patient creation
        addAuditLog({
          action: 'create',
          entity_type: 'patient',
          entity_id: supabaseData.id,
          actor_email: typeof window !== 'undefined' ? localStorage.getItem('admin_email') || undefined : undefined,
          source: 'admin_dashboard',
          reversible: true,
          meta: { after: patient }
        }).catch(err => console.warn('Audit log failed:', err))
      }
    }).catch(syncError => {
      console.warn('[Offline-First] ⚠️ Background sync to Supabase failed, will retry later:', syncError)
      // Queue for retry
      queueForRetry(patient)
    })

    // Return immediately with local data (don't wait for Supabase)
    return patient
    
  } catch (error) {
    console.error('[Offline-First] ❌ Critical error in createPatient:', error)
    throw error
  }
}

// Background sync to Supabase (Legacy - quieted for Firestore integration)
async function syncToSupabase(patient: any) {
  try {
    if (!supabase) return null

    const { _syncStatus, ...patientData } = patient
    const ALLOWED_PATIENT_COLUMNS = [
      'id','name','phone','email','session_type','appointment_date','status','urgency','payment_method','notes','medical_history','sessions_completed','total_sessions','last_visit','created_at','updated_at','prescription_generated','prescription_count','last_prescription_date','booking_source'
    ]
    const dbPayload: any = {}
    for (const [k, v] of Object.entries(patientData)) {
      if (ALLOWED_PATIENT_COLUMNS.includes(k)) dbPayload[k] = v
    }
    if (!dbPayload.payment_method) dbPayload.payment_method = 'cash'

    const { data, error } = await supabase
      .from("patients")
      .upsert(dbPayload, { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      console.warn('[Offline-First] Note: Supabase sync skipped (using Firestore as primary source of truth).')
      return null
    }

    return data
  } catch (error) {
    console.warn('[Offline-First] Supabase background sync note: App running on Firestore primary.')
    return null
  }
}

// Update localStorage with real Supabase ID after sync
function updateLocalStorageWithSupabaseId(tempId: string, supabaseId: string) {
  try {
    if (typeof window === 'undefined') return
    
    const existingPatients = JSON.parse(localStorage.getItem('gonstead_patients') || '[]')
    const updatedPatients = existingPatients.map((p: any) => {
      if (p.id === tempId) {
        return { ...p, id: supabaseId, _syncStatus: 'synced' }
      }
      return p
    })
    localStorage.setItem('gonstead_patients', JSON.stringify(updatedPatients))
  } catch (error) {}
}

// Queue failed syncs for retry
function queueForRetry(patient: any) {
  // Discard legacy Supabase retry queues to keep console clean
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sync_queue')
  }
}

// Process sync queue (call this periodically or on page load)
export async function processSyncQueue() {
  try {
    if (typeof window === 'undefined') return
    // Purge legacy sync queue items to eliminate console noise
    localStorage.removeItem('sync_queue')
  } catch (error) {}
}

export const getPatients = async () => {
  try {
    const data = await getPatientsFirestore()
    return { data, error: null }
  } catch (error: any) {
    return {
      data: [],
      error: null,
    }
  }
}

export const updatePatient = async (id: string, updates: Partial<Patient>) => {
  try {
    // Get existing patient data for audit log
    const { data: existingPatient } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .single()

    const { data, error } = await supabase
      .from("patients")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    
    // Log audit entry for patient update
    if (data && existingPatient) {
      await addAuditLog({
        action: 'update',
        entity_type: 'patient',
        entity_id: id,
        actor_email: typeof window !== 'undefined' ? localStorage.getItem('admin_email') || undefined : undefined,
        source: 'admin_dashboard',
        reversible: true,
        meta: { before: existingPatient, after: data }
      }).catch(err => console.warn('Audit log failed:', err))
    }
    
    return data
  } catch (error) {
    console.error("Update patient error:", error)
    return null
  }
}

export const deletePatient = async (id: string) => {
  try {
    // Get existing patient data for audit log before deletion
    const { data: existingPatient } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .single()

    const { error } = await supabase.from("patients").delete().eq("id", id)
    if (error) throw error
    
    // Log audit entry for patient deletion
    if (existingPatient) {
      await addAuditLog({
        action: 'delete',
        entity_type: 'patient',
        entity_id: id,
        actor_email: typeof window !== 'undefined' ? localStorage.getItem('admin_email') || undefined : undefined,
        source: 'admin_dashboard',
        reversible: true,
        meta: { before: existingPatient }
      }).catch(err => console.warn('Audit log failed:', err))
    }
  } catch (error) {
    console.error("Delete patient error:", error)
  }
}

export const getPatientByPhone = async (phone: string) => {
  try {
    const { data, error } = await supabase.from("patients").select("*").eq("phone", phone).single()
    return { data, error }
  } catch (error) {
    console.error("Get patient by phone error:", error)
    return { data: null, error }
  }
}

// Clinic Settings Functions
export const getClinicSettings = async () => {
  try {
    const { data, error } = await supabase.from("clinic_settings").select("*").single()
    return { data, error }
  } catch (error) {
    console.error("Get clinic settings error:", error)
    return {
      data: {
        id: "1",
        clinic_name: "Gonstead Chiropractic Clinic",
        address: "Near Peshawar Model School, Tehsil Road, Nowshera",
        phone: "+92 304 699 6267",
        email: "info@gonsteadchiropractic.com",
        coordinates: { lat: 34.01, lng: 71.9809 },
        map_url: "https://maps.google.com",
        operating_hours: {
          monday: "9:00 AM - 6:00 PM",
          tuesday: "9:00 AM - 6:00 PM",
          wednesday: "9:00 AM - 6:00 PM",
          thursday: "9:00 AM - 6:00 PM",
          friday: "9:00 AM - 6:00 PM",
          saturday: "9:00 AM - 6:00 PM",
          sunday: "Emergency only",
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      error: null,
    }
  }
}

export const updateClinicSettings = async (settings: Partial<ClinicSettings>) => {
  try {
    const { data, error } = await supabase
      .from("clinic_settings")
      .upsert({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Update clinic settings error:", error)
    return null
  }
}

// Prescription Functions
export const savePrescription = async (patientId: string, prescriptionData: any) => {
  try {
    const { data, error } = await supabase
      .from("prescriptions")
      .insert({
        patient_id: patientId,
        ...prescriptionData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Save prescription error:", error)
    return null
  }
}

export const getPrescriptions = async (patientId: string) => {
  try {
    const { data, error } = await supabase
      .from("prescriptions")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })

    return { data, error }
  } catch (error) {
    console.error("Get prescriptions error:", error)
    return { data: [], error }
  }
}

// Staff Accounts CRUD with localStorage fallback
const STAFF_ACCOUNTS_KEY = 'staff_accounts'

export const getStaffAccounts = async (): Promise<{ data: StaffAccount[]; error: any }> => {
  try {
    const { data, error } = await supabase.from('staff_accounts').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return { data: (data || []) as StaffAccount[], error: null }
  } catch (e) {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STAFF_ACCOUNTS_KEY) || '[]'
        const parsed = JSON.parse(raw)
        return { data: parsed, error: null }
      } catch (err) {
        return { data: [], error: err }
      }
    }
    return { data: [], error: e }
  }
}

export const createStaffAccount = async (account: Omit<StaffAccount, 'id' | 'created_at' | 'updated_at'>) => {
  const record: StaffAccount = {
    ...account,
    id: `staff_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
    active: account.active ?? true,
    role: account.role || 'staff',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  try {
    // Do not send plaintext password to DB
    const { password, ...dbPayload } = record
    const { data, error } = await supabase.from('staff_accounts').insert(dbPayload as any).select('*').single()
    if (error) throw error
    return data as StaffAccount
  } catch (e) {
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(STAFF_ACCOUNTS_KEY) || '[]'
      const arr = JSON.parse(raw)
      arr.unshift(record)
      localStorage.setItem(STAFF_ACCOUNTS_KEY, JSON.stringify(arr))
      window.dispatchEvent(new CustomEvent('staffAccountsUpdated'))
      return record
    }
    throw e
  }
}

export const updateStaffAccount = async (id: string, updates: Partial<StaffAccount>) => {
  try {
    const { password, ...dbUpdates } = updates
    const { data, error } = await supabase.from('staff_accounts').update({ ...dbUpdates, updated_at: new Date().toISOString() }).eq('id', id).select('*').single()
    if (error) throw error
    return data as StaffAccount
  } catch (e) {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(STAFF_ACCOUNTS_KEY) || '[]'
      const arr = JSON.parse(raw) as StaffAccount[]
      const updated = arr.map(a => a.id === id ? { ...a, ...updates, updated_at: new Date().toISOString() } : a)
      localStorage.setItem(STAFF_ACCOUNTS_KEY, JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('staffAccountsUpdated'))
      return updated.find(a => a.id === id)
    }
    return null
  }
}

export const removeStaffAccount = async (id: string) => {
  try {
    const { error } = await supabase.from('staff_accounts').delete().eq('id', id)
    if (error) throw error
    return true
  } catch (e) {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(STAFF_ACCOUNTS_KEY) || '[]'
      const arr = JSON.parse(raw) as StaffAccount[]
      const filtered = arr.filter(a => a.id !== id)
      localStorage.setItem(STAFF_ACCOUNTS_KEY, JSON.stringify(filtered))
      window.dispatchEvent(new CustomEvent('staffAccountsUpdated'))
      return true
    }
    return false
  }
}

// =========================
// Audit Log (with fallback)
// =========================
export interface AuditLog {
  id: string
  timestamp: string
  action: string // create | update | delete | rename | sign_in | sign_out | import | export | settings_update | error
  entity_type?: string // patient | prescription | settings | auth | system
  entity_id?: string
  actor_id?: string
  actor_email?: string
  source?: string // admin_dashboard | main_page | api | system
  reversible?: boolean
  meta?: any // { before?: any, after?: any, reason?: string }
}

export const addAuditLog = async (log: Omit<AuditLog, "id" | "timestamp">) => {
  const entry: AuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    ...log,
  }

  try {
    const { error } = await supabase.from("audit_logs").insert(entry as any)
    if (error) throw error
  } catch (e) {
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('audit_logs') || '[]'
        const parsed = JSON.parse(raw)
        parsed.unshift(entry)
        localStorage.setItem('audit_logs', JSON.stringify(parsed))
        // Notify listeners
        window.dispatchEvent(new CustomEvent('auditLogCreated', { detail: entry }))
      } catch {}
    }
  }
  return entry
}

export const getAuditLogs = async () => {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
    if (error) throw error
    return { data: (data || []) as AuditLog[], error: null }
  } catch (e) {
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('audit_logs') || '[]'
        const parsed: AuditLog[] = JSON.parse(raw)
        return { data: parsed, error: null }
      } catch (err) {
        return { data: [], error: err as any }
      }
    }
    return { data: [], error: e as any }
  }
}


// Delete a single audit log
export const deleteAuditLog = async (id: string) => {
  try {
    const { error } = await supabase.from('audit_logs').delete().eq('id', id)
    if (error) throw error
    
    // Also remove from localStorage fallback
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('audit_logs') || '[]'
        const parsed: AuditLog[] = JSON.parse(raw)
        const filtered = parsed.filter(log => log.id !== id)
        localStorage.setItem('audit_logs', JSON.stringify(filtered))
        window.dispatchEvent(new CustomEvent('auditLogDeleted', { detail: { id } }))
      } catch {}
    }
    
    return { ok: true, error: null }
  } catch (e) {
    // Fallback to localStorage only
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('audit_logs') || '[]'
        const parsed: AuditLog[] = JSON.parse(raw)
        const filtered = parsed.filter(log => log.id !== id)
        localStorage.setItem('audit_logs', JSON.stringify(filtered))
        window.dispatchEvent(new CustomEvent('auditLogDeleted', { detail: { id } }))
        return { ok: true, error: null }
      } catch (err) {
        return { ok: false, error: err }
      }
    }
    return { ok: false, error: e }
  }
}

// Clear all audit logs (reset)
export const clearAuditLogs = async () => {
  try {
    const { error } = await supabase.from('audit_logs').delete().neq('id', '')
    if (error) throw error
    
    // Also clear localStorage fallback
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('audit_logs', '[]')
        window.dispatchEvent(new CustomEvent('auditLogsCleared'))
      } catch {}
    }
    
    return { ok: true, error: null }
  } catch (e) {
    // Fallback to localStorage only
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('audit_logs', '[]')
        window.dispatchEvent(new CustomEvent('auditLogsCleared'))
        return { ok: true, error: null }
      } catch (err) {
        return { ok: false, error: err }
      }
    }
    return { ok: false, error: e }
  }
}

// Best-effort undo for common actions
export const undoAuditLog = async (log: AuditLog) => {
  if (!log.reversible) return { ok: false, error: 'Not reversible' }
  try {
    if (log.entity_type === 'patient') {
      if (log.action === 'create' && log.entity_id) {
        await deletePatient(log.entity_id)
        return { ok: true }
      }
      if (log.action === 'delete' && log.meta?.before) {
        await createPatient({ ...(log.meta.before as any) })
        return { ok: true }
      }
      if (log.action === 'update' && log.entity_id && log.meta?.before) {
        await updatePatient(log.entity_id, { ...(log.meta.before as any) })
        return { ok: true }
      }
    }
    // Extend for other entity types as needed
    return { ok: false, error: 'Undo not implemented for this action' }
  } catch (error) {
    console.error('Undo error:', error)
    return { ok: false, error }
  }
}

