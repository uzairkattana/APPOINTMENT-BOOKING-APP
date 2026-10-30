"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Search,
  Filter,
  FileText,
  User,
  Phone,
  Activity,
  Stethoscope,
  Printer,
  Eye,
  Edit,
  Plus,
  ArrowLeft,
  CheckCircle,
  TrendingUp,
  ClipboardList,
  RefreshCw,
  Trash2,
  Save,
  X,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Interface for medical records
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

export default function MedicalHistoryPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [treatmentFilter, setTreatmentFilter] = useState("all")
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // New Record Dialog State
  const [isNewRecordDialogOpen, setIsNewRecordDialogOpen] = useState(false)
  const [newRecord, setNewRecord] = useState<Partial<MedicalRecord>>({
    patientName: '',
    age: 0,
    gender: '',
    phone: '',
    email: '',
    diagnosis: '',
    treatmentType: 'Gonstead Adjustment',
    status: 'Ongoing',
    sessionsCompleted: 0,
    totalSessions: 8,
    chiefComplaint: '',
    medicalHistory: '',
    currentMedications: '',
    treatmentPlan: '',
    progress: '',
    doctorNotes: ''
  })
  
  // Edit Record State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null)

  // Toast hook
  const { toast } = useToast()

  // New Record Handler
  const handleNewRecord = () => {
    setNewRecord({
      patientName: '',
      age: 0,
      gender: '',
      phone: '',
      email: '',
      diagnosis: '',
      treatmentType: 'Gonstead Adjustment',
      status: 'Ongoing',
      sessionsCompleted: 0,
      totalSessions: 8,
      chiefComplaint: '',
      medicalHistory: '',
      currentMedications: '',
      treatmentPlan: '',
      progress: '',
      doctorNotes: ''
    })
    setIsNewRecordDialogOpen(true)
  }

  // Save New Record
  const handleSaveNewRecord = () => {
    try {
      // Validate required fields
      if (!newRecord.patientName || !newRecord.phone) {
        toast({
          title: "Validation Error",
          description: "Patient name and phone are required fields.",
          variant: "destructive",
        })
        return
      }

      // Create complete record
      const completeRecord: MedicalRecord = {
        id: `MR${String(records.length + 1).padStart(3, '0')}`,
        patientName: newRecord.patientName || '',
        age: newRecord.age || 0,
        gender: newRecord.gender || 'Not specified',
        phone: newRecord.phone || '',
        email: newRecord.email || 'Not provided',
        lastVisit: new Date().toISOString().split('T')[0],
        diagnosis: newRecord.diagnosis || 'Pending evaluation',
        treatmentType: newRecord.treatmentType || 'Gonstead Adjustment',
        status: newRecord.status || 'Ongoing',
        sessionsCompleted: newRecord.sessionsCompleted || 0,
        totalSessions: newRecord.totalSessions || 8,
        nextAppointment: 'To be scheduled',
        chiefComplaint: newRecord.chiefComplaint || 'To be assessed',
        medicalHistory: newRecord.medicalHistory || 'Medical history to be collected',
        currentMedications: newRecord.currentMedications || 'To be determined',
        treatmentPlan: newRecord.treatmentPlan || 'Treatment plan to be developed',
        progress: newRecord.progress || 'Initial assessment',
        doctorNotes: newRecord.doctorNotes || 'New medical record created'
      }

      // Add to records
      const updatedRecords = [completeRecord, ...records]
      setRecords(updatedRecords)
      setFilteredRecords(updatedRecords)

      // Save to localStorage
      localStorage.setItem("medical_records", JSON.stringify(updatedRecords))

      // Close dialog and show success message
      setIsNewRecordDialogOpen(false)
      toast({
        title: "✅ Medical Record Created",
        description: `New medical record for ${completeRecord.patientName} has been successfully created.`,
      })
    } catch (error) {
      console.error('Error creating medical record:', error)
      toast({
        title: "Error",
        description: "Failed to create medical record. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Edit Record Handler
  const handleEditRecord = (record: MedicalRecord) => {
    setEditingRecord({ ...record })
    setIsEditDialogOpen(true)
  }

  // Save Edited Record
  const handleSaveEditedRecord = () => {
    try {
      if (!editingRecord) return

      // Validate required fields
      if (!editingRecord.patientName || !editingRecord.phone) {
        toast({
          title: "Validation Error",
          description: "Patient name and phone are required fields.",
          variant: "destructive",
        })
        return
      }

      // Update records
      const updatedRecords = records.map(record => 
        record.id === editingRecord.id ? editingRecord : record
      )
      setRecords(updatedRecords)
      setFilteredRecords(updatedRecords)

      // Save to localStorage
      localStorage.setItem("medical_records", JSON.stringify(updatedRecords))

      // Close dialog and show success message
      setIsEditDialogOpen(false)
      setEditingRecord(null)
      toast({
        title: "✅ Medical Record Updated",
        description: `Medical record for ${editingRecord.patientName} has been successfully updated.`,
      })
    } catch (error) {
      console.error('Error updating medical record:', error)
      toast({
        title: "Error",
        description: "Failed to update medical record. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Remove Record Handler
  const handleRemoveRecord = (recordId: string) => {
    try {
      const recordToRemove = records.find(r => r.id === recordId)
      if (!recordToRemove) return

      // Confirm deletion
      if (window.confirm(`Are you sure you want to permanently delete the medical record for ${recordToRemove.patientName}?`)) {
        // Remove from records
        const updatedRecords = records.filter(record => record.id !== recordId)
        setRecords(updatedRecords)
        setFilteredRecords(updatedRecords)

        // Save to localStorage
        localStorage.setItem("medical_records", JSON.stringify(updatedRecords))

        // Show success message
        toast({
          title: "🗑️ Medical Record Deleted",
          description: `Medical record for ${recordToRemove.patientName} has been permanently removed.`,
        })
      }
    } catch (error) {
      console.error('Error removing medical record:', error)
      toast({
        title: "Error",
        description: "Failed to remove medical record. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Check for auto-edit functionality when redirected from admin
  useEffect(() => {
    const editRecordId = localStorage.getItem('editMedicalRecordId')
    if (editRecordId) {
      // Clear the flag
      localStorage.removeItem('editMedicalRecordId')
      
      // Find and open the record for editing after records are loaded
      setTimeout(() => {
        const recordToEdit = records.find(record => record.id === editRecordId)
        if (recordToEdit) {
          handleEditRecord(recordToEdit)
          toast({
            title: "📝 Medical Record Ready for Edit",
            description: `You can now edit the medical record for ${recordToEdit.patientName} and print it when ready.`,
          })
        }
      }, 500) // Small delay to ensure records are loaded
    }
  }, [records]) // Depend on records to trigger when they're loaded

  // Load real medical records from Supabase AND localStorage
  useEffect(() => {
    const loadMedicalRecords = async () => {
      try {
        setIsLoading(true)
        console.log('[Medical History] Loading records from Supabase...')
        
        // Load from Firestore via data-service FIRST (primary source)
        try {
          const { getPatients } = await import('@/lib/data-service')
          const { data: supabasePatients, error } = await getPatients()
          
          if (!error && supabasePatients && supabasePatients.length > 0) {
            console.log(`[Medical History] Loaded ${supabasePatients.length} patients from Supabase`)
            
            // Convert Supabase patients to medical records format
            const convertedRecords = supabasePatients.map((patient: any, index: number) => ({
              id: patient.id || `MR${String(index + 1).padStart(3, '0')}`,
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
              totalSessions: patient.total_sessions || 8,
              nextAppointment: patient.appointment_date || 'To be scheduled',
              chiefComplaint: patient.notes || 'General consultation',
              medicalHistory: patient.medical_history || 'Medical history to be collected during consultation',
              currentMedications: 'To be determined during consultation',
              treatmentPlan: patient.treatment_plan?.goals || 'Gonstead chiropractic assessment and treatment plan',
              progress: patient.treatment_plan?.progress || 'Initial assessment pending',
              doctorNotes: patient.booking_source === 'admin_dashboard' 
                ? 'Patient added via admin dashboard. Assessment in progress.'
                : 'Patient booked online. Initial consultation scheduled.'
            }))
            
            setRecords(convertedRecords)
            setFilteredRecords(convertedRecords)
            
            // Also save to localStorage for offline access
            try {
              localStorage.setItem("medical_records", JSON.stringify(convertedRecords))
              console.log('[Medical History] Saved to localStorage for offline access')
            } catch (storageError) {
              console.warn('[Medical History] localStorage save failed:', storageError)
            }
            
            setIsLoading(false)
            return // Exit early if Supabase load was successful
          }
        } catch (supabaseError) {
          console.error('[Medical History] Supabase load failed:', supabaseError)
        }
        
        // FALLBACK: Load from localStorage if Supabase fails
        console.log('[Medical History] Falling back to localStorage...')
        const storedRecords = localStorage.getItem("medical_records")
        
        if (storedRecords) {
          const parsedRecords: MedicalRecord[] = JSON.parse(storedRecords)
          console.log(`[Medical History] Loaded ${parsedRecords.length} records from localStorage`)
          setRecords(parsedRecords)
          setFilteredRecords(parsedRecords)
        } else {
          // Last resort: check gonstead_patients in localStorage
          const patientRecords = localStorage.getItem("gonstead_patients")
          if (patientRecords) {
            const patients = JSON.parse(patientRecords)
            console.log(`[Medical History] Converting ${patients.length} patient records from localStorage`)
            const convertedRecords = patients.map((patient: any, index: number) => ({
              id: `MR${String(index + 1).padStart(3, '0')}`,
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
              doctorNotes: patient.booking_source === 'admin_dashboard' 
                ? 'Patient added via admin dashboard. Assessment in progress.'
                : 'Patient booked online. Initial consultation scheduled.'
            }))
            
            setRecords(convertedRecords)
            setFilteredRecords(convertedRecords)
            localStorage.setItem("medical_records", JSON.stringify(convertedRecords))
          } else {
            console.log('[Medical History] No records found in any source')
          }
        }
      } catch (error) {
        console.error('[Medical History] Error loading medical records:', error)
        setRecords([])
        setFilteredRecords([])
      } finally {
        setIsLoading(false)
      }
    }

    loadMedicalRecords()

    // Listen for real-time updates from admin dashboard or booking system
    const handleStorageChange = () => {
      loadMedicalRecords()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Listen for custom events from admin or booking components
    const handleMedicalRecordsUpdate = () => {
      loadMedicalRecords()
    }
    
    window.addEventListener('medicalRecordsUpdated', handleMedicalRecordsUpdate)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('medicalRecordsUpdated', handleMedicalRecordsUpdate)
    }
  }, [])

  // Manual refresh function - Force reload from Supabase
  const handleRefresh = async () => {
    setIsLoading(true)
    console.log('[Medical History] Manual refresh triggered - loading from Supabase...')
    
    try {
      // Force reload from Firestore
      const { getPatients } = await import('@/lib/data-service')
      const { data: supabasePatients, error } = await getPatients()
      
      if (!error && supabasePatients && supabasePatients.length > 0) {
        console.log(`[Medical History] Refreshed ${supabasePatients.length} patients from Supabase`)
        
        // Convert to medical records format
        const convertedRecords = supabasePatients.map((patient: any, index: number) => ({
          id: patient.id || `MR${String(index + 1).padStart(3, '0')}`,
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
          totalSessions: patient.total_sessions || 8,
          nextAppointment: patient.appointment_date || 'To be scheduled',
          chiefComplaint: patient.notes || 'General consultation',
          medicalHistory: patient.medical_history || 'Medical history to be collected during consultation',
          currentMedications: 'To be determined during consultation',
          treatmentPlan: patient.treatment_plan?.goals || 'Gonstead chiropractic assessment and treatment plan',
          progress: patient.treatment_plan?.progress || 'Initial assessment pending',
          doctorNotes: patient.booking_source === 'admin_dashboard' 
            ? 'Patient added via admin dashboard. Assessment in progress.'
            : 'Patient booked online. Initial consultation scheduled.'
        }))
        
        setRecords(convertedRecords)
        setFilteredRecords(convertedRecords)
        
        // Update localStorage
        try {
          localStorage.setItem("medical_records", JSON.stringify(convertedRecords))
        } catch {}
        
        toast({
          title: "✅ Records Refreshed",
          description: `Loaded ${convertedRecords.length} medical records from database`,
        })
      } else {
        console.log('[Medical History] No records in Supabase, checking localStorage...')
        
        // Fallback to localStorage
        const storedRecords = localStorage.getItem("medical_records")
        const patientRecords = localStorage.getItem("gonstead_patients")
        
        if (storedRecords) {
          const parsedRecords = JSON.parse(storedRecords)
          setRecords(parsedRecords)
          setFilteredRecords(parsedRecords)
        } else if (patientRecords) {
          const patients = JSON.parse(patientRecords)
          const convertedRecords = patients.map((patient: any, index: number) => ({
            id: `MR${String(index + 1).padStart(3, '0')}`,
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
            doctorNotes: patient.booking_source === 'admin_dashboard' 
              ? 'Patient added via admin dashboard. Assessment in progress.'
              : 'Patient booked online. Initial consultation scheduled.'
          }))
          
          setRecords(convertedRecords)
          setFilteredRecords(convertedRecords)
          localStorage.setItem("medical_records", JSON.stringify(convertedRecords))
        } else {
          setRecords([])
          setFilteredRecords([])
        }
        
        toast({
          title: "ℹ️ No Records Found",
          description: "No medical records found in database or local storage",
        })
      }
    } catch (error) {
      console.error('[Medical History] Refresh error:', error)
      toast({
        title: "Error",
        description: "Failed to refresh records. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter records based on search and filter criteria
  useEffect(() => {
    let filtered = records

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((record) => record.status.toLowerCase() === statusFilter.toLowerCase())
    }

    // Treatment filter
    if (treatmentFilter !== "all") {
      filtered = filtered.filter((record) => record.treatmentType.toLowerCase().includes(treatmentFilter.toLowerCase()))
    }

    setFilteredRecords(filtered)
  }, [searchTerm, statusFilter, treatmentFilter, records])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "ongoing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "follow-up":
        return "text-[rgb(70,100,70)] dark:text-[rgb(150,200,150)]" 
      // Custom inline styling for follow-up status with light green background
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const handleViewDetails = (record: MedicalRecord) => {
    setSelectedRecord(record)
    setIsDetailModalOpen(true)
  }

  const handlePrintRecord = (record: MedicalRecord) => {
    // Navigate to professional print page
    window.open(`/medical-record-print/${record.id}`, '_blank')
  }

  // Statistics
  const totalRecords = records.length
  const completedRecords = records.filter((r) => r.status === "Completed").length
  const ongoingRecords = records.filter((r) => r.status === "Ongoing").length
  const followUpRecords = records.filter((r) => r.status === "Follow-up").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 relative">
            <Image
              src="/images/gonstead-chiropractic-logo-new.png"
                    alt="Gonstead Chiropractic Logo"
                    fill
                    className="object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/gonstead-logo-new.png";
                    }}
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[#0d5c75] dark:text-white font-poppins">Medical History</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Patient Records Management</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleRefresh}
                variant="outline"
                className="border-[#0d5c75] text-[#0d5c75] hover:bg-[#0d5c75] hover:text-white"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Loading...' : 'Refresh Data'}
              </Button>
              <Button 
                onClick={handleNewRecord}
                className="bg-[#0d5c75] hover:bg-[#0a4a5c] text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Record
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-[#0d5c75]/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Records</p>
                  <p className="text-2xl font-bold text-[#0d5c75] dark:text-white">{totalRecords}</p>
                </div>
                <div className="w-12 h-12 bg-[#0d5c75]/10 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <FileText className="h-6 w-6 text-[#0d5c75] dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Completed</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedRecords}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Ongoing</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{ongoingRecords}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[rgb(200,230,200)] dark:border-[rgb(100,150,100)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Follow-up</p>
                  <p className="text-2xl font-bold" style={{ color: 'rgb(70,100,70)' }}>{followUpRecords}</p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(227,252,236,0.3)' }}>
                  <ClipboardList className="h-6 w-6" style={{ color: 'rgb(70,100,70)' }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 border-[#0d5c75]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0d5c75] dark:text-white">
              <Search className="h-5 w-5" />
              Search & Filter Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, diagnosis, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#0d5c75]/30 focus:border-[#0d5c75]"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-[#0d5c75]/30 focus:border-[#0d5c75]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                </SelectContent>
              </Select>

              <Select value={treatmentFilter} onValueChange={setTreatmentFilter}>
                <SelectTrigger className="border-[#0d5c75]/30 focus:border-[#0d5c75]">
                  <SelectValue placeholder="Filter by treatment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Treatments</SelectItem>
                  <SelectItem value="gonstead">Gonstead Technique</SelectItem>
                  <SelectItem value="postural">Postural Correction</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  setTreatmentFilter("all")
                }}
                className="border-[#0d5c75] text-[#0d5c75] hover:bg-[#0d5c75] hover:text-white"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Records List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin text-[#0d5c75] mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">Loading medical records...</p>
              </div>
            </div>
          ) : (
            filteredRecords.map((record) => (
              <Card key={record.id} className="border-[#0d5c75]/20 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Patient Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[#0d5c75] dark:text-blue-400" />
                        <h3 className="font-semibold text-[#0d5c75] dark:text-white">{record.patientName}</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {record.age} years • {record.gender}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {record.phone}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">ID: {record.id}</p>
                    </div>

                    {/* Medical Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-[#2a9d8f] dark:text-green-400" />
                        <h4 className="font-medium text-[#0d5c75] dark:text-white">Diagnosis</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{record.diagnosis}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{record.treatmentType}</p>
                      <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                    </div>

                    {/* Progress Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-[#2a9d8f] dark:text-green-400" />
                        <h4 className="font-medium text-[#0d5c75] dark:text-white">Progress</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {record.sessionsCompleted} of {record.totalSessions} sessions
                      </p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-[#2a9d8f] h-2 rounded-full"
                          style={{ width: `${(record.sessionsCompleted / record.totalSessions) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Last visit: {record.lastVisit}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => handleViewDetails(record)}
                        className="bg-[#0d5c75] hover:bg-[#0a4a5c] text-white"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        onClick={() => handlePrintRecord(record)}
                        variant="outline"
                        className="border-[#0d5c75] text-[#0d5c75] hover:bg-[#0d5c75] hover:text-white"
                        size="sm"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                      <Button
                        onClick={() => handleEditRecord(record)}
                        variant="outline"
                        className="border-[#2a9d8f] text-[#2a9d8f] hover:bg-[#2a9d8f] hover:text-white bg-transparent"
                        size="sm"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleRemoveRecord(record.id)}
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700 text-white"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {!isLoading && filteredRecords.length === 0 && (
          <Card className="border-[#0d5c75]/20">
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                {records.length === 0 ? 'No Medical Records Available' : 'No Records Found'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {records.length === 0 
                  ? 'No patient data found. Add patients through the admin dashboard or online booking to see medical records here.'
                  : 'No medical records match your current search criteria. Try adjusting your filters.'}
              </p>
              {records.length === 0 && (
                <Button 
                  onClick={handleRefresh}
                  className="mt-4 bg-[#0d5c75] hover:bg-[#0a4a5c] text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#0d5c75] dark:text-white">
              <FileText className="h-5 w-5" />
              Medical Record Details - {selectedRecord?.patientName}
            </DialogTitle>
            <DialogDescription>Complete medical record for patient ID: {selectedRecord?.id}</DialogDescription>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-6">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="medical">Medical Info</TabsTrigger>
                  <TabsTrigger value="treatment">Treatment</TabsTrigger>
                  <TabsTrigger value="progress">Progress</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-[#0d5c75] dark:text-white">Patient Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">Full Name</Label>
                        <p className="text-[#0d5c75] dark:text-white font-semibold">{selectedRecord.patientName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">Age & Gender</Label>
                        <p className="text-[#0d5c75] dark:text-white font-semibold">
                          {selectedRecord.age} years • {selectedRecord.gender}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">Phone</Label>
                        <p className="text-[#0d5c75] dark:text-white font-semibold">{selectedRecord.phone}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">Email</Label>
                        <p className="text-[#0d5c75] dark:text-white font-semibold">{selectedRecord.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">Last Visit</Label>
                        <p className="text-[#0d5c75] dark:text-white font-semibold">{selectedRecord.lastVisit}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">Status</Label>
                        <Badge className={getStatusColor(selectedRecord.status)}>{selectedRecord.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="medical" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-[#0d5c75] dark:text-white">Medical Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">Chief Complaint</Label>
                        <p className="text-[#0d5c75] dark:text-white">{selectedRecord.chiefComplaint}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">Diagnosis</Label>
                        <p className="text-[#0d5c75] dark:text-white font-semibold">{selectedRecord.diagnosis}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">Medical History</Label>
                        <p className="text-gray-700 dark:text-gray-300">{selectedRecord.medicalHistory}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          Current Medications
                        </Label>
                        <p className="text-gray-700 dark:text-gray-300">{selectedRecord.currentMedications}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="treatment" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-[#0d5c75] dark:text-white">Treatment Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">Treatment Type</Label>
                        <p className="text-[#0d5c75] dark:text-white font-semibold">{selectedRecord.treatmentType}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">Treatment Plan</Label>
                        <p className="text-gray-700 dark:text-gray-300">{selectedRecord.treatmentPlan}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">Doctor's Notes</Label>
                        <p className="text-gray-700 dark:text-gray-300">{selectedRecord.doctorNotes}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">Next Appointment</Label>
                        <p className="text-[#0d5c75] dark:text-white font-semibold">{selectedRecord.nextAppointment}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="progress" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-[#0d5c75] dark:text-white">Treatment Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          Sessions Progress
                        </Label>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                              <div
                                className="bg-[#2a9d8f] h-3 rounded-full"
                                style={{
                                  width: `${(selectedRecord.sessionsCompleted / selectedRecord.totalSessions) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-[#0d5c75] dark:text-white font-semibold">
                            {selectedRecord.sessionsCompleted} / {selectedRecord.totalSessions}
                          </span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-300">Progress Summary</Label>
                        <p className="text-gray-700 dark:text-gray-300">{selectedRecord.progress}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  onClick={() => handlePrintRecord(selectedRecord)}
                  variant="outline"
                  className="border-[#0d5c75] text-[#0d5c75] hover:bg-[#0d5c75] hover:text-white"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Record
                </Button>
                <Button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="bg-[#0d5c75] hover:bg-[#0a4a5c] text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Record Dialog */}
      <Dialog open={isNewRecordDialogOpen} onOpenChange={setIsNewRecordDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#0d5c75] dark:text-white font-poppins flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Medical Record
            </DialogTitle>
            <DialogDescription>Create a comprehensive medical record for a new patient</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Patient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0d5c75] dark:text-white">Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new-name">Patient Name *</Label>
                    <Input
                      id="new-name"
                      value={newRecord.patientName || ''}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, patientName: e.target.value }))}
                      placeholder="Enter patient full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-phone">Phone Number *</Label>
                    <Input
                      id="new-phone"
                      value={newRecord.phone || ''}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="new-age">Age</Label>
                    <Input
                      id="new-age"
                      type="number"
                      value={newRecord.age || 0}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                      placeholder="Age"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-gender">Gender</Label>
                    <Select value={newRecord.gender || ''} onValueChange={(value) => setNewRecord(prev => ({ ...prev, gender: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Not specified">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="new-email">Email</Label>
                    <Input
                      id="new-email"
                      type="email"
                      value={newRecord.email || ''}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Email address (optional)"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0d5c75] dark:text-white">Medical Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new-diagnosis">Diagnosis</Label>
                    <Input
                      id="new-diagnosis"
                      value={newRecord.diagnosis || ''}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, diagnosis: e.target.value }))}
                      placeholder="Primary diagnosis"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-treatment-type">Treatment Type</Label>
                    <Select value={newRecord.treatmentType || 'Gonstead Adjustment'} onValueChange={(value) => setNewRecord(prev => ({ ...prev, treatmentType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gonstead Adjustment">Gonstead Adjustment</SelectItem>
                        <SelectItem value="Video Consultation">Video Consultation</SelectItem>
                        <SelectItem value="Postural Correction">Postural Correction</SelectItem>
                        <SelectItem value="Manual Therapy">Manual Therapy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="new-complaint">Chief Complaint</Label>
                  <Textarea
                    id="new-complaint"
                    value={newRecord.chiefComplaint || ''}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, chiefComplaint: e.target.value }))}
                    placeholder="Patient's primary complaint or reason for visit"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="new-medical-history">Medical History</Label>
                  <Textarea
                    id="new-medical-history"
                    value={newRecord.medicalHistory || ''}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, medicalHistory: e.target.value }))}
                    placeholder="Previous medical conditions, surgeries, treatments"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="new-medications">Current Medications</Label>
                  <Textarea
                    id="new-medications"
                    value={newRecord.currentMedications || ''}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, currentMedications: e.target.value }))}
                    placeholder="Current medications, supplements, allergies"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Treatment Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="text-[#0d5c75] dark:text-white">Treatment Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new-status">Status</Label>
                    <Select value={newRecord.status || 'Ongoing'} onValueChange={(value) => setNewRecord(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ongoing">Ongoing</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Follow-up">Follow-up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="new-total-sessions">Total Sessions</Label>
                    <Input
                      id="new-total-sessions"
                      type="number"
                      value={newRecord.totalSessions || 8}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, totalSessions: parseInt(e.target.value) || 8 }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="new-treatment-plan">Treatment Plan</Label>
                  <Textarea
                    id="new-treatment-plan"
                    value={newRecord.treatmentPlan || ''}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, treatmentPlan: e.target.value }))}
                    placeholder="Detailed treatment plan and goals"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="new-doctor-notes">Doctor's Notes</Label>
                  <Textarea
                    id="new-doctor-notes"
                    value={newRecord.doctorNotes || ''}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, doctorNotes: e.target.value }))}
                    placeholder="Clinical observations and notes"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsNewRecordDialogOpen(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveNewRecord}
              className="bg-[#0d5c75] hover:bg-[#0a4a5c] text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Create Record
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Record Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#0d5c75] dark:text-white font-poppins flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Medical Record - {editingRecord?.patientName}
            </DialogTitle>
            <DialogDescription>Update medical record information for patient ID: {editingRecord?.id}</DialogDescription>
          </DialogHeader>
          
          {editingRecord && (
            <div className="space-y-6">
              {/* Patient Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#0d5c75] dark:text-white">Patient Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-name">Patient Name *</Label>
                      <Input
                        id="edit-name"
                        value={editingRecord.patientName}
                        onChange={(e) => setEditingRecord(prev => prev ? { ...prev, patientName: e.target.value } : null)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-phone">Phone Number *</Label>
                      <Input
                        id="edit-phone"
                        value={editingRecord.phone}
                        onChange={(e) => setEditingRecord(prev => prev ? { ...prev, phone: e.target.value } : null)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit-age">Age</Label>
                      <Input
                        id="edit-age"
                        type="number"
                        value={editingRecord.age}
                        onChange={(e) => setEditingRecord(prev => prev ? { ...prev, age: parseInt(e.target.value) || 0 } : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-gender">Gender</Label>
                      <Select value={editingRecord.gender} onValueChange={(value) => setEditingRecord(prev => prev ? { ...prev, gender: value } : null)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                          <SelectItem value="Not specified">Not specified</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editingRecord.email}
                        onChange={(e) => setEditingRecord(prev => prev ? { ...prev, email: e.target.value } : null)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medical Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#0d5c75] dark:text-white">Medical Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-diagnosis">Diagnosis</Label>
                      <Input
                        id="edit-diagnosis"
                        value={editingRecord.diagnosis}
                        onChange={(e) => setEditingRecord(prev => prev ? { ...prev, diagnosis: e.target.value } : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-treatment-type">Treatment Type</Label>
                      <Select value={editingRecord.treatmentType} onValueChange={(value) => setEditingRecord(prev => prev ? { ...prev, treatmentType: value } : null)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Gonstead Adjustment">Gonstead Adjustment</SelectItem>
                          <SelectItem value="Video Consultation">Video Consultation</SelectItem>
                          <SelectItem value="Postural Correction">Postural Correction</SelectItem>
                          <SelectItem value="Manual Therapy">Manual Therapy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-complaint">Chief Complaint</Label>
                    <Textarea
                      id="edit-complaint"
                      value={editingRecord.chiefComplaint}
                      onChange={(e) => setEditingRecord(prev => prev ? { ...prev, chiefComplaint: e.target.value } : null)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-medical-history">Medical History</Label>
                    <Textarea
                      id="edit-medical-history"
                      value={editingRecord.medicalHistory}
                      onChange={(e) => setEditingRecord(prev => prev ? { ...prev, medicalHistory: e.target.value } : null)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-medications">Current Medications</Label>
                    <Textarea
                      id="edit-medications"
                      value={editingRecord.currentMedications}
                      onChange={(e) => setEditingRecord(prev => prev ? { ...prev, currentMedications: e.target.value } : null)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Treatment Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#0d5c75] dark:text-white">Treatment Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="edit-status">Status</Label>
                      <Select value={editingRecord.status} onValueChange={(value) => setEditingRecord(prev => prev ? { ...prev, status: value } : null)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ongoing">Ongoing</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Follow-up">Follow-up</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-sessions-completed">Sessions Completed</Label>
                      <Input
                        id="edit-sessions-completed"
                        type="number"
                        value={editingRecord.sessionsCompleted}
                        onChange={(e) => setEditingRecord(prev => prev ? { ...prev, sessionsCompleted: parseInt(e.target.value) || 0 } : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-total-sessions">Total Sessions</Label>
                      <Input
                        id="edit-total-sessions"
                        type="number"
                        value={editingRecord.totalSessions}
                        onChange={(e) => setEditingRecord(prev => prev ? { ...prev, totalSessions: parseInt(e.target.value) || 8 } : null)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-treatment-plan">Treatment Plan</Label>
                    <Textarea
                      id="edit-treatment-plan"
                      value={editingRecord.treatmentPlan}
                      onChange={(e) => setEditingRecord(prev => prev ? { ...prev, treatmentPlan: e.target.value } : null)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-progress">Progress Summary</Label>
                    <Textarea
                      id="edit-progress"
                      value={editingRecord.progress}
                      onChange={(e) => setEditingRecord(prev => prev ? { ...prev, progress: e.target.value } : null)}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-doctor-notes">Doctor's Notes</Label>
                    <Textarea
                      id="edit-doctor-notes"
                      value={editingRecord.doctorNotes}
                      onChange={(e) => setEditingRecord(prev => prev ? { ...prev, doctorNotes: e.target.value } : null)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSaveEditedRecord}
              className="bg-[#2a9d8f] hover:bg-[#238a7a] text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Update Record
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
