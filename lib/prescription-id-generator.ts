"use client"

/**
 * Prescription ID Generator Utility
 * Generates unique, sequential prescription IDs in format: PRESC-YYYY-XXX
 * Where YYYY is current year and XXX is a 3-digit sequential number
 */

export interface PrescriptionIdData {
  id: string
  patientId: string
  generatedAt: string
  year: number
  sequence: number
}

class PrescriptionIdGenerator {
  private static instance: PrescriptionIdGenerator
  private readonly storageKey = 'prescription_id_counter'
  private readonly prescriptionsKey = 'generated_prescriptions'

  public static getInstance(): PrescriptionIdGenerator {
    if (!PrescriptionIdGenerator.instance) {
      PrescriptionIdGenerator.instance = new PrescriptionIdGenerator()
    }
    return PrescriptionIdGenerator.instance
  }

  /**
   * Generate a new unique prescription ID
   */
  public generatePrescriptionId(patientName: string): PrescriptionIdData {
    const currentYear = new Date().getFullYear()
    const sequence = this.getNextSequenceNumber(currentYear)
    
    const prescriptionId = `PRESC-${currentYear}-${sequence.toString().padStart(3, '0')}`
    const patientId = `PAT-${currentYear}-${sequence.toString().padStart(3, '0')}`
    
    const prescriptionData: PrescriptionIdData = {
      id: prescriptionId,
      patientId: patientId,
      generatedAt: new Date().toISOString(),
      year: currentYear,
      sequence: sequence
    }

    // Save to localStorage for persistence
    this.savePrescriptionId(prescriptionData)
    
    return prescriptionData
  }

  /**
   * Get the next sequence number for the year
   */
  private getNextSequenceNumber(year: number): number {
    try {
      const stored = localStorage.getItem(this.storageKey)
      const counters = stored ? JSON.parse(stored) : {}
      
      // Get current count for this year, default to 0
      const currentCount = counters[year] || 0
      const nextSequence = currentCount + 1
      
      // Update counter
      counters[year] = nextSequence
      localStorage.setItem(this.storageKey, JSON.stringify(counters))
      
      return nextSequence
    } catch (error) {
      console.error('Error getting sequence number:', error)
      // Fallback to timestamp-based sequence if localStorage fails
      return parseInt(Date.now().toString().slice(-3))
    }
  }

  /**
   * Save prescription ID data
   */
  private savePrescriptionId(data: PrescriptionIdData): void {
    try {
      const stored = localStorage.getItem(this.prescriptionsKey)
      const prescriptions = stored ? JSON.parse(stored) : []
      
      prescriptions.push(data)
      localStorage.setItem(this.prescriptionsKey, JSON.stringify(prescriptions))
    } catch (error) {
      console.error('Error saving prescription ID:', error)
    }
  }

  /**
   * Get all generated prescription IDs
   */
  public getAllPrescriptionIds(): PrescriptionIdData[] {
    try {
      const stored = localStorage.getItem(this.prescriptionsKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error getting prescription IDs:', error)
      return []
    }
  }

  /**
   * Check if prescription ID exists
   */
  public prescriptionExists(prescriptionId: string): boolean {
    const prescriptions = this.getAllPrescriptionIds()
    return prescriptions.some(p => p.id === prescriptionId)
  }

  /**
   * Get prescription data by ID
   */
  public getPrescriptionById(prescriptionId: string): PrescriptionIdData | null {
    const prescriptions = this.getAllPrescriptionIds()
    return prescriptions.find(p => p.id === prescriptionId) || null
  }

  /**
   * Get current year's prescription count
   */
  public getCurrentYearCount(): number {
    const currentYear = new Date().getFullYear()
    try {
      const stored = localStorage.getItem(this.storageKey)
      const counters = stored ? JSON.parse(stored) : {}
      return counters[currentYear] || 0
    } catch (error) {
      console.error('Error getting current year count:', error)
      return 0
    }
  }

  /**
   * Search prescriptions by patient name
   */
  public searchByPatientName(searchTerm: string): PrescriptionIdData[] {
    const prescriptions = this.getAllPrescriptionIds()
    return prescriptions.filter(p => 
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  /**
   * Get formatted prescription ID for display
   */
  public formatPrescriptionId(prescriptionId: string): string {
    return prescriptionId.replace(/PRESC-(\d{4})-(\d{3})/, 'PRESC-$1-$2')
  }

  /**
   * Validate prescription ID format
   */
  public isValidPrescriptionId(prescriptionId: string): boolean {
    const pattern = /^PRESC-\d{4}-\d{3}$/
    return pattern.test(prescriptionId)
  }
}

// Export singleton instance
export const prescriptionIdGenerator = PrescriptionIdGenerator.getInstance()
