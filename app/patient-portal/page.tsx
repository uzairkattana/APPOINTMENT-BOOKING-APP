"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  Clock,
  Home,
  Stethoscope,
  LogOut,
  PlusCircle,
  Activity,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Search,
  Printer,
  XCircle,
  Edit3,
  Thermometer,
  Smartphone,
  BellRing,
  CheckSquare,
  Square,
  FileCheck,
  Pill,
  ShieldCheck,
  MapPin,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { logoutPatient, getPatientAppointmentsFromFirestore } from "@/lib/patient-auth"
import { updatePatientFirestore, getPrescriptionsFirestore, type Patient } from "@/lib/firebase-db"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { EnhancedAppointmentBooking } from "@/components/enhanced-appointment-booking"
import { AppointmentConfirmation } from "@/components/appointment-confirmation"
import { checkUpcomingPreAppointmentReminders, type AppointmentReminder } from "@/lib/patient-reminder-service"
import { registerPatientServiceWorker } from "@/lib/pwa-service-worker"
import { PatientChatWidget } from "@/components/PatientChatWidget"

export default function PatientPortalPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [patientName, setPatientName] = useState("Patient")
  const [patientEmail, setPatientEmail] = useState("")
  const [patientPhone, setPatientPhone] = useState("")
  const [patientUid, setPatientUid] = useState("")
  const [patientId, setPatientId] = useState("")

  // Profile Edit State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editDob, setEditDob] = useState("")
  const [editGender, setEditGender] = useState("Male")
  const [editEmergency, setEditEmergency] = useState("")
  const [editAddress, setEditAddress] = useState("")
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Appointments State
  const [appointments, setAppointments] = useState<Patient[]>([])
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isBookModalOpen, setIsBookModalOpen] = useState(false)

  // Reschedule & Print State
  const [rescheduleApt, setRescheduleApt] = useState<Patient | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState<string>("")
  const [rescheduleTime, setRescheduleTime] = useState<string>("10:00 AM")
  const [isUpdatingApt, setIsUpdatingApt] = useState(false)
  const [printSlipApt, setPrintSlipApt] = useState<Patient | null>(null)
  const [viewConfirmationApt, setViewConfirmationApt] = useState<Patient | null>(null)

  // Prescriptions State
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(false)
  const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null)
  const [prescriptionSearch, setPrescriptionSearch] = useState("")

  // Symptom Intake State
  const [painLevel, setPainLevel] = useState<number>(5)
  const [affectedRegion, setAffectedRegion] = useState<string>("Lumbar Spine (L4-L5)")
  const [symptomDescription, setSymptomDescription] = useState<string>("")
  const [isLoggingSymptom, setIsLoggingSymptom] = useState(false)

  // Daily Rehab Checklist
  const [rehabTasks, setRehabTasks] = useState([
    { id: 1, title: "Morning Cat-Cow Decompression (10 mins)", region: "Lumbar", done: false, desc: "Gentle spinal flexion and extension to lubricate intervertebral discs." },
    { id: 2, title: "Prone Cobra Cervical Extension (5 mins)", region: "Neck & Upper Back", done: false, desc: "Restores cervical lordotic curve and counteracts forward head posture." },
    { id: 3, title: "15-Min Ice Therapy on Affected Joint", region: "Lower Back / SI", done: false, desc: "Reduces localized inflammatory edema following Gonstead adjustment." },
    { id: 4, title: "Ergonomic Walk & Posture Break (30 mins)", region: "Full Spine", done: false, desc: "Engages core spinal stabilizers and promotes fluid exchange." },
    { id: 5, title: "Hydration Goal: 2.5 Liters Water", region: "Disc Health", done: false, desc: "Rehydrates nucleus pulposus inside spinal discs overnight." },
  ])

  // PWA & Reminders
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [reminders, setReminders] = useState<AppointmentReminder[]>([])

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    if (typeof window !== "undefined") {
      window.addEventListener("beforeinstallprompt", handleBeforeInstall)
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
      }
    }
  }, [])

  const handleInstallPwa = async () => {
    if (!deferredPrompt) {
      toast({
        title: "Install Patient App",
        description: "Tap browser menu (⋮ or Share) and choose 'Add to Home Screen'.",
      })
      return
    }
    deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === "accepted") {
      toast({ title: "App Installed!", description: "Patient portal added to your home screen." })
      setDeferredPrompt(null)
    }
  }

  // Auth Check & Initial Data Load
  useEffect(() => {
    if (typeof window !== "undefined") {
      registerPatientServiceWorker()

      const isAuth = localStorage.getItem("patient_authenticated")
      if (isAuth !== "true") {
        router.replace("/patient/auth")
        return
      }

      const uName = localStorage.getItem("patient_name") || "Patient"
      const uEmail = localStorage.getItem("patient_email") || ""
      const uPhone = localStorage.getItem("patient_phone") || ""
      const uUid = localStorage.getItem("patient_uid") || ""
      const uId = localStorage.getItem("patient_id") || ""

      setPatientName(uName)
      setPatientEmail(uEmail)
      setPatientPhone(uPhone)
      setPatientUid(uUid)
      setPatientId(uId)

      setEditName(uName)
      setEditEmail(uEmail)
      setEditPhone(uPhone)

      loadData(uEmail, uPhone, uUid, uName)
    }
  }, [router])

  const loadData = async (email?: string, phone?: string, uid?: string, name?: string) => {
    setIsLoading(true)
    const em = email || patientEmail
    const ph = phone || patientPhone
    const uu = uid || patientUid
    const nm = name || patientName

    // Load Appointments
    const list = await getPatientAppointmentsFromFirestore(em, ph, uu, nm)
    setAppointments(list)

    // Load Reminders
    const rems = checkUpcomingPreAppointmentReminders(list, nm)
    setReminders(rems)

    // Fill profile extra details if patient object found
    if (list.length > 0) {
      const p = list[0] as any
      if (p.dob) setEditDob(p.dob)
      if (p.gender) setEditGender(p.gender)
      if (p.address) setEditAddress(p.address)
      if (p.demographics?.emergency_contact) setEditEmergency(p.demographics.emergency_contact)
    }

    // Load Prescriptions
    setIsLoadingPrescriptions(true)
    try {
      const allRx = await getPrescriptionsFirestore()
      const cEmail = em.trim().toLowerCase()
      const cPhone = ph.replace(/\D/g, "")
      const cName = nm.trim().toLowerCase()

      const userRx = allRx.filter((rx) => {
        const rxEmail = (rx.patient_email || "").toLowerCase()
        const rxPhone = (rx.patient_phone || "").replace(/\D/g, "")
        const rxName = (rx.patient_name || "").toLowerCase()
        const rxPatientId = rx.patient_id || ""

        return (
          (cEmail && rxEmail === cEmail) ||
          (cPhone && rxPhone && (rxPhone.includes(cPhone) || cPhone.includes(rxPhone))) ||
          (cName && rxName && (rxName.includes(cName) || cName.includes(rxName))) ||
          (patientId && rxPatientId === patientId)
        )
      })

      setPrescriptions(userRx)
    } catch (e) {
      console.warn("Load Prescriptions note:", e)
    } finally {
      setIsLoadingPrescriptions(false)
    }

    setIsLoading(false)
  }

  const handleLogout = async () => {
    await logoutPatient()
    toast({ title: "Signed Out", description: "You have been logged out safely." })
    router.replace("/patient/auth")
  }

  const handleSaveProfile = async () => {
    setIsSavingProfile(true)

    try {
      // 1. Update local storage
      localStorage.setItem("patient_name", editName)
      localStorage.setItem("patient_email", editEmail)
      localStorage.setItem("patient_phone", editPhone)
      setPatientName(editName)
      setPatientEmail(editEmail)
      setPatientPhone(editPhone)

      // 2. Update Firestore patient record
      if (appointments.length > 0) {
        await updatePatientFirestore(appointments[0].id, {
          name: editName,
          email: editEmail,
          phone: editPhone,
          demographics: {
            emergency_contact: editEmergency,
            gender: editGender,
            address: editAddress,
          },
        } as any)
      }

      // 3. Update Firestore account document if UID exists
      if (patientUid && db) {
        try {
          const accRef = doc(db, "patient_accounts", patientUid)
          await updateDoc(accRef, {
            name: editName,
            email: editEmail,
            phone: editPhone,
            dob: editDob,
            gender: editGender,
            emergency_contact: editEmergency,
            address: editAddress,
          })
        } catch (e) {
          // Skip if missing doc
        }
      }

      toast({ title: "Profile Updated", description: "Your patient account details were saved to Firestore." })
      setIsEditProfileOpen(false)
      loadData()
    } catch (err) {
      toast({ title: "Update Failed", description: "Could not save profile updates.", variant: "destructive" })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleCancelAppointment = async (aptId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return
    setIsUpdatingApt(true)
    const res = await updatePatientFirestore(aptId, { status: "cancelled" })
    setIsUpdatingApt(false)

    if (res) {
      toast({ title: "Appointment Cancelled", description: "Your appointment status was set to cancelled." })
      loadData()
    } else {
      toast({ title: "Cancel Failed", description: "Could not update appointment.", variant: "destructive" })
    }
  }

  const handleSaveReschedule = async () => {
    if (!rescheduleApt || !rescheduleDate) {
      toast({ title: "Select Date", description: "Please enter a valid date.", variant: "destructive" })
      return
    }

    setIsUpdatingApt(true)
    const res = await updatePatientFirestore(rescheduleApt.id, {
      appointment_date: rescheduleDate,
      appointment_time: rescheduleTime,
      status: "scheduled",
    })
    setIsUpdatingApt(false)

    if (res) {
      toast({ title: "Rescheduled!", description: `Updated to ${rescheduleDate} at ${rescheduleTime}.` })
      setRescheduleApt(null)
      loadData()
    } else {
      toast({ title: "Reschedule Failed", description: "Could not update date.", variant: "destructive" })
    }
  }

  const handleLogSymptomSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (appointments.length === 0) {
      toast({ title: "No Active Record", description: "Please schedule an appointment first.", variant: "destructive" })
      return
    }

    setIsLoggingSymptom(true)
    const res = await updatePatientFirestore(appointments[0].id, {
      chief_complaint: `[Pre-Visit Log] Pain Level ${painLevel}/10 in ${affectedRegion}: ${symptomDescription || "No notes"}`,
    })
    setIsLoggingSymptom(false)

    if (res) {
      toast({ title: "Symptom Note Saved!", description: "Pre-visit note forwarded to Dr. Bashir Khan." })
      setSymptomDescription("")
      loadData()
    } else {
      toast({ title: "Submission Failed", description: "Could not record symptom note.", variant: "destructive" })
    }
  }

  const toggleRehabTask = (id: number) => {
    setRehabTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  const completedRehabCount = rehabTasks.filter((t) => t.done).length

  const filteredAppointments = appointments.filter((apt) => {
    const matchesStatus = filterStatus === "all" || apt.status?.toLowerCase() === filterStatus.toLowerCase()
    const matchesSearch =
      !searchQuery ||
      apt.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.appointment_date?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.session_type?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const filteredPrescriptions = prescriptions.filter((rx) => {
    if (!prescriptionSearch) return true
    const term = prescriptionSearch.toLowerCase()
    return (
      rx.id?.toLowerCase().includes(term) ||
      rx.treatment_plan?.toLowerCase().includes(term) ||
      rx.prescribed_medicine?.toLowerCase().includes(term)
    )
  })

  const upcomingAppointment = appointments.find(
    (a) => a.status?.toLowerCase() === "confirmed" || a.status?.toLowerCase() === "scheduled"
  )
  const completedCount = appointments.filter((a) => a.status?.toLowerCase() === "completed").length

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* TOP NAVBAR */}
      <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#2a9d8f] to-[#38b2a0] flex items-center justify-center font-bold text-white shadow-md">
              {patientName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white">{patientName}</h1>
                <Badge className="bg-[#2a9d8f]/20 text-[#2a9d8f] border-[#2a9d8f]/30 text-[10px]">Patient Portal</Badge>
              </div>
              <p className="text-xs text-slate-400">{patientEmail || "Gonstead Chiropractic Patient"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleInstallPwa}
              variant="outline"
              size="sm"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs hidden sm:flex"
            >
              <Smartphone className="h-4 w-4 mr-1 text-emerald-400" />
              <span>App</span>
            </Button>

            <Button
              onClick={() => setIsBookModalOpen(true)}
              size="sm"
              className="bg-[#2a9d8f] hover:bg-[#238a7a] text-white text-xs font-semibold shadow-md"
            >
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Book Adjustment
            </Button>

            <Button onClick={() => router.push("/")} variant="outline" size="sm" className="border-slate-700 text-slate-300 hidden md:flex text-xs">
              <Home className="h-4 w-4 mr-1" />
              Site
            </Button>

            <Button onClick={handleLogout} variant="ghost" size="sm" className="text-rose-400 hover:bg-rose-500/10 text-xs">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Exit</span>
            </Button>
          </div>
        </div>
      </header>

      {/* 24-HOUR REMINDERS BANNER */}
      {reminders.length > 0 && (
        <div className="container mx-auto px-4 pt-4">
          {reminders.map((rem, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-3">
                <BellRing className="h-6 w-6 text-amber-400 animate-bounce flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-xs text-amber-100">Reminder: Adjustment Visit ({rem.isTomorrow ? "Tomorrow" : "Today"})</h4>
                  <p className="text-xs text-amber-200/80">{rem.message}</p>
                </div>
              </div>
              <Button onClick={() => setIsBookModalOpen(true)} size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs">
                View
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* QUICK STATS CARDS */}
      <div className="container mx-auto px-4 pt-6 pb-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-[#2a9d8f]/20 text-[#2a9d8f]">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Next Adjustment</p>
              <p className="text-sm font-semibold text-slate-100 mt-0.5">
                {upcomingAppointment ? `${upcomingAppointment.appointment_date} (${upcomingAppointment.appointment_time || "10:00 AM"})` : "No Visit Scheduled"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Completed Sessions</p>
              <p className="text-xl font-bold text-slate-100 mt-0.5">{completedCount} Adjustments</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Digital Prescriptions</p>
              <p className="text-xl font-bold text-purple-300 mt-0.5">{prescriptions.length} Records</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Lead Specialist</p>
              <p className="text-sm font-semibold text-slate-100 mt-0.5">Dr. Bashir Khan</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="container mx-auto px-4 py-6 flex-1">
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-xl grid grid-cols-2 sm:grid-cols-6 w-full max-w-5xl">
            <TabsTrigger value="appointments" className="data-[state=active]:bg-[#2a9d8f] data-[state=active]:text-white text-xs">
              <Calendar className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
              Visits
            </TabsTrigger>
            <TabsTrigger value="prescriptions" className="data-[state=active]:bg-[#2a9d8f] data-[state=active]:text-white text-xs">
              <Pill className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
              Prescriptions
            </TabsTrigger>
            <TabsTrigger value="rehab" className="data-[state=active]:bg-[#2a9d8f] data-[state=active]:text-white text-xs">
              <Activity className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
              Rehab & Care
            </TabsTrigger>
            <TabsTrigger value="symptoms" className="data-[state=active]:bg-[#2a9d8f] data-[state=active]:text-white text-xs">
              <Thermometer className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
              Pre-Visit Note
            </TabsTrigger>
            <TabsTrigger value="records" className="data-[state=active]:bg-[#2a9d8f] data-[state=active]:text-white text-xs">
              <FileText className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
              Clinical Notes
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-[#2a9d8f] data-[state=active]:text-white text-xs">
              <User className="h-3.5 w-3.5 mr-1 hidden sm:inline" />
              My Profile
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: APPOINTMENTS */}
          <TabsContent value="appointments">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
                <div>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#2a9d8f]" />
                    Appointment History & Self-Service
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">Reschedule, cancel, or print official clinic appointment slips.</CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                    {["all", "scheduled", "completed", "cancelled"].map((st) => (
                      <button
                        key={st}
                        onClick={() => setFilterStatus(st)}
                        className={`px-2.5 py-1 rounded capitalize transition-all ${
                          filterStatus === st ? "bg-[#2a9d8f] text-white font-semibold" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  <Button onClick={() => loadData()} variant="outline" size="sm" className="border-slate-800 text-slate-300 text-xs">
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {isLoading ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-[#2a9d8f]" />
                    <p className="text-xs">Fetching your Firestore appointments...</p>
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl p-6">
                    <Calendar className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-300">No matching appointments found</p>
                    <Button onClick={() => setIsBookModalOpen(true)} className="mt-3 bg-[#2a9d8f] hover:bg-[#238a7a] text-white text-xs">
                      <PlusCircle className="h-4 w-4 mr-1.5" /> Book Adjustment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAppointments.map((apt) => {
                      const st = apt.status?.toLowerCase() || "scheduled"
                      const badgeVariant =
                        st === "completed"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : st === "confirmed" || st === "scheduled"
                          ? "bg-teal-500/20 text-teal-300 border-teal-500/30"
                          : st === "cancelled"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/30"

                      return (
                        <div key={apt.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs capitalize ${badgeVariant}`}>{st}</Badge>
                              <span className="text-[11px] font-mono text-slate-500">Ref: #{apt.id.slice(-6).toUpperCase()}</span>
                            </div>
                            <p className="text-sm font-bold text-white capitalize">
                              {apt.session_type === "video" ? "Video Consultation" : "In-Clinic Gonstead Adjustment"}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
                              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-[#2a9d8f]" /> {apt.appointment_date}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-[#2a9d8f]" /> {apt.appointment_time || "10:00 AM"}</span>
                              <span className="flex items-center gap-1"><Stethoscope className="h-3.5 w-3.5 text-[#2a9d8f]" /> Dr. Bashir Khan</span>
                            </div>
                            {apt.chief_complaint && <p className="text-xs text-slate-300 italic mt-1">"{apt.chief_complaint}"</p>}
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <Button size="sm" variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-800 text-xs" onClick={() => setPrintSlipApt(apt)}>
                              <Printer className="h-3.5 w-3.5 sm:mr-1" />
                              <span className="hidden sm:inline">Slip</span>
                            </Button>
                            {st === "scheduled" || st === "confirmed" ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs"
                                  onClick={() => {
                                    setRescheduleApt(apt)
                                    setRescheduleDate(apt.appointment_date)
                                    setRescheduleTime(apt.appointment_time || "10:00 AM")
                                  }}
                                >
                                  <Edit3 className="h-3.5 w-3.5 sm:mr-1" />
                                  <span className="hidden sm:inline">Reschedule</span>
                                </Button>
                                <Button size="sm" variant="ghost" className="text-rose-400 hover:bg-rose-500/10 text-xs" onClick={() => handleCancelAppointment(apt.id)}>
                                  <XCircle className="h-3.5 w-3.5 sm:mr-1" />
                                  <span className="hidden sm:inline">Cancel</span>
                                </Button>
                              </>
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: DIGITAL PRESCRIPTIONS */}
          <TabsContent value="prescriptions">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Pill className="h-5 w-5 text-purple-400" />
                    My Digital Prescriptions & Clinical Records
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">Official Gonstead prescriptions & treatment protocols created by Dr. Bashir Khan.</CardDescription>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <Input
                    value={prescriptionSearch}
                    onChange={(e) => setPrescriptionSearch(e.target.value)}
                    placeholder="Search prescription..."
                    className="pl-9 bg-slate-950 border-slate-800 text-xs text-white"
                  />
                </div>
              </CardHeader>

              <CardContent>
                {isLoadingPrescriptions ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-purple-400" />
                    <p className="text-xs">Loading digital prescriptions from Firestore...</p>
                  </div>
                ) : filteredPrescriptions.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl p-6">
                    <FileCheck className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-300">No prescriptions on record</p>
                    <p className="text-xs text-slate-500 mt-1">Prescriptions issued by Dr. Bashir Khan during clinic visits will appear here automatically.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPrescriptions.map((rx) => (
                      <div key={rx.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-[10px]">Rx #{rx.id}</Badge>
                            <span className="text-[11px] text-slate-400">{rx.visit_date ? new Date(rx.visit_date).toLocaleDateString() : rx.created_at?.split("T")[0]}</span>
                          </div>
                          <span className="text-xs font-semibold text-emerald-400">{rx.payment_status || "Completed"}</span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white">Diagnosis / Protocol</h4>
                          <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">{rx.treatment_plan || "Gonstead Spinal Adjustment Routine"}</p>
                        </div>

                        {rx.prescribed_medicine && (
                          <div>
                            <h4 className="text-xs font-semibold text-purple-300">Prescribed Medicine / Supplements:</h4>
                            <p className="text-xs text-slate-400 mt-0.5 italic">{rx.prescribed_medicine}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                          <span className="text-slate-400">Total Sessions: <strong className="text-white">{rx.total_sessions || "1"}</strong></span>
                          <Button size="sm" onClick={() => setSelectedPrescription(rx)} className="bg-purple-600 hover:bg-purple-700 text-white text-xs">
                            <Printer className="h-3.5 w-3.5 mr-1" /> View & Print Rx
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: REHAB & CARE TRACKER */}
          <TabsContent value="rehab">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#2a9d8f]" />
                    Daily Gonstead Spine Rehab & Home Exercises
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">Post-adjustment exercise library & hydrative disc management.</CardDescription>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-emerald-400">{Math.round((completedRehabCount / rehabTasks.length) * 100)}%</span>
                  <p className="text-[10px] text-slate-500">Daily Completion</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {rehabTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => toggleRehabTask(t.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      t.done ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200" : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {t.done ? <CheckSquare className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" /> : <Square className="h-5 w-5 text-slate-600 mt-0.5 flex-shrink-0" />}
                      <div>
                        <span className={`text-xs font-bold ${t.done ? "line-through opacity-80" : "text-white"}`}>{t.title}</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">{t.desc}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-slate-800 text-slate-400 text-[10px] flex-shrink-0">{t.region}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: PRE-VISIT SYMPTOM INTAKE */}
          <TabsContent value="symptoms">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-[#2a9d8f]" />
                  Pre-Visit Pain Rating & Symptom Intake
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">Log pain scale so Dr. Bashir Khan can prepare your spinal adjustment before arrival.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogSymptomSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-white text-xs font-semibold">Pain Scale Rating (1 to 10)</Label>
                      <Badge className="bg-[#2a9d8f] text-white text-xs font-bold">{painLevel} / 10</Badge>
                    </div>
                    <div className="grid grid-cols-10 gap-1 pt-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPainLevel(num)}
                          className={`py-2 rounded font-bold text-xs transition-all ${
                            painLevel === num
                              ? num > 7
                                ? "bg-rose-600 text-white"
                                : num > 4
                                ? "bg-amber-500 text-white"
                                : "bg-emerald-500 text-white"
                              : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white text-xs font-semibold">Primary Affected Spine Region</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {["Lumbar Spine (L4-L5 Lower Back)", "Cervical Spine (Neck & Shoulders)", "Thoracic Spine (Mid Back)", "Sciatica & SI Joint"].map((reg) => (
                        <button
                          key={reg}
                          type="button"
                          onClick={() => setAffectedRegion(reg)}
                          className={`p-2.5 text-left text-xs rounded-lg border transition-all ${
                            affectedRegion === reg ? "bg-[#2a9d8f]/20 border-[#2a9d8f] text-white font-semibold" : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {reg}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white text-xs font-semibold">Aggravating Factors & Notes</Label>
                    <Input
                      value={symptomDescription}
                      onChange={(e) => setSymptomDescription(e.target.value)}
                      placeholder="e.g., stiffness in morning, pain radiates down leg..."
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                    />
                  </div>

                  <Button type="submit" disabled={isLoggingSymptom} className="w-full bg-[#2a9d8f] hover:bg-[#238a7a] text-white text-xs font-semibold py-2.5">
                    {isLoggingSymptom ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
                    <span>Forward Pre-Visit Note to Dr. Bashir Khan</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: CLINICAL NOTES & SPINE RECORDS */}
          <TabsContent value="records">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#2a9d8f]" />
                  Spinal Subluxation & Evaluation History
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">Recorded clinical assessments from your Gonstead spinal examinations.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {appointments.length > 0 && appointments[0].notes ? (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">Active Clinical Record</Badge>
                      <span className="text-xs text-slate-400">Dr. Bashir Khan</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{appointments[0].notes}</p>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">Active Gonstead Care</Badge>
                      <span className="text-xs text-slate-400">Dr. Bashir Khan</span>
                    </div>
                    <h3 className="font-bold text-white text-sm">Full-Spine Gonstead Analysis</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Precision examination of temperature differentials, instrumentation, static palpation, motion palpation, and full-spine X-rays to locate primary vertebral subluxations.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 6: MY PROFILE MANAGEMENT */}
          <TabsContent value="profile">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-[#2a9d8f]" />
                    Patient Account & Profile Management
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">Manage your patient credentials and contact information in Firestore.</CardDescription>
                </div>
                <Button onClick={() => setIsEditProfileOpen(true)} size="sm" className="bg-[#2a9d8f] hover:bg-[#238a7a] text-white text-xs">
                  <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit Profile
                </Button>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500">Full Name</span>
                  <p className="text-sm font-bold text-white mt-0.5">{patientName}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500">Registered Email</span>
                  <p className="text-sm font-bold text-white mt-0.5">{patientEmail || "Not Provided"}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500">Phone Number</span>
                  <p className="text-sm font-bold text-white mt-0.5">{patientPhone || "Not Provided"}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500">Date of Birth / Gender</span>
                  <p className="text-sm font-bold text-white mt-0.5">{editDob || "N/A"} ({editGender})</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500">Emergency Contact</span>
                  <p className="text-sm font-bold text-white mt-0.5">{editEmergency || "Not Provided"}</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-500">Clinic Address / City</span>
                  <p className="text-sm font-bold text-white mt-0.5">{editAddress || "Nowshera, KPK"}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* EDIT PROFILE DIALOG */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <User className="h-5 w-5 text-[#2a9d8f]" /> Update Patient Profile
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs pt-2">
            <div>
              <Label className="text-slate-300">Full Name *</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-slate-950 border-slate-800 text-white text-xs mt-1" />
            </div>
            <div>
              <Label className="text-slate-300">Phone Number *</Label>
              <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="bg-slate-950 border-slate-800 text-white text-xs mt-1" />
            </div>
            <div>
              <Label className="text-slate-300">Email Address *</Label>
              <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="bg-slate-950 border-slate-800 text-white text-xs mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-slate-300">Date of Birth</Label>
                <Input type="date" value={editDob} onChange={(e) => setEditDob(e.target.value)} className="bg-slate-950 border-slate-800 text-white text-xs mt-1" />
              </div>
              <div>
                <Label className="text-slate-300">Gender</Label>
                <select value={editGender} onChange={(e) => setEditGender(e.target.value)} className="w-full h-9 bg-slate-950 border border-slate-800 rounded-md text-white text-xs px-2 mt-1">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <Label className="text-slate-300">Emergency Contact Phone</Label>
              <Input value={editEmergency} onChange={(e) => setEditEmergency(e.target.value)} placeholder="+923001234567" className="bg-slate-950 border-slate-800 text-white text-xs mt-1" />
            </div>
            <div>
              <Label className="text-slate-300">Address / City</Label>
              <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="Tehsil Road, Nowshera" className="bg-slate-950 border-slate-800 text-white text-xs mt-1" />
            </div>

            <Button onClick={handleSaveProfile} disabled={isSavingProfile} className="w-full bg-[#2a9d8f] hover:bg-[#238a7a] text-white font-semibold py-2">
              {isSavingProfile ? "Saving to Firestore..." : "Save Profile Updates"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* VIEW & PRINT DIGITAL PRESCRIPTION MODAL */}
      <Dialog open={!!selectedPrescription} onOpenChange={(open) => !open && setSelectedPrescription(null)}>
        <DialogContent className="bg-white text-slate-900 max-w-lg p-6 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-center font-bold text-lg text-[#173e4d] flex items-center justify-center gap-2">
              <Stethoscope className="h-6 w-6 text-[#2a9d8f]" />
              Gonstead Chiropractic Clinic
            </DialogTitle>
            <p className="text-center text-xs text-slate-500">Official Digital Prescription & Care Plan</p>
          </DialogHeader>

          {selectedPrescription && (
            <div className="space-y-3 my-2 text-xs border-y py-4 border-slate-200">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-600">Prescription ID:</span>
                <span className="font-mono text-slate-900 font-bold">#{selectedPrescription.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-600">Patient Name:</span>
                <span className="font-bold text-slate-900">{selectedPrescription.patient_name || patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-600">Visit Date:</span>
                <span className="font-bold text-[#2a9d8f]">
                  {selectedPrescription.visit_date ? new Date(selectedPrescription.visit_date).toLocaleDateString() : "Recent"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-600">Attending Specialist:</span>
                <span className="font-bold text-slate-900">{selectedPrescription.doctor_name || "Dr. Bashir Khan"}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <p className="font-bold text-slate-800">Treatment Plan / Protocol:</p>
                <p className="text-slate-700">{selectedPrescription.treatment_plan || "Full-spine Gonstead adjusting protocol"}</p>
              </div>

              {selectedPrescription.prescribed_medicine && (
                <div className="p-3 bg-purple-50 rounded-xl space-y-1">
                  <p className="font-bold text-purple-900">Prescribed Medicine / Supplements:</p>
                  <p className="text-purple-800">{selectedPrescription.prescribed_medicine}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={() => window.print()} className="w-full bg-[#2a9d8f] hover:bg-[#238a7a] text-white">
              <Printer className="h-4 w-4 mr-2" /> Print / Save PDF
            </Button>
            <Button onClick={() => setSelectedPrescription(null)} variant="outline" className="border-slate-300 text-slate-700">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* RESCHEDULE DIALOG */}
      <Dialog open={!!rescheduleApt} onOpenChange={(open) => !open && setRescheduleApt(null)}>
        <DialogContent className="bg-slate-900 border-slate-800 text-slate-100 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#2a9d8f]" /> Reschedule Adjustment Visit
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs pt-2">
            <div>
              <Label className="text-slate-300">Select New Date *</Label>
              <Input type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} className="bg-slate-950 border-slate-800 text-white text-xs mt-1" />
            </div>
            <div>
              <Label className="text-slate-300">Select Preferred Time *</Label>
              <Input type="text" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)} placeholder="10:00 AM" className="bg-slate-950 border-slate-800 text-white text-xs mt-1" />
            </div>
            <Button onClick={handleSaveReschedule} disabled={isUpdatingApt} className="w-full bg-[#2a9d8f] hover:bg-[#238a7a] text-white font-semibold">
              {isUpdatingApt ? "Updating Date..." : "Confirm Reschedule"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* FULL APPOINTMENT CONFIRMATION SLIP & PDF DOWNLOAD DIALOG */}
      <Dialog open={!!printSlipApt || !!viewConfirmationApt} onOpenChange={(open) => {
        if (!open) {
          setPrintSlipApt(null)
          setViewConfirmationApt(null)
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-950 border-2 border-slate-700 text-slate-100 p-3 sm:p-6 pb-24 shadow-2xl rounded-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Appointment Confirmation Slip & PDF Download</DialogTitle>
          </DialogHeader>
          {(viewConfirmationApt || printSlipApt) && (
            <AppointmentConfirmation
              appointmentData={{
                name: patientName,
                phone: patientPhone,
                sessionType: (viewConfirmationApt || printSlipApt)?.session_type || "in_clinic",
                preferredTime: (viewConfirmationApt || printSlipApt)?.appointment_date || new Date().toISOString(),
                profession: (viewConfirmationApt || printSlipApt)?.demographics?.occupation || "",
                appointmentId: (viewConfirmationApt || printSlipApt)?.id
              }}
              onBackToHome={() => {
                setPrintSlipApt(null)
                setViewConfirmationApt(null)
              }}
              onNewAppointment={() => {
                setPrintSlipApt(null)
                setViewConfirmationApt(null)
                setIsBookModalOpen(true)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* QUICK BOOKING DIALOG */}
      <Dialog open={isBookModalOpen} onOpenChange={setIsBookModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800 text-slate-100 p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-[#2a9d8f]" /> Schedule Gonstead Appointment
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <EnhancedAppointmentBooking />
          </div>
        </DialogContent>
      </Dialog>

      {/* REAL-TIME 1-ON-1 PATIENT-DOCTOR CHAT WIDGET */}
      <PatientChatWidget
        patientId={patientUid || patientEmail || patientPhone || "patient_guest"}
        patientName={patientName}
        patientEmail={patientEmail}
        patientPhone={patientPhone}
      />
    </div>
  )
}
