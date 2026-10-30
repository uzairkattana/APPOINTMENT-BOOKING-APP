"use client"

import React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useTheme } from "@/components/theme-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import PerfectWhatsAppChat from "@/components/PerfectWhatsAppChat"
import { DoctorWhatsAppChatInbox } from "@/components/DoctorWhatsAppChatInbox"
import {
  Calendar,
  Users,
  FileText,
  Download,
  Upload,
  Eye,
  Phone,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  LogOut,
  Search,
  Moon,
  Sun,
  Video,
  MapPin,
  PillIcon as Prescription,
  Timer,
  UserPlus,
  Edit3,
  Plus,
  Minus,
  Cloud,
  DollarSign,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Activity,
  User as UserIcon,
  Maximize,
  Minimize,
  X
} from "lucide-react"
import {
  signOutAdmin,
  getCurrentUser,
  getPatients,
  updatePatient,
  deletePatient,
  createPatient,
  addAuditLog,
  type Patient,
} from "@/lib/data-service"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { WeatherWidget } from "@/components/weather-widget"
import { EnhancedLoadingPage } from "@/components/loading-spinner"
import AdminSidebar from "@/components/AdminSidebar"
import ScrollToTopButton from "@/components/ScrollToTopButton"
import dynamic from 'next/dynamic'
const AdminServiceWorkerClient = dynamic(() => import('@/components/AdminServiceWorkerClient'), { ssr: false })
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { SignatureCanvas } from "@/components/SignatureCanvas"
import { VideoCall } from "@/components/video-call"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { TreatmentNotes } from "@/components/treatment-notes"
import { PatientGrowthAnalytics } from "@/components/patient-growth-analytics-compact"
import { BookNextAppointment } from "@/components/book-next-appointment"
import {
  checkAppointmentConflict,
  getAvailableTimeSlots,
  createAppointmentReminder,
  saveReminder,
  getReminders,
  getUpcomingAppointmentsForReminders,
  assessNoShowRisk,
  generateWelcomeMessage,
  generateFollowUpMessage,
} from "@/lib/appointment-utils"
import { generateAppointmentConfirmationPDF } from "@/lib/pdf-appointment-confirmation"

