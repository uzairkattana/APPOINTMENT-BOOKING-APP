"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ErrorBoundary } from "@/components/error-boundary"
import { getCurrentUser } from "@/lib/data-service"
import { PrescriptionData } from "@/lib/prescription-types"
import { prescriptionIdGenerator, PrescriptionIdData } from "@/lib/prescription-id-generator"
import { prescriptionSaveService, SavePrescriptionData } from "@/lib/prescription-save-service"
import Image from "next/image"
import { PreviewModal, SignaturePad, AnatomySelector, LogoUpload, TemplateGallery, QRCodeGenerator } from "@/components/prescription"

interface PrescriptionPatient {
  id?: string
  name: string
  age?: string
  gender?: string
  phone: string
  email?: string
  session_type?: string
  appointment_date?: string
  status?: string
  urgency?: string
  payment_method?: string
  notes?: string
  medical_history?: string
  sessions_completed?: number
  last_visit?: string
  created_at?: string
  updated_at?: string
}

const initialPatient: PrescriptionPatient = {
  name: "",
  phone: "",
  age: "",
  gender: "",
  email: ""
}

function PrescriptionPageContent() {
  const [patient, setPatient] = useState<PrescriptionPatient>(initialPatient)
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [conditionsVisible, setConditionsVisible] = useState(false)
  const [patientName, setPatientName] = useState("")
  const [patientAge, setPatientAge] = useState("")
  const [patientGender, setPatientGender] = useState("")
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0])
  const [birthDate, setBirthDate] = useState("")
  const [joiningDate, setJoiningDate] = useState("")
  const [treatmentPlan, setTreatmentPlan] = useState("")
  const [prescribedMedicine, setPrescribedMedicine] = useState("")
  const [totalSessions, setTotalSessions] = useState("")
  const [showDOB, setShowDOB] = useState(true)
  const [showJoining, setShowJoining] = useState(true)
  const [showTime, setShowTime] = useState(false)
  const [showSessions, setShowSessions] = useState(true)
  const [showMedicine, setShowMedicine] = useState(true)
  const [showSignatures, setShowSignatures] = useState(true)
  const [showPayment, setShowPayment] = useState(false)
  const [showTreatmentPrescription, setShowTreatmentPrescription] = useState(true)
  const [sessionFee, setSessionFee] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")
  const [showPatientPhone, setShowPatientPhone] = useState(false)
  const [showPatientEmail, setShowPatientEmail] = useState(false)
  const [showPatientAddress, setShowPatientAddress] = useState(false)
  const [customFields, setCustomFields] = useState<{[key: string]: string}>({})
  const [patientPhone, setPatientPhone] = useState("")
  const [patientEmail, setPatientEmail] = useState("")
  const [patientAddress, setPatientAddress] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [currentPrescriptionId, setCurrentPrescriptionId] = useState<PrescriptionIdData | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  // Visual components state
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showPatientSignaturePad, setShowPatientSignaturePad] = useState(false)
  const [showDoctorSignaturePad, setShowDoctorSignaturePad] = useState(false)
  const [patientSignature, setPatientSignature] = useState<string>("")
  const [doctorSignature, setDoctorSignature] = useState<string>("")
  const [clinicLogo, setClinicLogo] = useState<string>("")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("classic")
  const [showQRCode, setShowQRCode] = useState(false)
  
  const router = useRouter()
  const prescriptionRef = useRef<HTMLDivElement>(null)

  // Authentication check
  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      console.log("Prescription: Checking authentication...")

      // Check localStorage first to prevent loops
      const isAuthenticated = localStorage.getItem("admin_authenticated")
      const storedEmail = localStorage.getItem("admin_email")

      if (isAuthenticated === "true" && storedEmail) {
        console.log("Prescription: Found localStorage auth, proceeding...")
        setIsAuthenticated(true)
        setIsCheckingAuth(false)
        loadPatientData()
        return
      }

      // If no localStorage, check Supabase auth
      const { user, error } = await getCurrentUser()

      if (error) {
        console.error("Prescription: Auth error:", error)
        throw error
      }

      if (!user) {
        console.log("Prescription: No user found, redirecting to auth")
        router.replace("/admin/auth")
        return
      }

      console.log("Prescription: User authenticated:", user.email)

      // Store auth in localStorage to prevent future loops
      localStorage.setItem("admin_authenticated", "true")
      localStorage.setItem("admin_email", user.email || "")

      setIsAuthenticated(true)
      setIsCheckingAuth(false)
      loadPatientData()
    } catch (error) {
      console.error("Prescription: Auth check failed:", error)
      // Clear localStorage on auth failure
      localStorage.removeItem("admin_authenticated")
      localStorage.removeItem("admin_email")
      router.replace("/admin/auth")
    }
  }

  const loadPatientData = () => {
    try {
      const patientData = localStorage.getItem('prescriptionPatient')
      if (patientData) {
        const parsedData = JSON.parse(patientData)
        setPatient({
          ...initialPatient,
          ...parsedData
        })
        setPatientName(parsedData.name || "")
        setPatientAge(parsedData.age?.toString() || "")
        setPatientGender(parsedData.gender || "")
      }
    } catch (error) {
      console.error('Error loading patient data from localStorage:', error)
      // Reset to initial state if localStorage data is corrupted
      localStorage.removeItem('prescriptionPatient')
    }
  }

  // Generate prescription ID when component loads
  useEffect(() => {
    if (isAuthenticated && patientName) {
      generateNewPrescriptionId()
    }
  }, [isAuthenticated, patientName])

  const generateNewPrescriptionId = () => {
    const newId = prescriptionIdGenerator.generatePrescriptionId(patientName)
    setCurrentPrescriptionId(newId)
    console.log('Generated new prescription ID:', newId.id)
  }



  const savePrescriptionData = async () => {
    if (!currentPrescriptionId || !patientName) {
      console.log('Cannot save prescription: Missing prescription ID or patient name')
      return
    }

    setIsSaving(true)
    try {
      const prescriptionData: SavePrescriptionData = {
        prescriptionId: currentPrescriptionId.id,
        patientId: currentPrescriptionId.patientId,
        patientName,
        patientAge,
        patientGender,
        patientPhone,
        patientEmail,
        visitDate,
        birthDate,
        joiningDate,
        conditions: selectedConditions,
        treatmentPlan,
        prescribedMedicine,
        totalSessions: totalSessions || '0',
        sessionFee: sessionFee || '0',
        paymentMethod,
        paymentStatus,
        customFields
      }

      await prescriptionSaveService.savePrescription(prescriptionData)
      console.log('Prescription saved successfully:', currentPrescriptionId.id)
    } catch (error) {
      console.error('Error saving prescription:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const printPrescription = async () => {
    // Auto-save prescription before printing
    await savePrescriptionData()
    window.print()
  }

  const addCondition = () => {
    const select = document.getElementById('conditionSelect') as HTMLSelectElement
    if (!select) return
    
    const condition = select.value
    if (condition && !selectedConditions.includes(condition)) {
      setSelectedConditions([...selectedConditions, condition])
      select.value = ''
    }
  }

  const removeCondition = (index: number) => {
    setSelectedConditions(selectedConditions.filter((_, i) => i !== index))
  }

  const clearAllConditions = () => {
    setSelectedConditions([])
  }

  const toggleConditionsDisplay = () => {
    setConditionsVisible(!conditionsVisible)
  }

  const toggleField = (fieldType: string, checked: boolean) => {
    switch(fieldType) {
      case 'dob':
        setShowDOB(checked)
        break
      case 'joining':
        setShowJoining(checked)
        break
      case 'time':
        setShowTime(checked)
        break
      case 'sessions':
        setShowSessions(checked)
        break
      case 'medicine':
        setShowMedicine(checked)
        break
      case 'signatures':
        setShowSignatures(checked)
        break
      case 'phone':
        setShowPatientPhone(checked)
        break
      case 'email':
        setShowPatientEmail(checked)
        break
      case 'address':
        setShowPatientAddress(checked)
        break
      case 'treatmentPrescription':
        setShowTreatmentPrescription(checked)
        break
      case 'qrcode':
        setShowQRCode(checked)
        break
    }
  }

  const addTimeField = () => {
    setShowTime(true)
  }

  const addCustomField = () => {
    const fieldName = prompt('Enter field name:')
    if (fieldName && !customFields[fieldName]) {
      setCustomFields(prev => ({ ...prev, [fieldName]: '' }))
    }
  }

  const removeCustomField = (fieldName: string) => {
    setCustomFields(prev => {
      const newFields = { ...prev }
      delete newFields[fieldName]
      return newFields
    })
  }

  const updateCustomField = (fieldName: string, value: string) => {
    setCustomFields(prev => ({ ...prev, [fieldName]: value }))
  }

  const togglePaymentSection = () => {
    setShowPayment(!showPayment)
  }

  const updatePaymentInfo = () => {
    if (sessionFee && totalSessions) {
      const totalAmount = parseFloat(sessionFee) * parseInt(totalSessions)
      console.log('Total amount calculated:', totalAmount)
    }
  }

  // Show loading screen while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0d5c75] to-[#2a9d8f] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full mx-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d5c75] mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Verifying Access</h2>
          <p className="text-gray-600">Checking your authentication credentials...</p>
          <div className="mt-6 bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] h-2 rounded-full animate-pulse"></div>
        </div>
      </div>
    )
  }

  // If not authenticated, show nothing (user will be redirected)
  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <style jsx global>{`
        @page {
          size: A4;
          margin: 10mm;
        }

        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.3;
          color: #333;
          background: #f5f7fa;
          margin: 0;
          padding: 0;
          min-height: 100vh;
        }

        .main-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          padding: 15px;
          background: #f5f7fa;
          max-width: 1400px;
          margin: 0 auto;
          min-height: 100vh;
        }

        .prescription-area {
          background: #f5f7fa;
        }

        .controls-area {
          background: #f5f7fa;
          position: sticky;
          top: 20px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
        }

        .prescription-container {
          border: 3px solid rgb(36,80,100);
          border-radius: 10px;
          padding: 15px;
          background: white;
          box-shadow: 0 4px 20px rgba(36,80,100,0.15);
          margin: 5mm auto;
          page-break-inside: avoid;
          height: auto;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          min-height: 270mm;
          max-height: 280mm;
          width: 100%;
          max-width: 190mm;
        }

        .header {
          text-align: center;
          border-bottom: 3px solid rgb(36,80,100);
          padding: 10px;
          margin-bottom: 12px;
          background: linear-gradient(135deg, rgb(36,80,100) 0%, rgb(46,100,120) 100%);
          color: white;
          border-radius: 8px;
          position: relative;
        }

        .logo-container {
          width: 100px;
          height: 100px;
          margin: 0 auto 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .clinic-logo {
          border-radius: 50%;
          object-fit: contain;
          background: transparent;
          padding: 2px;
          box-shadow: none;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }

        /* Patient ID badge */
        .patient-id-badge {
          position: absolute;
          top: 18px;
          right: 10px;
          background: linear-gradient(135deg, rgb(36,80,100) 0%, rgb(46,100,120) 100%);
          color: #ffffff;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 9999px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.3px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          z-index: 2;
          user-select: text;
        }
        
        .patient-id-badge .dot {
          width: 6px;
          height: 6px;
          background: #ffffff;
          border-radius: 50%;
          display: inline-block;
        }

        @media print {
          .logo-container {
            background: white !important;
            border: 2px solid rgb(36,80,100) !important;
            box-shadow: none !important;
          }
          
          .clinic-logo {
            filter: none !important;
            box-shadow: none !important;
          }
        }

        .clinic-name {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 4px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .doctor-name {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 2px;
        }

        .specialization {
          font-size: 12px;
          font-style: italic;
          opacity: 0.9;
        }

        .patient-info {
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 12px;
        }

        .patient-info h3 {
          color: rgb(36,80,100);
          font-size: 14px;
          margin-bottom: 10px;
          border-bottom: 2px solid rgb(36,80,100);
          padding-bottom: 3px;
        }

        .patient-details {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
          margin-bottom: 8px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
        }

        .field-group.full-width {
          grid-column: 1 / -1;
        }

        .field-label {
          font-weight: bold;
          color: rgb(36,80,100);
          margin-bottom: 3px;
          font-size: 12px;
        }

        .field-input {
          border: none;
          border-bottom: 2px solid rgb(36,80,100);
          padding: 4px 2px;
          font-size: 12px;
          background: transparent;
          min-height: 20px;
          line-height: 1.2;
          display: flex;
          align-items: center;
          position: relative;
          top: -2px;
        }

        .field-input:focus {
          outline: none;
          border-bottom: 2px solid rgb(46,100,120);
        }

        .prescription-section {
          background: #f8f9fa;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 15px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .prescription-section h3 {
          color: rgb(36,80,100);
          font-size: 14px;
          margin-bottom: 10px;
          border-bottom: 2px solid rgb(36,80,100);
          padding-bottom: 3px;
        }

        .prescription-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .cure-section, .medicine-section {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 5px;
          padding: 6px;
        }

        .cure-section h4, .medicine-section h4 {
          color: rgb(36,80,100);
          margin-bottom: 6px;
          font-size: 12px;
        }

        .cure-input, .medicine-input {
          width: 100%;
          min-height: 50px;
          max-height: 50px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          padding: 5px;
          font-size: 12px;
          resize: none;
        }

        .sessions-section {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 5px;
          padding: 8px;
          margin-top: 8px;
          margin-bottom: 10px;
        }

        .sessions-section h4 {
          color: rgb(36,80,100);
          margin-bottom: 8px;
          font-size: 12px;
        }

        .session-checkboxes {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 6px;
          margin-bottom: 8px;
        }

        .session-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .session-checkbox input[type="checkbox"] {
          width: 14px;
          height: 14px;
          accent-color: rgb(36,80,100);
        }

        .session-checkbox label {
          font-size: 10px;
          color: #333;
        }

        .session-total {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
        }

        .session-total label {
          font-weight: bold;
          color: rgb(36,80,100);
          font-size: 12px;
        }

        .session-total input {
          border: 2px solid rgb(36,80,100);
          border-radius: 4px;
          padding: 6px 8px;
          width: 80px;
          min-height: 28px;
          line-height: 1.2;
          font-size: 12px;
          font-weight: bold;
          color: #333;
          background: white;
          text-align: center;
          box-sizing: border-box;
        }

        .session-total input:focus {
          outline: none;
          border-color: rgb(46,100,120);
          box-shadow: 0 0 0 2px rgba(36,80,100,0.2);
        }

        .signature-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 10px;
          margin-bottom: 10px;
        }

        .signature-box {
          text-align: center;
          padding: 6px;
        }

        .signature-line {
          border-bottom: 2px solid rgb(36,80,100);
          margin-bottom: 3px;
          height: 20px;
        }

        .signature-label {
          font-weight: bold;
          color: rgb(36,80,100);
          font-size: 11px;
        }

        .footer {
          text-align: center;
          background: rgb(36,80,100);
          color: white;
          padding: 12px;
          border-radius: 8px;
          font-size: 13px;
          margin-top: 15px;
          flex-shrink: 0;
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgb(36,80,100);
        }

        .footer-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .footer-address, .footer-phone {
          flex: 1;
        }

        .footer-address {
          order: 1;
          text-align: left;
        }

        .footer-phone {
          order: 2;
          text-align: right;
        }

        .footer-address strong, .footer-phone strong {
          font-weight: bold;
          font-size: 16px;
        }


        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 25px;
          padding: 25px;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(36,80,100,0.15);
          border: 2px solid rgba(36,80,100,0.1);
          position: relative;
          overflow: hidden;
        }
        
        .action-buttons::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(36,80,100,0.05), transparent);
          transition: left 0.5s;
        }
        
        .action-buttons:hover::before {
          left: 100%;
        }

        .doctor-control-panel {
          margin-bottom: 25px;
          padding: 25px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 20px;
          box-shadow: 0 12px 40px rgba(36,80,100,0.15);
          border: 2px solid rgba(36,80,100,0.25);
          position: relative;
          overflow: hidden;
        }
        
        .doctor-control-panel::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, rgb(36,80,100), rgb(46,100,120), rgb(36,80,100));
        }

        .control-panel-header {
          text-align: center;
          margin-bottom: 25px;
          color: rgb(36,80,100);
          font-size: 20px;
          font-weight: 800;
          border-bottom: 3px solid rgb(36,80,100);
          padding-bottom: 15px;
          background: linear-gradient(135deg, rgb(36,80,100) 0%, rgb(46,100,120) 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: none;
          position: relative;
        }

        .control-sections {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        .chiro-conditions-panel, .prescription-customizer {
          background: linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%);
          border: 2px solid #dee2e6;
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .chiro-conditions-panel:hover, .prescription-customizer:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(36,80,100,0.15);
        }

        .panel-section-title {
          color: rgb(36,80,100);
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 20px;
          border-bottom: 2px solid rgb(36,80,100);
          padding-bottom: 8px;
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .panel-section-title::before {
          content: '';
          width: 4px;
          height: 20px;
          background: linear-gradient(135deg, rgb(36,80,100), rgb(46,100,120));
          border-radius: 2px;
        }

        .condition-selector select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ced4da;
          border-radius: 5px;
          margin-bottom: 8px;
        }

        .control-btn {
          padding: 8px 15px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin: 2px;
        }

        .btn-add {
          background: #28a745;
          color: white;
        }

        .btn-add:hover {
          background: #218838;
        }

        .btn-remove {
          background: #dc3545;
          color: white;
        }

        .btn-remove:hover {
          background: #c82333;
        }

        .btn-toggle {
          background: #17a2b8;
          color: white;
        }

        .btn-toggle:hover {
          background: #138496;
        }

        .selected-conditions-list {
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #dee2e6;
          border-radius: 5px;
          padding: 10px;
          background: #f8f9fa;
        }

        .condition-tag {
          display: inline-block;
          background: #e7f3ff;
          border: 1px solid #bee5eb;
          border-radius: 15px;
          padding: 4px 12px;
          margin: 2px;
          font-size: 11px;
          position: relative;
        }

        .condition-tag .remove-tag {
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          font-size: 10px;
          cursor: pointer;
          margin-left: 5px;
        }

        .prescription-toggles {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .toggle-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 5px;
          border: 1px solid #dee2e6;
        }

        .toggle-option input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: rgb(36,80,100);
        }

        .toggle-option label {
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
        }

        .btn {
          padding: 15px 30px;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          position: relative;
          overflow: hidden;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .btn-primary {
          background: linear-gradient(135deg, rgb(36,80,100) 0%, rgb(46,100,120) 100%);
          color: white;
          border: 2px solid transparent;
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, rgb(46,100,120) 0%, rgb(56,110,130) 100%);
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 25px rgba(36,80,100,0.3);
        }

        .btn-secondary {
          background: linear-gradient(135deg, #6c757d 0%, #7a8288 100%);
          color: white;
          border: 2px solid transparent;
        }

        .btn-secondary:hover {
          background: linear-gradient(135deg, #545b62 0%, #6c757d 100%);
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 25px rgba(108,117,125,0.3);
        }

        /* PDF Export Optimization Styles */
        .prescription-container {
          position: relative;
          z-index: 1;
        }
        
        .prescription-container * {
          font-family: 'Arial', sans-serif !important;
        }
        
        .prescription-container img {
          max-width: 100% !important;
          height: auto !important;
        }

        .pdf-mode * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .pdf-mode .header {
          background: rgb(36,80,100) !important;
          color: white !important;
        }
        .pdf-mode .clinic-name, .pdf-mode .doctor-name, .pdf-mode .specialization {
          color: white !important;
        }
        .pdf-mode input, .pdf-mode textarea, .pdf-mode select {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          opacity: 1 !important;
          visibility: visible !important;
        }

        @media print {
          @page {
            size: A4;
            margin: 5mm !important;
          }
          
          /* Hide browser default headers and footers */
          html, body {
            margin: 0 !important;
            padding: 0 !important;
          }
          
          body::before,
          body::after,
          header::before,
          header::after {
            content: none !important;
            display: none !important;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .action-buttons, .doctor-control-panel, .controls-area, header {
            display: none !important;
            visibility: hidden !important;
          }
          
          .main-container {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
            width: 100% !important;
            display: block !important;
            grid-template-columns: none !important;
            height: 100% !important;
          }
          
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 13px !important;
            line-height: 1.5 !important;
            -webkit-print-color-adjust: exact !important;
            color: black !important;
            width: 100% !important;
            height: 100% !important;
          }
          
          .prescription-area {
            background: white !important;
            width: 100% !important;
            height: 100% !important;
            display: flex !important;
            align-items: stretch !important;
            justify-content: center !important;
          }
          
          .prescription-container {
            border: 3px solid rgb(36,80,100) !important;
            box-shadow: none !important;
            margin: 0 auto !important;
            padding: 12mm !important;
            border-radius: 0 !important;
            height: auto !important;
            max-height: none !important;
            min-height: 287mm !important;
            page-break-inside: avoid !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            width: 200mm !important;
            max-width: 200mm !important;
            box-sizing: border-box !important;
            background: white !important;
            position: relative !important;
            overflow: visible !important;
          }
          
          .header {
            background: rgb(36,80,100) !important;
            color: white !important;
            margin-bottom: 15px !important;
            padding: 12px !important;
            page-break-inside: avoid !important;
          }
          
          .logo-container {
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            width: auto !important;
            height: auto !important;
            margin: 0 auto 8px !important;
            display: inline-block !important;
            line-height: 0 !important;
            overflow: hidden !important;
            border-radius: 50% !important;
          }
          
          .logo-container * {
            line-height: 0 !important;
          }
          
          .clinic-logo {
            display: block !important;
            filter: none !important;
            box-shadow: none !important;
            background: transparent !important;
            width: 90px !important;
            height: 90px !important;
            padding: 0 !important;
            margin: 0 auto !important;
            border-radius: 50% !important;
            object-fit: contain !important;
          }
          
          .clinic-name {
            font-size: 22px !important;
            color: white !important;
            text-shadow: none !important;
            margin-bottom: 4px !important;
          }
          
          .doctor-name {
            font-size: 18px !important;
            color: white !important;
            margin-bottom: 3px !important;
          }
          
          .specialization {
            font-size: 14px !important;
            color: white !important;
            opacity: 1 !important;
          }
          
          .patient-info {
            background: #f8f9fa !important;
            border: 2px solid #e9ecef !important;
            margin-bottom: 12px !important;
            padding: 10px !important;
            page-break-inside: avoid !important;
          }
          
          .patient-info h3 {
            font-size: 15px !important;
            margin-bottom: 8px !important;
            padding-bottom: 4px !important;
          }
          
          .patient-details {
            gap: 8px !important;
            margin-bottom: 8px !important;
          }
          
          .field-label {
            font-size: 11px !important;
            margin-bottom: 3px !important;
          }
          
          .prescription-section {
            background: #f8f9fa !important;
            border: 2px solid #e9ecef !important;
            margin-bottom: 12px !important;
            padding: 12px !important;
            page-break-inside: avoid !important;
            flex-grow: 1 !important;
          }
          
          .prescription-section h3 {
            font-size: 15px !important;
            margin-bottom: 10px !important;
            padding-bottom: 4px !important;
          }
          
          .prescription-content {
            gap: 10px !important;
          }
          
          .cure-section, .medicine-section {
            padding: 10px !important;
          }
          
          .cure-section h4, .medicine-section h4 {
            font-size: 12px !important;
            margin-bottom: 6px !important;
          }
          
          .cure-input, .medicine-input {
            background: white !important;
            color: black !important;
            border: 1px solid #333 !important;
            font-size: 12px !important;
            min-height: 70px !important;
            max-height: none !important;
            padding: 8px !important;
            line-height: 1.4 !important;
          }
          
          .sessions-section {
            padding: 10px !important;
            margin-top: 10px !important;
            margin-bottom: 10px !important;
          }
          
          .sessions-section h4 {
            font-size: 12px !important;
            margin-bottom: 10px !important;
          }
          
          .session-checkboxes {
            gap: 8px !important;
            margin-bottom: 10px !important;
          }
          
          .session-checkbox {
            gap: 6px !important;
          }
          
          .session-checkbox input[type="checkbox"] {
            width: 16px !important;
            height: 16px !important;
          }
          
          .session-checkbox label {
            font-size: 11px !important;
          }
          
          .session-total {
            gap: 12px !important;
            margin-top: 10px !important;
          }
          
          .session-total label {
            font-size: 12px !important;
          }
          
          .session-total input {
            border: 2px solid rgb(36,80,100) !important;
            padding: 8px 10px !important;
            width: 80px !important;
            min-height: 32px !important;
            font-size: 12px !important;
            font-weight: bold !important;
            color: black !important;
            background: white !important;
          }
          
          .field-input {
            border-bottom: 2px solid rgb(36,80,100) !important;
            background: white !important;
            color: black !important;
            font-size: 12px !important;
            min-height: 24px !important;
            padding: 6px 4px !important;
            line-height: 1.3 !important;
          }
          
          input, textarea, select {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            background: white !important;
            color: black !important;
            font-family: 'Arial', sans-serif !important;
          }
          
          .signature-section {
            gap: 12px !important;
            margin-top: 15px !important;
            margin-bottom: 15px !important;
          }
          
          .signature-box {
            padding: 8px !important;
          }
          
          .signature-line {
            height: 25px !important;
            margin-bottom: 5px !important;
          }
          
          .signature-label {
            font-size: 12px !important;
          }

          .footer {
            margin-top: auto !important;
            page-break-inside: avoid !important;
            flex-shrink: 0 !important;
            background: rgb(36,80,100) !important;
            color: white !important;
            min-height: 45px !important;
            padding: 12px !important;
            padding-right: 120px !important; /* Reserve space for QR so it doesn't cover phone number */
            font-size: 13px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            position: relative !important;
          }
          
          .qr-code-container {
            position: absolute !important;
            right: 12px !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%) !important;
            padding: 10px !important;
            border-radius: 12px !important;
            box-shadow: 0 4px 12px rgba(36,80,100,0.25) !important;
            border: 2px solid rgba(36,80,100,0.15) !important;
          }
          
          .qr-code-container canvas {
            display: block !important;
            width: 85px !important;
            height: 85px !important;
            border-radius: 6px !important;
            image-rendering: pixelated !important;
            image-rendering: -moz-crisp-edges !important;
            image-rendering: crisp-edges !important;
          }
          
          .qr-code-container p {
            display: none !important;
          }
          
          .qr-code-container::before {
            display: none !important;
          }

          /* Ensure Patient ID badge prints crisply and never hides content */
          .patient-id-badge {
            background: linear-gradient(135deg, rgb(36,80,100) 0%, rgb(46,100,120) 100%) !important;
            color: #ffffff !important;
            border: 2px solid rgba(255,255,255,0.3) !important;
            box-shadow: none !important;
            top: 18px !important;
            right: 10px !important;
          }
          
          .patient-id-badge .dot {
            background: #ffffff !important;
          }
          
          .footer-info {
            color: white !important;
          }
          
          .footer-address, .footer-phone {
            color: white !important;
          }
          
          .footer-address strong, .footer-phone strong {
            color: white !important;
            font-size: 16px !important;
          }
        }
      `}</style>

      {/* Header */}
      <header className="bg-gradient-to-br from-[#0d5c75] to-[#2a9d8f] text-white shadow-2xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin')}
              className="text-white hover:bg-white/10 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="main-container">
        {/* Left Side - Prescription */}
        <div className="prescription-area">
          <div className="prescription-container" ref={prescriptionRef}>
            <div className="header">
              {patient?.id && (
                <div className="patient-id-badge" title="Patient ID">
                  <span className="dot" />
                  PID: {patient.id}
                </div>
              )}
              <div className="logo-container">
                <Image
                  src={clinicLogo || "/images/gonstead-chiropractic-logo-new.png"}
                  alt="Gonstead Chiropractic Clinic Logo"
                  width={90}
                  height={90}
                  className="clinic-logo"
                  style={{ maxWidth: '100%', height: 'auto' }}
                  onError={(e) => {
                    console.warn('Primary logo failed to load, using fallback');
                    const img = e.target as HTMLImageElement;
                    img.src = '/images/logo-placeholder.png';
                    img.onerror = null; // Prevent infinite loop
                  }}
                />
              </div>
              <div className="clinic-name">GONSTEAD CHIROPRACTIC CLINIC</div>
              <div className="doctor-name">DR. BASHIR KHAN</div>
              <div className="specialization">Chiropractic Specialist</div>
            </div>

            <div className="patient-info">
              <h3>Patient Information</h3>
              <div className="patient-details">
                <div className="field-group">
                  <div className="field-label">Patient Name:</div>
                  <input 
                    type="text" 
                    className="field-input" 
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient name"
                  />
                </div>
                <div className="field-group">
                  <div className="field-label">Age:</div>
                  <input 
                    type="text" 
                    className="field-input" 
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    placeholder="Enter age"
                  />
                </div>
                <div className="field-group">
                  <div className="field-label">Gender:</div>
                  <select 
                    className="field-input"
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value)}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="field-group">
                  <div className="field-label">Date of Visit:</div>
                  <input 
                    type="date" 
                    className="field-input"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                  />
                </div>
                {showDOB && (
                  <div className="field-group">
                    <div className="field-label">Date of Birth:</div>
                    <input 
                      type="date" 
                      className="field-input"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                    />
                  </div>
                )}
                {showJoining && (
                  <div className="field-group">
                    <div className="field-label">Date of Joining:</div>
                    <input 
                      type="date" 
                      className="field-input"
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                    />
                  </div>
                )}
                {showTime && (
                  <div className="field-group">
                    <div className="field-label">Current Time:</div>
                    <input 
                      type="time" 
                      className="field-input" 
                      defaultValue={typeof window !== 'undefined' ? new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5) : ''}
                    />
                  </div>
                )}
                {showPatientPhone && (
                  <div className="field-group">
                    <div className="field-label">Phone:</div>
                    <input 
                      type="text" 
                      className="field-input" 
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                )}
                {showPatientEmail && (
                  <div className="field-group">
                    <div className="field-label">Email:</div>
                    <input 
                      type="email" 
                      className="field-input" 
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                )}
                {showPatientAddress && (
                  <div className="field-group full-width">
                    <div className="field-label">Address:</div>
                    <input 
                      type="text" 
                      className="field-input" 
                      value={patientAddress}
                      onChange={(e) => setPatientAddress(e.target.value)}
                      placeholder="Enter address"
                    />
                  </div>
                )}
                {Object.entries(customFields).map(([fieldName, fieldValue]) => (
                  <div key={fieldName} className="field-group">
                    <div className="field-label">{fieldName}:</div>
                    <input 
                      type="text" 
                      className="field-input" 
                      value={fieldValue}
                      onChange={(e) => updateCustomField(fieldName, e.target.value)}
                      placeholder={`Enter ${fieldName.toLowerCase()}`}
                    />
                  </div>
                ))}
              </div>
            </div>


            {showTreatmentPrescription && (
              <div className="prescription-section">
              <h3>Treatment Prescription</h3>
              
              <div className="prescription-content">
                <div className="cure-section">
                  <h4>Treatment Plan & Cure:</h4>
                  <textarea 
                    className="cure-input" 
                    value={treatmentPlan}
                    onChange={(e) => setTreatmentPlan(e.target.value)}
                    placeholder="Enter treatment plan, diagnosis, and cure details..."
                  />
                </div>
                {showMedicine && (
                  <div className="medicine-section">
                    <h4>Prescribed Medicine:</h4>
                    <textarea 
                      className="medicine-input" 
                      value={prescribedMedicine}
                      onChange={(e) => setPrescribedMedicine(e.target.value)}
                      placeholder="Enter prescribed medicines and dosage..."
                    />
                  </div>
                )}
              </div>
              
              {showSessions && (
                <div className="sessions-section">
                  <h4>Treatment Sessions:</h4>
                  <div className="session-checkboxes">
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <div key={num} className="session-checkbox">
                        <input type="checkbox" id={`session${num}`} />
                        <label htmlFor={`session${num}`}>Session {num}</label>
                      </div>
                    ))}
                  </div>
                  <div className="session-total">
                    <label>Total Sessions Recommended:</label>
                    <input 
                      type="number" 
                      placeholder="Enter total" 
                      min="1" 
                      max="50"
                      value={totalSessions}
                      onChange={(e) => setTotalSessions(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Payment Section */}
              {showPayment && (
                <div style={{
                  background: '#f8f9fa',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '15px'
                }}>
                  <h3 style={{ color: 'rgb(36,80,100)', fontSize: '14px', marginBottom: '10px', borderBottom: '2px solid rgb(36,80,100)', paddingBottom: '3px' }}>
                    Payment Information
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: 'white', padding: '10px', borderRadius: '5px' }}>
                    <div>
                      <strong style={{ color: 'rgb(36,80,100)', fontSize: '12px' }}>Session Fee:</strong>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                        {sessionFee ? `Rs ${sessionFee}` : '-'}
                      </div>
                    </div>
                    <div>
                      <strong style={{ color: 'rgb(36,80,100)', fontSize: '12px' }}>Payment Method:</strong>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                        {paymentMethod || '-'}
                      </div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <strong style={{ color: 'rgb(36,80,100)', fontSize: '12px' }}>Payment Status:</strong>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                        {paymentStatus || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showSignatures && (
                <div className="signature-section">
                  <div className="signature-box">
                    {patientSignature ? (
                      <img src={patientSignature} alt="Patient Signature" style={{ maxWidth: '100%', maxHeight: 60, objectFit: 'contain', marginBottom: 4 }} />
                    ) : (
                      <div className="signature-line"></div>
                    )}
                    <div className="signature-label">Patient Signature</div>
                  </div>
                  <div className="signature-box">
                    {doctorSignature ? (
                      <img src={doctorSignature} alt="Doctor Signature" style={{ maxWidth: '100%', maxHeight: 60, objectFit: 'contain', marginBottom: 4 }} />
                    ) : (
                      <div className="signature-line"></div>
                    )}
                    <div className="signature-label">Doctor Signature</div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="footer">
                <div className="footer-info">
                  <div className="footer-address">
                    <strong>Address:</strong> Near Peshawar Model School, Tehsil Road Nowshera, KPK
                  </div>
                  <div className="footer-phone">
                    <strong>Phone:</strong> +923046996267
                  </div>
                </div>
                {showQRCode && currentPrescriptionId && (
                  <div className="qr-code-container">
                    <QRCodeGenerator
                      data={`${typeof window !== 'undefined' ? window.location.origin : ''}/prescription/digital/${currentPrescriptionId.id}`}
                      size={90}
                      logo={clinicLogo || "/images/gonstead-chiropractic-logo-new.png"}
                    />
                  </div>
                )}
              </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Side - Doctor Controls */}
        <div className="controls-area">
          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="btn btn-secondary" onClick={printPrescription}>
              <span style={{ fontSize: '18px' }}>🖨️</span>
              Print Prescription
            </button>
          </div>
          
          {/* Doctor Control Panel */}
          <div className="doctor-control-panel">
            <div className="control-panel-header">
              🩺 Doctor Control Panel - Chiropractic Management
            </div>
            
            {/* Prescription Management Sections */}
            <div className="control-sections">
              {/* Section 1: Prescription Field Management */}
              <div className="prescription-customizer">
                <div className="panel-section-title">
                  ⚙️ Prescription Field Manager
                </div>
                
                <div className="prescription-toggles">
                  <div className="toggle-option">
                    <input 
                      type="checkbox" 
                      id="showTreatmentPrescription" 
                      checked={showTreatmentPrescription} 
                      onChange={(e) => toggleField('treatmentPrescription', e.target.checked)} 
                    />
                    <label htmlFor="showTreatmentPrescription">📋 Treatment Prescription Section</label>
                  </div>
                  
                  <div className="toggle-option">
                    <input 
                      type="checkbox" 
                      id="showSessions" 
                      checked={showSessions} 
                      onChange={(e) => toggleField('sessions', e.target.checked)} 
                    />
                    <label htmlFor="showSessions">🔢 Session Tracking</label>
                  </div>
                  
                  <div className="toggle-option">
                    <input 
                      type="checkbox" 
                      id="showMedicine" 
                      checked={showMedicine} 
                      onChange={(e) => toggleField('medicine', e.target.checked)} 
                    />
                    <label htmlFor="showMedicine">💊 Medicine Section</label>
                  </div>
                  
                  <div className="toggle-option">
                    <input 
                      type="checkbox" 
                      id="showSignatures" 
                      checked={showSignatures} 
                      onChange={(e) => toggleField('signatures', e.target.checked)} 
                    />
                    <label htmlFor="showSignatures">✍️ Signature Section</label>
                  </div>
                  
                  <div className="toggle-option">
                    <input 
                      type="checkbox" 
                      id="showDOB" 
                      checked={showDOB} 
                      onChange={(e) => toggleField('dob', e.target.checked)} 
                    />
                    <label htmlFor="showDOB">📅 Date of Birth</label>
                  </div>
                  
                  <div className="toggle-option">
                    <input 
                      type="checkbox" 
                      id="showJoining" 
                      checked={showJoining} 
                      onChange={(e) => toggleField('joining', e.target.checked)} 
                    />
                    <label htmlFor="showJoining">📝 Date of Joining</label>
                  </div>
                  
                  <div className="toggle-option">
                    <input 
                      type="checkbox" 
                      id="showTime" 
                      checked={showTime} 
                      onChange={(e) => toggleField('time', e.target.checked)} 
                    />
                    <label htmlFor="showTime">⏰ Current Time</label>
                  </div>
                  
                  <div className="toggle-option">
                    <input 
                      type="checkbox" 
                      id="showPatientPhone" 
                      checked={showPatientPhone} 
                      onChange={(e) => toggleField('phone', e.target.checked)} 
                    />
                    <label htmlFor="showPatientPhone">📞 Patient Phone</label>
                  </div>
                  
                  <div className="toggle-option">
                    <input 
                      type="checkbox" 
                      id="showPatientEmail" 
                      checked={showPatientEmail} 
                      onChange={(e) => toggleField('email', e.target.checked)} 
                    />
                    <label htmlFor="showPatientEmail">📧 Patient Email</label>
                  </div>
                  
                  <div className="toggle-option">
                    <input 
                      type="checkbox" 
                      id="showPatientAddress" 
                      checked={showPatientAddress} 
                      onChange={(e) => toggleField('address', e.target.checked)} 
                    />
                    <label htmlFor="showPatientAddress">🏠 Patient Address</label>
                  </div>
                  
                  <div className="toggle-option">
                    <input 
                      type="checkbox" 
                      id="showQRCode" 
                      checked={showQRCode} 
                      onChange={(e) => toggleField('qrcode', e.target.checked)} 
                    />
                    <label htmlFor="showQRCode">📱 QR Code (Digital Link)</label>
                  </div>
                </div>
                
              {/* Quick Action Buttons */}
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className="control-btn btn-add" onClick={addCustomField}>➕ Add Custom Field</button>
                <button className="control-btn btn-toggle" onClick={togglePaymentSection}>
                  💰 {showPayment ? 'Hide' : 'Show'} Payment Section
                </button>
              </div>
                
                {/* Custom Fields Management */}
                {Object.keys(customFields).length > 0 && (
                  <div style={{ marginTop: '20px', padding: '15px', background: '#f0f8ff', borderRadius: '8px', border: '1px solid #bee5eb' }}>
                    <h4 style={{ color: 'rgb(36,80,100)', fontSize: '14px', marginBottom: '10px' }}>🔧 Custom Fields</h4>
                    {Object.keys(customFields).map(fieldName => (
                      <div key={fieldName} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', flex: 1 }}>{fieldName}</span>
                        <button 
                          className="control-btn btn-remove" 
                          onClick={() => removeCustomField(fieldName)}
                          style={{ fontSize: '10px', padding: '4px 8px' }}
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Section 2: Chiropractic Conditions Panel */}
              <div className="chiro-conditions-panel">
                <div className="panel-section-title">
                  📋 Chiropractic Conditions & Terminology
                </div>
                
                <div className="condition-selector" style={{ marginBottom: '15px' }}>
                  <select id="conditionSelect">
                    <option value="">Select a chiropractic condition...</option>
                    <optgroup label="🦴 Spinal Subluxations & Misalignments">
                      <option value="Cervical Subluxation Complex">Cervical Subluxation Complex</option>
                      <option value="Thoracic Subluxation Complex">Thoracic Subluxation Complex</option>
                      <option value="Lumbar Subluxation Complex">Lumbar Subluxation Complex</option>
                      <option value="Atlas Subluxation">Atlas Subluxation (C1)</option>
                      <option value="Axis Subluxation">Axis Subluxation (C2)</option>
                      <option value="Sacroiliac Joint Dysfunction">Sacroiliac Joint Dysfunction</option>
                      <option value="Vertebral Fixation">Vertebral Fixation</option>
                      <option value="Spinal Stenosis">Spinal Stenosis</option>
                      <option value="Facet Joint Syndrome">Facet Joint Syndrome</option>
                      <option value="Vertebral Compression Fracture">Vertebral Compression Fracture</option>
                    </optgroup>
                    <optgroup label="📐 Postural & Curvature Disorders">
                      <option value="Loss of Cervical Lordosis">Loss of Cervical Lordosis</option>
                      <option value="Excessive Thoracic Kyphosis">Excessive Thoracic Kyphosis</option>
                      <option value="Loss of Lumbar Lordosis">Loss of Lumbar Lordosis</option>
                      <option value="Structural Scoliosis">Structural Scoliosis</option>
                      <option value="Functional Scoliosis">Functional Scoliosis</option>
                      <option value="Forward Head Posture">Forward Head Posture</option>
                      <option value="Rounded Shoulders">Rounded Shoulders</option>
                      <option value="Pelvic Tilt Anterior">Anterior Pelvic Tilt</option>
                      <option value="Pelvic Tilt Posterior">Posterior Pelvic Tilt</option>
                      <option value="Short Leg Syndrome">Short Leg Syndrome</option>
                    </optgroup>
                    <optgroup label="💽 Disc Pathologies">
                      <option value="Cervical Disc Herniation">Cervical Disc Herniation</option>
                      <option value="Thoracic Disc Herniation">Thoracic Disc Herniation</option>
                      <option value="Lumbar Disc Herniation">Lumbar Disc Herniation</option>
                      <option value="Disc Protrusion/Bulge">Disc Protrusion/Bulge</option>
                      <option value="Degenerative Disc Disease">Degenerative Disc Disease</option>
                      <option value="Disc Sequestration">Disc Sequestration</option>
                      <option value="Discogenic Pain">Discogenic Pain</option>
                      <option value="Annular Tear">Annular Tear</option>
                    </optgroup>
                    <optgroup label="💪 Musculoskeletal Conditions">
                      <option value="Cervical Muscle Spasm">Cervical Muscle Spasm</option>
                      <option value="Thoracic Muscle Spasm">Thoracic Muscle Spasm</option>
                      <option value="Lumbar Muscle Spasm">Lumbar Muscle Spasm</option>
                      <option value="Myofascial Trigger Points">Myofascial Trigger Points</option>
                      <option value="Fibromyalgia">Fibromyalgia</option>
                      <option value="Piriformis Syndrome">Piriformis Syndrome</option>
                      <option value="Thoracic Outlet Syndrome">Thoracic Outlet Syndrome</option>
                      <option value="Rotator Cuff Syndrome">Rotator Cuff Syndrome</option>
                      <option value="Carpal Tunnel Syndrome">Carpal Tunnel Syndrome</option>
                      <option value="Tennis Elbow (Lateral Epicondylitis)">Tennis Elbow (Lateral Epicondylitis)</option>
                      <option value="Plantar Fasciitis">Plantar Fasciitis</option>
                    </optgroup>
                    <optgroup label="🧠 Neurological Conditions">
                      <option value="Cervical Radiculopathy">Cervical Radiculopathy</option>
                      <option value="Lumbar Radiculopathy">Lumbar Radiculopathy</option>
                      <option value="Sciatica (L5/S1)">Sciatica (L5/S1)</option>
                      <option value="Brachial Neuralgia">Brachial Neuralgia</option>
                      <option value="Occipital Neuralgia">Occipital Neuralgia</option>
                      <option value="Trigeminal Neuralgia">Trigeminal Neuralgia</option>
                      <option value="Peripheral Neuropathy">Peripheral Neuropathy</option>
                      <option value="Nerve Root Compression">Nerve Root Compression</option>
                    </optgroup>
                    <optgroup label="🤕 Pain Syndromes">
                      <option value="Cervicogenic Headache">Cervicogenic Headache</option>
                      <option value="Tension Headache">Tension Headache</option>
                      <option value="Migraine Headache">Migraine Headache</option>
                      <option value="Chronic Neck Pain">Chronic Neck Pain</option>
                      <option value="Chronic Low Back Pain">Chronic Low Back Pain</option>
                      <option value="Mechanical Back Pain">Mechanical Back Pain</option>
                      <option value="Non-specific Back Pain">Non-specific Back Pain</option>
                      <option value="TMJ Dysfunction">TMJ Dysfunction</option>
                      <option value="Whiplash Associated Disorder">Whiplash Associated Disorder</option>
                    </optgroup>
                    <optgroup label="🦴 Joint & Articular Conditions">
                      <option value="Osteoarthritis (Spine)">Osteoarthritis (Spine)</option>
                      <option value="Rheumatoid Arthritis">Rheumatoid Arthritis</option>
                      <option value="Ankylosing Spondylitis">Ankylosing Spondylitis</option>
                      <option value="Spondylolisthesis">Spondylolisthesis</option>
                      <option value="Spondylolysis">Spondylolysis</option>
                      <option value="Hip Joint Dysfunction">Hip Joint Dysfunction</option>
                      <option value="Shoulder Impingement">Shoulder Impingement</option>
                      <option value="Frozen Shoulder">Frozen Shoulder (Adhesive Capsulitis)</option>
                    </optgroup>
                    <optgroup label="⚡ Acute Injuries">
                      <option value="Acute Cervical Strain">Acute Cervical Strain</option>
                      <option value="Acute Lumbar Strain">Acute Lumbar Strain</option>
                      <option value="Cervical Sprain">Cervical Sprain</option>
                      <option value="Lumbar Sprain">Lumbar Sprain</option>
                      <option value="Rib Subluxation">Rib Subluxation</option>
                      <option value="Coccydynia">Coccydynia (Tailbone Pain)</option>
                      <option value="Sports Injury">Sports-Related Injury</option>
                    </optgroup>
                  </select>
                  
                  <button className="control-btn btn-add" onClick={addCondition}>➕ Add Condition</button>
                  <button className="control-btn btn-remove" onClick={clearAllConditions}>🗑️ Clear All</button>
                </div>
                
                <div className="selected-conditions-list">
                  <strong>Selected Conditions:</strong>
                  <div>
                    {selectedConditions.map((condition, index) => (
                      <span key={index} className="condition-tag">
                        {condition}
                        <button className="remove-tag" onClick={() => removeCondition(index)}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
                
                <button className="control-btn btn-toggle" onClick={toggleConditionsDisplay}>
                  👁️ {conditionsVisible ? 'Hide' : 'Show'} on Prescription
                </button>
                
                {/* Advanced Condition Features */}
                <div style={{ marginTop: '20px', padding: '15px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bee5eb' }}>
                  <h4 style={{ color: 'rgb(36,80,100)', fontSize: '14px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🧠 Advanced Diagnostic Tools
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'rgb(36,80,100)', display: 'block', marginBottom: '5px' }}>Pain Level (1-10):</label>
                      <select style={{ width: '100%', padding: '5px', fontSize: '11px', border: '1px solid #ccc', borderRadius: '4px' }}>
                        <option value="">Select Pain Level</option>
                        <option value="1-3">Mild (1-3)</option>
                        <option value="4-6">Moderate (4-6)</option>
                        <option value="7-8">Severe (7-8)</option>
                        <option value="9-10">Critical (9-10)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'rgb(36,80,100)', display: 'block', marginBottom: '5px' }}>Condition Severity:</label>
                      <select style={{ width: '100%', padding: '5px', fontSize: '11px', border: '1px solid #ccc', borderRadius: '4px' }}>
                        <option value="">Select Severity</option>
                        <option value="Acute">Acute (Recent onset)</option>
                        <option value="Sub-acute">Sub-acute (2-6 weeks)</option>
                        <option value="Chronic">Chronic (&gt;6 weeks)</option>
                        <option value="Recurrent">Recurrent Episodes</option>
                      </select>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'rgb(36,80,100)', display: 'block', marginBottom: '5px' }}>Functional Assessment:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input type="checkbox" style={{ width: '12px', height: '12px' }} />
                        Range of Motion Restricted
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input type="checkbox" style={{ width: '12px', height: '12px' }} />
                        Muscle Weakness Present
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input type="checkbox" style={{ width: '12px', height: '12px' }} />
                        Neurological Deficits
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input type="checkbox" style={{ width: '12px', height: '12px' }} />
                        Activities of Daily Living Affected
                      </label>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'rgb(36,80,100)', display: 'block', marginBottom: '5px' }}>Gonstead Analysis:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input type="checkbox" style={{ width: '12px', height: '12px' }} />
                        Visualization Abnormality
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input type="checkbox" style={{ width: '12px', height: '12px' }} />
                        Instrumentation Findings
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input type="checkbox" style={{ width: '12px', height: '12px' }} />
                        Static Palpation Positive
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input type="checkbox" style={{ width: '12px', height: '12px' }} />
                        Motion Palpation Positive
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'rgb(36,80,100)', display: 'block', marginBottom: '5px' }}>Treatment Modalities Recommended:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input type="checkbox" style={{ width: '12px', height: '12px' }} />
                        Gonstead Adjustment
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input type="checkbox" style={{ width: '12px', height: '12px' }} />
                        Soft Tissue Therapy
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input type="checkbox" style={{ width: '12px', height: '12px' }} />
                        Rehabilitation Exercises
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input type="checkbox" style={{ width: '12px', height: '12px' }} />
                        Lifestyle Modifications
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input type="checkbox" style={{ width: '12px', height: '12px' }} />
                        Ergonomic Counseling
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <input type="checkbox" style={{ width: '12px', height: '12px' }} />
                        Nutritional Support
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Quick Condition Information */}
                <div style={{ marginTop: '15px', padding: '12px', background: '#fff8e1', borderRadius: '6px', border: '1px solid #ffc107' }}>
                  <h5 style={{ color: '#f57c00', fontSize: '12px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    ℹ️ Condition Quick Reference
                  </h5>
                  <div style={{ fontSize: '10px', color: '#bf360c', lineHeight: '1.3' }}>
                    <strong>Common Patterns:</strong><br/>
                    • Cervical: Headaches, neck stiffness, arm numbness<br/>
                    • Thoracic: Mid-back pain, breathing difficulties<br/>
                    • Lumbar: Low back pain, leg pain, walking difficulties<br/>
                    • Pelvic: Hip pain, leg length inequality, sacroiliac dysfunction
                  </div>
                </div>
              </div>
              
            </div>
            
              {/* Section 3: Advanced Features & Tools */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
              {/* Payment Management */}
              <div className="prescription-customizer">
                <div className="panel-section-title">
                  💰 Payment Management
                </div>
                
                <div className="toggle-option" style={{ marginBottom: '15px' }}>
                  <input 
                    type="checkbox" 
                    id="showPayment" 
                    checked={showPayment}
                    onChange={togglePaymentSection}
                  />
                  <label htmlFor="showPayment">💳 Include Payment Section</label>
                </div>
                
                {showPayment && (
                  <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'rgb(36,80,100)' }}>Session Fee (Rs):</label>
                      <input 
                        type="number" 
                        placeholder="Enter fee per session"
                        style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px', marginTop: '5px' }}
                        value={sessionFee}
                        onChange={(e) => setSessionFee(e.target.value)}
                      />
                    </div>
                    
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'rgb(36,80,100)' }}>Payment Method:</label>
                      <select 
                        style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px', marginTop: '5px' }}
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        <option value="">Select payment method</option>
                        <option value="Cash">💵 Cash</option>
                        <option value="Card">💳 Credit/Debit Card</option>
                        <option value="Online Transfer">🌐 Online Transfer</option>
                        <option value="Check">📋 Check</option>
                        <option value="Insurance">🏥 Insurance</option>
                      </select>
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'rgb(36,80,100)' }}>Payment Status:</label>
                      <select 
                        style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px', marginTop: '5px' }}
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                      >
                        <option value="">Select status</option>
                        <option value="Paid">✅ Paid</option>
                        <option value="Partial">🔶 Partial Payment</option>
                        <option value="Pending">⏳ Pending</option>
                        <option value="Due">❗ Payment Due</option>
                      </select>
                    </div>
                    
                    <button className="control-btn btn-add" onClick={updatePaymentInfo}>
                      💰 Update Payment Details
                    </button>
                  </div>
                )}
              </div>
              
              {/* Quick Actions & Tools */}
              <div className="prescription-customizer">
                <div className="panel-section-title">
                  🚀 Quick Actions & Tools
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button 
                    className="control-btn btn-add" 
                    onClick={addCustomField}
                    style={{ padding: '10px', fontSize: '13px' }}
                  >
                    ➕ Add Custom Field
                  </button>
                  
                  <button 
                    className="control-btn btn-toggle" 
                    onClick={addTimeField}
                    style={{ padding: '10px', fontSize: '13px' }}
                  >
                    ⏰ Add Current Time Field
                  </button>

                  <button 
                    className="control-btn btn-add" 
                    onClick={() => setShowPatientSignaturePad(true)}
                    style={{ padding: '10px', fontSize: '13px' }}
                  >
                    ✍️ Capture Patient Signature
                  </button>

                  <button 
                    className="control-btn btn-add" 
                    onClick={() => setShowDoctorSignaturePad(true)}
                    style={{ padding: '10px', fontSize: '13px' }}
                  >
                    ✍️ Capture Doctor Signature
                  </button>
                  
                  <button 
                    className="control-btn btn-remove" 
                    onClick={() => {
                      setSelectedConditions([]);
                      setCustomFields({});
                      setTreatmentPlan('');
                      setPrescribedMedicine('');
                      setTotalSessions('');
                      setPatientSignature("");
                      setDoctorSignature("");
                    }}
                    style={{ padding: '10px', fontSize: '13px' }}
                  >
                    🔄 Reset All Fields
                  </button>
                  
                  <button 
                    className="control-btn btn-toggle" 
                    onClick={() => {
                      // Save current prescription as template
                      const template = {
                        patientName,
                        treatmentPlan,
                        prescribedMedicine,
                        totalSessions,
                        selectedConditions,
                        showFields: { showDOB, showJoining, showSessions, showMedicine, showSignatures }
                      };
                      localStorage.setItem('prescriptionTemplate', JSON.stringify(template));
                      alert('Prescription template saved!');
                    }}
                    style={{ padding: '10px', fontSize: '13px' }}
                  >
                    💾 Save as Template
                  </button>
                </div>
                
                {/* Custom Fields Management */}
                {Object.keys(customFields).length > 0 && (
                  <div style={{ marginTop: '20px', padding: '15px', background: '#f0f8ff', borderRadius: '8px', border: '1px solid #bee5eb' }}>
                    <h4 style={{ color: 'rgb(36,80,100)', fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🔧 Active Custom Fields
                    </h4>
                    <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                      {Object.keys(customFields).map(fieldName => (
                        <div key={fieldName} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', padding: '5px', background: 'white', borderRadius: '4px' }}>
                          <span style={{ fontSize: '12px', flex: 1, fontWeight: '500' }}>{fieldName}</span>
                          <button 
                            className="control-btn btn-remove" 
                            onClick={() => removeCustomField(fieldName)}
                            style={{ fontSize: '10px', padding: '4px 8px' }}
                            title={`Remove ${fieldName} field`}
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Branding */}
            <div style={{ marginTop: '20px' }}>
              <div className="prescription-customizer">
                <div className="panel-section-title">🎨 Clinic Branding</div>
                <LogoUpload onLogoChange={setClinicLogo} currentLogo={clinicLogo} />
              </div>
            </div>

            {/* Signature Modals */}
            {showPatientSignaturePad && (
              <SignaturePad
                title="Patient Signature"
                onSave={(sig) => { setPatientSignature(sig); setShowPatientSignaturePad(false) }}
                onClose={() => setShowPatientSignaturePad(false)}
              />
            )}
            {showDoctorSignaturePad && (
              <SignaturePad
                title="Doctor Signature"
                onSave={(sig) => { setDoctorSignature(sig); setShowDoctorSignaturePad(false) }}
                onClose={() => setShowDoctorSignaturePad(false)}
              />
            )}

            {/* Preview Modal */}
            {showPreviewModal && (
              <PreviewModal
                prescription={{
                  id: currentPrescriptionId?.id || 'PREVIEW',
                  patient_id: currentPrescriptionId?.patientId || 'preview',
                  appointment_id: '',
                  patient_name: patientName,
                  patient_age: patientAge,
                  patient_gender: patientGender,
                  patient_phone: patientPhone,
                  patient_email: patientEmail,
                  visit_date: visitDate,
                  birth_date: birthDate,
                  joining_date: joiningDate,
                  treatment_plan: treatmentPlan,
                  prescribed_medicine: prescribedMedicine,
                  total_sessions: totalSessions,
                  conditions: selectedConditions,
                  custom_fields: customFields,
                  doctor_name: 'DR. BASHIR KHAN',
                  clinic_name: 'GONSTEAD CHIROPRACTIC CLINIC',
                  clinic_address: 'Near Peshawar Model School, Tehsil Road Nowshera, KPK',
                  clinic_phone: '+923046996267',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }}
                onClose={() => setShowPreviewModal(false)}
                onPrint={printPrescription}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default function PrescriptionPage() {
  return (
    <ErrorBoundary>
      <PrescriptionPageContent />
    </ErrorBoundary>
  )
}
