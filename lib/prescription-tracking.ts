"use client"

import { 
  PrescriptionData, 
  PatientTracking, 
  PatientVisit, 
  PatientProgress, 
  TreatmentSession,
  PatientHistory,
  PrescriptionLookupResult
} from '@/lib/prescription-types'

/**
 * Comprehensive Prescription Tracking Service
 * Provides complete patient tracking functionality based on prescription ID
 */
export class PrescriptionTrackingService {
  private static instance: PrescriptionTrackingService
  
  // Mock database - In production, this would connect to your actual database
  private mockDatabase = {
    prescriptions: new Map<string, PrescriptionData>(),
    patientVisits: new Map<string, PatientVisit[]>(),
    patientProgress: new Map<string, PatientProgress[]>(),
    treatmentSessions: new Map<string, TreatmentSession[]>(),
    patientHistory: new Map<string, PatientHistory>(),
  }

  constructor() {
    this.initializeMockData()
  }

  public static getInstance(): PrescriptionTrackingService {
    if (!PrescriptionTrackingService.instance) {
      PrescriptionTrackingService.instance = new PrescriptionTrackingService()
    }
    return PrescriptionTrackingService.instance
  }

  /**
   * Initialize mock data for demonstration purposes
   */
  private initializeMockData() {
    // Sample prescription data
    const samplePrescription: PrescriptionData = {
      id: "PRESC-2024-001",
      patient_id: "PAT-2024-001",
      appointment_id: "APT-2024-001",
      patient_name: "John Smith",
      patient_age: "35",
      patient_gender: "male",
      patient_phone: "+92 300 1234567",
      patient_email: "john.smith@email.com",
      patient_address: "123 Main Street, Nowshera",
      visit_date: "2024-01-15T10:00:00Z",
      birth_date: "1989-05-20",
      joining_date: "2024-01-15",
      treatment_plan: "Comprehensive Gonstead chiropractic treatment for lower back pain. Focus on L4-L5 disc alignment and postural correction. Progressive treatment over 8-10 sessions.",
      prescribed_medicine: "Anti-inflammatory supplements as needed. Ice therapy 15 minutes, 3 times daily. Heat therapy before sessions.",
      total_sessions: "10",
      session_fee: "3000",
      payment_method: "Cash",
      payment_status: "Paid",
      conditions: ["Lower Back Pain", "Disc Misalignment", "Postural Issues"],
      doctor_name: "Dr. Bashir Khan",
      clinic_name: "Gonstead Chiropractic Clinic",
      clinic_address: "Near Peshawar Model School, Tehsil Road, Nowshera",
      clinic_phone: "+92 304 699 6267",
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z"
    }

    // Sample patient visits
    const sampleVisits: PatientVisit[] = [
      {
        id: "VISIT-001",
        patient_id: "PAT-2024-001",
        prescription_id: "PRESC-2024-001",
        visit_date: "2024-01-15T10:00:00Z",
        visit_type: "initial",
        chief_complaint: "Severe lower back pain for 3 weeks",
        symptoms: ["Lower back pain", "Stiffness", "Difficulty bending"],
        treatment_given: ["Gonstead adjustment", "Spinal alignment", "Postural assessment"],
        doctor_notes: "Initial assessment shows L4-L5 misalignment. Patient responded well to first adjustment. Recommended 10 sessions.",
        next_visit_date: "2024-01-18T10:00:00Z",
        status: "completed",
        session_number: 1,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-15T10:00:00Z"
      },
      {
        id: "VISIT-002",
        patient_id: "PAT-2024-001",
        prescription_id: "PRESC-2024-001",
        visit_date: "2024-01-18T10:00:00Z",
        visit_type: "follow_up",
        chief_complaint: "Reduced pain, some stiffness remains",
        symptoms: ["Mild lower back pain", "Morning stiffness"],
        treatment_given: ["Gonstead adjustment", "Muscle relaxation techniques"],
        doctor_notes: "Good progress. Pain reduced from 8/10 to 4/10. Continue treatment plan.",
        next_visit_date: "2024-01-22T10:00:00Z",
        status: "completed",
        session_number: 2,
        created_at: "2024-01-18T10:00:00Z",
        updated_at: "2024-01-18T10:00:00Z"
      }
    ]

    // Sample progress tracking
    const sampleProgress: PatientProgress[] = [
      {
        id: "PROG-001",
        patient_id: "PAT-2024-001",
        prescription_id: "PRESC-2024-001",
        assessment_date: "2024-01-15T10:00:00Z",
        pain_level_before: 8,
        pain_level_after: 6,
        mobility_score: 4,
        improvement_notes: "Initial treatment showed immediate relief. Patient able to bend slightly better.",
        doctor_assessment: "Good response to first treatment. Expect continued improvement.",
        treatment_effectiveness: "good",
        created_at: "2024-01-15T10:00:00Z"
      },
      {
        id: "PROG-002",
        patient_id: "PAT-2024-001",
        prescription_id: "PRESC-2024-001",
        assessment_date: "2024-01-18T10:00:00Z",
        pain_level_before: 6,
        pain_level_after: 3,
        mobility_score: 7,
        improvement_notes: "Significant improvement in mobility. Patient reports better sleep quality.",
        doctor_assessment: "Excellent progress. Continue current treatment approach.",
        treatment_effectiveness: "excellent",
        created_at: "2024-01-18T10:00:00Z"
      }
    ]

    // Sample treatment sessions
    const sampleSessions: TreatmentSession[] = [
      {
        id: "SESSION-001",
        patient_id: "PAT-2024-001",
        prescription_id: "PRESC-2024-001",
        session_date: "2024-01-15T10:00:00Z",
        session_number: 1,
        techniques_used: ["Gonstead Adjustment", "Spinal Analysis", "X-ray Review"],
        areas_treated: ["L4-L5 vertebrae", "Sacroiliac joint", "Lower lumbar region"],
        duration_minutes: 45,
        patient_feedback: "Felt immediate relief. Some soreness expected.",
        doctor_notes: "Successful first adjustment. Patient tolerated treatment well.",
        homework_assigned: ["Ice therapy 3x daily", "Avoid heavy lifting", "Posture exercises"],
        next_session_plan: "Continue spinal alignment, focus on mobility exercises",
        payment_status: "paid",
        created_at: "2024-01-15T10:00:00Z"
      },
      {
        id: "SESSION-002",
        patient_id: "PAT-2024-001",
        prescription_id: "PRESC-2024-001",
        session_date: "2024-01-18T10:00:00Z",
        session_number: 2,
        techniques_used: ["Gonstead Adjustment", "Muscle Release", "Postural Training"],
        areas_treated: ["L4-L5 vertebrae", "Hip flexors", "Thoracic spine"],
        duration_minutes: 40,
        patient_feedback: "Much better mobility. Pain significantly reduced.",
        doctor_notes: "Excellent progress. Spinal alignment improving steadily.",
        homework_assigned: ["Heat therapy before exercise", "Walking 20 minutes daily", "Stretching routine"],
        next_session_plan: "Focus on strengthening exercises and postural correction",
        payment_status: "paid",
        created_at: "2024-01-18T10:00:00Z"
      }
    ]

    // Sample patient history
    const sampleHistory: PatientHistory = {
      id: "HIST-001",
      patient_id: "PAT-2024-001",
      medical_history: ["No major surgeries", "Occasional headaches", "Previous lower back strain (2020)"],
      previous_injuries: ["Minor car accident (2020)", "Sports injury - basketball (2018)"],
      current_medications: ["Multivitamin", "Occasional ibuprofen"],
      allergies: ["None known"],
      lifestyle_factors: {
        occupation: "Software Engineer",
        activity_level: "moderate",
        sleep_quality: 6,
        stress_level: 7
      },
      emergency_contact: {
        name: "Jane Smith",
        relationship: "Spouse",
        phone: "+92 300 7654321"
      },
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-18T10:00:00Z"
    }

    // Store sample data
    this.mockDatabase.prescriptions.set("PRESC-2024-001", samplePrescription)
    this.mockDatabase.patientVisits.set("PAT-2024-001", sampleVisits)
    this.mockDatabase.patientProgress.set("PAT-2024-001", sampleProgress)
    this.mockDatabase.treatmentSessions.set("PAT-2024-001", sampleSessions)
    this.mockDatabase.patientHistory.set("PAT-2024-001", sampleHistory)
  }

