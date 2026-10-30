export interface Patient {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  medicalHistory: {
    chiefComplaint: string
    onsetDate: string
    previousTreatments: string[]
    medications: string[]
    allergies: string[]
  }
  riskFlags: ("high-risk" | "non-compliant" | "overdue" | "new-patient")[]
  createdAt: string
  lastVisit?: string
  nextAppointment?: string
  treatmentPlan: TreatmentPlan
  progressNotes: ProgressNote[]
  spinalAssessment: SpinalAssessment
}

export interface TreatmentPlan {
  id: string
  patientId: string
  diagnosis: string
  treatmentGoals: string[]
  estimatedSessions: number
  completedSessions: number
  frequency: string
  homeExercises: Exercise[]
  restrictions: string[]
  nextReEvaluation: string
  createdAt: string
  updatedAt: string
}

export interface ProgressNote {
  id: string
  patientId: string
  visitDate: string
  subjective: string
  objective: {
    posture: string
    palpation: string
    orthopedicTests: string[]
    neurologicTests: string[]
  }
  assessment: string
  plan: string
  adjustments: SpinalAdjustment[]
  homeInstructions: string
  nextVisit: string
  doctorId: string
  createdAt: string
}

export interface SpinalAdjustment {
  segment: string // e.g., "C1", "T5", "L3"
  technique: string // e.g., "Gonstead", "Diversified"
  direction: string // e.g., "P-A", "Lateral"
  response: "good" | "fair" | "poor"
  notes: string
}

export interface SpinalAssessment {
  id: string
  patientId: string
  cervical: SegmentAssessment[]
  thoracic: SegmentAssessment[]
  lumbar: SegmentAssessment[]
  sacral: SegmentAssessment[]
  lastUpdated: string
  xrayFindings?: XrayFinding[]
}

export interface SegmentAssessment {
  segment: string
  mobility: "hypermobile" | "normal" | "hypomobile" | "fixated"
  pain: number // 0-10 scale
  inflammation: boolean
  adjustmentHistory: {
    date: string
    technique: string
    response: string
  }[]
  notes: string
}

export interface XrayFinding {
  id: string
  segment: string
  finding: string
  severity: "mild" | "moderate" | "severe"
  imageUrl?: string
  notes: string
  date: string
}

export interface Exercise {
  id: string
  name: string
  description: string
  videoUrl?: string
  imageUrl?: string
  sets: number
  reps: number
  frequency: string
  instructions: string
}

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  date: string
  time: string
  duration: number
  type: "initial" | "follow-up" | "reeval" | "emergency"
  status: "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled"
  chiefComplaint?: string
  notes?: string
  preVisitForms: {
    painScale: number
    functionalRating: number
    symptoms: string[]
    newSymptoms: string[]
  }
  postVisitSummary?: {
    treatmentProvided: string[]
    homeInstructions: string
    nextAppointment: string
    restrictions: string[]
  }
}

export interface DashboardStats {
  totalPatients: number
  todayAppointments: number
  weeklyTreatments: number
  averageImprovement: number
  upcomingReEvals: number
  overduePatients: number
}
