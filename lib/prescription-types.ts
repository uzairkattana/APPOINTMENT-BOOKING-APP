export interface PrescriptionData {
  id: string
  patient_id: string
  appointment_id: string
  patient_name: string
  patient_age?: string
  patient_gender?: string
  patient_phone?: string
  patient_email?: string
  patient_address?: string
  visit_date: string
  birth_date?: string
  joining_date?: string
  treatment_plan: string
  prescribed_medicine?: string
  total_sessions?: string
  session_fee?: string
  payment_method?: string
  payment_status?: string
  conditions?: string[]
  custom_fields?: { [key: string]: string }
  doctor_name: string
  doctor_signature?: string
  patient_signature?: string
  clinic_name: string
  clinic_address: string
  clinic_phone: string
  created_at: string
  updated_at: string
}

export interface DigitalPrescriptionProps {
  prescription: PrescriptionData
  isPublicView?: boolean
  showActions?: boolean
}

export interface PrescriptionSecurity {
  access_token: string
  expires_at: string
  allowed_ips?: string[]
  access_count: number
  last_accessed: string
}

// Comprehensive Patient Tracking System
export interface PatientVisit {
  id: string
  patient_id: string
  prescription_id: string
  visit_date: string
  visit_type: 'initial' | 'follow_up' | 'emergency' | 'maintenance'
  chief_complaint: string
  symptoms: string[]
  treatment_given: string[]
  doctor_notes: string
  next_visit_date?: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  session_number?: number
  created_at: string
  updated_at: string
}

export interface PatientProgress {
  id: string
  patient_id: string
  prescription_id: string
  assessment_date: string
  pain_level_before: number // 1-10 scale
  pain_level_after: number // 1-10 scale
  mobility_score: number // 1-10 scale
  improvement_notes: string
  doctor_assessment: string
  treatment_effectiveness: 'excellent' | 'good' | 'fair' | 'poor'
  created_at: string
}

export interface TreatmentSession {
  id: string
  patient_id: string
  prescription_id: string
  session_date: string
  session_number: number
  techniques_used: string[]
  areas_treated: string[]
  duration_minutes: number
  patient_feedback: string
  doctor_notes: string
  homework_assigned?: string[]
  next_session_plan: string
  payment_status: 'paid' | 'pending' | 'partial' | 'unpaid'
  created_at: string
}

export interface PatientHistory {
  id: string
  patient_id: string
  medical_history: string[]
  previous_injuries: string[]
  current_medications: string[]
  allergies: string[]
  lifestyle_factors: {
    occupation: string
    activity_level: 'sedentary' | 'moderate' | 'active' | 'very_active'
    sleep_quality: number // 1-10 scale
    stress_level: number // 1-10 scale
  }
  emergency_contact: {
    name: string
    relationship: string
    phone: string
  }
  created_at: string
  updated_at: string
}

export interface PatientTracking {
  patient_id: string
  prescription_id: string
  patient_info: {
    name: string
    age: string
    gender: string
    phone: string
    email?: string
    address?: string
    date_of_birth?: string
    joining_date: string
  }
  prescription_details: PrescriptionData
  visit_history: PatientVisit[]
  progress_tracking: PatientProgress[]
  treatment_sessions: TreatmentSession[]
  patient_history: PatientHistory
  summary: {
    total_visits: number
    completed_sessions: number
    remaining_sessions: number
    overall_progress: 'excellent' | 'good' | 'fair' | 'poor'
    last_visit_date: string
    next_scheduled_visit?: string
    treatment_duration_days: number
    average_pain_improvement: number
  }
}

export interface PrescriptionLookupResult {
  found: boolean
  prescription?: PrescriptionData
  patient_tracking?: PatientTracking
  error?: string
  access_info: {
    accessed_at: string
    access_count: number
    last_accessed_ip?: string
  }
}