  /**
   * Lookup complete patient information by prescription ID
   */
  public async lookupByPrescriptionId(prescriptionId: string): Promise<PrescriptionLookupResult> {
    try {
      // Find prescription
      const prescription = this.mockDatabase.prescriptions.get(prescriptionId)
      if (!prescription) {
        return {
          found: false,
          error: "Prescription not found",
          access_info: {
            accessed_at: new Date().toISOString(),
            access_count: 0
          }
        }
      }

      // Get patient tracking data
      const patientId = prescription.patient_id
      const visits = this.mockDatabase.patientVisits.get(patientId) || []
      const progress = this.mockDatabase.patientProgress.get(patientId) || []
      const sessions = this.mockDatabase.treatmentSessions.get(patientId) || []
      const history = this.mockDatabase.patientHistory.get(patientId)

      if (!history) {
        return {
          found: false,
          error: "Patient history not found",
          access_info: {
            accessed_at: new Date().toISOString(),
            access_count: 0
          }
        }
      }

      // Calculate summary statistics
      const completedSessions = sessions.filter(s => s.payment_status === 'paid').length
      const totalSessions = parseInt(prescription.total_sessions || '0')
      const remainingSessions = Math.max(0, totalSessions - completedSessions)
      
      // Calculate average pain improvement
      const averagePainImprovement = progress.length > 0 
        ? progress.reduce((sum, p) => sum + (p.pain_level_before - p.pain_level_after), 0) / progress.length
        : 0

      // Determine overall progress
      let overallProgress: 'excellent' | 'good' | 'fair' | 'poor' = 'fair'
      if (averagePainImprovement >= 4) overallProgress = 'excellent'
      else if (averagePainImprovement >= 2.5) overallProgress = 'good'
      else if (averagePainImprovement >= 1) overallProgress = 'fair'
      else overallProgress = 'poor'

      // Get treatment duration
      const joinDate = new Date(prescription.joining_date || prescription.created_at)
      const now = new Date()
      const treatmentDurationDays = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24))

