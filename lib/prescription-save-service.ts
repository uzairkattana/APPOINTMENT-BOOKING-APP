"use client"

import { PrescriptionData, PatientHistory } from '@/lib/prescription-types'
import { prescriptionTracker } from '@/lib/prescription-tracking'
import { PrescriptionIdData } from '@/lib/prescription-id-generator'

export interface SavePrescriptionData {
  prescriptionId: string
  patientId: string
  patientName: string
  patientAge: string
  patientGender: string
  patientPhone: string
  patientEmail?: string
  patientAddress?: string
  visitDate: string
  birthDate?: string
  joiningDate?: string
  treatmentPlan: string
  prescribedMedicine?: string
  totalSessions: string
  sessionFee?: string
  paymentMethod?: string
  paymentStatus?: string
  conditions: string[]
  customFields?: { [key: string]: string }
}

class PrescriptionSaveService {
  private static instance: PrescriptionSaveService
  private readonly savedPrescriptionsKey = 'saved_prescriptions'

  public static getInstance(): PrescriptionSaveService {
    if (!PrescriptionSaveService.instance) {
      PrescriptionSaveService.instance = new PrescriptionSaveService()
    }
    return PrescriptionSaveService.instance
  }

  /**
   * Save prescription to patient records
   */
  public async savePrescription(data: SavePrescriptionData): Promise<boolean> {
    try {
      // Create prescription data object
      const prescriptionData: PrescriptionData = {
        id: data.prescriptionId,
        patient_id: data.patientId,
        appointment_id: `APT-${Date.now()}`,
        patient_name: data.patientName,
        patient_age: data.patientAge,
        patient_gender: data.patientGender,
        patient_phone: data.patientPhone,
        patient_email: data.patientEmail,
        patient_address: data.patientAddress,
        visit_date: new Date(data.visitDate).toISOString(),
        birth_date: data.birthDate,
        joining_date: data.joiningDate || new Date().toISOString().split('T')[0],
        treatment_plan: data.treatmentPlan,
        prescribed_medicine: data.prescribedMedicine,
        total_sessions: data.totalSessions,
        session_fee: data.sessionFee || '0',
        payment_method: data.paymentMethod || 'Cash',
        payment_status: data.paymentStatus || 'Pending',
        conditions: data.conditions,
        doctor_name: "Dr. Bashir Khan",
        clinic_name: "Gonstead Chiropractic Clinic",
        clinic_address: "Near Peshawar Model School, Tehsil Road Nowshera, KPK",
        clinic_phone: "+923046996267",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Save to local storage (in production, this would save to database)
      await this.saveToLocalStorage(prescriptionData)
      
      // Also add to prescription tracking system
      await this.addToPrescriptionTracking(prescriptionData)

      return true
    } catch (error) {
      console.error('Error saving prescription:', error)
      return false
    }
  }

  /**
   * Save prescription data to localStorage
   */
  private async saveToLocalStorage(prescription: PrescriptionData): Promise<void> {
    try {
      const stored = localStorage.getItem(this.savedPrescriptionsKey)
      const prescriptions = stored ? JSON.parse(stored) : []
      
      // Check if prescription already exists (update if exists)
      const existingIndex = prescriptions.findIndex((p: PrescriptionData) => p.id === prescription.id)
      
      if (existingIndex >= 0) {
        prescriptions[existingIndex] = prescription
      } else {
        prescriptions.push(prescription)
      }
      
      localStorage.setItem(this.savedPrescriptionsKey, JSON.stringify(prescriptions))
      
      console.log(`Prescription ${prescription.id} saved successfully`)
    } catch (error) {
      console.error('Error saving to localStorage:', error)
      throw error
    }
  }

  /**
   * Add prescription to the tracking system
   */
  private async addToPrescriptionTracking(prescription: PrescriptionData): Promise<void> {
    try {
      // In a real implementation, we would call the prescription tracking service
      // For now, we'll simulate adding it to the tracking system
      
      // Add to prescription tracker's internal database
      const trackerService = prescriptionTracker as any
      if (trackerService.mockDatabase) {
        trackerService.mockDatabase.prescriptions.set(prescription.id, prescription)
        
        // Create initial patient history if not exists
        const patientHistory: PatientHistory = {
          id: `HIST-${Date.now()}`,
          patient_id: prescription.patient_id,
          medical_history: [],
          previous_injuries: [],
          current_medications: [],
          allergies: [],
          lifestyle_factors: {
            occupation: "Unknown",
            activity_level: "moderate",
            sleep_quality: 7,
            stress_level: 5
          },
          emergency_contact: {
            name: "Emergency Contact",
            relationship: "Family",
            phone: prescription.patient_phone || "N/A"
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        trackerService.mockDatabase.patientHistory.set(prescription.patient_id, patientHistory)
        trackerService.mockDatabase.patientVisits.set(prescription.patient_id, [])
        trackerService.mockDatabase.patientProgress.set(prescription.patient_id, [])
        trackerService.mockDatabase.treatmentSessions.set(prescription.patient_id, [])
      }
      
      console.log(`Prescription ${prescription.id} added to tracking system`)
    } catch (error) {
      console.error('Error adding to prescription tracking:', error)
      throw error
    }
  }

  /**
   * Get all saved prescriptions
   */
  public getAllSavedPrescriptions(): PrescriptionData[] {
    try {
      const stored = localStorage.getItem(this.savedPrescriptionsKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error getting saved prescriptions:', error)
      return []
    }
  }

  /**
   * Search saved prescriptions by patient name or prescription ID
   */
  public searchPrescriptions(searchTerm: string): PrescriptionData[] {
    const prescriptions = this.getAllSavedPrescriptions()
    const lowerSearchTerm = searchTerm.toLowerCase()
    
    return prescriptions.filter(prescription => 
      prescription.patient_name.toLowerCase().includes(lowerSearchTerm) ||
      prescription.id.toLowerCase().includes(lowerSearchTerm) ||
      (prescription.patient_phone && prescription.patient_phone.includes(searchTerm))
    )
  }

  /**
   * Get prescription by ID
   */
  public getPrescriptionById(prescriptionId: string): PrescriptionData | null {
    const prescriptions = this.getAllSavedPrescriptions()
    return prescriptions.find(p => p.id === prescriptionId) || null
  }

  /**
   * Delete prescription
   */
  public deletePrescription(prescriptionId: string): boolean {
    try {
      const prescriptions = this.getAllSavedPrescriptions()
      const filteredPrescriptions = prescriptions.filter(p => p.id !== prescriptionId)
      
      localStorage.setItem(this.savedPrescriptionsKey, JSON.stringify(filteredPrescriptions))
      return true
    } catch (error) {
      console.error('Error deleting prescription:', error)
      return false
    }
  }

  /**
   * Get prescription statistics
   */
  public getPrescriptionStats() {
    const prescriptions = this.getAllSavedPrescriptions()
    const currentYear = new Date().getFullYear()
    
    return {
      total: prescriptions.length,
      thisYear: prescriptions.filter(p => p.created_at.includes(currentYear.toString())).length,
      thisMonth: prescriptions.filter(p => {
        const createdDate = new Date(p.created_at)
        const now = new Date()
        return createdDate.getFullYear() === now.getFullYear() && 
               createdDate.getMonth() === now.getMonth()
      }).length,
      today: prescriptions.filter(p => {
        const createdDate = new Date(p.created_at).toDateString()
        const today = new Date().toDateString()
        return createdDate === today
      }).length
    }
  }
}

// Export singleton instance
export const prescriptionSaveService = PrescriptionSaveService.getInstance()