export default function AdminDashboard() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false)
  const [isAddPatientDialogOpen, setIsAddPatientDialogOpen] = useState(false)
  const [isVideoCallDialogOpen, setIsVideoCallDialogOpen] = useState(false)
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false)
  const [isEditPatientDialogOpen, setIsEditPatientDialogOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterUrgency, setFilterUrgency] = useState<string>("all")
  const [filterTimePeriod, setFilterTimePeriod] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const { theme, setTheme } = useTheme()
  const isDarkMode = theme === "dark"
  const [currentTime, setCurrentTime] = useState(new Date())
  const [patientCount, setPatientCount] = useState(0)
  const [authChecked, setAuthChecked] = useState(false)
  const [clinicLocation, setClinicLocation] = useState({
    address: "Near Peshawar Model School, Tehsil Road, Nowshera",
    coordinates: { lat: 34.0153, lng: 71.9804 },
    mapUrl: "https://maps.app.goo.gl/8pJ9o2hCPtGY3XtD9",
  })
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    completedSessions: 0,
    emergencyPatients: 0,
  })
  const [viewedPatients, setViewedPatients] = useState<Set<string>>(new Set())
  const [newPatient, setNewPatient] = useState({
    name: "",
    phone: "",
    email: "",
    session_type: "in_clinic" as "in_clinic" | "video",
    appointment_date: "",
    urgency: "normal" as "normal" | "urgent" | "emergency",
    payment_method: "cash" as "cash" | "jazzcash" | "easypaisa",
    notes: "",
    // Advanced mode fields
    dateOfBirth: "",
    profession: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    symptoms: "",
    previousTreatment: "",
    emergencyContact: "",
    emergencyPhone: "",
    insurance: "",
  })

  // Add patient registration mode state
  const [isAdvancedMode, setIsAdvancedMode] = useState(false)
  const [registrationStep, setRegistrationStep] = useState(1)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(undefined)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)

  // Prescription dialog state variables
  const [isPrescriptionDialogOpen, setIsPrescriptionDialogOpen] = useState(false)
  const [prescriptionNotes, setPrescriptionNotes] = useState("")
  const [prescriptionMedicine, setPrescriptionMedicine] = useState("")
  const [chiropracticSuggestions, setChiropracticSuggestions] = useState<string[]>([
    "Apply ice for 15-20 minutes, 3 times daily",
    "Gentle neck stretches as demonstrated",
    "Maintain proper posture while sitting",
    "Sleep with proper pillow support",
  ])
  const [newSuggestion, setNewSuggestion] = useState("")
  // Patient-facing visual tools state
  const [painLevel, setPainLevel] = useState<number>(3)
  const [affectedAreas, setAffectedAreas] = useState<string[]>([])
  const [selectedExercises, setSelectedExercises] = useState<string[]>([])
  const [redFlags, setRedFlags] = useState<string[]>([])
  const [doseSchedule, setDoseSchedule] = useState<{ morning: boolean; afternoon: boolean; night: boolean }>({
    morning: true,
    afternoon: false,
    night: true,
  })
  const exerciseBank = [
    "Neck Mobility (Cat-Cow)",
    "Chin Tucks (Posture Reset)",
    "Thoracic Extension on Wall",
    "Hip Hinge Drill",
    "Pelvic Tilt (Core Activation)",
    "Hamstring Stretch",
  ]
  const areaBank = ["Neck", "Upper Back", "Lower Back", "Shoulders", "Hips", "Knees"]
  const redFlagBank = [
    "Numbness/Tingling",
    "Severe Weakness",
    "Fever/Unexplained Weight Loss",
    "Recent Trauma",
  ]
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedDateAppointments, setSelectedDateAppointments] = useState<Patient[]>([])
  const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set())
  const [selectedPatientHistory, setSelectedPatientHistory] = useState<Patient | null>(null)
  const [isPatientHistoryDialogOpen, setIsPatientHistoryDialogOpen] = useState(false)
  const [currentPrescriptionId, setCurrentPrescriptionId] = useState<string>('')
  const detailsRef = useRef<HTMLDivElement | null>(null)
  const [isGrowthAnalyticsOpen, setIsGrowthAnalyticsOpen] = useState(false)
  const [selectedPatientDetail, setSelectedPatientDetail] = useState<Patient | null>(null)
  const [doctorSignature, setDoctorSignature] = useState<string | null>(null)
  const [isVideoCallFullscreen, setIsVideoCallFullscreen] = useState(false)
  const videoCallDialogRef = useRef<HTMLDivElement | null>(null)

  // Book Next Appointment Dialog State
  const [isBookNextAppointmentOpen, setIsBookNextAppointmentOpen] = useState(false)
  const [patientForNextAppointment, setPatientForNextAppointment] = useState<Patient | null>(null)

  // Cancellation Confirmation Dialog State
  const [isCancelConfirmDialogOpen, setIsCancelConfirmDialogOpen] = useState(false)
  const [patientToCancel, setPatientToCancel] = useState<Patient | null>(null)
  const [expandedCancelSection, setExpandedCancelSection] = useState<'patient' | 'impact' | 'recovery' | null>(null)

  // Smart table sorting state (persisted)
  type SortKey = 'name' | 'phone' | 'profession' | 'appointment_date' | 'status' | 'urgency' | 'session_type' | 'sessions'
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null)

  // Quick Wins: Last updated timestamp
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [adminUser, setAdminUser] = useState<any>({ email: 'admin-user', name: 'Dr. Bashir Khan' })

  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  // Update current time every second with 12-hour format (client-side only)
  useEffect(() => {
    // Set initial time on client mount to avoid hydration mismatch
    setCurrentTime(new Date())

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])


  // Helper function to format time in 12-hour format
  const formatTime12Hour = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Update patient count
  useEffect(() => {
    setPatientCount(patients.length)
  }, [patients])

  // Load viewed patients from localStorage on component mount
  useEffect(() => {
    const savedViewedPatients = localStorage.getItem('viewedPatients')
    console.log('Loading viewed patients from localStorage:', savedViewedPatients)
    if (savedViewedPatients) {
      try {
        const parsedViewed = JSON.parse(savedViewedPatients)
        console.log('Parsed viewed patients:', parsedViewed)
        setViewedPatients(new Set(parsedViewed))
      } catch (error) {
        console.error('Error parsing viewed patients from localStorage:', error)
      }
    }
  }, [])

  // Save viewed patients to localStorage whenever it changes (skip initial empty set)
  useEffect(() => {
    if (viewedPatients.size > 0) {
      const viewedArray = [...viewedPatients]
      console.log('Saving viewed patients to localStorage:', viewedArray)
      localStorage.setItem('viewedPatients', JSON.stringify(viewedArray))
    }
  }, [viewedPatients])

  // Load saved sort config on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('admin_patient_sort')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && parsed.key && (parsed.direction === 'asc' || parsed.direction === 'desc')) {
          setSortConfig(parsed)
        }
      }
    } catch (e) {
      console.warn('Failed to load saved sort config', e)
    }
  }, [])

  // Persist sort config
  useEffect(() => {
    try {
      if (sortConfig) localStorage.setItem('admin_patient_sort', JSON.stringify(sortConfig))
      else localStorage.removeItem('admin_patient_sort')
    } catch (e) {
      console.warn('Failed to persist sort config', e)
    }
  }, [sortConfig])

  useEffect(() => {
    checkAuthAndLoadData()

    // Process pending sync queue on load (offline-first sync)
    const processPendingSyncs = async () => {
      try {
        const { processSyncQueue } = await import('@/lib/supabase')
        await processSyncQueue()
      } catch (error) {
        console.error('Failed to process sync queue:', error)
      }
    }
    processPendingSyncs()

    // Listen for new appointments from the booking form
    const handleNewAppointment = (event: CustomEvent) => {
      const newPatient = event.detail
      setPatients(prev => [newPatient, ...prev])
      // Update stats
      const today = new Date().toDateString()
      setStats(prev => ({
        ...prev,
        totalPatients: prev.totalPatients + 1,
        todayAppointments: new Date(newPatient.appointment_date).toDateString() === today
          ? prev.todayAppointments + 1
          : prev.todayAppointments,
        pendingAppointments: newPatient.status === 'pending'
          ? prev.pendingAppointments + 1
          : prev.pendingAppointments,
        emergencyPatients: newPatient.urgency === 'emergency'
          ? prev.emergencyPatients + 1
          : prev.emergencyPatients
      }))

      // Auto-create 24h reminder for new appointment
      try {
        const reminder = createAppointmentReminder(newPatient, '24h')
        saveReminder(reminder)
      } catch (error) {
        console.error('Failed to create reminder:', error)
      }

      toast({
        title: "📋 New Patient Registration",
        description: `${newPatient.name} has successfully scheduled an appointment for ${new Date(newPatient.appointment_date).toLocaleDateString()}`,
      })
    }

    // Add event listener for real-time appointment updates
    window.addEventListener('newAppointment', handleNewAppointment as EventListener)

    // Cleanup
    return () => {
      window.removeEventListener('newAppointment', handleNewAppointment as EventListener)
    }
  }, [])

  // Auto-reminder system: Check for upcoming appointments and create reminders
  useEffect(() => {
    const checkAndCreateReminders = () => {
      try {
        const upcomingAppointments = getUpcomingAppointmentsForReminders(patients, 24)
        const existingReminders = getReminders()

        upcomingAppointments.forEach(patient => {
          // Check if 24h reminder already exists
          const has24hReminder = existingReminders.some(r =>
            r.patientId === patient.id && r.type === '24h' && r.status === 'pending'
          )

          if (!has24hReminder) {
            const reminder = createAppointmentReminder(patient, '24h')
            saveReminder(reminder)
            console.log(`Auto-created 24h reminder for ${patient.name}`)
          }
        })
      } catch (error) {
        console.error('Error in reminder system:', error)
      }
    }

    // Check immediately and then every 5 minutes
    checkAndCreateReminders()
    const interval = setInterval(checkAndCreateReminders, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [patients])

  const checkAuthAndLoadData = async () => {
    try {
      console.log("Dashboard: Checking authentication...")

      // Check localStorage first to prevent loops
      const isAuthenticated = localStorage.getItem("admin_authenticated")
      const storedEmail = localStorage.getItem("admin_email")

      if (isAuthenticated === "true" && storedEmail) {
        console.log("Dashboard: Found localStorage auth, proceeding...")
        setAuthChecked(true)
        await loadPatients()
        return
      }

      // If no localStorage, check Supabase auth
      const { user, error } = await getCurrentUser()

      if (error) {
        console.error("Dashboard: Auth error:", error)
        throw error
      }

      if (!user) {
        console.log("Dashboard: No user found, redirecting to auth")
        router.replace("/admin/auth")
        return
      }

      console.log("Dashboard: User authenticated:", user.email)

      // Set admin user state for chat
      setAdminUser({
        ...user,
        name: user.name || 'Dr. Bashir Khan'
      })

      // Store auth in localStorage to prevent future loops
      localStorage.setItem("admin_authenticated", "true")
      localStorage.setItem("admin_email", user.email || "")

      setAuthChecked(true)
      await loadPatients()
    } catch (error) {
      console.error("Dashboard: Auth check failed:", error)
      // Clear localStorage on auth failure
      localStorage.removeItem("admin_authenticated")
      localStorage.removeItem("admin_email")
      router.replace("/admin/auth")
    }
  }

  const loadPatients = async () => {
    try {
      setIsLoading(true)
      console.log("Dashboard: Loading patients...")

      // Load from Supabase
      const { data, error } = await getPatients()

      if (error) {
        console.error("Dashboard: Error loading patients:", error)
        toast({
          title: "Error",
          description: "Failed to load patient data",
          variant: "destructive",
        })
        return
      }

      const supabasePatients = data || []
      console.log("Dashboard: Loaded Supabase patients:", supabasePatients.length)

      // Load from localStorage (for appointment bookings from the form)
      const localStoragePatients = JSON.parse(localStorage.getItem("gonstead_patients") || "[]")
      console.log("Dashboard: Loaded localStorage patients:", localStoragePatients.length)

      // Merge patients with proper deduplication - prioritize Supabase data
      const mergedPatients = [...supabasePatients]
      const existingIds = new Set(supabasePatients.map(p => p.id))

      // Add localStorage patients that aren't already in Supabase (by ID)
      localStoragePatients.forEach((localPatient: Patient) => {
        if (!existingIds.has(localPatient.id)) {
          mergedPatients.push(localPatient)
          existingIds.add(localPatient.id)
        }
      })

      console.log("Dashboard: Total merged patients:", mergedPatients.length)
      setPatients(mergedPatients)

      // Calculate stats from merged data
      const today = new Date().toDateString()
      const newStats = {
        totalPatients: mergedPatients.length,
        todayAppointments: mergedPatients.filter((p) => new Date(p.appointment_date).toDateString() === today).length,
        pendingAppointments: mergedPatients.filter((p) => p.status === "pending").length,
        completedSessions: mergedPatients.reduce((sum, p) => sum + (p.sessions_completed || 0), 0),
        emergencyPatients: mergedPatients.filter((p) => p.urgency === "emergency").length,
      }
      setStats(newStats)

      // Quick Win: Update last updated timestamp
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Dashboard: Error loading patients:", error)
      toast({
        title: "Error",
        description: "Failed to load patient data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePatient = async (patientId: string) => {
    try {
      const before = patients.find(p => p.id === patientId) || null
      await deletePatient(patientId)
      // Audit: delete
      try { await addAuditLog({ action: 'delete', entity_type: 'patient', entity_id: patientId, actor_email: localStorage.getItem('admin_email') || undefined, source: 'admin_dashboard', reversible: true, meta: { before } }) } catch { }
      await loadPatients()
      toast({
        title: "Patient Deleted",
        description: "Patient record has been permanently removed",
      })
    } catch (error) {
      console.error("Error deleting patient:", error)
      toast({
        title: "Error",
        description: "Failed to delete patient",
        variant: "destructive",
      })
    }
  }

  const handleUpdatePatientStatus = async (patientId: string, newStatus: Patient["status"]) => {
    try {
      const patient = patients.find((p) => p.id === patientId)
      if (!patient) {
        toast({
          title: "Error",
          description: "Patient not found",
          variant: "destructive",
        })
        return
      }

      // Helper: derive status from session counts (0 => pending, 1..(total-1) => confirmed, >= total => completed)
      const deriveStatus = (completed: number, total?: number): Patient["status"] => {
        const t = total && total > 0 ? total : 8
        if ((completed || 0) >= t) return "completed"
        if ((completed || 0) <= 0) return "pending"
        return "confirmed"
      }

      const updateData: any = {}

      const total = patient.total_sessions || 8
      const prevCount = patient.sessions_completed || 0
      let newCount = prevCount
      let incremented = false

      if (newStatus === "completed") {
        // Treat 'completed' action as: one session has been completed now
        newCount = Math.min(total, prevCount + 1)
        incremented = newCount > prevCount
        updateData.sessions_completed = newCount
        updateData.last_visit = new Date().toISOString()
        updateData.status = deriveStatus(newCount, total)
      } else if (newStatus === "cancelled") {
        // Respect explicit cancellation.
        // If patient never attended, reset counters to 0/0.
        // If patient had already taken sessions, cancelation should roll back ONE taken session,
        // not wipe the full history.
        updateData.status = "cancelled"
        if ((prevCount || 0) <= 0) {
          // No sessions taken → both taken and total become 0
          updateData.sessions_completed = 0
          updateData.total_sessions = 0
        } else {
          // Some sessions already taken → remove ONE from the taken count only
          const rolledBack = Math.max(0, prevCount - 1)
          updateData.sessions_completed = rolledBack
          // Keep total_sessions as-is so history of planned plan is preserved
        }
      } else {
        // For 'pending' or 'confirmed' clicks, always align with counts automatically
        updateData.status = deriveStatus(prevCount, total)
      }

      const prev = {
        status: patient.status,
        sessions_completed: patient.sessions_completed,
        last_visit: patient.last_visit,
      }

      // Update in Supabase
      await updatePatient(patientId, updateData)

      // Also update in localStorage if patient exists there
      try {
        const localPatients = JSON.parse(localStorage.getItem("gonstead_patients") || "[]")
        const localIndex = localPatients.findIndex((p: Patient) => p.id === patientId)
        if (localIndex !== -1) {
          localPatients[localIndex] = {
            ...localPatients[localIndex],
            ...updateData,
            updated_at: new Date().toISOString(),
          }
          localStorage.setItem("gonstead_patients", JSON.stringify(localPatients))
        }
      } catch (e) {
        console.error("Error updating localStorage:", e)
      }

      // Audit: update status
      try {
        await addAuditLog({
          action: 'update',
          entity_type: 'patient',
          entity_id: patientId,
          actor_email: localStorage.getItem('admin_email') || undefined,
          source: 'admin_dashboard',
          reversible: true,
          meta: {
            before: prev,
            after: {
              status: updateData.status,
              sessions_completed: updateData.sessions_completed,
              last_visit: updateData.last_visit,
            },
            action_requested: newStatus,
            session_incremented: incremented,
          },
        })
      } catch { }

      await loadPatients()

      // Toaster feedback
      if (newStatus === "completed") {
        if (incremented) {
          toast({
            title: "✅ Session Recorded",
            description: `Session ${newCount} of ${total} recorded. Status set to ${String(updateData.status).toUpperCase()}.`,
          })
        } else {
          toast({
            title: "ℹ️ No Change",
            description: `Already at maximum sessions (${total}). Status remains ${String(updateData.status).toUpperCase()}.`,
          })
        }
      } else if (newStatus === "cancelled") {
        toast({
          title: "✅ Status Updated",
          description: `Patient has been marked as CANCELLED`,
        })
      } else {
        toast({
          title: "✅ Status Synchronized",
          description: `Status set to ${String(updateData.status).toUpperCase()} based on session progress (${prevCount}/${total}).`,
        })
      }
    } catch (error) {
      console.error("Error updating patient:", error)
      toast({
        title: "Error",
        description: "Failed to update patient status",
        variant: "destructive",
      })
    }
  }

  // Generate available time slots with 40-minute gaps (using shared utils with conflict guards)
  const generateTimeSlots = (date: Date) => {
    try {
      return getAvailableTimeSlots(date, patients, { start: 8, end: 18 })
    } catch (e) {
      console.error('Failed to compute available slots:', e)
      return []
    }
  }

  // Update available slots when date changes for appointment booking
  const handleAppointmentDateSelection = (date: Date | undefined) => {
    setAppointmentDate(date)
    if (date) {
      const slots = generateTimeSlots(date)
      setAvailableTimeSlots(slots)
      if (slots.length === 0) {
        toast({
          title: date.getDay() === 0 ? "🚫 Clinic Closed on Sundays" : "📅 All Slots Booked",
          description: date.getDay() === 0
            ? "Our clinic is closed on Sundays. Please select Monday-Saturday."
            : "All appointment slots are booked for this date. Please select another date.",
          variant: "destructive",
        })
      }
    }
  }

  const combineDateAndSlot = (date: Date, slot: string): string => {
    try {
      const [time, period] = slot.split(' ')
      const [hStr, mStr] = time.split(':')
      let h = parseInt(hStr, 10)
      if (period === 'PM' && h < 12) h += 12
      if (period === 'AM' && h === 12) h = 0
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      const hh = String(h).padStart(2, '0')
      const mm = mStr.padStart(2, '0')
      return `${y}-${m}-${d}T${hh}:${mm}`
    } catch {
      return ''
    }
  }

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isAdvancedMode && !newPatient.appointment_date) {
        toast({
          title: "Select time slot",
          description: "Please select a date and an available time slot.",
          variant: "destructive",
        })
        return
      }

      // 🚫 DOUBLE BOOKING PREVENTION: Check for conflicts before creating appointment
      const conflict = checkAppointmentConflict(newPatient.appointment_date, patients)
      if (conflict.hasConflict) {
        toast({
          title: "⚠️ Booking Conflict Detected",
          description: conflict.message,
          variant: "destructive",
        })
        return // Stop appointment creation
      }
      const patientData = {
        ...newPatient,
        status: "pending" as const,
        sessions_completed: 0,
        booking_source: "admin_dashboard" as const, // Mark as admin-created
      }

      console.log("[Mobile Debug] Starting patient creation...", { isMobile: window.innerWidth < 768 })
      const newPatientRecord = await createPatient(patientData)
      console.log("[Mobile Debug] Patient created in Supabase:", newPatientRecord?.id)

      // Mark admin-created patients as viewed immediately (no red dot needed)
      if (newPatientRecord?.id) {
        setViewedPatients(prev => new Set([...prev, newPatientRecord.id]))

        // Automatically generate professional confirmation PDF when a full appointment is booked
        try {
          if (newPatientRecord.appointment_date) {
            const apptDate = new Date(newPatientRecord.appointment_date)
            const appointmentTimeDisplay = apptDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
            await generateAppointmentConfirmationPDF({
              patient: newPatientRecord,
              appointmentDate: newPatientRecord.appointment_date,
              appointmentTime: appointmentTimeDisplay,
              sessionType: newPatientRecord.session_type,
              notes: newPatientRecord.notes || undefined,
            })
          }
        } catch (pdfError) {
          console.error('Error generating confirmation PDF for admin-created appointment:', pdfError)
        }

        // Mobile-compatible localStorage sync with error handling
        let localStorageSaved = false
        try {
          // Check if localStorage is available (might be disabled on mobile)
          if (typeof localStorage !== 'undefined') {
            const existingPatients = JSON.parse(localStorage.getItem("gonstead_patients") || "[]")
            const updatedPatients = [newPatientRecord, ...existingPatients]
            localStorage.setItem("gonstead_patients", JSON.stringify(updatedPatients))
            localStorageSaved = true
            console.log("[Mobile Debug] Saved to localStorage successfully")
          } else {
            console.warn("[Mobile Debug] localStorage not available")
          }
        } catch (storageError) {
          console.error("[Mobile Debug] localStorage error (mobile restriction?):", storageError)
          // Continue execution - don't fail the entire operation
        }

        // Always trigger event - medical history will fetch from Supabase if localStorage fails
        try {
          window.dispatchEvent(new CustomEvent('medicalRecordsUpdated', {
            detail: {
              patientId: newPatientRecord.id,
              localStorageAvailable: localStorageSaved,
              timestamp: new Date().toISOString()
            }
          }))
          console.log("[Mobile Debug] Event dispatched successfully")
        } catch (eventError) {
          console.error("[Mobile Debug] Event dispatch error:", eventError)
        }

        // Audit: create
        try {
          const adminEmail = typeof localStorage !== 'undefined' ? localStorage.getItem('admin_email') : null
          await addAuditLog({
            action: 'create',
            entity_type: 'patient',
            entity_id: newPatientRecord.id,
            actor_email: adminEmail || undefined,
            source: 'admin_dashboard',
            reversible: true,
            meta: { after: newPatientRecord, localStorageSaved }
          })
        } catch { }

        // DO NOT automatically create medical records - only patient records
        // Medical records should be created separately via Medical History page
      }

      await loadPatients()
      setIsAddPatientDialogOpen(false)
      setNewPatient({
        name: "",
        phone: "",
        email: "",
        session_type: "in_clinic",
        appointment_date: "",
        urgency: "normal",
        payment_method: "cash",
        notes: "",
      })
      setAppointmentDate(undefined)
      setAvailableTimeSlots([])
      setSelectedTimeSlot(null)
      toast({
        title: "✅ Patient Successfully Added",
        description: `${newPatient.name} has been registered and saved to database. Refresh Medical History to view.`,
      })
    } catch (error) {
      console.error("[Mobile Debug] Error adding patient:", error)
      toast({
        title: "Error",
        description: `Failed to add patient. ${error instanceof Error ? error.message : 'Please check your connection and try again.'}`,
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem("admin_authenticated")
      localStorage.removeItem("admin_email")

      await signOutAdmin()
      router.replace("/admin/auth")
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      })
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const generatePrescription = (patient: Patient) => {
    // Check if patient has an existing prescription
    const hasExistingPrescription = patient.prescription_generated || (patient.prescription_count ?? 0) > 0

    if (hasExistingPrescription) {
      // Show existing prescription with option to generate new one
      showExistingPrescription(patient)
    } else {
      // Generate new prescription
      createNewPrescription(patient)
    }
  }

  const showExistingPrescription = (patient: Patient) => {
    // Load existing prescription data
    setPrescriptionNotes(patient.notes || "")
    setPrescriptionMedicine("")
    setChiropracticSuggestions([
      "Apply ice for 15-20 minutes, 3 times daily",
      "Gentle neck stretches as demonstrated",
      "Maintain proper posture while sitting",
      "Sleep with proper pillow support",
    ])
    setSelectedPatient(patient)
    setIsPrescriptionDialogOpen(true)
  }

  const createNewPrescription = (patient: Patient) => {
    // Reset prescription data for new prescription
    setPrescriptionNotes(patient.notes || "")
    setPrescriptionMedicine("")
    setChiropracticSuggestions([
      "Apply ice for 15-20 minutes, 3 times daily",
      "Gentle neck stretches as demonstrated",
      "Maintain proper posture while sitting",
      "Sleep with proper pillow support",
    ])
    setSelectedPatient(patient)
    setIsPrescriptionDialogOpen(true)
  }

  const generateNewPrescription = () => {
    if (selectedPatient) {
      // Clear existing prescription data and create new one
      setPrescriptionNotes(selectedPatient.notes || "")
      setPrescriptionMedicine("")
      setChiropracticSuggestions([
        "Apply ice for 15-20 minutes, 3 times daily",
        "Gentle neck stretches as demonstrated",
        "Maintain proper posture while sitting",
        "Sleep with proper pillow support",
      ])
      toast({
        title: "New Prescription Started",
        description: "You can now create a new prescription for this patient",
      })
    }
  }

  const addChiropracticSuggestion = () => {
    if (newSuggestion.trim()) {
      setChiropracticSuggestions([...chiropracticSuggestions, newSuggestion.trim()])
      setNewSuggestion("")
    }
  }

  const removeChiropracticSuggestion = (index: number) => {
    setChiropracticSuggestions(chiropracticSuggestions.filter((_, i) => i !== index))
  }

  // Helpers for clinical tools
  const toggleArea = (area: string) => {
    setAffectedAreas(prev => (
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    ))
  }
  const toggleExercise = (ex: string) => {
    setSelectedExercises(prev => (
      prev.includes(ex) ? prev.filter(e => e !== ex) : [...prev, ex]
    ))
  }
  const toggleRedFlag = (flag: string, value: boolean) => {
    setRedFlags(prev => {
      const set = new Set(prev)
      if (value) set.add(flag); else set.delete(flag)
      return Array.from(set)
    })
  }
  const setDose = (key: keyof typeof doseSchedule, value: boolean) => {
    setDoseSchedule(prev => ({ ...prev, [key]: value }))
  }
  const deriveSeverity = () => {
    if (painLevel >= 7 || redFlags.length > 0 || selectedPatient?.urgency === 'emergency') return 'Severe'
    if (painLevel >= 4) return 'Moderate'
    return 'Mild'
  }

  // Local professional patient code helpers
  const CLINIC_CODE = 'GCC-NSR' // Gonstead Chiropractic Clinic - Nowshera (editable)

  const getPeriod = (dateISO?: string) => {
    const d = dateISO ? new Date(dateISO) : new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    return `${y}${m}` // e.g., 202511
  }

  // Returns existing code or assigns a new one and persists to localStorage
  const getOrAssignPatientCode = (patient: Patient): string => {
    if (typeof window === 'undefined') return (patient.id || '').slice(0, 8)
    try {
      const map = JSON.parse(localStorage.getItem('patient_code_map') || '{}') as Record<string, string>
      if (map[patient.id]) return map[patient.id]

      const period = getPeriod(patient.appointment_date)
      const seqKey = `patient_code_seq_${period}`
      const next = (parseInt(localStorage.getItem(seqKey) || '0', 10) || 0) + 1
      localStorage.setItem(seqKey, String(next))

      const code = `${CLINIC_CODE}-${period}-${String(next).padStart(4, '0')}` // e.g., GCC-NSR-202511-0007

      map[patient.id] = code
      localStorage.setItem('patient_code_map', JSON.stringify(map))
      return code
    } catch (e) {
      console.warn('Patient code generation failed, falling back to short id:', e)
      return (patient.id || '').slice(0, 8)
    }
  }

  // Lookup helper when only the patient UUID is available
  const getPatientCodeById = (id: string): string => {
    if (typeof window === 'undefined') return (id || '').slice(0, 8)
    try {
      const map = JSON.parse(localStorage.getItem('patient_code_map') || '{}') as Record<string, string>
      return map[id] || (id || '').slice(0, 8)
    } catch {
      return (id || '').slice(0, 8)
    }
  }

  const downloadPrescriptionPDF = async () => {
    const element = document.getElementById("prescription-content")
    if (!element) return

    if (!selectedPatient) {
      toast({
        title: "Error",
        description: "No patient selected for prescription",
        variant: "destructive",
      })
      return
    }

    try {
      // Generate unique prescription ID
      const existingRecords = JSON.parse(localStorage.getItem("prescription_records") || "[]")
      const prescriptionId = `RX${String(existingRecords.length + 1).padStart(3, '0')}`

      // Set the prescription ID in state and make it available globally
      setCurrentPrescriptionId(prescriptionId)
      window.prescriptionId = prescriptionId

      // Force re-render of prescription content with ID
      await new Promise(resolve => setTimeout(resolve, 100))

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(
        `${selectedPatient.name.replace(/\s+/g, "_")}_prescription_${prescriptionId}_${new Date().toISOString().split("T")[0]}.pdf`,
      )

      // Create prescription record for tracking
      const prescriptionRecord = {
        id: prescriptionId,
        patientName: selectedPatient.name,
        phone: selectedPatient.phone,
        email: selectedPatient.email || '',
        prescriptionDate: new Date().toISOString(),
        medications: prescriptionMedicine || 'Chiropractic care recommendations',
        notes: prescriptionNotes || selectedPatient.notes || 'Generated from admin dashboard',
        patientId: selectedPatient.id,
        chiropracticSuggestions: chiropracticSuggestions,
        status: 'active',
        generatedBy: 'admin_dashboard'
      }

      // Save prescription record to localStorage
      const updatedRecords = [...existingRecords, prescriptionRecord]
      localStorage.setItem("prescription_records", JSON.stringify(updatedRecords))

      // Update patient record to mark prescription as generated
      await updatePatient(selectedPatient.id, {
        prescription_generated: true,
        prescription_count: (selectedPatient.prescription_count || 0) + 1,
        last_prescription_date: new Date().toISOString(),
        last_prescription_id: prescriptionId
      })
      await loadPatients() // Refresh the patient list

      toast({
        title: "✅ PDF Downloaded & Prescription Tracked",
        description: `Prescription ${prescriptionId} has been saved and is now trackable in Patient Tracking system`,
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      })
    }
  }

  const printPrescription = async () => {
    const element = document.getElementById("prescription-content")
    if (!element) return

    if (!selectedPatient) {
      toast({
        title: "Error",
        description: "No patient selected for prescription",
        variant: "destructive",
      })
      return
    }

    try {
      // Generate unique prescription ID
      const existingRecords = JSON.parse(localStorage.getItem("prescription_records") || "[]")
      const prescriptionId = `RX${String(existingRecords.length + 1).padStart(3, '0')}`

      // Set the prescription ID in state and make it available globally
      setCurrentPrescriptionId(prescriptionId)
      window.prescriptionId = prescriptionId

      // Force re-render of prescription content with ID
      await new Promise(resolve => setTimeout(resolve, 100))

      // Create prescription record for tracking
      const prescriptionRecord = {
        id: prescriptionId,
        patientName: selectedPatient.name,
        phone: selectedPatient.phone,
        email: selectedPatient.email || '',
        prescriptionDate: new Date().toISOString(),
        medications: prescriptionMedicine || 'Chiropractic care recommendations',
        notes: prescriptionNotes || selectedPatient.notes || 'Generated from admin dashboard',
        patientId: selectedPatient.id,
        chiropracticSuggestions: chiropracticSuggestions,
        status: 'active',
        generatedBy: 'admin_dashboard'
      }

      // Save prescription record to localStorage
      const updatedRecords = [...existingRecords, prescriptionRecord]
      localStorage.setItem("prescription_records", JSON.stringify(updatedRecords))

      // Update patient record to mark prescription as generated
      await updatePatient(selectedPatient.id, {
        prescription_generated: true,
        prescription_count: (selectedPatient.prescription_count || 0) + 1,
        last_prescription_date: new Date().toISOString(),
        last_prescription_id: prescriptionId
      })
      await loadPatients() // Refresh the patient list

      const printWindow = window.open("", "_blank")
      if (!printWindow) return

      printWindow.document.write(`
      <html>
        <head>
          <title>Prescription ${prescriptionId} - ${selectedPatient.name}</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
              }
              * {
                box-sizing: border-box;
              }
            }
            body {
              font-family: Arial, sans-serif;
              line-height: 1.4;
              color: #000;
            }
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
      </html>
    `)

      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
      printWindow.close()

      toast({
        title: "✅ Prescription Printed & Tracked",
        description: `Prescription ${prescriptionId} has been printed and is now trackable in Patient Tracking system`,
      })
    } catch (error) {
      console.error("Error printing prescription:", error)
      toast({
        title: "Error",
        description: "Failed to print prescription",
        variant: "destructive",
      })
    }
  }

  const downloadPatientHistoryPDF = async () => {
    if (!selectedPatientHistory) {
      toast({
        title: "Error",
        description: "No patient selected for history PDF",
        variant: "destructive",
      })
      return
    }

    try {
      // Load clinic logo for professional header (same asset as other PDFs)
      const loadImageAsDataURL = async (path: string) => {
        const res = await fetch(path)
        const blob = await res.blob()
        return await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(blob)
        })
      }

      let logo: string | null = null
      try {
        logo = await loadImageAsDataURL("/images/gonstead-chiropractic-logo-new.png")
      } catch (e) {
        console.warn("History PDF: failed to load logo", e)
      }

      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidth = 210
      const pageHeight = 297
      const margin = 15
      let y = 20
      let currentPage = 1
      const maxPages = 2

      const primaryColor: [number, number, number] = [13, 92, 117]
      const lightGray: [number, number, number] = [243, 244, 246]
      const textMuted: [number, number, number] = [107, 114, 128]

      const addHeader = () => {
        pdf.setFillColor(...primaryColor)
        pdf.rect(0, 0, pageWidth, 22, "F")

        // Optional clinic logo on the left inside the header band
        if (logo) {
          const logoSize = 10
          pdf.addImage(logo, "PNG", margin, 5, logoSize, logoSize)
        }

        pdf.setTextColor(255, 255, 255)
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(13)
        pdf.text("GONSTEAD CHIROPRACTIC CLINIC", pageWidth / 2, 9, { align: "center" })

        pdf.setFontSize(9)
        pdf.setFont("helvetica", "normal")
        pdf.text("Patient Session History Summary", pageWidth / 2, 14, { align: "center" })

        // Discreet address/phone line for formal header
        pdf.setFontSize(8)
        pdf.text(
          "Near Peshawar Model School, Tehsil Road, Nowshera  •  +92 304 699 6267",
          pageWidth / 2,
          19,
          { align: "center" },
        )

        y = 28
      }

      addHeader()

      const code = getPatientCodeById(selectedPatientHistory.id)
      const fullId = selectedPatientHistory.id
      const firstVisitDate = new Date(selectedPatientHistory.appointment_date)
      const lastVisitDate = selectedPatientHistory.last_visit
        ? new Date(selectedPatientHistory.last_visit)
        : null
      const completedSessions = selectedPatientHistory.sessions_completed || 0
      const totalSessions = (selectedPatientHistory.total_sessions ?? completedSessions) || 3

      // Discreet report meta row just under header
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(8)
      pdf.setTextColor(...textMuted)
      const generatedOn = new Date()
      const reportLabel = `History Report: ${code}`
      const generatedLabel = `Generated: ${generatedOn.toLocaleDateString()} ${generatedOn.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
      pdf.text(reportLabel, margin, y)
      pdf.text(generatedLabel, pageWidth - margin, y, { align: "right" })
      y += 6

      // Patient info block
      pdf.setFillColor(...lightGray)
      pdf.roundedRect(margin, y - 6, pageWidth - margin * 2, 18, 2, 2, "F")
      pdf.setTextColor(17, 24, 39)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(11)
      pdf.text(selectedPatientHistory.name || "-", margin + 2, y)

      pdf.setFontSize(9)
      pdf.setTextColor(...textMuted)
      pdf.setFont("helvetica", "normal")
      pdf.text(`Patient Code: ${code}`, margin + 2, y + 5)
      pdf.text(`Patient ID: ${fullId}`, margin + 2, y + 10)

      pdf.text(`Phone: ${selectedPatientHistory.phone || "-"}`, pageWidth - margin - 2, y + 5, { align: "right" })
      pdf.text(`Email: ${selectedPatientHistory.email || "Not provided"}`, pageWidth - margin - 2, y + 10, { align: "right" })

      y += 22

      // Summary block
      const addSummary = () => {
        pdf.setFontSize(10)
        pdf.setTextColor(17, 24, 39)
        pdf.setFont("helvetica", "bold")
        pdf.text("TREATMENT SUMMARY", margin, y)
        pdf.setDrawColor(...primaryColor)
        pdf.setLineWidth(0.5)
        pdf.line(margin, y + 1.5, pageWidth - margin, y + 1.5)
        y += 6

        pdf.setFont("helvetica", "normal")
        pdf.setTextColor(31, 41, 55)

        const colWidth = (pageWidth - margin * 2) / 2
        const leftX = margin
        const rightX = margin + colWidth

        const summaryRowsLeft = [
          ["First Visit", firstVisitDate.toLocaleDateString()],
          ["Last Visit", lastVisitDate ? lastVisitDate.toLocaleDateString() : "No visits yet"],
          ["Session Type", selectedPatientHistory.session_type === "in_clinic" ? "In-Clinic" : "Video"],
        ] as const

        const summaryRowsRight = [
          ["Completed / Total", `${completedSessions} / ${totalSessions}`],
          ["Status", selectedPatientHistory.status.toUpperCase()],
          ["Urgency", (selectedPatientHistory.urgency || "normal").toUpperCase()],
        ] as const

        const rowHeight = 6
        summaryRowsLeft.forEach(([label, val], index) => {
          const rowY = y + index * rowHeight
          pdf.setTextColor(...textMuted)
          pdf.text(`${label}:`, leftX, rowY)
          pdf.setTextColor(31, 41, 55)
          pdf.text(String(val), leftX + 28, rowY)
        })

        summaryRowsRight.forEach(([label, val], index) => {
          const rowY = y + index * rowHeight
          pdf.setTextColor(...textMuted)
          pdf.text(`${label}:`, rightX, rowY)
          pdf.setTextColor(31, 41, 55)
          pdf.text(String(val), rightX + 32, rowY)
        })

        y += rowHeight * Math.max(summaryRowsLeft.length, summaryRowsRight.length) + 4
      }

      addSummary()

      // Build session list (same logic as UI timeline, but simplified)
      const sessions: {
        sessionNumber: number
        date: Date
        status: string
        type: "in_clinic" | "video"
        note: string
      }[] = []

      const sessionsCount = completedSessions
      const startDate = new Date(selectedPatientHistory.appointment_date)
      const effectiveCount = Math.max(sessionsCount, 1)

      for (let i = 0; i < effectiveCount; i++) {
        const sessionDate = new Date(startDate)
        sessionDate.setDate(sessionDate.getDate() + i * 7) // 7‑day spacing as in UI

        const isCompleted = i < sessionsCount
        const isUpcoming = i === sessionsCount && selectedPatientHistory.status === "confirmed"
        const isCurrent = i === 0

        let status: string
        if (isCompleted) status = "completed"
        else if (isUpcoming) status = "upcoming"
        else if (isCurrent) status = "current"
        else status = "scheduled"

        const note = isCurrent
          ? selectedPatientHistory.notes || "Initial consultation"
          : isCompleted
            ? "Gonstead adjustment completed"
            : "Session pending"

        sessions.push({
          sessionNumber: i + 1,
          date: sessionDate,
          status,
          type: selectedPatientHistory.session_type,
          note,
        })
      }

      // Session table header
      const addSessionHeader = () => {
        pdf.setFontSize(10)
        pdf.setFont("helvetica", "bold")
        pdf.setTextColor(17, 24, 39)
        pdf.text("SESSION HISTORY", margin, y)
        pdf.setDrawColor(...primaryColor)
        pdf.setLineWidth(0.5)
        pdf.line(margin, y + 1.5, pageWidth - margin, y + 1.5)
        y += 6

        const colSession = 14
        const colDate = 38
        const colTime = 24
        const colStatus = 28
        const colNotes = pageWidth - margin * 2 - (colSession + colDate + colTime + colStatus)

        pdf.setFillColor(...primaryColor)
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(8.5)

        let x = margin
        const headerHeight = 7
        const headers: [string, number][] = [
          ["#", colSession],
          ["Date", colDate],
          ["Time", colTime],
          ["Status", colStatus],
          ["Notes", colNotes],
        ]

        headers.forEach(([label, width]) => {
          pdf.rect(x, y, width, headerHeight, "F")
          pdf.text(label, x + 2, y + 4.5)
          x += width
        })

        y += headerHeight + 1.5

        return { colSession, colDate, colTime, colStatus, colNotes }
      }

      const cols = addSessionHeader()

      // Table rows, limited to 2 pages
      const rowHeight = 6
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(8)

      const renderRow = (session: typeof sessions[number]) => {
        const remainingHeight = pageHeight - margin - y
        if (remainingHeight < rowHeight + 8) {
          if (currentPage >= maxPages) return false
          pdf.addPage()
          currentPage += 1
          addHeader()
          addSummary()
          addSessionHeader()
        }

        // Zebra background for readability
        const rowTop = y
        const rowWidth = pageWidth - margin * 2
        if (session.sessionNumber % 2 === 0) {
          pdf.setFillColor(248, 250, 252)
          pdf.rect(margin, rowTop - 1, rowWidth, rowHeight + 2, "F")
        }

        let x = margin
        const dateStr = session.date.toLocaleDateString()
        const timeStr = session.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        const statusStr = session.status.toUpperCase()

        pdf.setTextColor(31, 41, 55)

        // #
        pdf.text(String(session.sessionNumber), x + 2, y + 4)
        x += cols.colSession

        // Date
        pdf.text(dateStr, x + 2, y + 4)
        x += cols.colDate

        // Time
        pdf.text(timeStr, x + 2, y + 4)
        x += cols.colTime

        // Status
        pdf.text(statusStr, x + 2, y + 4)
        x += cols.colStatus

        // Notes (wrap)
        const maxNoteWidth = cols.colNotes - 3
        const noteLines = pdf.splitTextToSize(session.note, maxNoteWidth) as string[]
        pdf.text(noteLines[0], x + 2, y + 4)

        y += rowHeight
        return true
      }

      for (const session of sessions) {
        const ok = renderRow(session)
        if (!ok) break
      }

      // Footer with generation timestamp and clinic credentials
      pdf.setFontSize(7.5)
      pdf.setTextColor(...textMuted)
      const generated = new Date()
      const footerLine1 = `Generated on ${generated.toLocaleDateString()} ${generated.toLocaleTimeString()} • Gonstead Chiropractic Clinic`
      const footerLine2 = "Dr. Bashir Khan — Gonstead Certified Specialist • Clinical use only"
      pdf.text(footerLine1, pageWidth / 2, pageHeight - 10, { align: "center" })
      pdf.text(footerLine2, pageWidth / 2, pageHeight - 6, { align: "center" })

      const safeName = selectedPatientHistory.name.replace(/\s+/g, "_")
      const patientCode = code
      const today = new Date().toISOString().split("T")[0]
      const fileName = `${safeName}_Session_History_${patientCode}_${today}.pdf`
      pdf.save(fileName)

      toast({
        title: "✅ History PDF Downloaded",
        description: `Session history downloaded for ${selectedPatientHistory.name}`,
      })
    } catch (error) {
      console.error("Error generating history PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate history PDF",
        variant: "destructive",
      })
    }
  }

  const startVideoCall = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsVideoCallDialogOpen(true)
  }

  const toggleVideoCallFullscreen = () => {
    if (!videoCallDialogRef.current) return

    if (!isVideoCallFullscreen) {
      // Enter fullscreen
      if (videoCallDialogRef.current.requestFullscreen) {
        videoCallDialogRef.current.requestFullscreen()
      } else if ((videoCallDialogRef.current as any).webkitRequestFullscreen) {
        (videoCallDialogRef.current as any).webkitRequestFullscreen()
      } else if ((videoCallDialogRef.current as any).mozRequestFullScreen) {
        (videoCallDialogRef.current as any).mozRequestFullScreen()
      } else if ((videoCallDialogRef.current as any).msRequestFullscreen) {
        (videoCallDialogRef.current as any).msRequestFullscreen()
      }
      setIsVideoCallFullscreen(true)
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen()
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen()
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen()
      }
      setIsVideoCallFullscreen(false)
    }
  }

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement)
      setIsVideoCallFullscreen(isCurrentlyFullscreen)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  const generateDetailedReport = async (patient: Patient) => {
    try {
      // Helper: load logo as data URL (same-origin public path)
      const loadImageAsDataURL = async (path: string) => {
        const res = await fetch(path)
        const blob = await res.blob()
        return await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(blob)
        })
      }

      const logo = await loadImageAsDataURL('/images/gonstead-chiropractic-logo-new.png')

      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = 210
      const pageHeight = 297
      const margin = 15
      let y = 14

      // Global typography
      pdf.setLineHeightFactor(1.35)

      // Page border
      pdf.setDrawColor(228)
      pdf.rect(7, 7, pageWidth - 14, pageHeight - 14)

      // Header band with logo
      pdf.setFillColor(13, 92, 117)
      pdf.rect(0, 0, pageWidth, 32, 'F')
      // Logo badge
      pdf.setFillColor(255, 255, 255)
      pdf.circle(20, 16, 10, 'F')
      pdf.addImage(logo, 'PNG', 11, 7, 18, 18)

      // Clinic identity
      pdf.setTextColor(255, 255, 255)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(18)
      pdf.text('GONSTEAD CHIROPRACTIC CLINIC', pageWidth / 2 + 6, 13, { align: 'center' })
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Dr. Bashir Khan — Gonstead Certified Specialist', pageWidth / 2 + 6, 19.5, { align: 'center' })
      pdf.text('Near Peshawar Model School, Tehsil Road, Nowshera  •  +92 304 699 6267', pageWidth / 2 + 6, 26, { align: 'center' })

      // Report ribbon
      pdf.setFillColor(227, 252, 236)
      pdf.roundedRect(margin, 34, pageWidth - margin * 2, 8, 2, 2, 'F')
      pdf.setTextColor(13, 92, 117)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(11)
      pdf.text('PATIENT CLINICAL REPORT', pageWidth / 2, 40, { align: 'center' })

      // Small helpers
      const muted = () => pdf.setTextColor(75, 85, 99)
      const strong = () => pdf.setTextColor(17, 24, 39)

      // Badge chip helper
      const chip = (txt: string, x: number, y0: number, fill: [number, number, number]) => {
        const padX = 2.8
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(9)
        const w = Math.min(pageWidth - margin - x, pdf.getTextWidth(txt) + padX * 2)
        pdf.setFillColor(...fill)
        pdf.setTextColor(255, 255, 255)
        pdf.roundedRect(x, y0 - 4.6, w, 7, 2, 2, 'F')
        pdf.text(txt, x + padX, y0)
        strong()
        return x + w + 3
      }

      // Section helper
      const section = (title: string) => {
        y += 9
        pdf.setDrawColor(13, 92, 117)
        pdf.setFillColor(240, 253, 249)
        pdf.roundedRect(margin, y, pageWidth - margin * 2, 9, 2, 2, 'FD')
        pdf.setTextColor(13, 92, 117)
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(11)
        pdf.text(title, margin + 3, y + 6)
        y += 10
        strong()
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(10.5)
      }

      // Key header row for clarity
      y = 48
      strong(); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(15)
      pdf.text(patient.name || '-', margin, y)
      muted(); pdf.setFont('helvetica', 'normal'); pdf.setFontSize(10.5)
      const apptText = patient.appointment_date ? `${new Date(patient.appointment_date).toLocaleDateString()}  •  ${new Date(patient.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '—'
      pdf.text(apptText, pageWidth - margin, y, { align: 'right' })
      y += 6

      // Overview chips
      let cx = margin
      cx = chip(`STATUS: ${patient.status.toUpperCase()}`, cx, y, patient.status === 'completed' ? [34, 197, 94] : patient.status === 'confirmed' ? [59, 130, 246] : patient.status === 'cancelled' ? [239, 68, 68] : [234, 179, 8])
      cx = chip(`URGENCY: ${(patient.urgency || 'normal').toUpperCase()}`, cx, y, patient.urgency === 'emergency' ? [220, 38, 38] : patient.urgency === 'urgent' ? [245, 158, 11] : [107, 114, 128])
      chip(`SESSION: ${patient.session_type === 'in_clinic' ? 'IN-CLINIC' : 'VIDEO'}`, cx, y, patient.session_type === 'in_clinic' ? [13, 92, 117] : [99, 102, 241])

      // Patient information table helper
      const drawInfoTable = (title: string, rows: Array<{ label: string; value: string }>) => {
        section(title)

        const tableWidth = pageWidth - margin * 2
        const labelColWidth = tableWidth * 0.35
        const valueColWidth = tableWidth * 0.65
        const cellPadding = 3.5
        const rowHeight = 10

        // Table border
        pdf.setDrawColor(200, 200, 200)
        pdf.setLineWidth(0.2)

        rows.forEach((row, idx) => {
          const rowY = y + (idx * rowHeight)

          // Alternating row background
          if (idx % 2 === 0) {
            pdf.setFillColor(249, 250, 251)
            pdf.rect(margin, rowY, tableWidth, rowHeight, 'F')
          }

          // Draw cell borders
          pdf.setDrawColor(220, 220, 220)
          pdf.rect(margin, rowY, labelColWidth, rowHeight, 'S')
          pdf.rect(margin + labelColWidth, rowY, valueColWidth, rowHeight, 'S')

          // Label (left column) - bold and colored
          pdf.setTextColor(55, 65, 81)
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(9.5)
          pdf.text(row.label.toUpperCase(), margin + cellPadding, rowY + rowHeight / 2 + 1.5)

          // Value (right column) - regular weight
          pdf.setTextColor(31, 41, 55)
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(10)

          // Handle text wrapping for long values
          const maxValueWidth = valueColWidth - (cellPadding * 2)
          const wrappedValue = pdf.splitTextToSize(row.value || '—', maxValueWidth)
          const valueLines = Array.isArray(wrappedValue) ? wrappedValue : [wrappedValue]

          // Only show first line if too long, otherwise show full text
          const displayValue = valueLines.length > 1 ? valueLines[0] : valueLines[0]
          pdf.text(displayValue, margin + labelColWidth + cellPadding, rowY + rowHeight / 2 + 1.5)
        })

        // Outer table border
        pdf.setDrawColor(180, 180, 180)
        pdf.setLineWidth(0.4)
        pdf.rect(margin, y, tableWidth, rowHeight * rows.length, 'S')

        y += rowHeight * rows.length + 3
        strong()
      }

      // Patient Information Table
      drawInfoTable('PATIENT INFORMATION', [
        { label: 'Patient ID', value: patient.id },
        { label: 'Full Name', value: patient.name || '—' },
        { label: 'Phone Number', value: patient.phone || 'Not provided' },
        { label: 'Email Address', value: patient.email || 'Not provided' },
        { label: 'Age / Gender', value: `${patient.demographics?.age ?? '—'} / ${patient.demographics?.gender ?? 'Not specified'}` },
        { label: 'Profession', value: patient.profession ? patient.profession.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'Not specified' },
        { label: 'Payment Method', value: (patient.payment_method || 'cash').toUpperCase() },
      ])

      // Appointment & Status Table
      drawInfoTable('APPOINTMENT & STATUS', [
        { label: 'Appointment Date & Time', value: apptText },
        { label: 'Last Visit Date', value: patient.last_visit ? new Date(patient.last_visit).toLocaleDateString() : '—' },
        { label: 'Session Progress', value: `${patient.sessions_completed || 0} of ${patient.total_sessions || 8} completed` },
        { label: 'Session Type', value: patient.session_type === 'in_clinic' ? 'In-Clinic' : 'Video Consultation' },
      ])

      // Next Appointment Section (if available)
      if (patient.next_appointment_date) {
        const nextAppt = new Date(patient.next_appointment_date)
        const nextApptDate = nextAppt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        const nextApptTime = nextAppt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
        const nextApptDay = nextAppt.toLocaleDateString('en-US', { weekday: 'long' })

        drawInfoTable('NEXT APPOINTMENT SCHEDULED', [
          { label: 'Date', value: nextApptDate },
          { label: 'Time', value: nextApptTime },
          { label: 'Day of Week', value: nextApptDay },
          { label: 'Notes', value: patient.next_appointment_notes || 'Follow-up appointment' },
          { label: 'Booked On', value: patient.next_appointment_booked_at ? new Date(patient.next_appointment_booked_at).toLocaleDateString() : '—' },
        ])
      }

      // Appointment History Section (if available) - Enhanced with Session Numbers & Timestamps
      if (patient.appointment_history && patient.appointment_history.length > 0) {
        section('APPOINTMENT HISTORY (ALL SESSIONS)')

        const tableWidth = pageWidth - margin * 2
        const colWidths = [tableWidth * 0.08, tableWidth * 0.20, tableWidth * 0.18, tableWidth * 0.12, tableWidth * 0.10, tableWidth * 0.18, tableWidth * 0.14]
        const cellPadding = 2
        const rowHeight = 10

        // Table header
        pdf.setFillColor(13, 92, 117)
        pdf.setTextColor(255, 255, 255)
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(8)

        const headers = ['#', 'Date', 'Time & Day', 'Type', 'Status', 'Completed At', 'Notes']
        let xPos = margin
        headers.forEach((header, idx) => {
          pdf.rect(xPos, y, colWidths[idx], rowHeight, 'F')
          pdf.text(header, xPos + cellPadding, y + rowHeight / 2 + 1.5)
          xPos += colWidths[idx]
        })
        y += rowHeight

        // Table rows
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(7.5)
        patient.appointment_history.slice(0, 10).forEach((appt, idx) => {
          const apptDate = new Date(appt.appointment_date)
          const dateStr = apptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          const timeStr = apptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
          const dayStr = apptDate.toLocaleDateString('en-US', { weekday: 'short' })

          // Session completion timestamp
          const completedAtStr = appt.completed_at
            ? new Date(appt.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
            new Date(appt.completed_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
            : '—'

          // Alternating row background
          if (idx % 2 === 0) {
            pdf.setFillColor(249, 250, 251)
            pdf.rect(margin, y, tableWidth, rowHeight, 'F')
          }

          // Row data
          pdf.setTextColor(31, 41, 55)
          xPos = margin

          // Session number column
          const sessionNum = appt.session_number || (idx + 1)
          pdf.setFont('helvetica', 'bold')
          pdf.text(`#${sessionNum}`, xPos + cellPadding, y + rowHeight / 2 + 1.5)
          pdf.setFont('helvetica', 'normal')
          pdf.setDrawColor(220, 220, 220)
          pdf.line(xPos, y, xPos, y + rowHeight)
          xPos += colWidths[0]

          // Date column
          pdf.text(dateStr, xPos + cellPadding, y + rowHeight / 2 + 1.5)
          pdf.line(xPos, y, xPos, y + rowHeight)
          xPos += colWidths[1]

          // Time & Day column
          pdf.text(`${timeStr} (${dayStr})`, xPos + cellPadding, y + rowHeight / 2 + 1.5)
          pdf.line(xPos, y, xPos, y + rowHeight)
          xPos += colWidths[2]

          // Session Type column
          const sessionType = appt.session_type === 'in_clinic' ? 'Clinic' : 'Video'
          pdf.text(sessionType, xPos + cellPadding, y + rowHeight / 2 + 1.5)
          pdf.line(xPos, y, xPos, y + rowHeight)
          xPos += colWidths[3]

          // Status column
          pdf.setFont('helvetica', 'bold')
          pdf.text(appt.status.toUpperCase(), xPos + cellPadding, y + rowHeight / 2 + 1.5)
          pdf.setFont('helvetica', 'normal')
          pdf.line(xPos, y, xPos, y + rowHeight)
          xPos += colWidths[4]

          // Completed At column
          pdf.setFontSize(7)
          pdf.text(completedAtStr, xPos + cellPadding, y + rowHeight / 2 + 1.5)
          pdf.setFontSize(7.5)
          pdf.line(xPos, y, xPos, y + rowHeight)
          xPos += colWidths[5]

          // Notes column
          const notes = appt.notes ? pdf.splitTextToSize(appt.notes, colWidths[6] - cellPadding * 2) : ['—']
          pdf.text(Array.isArray(notes) ? notes[0] : notes, xPos + cellPadding, y + rowHeight / 2 + 1.5)
          pdf.line(xPos, y, xPos, y + rowHeight)

          // Bottom border
          pdf.line(margin, y + rowHeight, margin + tableWidth, y + rowHeight)
          y += rowHeight
        })

        // Outer table border
        pdf.setDrawColor(180, 180, 180)
        pdf.setLineWidth(0.4)
        pdf.rect(margin, y - (patient.appointment_history.slice(0, 10).length * rowHeight) - rowHeight, tableWidth, (patient.appointment_history.slice(0, 10).length + 1) * rowHeight, 'S')

        y += 3
        strong()
      }

      section('CHIEF COMPLAINT')
      const notes = pdf.splitTextToSize(patient.notes || 'No complaints noted.', pageWidth - margin * 2)
      strong(); pdf.text(notes, margin, y + 5)
      y += 5 + (Array.isArray(notes) ? Math.min(notes.length, 16) * 5 : 5)

      section('TREATMENT PLAN')
      const bullets: string[] = []
      if (patient.treatment_plan?.diagnosis) bullets.push(`Diagnosis: ${patient.treatment_plan.diagnosis}`)
      if (patient.treatment_plan?.goals) {
        const arr = Array.isArray(patient.treatment_plan.goals) ? patient.treatment_plan.goals : [String(patient.treatment_plan.goals)]
        bullets.push(...arr.map((g) => `Goal: ${g}`))
      }
      bullets.push(`Progress: ${patient.treatment_plan?.progress || 'Pending'}`)
      pdf.setFillColor(13, 92, 117)
      bullets.forEach((b) => {
        const wrapped = pdf.splitTextToSize(b, pageWidth - margin * 2 - 6)
        pdf.circle(margin + 1.8, y + 1.8, 0.8, 'F')
        pdf.text(wrapped, margin + 5, y + 2.6)
        y += 5 + (Array.isArray(wrapped) ? (wrapped as string[]).length * 4 : 5)
      })

      // Footer
      pdf.setDrawColor(230)
      pdf.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18)
      pdf.setFontSize(9)
      pdf.setTextColor(120)
      const gen = new Date()
      pdf.text(`Generated ${gen.toLocaleDateString()} ${gen.toLocaleTimeString()} • Gonstead Chiropractic Clinic`, pageWidth / 2, pageHeight - 10, { align: 'center' })

      // Save
      const fileName = `${patient.name.replace(/\s+/g, '_')}_Patient_Report_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      toast({ title: '✅ PDF Generated', description: `Downloaded ${fileName}` })
    } catch (err) {
      console.error('PDF generation failed:', err)
      toast({ title: 'Error', description: 'Failed to generate PDF report', variant: 'destructive' })
    }
  }

  const generateDailyAppointmentsPDF = async (dateISO: string) => {
    try {
      // Load clinic logo
      const loadImageAsDataURL = async (path: string) => {
        const res = await fetch(path)
        const blob = await res.blob()
        return await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(blob)
        })
      }
      const logo = await loadImageAsDataURL('/images/gonstead-chiropractic-logo-new.png')

      const target = new Date(dateISO)
      const targetStr = target.toDateString()
      const rows = patients.filter(p => new Date(p.appointment_date).toDateString() === targetStr)

      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = 210
      const margin = 12
      let y = 14

      // Header with logo
      pdf.setFillColor(42, 157, 143)
      pdf.rect(0, 0, pageWidth, 28, 'F')
      pdf.setFillColor(255, 255, 255)
      pdf.circle(18, 14, 8, 'F')
      pdf.addImage(logo, 'PNG', 11, 7, 14, 14)

      pdf.setTextColor(255, 255, 255)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(15)
      pdf.text('DAILY APPOINTMENTS SUMMARY', pageWidth / 2 + 8, 12.5, { align: 'center' })
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`${target.toLocaleDateString()} • Gonstead Chiropractic Clinic`, pageWidth / 2 + 8, 20, { align: 'center' })

      // Table header
      y = 34
      pdf.setTextColor(255, 255, 255)
      pdf.setFillColor(13, 92, 117)
      const headerH = 8
      pdf.roundedRect(margin, y - 6, pageWidth - margin * 2, headerH, 2, 2, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(10)
      const cols = [
        { k: '#', w: 10 },
        { k: 'Name', w: 64 },
        { k: 'Phone', w: 32 },
        { k: 'Time', w: 20 },
        { k: 'Type', w: 22 },
        { k: 'Status', w: 22 },
        { k: 'Urgency', w: 22 },
      ]
      let x = margin
      cols.forEach(c => { pdf.text(String(c.k), x + (c.k === 'Name' || c.k === 'Phone' ? 0 : c.w / 2), y - 1.5, { align: (c.k === 'Name' || c.k === 'Phone') ? 'left' : 'center' }); x += c.w })

      // Rows
      y += 2
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(33, 37, 41)
      let idx = 1
      const timeFmt = (d: string) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const badge = (text: string, x: number, cw: number, yTop: number, color: [number, number, number]) => {
        const padX = 2.5
        const w = pdf.getTextWidth(text) + padX * 2
        const bx = x + (cw - w) / 2
        pdf.setFillColor(...color)
        pdf.setTextColor(255, 255, 255)
        pdf.roundedRect(bx, yTop - 4.2, Math.min(w, cw), 6.5, 2, 2, 'F')
        pdf.text(text, x + cw / 2, yTop, { align: 'center' })
        pdf.setTextColor(33, 37, 41)
      }

      rows.forEach(r => {
        if (y > 275) return // keep one-page
        x = margin
        const values = [
          String(idx++),
          r.name,
          r.phone,
          timeFmt(r.appointment_date),
          r.session_type === 'in_clinic' ? 'Clinic' : 'Video',
          r.status.toUpperCase(),
          r.urgency.toUpperCase(),
        ]
        const nameWrapped = pdf.splitTextToSize(values[1], cols[1].w)
        const rowHeight = Math.max(7, Array.isArray(nameWrapped) ? nameWrapped.length * 4.4 : 7)
        // zebra background
        if ((idx - 1) % 2 === 0) { pdf.setFillColor(248, 250, 252); pdf.rect(margin - 1, y - 5.5, pageWidth - (margin * 2) + 2, rowHeight + 3, 'F') }

        values.forEach((val, i) => {
          const cw = cols[i].w
          if (i === 1) {
            pdf.text(nameWrapped, x, y)
          } else if (i === 0 || i === 3) {
            pdf.text(String(val), x + cw / 2, y, { align: 'center' })
          } else if (i === 5) {
            const c = val === 'COMPLETED' ? [34, 197, 94] : val === 'CONFIRMED' ? [59, 130, 246] : val === 'CANCELLED' ? [239, 68, 68] : [234, 179, 8]
            badge(String(val), x, cw, y, c as [number, number, number])
          } else if (i === 6) {
            const c = val === 'EMERGENCY' ? [220, 38, 38] : val === 'URGENT' ? [245, 158, 11] : [107, 114, 128]
            badge(String(val), x, cw, y, c as [number, number, number])
          } else {
            pdf.text(String(val), x, y)
          }
          x += cw
        })
        y += rowHeight
        pdf.setDrawColor(235); pdf.line(margin, y, pageWidth - margin, y); y += 1.4
      })

      // Footer
      pdf.setDrawColor(230)
      pdf.line(margin, 284, pageWidth - margin, 284)
      pdf.setFontSize(9)
      pdf.setTextColor(120)
      pdf.text(`Total: ${rows.length} appointments`, margin, 290)
      pdf.text('Gonstead Chiropractic Clinic', pageWidth - margin, 290, { align: 'right' })

      const fileName = `Appointments_${target.toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      toast({ title: '✅ PDF Generated', description: `Downloaded ${fileName}` })
    } catch (err) {
      console.error('Daily PDF generation failed:', err)
      toast({ title: 'Error', description: 'Failed to generate day PDF', variant: 'destructive' })
    }
  }

  const updateClinicLocation = (newLocation: any) => {
    setClinicLocation(newLocation)
    toast({
      title: "Location Updated",
      description: "Clinic location has been updated successfully",
    })
  }

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient)
    setIsEditPatientDialogOpen(true)
  }

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPatient) return

    try {
      // Auto-derive status from sessions before saving (unless explicitly cancelled)
      const total = editingPatient.total_sessions || 8
      const completed = editingPatient.sessions_completed || 0
      const derivedStatus: Patient["status"] = editingPatient.status === 'cancelled'
        ? 'cancelled'
        : (completed >= total ? 'completed' : (completed <= 0 ? 'pending' : 'confirmed'))

      const payload = {
        ...editingPatient,
        status: derivedStatus,
        // Only reset session counters to 0/0 if patient never attended any session
        ...(derivedStatus === 'cancelled' && (completed || 0) <= 0
          ? { total_sessions: 0, sessions_completed: 0 }
          : {})
      }

      const before = patients.find(p => p.id === editingPatient.id)
      await updatePatient(editingPatient.id, payload)
      // Audit: update
      try { await addAuditLog({ action: 'update', entity_type: 'patient', entity_id: editingPatient.id, actor_email: localStorage.getItem('admin_email') || undefined, source: 'admin_dashboard', reversible: true, meta: { before, after: payload } }) } catch { }
      await loadPatients()
      setIsEditPatientDialogOpen(false)
      setEditingPatient(null)
      toast({
        title: "Patient Updated",
        description: `Saved. Status is now ${derivedStatus.toUpperCase()} based on ${completed}/${total} sessions.`,
      })
    } catch (error) {
      console.error("Error updating patient:", error)
      toast({
        title: "Error",
        description: "Failed to update patient information",
        variant: "destructive",
      })
    }
  }

  // Helper function to get appointments for a specific date
  const getAppointmentsForDate = (date: string) => {
    const targetDate = new Date(date).toDateString()
    return patients.filter((p) => new Date(p.appointment_date).toDateString() === targetDate)
  }

  // Handle date selection from date picker for filtering
  const handleDatePickerSelection = (date: string) => {
    setSelectedDate(date)
    const appointmentsForDate = getAppointmentsForDate(date)
    setSelectedDateAppointments(appointmentsForDate)

    // Apply filter to main patient list - use custom date filter
    setFilterStatus("custom_date")
    setFilterUrgency("all")
    setSearchTerm("")

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    toast({
      title: "📅 Date Filter Applied",
      description: `Showing appointments for ${formattedDate} (${appointmentsForDate.length} found)`,
    })
  }

  // Generate quick date options (Today, Tomorrow, etc.)
  const getQuickDateOptions = () => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfterTomorrow = new Date(today)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    return [
      { label: "Today", date: today.toISOString().split('T')[0], count: getAppointmentsForDate(today.toISOString().split('T')[0]).length },
      { label: "Tomorrow", date: tomorrow.toISOString().split('T')[0], count: getAppointmentsForDate(tomorrow.toISOString().split('T')[0]).length },
      { label: "Day After Tomorrow", date: dayAfterTomorrow.toISOString().split('T')[0], count: getAppointmentsForDate(dayAfterTomorrow.toISOString().split('T')[0]).length },
      { label: "Next Week", date: nextWeek.toISOString().split('T')[0], count: getAppointmentsForDate(nextWeek.toISOString().split('T')[0]).length },
    ]
  }

  // Toggle function for expanding/collapsing action buttons with auto-close
  const toggleActionsExpanded = (patientId: string) => {
    setExpandedActions(prev => {
      const newExpanded = new Set()

      // If the clicked patient's menu is already open, close it
      // If it's closed, open only this one (auto-close all others)
      if (!prev.has(patientId)) {
        newExpanded.add(patientId)
      }
      // If patientId is already in prev, newExpanded remains empty (closes all)

      return newExpanded
    })
  }

  // Sort patients to show ALL new appointments at the top (both admin and website bookings)
  const sortedPatients = [...patients].sort((a, b) => {
    // First, prioritize ALL new appointments (those not viewed, regardless of booking source)
    const aIsNew = !viewedPatients.has(a.id)
    const bIsNew = !viewedPatients.has(b.id)

    if (aIsNew && !bIsNew) return -1
    if (!aIsNew && bIsNew) return 1

    // If both are new or both are viewed, sort by appointment date (newest first)
    return new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
  })

  const filteredPatients = sortedPatients.filter((patient) => {
    // Enhanced comprehensive search across all patient fields, including code and date/time
    const q = searchTerm.toLowerCase().trim()

    // Pre-compute common date/time strings for matching
    const appt = new Date(patient.appointment_date)
    const apptISO = (patient.appointment_date || '').toLowerCase()
    const apptDateOnly = !isNaN(appt.getTime()) ? appt.toISOString().slice(0, 10) : '' // YYYY-MM-DD
    const apptHumanDate = !isNaN(appt.getTime()) ? appt.toDateString().toLowerCase() : '' // e.g., sat nov 08 2025
    const apptHumanDateShort = !isNaN(appt.getTime()) ? appt.toLocaleDateString().toLowerCase() : ''
    const apptHumanTime12 = !isNaN(appt.getTime()) ? appt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase() : ''
    const apptHumanTime24 = !isNaN(appt.getTime()) ? `${String(appt.getHours()).padStart(2, '0')}:${String(appt.getMinutes()).padStart(2, '0')}` : ''

    const lastVisit = patient.last_visit ? new Date(patient.last_visit) : null
    const lastVisitISO = (patient.last_visit || '').toLowerCase()
    const lastVisitDateOnly = lastVisit && !isNaN(lastVisit.getTime()) ? lastVisit.toISOString().slice(0, 10) : ''
    const lastVisitHuman = lastVisit && !isNaN(lastVisit.getTime()) ? lastVisit.toDateString().toLowerCase() : ''

    const createdISO = (patient.created_at || '').toLowerCase()
    const updatedISO = (patient.updated_at || '').toLowerCase()

    const lastRxISO = (patient.last_prescription_date || '').toLowerCase()

    // Generated human code used in UI (GCC-...-YYYYMM-####)
    const code = getOrAssignPatientCode(patient).toLowerCase()

    const matchesSearch = q ? (
      // Codes and IDs
      code.includes(q) ||
      (patient.id || '').toLowerCase().includes(q) ||

      // Basic info
      (patient.name || '').toLowerCase().includes(q) ||
      (patient.phone || '').toLowerCase().includes(q) ||
      (patient.email || '').toLowerCase().includes(q) ||

      // Session and appointment info
      (patient.session_type || '').toLowerCase().includes(q) ||
      (patient.status || '').toLowerCase().includes(q) ||
      (patient.urgency || '').toLowerCase().includes(q) ||
      (patient.payment_method || '').toLowerCase().includes(q) ||

      // Appointment date/time (raw + human + parts)
      apptISO.includes(q) ||
      apptDateOnly.includes(q) ||
      apptHumanDate.includes(q) ||
      apptHumanDateShort.includes(q) ||
      apptHumanTime12.includes(q) ||
      apptHumanTime24.includes(q) ||

      // Medical and treatment info
      (patient.notes || '').toLowerCase().includes(q) ||
      (patient.medical_history || '').toLowerCase().includes(q) ||
      (patient.profession || '').toLowerCase().includes(q) ||

      // Demographics (nested fields)
      (patient.demographics?.age != null ? String(patient.demographics.age) : '').includes(q) ||
      (patient.demographics?.gender || '').toLowerCase().includes(q) ||
      (patient.demographics?.occupation || patient.demographics?.profession || '').toLowerCase().includes(q) ||
      (patient.demographics?.emergency_contact || '').toLowerCase().includes(q) ||

      // Treatment plan (nested fields)
      (patient.treatment_plan?.diagnosis || '').toLowerCase().includes(q) ||
      (Array.isArray(patient.treatment_plan?.goals) ? patient.treatment_plan!.goals.some(goal => String(goal).toLowerCase().includes(q)) : false) ||
      (patient.treatment_plan?.progress || '').toLowerCase().includes(q) ||

      // Prescription info (nested fields)
      (Array.isArray(patient.prescription?.medications) ? patient.prescription!.medications.some(med => String(med).toLowerCase().includes(q)) : false) ||
      (patient.prescription?.instructions || '').toLowerCase().includes(q) ||
      (patient.prescription?.follow_up_date || '').toLowerCase().includes(q) ||
      (patient.last_prescription_id || '').toLowerCase().includes(q) ||

      // Session counts
      String(patient.sessions_completed ?? '').includes(q) ||
      String(patient.total_sessions ?? '').includes(q) ||

      // Other dates/timestamps
      lastVisitISO.includes(q) ||
      lastVisitDateOnly.includes(q) ||
      lastVisitHuman.includes(q) ||
      createdISO.includes(q) ||
      updatedISO.includes(q) ||
      lastRxISO.includes(q) ||

      // Booking source
      (patient.booking_source || '').toLowerCase().includes(q)
    ) : true

    // Handle status filters
    let matchesStatus = true
    if (filterStatus === "today") {
      const today = new Date().toDateString()
      matchesStatus = new Date(patient.appointment_date).toDateString() === today
    } else if (filterStatus === "custom_date") {
      // Handle custom date filtering from date picker
      const targetDate = new Date(selectedDate).toDateString()
      matchesStatus = new Date(patient.appointment_date).toDateString() === targetDate
    } else if (filterStatus === "completed_sessions") {
      matchesStatus = (patient.sessions_completed || 0) > 0
    } else if (filterStatus !== "all") {
      matchesStatus = patient.status === filterStatus
    }

    const matchesUrgency = filterUrgency === "all" || patient.urgency === filterUrgency

    // Handle time period filters
    let matchesTimePeriod = true
    if (filterTimePeriod !== "all") {
      const appointmentDate = new Date(patient.appointment_date)
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      if (filterTimePeriod === "today") {
        matchesTimePeriod = appointmentDate.toDateString() === today.toDateString()
      } else if (filterTimePeriod === "week") {
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - today.getDay()) // Start of this week (Sunday)
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 7)
        matchesTimePeriod = appointmentDate >= weekStart && appointmentDate < weekEnd
      } else if (filterTimePeriod === "month") {
        matchesTimePeriod = appointmentDate.getMonth() === now.getMonth() && appointmentDate.getFullYear() === now.getFullYear()
      } else if (filterTimePeriod === "year") {
        matchesTimePeriod = appointmentDate.getFullYear() === now.getFullYear()
      }
    }

    return matchesSearch && matchesStatus && matchesUrgency && matchesTimePeriod
  })

  // Smart professional sorting over filtered results
  const userSortedPatients = React.useMemo(() => {
    const list = [...filteredPatients]
    if (!sortConfig) return list

    const dir = sortConfig.direction === 'asc' ? 1 : -1

    const statusRank: Record<Patient['status'], number> = { pending: 0, confirmed: 1, completed: 2, cancelled: 3 }
    const urgencyRank: Record<NonNullable<Patient['urgency']>, number> = { normal: 0, urgent: 1, emergency: 2 }
    const typeRank: Record<Patient['session_type'], number> = { in_clinic: 0, video: 1 }

    const getVal = (p: Patient): number | string => {
      switch (sortConfig.key) {
        case 'name':
          return (p.name || '').toLowerCase()
        case 'phone':
          return (p.phone || '').toLowerCase()
        case 'profession':
          return (p.profession || p.demographics?.profession || p.demographics?.occupation || '').toLowerCase()
        case 'appointment_date':
          return new Date(p.appointment_date).getTime() || 0
        case 'status':
          return statusRank[p.status]
        case 'urgency':
          return urgencyRank[p.urgency || 'normal']
        case 'session_type':
          return typeRank[p.session_type]
        case 'sessions': {
          const total = p.total_sessions || 8
          const completed = p.sessions_completed || 0
          const ratio = total > 0 ? completed / total : 0
          // Use a composite number to stabilize sort: ratio with slight bias by total completed
          return ratio + completed / 1000
        }
        default:
          return 0
      }
    }

    list.sort((a, b) => {
      const va = getVal(a)
      const vb = getVal(b)
      if (typeof va === 'string' && typeof vb === 'string') {
        const cmp = va.localeCompare(vb)
        if (cmp !== 0) return cmp * dir
      } else {
        const na = Number(va)
        const nb = Number(vb)
        if (na !== nb) return (na < nb ? -1 : 1) * dir
      }
      // Tie-breakers: newest appointment first, then name asc
      const dateCmp = new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
      if (dateCmp !== 0) return dateCmp
      return (a.name || '').localeCompare(b.name || '')
    })

    return list
  }, [filteredPatients, sortConfig])

  const toggleSort = (key: SortKey) => {
    setSortConfig(prev => {
      if (!prev || prev.key !== key) return { key, direction: 'asc' }
      if (prev.direction === 'asc') return { key, direction: 'desc' }
      return null // cycle off
    })
  }

  const SortIndicator = ({ k }: { k: SortKey }) => {
    if (!sortConfig || sortConfig.key !== k) return <ChevronsUpDown className="ml-1 h-3.5 w-3.5 opacity-60" />
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="ml-1 h-3.5 w-3.5" />
      : <ChevronDown className="ml-1 h-3.5 w-3.5" />
  }

  // Quick Win: Clear All Filters
  const clearAllFilters = () => {
    setSearchTerm("")
    setFilterStatus("all")
    setFilterUrgency("all")
    setFilterTimePeriod("all")
    setSortConfig(null)
    toast({
      title: "✨ Filters Cleared",
      description: "All filters and search have been reset",
    })
  }

  // Quick Win: Import from CSV
  const importFromCSV = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv'
    input.style.display = 'none'

    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement
      const file = target.files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const lines = text.split('\n').filter(line => line.trim())

        if (lines.length < 2) {
          throw new Error('CSV file is empty or invalid')
        }

        // Parse CSV (skip header row)
        const headers = lines[0].split(',').map(h => h.trim().replace(/\"/g, ''))
        const importedData = []

        // Helpers to normalize values
        const normalizeStatus = (v: string | undefined) => {
          const val = (v || '').toLowerCase().trim()
          if (["pending", "confirmed", "completed", "cancelled"].includes(val)) return val
          // map common variants
          if (["complete", "done"].includes(val)) return "completed"
          if (["cancel", "canceled"].includes(val)) return "cancelled"
          return "pending"
        }
        const normalizeUrgency = (v: string | undefined) => {
          const val = (v || '').toLowerCase().trim()
          if (["normal", "urgent", "emergency"].includes(val)) return val
          return "normal"
        }
        const normalizePayment = (v: string | undefined) => {
          const val = (v || '').toLowerCase().trim()
          if (["cash", "jazzcash", "easypaisa"].includes(val)) return val
          return "cash"
        }

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/\"/g, ''))
          if (values.length < 3) continue // Skip invalid rows

          // Columns (by current export format):
          // 0: Patient Code, 1: Name, 2: Phone, 3: Email, 4: Profession, 5: Appointment Date,
          // 6: Status, 7: Urgency, 8: Session Type, 9: Sessions Completed, 10: Total Sessions, 11: Payment Method (optional)
          const rawDate = values[5]
          const parsedDate = rawDate ? new Date(rawDate) : null
          const appointmentISO = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.toISOString() : new Date().toISOString()

          const rawStatus = normalizeStatus(values[6]) as any
          const rawUrgency = normalizeUrgency(values[7]) as any
          const rawSessionType = (values[8] || '').toLowerCase().includes('video') ? 'video' : 'in_clinic'
          const rawPayment = normalizePayment(values[11])

          const sessionsCompleted = Number.isFinite(parseInt(values[9])) ? parseInt(values[9]) : 0
          const totalSessions = Number.isFinite(parseInt(values[10])) ? parseInt(values[10]) : 3

          const patientData: any = {
            name: values[1] || '',
            phone: values[2] || '',
            email: values[3] && values[3] !== 'N/A' ? values[3] : null,
            profession: values[4] && values[4] !== 'N/A' ? values[4] : null,
            appointment_date: appointmentISO,
            status: rawStatus,
            urgency: rawUrgency,
            session_type: rawSessionType,
            sessions_completed: sessionsCompleted,
            total_sessions: totalSessions,
            payment_method: rawPayment, // ensure NOT NULL in DB
            booking_source: 'admin_dashboard',
            patient_code: values[0] || null,
          }

          if (patientData.name && patientData.phone) {
            importedData.push(patientData)
          }
        }

        if (importedData.length === 0) {
          throw new Error('No valid patient records found in CSV')
        }

        // Import patients to database
        let successCount = 0
        let failCount = 0

        for (const patientData of importedData) {
          try {
            await createPatient(patientData)
            successCount++
          } catch (error) {
            console.error('Failed to import patient:', patientData.name, error)
            failCount++
          }
        }

        // Refresh patient list
        await loadPatients()

        toast({
          title: "📥 Import Complete",
          description: `Successfully imported ${successCount} patients. ${failCount > 0 ? `Failed: ${failCount}` : ''}`,
        })
      } catch (error) {
        console.error('Import error:', error)
        toast({
          title: "❌ Import Failed",
          description: error instanceof Error ? error.message : "Failed to import CSV file",
          variant: "destructive",
        })
      } finally {
        document.body.removeChild(input)
      }
    }

    document.body.appendChild(input)
    input.click()
  }

  // Quick Win: Export to CSV
  const exportToCSV = () => {
    try {
      const csvHeaders = ['Patient Code', 'Name', 'Phone', 'Email', 'Profession', 'Appointment Date', 'Status', 'Urgency', 'Session Type', 'Sessions Completed', 'Total Sessions']
      const csvRows = userSortedPatients.map(patient => [
        getOrAssignPatientCode(patient),
        patient.name,
        patient.phone,
        patient.email || 'N/A',
        patient.profession || 'N/A',
        new Date(patient.appointment_date).toLocaleString(),
        patient.status,
        patient.urgency || 'normal',
        patient.session_type === 'in_clinic' ? 'In-Clinic' : 'Video',
        patient.sessions_completed || 0,
        patient.total_sessions || 3
      ])

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `patients_export_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "📊 Export Successful",
        description: `Exported ${userSortedPatients.length} patients to CSV`,
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: "❌ Export Failed",
        description: "Failed to export data to CSV",
        variant: "destructive",
      })
    }
  }

  // Quick Win: Format relative time
  const getRelativeTime = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    const days = Math.floor(hours / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  // Show loading screen while checking auth
  if (!authChecked || isLoading) {
    return (
      <div className="min-h-screen bg-[rgb(174,193,192)] flex items-center justify-center overflow-hidden relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-[10%] left-[10%] w-32 h-32 bg-gradient-to-r from-[#0d5c75]/20 to-[#2a9d8f]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-[60%] right-[15%] w-24 h-24 bg-gradient-to-r from-[rgb(227,252,236)]/20 to-[#0d5c75]/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-[20%] left-[20%] w-20 h-20 bg-gradient-to-r from-[#2a9d8f]/20 to-[rgb(227,252,236)]/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Main Loading Card */}
        <div className="relative z-10 max-w-md w-full mx-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8 text-center">
            {/* Logo Section */}
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <div className="w-24 h-24 bg-gradient-to-br from-[#0d5c75] to-[#2a9d8f] rounded-full flex items-center justify-center shadow-xl">
                  <Image
                    src="/images/gonstead-chiropractic-logo-new.png"
                    alt="Gonstead Logo"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[rgb(227,252,236)] rounded-full flex items-center justify-center shadow-lg">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Clinic Information */}
              <h1 className="text-lg font-bold text-[#0d5c75] mb-2 font-poppins">Gonstead Chiropractic</h1>
              <p className="text-sm font-semibold text-[#2a9d8f] mb-1">Dr. Bashir Khan</p>
              <p className={`text-xs text-gray-600 mb-1`}>Gonstead Certified Specialist</p>
              <p className={`text-xs text-[#0d5c75] mb-1`}>Excellence in Chiropractic Care</p>
              <p className={`text-xs text-[#0d5c75] font-semibold`}>+92 304 699 6267</p>
            </div>

            {/* Loading Animation */}
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="absolute inset-0 border-4 border-[#0d5c75]/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#0d5c75] border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-2 border-[#2a9d8f]/30 rounded-full"></div>
                <div className="absolute inset-2 border-2 border-[#2a9d8f] border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <p className="text-[#0d5c75] font-bold text-sm">
                {!authChecked ? "🔐 Verifying Credentials" : "📊 Loading Dashboard"}
              </p>
              <p className="text-gray-600 text-[10px] mt-2">
                {!authChecked
                  ? "Securing your admin access..."
                  : "Preparing patient management system..."}
              </p>
            </div>

            {/* Professional Badge */}
            <div className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white px-6 py-2 rounded-full text-xs font-bold shadow-lg">
              ADMIN PORTAL
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
            <p className="text-xs text-gray-600 font-medium">Powered by Gonstead Management System</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <React.Fragment>

      <div className={`admin-compact min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-[rgb(220,230,229)]"}`}>
        {/* Mobile-Responsive Professional Header */}
        <header className="relative bg-white/20 backdrop-blur-xl shadow-[0_4px_16px_rgba(13,92,117,0.10)] border-0 p-2 sm:p-3 overflow-hidden mt-1 mx-2 sm:mx-4 rounded-xl">
          {/* Animated Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d5c75]/5 via-white/10 to-[#2a9d8f]/5"></div>

          {/* Glass Effect Overlay */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>

          {/* Content */}
          <div className="relative z-10 container mx-auto">
            {/* Mobile Layout - Stack on small screens */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">

              {/* Top Row: Logo and Title - Mobile Optimized */}
              <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                {/* Enhanced Clinical Logo - Clickable for Sidebar */}
                <div className="relative group cursor-pointer" onClick={() => setIsSidebarOpen(true)}>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 relative transition-transform duration-300 hover:scale-110">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0d5c75]/15 to-[#2a9d8f]/15 rounded-xl sm:rounded-2xl blur-xl group-hover:blur-lg transition-all duration-300"></div>
                    {/* Enhanced Clinical Logo with Professional Frame */}
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-white/90 to-white/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border-2 border-white/30 shadow-2xl flex items-center justify-center">
                      <Image
                        src="/images/gonstead-chiropractic-logo-new.png"
                        alt="Gonstead Chiropractic Clinical Logo"
                        width={32}
                        height={32}
                        className="sm:w-11 sm:h-11 object-contain relative z-10 drop-shadow-2xl"
                      />
                      {/* Clinical Badge */}
                      <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] rounded-full flex items-center justify-center shadow-xl border-2 border-white">
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></div>
                      </div>
                      {/* Professional Ring */}
                      <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-[#0d5c75]/30"></div>
                    </div>
                  </div>
                  {/* Professional Clinical Badge */}
                  <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 px-1.5 py-0.5 sm:px-2 sm:py-0.5 bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white text-[8px] sm:text-xs font-bold rounded-full shadow-lg border border-white/50">
                    CLINIC
                  </div>
                </div>

                {/* Compact Title Section - Mobile Optimized */}
                <div className="space-y-0.5 flex-1">
                  <h1 className={`text-base sm:text-xl font-bold ${isDarkMode ? "text-white" : "text-[#0d5c75]"} font-poppins tracking-wide drop-shadow-sm`}>
                    Dr. Bashir Khan
                  </h1>
                  <p className={`text-sm sm:text-base font-semibold ${isDarkMode ? "text-gray-300" : "text-[#2a9d8f]"} drop-shadow-sm hidden xs:block`}>
                    Gonstead Chiropractic Specialist
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[rgb(227,252,236)] rounded-full"></div>
                    <p className={`text-[8px] sm:text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"} font-medium tracking-wider`}>
                      ADMIN PORTAL
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Controls and Action Buttons - Mobile Responsive */}
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
                {/* Combined Time and Weather Display - Mobile Optimized */}
                <div className={`flex items-center gap-1 sm:gap-3 p-1.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg ${isDarkMode ? "text-white" : "text-[#0d5c75]"} flex-1 sm:flex-none min-w-0`}>
                  {/* Weather Section - Hidden on very small screens */}
                  <div className="hidden md:flex items-center gap-1 sm:gap-2 border-r border-white/20 pr-2 sm:pr-3">
                    <Cloud className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
                    <div>
                      <div className={`text-xs sm:text-sm font-bold ${isDarkMode ? "text-white" : "text-[#0d5c75]"}`}>
                        28°C
                      </div>
                      <div className={`text-[8px] sm:text-xs ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Nowshera</div>
                    </div>
                  </div>

                  {/* Time Section - Always visible but compact on mobile */}
                  <div className="text-center flex-1 min-w-0">
                    <div className="text-[10px] sm:text-sm font-bold font-mono tracking-wider truncate">
                      {typeof window !== 'undefined' ? formatTime12Hour(currentTime) : '--:--:-- --'}
                    </div>
                    <div className="text-[8px] sm:text-xs opacity-80 font-medium truncate">
                      {typeof window !== 'undefined' ? formatDate(currentTime).split(',')[0] : '-- --'}
                    </div>
                  </div>
                </div>

                {/* Header Action Buttons - Mobile Responsive */}
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Add Patient Button */}
                  <Dialog open={isAddPatientDialogOpen} onOpenChange={setIsAddPatientDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-[#2a9d8f] hover:bg-[#238a7a] text-white px-1.5 sm:px-3 py-1 sm:py-1.5 h-auto text-[10px] sm:text-sm min-w-0 shrink-0"
                      >
                        <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                        <span className="hidden md:inline ml-1">Add</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl mx-2 sm:mx-auto max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-[#0d5c75] font-poppins flex items-center justify-between text-sm sm:text-base">
                          <div className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                            Add New Patient {isAdvancedMode ? '(Advanced Booking)' : '(Quick Registration)'}
                          </div>
                          {/* Mode Toggle Switch */}
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${!isAdvancedMode ? 'text-[#2a9d8f]' : 'text-gray-400'}`}>Basic</span>
                            <Switch
                              checked={isAdvancedMode}
                              onCheckedChange={setIsAdvancedMode}
                              className="data-[state=checked]:bg-[#8b5cf6]"
                            />
                            <span className={`text-xs font-medium ${isAdvancedMode ? 'text-[#8b5cf6]' : 'text-gray-400'}`}>Advanced</span>
                          </div>
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddPatient} className="space-y-3 sm:space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <Label htmlFor="name" className="text-sm">Full Name *</Label>
                            <Input
                              id="name"
                              value={newPatient.name}
                              onChange={(e) => setNewPatient((prev) => ({ ...prev, name: e.target.value }))}
                              required
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone" className="text-sm">Phone *</Label>
                            <Input
                              id="phone"
                              value={newPatient.phone}
                              onChange={(e) => setNewPatient((prev) => ({ ...prev, phone: e.target.value }))}
                              required
                              className="text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-sm">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newPatient.email}
                            onChange={(e) => setNewPatient((prev) => ({ ...prev, email: e.target.value }))}
                            className="text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <Label htmlFor="session_type" className="text-sm">Session Type</Label>
                            <Select
                              value={newPatient.session_type}
                              onValueChange={(value: "in_clinic" | "video") =>
                                setNewPatient((prev) => ({ ...prev, session_type: value }))
                              }
                            >
                              <SelectTrigger className="text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="in_clinic">In-Clinic</SelectItem>
                                <SelectItem value="video">Video Consultation</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="urgency" className="text-sm">Urgency</Label>
                            <Select
                              value={newPatient.urgency}
                              onValueChange={(value: "normal" | "urgent" | "emergency") =>
                                setNewPatient((prev) => ({ ...prev, urgency: value }))
                              }
                            >
                              <SelectTrigger className="text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="normal">Normal</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="emergency">Emergency</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          {isAdvancedMode ? (
                            <div className="space-y-2">
                              <Label htmlFor="appointment_date_date" className="text-sm">Appointment Date *</Label>
                              <Input
                                id="appointment_date_date"
                                type="date"
                                value={appointmentDate ? appointmentDate.toISOString().split('T')[0] : ''}
                                onChange={(e) => {
                                  const d = e.target.value ? new Date(e.target.value) : undefined
                                  handleAppointmentDateSelection(d)
                                  setSelectedTimeSlot(null)
                                  setNewPatient((prev) => ({ ...prev, appointment_date: '' }))
                                }}
                                required
                                className="text-sm"
                              />
                              {appointmentDate && appointmentDate.getDay() === 0 && (
                                <p className="text-xs text-red-600">Clinic is closed on Sundays. Please choose another date.</p>
                              )}
                              {appointmentDate && (
                                <div className="space-y-1">
                                  <Label className="text-xs">Available Time Slots</Label>
                                  {availableTimeSlots.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                      {availableTimeSlots.map((slot) => (
                                        <Button
                                          key={slot}
                                          size="sm"
                                          variant={selectedTimeSlot === slot ? "default" : "outline"}
                                          onClick={() => {
                                            if (!appointmentDate) return
                                            const dt = combineDateAndSlot(appointmentDate, slot)
                                            setSelectedTimeSlot(slot)
                                            setNewPatient((prev) => ({ ...prev, appointment_date: dt }))
                                          }}
                                          className={selectedTimeSlot === slot ? "bg-[#2a9d8f] text-white" : "text-xs"}
                                        >
                                          {slot}
                                        </Button>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-500">No available slots for this date.</p>
                                  )}
                                </div>
                              )}
                              {selectedTimeSlot && newPatient.appointment_date && (
                                <p className="text-xs text-green-600">Selected: {new Date(newPatient.appointment_date).toLocaleDateString()} at {new Date(newPatient.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              )}
                            </div>
                          ) : (
                            <div>
                              <Label htmlFor="appointment_date" className="text-sm">Appointment Date & Time *</Label>
                              <Input
                                id="appointment_date"
                                type="datetime-local"
                                value={newPatient.appointment_date}
                                onChange={(e) => setNewPatient((prev) => ({ ...prev, appointment_date: e.target.value }))}
                                required
                                className="text-sm"
                              />
                            </div>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="notes" className="text-sm">Notes</Label>
                          <Textarea
                            id="notes"
                            value={newPatient.notes}
                            onChange={(e) => setNewPatient((prev) => ({ ...prev, notes: e.target.value }))}
                            placeholder="Chief complaint, symptoms, etc."
                            className="text-sm min-h-[80px]"
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                          <Button type="button" variant="outline" onClick={() => setIsAddPatientDialogOpen(false)} className="text-sm">
                            Cancel
                          </Button>
                          <Button type="submit" className="bg-[#0d5c75] hover:bg-[#0a4a5c] text-sm">
                            Add Patient
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>

                  {/* Location Settings Button */}
                  <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#0d5c75] text-[#0d5c75] hover:bg-[#0d5c75] hover:text-white px-2 sm:px-3 py-1.5 sm:py-2 h-auto text-xs sm:text-sm"
                      >
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Location</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-[#0d5c75] font-poppins flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Clinic Location Settings
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="address">Clinic Address</Label>
                          <Input
                            id="address"
                            value={clinicLocation.address}
                            onChange={(e) => setClinicLocation((prev) => ({ ...prev, address: e.target.value }))}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="lat">Latitude</Label>
                            <Input
                              id="lat"
                              type="number"
                              step="any"
                              value={clinicLocation.coordinates.lat}
                              onChange={(e) =>
                                setClinicLocation((prev) => ({
                                  ...prev,
                                  coordinates: { ...prev.coordinates, lat: Number.parseFloat(e.target.value) },
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="lng">Longitude</Label>
                            <Input
                              id="lng"
                              type="number"
                              step="any"
                              value={clinicLocation.coordinates.lng}
                              onChange={(e) =>
                                setClinicLocation((prev) => ({
                                  ...prev,
                                  coordinates: { ...prev.coordinates, lng: Number.parseFloat(e.target.value) },
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="mapUrl">Google Maps URL</Label>
                          <Input
                            id="mapUrl"
                            value={clinicLocation.mapUrl}
                            onChange={(e) => setClinicLocation((prev) => ({ ...prev, mapUrl: e.target.value }))}
                          />
                        </div>
                        <div className="flex justify-end gap-3">
                          <Button type="button" variant="outline" onClick={() => setIsLocationDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            onClick={() => {
                              updateClinicLocation(clinicLocation)
                              setIsLocationDialogOpen(false)
                            }}
                            className="bg-[#0d5c75] hover:bg-[#0a4a5c]"
                          >
                            Update Location
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Exit/Logout Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="border-red-500 text-red-600 hover:bg-red-50 px-2 sm:px-3 py-1.5 sm:py-2 h-auto text-xs sm:text-sm"
                  >
                    <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Exit</span>
                  </Button>
                </div>

                {/* Compact Theme Toggle - Mobile Optimized */}
                <div className="flex items-center gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${isDarkMode ? "bg-gray-600" : "bg-[rgb(227,252,236)]"} transition-all duration-300`}>
                    <Sun className={`h-3 w-3 sm:h-4 sm:w-4 ${isDarkMode ? "text-gray-400" : "text-green-500"}`} />
                  </div>
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                    className="data-[state=checked]:bg-gray-600 scale-75 sm:scale-100"
                  />
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${isDarkMode ? "bg-blue-100" : "bg-gray-200"} transition-all duration-300`}>
                    <Moon className={`h-3 w-3 sm:h-4 sm:w-4 ${isDarkMode ? "text-blue-400" : "text-gray-400"}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>


        <main className="container mx-auto px-4 py-8">
          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card
              className={`border-[#0d5c75]/20 cursor-pointer hover:shadow-lg transition-shadow duration-300 ${isDarkMode ? "bg-gray-800 text-white hover:bg-gray-750" : "bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-150"}`}
              onClick={() => {
                setFilterStatus("all")
                setFilterUrgency("all")
                setSearchTerm("")
                toast({
                  title: "📊 Filter Applied",
                  description: "Showing all registered patients",
                })
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-[#0d5c75]"}`}>
                  Total Patients
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsGrowthAnalyticsOpen(true)
                    }}
                    className={`${isDarkMode ? "hover:bg-gray-700" : "hover:bg-blue-100"} h-7 w-7 p-0 rounded-full`}
                    title="View Patient Growth Analytics"
                    aria-label="View Patient Growth Analytics"
                  >
                    <Activity className={`h-4 w-4 ${isDarkMode ? "text-white" : "text-[#0d5c75]"}`} />
                  </Button>
                  <Users className={`h-4 w-4 ${isDarkMode ? "text-white" : "text-[#0d5c75]"}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-[#0d5c75]"}`}>
                  {stats.totalPatients}
                </div>
                <p className={`text-xs ${isDarkMode ? "text-gray-300" : "text-blue-600"} mt-1`}>
                  All registered patients • Click to view
                </p>
              </CardContent>
            </Card>

            <Card
              className={`border-green-400/20 cursor-pointer hover:shadow-lg transition-shadow duration-300 relative ${isDarkMode ? "bg-gray-800 text-white hover:bg-gray-750" : "bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-150"}`}
              onClick={() => {
                setFilterStatus("today")
                setFilterUrgency("all")
                setSearchTerm("")
                toast({
                  title: "📅 Today's Filter Applied",
                  description: "Showing today's appointments only",
                })
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-green-600"}`}>
                  Today's Appointments
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Calendar className={`h-4 w-4 ${isDarkMode ? "text-white" : "text-green-600"}`} />
                  {/* Date Picker Toggle Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation() // Prevent card click
                      setIsDatePickerOpen(!isDatePickerOpen)
                    }}
                    className={`h-6 w-6 p-0 rounded-full hover:bg-green-200/50 ${isDarkMode ? "hover:bg-gray-600" : ""}`}
                    title="Select different date"
                  >
                    <Timer className={`h-3 w-3 ${isDarkMode ? "text-white" : "text-green-600"}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-green-600"}`}>
                  {stats.todayAppointments}
                </div>
                <p className={`text-xs ${isDarkMode ? "text-gray-300" : "text-green-500"} mt-1`}>Scheduled for today • Click to view</p>
              </CardContent>

              {/* Date Picker Section */}
              {isDatePickerOpen && (
                <div
                  className={`absolute top-full left-0 right-0 z-50 mt-2 p-4 rounded-lg shadow-2xl border border-green-200 ${isDarkMode ? "bg-gray-800 border-gray-600" : "bg-white"}`}
                  onClick={(e) => e.stopPropagation()} // Prevent card click when interacting with date picker
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold text-sm ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                        📅 Select Appointment Date
                      </h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsDatePickerOpen(false)}
                        className="h-6 w-6 p-0"
                      >
                        ✕
                      </Button>
                    </div>

                    {/* Date Input */}
                    <div className="space-y-2">
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => handleDatePickerSelection(e.target.value)}
                        className={`text-sm ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : ""}`}
                      />
                    </div>

                    {/* Quick Date Options */}
                    <div className="space-y-1">
                      <p className={`text-xs ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>Quick Options:</p>
                      <div className="grid grid-cols-2 gap-1">
                        {getQuickDateOptions().map((option) => (
                          <Button
                            key={option.label}
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              handleDatePickerSelection(option.date)
                              setIsDatePickerOpen(false)
                            }}
                            className={`text-xs h-8 ${isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700" : ""}`}
                          >
                            {option.label} ({option.count})
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Selected Date Info */}
                    {selectedDate !== new Date().toISOString().split('T')[0] && (
                      <div className={`p-2 rounded text-xs ${isDarkMode ? "bg-gray-700 text-gray-300" : "bg-green-50 text-green-800"}`}>
                        <p className="font-medium">
                          Selected: {new Date(selectedDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p>Appointments found: {selectedDateAppointments.length}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>

            <Card
              className={`border-orange-500/20 cursor-pointer hover:shadow-lg transition-shadow duration-300 ${isDarkMode ? "bg-gray-800 text-white hover:bg-gray-750" : "bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-150"}`}
              onClick={() => {
                setFilterStatus("pending")
                setFilterUrgency("all")
                setSearchTerm("")
                toast({
                  title: "⏳ Pending Filter Applied",
                  description: "Showing pending appointments only",
                })
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-orange-600"}`}>
                  Pending
                </CardTitle>
                <Clock className={`h-4 w-4 ${isDarkMode ? "text-white" : "text-orange-600"}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-orange-600"}`}>
                  {stats.pendingAppointments}
                </div>
                <p className={`text-xs ${isDarkMode ? "text-gray-300" : "text-orange-500"} mt-1`}>
                  Awaiting confirmation • Click to view
                </p>
              </CardContent>
            </Card>

            <Card
              className={`border-green-500/20 cursor-pointer hover:shadow-lg transition-shadow duration-300 ${isDarkMode ? "bg-gray-800 text-white hover:bg-gray-750" : "bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-150"}`}
              onClick={() => {
                setFilterStatus("completed_sessions")
                setFilterUrgency("all")
                setSearchTerm("")
                toast({
                  title: "✅ Completed Sessions Filter Applied",
                  description: "Showing patients with completed sessions",
                })
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-green-600"}`}>
                  Completed Sessions
                </CardTitle>
                <CheckCircle className={`h-4 w-4 ${isDarkMode ? "text-white" : "text-green-600"}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-green-600"}`}>
                  {stats.completedSessions}
                </div>
                <p className={`text-xs ${isDarkMode ? "text-gray-300" : "text-green-500"} mt-1`}>Total treatments • Click to view</p>
              </CardContent>
            </Card>

            <Card
              className={`border-red-500/20 cursor-pointer hover:shadow-lg transition-shadow duration-300 ${isDarkMode ? "bg-gray-800 text-white hover:bg-gray-750" : "bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-150"}`}
              onClick={() => {
                setFilterStatus("all")
                setFilterUrgency("emergency")
                setSearchTerm("")
                toast({
                  title: "🚨 Emergency Filter Applied",
                  description: "Showing emergency cases only",
                })
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-red-600"}`}>
                  Emergency
                </CardTitle>
                <AlertTriangle className={`h-4 w-4 ${isDarkMode ? "text-white" : "text-red-600"}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-red-600"}`}>
                  {stats.emergencyPatients}
                </div>
                <p className={`text-xs ${isDarkMode ? "text-gray-300" : "text-red-500"} mt-1`}>Urgent cases • Click to view</p>
              </CardContent>
            </Card>
          </div>

          {/* Patient Management */}
          <Card className={`mt-8 border-[#0d5c75]/20 shadow-xl ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
            <CardHeader className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 font-poppins">
                  <FileText className="h-5 w-5" />
                  Patient Records Management
                </CardTitle>
                <div className="flex items-center gap-3">
                  {/* Quick Win: Patient Count */}
                  <div className="text-sm text-white/80">
                    Showing <span className="font-bold text-white">{userSortedPatients.length}</span> of <span className="font-bold text-white">{patients.length}</span> patients
                  </div>
                  {/* Quick Win: Last Updated */}
                  <div className="text-xs text-white/60">
                    Updated {getRelativeTime(lastUpdated)}
                  </div>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70" />
                  <Input
                    placeholder="Search by name, phone, email, patient code, notes, or date/time"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                  <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Urgency</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterTimePeriod} onValueChange={setFilterTimePeriod}>
                  <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Time Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
                {/* Quick Win: Clear All Filters Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  title="Clear all filters and search"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
                {/* Quick Win: Import from CSV Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={importFromCSV}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  title="Import patient data from CSV file"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
                {/* Quick Win: Export to CSV Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToCSV}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  title="Export current view to CSV"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredPatients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-600"} mb-2`}>
                    No Patient Records Found
                  </h3>
                  <p className={`${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>
                    {patients.length === 0
                      ? "Patient appointments will appear here when booked through the website."
                      : "No patients match your current search criteria."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className={`${isDarkMode ? "bg-gray-700" : "bg-[#F8F5F0]"}`}>
                        <TableHead className={`${isDarkMode ? "text-white" : "text-[#0d5c75]"} font-semibold`}>
                          <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:opacity-80">
                            Patient Info <SortIndicator k="name" />
                          </button>
                        </TableHead>
                        <TableHead className={`${isDarkMode ? "text-white" : "text-[#0d5c75]"} font-semibold`}>
                          <button onClick={() => toggleSort('phone')} className="flex items-center gap-1 hover:opacity-80">
                            Contact <SortIndicator k="phone" />
                          </button>
                        </TableHead>
                        <TableHead className={`${isDarkMode ? "text-white" : "text-[#0d5c75]"} font-semibold`}>
                          <button onClick={() => toggleSort('profession')} className="flex items-center gap-1 hover:opacity-80">
                            Profession <SortIndicator k="profession" />
                          </button>
                        </TableHead>
                        <TableHead className={`${isDarkMode ? "text-white" : "text-[#0d5c75]"} font-semibold`}>
                          <button onClick={() => toggleSort('appointment_date')} className="flex items-center gap-1 hover:opacity-80">
                            Appointment <SortIndicator k="appointment_date" />
                          </button>
                        </TableHead>
                        <TableHead className={`${isDarkMode ? "text-white" : "text-[#0d5c75]"} font-semibold`}>
                          <button onClick={() => toggleSort('status')} className="flex items-center gap-1 hover:opacity-80">
                            Status <SortIndicator k="status" />
                          </button>
                        </TableHead>
                        <TableHead className={`${isDarkMode ? "text-white" : "text-[#0d5c75]"} font-semibold`}>
                          <button onClick={() => toggleSort('urgency')} className="flex items-center gap-1 hover:opacity-80">
                            Type & Urgency <SortIndicator k="urgency" />
                          </button>
                        </TableHead>
                        <TableHead className={`${isDarkMode ? "text-white" : "text-[#0d5c75]"} font-semibold`}>
                          <button onClick={() => toggleSort('sessions')} className="flex items-center gap-1 hover:opacity-80">
                            Sessions <SortIndicator k="sessions" />
                          </button>
                        </TableHead>
                        <TableHead className={`${isDarkMode ? "text-white" : "text-[#0d5c75]"} font-semibold`}>
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userSortedPatients.map((patient) => (
                        <TableRow
                          key={patient.id}
                          className={`${isDarkMode ? "hover:bg-gray-700 border-gray-600" : "hover:bg-[#F8F5F0]/50"}`}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div>
                                <div className={`font-semibold ${isDarkMode ? "text-white" : "text-[#0d5c75]"} flex items-center gap-2`}>
                                  {patient.name}
                                  {!viewedPatients.has(patient.id) && (
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title="New appointment - not yet viewed" />
                                  )}
                                </div>
                                <div className="relative group">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      const btn = e.currentTarget
                                      const dropdown = btn.nextElementSibling as HTMLElement
                                      if (dropdown) {
                                        dropdown.classList.toggle('hidden')
                                      }
                                    }}
                                    className={`text-sm ${isDarkMode ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-[#0d5c75]"} flex items-center gap-1 cursor-pointer transition-colors duration-200`}
                                  >
                                    <span className="font-mono">Code: {getOrAssignPatientCode(patient)}</span>
                                    <ChevronDown className="h-3 w-3" />
                                  </button>
                                  <div
                                    className={`hidden absolute top-full left-0 mt-1 z-50 ${isDarkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"} border rounded-lg shadow-xl p-3 min-w-[280px]`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className={`text-xs font-semibold ${isDarkMode ? "text-gray-400" : "text-gray-500"} uppercase tracking-wide`}>Patient Code</span>
                                      <button
                                        onClick={(e) => {
                                          const code = getOrAssignPatientCode(patient)
                                          navigator.clipboard.writeText(code)
                                          toast({
                                            title: "✅ Copied!",
                                            description: "Patient code copied to clipboard",
                                          })
                                        }}
                                        className={`text-xs ${isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-[#0d5c75] hover:text-[#0a4a5c]"} font-medium transition-colors`}
                                      >
                                        Copy
                                      </button>
                                    </div>
                                    <div className={`${isDarkMode ? "bg-gray-900 border-gray-700" : "bg-gradient-to-r from-[#0d5c75]/5 to-[#2a9d8f]/5 border-[#0d5c75]/20"} border-2 rounded-md p-2 mb-2`}>
                                      <code className={`text-sm font-mono ${isDarkMode ? "text-white" : "text-[#0d5c75]"} break-all select-all`}>{getOrAssignPatientCode(patient)}</code>
                                    </div>
                                    <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"} flex items-center gap-1`}>
                                      <UserIcon className="h-3 w-3" />
                                      <span>Click "Copy" to copy patient code</span>
                                    </div>
                                  </div>
                                </div>
                                {patient.profession && (
                                  <div className={`text-xs ${isDarkMode ? "text-blue-300" : "text-blue-600"} bg-blue-50 px-2 py-1 rounded-full`}>
                                    {patient.profession.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <a
                                href={`tel:${patient.phone}`}
                                className={`flex items-center gap-1 ${isDarkMode ? "text-blue-400" : "text-[#0d5c75]"} hover:underline text-sm`}
                              >
                                <Phone className="h-3 w-3" />
                                {patient.phone}
                              </a>
                              {patient.email && (
                                <a
                                  href={`mailto:${patient.email}`}
                                  className={`flex items-center gap-1 ${isDarkMode ? "text-blue-400" : "text-[#0d5c75]"} hover:underline text-sm`}
                                >
                                  <Mail className="h-3 w-3" />
                                  {patient.email}
                                </a>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                {patient.profession ? patient.profession.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "Not specified"}
                              </div>
                              {patient.demographics?.occupation && (
                                <div className={`text-xs ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                  {patient.demographics.occupation}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className={`font-medium text-sm ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                {new Date(patient.appointment_date).toLocaleDateString()}
                              </div>
                              <div className={`text-xs ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                {new Date(patient.appointment_date).toLocaleTimeString()}
                              </div>
                              <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                                Payment: {(patient.payment_method || 'cash').toUpperCase()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              {/* Current Status Badge - Always visible */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600 font-medium">Status:</span>
                                <Badge
                                  variant={
                                    patient.status === "completed"
                                      ? "default"
                                      : patient.status === "confirmed"
                                        ? "secondary"
                                        : patient.status === "cancelled"
                                          ? "destructive"
                                          : "outline"
                                  }
                                  className="text-xs font-semibold"
                                >
                                  {patient.status.toUpperCase()}
                                </Badge>
                              </div>

                              {/* Cancel Appointment Button - Only show if not already cancelled */}
                              {patient.status !== "cancelled" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setPatientToCancel(patient)
                                    setIsCancelConfirmDialogOpen(true)
                                  }}
                                  className="h-7 text-xs border-red-500 text-red-600 hover:bg-red-50 w-full"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Cancel Appointment
                                </Button>
                              )}

                              {/* Show restore option if cancelled */}
                              {patient.status === "cancelled" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdatePatientStatus(patient.id, "pending")}
                                  className="h-7 text-xs border-green-500 text-green-600 hover:bg-green-50 w-full"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Restore Appointment
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge
                                variant={patient.session_type === "in_clinic" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {patient.session_type === "in_clinic" ? "Clinic" : "Video"}
                              </Badge>
                              <Badge
                                variant={
                                  patient.urgency === "emergency"
                                    ? "destructive"
                                    : patient.urgency === "urgent"
                                      ? "secondary"
                                      : "outline"
                                }
                                className="text-xs ml-1"
                              >
                                {patient.urgency}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-2">
                              {/* Session Progress Display */}
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-[#0d5c75]"}`}>
                                    {patient.sessions_completed || 0}
                                  </div>
                                  <div className={`text-lg ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>/</div>
                                  <div className={`text-lg font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                    {patient.total_sessions ?? (patient.sessions_completed || 0)}
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">sessions</div>
                              </div>

                              {/* Session Control Buttons */}
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={async () => {
                                    if (patient.status === "cancelled") {
                                      toast({ title: "Cannot modify sessions", description: "This patient is cancelled. Un-cancel to adjust sessions." })
                                      return
                                    }
                                    const total = patient.total_sessions || 8
                                    const newCount = Math.max(0, (patient.sessions_completed || 0) - 1)
                                    const newStatus: Patient["status"] = newCount >= total ? "completed" : (newCount <= 0 ? "pending" : "confirmed")
                                    await updatePatient(patient.id, { sessions_completed: newCount, status: newStatus })

                                    // Also update localStorage if patient exists there
                                    try {
                                      const localPatients = JSON.parse(localStorage.getItem("gonstead_patients") || "[]")
                                      const localIndex = localPatients.findIndex((p: Patient) => p.id === patient.id)
                                      if (localIndex !== -1) {
                                        localPatients[localIndex].sessions_completed = newCount
                                        localPatients[localIndex].status = newStatus
                                        localStorage.setItem("gonstead_patients", JSON.stringify(localPatients))
                                      }
                                    } catch (e) {
                                      console.error("Error updating localStorage:", e)
                                    }

                                    await loadPatients()
                                    toast({
                                      title: "Session Decreased",
                                      description: `${patient.name}: ${newCount}/${total} sessions • Status: ${newStatus.toUpperCase()}`,
                                    })
                                  }}
                                  className="h-6 w-6 p-0 border-red-500 text-red-600 hover:bg-red-50"
                                  title="Decrease completed sessions"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={async () => {
                                    if (patient.status === "cancelled") {
                                      toast({ title: "Cannot modify sessions", description: "This patient is cancelled. Un-cancel to adjust sessions." })
                                      return
                                    }
                                    const total = patient.total_sessions || 8
                                    const prev = patient.sessions_completed || 0
                                    const capped = Math.min(total, prev + 1)
                                    if (capped === prev) {
                                      toast({
                                        title: "Max Sessions Reached",
                                        description: `${patient.name} is already at ${prev}/${total} sessions`,
                                      })
                                      return
                                    }
                                    const lastVisit = new Date().toISOString()
                                    const newStatus: Patient["status"] = capped >= total ? "completed" : (capped <= 0 ? "pending" : "confirmed")

                                    await updatePatient(patient.id, {
                                      sessions_completed: capped,
                                      last_visit: lastVisit,
                                      status: newStatus
                                    })

                                    // Also update localStorage if patient exists there
                                    try {
                                      const localPatients = JSON.parse(localStorage.getItem("gonstead_patients") || "[]")
                                      const localIndex = localPatients.findIndex((p: Patient) => p.id === patient.id)
                                      if (localIndex !== -1) {
                                        localPatients[localIndex].sessions_completed = capped
                                        localPatients[localIndex].last_visit = lastVisit
                                        localPatients[localIndex].status = newStatus
                                        localStorage.setItem("gonstead_patients", JSON.stringify(localPatients))
                                      }
                                    } catch (e) {
                                      console.error("Error updating localStorage:", e)
                                    }

                                    await loadPatients()
                                    toast({
                                      title: "✅ Session Added",
                                      description: `${patient.name}: ${capped}/${total} sessions • Status: ${newStatus.toUpperCase()}`,
                                    })
                                  }}
                                  className="h-6 w-6 p-0 border-green-600 text-green-600 hover:bg-green-50"
                                  title="Increase completed sessions"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 px-2 text-xs border-[#0d5c75] text-[#0d5c75] hover:bg-[#0d5c75] hover:text-white"
                                      title="Set total sessions"
                                    >
                                      Set Total
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-sm">
                                    <DialogHeader>
                                      <DialogTitle className="text-[#0d5c75]">Set Total Sessions</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label>Total Sessions for {patient.name}</Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          max="100"
                                          defaultValue={patient.total_sessions || 8}
                                          onChange={(e) => {
                                            const value = parseInt(e.target.value) || 8
                                            e.target.setAttribute('data-value', value.toString())
                                          }}
                                          className="mt-2"
                                        />
                                      </div>
                                      <Button
                                        onClick={async (e) => {
                                          const input = e.currentTarget.parentElement?.querySelector('input')
                                          const newTotal = parseInt(input?.getAttribute('data-value') || input?.value || '8')
                                          const currentCompleted = patient.sessions_completed || 0
                                          const finalCompleted = Math.min(currentCompleted, newTotal)
                                          const newStatus: Patient["status"] = finalCompleted >= newTotal ? "completed" : (finalCompleted <= 0 ? "pending" : "confirmed")

                                          await updatePatient(patient.id, {
                                            total_sessions: newTotal,
                                            sessions_completed: finalCompleted,
                                            status: newStatus
                                          })

                                          // Also update localStorage if patient exists there
                                          try {
                                            const localPatients = JSON.parse(localStorage.getItem("gonstead_patients") || "[]")
                                            const localIndex = localPatients.findIndex((p: Patient) => p.id === patient.id)
                                            if (localIndex !== -1) {
                                              localPatients[localIndex].total_sessions = newTotal
                                              localPatients[localIndex].sessions_completed = finalCompleted
                                              localPatients[localIndex].status = newStatus
                                              localStorage.setItem("gonstead_patients", JSON.stringify(localPatients))
                                            }
                                          } catch (err) {
                                            console.error("Error updating localStorage:", err)
                                          }

                                          await loadPatients()
                                          toast({
                                            title: "Total Sessions Updated",
                                            description: `${patient.name} now has ${newTotal} total sessions prescribed • Status: ${newStatus.toUpperCase()}`,
                                          })
                                          // Close dialog
                                          const closeBtn = e.currentTarget.parentElement?.parentElement?.querySelector('[aria-label="Close"]') as HTMLElement
                                          closeBtn?.click()
                                        }}
                                        className="w-full bg-[#0d5c75] hover:bg-[#0a4a5c]"
                                      >
                                        Save Total Sessions
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                              {patient.last_visit && (
                                <div className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"} text-center`}>
                                  Last: {new Date(patient.last_visit).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="relative">
                              {/* Smart Parent Action Button */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleActionsExpanded(patient.id)}
                                className={`${expandedActions.has(patient.id)
                                  ? "bg-[#0d5c75] text-white border-[#0d5c75]"
                                  : "border-[#0d5c75] text-[#0d5c75] hover:bg-[#0d5c75] hover:text-white"
                                  } font-medium shadow-sm transition-all duration-200`}
                                title={expandedActions.has(patient.id) ? "Hide actions" : "Show all actions"}
                              >
                                <MoreVertical className="h-3 w-3 mr-1" />
                                Actions
                                {expandedActions.has(patient.id) ? (
                                  <ChevronUp className="h-3 w-3 ml-1" />
                                ) : (
                                  <ChevronDown className="h-3 w-3 ml-1" />
                                )}
                              </Button>

                              {/* Collapsible Action Buttons */}
                              {expandedActions.has(patient.id) && (
                                <div className={`absolute top-full right-0 md:left-auto md:right-0 mt-2 z-50 w-[min(20rem,calc(100vw-2rem))] md:w-96 ${isDarkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"} shadow-2xl border rounded-xl p-3 space-y-2 transition-all duration-300 ease-in-out`}>
                                  {/* Professional Action Grid */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {/* View Details Button */}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        // Get fresh patient data
                                        const currentPatientData = patients.find(p => p.id === patient.id) || patient
                                        setSelectedPatientDetail(currentPatientData)

                                        // Mark patient as viewed (keeps existing red-dot behavior)
                                        setViewedPatients(prev => new Set([...prev, patient.id]))

                                        // Close the action menu after selection
                                        setExpandedActions(new Set())

                                        // Smooth scroll to the detail section
                                        setTimeout(() => {
                                          detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                        }, 0)
                                      }}
                                      className="border-[#0d5c75] text-[#0d5c75] hover:bg-[#0d5c75] hover:text-white text-xs w-full"
                                      title="View Full Patient Details"
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      View
                                    </Button>

                                    {/* Real-time Smart Patient History Button */}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        // Get fresh patient data to ensure accuracy
                                        const currentPatientData = patients.find(p => p.id === patient.id) || patient

                                        // Show patient history
                                        setSelectedPatientHistory(currentPatientData)
                                        setIsPatientHistoryDialogOpen(true)

                                        // Close the action menu after selection
                                        setExpandedActions(new Set())
                                      }}
                                      className="border-[#8b5cf6] text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white text-xs w-full"
                                      title="View Complete Patient History & Sessions"
                                    >
                                      <Clock className="h-3 w-3 mr-1" />
                                      History
                                    </Button>

                                    {/* Medical Record Management Button */}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        // Get fresh patient data to ensure accuracy
                                        const currentPatientData = patients.find(p => p.id === patient.id) || patient

                                        // Check if medical record already exists
                                        const medicalRecords = JSON.parse(localStorage.getItem("medical_records") || "[]")
                                        let medicalRecord = medicalRecords.find((record: any) =>
                                          record.patientName === currentPatientData.name && record.phone === currentPatientData.phone
                                        )

                                        if (!medicalRecord) {
                                          // Create a new medical record from current patient data
                                          medicalRecord = {
                                            id: `MR${String(medicalRecords.length + 1).padStart(3, '0')}`,
                                            patientName: currentPatientData.name,
                                            age: currentPatientData.demographics?.age || 0,
                                            gender: currentPatientData.demographics?.gender || 'Not specified',
                                            phone: currentPatientData.phone,
                                            email: currentPatientData.email || 'Not provided',
                                            lastVisit: currentPatientData.last_visit || new Date().toISOString().split('T')[0],
                                            diagnosis: 'Initial consultation pending',
                                            treatmentType: currentPatientData.session_type === 'in_clinic' ? 'Gonstead Adjustment' : 'Video Consultation',
                                            status: currentPatientData.status === 'completed' ? 'Completed' : currentPatientData.status === 'pending' ? 'Ongoing' : 'Follow-up',
                                            sessionsCompleted: currentPatientData.sessions_completed || 0,
                                            totalSessions: 8,
                                            nextAppointment: currentPatientData.appointment_date ? new Date(currentPatientData.appointment_date).toLocaleDateString() : 'To be scheduled',
                                            chiefComplaint: currentPatientData.notes || 'General consultation',
                                            medicalHistory: currentPatientData.medical_history || 'Medical history to be collected during consultation',
                                            currentMedications: 'To be determined during consultation',
                                            treatmentPlan: currentPatientData.treatment_plan?.goals || 'Gonstead chiropractic assessment and treatment plan',
                                            progress: currentPatientData.treatment_plan?.progress || 'Initial assessment pending',
                                            doctorNotes: currentPatientData.booking_source === 'admin_dashboard'
                                              ? 'Patient added via admin dashboard. Assessment in progress.'
                                              : 'Patient booked online. Initial consultation scheduled.'
                                          }

                                          // Add to medical records
                                          medicalRecords.push(medicalRecord)
                                          localStorage.setItem("medical_records", JSON.stringify(medicalRecords))

                                          toast({
                                            title: "✅ Medical Record Created",
                                            description: `Medical record for ${currentPatientData.name} has been created and you'll be redirected to edit it.`,
                                          })
                                        }

                                        // Store the medical record ID for the medical history page
                                        localStorage.setItem('editMedicalRecordId', medicalRecord.id)

                                        // Close the action menu before navigation
                                        setExpandedActions(new Set())

                                        // Redirect to medical history page
                                        router.push('/medical-history')
                                      }}
                                      className="border-[#6366f1] text-[#6366f1] hover:bg-[#6366f1] hover:text-white text-xs w-full"
                                      title="Create/Edit Medical Record"
                                    >
                                      <FileText className="h-3 w-3 mr-1" />
                                      Medical
                                    </Button>

                                    {/* Prescription Button */}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        // Get fresh patient data and store for prescription page
                                        const currentPatientData = patients.find(p => p.id === patient.id) || patient
                                        localStorage.setItem('prescriptionPatient', JSON.stringify(currentPatientData))

                                        // Close the action menu before navigation
                                        setExpandedActions(new Set())

                                        // Navigate to prescription page
                                        router.push('/admin/prescription')
                                      }}
                                      className="border-[#2a9d8f] text-[#2a9d8f] hover:bg-[#2a9d8f] hover:text-white text-xs w-full"
                                      title="Generate Prescription"
                                    >
                                      <Prescription className="h-3 w-3 mr-1" />
                                      Rx
                                    </Button>

                                    {/* Video Call Button - Now available for ALL patients */}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        startVideoCall(patient)
                                        setExpandedActions(new Set())
                                      }}
                                      className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white text-xs w-full"
                                      title="Start Video Call with Patient"
                                    >
                                      <Video className="h-3 w-3 mr-1" />
                                      Video Call
                                    </Button>

                                    {/* Book Next Appointment Button */}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        // Get fresh patient data
                                        const currentPatientData = patients.find(p => p.id === patient.id) || patient
                                        setPatientForNextAppointment(currentPatientData)
                                        setIsBookNextAppointmentOpen(true)
                                        setExpandedActions(new Set())
                                      }}
                                      className="border-[#10b981] text-[#10b981] hover:bg-[#10b981] hover:text-white text-xs w-full"
                                      title="Book Next Appointment for Patient"
                                    >
                                      <Calendar className="h-3 w-3 mr-1" />
                                      Next Appt
                                    </Button>

                                    {/* Money Management Button */}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        // Prepare patient data for money management
                                        const patientData = {
                                          patientName: patient.name,
                                          phone: patient.phone,
                                          email: patient.email || '',
                                          sessionType: patient.session_type === 'in_clinic' ? 'In-Clinic Treatment' : 'Video Consultation',
                                          amount: patient.session_type === 'in_clinic' ? 1500 : 1000, // Default amounts
                                          paymentMethod: patient.payment_method || 'cash',
                                          description: `Payment for ${patient.session_type === 'in_clinic' ? 'In-Clinic Treatment' : 'Video Consultation'} - ${new Date().toLocaleDateString()}`,
                                          date: new Date().toISOString().split('T')[0],
                                          patientId: patient.id
                                        }

                                        // Add to money management records in localStorage
                                        const existingRecords = JSON.parse(localStorage.getItem('payment_records') || '[]')
                                        const newRecord = {
                                          id: `PM${String(existingRecords.length + 1).padStart(3, '0')}`,
                                          ...patientData,
                                          createdAt: new Date().toISOString()
                                        }

                                        existingRecords.push(newRecord)
                                        localStorage.setItem('payment_records', JSON.stringify(existingRecords))

                                        toast({
                                          title: "✅ Payment Record Added",
                                          description: `Payment record for ${patient.name} has been added to money management. You can manually navigate to the money management page to view and edit it.`,
                                        })
                                      }}
                                      className="border-[#2a9d8f] text-[#2a9d8f] hover:bg-[#2a9d8f] hover:text-white text-xs w-full"
                                      title="Add Patient to Money Management"
                                    >
                                      <DollarSign className="h-3 w-3 mr-1" />
                                      Payment
                                    </Button>

                                    {/* Spinal Health Assessment Report Button */}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => generateDetailedReport(patient)}
                                      className="border-[#8b5cf6] text-[#8b5cf6] hover:bg-[#8b5cf6] hover:text-white text-xs w-full"
                                      title="Download professional one-page PDF report for this patient"
                                    >
                                      <Download className="h-3 w-3 mr-1" />
                                      PDF Report
                                    </Button>


                                    {/* Edit Patient Button */}
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        // Get fresh patient data and edit
                                        const currentPatientData = patients.find(p => p.id === patient.id) || patient
                                        handleEditPatient(currentPatientData)

                                        // Close the action menu after selection
                                        setExpandedActions(new Set())
                                      }}
                                      className="border-[#f3a800] text-[#f3a800] hover:bg-[#f3a800] hover:text-white text-xs w-full"
                                      title="Edit Patient"
                                    >
                                      <Edit3 className="h-3 w-3 mr-1" />
                                      Edit
                                    </Button>

                                    {/* Delete Patient Button */}
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => {
                                        // Close the action menu before deletion
                                        setExpandedActions(new Set())

                                        // Delete patient
                                        handleDeletePatient(patient.id)
                                      }}
                                      className="bg-red-600 hover:bg-red-700 text-xs w-full"
                                      title="Delete Patient"
                                    >
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Delete
                                    </Button>
                                  </div>

                                  {/* Professional Footer */}
                                  <div className="border-t pt-2 mt-3">
                                    <p className="text-xs text-gray-500 text-center font-medium">
                                      {expandedActions.has(patient.id) ? "Patient Management Tools" : ""}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedPatientDetail && (
            <div ref={detailsRef} className="mt-6">
              <Card className={`border-[#0d5c75]/20 shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <CardHeader className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white flex flex-row items-center justify-between">
                  <CardTitle className="font-poppins">Selected Patient Details</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {selectedPatientDetail.session_type === 'in_clinic' ? 'Clinic' : 'Video'} • {selectedPatientDetail.urgency}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => setSelectedPatientDetail(null)} className="border-white/40 text-white hover:bg-white/20">
                      Hide Details
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-[#0d5c75]'}`}>Patient Info</h4>
                      <p className="text-sm"><span className="font-medium">Name:</span> {selectedPatientDetail.name}</p>
                      <p className="text-sm"><span className="font-medium">Phone:</span> {selectedPatientDetail.phone}</p>
                      <p className="text-sm"><span className="font-medium">Email:</span> {selectedPatientDetail.email || 'Not provided'}</p>
                      <p className="text-sm"><span className="font-medium">Patient Code:</span> <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">{getPatientCodeById(selectedPatientDetail.id)}</code></p>
                      {selectedPatientDetail.profession && (
                        <p className="text-sm"><span className="font-medium">Profession:</span> {selectedPatientDetail.profession.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-[#0d5c75]'}`}>Appointment</h4>
                      <p className="text-sm"><span className="font-medium">Date:</span> {new Date(selectedPatientDetail.appointment_date).toLocaleDateString()}</p>
                      <p className="text-sm"><span className="font-medium">Time:</span> {new Date(selectedPatientDetail.appointment_date).toLocaleTimeString()}</p>
                      <div className="text-sm flex items-center gap-2">
                        <span className="font-medium">Status:</span>
                        <Badge>{selectedPatientDetail.status}</Badge>
                      </div>
                      <p className="text-sm"><span className="font-medium">Payment:</span> {selectedPatientDetail.payment_method?.toUpperCase?.() || 'CASH'}</p>
                      {selectedPatientDetail.last_visit && (
                        <p className="text-sm"><span className="font-medium">Last Visit:</span> {new Date(selectedPatientDetail.last_visit).toLocaleDateString()}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-[#0d5c75]'}`}>Sessions</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-sm">
                          <span className="font-medium">Progress:</span>
                          <span className={`ml-2 text-xl font-bold ${isDarkMode ? 'text-white' : 'text-[#0d5c75]'}`}>
                            {selectedPatientDetail.status === 'cancelled' ? 0 : (selectedPatientDetail.sessions_completed || 0)}
                          </span>
                          <span className="text-gray-500">/</span>
                          <span className="text-lg font-semibold text-gray-600">
                            {selectedPatientDetail.status === 'cancelled' ? 0 : (selectedPatientDetail.total_sessions || 8)}
                          </span>
                          <span className="ml-1 text-sm text-gray-500">sessions</span>
                        </p>
                      </div>
                      <p className="text-sm"><span className="font-medium">Prescription Generated:</span> {selectedPatientDetail.prescription_generated ? `Yes (${selectedPatientDetail.prescription_count || 0})` : 'No'}</p>
                      {selectedPatientDetail.treatment_plan?.progress && (
                        <p className="text-sm"><span className="font-medium">Progress:</span> {selectedPatientDetail.treatment_plan.progress}</p>
                      )}
                    </div>
                  </div>

                  {/* Next Appointment Section - Professional Display */}
                  {selectedPatientDetail.next_appointment_date && (
                    <div className="mt-6">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-5 rounded-lg shadow-md">
                        <div className="flex items-start gap-4">
                          <div className="bg-green-500 rounded-full p-3 flex-shrink-0">
                            <Calendar className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-green-800 text-lg mb-3 flex items-center gap-2">
                              📅 Next Appointment Scheduled
                              <Badge className="bg-green-600 text-white text-xs">Confirmed</Badge>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-green-600" />
                                  <div>
                                    <p className="text-xs text-gray-600 font-medium">Date</p>
                                    <p className="text-sm font-bold text-gray-900">
                                      {new Date(selectedPatientDetail.next_appointment_date).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-green-600" />
                                  <div>
                                    <p className="text-xs text-gray-600 font-medium">Time</p>
                                    <p className="text-sm font-bold text-gray-900">
                                      {new Date(selectedPatientDetail.next_appointment_date).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                      })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs text-gray-600 font-medium mb-1">Appointment Notes</p>
                                  <p className="text-sm text-gray-800 bg-white/60 p-2 rounded border border-green-200">
                                    {selectedPatientDetail.next_appointment_notes || 'Follow-up appointment'}
                                  </p>
                                </div>
                                {selectedPatientDetail.next_appointment_booked_at && (
                                  <div className="text-xs text-gray-500">
                                    Booked on: {new Date(selectedPatientDetail.next_appointment_booked_at).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-green-200">
                              <p className="text-xs text-gray-600 flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-600" />
                                Reminder: Patient will receive notification 24 hours before appointment
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-[#0d5c75]'}`}>Clinical Notes</h4>
                    <p className="text-sm bg-gray-50 p-3 rounded border">{selectedPatientDetail.notes || 'No complaints noted'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* 📝 TREATMENT NOTES SECTION */}
              <Card className="mt-6 border-[#2a9d8f]/20 shadow-xl">
                <CardContent className="p-6">
                  <TreatmentNotes
                    patient={selectedPatientDetail}
                    onNotesUpdated={loadPatients}
                    isDarkMode={isDarkMode}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* AdminSidebar */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentPath={pathname}
      />

      {/* Scroll to Top Navigation Button */}
      <ScrollToTopButton showAfter={300} />

      <Dialog open={isPrescriptionDialogOpen} onOpenChange={setIsPrescriptionDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#0d5c75] font-poppins flex items-center gap-2">
              <div className="w-16 h-16 relative bg-transparent">
                <Image
                  src="/images/gonstead-logo-new.png"
                  alt="Gonstead Logo"
                  fill
                  className="object-contain"
                />
              </div>
              Gonstead Chiropractic Prescription - {selectedPatient?.name}
            </DialogTitle>
          </DialogHeader>

          {/* Editable Prescription Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader className="bg-[#4c9d90] text-white py-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  Treatment Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Textarea
                  value={prescriptionNotes}
                  onChange={(e) => setPrescriptionNotes(e.target.value)}
                  placeholder="Enter treatment plan and diagnosis..."
                  className="min-h-[120px]"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-[#2a9d8f] text-white py-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  Prescribed Medicine
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Textarea
                  value={prescriptionMedicine}
                  onChange={(e) => setPrescriptionMedicine(e.target.value)}
                  placeholder="Enter prescribed medications..."
                  className="min-h-[120px]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Clinical Tools & Visual Aids */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Clinical Tools */}
            <Card>
              <CardHeader className="bg-[#0d5c75] text-white py-3">
                <CardTitle className="text-lg">Clinical Tools</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Pain Level */}
                <div>
                  <Label className="text-sm font-semibold text-[#0d5c75]">Pain Level (0-10)</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Input type="range" min={0} max={10} value={painLevel}
                      onChange={e => setPainLevel(Number(e.target.value))} className="cursor-pointer" />
                    <Badge className={`${painLevel >= 7 ? 'bg-red-600' : painLevel >= 4 ? 'bg-orange-500' : 'bg-green-600'}`}>{painLevel}</Badge>
                  </div>
                </div>
                {/* Affected Areas */}
                <div>
                  <Label className="text-sm font-semibold text-[#0d5c75]">Affected Areas</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {areaBank.map(area => (
                      <Button key={area} size="sm" variant={affectedAreas.includes(area) ? 'default' : 'outline'}
                        onClick={() => toggleArea(area)}
                        className={affectedAreas.includes(area) ? 'bg-[#2a9d8f] text-white' : ''}
                      >{area}</Button>
                    ))}
                  </div>
                </div>
                {/* Red Flags */}
                <div>
                  <Label className="text-sm font-semibold text-[#0d5c75]">Clinical Red Flags</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    {redFlagBank.map(flag => (
                      <div key={flag} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{flag}</span>
                        <Switch checked={redFlags.includes(flag)} onCheckedChange={(val) => toggleRedFlag(flag, !!val)} />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Exercises Selector */}
                <div>
                  <Label className="text-sm font-semibold text-[#0d5c75]">Recommended Exercises</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {exerciseBank.map(ex => (
                      <Button key={ex} size="sm" variant={selectedExercises.includes(ex) ? 'default' : 'outline'}
                        onClick={() => toggleExercise(ex)}
                        className={selectedExercises.includes(ex) ? 'bg-[#f3a800] text-white' : ''}
                      >{ex}</Button>
                    ))}
                  </div>
                </div>
                {/* Dose Schedule */}
                <div>
                  <Label className="text-sm font-semibold text-[#0d5c75]">Dose Schedule</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {(['morning', 'afternoon', 'night'] as const).map(k => (
                      <div key={k} className="flex items-center justify-between p-2 border rounded">
                        <span className="capitalize text-sm">{k}</span>
                        <Switch checked={doseSchedule[k]} onCheckedChange={(val) => setDose(k, !!val)} />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patient Visual Summary */}
            <Card>
              <CardHeader className="bg-[#2a9d8f] text-white py-3">
                <CardTitle className="text-lg">Patient Visual Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Severity Meter */}
                <div>
                  <Label className="text-sm font-semibold text-[#0d5c75]">Condition Severity</Label>
                  <div className="mt-2">
                    <div className="w-full h-3 bg-gray-200 rounded">
                      <div className={`h-3 rounded ${painLevel >= 7 || redFlags.length > 0 ? 'bg-red-600 w-11/12' : painLevel >= 4 ? 'bg-orange-500 w-7/12' : 'bg-green-600 w-3/12'}`}></div>
                    </div>
                    <p className="text-xs mt-1 text-gray-600">{deriveSeverity()}</p>
                  </div>
                </div>
                {/* Affected Areas badges */}
                <div>
                  <Label className="text-sm font-semibold text-[#0d5c75]">Areas</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {affectedAreas.length === 0 ? <span className="text-xs text-gray-500">No area selected</span> : affectedAreas.map(a => (
                      <Badge key={a} variant="secondary" className="bg-[#0d5c75] text-white">{a}</Badge>
                    ))}
                  </div>
                </div>
                {/* Exercises list */}
                <div>
                  <Label className="text-sm font-semibold text-[#0d5c75]">Exercises to Do</Label>
                  <ul className="list-disc pl-5 mt-2 text-sm text-gray-800 space-y-1">
                    {selectedExercises.length === 0 ? (
                      <li>Select exercises from tools</li>
                    ) : selectedExercises.map(ex => <li key={ex}>{ex}</li>)}
                  </ul>
                </div>
                {/* Dose badges */}
                <div>
                  <Label className="text-sm font-semibold text-[#0d5c75]">Medication Times</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {doseSchedule.morning && <Badge className="bg-[#0d5c75] text-white">Morning</Badge>}
                    {doseSchedule.afternoon && <Badge className="bg-[#f3a800] text-white">Afternoon</Badge>}
                    {doseSchedule.night && <Badge className="bg-[#2a9d8f] text-white">Night</Badge>}
                    {!doseSchedule.morning && !doseSchedule.afternoon && !doseSchedule.night && (
                      <span className="text-xs text-gray-500">No dose timing selected</span>
                    )}
                  </div>
                </div>
                {/* Red flag alert */}
                {redFlags.length > 0 && (
                  <div className="p-3 rounded border border-red-300 bg-red-50 text-red-700 text-sm">
                    ⚠️ Important: {redFlags.join(', ')} — consider urgent evaluation if symptoms persist or worsen.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chiropractic Suggestions */}
          <Card className="mb-6">
            <CardHeader className="bg-green-600 text-white py-3">
              <CardTitle className="text-lg">Chiropractic Care Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {chiropracticSuggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <span className="flex-1 text-sm">{suggestion}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeChiropracticSuggestion(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    value={newSuggestion}
                    onChange={(e) => setNewSuggestion(e.target.value)}
                    placeholder="Add new recommendation..."
                    className="flex-1"
                  />
                  <Button onClick={addChiropracticSuggestion} size="sm">
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Doctor's Signature Tool */}
          <div className="mb-6">
            <SignatureCanvas
              onSignatureChange={(dataUrl) => setDoctorSignature(dataUrl)}
              width={500}
              height={150}
            />
          </div>

          {/* Prescription Preview */}
          {selectedPatient && (
            <div
              id="prescription-content"
              style={{
                width: "210mm",
                minHeight: "297mm",
                margin: "0 auto",
                padding: "20mm",
                backgroundColor: "white",
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                lineHeight: "1.4",
                color: "#000",
                boxSizing: "border-box",
                position: "relative",
              }}
            >
              {/* Enhanced Professional Header */}
              <div
                style={{
                  padding: "20px 25px",
                  background: "linear-gradient(135deg, #0d5c75 0%, #2a9d8f 100%)",
                  borderRadius: "12px",
                  color: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: "0 8px 32px rgba(13, 92, 117, 0.3)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Background pattern */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><defs><pattern id=%22grain%22 width=%22100%22 height=%22100%22 patternUnits=%22userSpaceOnUse%22><circle cx=%2250%22 cy=%2250%22 r=%221%22 fill=%22%23ffffff%22 fill-opacity=%220.1%22/></pattern></defs><rect width=%22100%22 height=%22100%22 fill=%22url(%23grain)%22/></svg>')",
                  opacity: 0.3
                }}></div>

                <div style={{ display: "flex", alignItems: "center", gap: "20px", zIndex: 10, position: "relative" }}>
                  {/* Enhanced Logo */}
                  <div style={{
                    width: "70px",
                    height: "70px",
                    background: "rgba(255, 255, 255, 0.15)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(10px)",
                    border: "2px solid rgba(255, 255, 255, 0.2)",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)"
                  }}>
                    <img
                      src="/images/gonstead-logo-new.png"
                      alt="Gonstead Chiropractic Logo"
                      style={{ width: "50px", height: "50px", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
                    />
                  </div>

                  {/* Clinic Information */}
                  <div>
                    <h1 style={{
                      fontSize: "28px",
                      margin: "0",
                      fontWeight: "bold",
                      letterSpacing: "0.5px",
                      textShadow: "0 2px 4px rgba(0,0,0,0.3)"
                    }}>
                      GONSTEAD CHIROPRACTIC CLINIC
                    </h1>
                    <p style={{
                      fontSize: "16px",
                      margin: "2px 0 0 0",
                      fontWeight: "600",
                      opacity: 0.95
                    }}>
                      Dr. Bashir Khan - Gonstead Certified Specialist
                    </p>
                    <p style={{
                      fontSize: "14px",
                      margin: "2px 0 0 0",
                      opacity: 0.9
                    }}>
                      Near Peshawar Model School, Tehsil Road, Nowshera
                    </p>
                  </div>
                </div>


                {/* Decorative elements */}
                <div style={{
                  position: "absolute",
                  top: "-10px",
                  right: "-10px",
                  width: "40px",
                  height: "40px",
                  background: "radial-gradient(circle, rgba(243, 168, 0, 0.3) 0%, transparent 70%)",
                  borderRadius: "50%"
                }}></div>
                <div style={{
                  position: "absolute",
                  bottom: "-5px",
                  left: "-5px",
                  width: "30px",
                  height: "30px",
                  background: "radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)",
                  borderRadius: "50%"
                }}></div>
              </div>

              {/* Rest of the prescription content with improved print styling */}
              {/* Prescription ID Header - Prominent Display */}
              <div
                style={{
                  textAlign: "center",
                  padding: "15px",
                  backgroundColor: "#0d5c75",
                  color: "white",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  border: "3px solid #2a9d8f",
                  boxShadow: "0 4px 12px rgba(13, 92, 117, 0.3)",
                }}
              >
                <h2 style={{
                  margin: "0",
                  fontSize: "24px",
                  fontWeight: "bold",
                  letterSpacing: "2px",
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)"
                }}>
                  PRESCRIPTION ID: {currentPrescriptionId || window?.prescriptionId || 'RX000'}
                </h2>
                <p style={{ margin: "5px 0 0 0", fontSize: "12px", opacity: 0.9 }}>
                  Official Gonstead Chiropractic Prescription
                </p>
              </div>

              {/* Patient Information */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  marginBottom: "20px",
                  padding: "15px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  border: "1px solid #dee2e6",
                }}
              >
                <div>
                  <h3 style={{ color: "#245064", fontSize: "14px", fontWeight: "bold", marginBottom: "10px" }}>
                    PATIENT INFORMATION
                  </h3>
                  <p style={{ margin: "0 0 5px 0", fontSize: "13px" }}>
                    <strong>Name:</strong> {selectedPatient.name}
                  </p>
                  <p style={{ margin: "0 0 5px 0", fontSize: "13px" }}>
                    <strong>Phone:</strong> {selectedPatient.phone}
                  </p>
                  <p style={{ margin: "0 0 5px 0", fontSize: "13px" }}>
                    <strong>Email:</strong> {selectedPatient.email || "Not provided"}
                  </p>
                  <p style={{ margin: "0", fontSize: "13px" }}>
                    <strong>Patient Code:</strong> {getOrAssignPatientCode(selectedPatient)}
                  </p>
                </div>
                <div>
                  <h3 style={{ color: "#245064", fontSize: "14px", fontWeight: "bold", marginBottom: "10px" }}>
                    PRESCRIPTION DETAILS
                  </h3>
                  <p style={{ margin: "0 0 5px 0", fontSize: "13px" }}>
                    <strong>Prescription ID:</strong> <span style={{
                      backgroundColor: "#0d5c75",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontWeight: "bold",
                      letterSpacing: "1px"
                    }}>
                      {currentPrescriptionId || window?.prescriptionId || 'RX000'}
                    </span>
                  </p>
                  <p style={{ margin: "0 0 5px 0", fontSize: "13px" }}>
                    <strong>Date:</strong> {typeof window !== 'undefined' ? new Date().toLocaleDateString() : '--/--/----'}
                  </p>
                  <p style={{ margin: "0 0 5px 0", fontSize: "13px" }}>
                    <strong>Time:</strong> {typeof window !== 'undefined' ? new Date().toLocaleTimeString() : '--:--:-- --'}
                  </p>
                  <p style={{ margin: "0 0 5px 0", fontSize: "13px" }}>
                    <strong>Session:</strong>{" "}
                    {selectedPatient.session_type === "in_clinic" ? "In-Clinic" : "Video Consultation"}
                  </p>
                  <p style={{ margin: "0", fontSize: "13px" }}>
                    <strong>Treatment Progress:</strong>{" "}
                    <span style={{
                      backgroundColor: "#22c55e",
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontWeight: "bold",
                      marginLeft: "4px"
                    }}>
                      {(selectedPatient.status === 'cancelled' ? 0 : (selectedPatient.sessions_completed || 0))}/{(selectedPatient.status === 'cancelled' ? 0 : (selectedPatient.total_sessions || 8))} Sessions
                    </span>
                    {" "}
                    <span style={{ color: "#f59e0b", fontWeight: "600", marginLeft: "8px" }}>
                      ({Math.max(0, (selectedPatient.status === 'cancelled' ? 0 : (selectedPatient.total_sessions || 8)) - (selectedPatient.status === 'cancelled' ? 0 : (selectedPatient.sessions_completed || 0)))} Remaining)
                    </span>
                  </p>
                </div>
              </div>

              {/* Session Progress Summary */}
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{
                  fontSize: "16px", fontWeight: "bold", color: "#0d5c75",
                  margin: "0 0 10px 0", padding: "8px 12px", backgroundColor: "rgba(13,92,117,0.1)", borderRadius: "5px",
                }}>SESSION PROGRESS & TREATMENT STATUS</h3>
                <div style={{
                  padding: "15px",
                  border: "2px solid #22c55e",
                  borderRadius: "8px",
                  backgroundColor: "#f0fdf4",
                  marginBottom: "15px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", gap: "20px" }}>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ margin: "0 0 5px 0", fontSize: "11px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>Completed Sessions</p>
                      <p style={{ margin: 0, fontSize: "32px", fontWeight: "bold", color: "#22c55e" }}>
                        {selectedPatient.sessions_completed || 0}
                      </p>
                    </div>
                    <div style={{
                      width: "2px",
                      height: "50px",
                      backgroundColor: "#d1d5db"
                    }}></div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ margin: "0 0 5px 0", fontSize: "11px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>Remaining Sessions</p>
                      <p style={{ margin: 0, fontSize: "32px", fontWeight: "bold", color: "#f59e0b" }}>
                        {Math.max(0, (selectedPatient.total_sessions || 8) - (selectedPatient.sessions_completed || 0))}
                      </p>
                    </div>
                    <div style={{
                      width: "2px",
                      height: "50px",
                      backgroundColor: "#d1d5db"
                    }}></div>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ margin: "0 0 5px 0", fontSize: "11px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>Total Prescribed</p>
                      <p style={{ margin: 0, fontSize: "32px", fontWeight: "bold", color: "#0d5c75" }}>
                        {selectedPatient.total_sessions || 8}
                      </p>
                    </div>
                  </div>
                  <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #d1fae5" }}>
                    <div style={{ backgroundColor: "#e5e7eb", height: "12px", borderRadius: "6px", overflow: "hidden" }}>
                      <div style={{
                        backgroundColor: "#22c55e",
                        height: "12px",
                        width: `${Math.min(100, Math.round((((selectedPatient.status === 'cancelled' ? 0 : (selectedPatient.sessions_completed || 0)) / (selectedPatient.status === 'cancelled' ? 1 : (selectedPatient.total_sessions || 8))) * 100)))}%`,
                        transition: "width 0.3s ease"
                      }}></div>
                    </div>
                    <p style={{ margin: "8px 0 0 0", fontSize: "12px", color: "#374151", textAlign: "center", fontWeight: "600" }}>
                      Treatment Progress: {Math.min(100, Math.round((((selectedPatient.status === 'cancelled' ? 0 : (selectedPatient.sessions_completed || 0)) / (selectedPatient.status === 'cancelled' ? 1 : (selectedPatient.total_sessions || 8))) * 100)))}% Complete
                    </p>
                  </div>
                </div>
              </div>

              {/* Patient Visual Summary (Print) */}
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{
                  fontSize: "16px", fontWeight: "bold", color: "#0d5c75",
                  margin: "0 0 10px 0", padding: "8px 12px", backgroundColor: "rgba(13,92,117,0.1)", borderRadius: "5px",
                }}>PATIENT VISUAL SUMMARY</h3>
                {/* Severity bar */}
                <div style={{ marginBottom: "10px" }}>
                  <div style={{ height: 10, background: "#e5e7eb", borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ height: 10, width: `${Math.min(100, (painLevel >= 7 ? 90 : (painLevel >= 4 ? 60 : 30)))}%`, background: painLevel >= 7 || redFlags.length > 0 ? '#ef4444' : painLevel >= 4 ? '#f59e0b' : '#22c55e' }}></div>
                  </div>
                  <p style={{ fontSize: 12, color: '#374151', marginTop: 6 }}>Severity: {deriveSeverity()}</p>
                </div>
                {/* Pain level and areas */}
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 10 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: '#374151' }}>Pain Level</p>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 'bold', color: '#111827' }}>{painLevel}/10</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: '#374151' }}>Affected Areas</p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(affectedAreas.length ? affectedAreas : ['None']).map(a => (
                        <span key={a} style={{ background: '#0d5c75', color: 'white', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>{a}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Dose schedule */}
                <div style={{ marginBottom: 10 }}>
                  <p style={{ margin: 0, fontSize: 12, color: '#374151' }}>Medication Times</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                    {doseSchedule.morning ? <span style={{ background: '#0d5c75', color: 'white', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>Morning</span> : null}
                    {doseSchedule.afternoon ? <span style={{ background: '#f3a800', color: 'white', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>Afternoon</span> : null}
                    {doseSchedule.night ? <span style={{ background: '#2a9d8f', color: 'white', padding: '2px 8px', borderRadius: 12, fontSize: 12 }}>Night</span> : null}
                    {!doseSchedule.morning && !doseSchedule.afternoon && !doseSchedule.night ? <span style={{ color: '#6b7280', fontSize: 12 }}>No timing chosen</span> : null}
                  </div>
                </div>
                {/* Exercises */}
                {selectedExercises.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <p style={{ margin: 0, fontSize: 12, color: '#374151' }}>Exercises</p>
                    <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: 13 }}>
                      {selectedExercises.map(ex => <li key={ex}>{ex}</li>)}
                    </ul>
                  </div>
                )}
                {/* Red flags */}
                {redFlags.length > 0 && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: 10, borderRadius: 8, fontSize: 12 }}>
                    ⚠️ Important: {redFlags.join(', ')} — Consider urgent evaluation if symptoms persist/worsen.
                  </div>
                )}
              </div>

              {/* Treatment Plan */}
              <div style={{ marginBottom: "20px" }}>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#245064",
                    margin: "0 0 10px 0",
                    padding: "8px 12px",
                    backgroundColor: "rgba(36,80,100,0.1)",
                    borderRadius: "5px",
                  }}
                >
                  TREATMENT PLAN & DIAGNOSIS
                </h3>
                <div
                  style={{
                    padding: "15px",
                    border: "2px solid #dee2e6",
                    borderRadius: "8px",
                    minHeight: "80px",
                    fontSize: "13px",
                    lineHeight: "1.5",
                    backgroundColor: "white",
                  }}
                >
                  {prescriptionNotes || selectedPatient.notes || "No specific treatment plan noted."}
                </div>
              </div>

              {/* Prescribed Medicine */}
              {prescriptionMedicine && (
                <div style={{ marginBottom: "20px" }}>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#2e9d8f",
                      margin: "0 0 10px 0",
                      padding: "8px 12px",
                      backgroundColor: "rgba(46,157,143,0.1)",
                      borderRadius: "5px",
                    }}
                  >
                    PRESCRIBED MEDICINE
                  </h3>
                  <div
                    style={{
                      padding: "15px",
                      border: "2px solid #dee2e6",
                      borderRadius: "8px",
                      minHeight: "60px",
                      fontSize: "13px",
                      lineHeight: "1.5",
                      backgroundColor: "white",
                    }}
                  >
                    {prescriptionMedicine}
                  </div>
                </div>
              )}

              {/* Chiropractic Recommendations */}
              <div style={{ marginBottom: "30px" }}>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: "#228b22",
                    margin: "0 0 10px 0",
                    padding: "8px 12px",
                    backgroundColor: "rgba(34,139,34,0.1)",
                    borderRadius: "5px",
                  }}
                >
                  CHIROPRACTIC CARE RECOMMENDATIONS
                </h3>
                <div
                  style={{
                    padding: "15px",
                    border: "2px solid #dee2e6",
                    borderRadius: "8px",
                    backgroundColor: "white",
                  }}
                >
                  {chiropracticSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        marginBottom: "8px",
                        fontSize: "13px",
                        lineHeight: "1.5",
                      }}
                    >
                      <span
                        style={{
                          color: "#228b22",
                          fontWeight: "bold",
                          marginRight: "8px",
                          minWidth: "20px",
                        }}
                      >
                        {index + 1}.
                      </span>
                      <span>{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signature Section */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "30px",
                  marginBottom: "20px",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ borderBottom: "2px solid #245064", marginBottom: "8px", height: "40px" }}></div>
                  <p style={{ fontWeight: "bold", color: "#245064", fontSize: "12px", margin: "0" }}>
                    Patient Signature
                  </p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ borderBottom: doctorSignature ? "none" : "2px solid #245064", marginBottom: "8px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {doctorSignature && (
                      <img
                        src={doctorSignature}
                        alt="Doctor Signature"
                        style={{ maxHeight: "40px", maxWidth: "100%", objectFit: "contain" }}
                      />
                    )}
                  </div>
                  <p style={{ fontWeight: "bold", color: "#245064", fontSize: "12px", margin: "0" }}>
                    Doctor Signature
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div
                style={{
                  textAlign: "center",
                  background: "linear-gradient(135deg, #0d5c75 0%, #2a9d8f 100%)",
                  color: "white",
                  padding: "15px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  marginTop: "20px",
                }}
              >
                <p style={{ margin: "0 0 5px 0", fontWeight: "bold" }}>
                  Bashir Khan Chiropractic - Licensed Gonstead Practitioner
                </p>
                <p style={{ margin: "0 0 5px 0" }}>
                  Specializing in Gonstead Chiropractic Technique | Spinal Analysis & Correction
                </p>
                <p style={{ margin: "0" }}>
                  Near Peshawar Model School, Tehsil Road, Nowshera | +92 304 699 6267 | Emergency consultations available
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-6">
            {/* Smart Prescription Logic Display */}
            {selectedPatient && selectedPatient.prescription_generated && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Prescription previously generated on {selectedPatient.last_prescription_date ? new Date(selectedPatient.last_prescription_date).toLocaleDateString() : 'N/A'}</span>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsPrescriptionDialogOpen(false)}>
                Close
              </Button>

              {/* Generate New Prescription Button - Only show if patient has existing prescription */}
              {selectedPatient && (selectedPatient.prescription_generated || (selectedPatient.prescription_count ?? 0) > 0) && (
                <Button
                  onClick={generateNewPrescription}
                  className="bg-[#f3a800] hover:bg-[#e07c1c] text-white"
                  title="Generate a new prescription for this patient"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Generate New Prescription
                </Button>
              )}

              <Button onClick={downloadPrescriptionPDF} className="bg-[#2a9d8f] hover:bg-[#238a7a] text-white">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={printPrescription} className="bg-[#0d5c75] hover:bg-[#0a4a5c] text-white">
                <FileText className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Patient History Dialog */}
      <Dialog open={isPatientHistoryDialogOpen} onOpenChange={setIsPatientHistoryDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4">
              <DialogTitle className="text-[#0d5c75] font-poppins flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#8b5cf6] to-[#6366f1] rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <span>Complete Patient History - {selectedPatientHistory?.name}</span>
              </DialogTitle>
              {selectedPatientHistory && (
                <Button
                  variant="outline"
                  className="border-[#2a9d8f] text-[#2a9d8f] hover:bg-[#2a9d8f] hover:text-white"
                  onClick={downloadPatientHistoryPDF}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download History PDF
                </Button>
              )}
            </div>
          </DialogHeader>

          {selectedPatientHistory && (
            <div id="patient-history-content" className="space-y-8">

              {/* Enhanced Patient Overview Card */}
              <Card className="border-l-4 border-l-[#8b5cf6] shadow-lg">
                <CardHeader className="bg-gradient-to-r from-[#8b5cf6] to-[#6366f1] text-white">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Patient Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-[#0d5c75] flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Contact Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Name:</span> {selectedPatientHistory.name}</p>
                        <p><span className="font-medium">Phone:</span> {selectedPatientHistory.phone}</p>
                        <p><span className="font-medium">Email:</span> {selectedPatientHistory.email || 'Not provided'}</p>
                        <p><span className="font-medium">Patient Code:</span> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{getPatientCodeById(selectedPatientHistory.id)}</code></p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-[#0d5c75] flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Treatment Statistics
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Total Sessions:</span>
                          <Badge variant="secondary" className="ml-2">
                            {selectedPatientHistory.sessions_completed || 0}
                          </Badge>
                        </p>
                        <p><span className="font-medium">First Visit:</span> {new Date(selectedPatientHistory.appointment_date).toLocaleDateString()}</p>
                        <p><span className="font-medium">Last Visit:</span> {selectedPatientHistory.last_visit ? new Date(selectedPatientHistory.last_visit).toLocaleDateString() : 'No visits yet'}</p>
                        <p><span className="font-medium">Status:</span>
                          <Badge
                            variant={selectedPatientHistory.status === 'completed' ? 'default' : selectedPatientHistory.status === 'pending' ? 'secondary' : 'outline'}
                            className="ml-2"
                          >
                            {selectedPatientHistory.status.toUpperCase()}
                          </Badge>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-[#0d5c75] flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Treatment Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Session Type:</span>
                          <Badge variant={selectedPatientHistory.session_type === 'in_clinic' ? 'default' : 'secondary'} className="ml-2">
                            {selectedPatientHistory.session_type === 'in_clinic' ? 'In-Clinic' : 'Video'}
                          </Badge>
                        </p>
                        <p><span className="font-medium">Urgency:</span>
                          <Badge
                            variant={selectedPatientHistory.urgency === 'emergency' ? 'destructive' : selectedPatientHistory.urgency === 'urgent' ? 'secondary' : 'outline'}
                            className="ml-2"
                          >
                            {selectedPatientHistory.urgency.toUpperCase()}
                          </Badge>
                        </p>
                        <p><span className="font-medium">Payment:</span> {(selectedPatientHistory.payment_method || 'cash').toUpperCase()}</p>
                        <p><span className="font-medium">Prescription Generated:</span>
                          {selectedPatientHistory.prescription_generated ?
                            <Badge variant="default" className="ml-2">✓ Yes ({selectedPatientHistory.prescription_count || 0})</Badge> :
                            <Badge variant="outline" className="ml-2">✗ No</Badge>
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Session History Timeline */}
              <Card className="border-l-4 border-l-[#2a9d8f] shadow-lg">
                <CardHeader className="bg-gradient-to-r from-[#2a9d8f] to-[#0d5c75] text-white">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Session Timeline & History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Generate session history based on patient data */}
                    {(() => {
                      const sessions = []
                      const sessionsCount = selectedPatientHistory.sessions_completed || 0
                      const startDate = new Date(selectedPatientHistory.appointment_date)

                      // Create session entries
                      for (let i = 0; i <= Math.max(sessionsCount, 0); i++) {
                        const sessionDate = new Date(startDate)
                        sessionDate.setDate(sessionDate.getDate() + (i * 7)) // Weekly sessions

                        const isCompleted = i < sessionsCount
                        const isUpcoming = i === sessionsCount && selectedPatientHistory.status === 'confirmed'
                        const isCurrent = i === 0

                        sessions.push({
                          sessionNumber: i + 1,
                          date: sessionDate,
                          status: isCompleted ? 'completed' : isUpcoming ? 'upcoming' : isCurrent ? 'current' : 'scheduled',
                          type: selectedPatientHistory.session_type,
                          notes: isCurrent ? (selectedPatientHistory.notes || 'Initial consultation') :
                            isCompleted ? 'Gonstead adjustment completed successfully' :
                              'Session pending',
                          prescription: i === 0 && selectedPatientHistory.prescription_generated ? `RX${String(selectedPatientHistory.prescription_count || 1).padStart(3, '0')}` : null
                        })
                      }

                      return sessions.slice(0, 10).map((session, index) => (
                        <div key={index} className="flex items-start space-x-4 relative">
                          {/* Timeline Line */}
                          {index < sessions.length - 1 && (
                            <div className="absolute left-6 top-12 w-0.5 h-16 bg-gradient-to-b from-[#2a9d8f] to-gray-300"></div>
                          )}

                          {/* Session Icon */}
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${session.status === 'completed' ? 'bg-green-500' :
                              session.status === 'current' ? 'bg-[#2a9d8f]' :
                                session.status === 'upcoming' ? 'bg-orange-500' :
                                  'bg-gray-400'
                            }`}>
                            {session.status === 'completed' ? (
                              <CheckCircle className="h-6 w-6 text-white" />
                            ) : session.status === 'current' ? (
                              <Clock className="h-6 w-6 text-white" />
                            ) : session.status === 'upcoming' ? (
                              <AlertTriangle className="h-6 w-6 text-white" />
                            ) : (
                              <Calendar className="h-6 w-6 text-white" />
                            )}
                          </div>

                          {/* Session Details */}
                          <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-[#0d5c75]">Session #{session.sessionNumber}</h4>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={session.status === 'completed' ? 'default' : session.status === 'current' ? 'secondary' : 'outline'}
                                  className="text-xs"
                                >
                                  {session.status.toUpperCase()}
                                </Badge>
                                {session.prescription && (
                                  <Badge variant="secondary" className="text-xs bg-[#8b5cf6] text-white">
                                    {session.prescription}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="font-medium text-gray-600">Date & Time</p>
                                <p className="text-[#0d5c75]">
                                  {session.date.toLocaleDateString()} at {session.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>

                              <div>
                                <p className="font-medium text-gray-600">Session Type</p>
                                <p className="text-[#0d5c75]">
                                  {session.type === 'in_clinic' ? 'In-Clinic Gonstead Adjustment' : 'Video Consultation'}
                                </p>
                              </div>

                              <div>
                                <p className="font-medium text-gray-600">Duration</p>
                                <p className="text-[#0d5c75]">
                                  {session.type === 'in_clinic' ? '45-60 minutes' : '30-45 minutes'}
                                </p>
                              </div>
                            </div>

                            <div className="mt-3">
                              <p className="font-medium text-gray-600 text-sm">Session Notes</p>
                              <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded mt-1">
                                {session.notes}
                              </p>
                            </div>

                            {session.prescription && (
                              <div className="mt-3 p-3 bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 rounded">
                                <p className="text-sm font-medium text-[#8b5cf6] flex items-center gap-2">
                                  <Prescription className="h-4 w-4" />
                                  Prescription Generated: {session.prescription}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">Chiropractic care plan and recommendations provided</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Treatment Progress & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-l-4 border-l-[#f3a800] shadow-lg">
                  <CardHeader className="bg-[#f3a800] text-white">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Clinical Notes & Chief Complaint
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-[#0d5c75] mb-2">Chief Complaint</h4>
                        <p className="text-sm bg-gray-50 p-3 rounded border">
                          {selectedPatientHistory.notes || 'No specific complaints noted. General chiropractic consultation requested.'}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-[#0d5c75] mb-2">Medical History</h4>
                        <p className="text-sm bg-gray-50 p-3 rounded border">
                          {selectedPatientHistory.medical_history || 'Medical history to be collected during consultation. Standard Gonstead assessment protocols to be followed.'}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-[#0d5c75] mb-2">Booking Source</h4>
                        <Badge variant="outline" className="text-xs">
                          {selectedPatientHistory.booking_source === 'admin_dashboard' ? '📞 Admin Dashboard' : '🌐 Online Booking'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-[#22c55e] shadow-lg">
                  <CardHeader className="bg-[#22c55e] text-white">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Treatment Plan & Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-[#0d5c75] mb-2">Treatment Goals</h4>
                        <div className="text-sm space-y-1">
                          {selectedPatientHistory.treatment_plan?.goals ? (
                            selectedPatientHistory.treatment_plan.goals.map((goal: string, index: number) => (
                              <p key={index} className="flex items-start gap-2">
                                <span className="text-[#22c55e] font-bold">•</span>
                                {goal}
                              </p>
                            ))
                          ) : (
                            <div className="space-y-1">
                              <p className="flex items-start gap-2"><span className="text-[#22c55e] font-bold">•</span>Spinal alignment assessment</p>
                              <p className="flex items-start gap-2"><span className="text-[#22c55e] font-bold">•</span>Pain relief and mobility improvement</p>
                              <p className="flex items-start gap-2"><span className="text-[#22c55e] font-bold">•</span>Gonstead chiropractic adjustment</p>
                              <p className="flex items-start gap-2"><span className="text-[#22c55e] font-bold">•</span>Postural correction guidance</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-[#0d5c75] mb-2">Current Progress</h4>
                        <div className="bg-gray-50 p-3 rounded border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Treatment Progress</span>
                            <span className="text-sm text-[#22c55e] font-semibold">
                              {Math.round((((selectedPatientHistory.status === 'cancelled' ? 0 : (selectedPatientHistory.sessions_completed || 0)) / (selectedPatientHistory.status === 'cancelled' ? 1 : (selectedPatientHistory.total_sessions || 8))) * 100))}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-[#22c55e] to-[#16a34a] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.round((((selectedPatientHistory.status === 'cancelled' ? 0 : (selectedPatientHistory.sessions_completed || 0)) / (selectedPatientHistory.status === 'cancelled' ? 1 : (selectedPatientHistory.total_sessions || 8))) * 100))}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-2">
                            {selectedPatientHistory.treatment_plan?.progress || 'Patient responding well to Gonstead chiropractic treatment. Continue with scheduled sessions.'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-[#0d5c75] mb-2">Next Steps</h4>
                        <div className="text-xs space-y-1 text-gray-700">
                          {selectedPatientHistory.status === 'completed' ? (
                            <p className="text-[#22c55e] font-medium">✓ Treatment plan completed successfully</p>
                          ) : (
                            <>
                              <p>• Continue with weekly Gonstead adjustments</p>
                              <p>• Monitor progress and adjust treatment as needed</p>
                              <p>• Follow up on home care recommendations</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsPatientHistoryDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog open={isEditPatientDialogOpen} onOpenChange={setIsEditPatientDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#0d5c75] font-poppins flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Edit Patient Information
            </DialogTitle>
          </DialogHeader>
          {editingPatient && (
            <form onSubmit={handleUpdatePatient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    value={editingPatient.name}
                    onChange={(e) => setEditingPatient(prev => prev ? { ...prev, name: e.target.value } : null)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone *</Label>
                  <Input
                    id="edit-phone"
                    value={editingPatient.phone}
                    onChange={(e) => setEditingPatient(prev => prev ? { ...prev, phone: e.target.value } : null)}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingPatient.email || ''}
                  onChange={(e) => setEditingPatient(prev => prev ? { ...prev, email: e.target.value } : null)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-session-type">Session Type</Label>
                  <Select
                    value={editingPatient.session_type}
                    onValueChange={(value: "in_clinic" | "video") =>
                      setEditingPatient(prev => prev ? { ...prev, session_type: value } : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_clinic">In-Clinic</SelectItem>
                      <SelectItem value="video">Video Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-urgency">Urgency</Label>
                  <Select
                    value={editingPatient.urgency}
                    onValueChange={(value: "normal" | "urgent" | "emergency") =>
                      setEditingPatient(prev => prev ? { ...prev, urgency: value } : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-appointment-date">Appointment Date & Time *</Label>
                <Input
                  id="edit-appointment-date"
                  type="datetime-local"
                  value={editingPatient.appointment_date}
                  onChange={(e) => setEditingPatient(prev => prev ? { ...prev, appointment_date: e.target.value } : null)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editingPatient.notes || ''}
                  onChange={(e) => setEditingPatient(prev => prev ? { ...prev, notes: e.target.value } : null)}
                  placeholder="Chief complaint, symptoms, etc."
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsEditPatientDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#0d5c75] hover:bg-[#0a4a5c]">
                  Update Patient
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Video Call Dialog with Jitsi Meet Integration */}
      <Dialog open={isVideoCallDialogOpen} onOpenChange={(open) => {
        setIsVideoCallDialogOpen(open)
        if (!open && isVideoCallFullscreen) {
          // Exit fullscreen when dialog closes
          if (document.exitFullscreen) {
            document.exitFullscreen()
          }
        }
      }}>
        <DialogContent
          ref={videoCallDialogRef}
          className={`${isVideoCallFullscreen
              ? 'w-screen h-screen max-w-none max-h-none m-0 p-0 rounded-none'
              : 'max-w-6xl w-[95vw] max-h-[95vh] h-[90vh]'
            } overflow-hidden transition-all duration-300`}
        >
          <DialogHeader className={`px-6 pt-6 pb-4 ${isVideoCallFullscreen ? 'absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm' : ''
            }`}>
            <DialogTitle className="text-[#0d5c75] font-poppins flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Consultation - {selectedPatient?.name}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleVideoCallFullscreen}
                className="border-[#0d5c75] text-[#0d5c75] hover:bg-[#0d5c75] hover:text-white"
                title={isVideoCallFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isVideoCallFullscreen ? (
                  <>
                    <Minimize className="h-4 w-4 mr-2" />
                    Exit Fullscreen
                  </>
                ) : (
                  <>
                    <Maximize className="h-4 w-4 mr-2" />
                    Fullscreen
                  </>
                )}
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className={`${isVideoCallFullscreen
              ? 'h-screen w-screen'
              : 'h-[calc(90vh-8rem)] px-6 pb-6'
            }`}>
            {selectedPatient && (
              <VideoCall
                roomName={`GCC-${getPatientCodeById(selectedPatient.id)}`}
                patientName={selectedPatient.name}
                isFullscreen={isVideoCallFullscreen}
                onCallEnd={() => {
                  setIsVideoCallDialogOpen(false)
                  if (isVideoCallFullscreen && document.exitFullscreen) {
                    document.exitFullscreen()
                  }
                  toast({
                    title: "Video Call Ended",
                    description: `Video consultation with ${selectedPatient.name} has ended`,
                  })
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin App Install Prompt - Only shows when on admin routes */}
      <AdminServiceWorkerClient />

      {/* Patient Growth Analytics Dialog */}
      <PatientGrowthAnalytics
        patients={patients}
        isDarkMode={isDarkMode}
        isOpen={isGrowthAnalyticsOpen}
        onClose={() => setIsGrowthAnalyticsOpen(false)}
      />

      {/* Book Next Appointment Dialog */}
      {patientForNextAppointment && (
        <BookNextAppointment
          patient={patientForNextAppointment}
          allPatients={patients}
          isOpen={isBookNextAppointmentOpen}
          onClose={() => {
            setIsBookNextAppointmentOpen(false)
            setPatientForNextAppointment(null)
          }}
          onSuccess={() => {
            // Refresh patient list
            loadPatients()
          }}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Professional Medical-Grade Cancellation Confirmation Dialog */}
      <Dialog open={isCancelConfirmDialogOpen} onOpenChange={setIsCancelConfirmDialogOpen}>
        <DialogContent className="max-w-2xl overflow-hidden p-0 border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Premium Header with Gradient */}
          <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-orange-600 text-white p-6 pb-8">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-200 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Header Content */}
            <div className="relative z-10">
              <div className="flex items-start gap-4">
                {/* Animated Warning Icon */}
                <div className="relative">
                  <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
                  <div className="relative bg-white/20 backdrop-blur-sm rounded-full p-3 border-2 border-white/40">
                    <AlertTriangle className="h-8 w-8 text-white drop-shadow-lg" />
                  </div>
                </div>

                {/* Title Section */}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold font-poppins mb-2 tracking-tight drop-shadow-md">
                    Appointment Cancellation Confirmation
                  </h2>
                  <p className="text-red-100 text-sm font-medium">
                    This action requires careful consideration • Review details below
                  </p>
                </div>
              </div>
            </div>

            {/* Decorative Wave */}
            <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-white"></div>
          </div>

          {patientToCancel && (
            <div className="p-4 md:p-6 space-y-4 md:space-y-5 bg-gradient-to-b from-gray-50 to-white">
              {/* Collapsible Section 1: Patient Information Card - Premium Design */}
              <div className="relative overflow-hidden rounded-xl border-2 border-red-200 bg-white shadow-lg transition-all duration-300">
                {/* Collapsible Header - Clickable */}
                <button
                  onClick={() => setExpandedCancelSection(expandedCancelSection === 'patient' ? null : 'patient')}
                  className="w-full text-left p-4 md:p-5 hover:bg-red-50/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 rounded-t-xl"
                  aria-expanded={expandedCancelSection === 'patient'}
                  aria-controls="patient-info-section"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center border-2 border-red-300 shadow-inner">
                          <Users className="h-6 w-6 md:h-7 md:w-7 text-red-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                          Patient Information
                          {patientToCancel.urgency === 'emergency' && (
                            <Badge className="bg-red-600 text-white text-xs">EMERGENCY</Badge>
                          )}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">{patientToCancel.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {expandedCancelSection === 'patient' && (
                        <Badge className="bg-green-500 text-white text-xs hidden md:inline-flex">EXPANDED</Badge>
                      )}
                      {expandedCancelSection === 'patient' ? (
                        <ChevronUp className="h-5 w-5 text-red-600 transition-transform duration-200" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400 transition-transform duration-200" />
                      )}
                    </div>
                  </div>
                </button>
                {/* Collapsible Content - Patient Details */}
                <div
                  id="patient-info-section"
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCancelSection === 'patient' || expandedCancelSection === null
                      ? 'max-h-[500px] opacity-100'
                      : 'max-h-0 opacity-0'
                    }`}
                  aria-hidden={expandedCancelSection !== 'patient' && expandedCancelSection !== null}
                >
                  {/* Status Ribbon */}
                  <div className="relative">
                    <div className="absolute top-0 right-0 bg-gradient-to-br from-red-600 to-red-700 text-white px-3 md:px-4 py-1 text-xs font-bold tracking-wider shadow-md" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 20% 100%)' }}>
                      CRITICAL ACTION
                    </div>
                  </div>

                  <div className="p-4 md:p-5 pt-8 md:pt-10">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Patient Avatar/Icon - Hidden on mobile when collapsed */}
                      <div className="flex-shrink-0 hidden md:block">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center border-2 border-red-300 shadow-inner">
                          <Users className="h-7 w-7 md:h-8 md:w-8 text-red-600" />
                        </div>
                      </div>

                      {/* Patient Details */}
                      <div className="flex-1">
                        <div className="mb-3">
                          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 flex items-center gap-2 flex-wrap">
                            {patientToCancel.name}
                            {patientToCancel.urgency === 'emergency' && (
                              <Badge className="bg-red-600 text-white text-xs">EMERGENCY</Badge>
                            )}
                            {patientToCancel.urgency === 'urgent' && (
                              <Badge className="bg-orange-500 text-white text-xs">URGENT</Badge>
                            )}
                          </h3>
                          <p className="text-xs text-gray-500 font-mono">Patient Code: {getOrAssignPatientCode(patientToCancel)}</p>
                        </div>

                        {/* Information Grid - Responsive */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Phone className="h-3.5 w-3.5 text-[#0d5c75]" />
                              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Contact</p>
                            </div>
                            <p className="text-sm font-medium text-gray-900 break-all">{patientToCancel.phone}</p>
                            {patientToCancel.email && (
                              <p className="text-xs text-gray-600 mt-1 flex items-center gap-1 break-all">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{patientToCancel.email}</span>
                              </p>
                            )}
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="h-3.5 w-3.5 text-[#0d5c75]" />
                              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Appointment</p>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(patientToCancel.appointment_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(patientToCancel.appointment_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Activity className="h-3.5 w-3.5 text-[#0d5c75]" />
                              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Session Type</p>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              {patientToCancel.session_type === 'in_clinic' ? 'In-Clinic Visit' : 'Video Consultation'}
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle className="h-3.5 w-3.5 text-[#0d5c75]" />
                              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Progress</p>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              {patientToCancel.sessions_completed || 0}/{patientToCancel.total_sessions || 8} Sessions
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsible Section 2: Cancellation Impact Analysis */}
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl shadow-md transition-all duration-300">
                {/* Collapsible Header - Clickable */}
                <button
                  onClick={() => setExpandedCancelSection(expandedCancelSection === 'impact' ? null : 'impact')}
                  className="w-full text-left p-4 md:p-5 hover:bg-orange-100/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300 rounded-t-xl"
                  aria-expanded={expandedCancelSection === 'impact'}
                  aria-controls="impact-analysis-section"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 bg-orange-500 rounded-full p-2">
                        <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm md:text-base font-bold text-orange-900">Cancellation Impact Analysis</h4>
                        <p className="text-xs text-orange-700 mt-1">Review the following changes</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {expandedCancelSection === 'impact' && (
                        <Badge className="bg-green-500 text-white text-xs hidden md:inline-flex">EXPANDED</Badge>
                      )}
                      {expandedCancelSection === 'impact' ? (
                        <ChevronUp className="h-5 w-5 text-orange-600 transition-transform duration-200" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400 transition-transform duration-200" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Collapsible Content - Impact Analysis */}
                <div
                  id="impact-analysis-section"
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCancelSection === 'impact' || expandedCancelSection === null
                      ? 'max-h-[500px] opacity-100'
                      : 'max-h-0 opacity-0'
                    }`}
                  aria-hidden={expandedCancelSection !== 'impact' && expandedCancelSection !== null}
                >
                  <div className="p-4 md:p-5 pt-0 space-y-3">
                    {/* Impact Items */}
                    <div className="flex items-start gap-3 bg-white/60 rounded-lg p-3 border border-orange-200">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                          <X className="h-4 w-4 text-red-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Appointment Status Change</p>
                        <p className="text-xs text-gray-600 mt-1">Status will be updated from <Badge variant="secondary" className="text-xs mx-1">{patientToCancel.status.toUpperCase()}</Badge> to <Badge variant="destructive" className="text-xs mx-1">CANCELLED</Badge></p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-white/60 rounded-lg p-3 border border-orange-200">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                          <Activity className="h-4 w-4 text-red-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Session Counter</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {(patientToCancel.sessions_completed || 0) > 0 ? (
                            <>
                              Session progress will remain at
                              {" "}
                              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                                {patientToCancel.sessions_completed || 0}/{patientToCancel.total_sessions || 8}
                              </span>
                              {" "}
                              (completed treatment history will be preserved)
                            </>
                          ) : (
                            <>
                              Session progress will be reset from
                              {" "}
                              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                                0/{patientToCancel.total_sessions || 8}
                              </span>
                              {" "}
                              to
                              {" "}
                              <span className="font-mono bg-red-100 px-2 py-0.5 rounded text-red-700">0/0</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-white/60 rounded-lg p-3 border border-orange-200">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Time Slot Release</p>
                        <p className="text-xs text-gray-600 mt-1">The appointment time slot will become available for other patients to book</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsible Section 3: Recovery & Next Steps */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl shadow-md transition-all duration-300">
                {/* Collapsible Header - Clickable */}
                <button
                  onClick={() => setExpandedCancelSection(expandedCancelSection === 'recovery' ? null : 'recovery')}
                  className="w-full text-left p-4 md:p-5 hover:bg-blue-100/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-t-xl"
                  aria-expanded={expandedCancelSection === 'recovery'}
                  aria-controls="recovery-steps-section"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 bg-blue-500 rounded-full p-2">
                        <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm md:text-base font-bold text-blue-900">Recovery & Next Steps</h4>
                        <p className="text-xs text-blue-700 mt-1">Post-cancellation options</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {expandedCancelSection === 'recovery' && (
                        <Badge className="bg-green-500 text-white text-xs hidden md:inline-flex">EXPANDED</Badge>
                      )}
                      {expandedCancelSection === 'recovery' ? (
                        <ChevronUp className="h-5 w-5 text-blue-600 transition-transform duration-200" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400 transition-transform duration-200" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Collapsible Content - Recovery Steps */}
                <div
                  id="recovery-steps-section"
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCancelSection === 'recovery' || expandedCancelSection === null
                      ? 'max-h-[500px] opacity-100'
                      : 'max-h-0 opacity-0'
                    }`}
                  aria-hidden={expandedCancelSection !== 'recovery' && expandedCancelSection !== null}
                >
                  <div className="p-4 md:p-5 pt-0 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700"><span className="font-semibold text-gray-900">Reversible Action:</span> You can restore this appointment later using the <span className="font-mono bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">Restore Appointment</span> button</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700"><span className="font-semibold text-gray-900">Patient Notification:</span> Remember to inform the patient about the cancellation via phone call, SMS, or email</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700"><span className="font-semibold text-gray-900">Documentation:</span> Consider adding a note in the patient's record explaining the reason for cancellation</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700"><span className="font-semibold text-gray-900">Rescheduling:</span> Patient can book a new appointment through the online booking system or by calling the clinic</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Action Buttons */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-4 pt-3 md:pt-4 border-t-2 border-gray-200">
                {/* Safe Action - Keep Appointment */}
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setIsCancelConfirmDialogOpen(false)
                    setPatientToCancel(null)
                    setExpandedCancelSection(null)
                  }}
                  className="w-full md:flex-1 border-2 border-[#0d5c75] text-[#0d5c75] hover:bg-[#0d5c75] hover:text-white font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  <span className="text-sm md:text-base">Keep Appointment Active</span>
                </Button>

                {/* Destructive Action - Confirm Cancellation */}
                <Button
                  type="button"
                  variant="destructive"
                  size="lg"
                  onClick={() => {
                    if (patientToCancel) {
                      handleUpdatePatientStatus(patientToCancel.id, "cancelled")
                      setIsCancelConfirmDialogOpen(false)
                      setPatientToCancel(null)
                      setExpandedCancelSection(null)

                      // Enhanced success feedback
                      toast({
                        title: "✓ Appointment Cancelled Successfully",
                        description: `${patientToCancel.name}'s appointment has been cancelled. Remember to notify the patient.`,
                      })
                    }
                  }}
                  className="w-full md:flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 font-semibold transition-all duration-200 shadow-md hover:shadow-xl"
                >
                  <X className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  <span className="text-sm md:text-base">Confirm Cancellation</span>
                </Button>
              </div>

              {/* Footer Note */}
              <div className="text-center pt-2">
                <p className="text-xs text-gray-500 px-2">
                  🔒 This action is logged and tracked for audit purposes
                  <span className="hidden md:inline"> • Patient ID: {getOrAssignPatientCode(patientToCancel)}</span>
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* FLOATING REAL-TIME WHATSAPP-STYLE PATIENT-DOCTOR DIRECT CHAT INBOX */}
      <DoctorWhatsAppChatInbox isFloating={true} />

      {/* Debug: Show admin user info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs">
          Debug Admin: {adminUser?.email} | {adminUser?.name}
        </div>
      )}
    </React.Fragment>
  )
}
