"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import {
  CheckCircle2,
  Calendar,
  Clock,
  Phone,
  User,
  FileText,
  Heart,
  Star,
  Stethoscope,
  Camera,
  Download,
  FileDown,
  Printer,
  AlertCircle
} from "lucide-react"
import { useLanguage } from "./language-provider"
import { getPatients, subscribeToPatients } from "@/lib/data-service"

interface AppointmentConfirmationProps {
  appointmentData: {
    name: string
    phone: string
    sessionType: string
    preferredTime: string
    profession?: string
    appointmentId?: string
  }
  onBackToHome?: () => void
  onNewAppointment?: () => void
}

export function AppointmentConfirmation({
  appointmentData,
  onBackToHome,
  onNewAppointment
}: AppointmentConfirmationProps) {
  const { language } = useLanguage()
  const [autoDownloadAttempted, setAutoDownloadAttempted] = useState(false)
  const [isAutoDownloading, setIsAutoDownloading] = useState(false)
  const [downloadStatus, setDownloadStatus] = useState<'pending' | 'success' | 'failed' | null>(null)
  const [patientsAhead, setPatientsAhead] = useState<number | null>(null)
  const [userTokenNumber, setUserTokenNumber] = useState<number | null>(null)
  const [nowServingToken, setNowServingToken] = useState<number | null>(null)
  const [isQueueLoading, setIsQueueLoading] = useState(false)
  const [queueError, setQueueError] = useState<string | null>(null)

  const isUrdu = language === "ur"
  const estimatedWaitMinutes = patientsAhead !== null ? patientsAhead * 15 : null

  const downloadPDF = async (isAutoDownload = false) => {
    try {
      if (isAutoDownload) {
        setIsAutoDownloading(true)
        setDownloadStatus('pending')
      }

      const element = document.getElementById('appointment-confirmation-content')
      if (!element) {
        if (isAutoDownload) {
          setDownloadStatus('failed')
          setIsAutoDownloading(false)
        }
        return
      }

      // Clone element for clean PDF capture
      const elementClone = element.cloneNode(true) as HTMLElement

      // Mask doctor phone if needed
      const doctorPhoneElements = elementClone.querySelectorAll('[data-doctor-phone]')
      doctorPhoneElements.forEach(phoneEl => {
        if (phoneEl.textContent) {
          phoneEl.textContent = '+92 30X XXXX XXX'
        }
      })

      // Remove ALL action buttons and status banners from clone for clean PDF export
      const noPrintElements = elementClone.querySelectorAll('.no-print-action')
      noPrintElements.forEach(el => {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el)
        }
      })

      elementClone.style.position = 'absolute'
      elementClone.style.left = '-9999px'
      elementClone.style.top = '0'
      elementClone.style.width = '800px'
      elementClone.style.padding = '16px'
      elementClone.style.backgroundColor = '#ffffff'
      elementClone.style.fontFamily = 'Arial, sans-serif'

      document.body.appendChild(elementClone)

      const canvas = await html2canvas(elementClone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: elementClone.scrollHeight,
        logging: false
      })

      document.body.removeChild(elementClone)

      const imgData = canvas.toDataURL('image/png', 0.95)
      const pdf = new jsPDF('p', 'mm', 'a4')

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgAspectRatio = canvas.height / canvas.width

      // Maximize printable width to 204mm (out of 210mm A4 width) for full edge-to-edge fit
      const maxWidth = pdfWidth - 6
      const maxHeight = pdfHeight - 6

      let finalWidth = maxWidth
      let finalHeight = maxWidth * imgAspectRatio

      if (finalHeight > maxHeight) {
        finalHeight = maxHeight
        finalWidth = finalHeight / imgAspectRatio
      }

      const xOffset = (pdfWidth - finalWidth) / 2
      const yOffset = (pdfHeight - finalHeight) / 2

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight)

      const fileName = `appointment-confirmation-${appointmentData.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)

      if (isAutoDownload) {
        setDownloadStatus('success')
        setIsAutoDownloading(false)
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      if (isAutoDownload) {
        setDownloadStatus('failed')
        setIsAutoDownloading(false)
      } else {
        alert(isUrdu ? 'PDF بناتے وقت خرابی ہوئی' : 'Error generating PDF')
      }
    }
  }

  useEffect(() => {
    if (!autoDownloadAttempted) {
      const timer = setTimeout(() => {
        setAutoDownloadAttempted(true)
        downloadPDF(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [autoDownloadAttempted])

  useEffect(() => {
    const apptDate = new Date(appointmentData.preferredTime)
    if (!appointmentData.preferredTime || Number.isNaN(apptDate.getTime())) {
      setPatientsAhead(null)
      setUserTokenNumber(null)
      setNowServingToken(null)
      return
    }

    let isActive = true
    setIsQueueLoading(true)
    setQueueError(null)

    const startOfDay = new Date(apptDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(apptDate)
    endOfDay.setHours(23, 59, 59, 999)

    const fetchQueuePosition = async () => {
      try {
        const { data: allPatients } = await getPatients()
        if (!isActive) return

        const targetTime = apptDate.getTime()
        
        // Filter patients for today (excluding cancelled)
        const todayPatients = allPatients
          .filter((p) => {
            const pTime = new Date(p.appointment_date).getTime()
            return !isNaN(pTime) && pTime >= startOfDay.getTime() && pTime <= endOfDay.getTime() && p.status !== "cancelled"
          })
          .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime() || new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

        const currentPhoneClean = appointmentData.phone?.replace(/\D/g, "")
        const currentNameClean = appointmentData.name?.toLowerCase().trim()
        const currentApptId = appointmentData.appointmentId

        let foundIdx = todayPatients.findIndex(p =>
          (currentApptId && p.id === currentApptId) ||
          (currentPhoneClean && p.phone?.replace(/\D/g, "") === currentPhoneClean) ||
          (currentNameClean && p.name?.toLowerCase().trim() === currentNameClean)
        )

        if (foundIdx === -1) {
          foundIdx = todayPatients.filter(p => new Date(p.appointment_date).getTime() < targetTime).length
        }

        const assignedToken = foundIdx >= 0 ? foundIdx + 1 : Math.max(1, todayPatients.length)
        const completedCount = todayPatients.filter(p => p.status === "completed").length
        const servingToken = Math.min(completedCount + 1, todayPatients.length || 1)
        const patientsBeforeCount = Math.max(0, assignedToken - servingToken)

        setUserTokenNumber(assignedToken)
        setNowServingToken(servingToken)
        setPatientsAhead(patientsBeforeCount)
        setQueueError(null)
      } catch (err: any) {
        if (!isActive) return
        setQueueError(err?.message || "Could not load queue status")
        setPatientsAhead(null)
      } finally {
        if (isActive) setIsQueueLoading(false)
      }
    }

    fetchQueuePosition()

    const unsubscribe = subscribeToPatients(() => fetchQueuePosition())

    return () => {
      isActive = false
      unsubscribe()
    }
  }, [appointmentData.preferredTime, appointmentData.appointmentId, appointmentData.phone])

  const handlePrint = () => {
    window.print()
  }

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return ""
    const date = new Date(dateTime)
    return date.toLocaleString(isUrdu ? 'ur-PK' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const sessionTypeDisplay = {
    clinic: {
      en: "In-clinic Gonstead Adjustment",
      ur: "کلینک میں گونسٹیڈ ایڈجسٹمنٹ"
    },
    in_clinic: {
      en: "In-clinic Gonstead Adjustment",
      ur: "کلینک میں گونسٹیڈ ایڈجسٹمنٹ"
    },
    video: {
      en: "Emergency Video Consultation",
      ur: "ایمرجنسی ویڈیو مشاورت"
    }
  }

  return (
    <div className="w-full bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-2 sm:p-4 pb-12 sm:pb-16">
      <div className="max-w-5xl mx-auto space-y-3 sm:space-y-4">

        {/* Auto-Download Status Banner */}
        {(isAutoDownloading || downloadStatus) && (
          <div className="no-print-action">
            <Card className={`border-2 ${downloadStatus === 'success'
              ? 'border-green-400 bg-green-50'
              : downloadStatus === 'failed'
                ? 'border-red-400 bg-red-50'
                : 'border-blue-400 bg-blue-50'
              }`}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                  <div className="flex items-center gap-3">
                    {isAutoDownloading ? (
                      <>
                        <Download className="h-4 w-4 text-blue-600 animate-spin" />
                        <div>
                          <p className="font-semibold text-blue-800">
                            {isUrdu ? "📄 آٹو ڈاؤن لوڈ جاری ہے..." : "📄 Auto-downloading your confirmation..."}
                          </p>
                          <p className="text-xs text-blue-600">
                            {isUrdu ? "آپ کی تصدیقی دستاویز خودکار طور پر ڈاؤن لوڈ ہو رہی ہے" : "Your appointment confirmation is being downloaded automatically"}
                          </p>
                        </div>
                      </>
                    ) : downloadStatus === 'success' ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-800">
                            {isUrdu ? "✅ ڈاؤن لوڈ مکمل!" : "✅ Download Complete!"}
                          </p>
                          <p className="text-xs text-green-600">
                            {isUrdu ? "آپ کی تصدیقی دستاویز کامیابی سے ڈاؤن لوڈ ہو گئی ہے" : "Your appointment confirmation has been downloaded successfully"}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="font-semibold text-red-800">
                            {isUrdu ? "⚠️ آٹو ڈاؤن لوڈ ناکام" : "⚠️ Auto-download Failed"}
                          </p>
                          <p className="text-xs text-red-600">
                            {isUrdu ? "دستی ڈاؤن لوڈ بٹن استعمال کریں" : "Please use the manual download button below"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  {downloadStatus && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDownloadStatus(null)}
                      className="h-7 w-7 p-0 hover:bg-white/50"
                    >
                      ✕
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <style jsx global>{`
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
            }
            
            #appointment-confirmation-content {
              max-width: 100% !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 10px !important;
              box-shadow: none !important;
              border: none !important;
              page-break-inside: avoid;
              transform: none !important;
              position: relative !important;
            }
            
            .appointment-card-hover {
              box-shadow: none !important;
              border: 1px solid #e5e7eb !important;
            }
            
            .grid {
              gap: 0.5rem !important;
            }
            
            .space-y-4 > * + *, .space-y-6 > * + * {
              margin-top: 0.5rem !important;
            }
            
            .p-6, .p-8 {
              padding: 0.75rem !important;
            }
            
            .mb-4, .mb-6 {
              margin-bottom: 0.5rem !important;
            }

            .no-print-action {
              display: none !important;
            }
            
            @page {
              size: A4 portrait;
              margin: 6mm;
            }
          }
        `}</style>

        <div id="appointment-confirmation-content" className="space-y-2.5 sm:space-y-3">
          {/* Unified Success Header with Appointment Details */}
          <Card className="border-2 border-green-600 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl appointment-card-hover rounded-xl">
            <CardContent className="text-center p-3 sm:p-4 md:p-4.5">

              {/* Logo Section */}
              <div className="flex justify-center mb-1.5 sm:mb-2">
                <div className="relative">
                  <img
                    src="/images/gonstead-logo-new.png"
                    alt="Gonstead Chiropractic Center Logo"
                    className="h-11 w-11 sm:h-13 sm:w-13 object-contain drop-shadow-md"
                  />
                  <div className="absolute -top-1 -right-1 h-3 w-3 sm:h-3.5 sm:w-3.5 bg-green-400 rounded-full animate-ping"></div>
                </div>
              </div>

              {/* Main Title */}
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-green-700 mb-1 font-poppins leading-tight px-2">
                {isUrdu ? "آپ کی ملاقات کی بکنگ مکمل ہو گئی!" : "Your Appointment Reservation Confirmed"}
              </h1>

              {/* Subtitle */}
              <p className="text-green-600 text-xs sm:text-xs mb-2 px-2 leading-tight max-w-xl mx-auto">
                {isUrdu
                  ? "گونستیڈ کائروپریکٹک سینٹر میں آپ کے پیشہ ورانہ علاج کی بکنگ کے لیے آپ کا بہت شکریہ"
                  : "We extend our sincere appreciation for scheduling your professional treatment session at Gonstead Chiropractic Center"
                }
              </p>

              {/* Appointment ID Badge */}
              <div className="inline-flex items-center justify-center mb-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800 px-2.5 py-1 text-xs">
                  <Star className="h-3 w-3 mr-1 text-green-600" />
                  <span className="font-semibold">
                    {isUrdu ? `آپ کا اپائنٹمنٹ نمبر: #${appointmentData.appointmentId || `APT${Date.now().toString().slice(-6)}`}` : `Your Appointment ID: #${appointmentData.appointmentId || `APT${Date.now().toString().slice(-6)}`}`}
                  </span>
                </Badge>
              </div>

              {/* Live Queue Position Box */}
              <div className="max-w-xl mx-auto mb-2">
                <div className="rounded-xl border-2 border-emerald-400 bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 p-3 sm:p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2 border-b border-emerald-200 pb-2.5 mb-2.5 flex-wrap sm:flex-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-emerald-900 leading-normal whitespace-nowrap">
                        {isUrdu ? "لائیو کلینک قطار ٹریکر" : "Live Clinic Queue Tracker"}
                      </h3>
                    </div>
                    <span className="inline-flex items-center justify-center border-2 border-emerald-500 text-emerald-800 bg-white text-[11px] sm:text-xs font-bold shrink-0 whitespace-nowrap px-3.5 h-6.5 sm:h-7 rounded-full shadow-2xs leading-none -translate-y-[5px] pb-2.5">
                      {isUrdu ? "ریئل ٹائم سنک" : "Real-time Sync"}
                    </span>
                  </div>

                  {isQueueLoading ? (
                    <p className="text-xs sm:text-sm text-emerald-900 font-semibold text-center py-1">
                      {isUrdu ? "قطار کی پوزیشن لوڈ ہو رہی ہے..." : "Calculating live queue position..."}
                    </p>
                  ) : queueError ? (
                    <p className="text-xs sm:text-sm text-emerald-800 font-semibold text-center py-1">
                      {isUrdu ? "آن شیڈول وزٹ" : "On-Schedule Visit"}
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                        <p className="text-[10px] uppercase font-bold text-emerald-700">{isUrdu ? "آپ کا ٹوکن" : "Your Token"}</p>
                        <p className="text-base sm:text-lg font-black text-emerald-900">#{userTokenNumber ?? 1}</p>
                      </div>

                      <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                        <p className="text-[10px] uppercase font-bold text-emerald-700">{isUrdu ? "ابھی جاری" : "Now Serving"}</p>
                        <p className="text-base sm:text-lg font-black text-blue-700">Token #{nowServingToken ?? 1}</p>
                      </div>

                      <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                        <p className="text-[10px] uppercase font-bold text-emerald-700">{isUrdu ? "پیشگی مریض" : "Patients Ahead"}</p>
                        <p className="text-base sm:text-lg font-black text-amber-700">{patientsAhead ?? 0}</p>
                      </div>

                      <div className="bg-white/80 p-2 rounded-lg border border-emerald-200">
                        <p className="text-[10px] uppercase font-bold text-emerald-700">{isUrdu ? "متوقع انتظار" : "Est. Wait"}</p>
                        <p className="text-base sm:text-lg font-black text-emerald-800">~{estimatedWaitMinutes ?? 0}m</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Appointment Details Grid */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-2.5 sm:p-3 rounded-lg border border-green-200 mt-2 text-left">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <Calendar className="h-3.5 w-3.5 text-green-600" />
                  <h2 className="text-xs sm:text-sm font-semibold text-green-800 text-center">
                    {isUrdu ? "ملاقات کی تفصیلات اور قبل از آمد کی ہدایات" : "Appointment Information & Pre-Visit Guidelines"}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 bg-white/60 rounded-lg border border-green-200">
                    <User className="h-3.5 w-3.5 text-green-700 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-green-600 uppercase font-semibold">{isUrdu ? "مریض کا نام" : "Patient Name"}</p>
                      <p className="font-bold text-green-900 text-xs">{appointmentData.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-white/60 rounded-lg border border-green-200">
                    <Phone className="h-3.5 w-3.5 text-green-700 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-green-600 uppercase font-semibold">{isUrdu ? "فون نمبر" : "Phone Number"}</p>
                      <p className="font-bold text-green-900 text-xs">{appointmentData.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-white/60 rounded-lg border border-green-200">
                    <Stethoscope className="h-3.5 w-3.5 text-green-700 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-green-600 uppercase font-semibold">{isUrdu ? "سیشن کی قسم" : "Session Type"}</p>
                      <p className="font-bold text-green-900 text-xs">
                        {sessionTypeDisplay[appointmentData.sessionType as keyof typeof sessionTypeDisplay]?.[isUrdu ? 'ur' : 'en'] || "Gonstead Adjustment"}
                      </p>
                    </div>
                  </div>

                  {appointmentData.preferredTime && (
                    <div className="flex items-center gap-2 p-2 bg-white/60 rounded-lg border border-green-200">
                      <Clock className="h-3.5 w-3.5 text-green-700 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-green-600 uppercase font-semibold">{isUrdu ? "ترجیحی وقت" : "Scheduled Time"}</p>
                        <p className="font-bold text-green-900 text-xs">{formatDateTime(appointmentData.preferredTime)}</p>
                      </div>
                    </div>
                  )}

                  {appointmentData.profession && (
                    <div className="flex items-center gap-2 p-2 bg-white/60 rounded-lg border border-green-200 sm:col-span-2">
                      <FileText className="h-3.5 w-3.5 text-green-700 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-green-600 uppercase font-semibold">{isUrdu ? "پیشہ" : "Profession"}</p>
                        <p className="font-semibold text-green-900 text-xs">{appointmentData.profession}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="my-2 bg-green-300" />

                {/* Pre-Visit Instructions */}
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-2.5 rounded-lg border border-green-300">
                  <div className="mb-1.5">
                    <p className="text-green-800 font-semibold text-xs mb-0.5 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-green-700" />
                      {isUrdu ? "اہم ہدایات (براہ کرم ساتھ لائیں)" : "Important Pre-Visit Instructions"}
                    </p>
                    <p className="text-green-700 text-[11px] leading-tight">
                      {isUrdu
                        ? "مکمل تشخیصی عمل کے لیے متعلقہ ایکس رے اور رپورٹس ساتھ لائیں تاکہ ہمارے ڈاکٹر بہترین علاج فراہم کر سکیں۔"
                        : "Please bring relevant diagnostic records with you to assist our Gonstead specialist in optimal spinal care."
                      }
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 mt-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5 p-1.5 bg-white/60 rounded-lg border border-green-200">
                      <Camera className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                      <span className="font-medium text-green-900">{isUrdu ? "حالیہ ایکس رے / ایم آر آئی" : "Recent X-rays / MRI"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-1.5 bg-white/60 rounded-lg border border-green-200">
                      <FileText className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                      <span className="font-medium text-green-900">{isUrdu ? "میڈیکل رپورٹس" : "Diagnostic Reports"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-1.5 bg-white/60 rounded-lg border border-green-200">
                      <Stethoscope className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                      <span className="font-medium text-green-900">{isUrdu ? "علاج کی ہسٹری" : "Treatment History"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons Toolbar */}
          <div className="no-print-action grid grid-cols-2 sm:grid-cols-4 gap-2.5 px-1 pt-1">
            <Button
              onClick={onBackToHome}
              variant="outline"
              className="border-[#2a9d8f] text-[#2a9d8f] hover:bg-[#2a9d8f] hover:text-white py-2.5 text-xs font-semibold shadow-sm"
            >
              <Heart className="h-3.5 w-3.5 mr-1.5" />
              {isUrdu ? "ہوم پیج" : "Back to Home"}
            </Button>

            <Button
              onClick={onNewAppointment}
              className="bg-[#2a9d8f] hover:bg-[#238a7a] text-white py-2.5 text-xs font-semibold shadow-sm"
            >
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              {isUrdu ? "نئی اپائنٹمنٹ" : "New Booking"}
            </Button>

            <Button
              onClick={() => downloadPDF(false)}
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white py-2.5 text-xs font-semibold shadow-sm"
            >
              <FileDown className="h-3.5 w-3.5 mr-1.5" />
              {isUrdu ? "PDF ڈاؤن لوڈ" : "Download PDF"}
            </Button>

            <Button
              onClick={handlePrint}
              variant="outline"
              className="border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white py-2.5 text-xs font-semibold shadow-sm"
            >
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              {isUrdu ? "پرنٹ کیجیے" : "Print Slip"}
            </Button>
          </div>

          {/* Visible Clinic Footer Message Card - Positioned cleanly at the bottom */}
          <div className="mt-3 mb-4 pb-4">
            <Card className="border-2 border-emerald-500 bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 shadow-md rounded-xl">
              <CardContent className="text-center py-4 px-4 sm:px-6">
                <p className="text-emerald-900 text-xs sm:text-sm font-bold leading-normal m-0 p-0">
                  {isUrdu
                    ? "آپ کی ملاقات کی تصدیق کے لیے ہمارا عملہ جلد ہی آپ سے رابطہ کرے گا۔ گونستیڈ کائروپریکٹک سینٹر - ریڑھ کی ہڈی کی دیکھ بھال کے مختص ماہرین"
                    : "Our team will contact you promptly for confirmation. Gonstead Chiropractic Center - Dedicated Specialists in Spinal Care Excellence."
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
