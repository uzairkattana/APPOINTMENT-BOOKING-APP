"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Share2 } from "lucide-react"
import { ProfessionalMedicalRecord } from "@/components/professional-medical-record"

interface MedicalRecord {
  id: string
  patientName: string
  age: number
  gender: string
  phone: string
  email: string
  lastVisit: string
  diagnosis: string
  treatmentType: string
  status: string
  sessionsCompleted: number
  totalSessions: number
  nextAppointment: string
  chiefComplaint: string
  medicalHistory: string
  currentMedications: string
  treatmentPlan: string
  progress: string
  doctorNotes: string
}

export default function MedicalRecordPrintPage() {
  const params = useParams()
  const router = useRouter()
  const [record, setRecord] = useState<MedicalRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadRecord = () => {
      try {
        const recordId = params.id as string
        const storedRecords = localStorage.getItem("medical_records")
        
        if (storedRecords) {
          const records: MedicalRecord[] = JSON.parse(storedRecords)
          const foundRecord = records.find(r => r.id === recordId)
          
          if (foundRecord) {
            setRecord(foundRecord)
          } else {
            // Fallback: check patient records and convert
            const patientRecords = localStorage.getItem("gonstead_patients")
            if (patientRecords) {
              const patients = JSON.parse(patientRecords)
              const patient = patients.find((p: any) => p.id === recordId)
              
              if (patient) {
                const convertedRecord: MedicalRecord = {
                  id: `MR${String(Date.now()).slice(-3)}`,
                  patientName: patient.name || 'Unknown Patient',
                  age: patient.demographics?.age || 0,
                  gender: patient.demographics?.gender || 'Not specified',
                  phone: patient.phone || 'Not provided',
                  email: patient.email || 'Not provided',
                  lastVisit: patient.last_visit || patient.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
                  diagnosis: patient.treatment_plan?.diagnosis || 'Initial consultation pending',
                  treatmentType: patient.session_type === 'in_clinic' ? 'Gonstead Adjustment' : 'Video Consultation',
                  status: patient.status === 'completed' ? 'Completed' : patient.status === 'pending' ? 'Ongoing' : 'Follow-up',
                  sessionsCompleted: patient.sessions_completed || 0,
                  totalSessions: 8,
                  nextAppointment: patient.appointment_date || 'To be scheduled',
                  chiefComplaint: patient.notes || 'General consultation',
                  medicalHistory: patient.medical_history || 'Medical history to be collected during consultation',
                  currentMedications: 'To be determined during consultation',
                  treatmentPlan: patient.treatment_plan?.goals || 'Gonstead chiropractic assessment and treatment plan',
                  progress: patient.treatment_plan?.progress || 'Initial assessment pending',
                  doctorNotes: patient.booking_source === 'main_page' 
                    ? 'Patient booked online. Initial consultation scheduled.'
                    : 'Patient added via admin dashboard. Assessment in progress.'
                }
                setRecord(convertedRecord)
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading medical record:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRecord()
  }, [params.id])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    // In a real implementation, you would generate a PDF here
    // For now, we'll use the browser's print-to-PDF functionality
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  const handleShare = async () => {
    if (navigator.share && record) {
      try {
        await navigator.share({
          title: `Medical Record - ${record.patientName}`,
          text: `Medical record for ${record.patientName} (${record.id})`,
          url: window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Record URL copied to clipboard!')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d5c75] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading medical record...</p>
        </div>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Record Not Found</h1>
          <p className="text-gray-600 mb-6">The requested medical record could not be found.</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Non-print navigation */}
      <div className="no-print bg-white border-b shadow-sm p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button 
            onClick={() => router.back()} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Records
          </Button>
          
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleShare}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button 
              onClick={handleDownloadPDF}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Professional Medical Record */}
      <div className="py-8">
        <ProfessionalMedicalRecord 
          record={record} 
          onPrint={handlePrint}
        />
      </div>
    </div>
  )
}