      // Build patient tracking object
      const patientTracking: PatientTracking = {
        patient_id: patientId,
        prescription_id: prescriptionId,
        patient_info: {
          name: prescription.patient_name,
          age: prescription.patient_age || 'N/A',
          gender: prescription.patient_gender || 'N/A',
          phone: prescription.patient_phone || 'N/A',
          email: prescription.patient_email,
          address: prescription.patient_address,
          date_of_birth: prescription.birth_date,
          joining_date: prescription.joining_date || prescription.created_at
        },
        prescription_details: prescription,
        visit_history: visits,
        progress_tracking: progress,
        treatment_sessions: sessions,
        patient_history: history,
        summary: {
          total_visits: visits.length,
          completed_sessions: completedSessions,
          remaining_sessions: remainingSessions,
          overall_progress: overallProgress,
          last_visit_date: visits.length > 0 ? visits[visits.length - 1].visit_date : 'N/A',
          next_scheduled_visit: visits.find(v => v.status === 'scheduled')?.visit_date,
          treatment_duration_days: treatmentDurationDays,
          average_pain_improvement: Math.round(averagePainImprovement * 10) / 10
        }
      }

      return {
        found: true,
        prescription,
        patient_tracking: patientTracking,
        access_info: {
          accessed_at: new Date().toISOString(),
          access_count: 1, // In production, increment this from database
          last_accessed_ip: 'Unknown' // In production, get from request
        }
      }

    } catch (error) {
      console.error('Error looking up prescription:', error)
      return {
        found: false,
        error: 'An error occurred while looking up the prescription',
        access_info: {
          accessed_at: new Date().toISOString(),
          access_count: 0
        }
      }
    }
  }

  /**
   * Add a new patient visit
   */
  public async addPatientVisit(visit: Omit<PatientVisit, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const newVisit: PatientVisit = {
        ...visit,
        id: `VISIT-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const existingVisits = this.mockDatabase.patientVisits.get(visit.patient_id) || []
      existingVisits.push(newVisit)
      this.mockDatabase.patientVisits.set(visit.patient_id, existingVisits)

      return true
    } catch (error) {
      console.error('Error adding patient visit:', error)
      return false
    }
  }

  /**
   * Add progress tracking entry
   */
  public async addProgressTracking(progress: Omit<PatientProgress, 'id' | 'created_at'>): Promise<boolean> {
    try {
      const newProgress: PatientProgress = {
        ...progress,
        id: `PROG-${Date.now()}`,
        created_at: new Date().toISOString()
      }

      const existingProgress = this.mockDatabase.patientProgress.get(progress.patient_id) || []
      existingProgress.push(newProgress)
      this.mockDatabase.patientProgress.set(progress.patient_id, existingProgress)

      return true
    } catch (error) {
      console.error('Error adding progress tracking:', error)
      return false
    }
  }

  /**
   * Add treatment session
   */
  public async addTreatmentSession(session: Omit<TreatmentSession, 'id' | 'created_at'>): Promise<boolean> {
    try {
      const newSession: TreatmentSession = {
        ...session,
        id: `SESSION-${Date.now()}`,
        created_at: new Date().toISOString()
      }

      const existingSessions = this.mockDatabase.treatmentSessions.get(session.patient_id) || []
      existingSessions.push(newSession)
      this.mockDatabase.treatmentSessions.set(session.patient_id, existingSessions)

      return true
    } catch (error) {
      console.error('Error adding treatment session:', error)
      return false
    }
  }

  /**
   * Get all prescriptions (for admin use)
   */
  public async getAllPrescriptions(): Promise<PrescriptionData[]> {
    return Array.from(this.mockDatabase.prescriptions.values())
  }

  /**
   * Search prescriptions by patient name
   */
  public async searchPrescriptionsByName(patientName: string): Promise<PrescriptionData[]> {
    const allPrescriptions = Array.from(this.mockDatabase.prescriptions.values())
    return allPrescriptions.filter(p => 
      p.patient_name.toLowerCase().includes(patientName.toLowerCase())
    )
  }

  /**
   * Generate prescription tracking report
   */
  public async generateTrackingReport(prescriptionId: string): Promise<string> {
    const lookup = await this.lookupByPrescriptionId(prescriptionId)
    
    if (!lookup.found || !lookup.patient_tracking) {
      return "Prescription not found or tracking data unavailable."
    }

    const tracking = lookup.patient_tracking
    const summary = tracking.summary

    return `
**PRESCRIPTION TRACKING REPORT**
Generated: ${new Date().toLocaleString()}

**Patient Information:**
- Name: ${tracking.patient_info.name}
- Age: ${tracking.patient_info.age}
- Phone: ${tracking.patient_info.phone}
- Joining Date: ${new Date(tracking.patient_info.joining_date).toLocaleDateString()}

**Treatment Summary:**
- Total Visits: ${summary.total_visits}
- Completed Sessions: ${summary.completed_sessions}/${summary.remaining_sessions + summary.completed_sessions}
- Treatment Duration: ${summary.treatment_duration_days} days
- Overall Progress: ${summary.overall_progress.toUpperCase()}
- Average Pain Improvement: ${summary.average_pain_improvement}/10

**Latest Session:**
${tracking.treatment_sessions.length > 0 ? `
- Date: ${new Date(tracking.treatment_sessions[tracking.treatment_sessions.length - 1].session_date).toLocaleDateString()}
- Techniques: ${tracking.treatment_sessions[tracking.treatment_sessions.length - 1].techniques_used.join(', ')}
- Patient Feedback: ${tracking.treatment_sessions[tracking.treatment_sessions.length - 1].patient_feedback}
` : 'No sessions recorded'}

**Next Steps:**
${summary.next_scheduled_visit ? `Next visit scheduled for ${new Date(summary.next_scheduled_visit).toLocaleDateString()}` : 'No upcoming visits scheduled'}
    `.trim()
  }
}

// Export singleton instance
export const prescriptionTracker = PrescriptionTrackingService.getInstance()
