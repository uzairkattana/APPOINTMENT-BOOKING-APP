"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Search,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Activity,
  AlertCircle,
  CheckCircle,
  Download,
  Eye,
  ArrowLeft,
  Pill,
  DollarSign,
  Stethoscope,
  Timer,
  Save,
  FileJson,
  FileDown,
  CheckCheck,
  AlertTriangle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getPatients, type Patient } from "@/lib/data-service"
import Image from "next/image"

interface PrescriptionRecord {
  id: string
  patientName: string
  phone: string
  email: string
  prescriptionDate: string
  medications: string
  notes: string
  patientId?: string
  chiropracticSuggestions?: string[]
  status?: 'saved' | 'draft' | 'active'
  generatedBy?: string
  savedAt?: string
  isSynced?: boolean
}

export default function PatientTrackingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [prescriptionRecords, setPrescriptionRecords] = useState<PrescriptionRecord[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Load prescription records and patients on component mount
  useEffect(() => {
    loadPrescriptionRecords()
    loadPatients()
  }, [])

  const loadPrescriptionRecords = () => {
    // Load prescription records from localStorage (generated from prescription page)
    // Also check for medical_records and extract prescriptions from patients with prescription_generated flag
    const prescriptionRecords = JSON.parse(localStorage.getItem("prescription_records") || "[]")
    
    // Load patients and create prescription records for those with prescriptions generated
    const patients = JSON.parse(localStorage.getItem("gonstead_patients") || "[]")
    const additionalRecords: PrescriptionRecord[] = []
    
    patients.forEach((patient: Patient) => {
      if (patient.prescription_generated && patient.last_prescription_date) {
        // Check if we already have a record for this prescription
        const existingRecord = prescriptionRecords.find((record: PrescriptionRecord) => 
          record.patientName === patient.name && record.phone === patient.phone
        )
        
        if (!existingRecord) {
          // Create a prescription record from patient data
          const prescriptionId = `RX${String(prescriptionRecords.length + additionalRecords.length + 1).padStart(3, '0')}`
          additionalRecords.push({
            id: prescriptionId,
            patientName: patient.name,
            phone: patient.phone,
            email: patient.email || '',
            prescriptionDate: patient.last_prescription_date,
            medications: 'Generated via prescription system',
            notes: patient.notes || 'Prescription generated from admin dashboard',
            patientId: patient.id
          })
        }
      }
    })
    
    const allRecords = [...prescriptionRecords, ...additionalRecords]
    setPrescriptionRecords(allRecords)
    
    // Save back to localStorage if we added new records
    if (additionalRecords.length > 0) {
      localStorage.setItem("prescription_records", JSON.stringify(allRecords))
    }
  }

  const loadPatients = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await getPatients()
      
      if (error) {
        console.error("Error loading patients:", error)
        return
      }

      const supabasePatients = data || []
      const localStoragePatients = JSON.parse(localStorage.getItem("gonstead_patients") || "[]")
      
      // Merge patients with proper deduplication
      const mergedPatients = [...supabasePatients]
      const existingIds = new Set(supabasePatients.map(p => p.id))
      
      localStoragePatients.forEach((localPatient: Patient) => {
        if (!existingIds.has(localPatient.id)) {
          mergedPatients.push(localPatient)
          existingIds.add(localPatient.id)
        }
      })
    } catch (error) {
      console.error("Error loading patients:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search Query Required",
        description: "Please enter a prescription ID to search",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)
    try {
      // Search by prescription ID first
      const prescriptionMatch = prescriptionRecords.find(record => 
        record.id.toLowerCase().includes(searchQuery.toLowerCase())
      )

      if (prescriptionMatch) {
        // Find the corresponding patient in appointments
        const { data, error } = await getPatients()
        if (error) throw error

        const supabasePatients = data || []
        const localStoragePatients = JSON.parse(localStorage.getItem("gonstead_patients") || "[]")
        
        // Merge with deduplication
        const allPatients = [...supabasePatients]
        const existingIds = new Set(supabasePatients.map(p => p.id))
        
        localStoragePatients.forEach((localPatient: Patient) => {
          if (!existingIds.has(localPatient.id)) {
            allPatients.push(localPatient)
            existingIds.add(localPatient.id)
          }
        })

        const matchedPatients = allPatients.filter(patient => 
          patient.name.toLowerCase() === prescriptionMatch.patientName.toLowerCase() ||
          patient.phone === prescriptionMatch.phone ||
          patient.email?.toLowerCase() === prescriptionMatch.email?.toLowerCase()
        )

        if (matchedPatients.length > 0) {
          setSearchResults(matchedPatients)
          setSelectedPatient(matchedPatients[0])
          toast({
            title: "✅ Patient Found",
            description: `Found ${matchedPatients.length} patient record(s) matching prescription ID: ${searchQuery}`,
          })
        } else {
          toast({
            title: "⚠️ Patient Not Found in Appointments",
            description: "Prescription record found, but patient is not in current appointment list.",
            variant: "destructive",
          })
        }
      } else {
        // Also search directly in patient records by various fields
        const { data, error } = await getPatients()
        if (error) throw error

        const supabasePatients = data || []
        const localStoragePatients = JSON.parse(localStorage.getItem("gonstead_patients") || "[]")
        
        // Merge with deduplication
        const allPatients = [...supabasePatients]
        const existingIds = new Set(supabasePatients.map(p => p.id))
        
        localStoragePatients.forEach((localPatient: Patient) => {
          if (!existingIds.has(localPatient.id)) {
            allPatients.push(localPatient)
            existingIds.add(localPatient.id)
          }
        })

        const directMatches = allPatients.filter(patient => 
          patient.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.phone.includes(searchQuery) ||
          patient.email?.toLowerCase().includes(searchQuery.toLowerCase())
        )

        if (directMatches.length > 0) {
          setSearchResults(directMatches)
          setSelectedPatient(directMatches[0])
          toast({
            title: "✅ Patient Found",
            description: `Found ${directMatches.length} patient record(s) matching: ${searchQuery}`,
          })
        } else {
          setSearchResults([])
          setSelectedPatient(null)
          toast({
            title: "❌ No Results Found",
            description: "No patients found matching your search criteria.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "Search Error",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const getPatientPrescriptions = (patient: Patient) => {
    return prescriptionRecords.filter(record => 
      record.patientName.toLowerCase() === patient.name.toLowerCase() &&
      record.phone === patient.phone
    )
  }

  const getStatusColor = (status?: string) => {
    switch ((status || 'pending').toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUrgencyColor = (urgency?: string) => {
    switch ((urgency || 'normal').toLowerCase()) {
      case 'emergency': return 'bg-red-100 text-red-800'
      case 'urgent': return 'bg-orange-100 text-orange-800'
      case 'normal': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPrescriptionStatus = (prescription: PrescriptionRecord): { label: string; color: string; icon: any } => {
    // Check if prescription has been explicitly saved (has savedAt timestamp)
    const hasBeenSaved = prescription.status === 'saved' && prescription.savedAt
    const isSynced = prescription.isSynced === true
    const isActive = prescription.status === 'active' // Generated but not manually saved
    
    if (hasBeenSaved && isSynced) {
      return { label: 'Saved & Synced', color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCheck }
    } else if (hasBeenSaved) {
      return { label: 'Saved Locally', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: Save }
    } else if (isActive) {
      return { label: 'Generated', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: AlertTriangle }
    } else {
      return { label: 'Not Saved', color: 'bg-gray-100 text-gray-800 border-gray-300', icon: AlertTriangle }
    }
  }

  const handleSavePrescription = (prescription: PrescriptionRecord) => {
    try {
      // Update prescription status to saved
      const updatedPrescription = {
        ...prescription,
        status: 'saved' as const,
        savedAt: new Date().toISOString(),
        isSynced: true
      }

      // Update in prescriptionRecords state
      const updatedRecords = prescriptionRecords.map(p => 
        p.id === prescription.id ? updatedPrescription : p
      )
      setPrescriptionRecords(updatedRecords)

      // Save to localStorage
      localStorage.setItem("prescription_records", JSON.stringify(updatedRecords))

      toast({
        title: "✅ Prescription Saved",
        description: `Prescription ${prescription.id} has been saved successfully`,
      })
    } catch (error) {
      console.error("Error saving prescription:", error)
      toast({
        title: "Error",
        description: "Failed to save prescription",
        variant: "destructive",
      })
    }
  }

  const handleExportPrescriptionTXT = (prescription: PrescriptionRecord, patient: Patient) => {
    try {
      const txtContent = `
╔══════════════════════════════════════════════════════════════════╗
║                 GONSTEAD CHIROPRACTIC CLINIC                     ║
║                   PRESCRIPTION EXPORT DOCUMENT                   ║
║                  Dr. Bashir Khan - Gonstead Certified            ║
╚══════════════════════════════════════════════════════════════════╝

PRESCRIPTION ID: ${prescription.id}
EXPORT DATE: ${new Date().toLocaleString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PATIENT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${prescription.patientName}
Phone: ${prescription.phone}
Email: ${prescription.email || 'Not provided'}
Patient ID: ${prescription.patientId || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRESCRIPTION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Prescription Date: ${new Date(prescription.prescriptionDate).toLocaleString()}
Status: ${prescription.status || 'Active'}
Generated By: ${prescription.generatedBy || 'Admin Dashboard'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MEDICATIONS & TREATMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${prescription.medications || 'No medications specified'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLINICAL NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${prescription.notes || 'No additional notes'}

${prescription.chiropracticSuggestions && prescription.chiropracticSuggestions.length > 0 ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHIROPRACTIC CARE RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${prescription.chiropracticSuggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}
` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPOINTMENT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Appointment Date: ${new Date(patient.appointment_date).toLocaleDateString()}
Appointment Time: ${new Date(patient.appointment_date).toLocaleTimeString()}
Session Type: ${patient.session_type === 'in_clinic' ? 'In-Clinic Treatment' : 'Video Consultation'}
Sessions Completed: ${patient.sessions_completed || 0}
Payment Method: ${patient.payment_method.toUpperCase()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CLINIC INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Dr. Bashir Khan, DCP
Gonstead Certified Chiropractic Specialist
Near Peshawar Model School, Tehsil Road, Nowshera
Phone: +92 304 699 6267

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Document Generated: ${new Date().toLocaleString()}
Exported from Gonstead Chiropractic Patient Tracking System
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `

      const blob = new Blob([txtContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Prescription_${prescription.id}_${prescription.patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: "📄 Prescription Exported",
        description: `Prescription ${prescription.id} exported as TXT file`,
      })
    } catch (error) {
      console.error("Error exporting prescription:", error)
      toast({
        title: "Error",
        description: "Failed to export prescription",
        variant: "destructive",
      })
    }
  }

  const handleExportPrescriptionJSON = (prescription: PrescriptionRecord, patient: Patient) => {
    try {
      const jsonData = {
        prescriptionId: prescription.id,
        exportDate: new Date().toISOString(),
        patient: {
          name: prescription.patientName,
          phone: prescription.phone,
          email: prescription.email,
          patientId: prescription.patientId
        },
        prescription: {
          date: prescription.prescriptionDate,
          medications: prescription.medications,
          notes: prescription.notes,
          chiropracticSuggestions: prescription.chiropracticSuggestions,
          status: prescription.status,
          generatedBy: prescription.generatedBy,
          savedAt: prescription.savedAt
        },
        appointment: {
          appointmentDate: patient.appointment_date,
          sessionType: patient.session_type,
          sessionsCompleted: patient.sessions_completed,
          paymentMethod: patient.payment_method,
          status: patient.status,
          urgency: patient.urgency
        },
        clinic: {
          name: 'Gonstead Chiropractic Clinic',
          doctor: 'Dr. Bashir Khan',
          address: 'Near Peshawar Model School, Tehsil Road, Nowshera',
          phone: '+92 304 699 6267'
        }
      }

      const jsonString = JSON.stringify(jsonData, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Prescription_${prescription.id}_${prescription.patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)

      toast({
        title: "📋 Prescription Exported",
        description: `Prescription ${prescription.id} exported as JSON file`,
      })
    } catch (error) {
      console.error("Error exporting prescription:", error)
      toast({
        title: "Error",
        description: "Failed to export prescription",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(220,230,229)] to-[rgb(174,193,192)]">
      {/* Professional Header */}
      <header className="relative bg-white/20 backdrop-blur-xl shadow-[0_4px_16px_rgba(13,92,117,0.10)] border-0 p-4 overflow-hidden mx-4 mt-4 rounded-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d5c75]/5 via-white/10 to-[#2a9d8f]/5 animate-pulse"></div>
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        
        <div className="relative z-10 container mx-auto">
          <div className="flex items-center justify-between">
            {/* Left Section - Logo and Title */}
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => router.push('/admin/dashboard')}
                className="border-[#0d5c75] text-[#0d5c75] hover:bg-[#0d5c75] hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              
              <div className="w-16 h-16 relative">
                <div className="w-16 h-16 bg-gradient-to-br from-white/90 to-white/80 backdrop-blur-xl rounded-2xl border-2 border-white/30 shadow-2xl flex items-center justify-center">
                  <Image
                    src="/images/gonstead-chiropractic-logo-new.png"
                    alt="Gonstead Logo"
                    width={44}
                    height={44}
                    className="object-contain"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-[#0d5c75] font-poppins tracking-wide">
                  Patient Tracking System
                </h1>
                <p className="text-base font-semibold text-[#2a9d8f]">
                  Track & Monitor Patient Records
                </p>
                <p className="text-xs text-gray-600 font-medium">
                  Search by Prescription ID or Patient Information
                </p>
              </div>
            </div>

            {/* Right Section - Quick Stats */}
            <div className="flex items-center gap-4">
                  <div className="text-right space-y-2">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                  <p className="text-sm font-semibold text-white">
                    📋 Total Prescriptions: {prescriptionRecords.length}
                  </p>
                  <p className="text-xs text-white/80">
                    🔍 Searchable Records Available
                  </p>
                </div>
                <p className="text-xs text-white/70">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <Card className="mb-8 shadow-xl border-[#0d5c75]/20">
          <CardHeader className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white">
            <CardTitle className="flex items-center gap-2 font-poppins">
              <Search className="h-5 w-5" />
              Patient Search & Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="search" className="text-sm font-semibold text-[#0d5c75] mb-2 block">
                  🔍 Search by Prescription ID, Patient Name, Phone, or Email
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Enter prescription ID (e.g., RX001) or patient information..."
                    className="text-base pl-10 border-[#0d5c75]/30 focus:border-[#0d5c75] focus:ring-[#0d5c75]/20"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              <Button
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-[#0d5c75] hover:bg-[#0a4a5c] text-white px-8"
              >
                {isSearching ? (
                  <Timer className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {isSearching ? "Searching..." : "Search Patient"}
              </Button>
            </div>

            {/* Search Tips and Quick Stats */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-medium mb-1">💡 Search Tips:</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Use prescription ID for exact prescription-based tracking</li>
                  <li>• Search by patient name, phone number, or email address</li>
                  <li>• Partial matches are supported for flexible searching</li>
                </ul>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 font-medium mb-2">📊 Quick Stats:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-700">{prescriptionRecords.length}</p>
                    <p className="text-xs text-green-600">Total Prescriptions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-700">{searchResults.length}</p>
                    <p className="text-xs text-blue-600">Search Results</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Results List */}
            <div className="lg:col-span-1">
              <Card className="shadow-xl border-[#0d5c75]/20">
                <CardHeader className="bg-[#2a9d8f] text-white">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Search Results ({searchResults.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    {searchResults.map((patient) => (
                      <div
                        key={patient.id}
                        onClick={() => setSelectedPatient(patient)}
                        className={`p-4 border-b cursor-pointer transition-colors hover:bg-gray-50 ${
                          selectedPatient?.id === patient.id ? 'bg-blue-50 border-l-4 border-l-[#0d5c75]' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-[#0d5c75]">{patient.name}</h3>
                            <p className="text-sm text-gray-600">{patient.phone}</p>
                            <p className="text-xs text-gray-500">{patient.email || "No email"}</p>
                          </div>
                          <div className="flex flex-col items-end space-y-1">
                            <Badge className={`text-xs ${getStatusColor(patient.status)}`}>
                              {patient.status}
                            </Badge>
                            <Badge className={`text-xs ${getUrgencyColor(patient.urgency)}`}>
                              {patient.urgency}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Patient Details */}
            <div className="lg:col-span-2">
              {selectedPatient && (
                <div className="space-y-6">
                  {/* Patient Information Card */}
                  <Card className="shadow-xl border-[#0d5c75]/20">
                    <CardHeader className="bg-[#0d5c75] text-white">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <User className="h-6 w-6" />
                        Patient Information - {selectedPatient.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-semibold text-gray-700">Full Name</Label>
                            <p className="text-lg font-medium text-[#0d5c75]">{selectedPatient.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <div>
                              <Label className="text-sm font-semibold text-gray-700">Phone</Label>
                              <p className="text-base">{selectedPatient.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <div>
                              <Label className="text-sm font-semibold text-gray-700">Email</Label>
                              <p className="text-base">{selectedPatient.email || "Not provided"}</p>
                            </div>
                          </div>
                          {selectedPatient.profession && (
                            <div>
                              <Label className="text-sm font-semibold text-gray-700">Profession</Label>
                              <p className="text-base">{selectedPatient.profession.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                            </div>
                          )}
                        </div>

                        {/* Appointment Information */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                              <Label className="text-sm font-semibold text-gray-700">Appointment Date</Label>
                              <p className="text-base">{new Date(selectedPatient.appointment_date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <div>
                              <Label className="text-sm font-semibold text-gray-700">Appointment Time</Label>
                              <p className="text-base">{new Date(selectedPatient.appointment_date).toLocaleTimeString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <div>
                              <Label className="text-sm font-semibold text-gray-700">Session Type</Label>
                              <p className="text-base">{selectedPatient.session_type === 'in_clinic' ? 'In-Clinic Treatment' : 'Video Consultation'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <div>
                              <Label className="text-sm font-semibold text-gray-700">Payment Method</Label>
                              <p className="text-base">{selectedPatient.payment_method.toUpperCase()}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status and Progress */}
                      <div className="mt-6 pt-6 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <Label className="text-sm font-semibold text-gray-700 block">Status</Label>
                            <Badge className={`mt-1 ${getStatusColor(selectedPatient.status)}`}>
                              {selectedPatient.status.charAt(0).toUpperCase() + selectedPatient.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <Label className="text-sm font-semibold text-gray-700 block">Urgency</Label>
                            <Badge className={`mt-1 ${getUrgencyColor(selectedPatient.urgency)}`}>
                              {selectedPatient.urgency.charAt(0).toUpperCase() + selectedPatient.urgency.slice(1)}
                            </Badge>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <Label className="text-sm font-semibold text-gray-700 block">Sessions</Label>
                            <p className="text-xl font-bold text-[#0d5c75] mt-1">{selectedPatient.sessions_completed || 0}</p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <Label className="text-sm font-semibold text-gray-700 block">Last Visit</Label>
                            <p className="text-sm font-medium mt-1">
                              {selectedPatient.last_visit 
                                ? new Date(selectedPatient.last_visit).toLocaleDateString()
                                : "First visit"
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Clinical Notes */}
                  {selectedPatient.notes && (
                    <Card className="shadow-xl border-[#0d5c75]/20">
                      <CardHeader className="bg-green-600 text-white">
                        <CardTitle className="flex items-center gap-2">
                          <Stethoscope className="h-5 w-5" />
                          Clinical Notes
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                          {selectedPatient.notes}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Prescription History */}
                  <Card className="shadow-xl border-[#0d5c75]/20">
                    <CardHeader className="bg-[#2a9d8f] text-white">
                      <CardTitle className="flex items-center gap-2">
                        <Pill className="h-5 w-5" />
                        Prescription History ({getPatientPrescriptions(selectedPatient).length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {getPatientPrescriptions(selectedPatient).length > 0 ? (
                        <div className="space-y-4">
                          {getPatientPrescriptions(selectedPatient).map((prescription, index) => {
                            const status = getPrescriptionStatus(prescription)
                            const StatusIcon = status.icon
                            
                            return (
                              <div key={prescription.id} className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-semibold text-[#0d5c75] flex items-center gap-2">
                                      <Pill className="h-4 w-4" />
                                      Prescription ID: {prescription.id}
                                    </h4>
                                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                      <Calendar className="h-3 w-3" />
                                      Date: {new Date(prescription.prescriptionDate).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                                    <Badge className={`text-xs flex items-center gap-1 ${status.color}`}>
                                      <StatusIcon className="h-3 w-3" />
                                      {status.label}
                                    </Badge>
                                  </div>
                                </div>
                                {prescription.medications && (
                                  <div className="mb-2">
                                    <Label className="text-sm font-semibold text-gray-700">Medications:</Label>
                                    <p className="text-sm text-gray-600 mt-1">{prescription.medications}</p>
                                  </div>
                                )}
                                {prescription.notes && (
                                  <div className="mb-3">
                                    <Label className="text-sm font-semibold text-gray-700">Notes:</Label>
                                    <p className="text-sm text-gray-600 mt-1">{prescription.notes}</p>
                                  </div>
                                )}
                                
                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-blue-200">
                                  {/* Save Button - show for Generated or Not Saved prescriptions */}
                                  {(status.label === 'Generated' || status.label === 'Not Saved') && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleSavePrescription(prescription)}
                                      className="bg-[#0d5c75] hover:bg-[#0a4a5c] text-white text-xs h-8"
                                    >
                                      <Save className="h-3 w-3 mr-1" />
                                      Save to Storage
                                    </Button>
                                  )}
                                  
                                  {/* Export as TXT */}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleExportPrescriptionTXT(prescription, selectedPatient)}
                                    className="border-[#2a9d8f] text-[#2a9d8f] hover:bg-[#2a9d8f] hover:text-white text-xs h-8"
                                  >
                                    <FileDown className="h-3 w-3 mr-1" />
                                    Export TXT
                                  </Button>
                                  
                                  {/* Export as JSON */}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleExportPrescriptionJSON(prescription, selectedPatient)}
                                    className="border-[#8b5cf6] text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white text-xs h-8"
                                  >
                                    <FileJson className="h-3 w-3 mr-1" />
                                    Export JSON
                                  </Button>
                                </div>
                                
                                {/* Saved timestamp */}
                                {prescription.savedAt && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    💾 Saved: {new Date(prescription.savedAt).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Pill className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No prescription records found for this patient</p>
                          <p className="text-sm text-gray-400 mt-1">
                            Prescriptions will appear here after they are generated
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-center">
                    <Button
                      onClick={() => router.push('/admin/dashboard')}
                      className="bg-[#0d5c75] hover:bg-[#0a4a5c] text-white"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View in Dashboard
                    </Button>
                    <Button
                      onClick={() => router.push('/medical-history')}
                      variant="outline"
                      className="border-[#2a9d8f] text-[#2a9d8f] hover:bg-[#2a9d8f] hover:text-white"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Medical Records
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && searchResults.length === 0 && searchQuery === "" && (
          <Card className="shadow-xl border-[#0d5c75]/20">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-[#0d5c75] to-[#2a9d8f] rounded-full flex items-center justify-center mb-6">
                <Search className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#0d5c75] mb-3">
                Patient Tracking System Ready
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Use the search functionality above to track patients by prescription ID or personal information. 
                Get detailed insights into patient appointments, prescriptions, and treatment history.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Activity className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-blue-800">Real-time Tracking</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-green-800">Complete Records</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-purple-800">Prescription History</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
