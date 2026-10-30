"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Calendar as CalendarIcon, Video, CheckCircle, Loader2, Phone, MessageCircle, CreditCard, Clock, MapPin, AlertTriangle, Info, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useLanguage } from "./language-provider"
import { useToast } from "@/hooks/use-toast"
import { createPatient } from "@/lib/data-service"
import { notifyNewAppointment, showBrowserNotification, requestNotificationPermission } from "@/lib/whatsapp-notifications"
import { AppointmentConfirmation } from "./appointment-confirmation"

// Business logic constants
const BUSINESS_HOURS_START = 9 // 9:00 AM
const BUSINESS_HOURS_END = 18 // 6:00 PM
const APPOINTMENT_GAP_MINUTES = 40
const SLOT_DURATION_MINUTES = 30
const LUNCH_BREAK_START = 13 // 1:00 PM
const LUNCH_BREAK_END = 14 // 2:00 PM

// Types
interface TimeSlot {
  time: string
  datetime: string
  available: boolean
  booked?: boolean
}

interface BookedAppointment {
  datetime: string
  duration: number
  patientName?: string
}

// Bilingual Messages
const messages = {
  slotBooked: {
    en: "This appointment slot is already booked. Please choose a different time.",
    ur: "یہ وقت پہلے ہی کسی مریض کے لیے بک ہو چکا ہے۔ براہ کرم کوئی اور وقت منتخب کریں۔"
  },
  outsideHours: {
    en: "Selected time is outside business hours (9:00 AM - 6:00 PM).",
    ur: "منتخب کردہ وقت کلینک کے اوقات (صبح 9 بجے سے شام 6 بجے) سے باہر ہے۔"
  },
  tooClose: {
    en: "This time is too close to another appointment. Please select a time with at least 40 minutes gap.",
    ur: "یہ وقت دوسری اپائنٹمنٹ سے بہت قریب ہے۔ براہ کرم کم از کم 40 منٹ کا فرق رکھتے ہوئے وقت منتخب کریں۔"
  }
}

export function SmartAppointmentBooking() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    sessionType: "in_clinic" as "in_clinic" | "video",
    selectedDate: "",
    selectedTime: "",
    notes: "",
    paymentMethod: "cash" as "cash" | "jazzcash" | "easypaisa",
    urgency: "normal" as "normal" | "urgent" | "emergency",
    bookingType: "direct" as "direct" | "request",
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [appointmentId, setAppointmentId] = useState<string>("")
  const [isMounted, setIsMounted] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isSundaySelected, setIsSundaySelected] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [bookedAppointments, setBookedAppointments] = useState<BookedAppointment[]>([])
  const [validationError, setValidationError] = useState<string>("")
  const [smartSuggestions, setSmartSuggestions] = useState<Array<{
    time: string;
    datetime: string;
    date: string;
    dayName: string;
    timeDifference: string;
  }>>([])
  
  const { t, language } = useLanguage()
  const { toast } = useToast()

  // Generate time slots for a given date
  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = []
    
    if (date.getDay() === 0) { // Sunday
      return slots // Return empty array for Sunday
    }
    
    // Check if selected date is in the past
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()
    const currentHour = today.getHours()
    const currentMinute = today.getMinutes()
    
    const dateStr = date.toISOString().split('T')[0]
    
    for (let hour = BUSINESS_HOURS_START; hour < BUSINESS_HOURS_END; hour++) {
      // Skip lunch break
      if (hour >= LUNCH_BREAK_START && hour < LUNCH_BREAK_END) {
        continue
      }
      
      for (let minute = 0; minute < 60; minute += SLOT_DURATION_MINUTES) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const datetime = `${dateStr}T${timeStr}:00`
        const slotTime = new Date(datetime)
        
        // Skip past time slots for today
        if (isToday && (hour < currentHour || (hour === currentHour && minute <= currentMinute))) {
          continue
        }
        
        // Check if slot is available
        const isAvailable = isSlotAvailable(slotTime)
        
        slots.push({
          time: formatTimeDisplay(hour, minute),
          datetime,
          available: isAvailable,
          booked: !isAvailable
        })
      }
    }
    
    return slots
  }

  // Check if a time slot is available (considering 40-minute gap)
  const isSlotAvailable = (slotTime: Date): boolean => {
    for (const appointment of bookedAppointments) {
      const appointmentTime = new Date(appointment.datetime)
      const timeDifference = Math.abs(slotTime.getTime() - appointmentTime.getTime()) / (1000 * 60) // in minutes
      
      if (timeDifference < APPOINTMENT_GAP_MINUTES) {
        return false
      }
    }
    return true
  }

  // Format time for display (12-hour format with clear AM/PM)
  const formatTimeDisplay = (hour: number, minute: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
  }
  
  // Format date for professional display
  const formatDateDisplay = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }
  
  // Get booked appointment details for a specific time
  const getBookedAppointmentInfo = (datetime: string) => {
    const appointment = bookedAppointments.find(apt => apt.datetime === datetime)
    if (appointment && 'patientName' in appointment) {
      return (appointment as any).patientName
    }
    return null
  }

  // Get bilingual message
  const getMessage = (key: keyof typeof messages): string => {
    return messages[key][language as keyof typeof messages[keyof typeof messages]]
  }

  // Sunday detection
  const isSunday = (date: Date) => date.getDay() === 0
  const isToday = () => new Date().getDay() === 0

  // Load booked appointments (simulate API call with patient names)
  useEffect(() => {
    // Simulate fetching booked appointments from API with patient names
    const mockBookedAppointments: BookedAppointment[] = [
      { datetime: "2025-07-22T11:00:00", duration: 60, patientName: "Ahmad Hassan" },
      { datetime: "2025-07-22T14:30:00", duration: 45, patientName: "Fatima Ali" },
      { datetime: "2025-07-23T10:00:00", duration: 30, patientName: "Muhammad Khan" },
      { datetime: "2025-07-23T15:30:00", duration: 60, patientName: "Aisha Malik" },
    ]
    
    setBookedAppointments(mockBookedAppointments)
  }, [])

  // Generate slots when date changes
  useEffect(() => {
    if (selectedDate) {
      const slots = generateTimeSlots(selectedDate)
      setAvailableSlots(slots)
    }
  }, [selectedDate, bookedAppointments])

  useEffect(() => {
    setIsMounted(true)
    requestNotificationPermission()
  }, [])

  // Validate selected time
  const validateSelectedTime = (datetime: string): string => {
    if (!datetime) return ""
    
    const selectedTime = new Date(datetime)
    
    // Check if Sunday
    if (selectedTime.getDay() === 0) {
      return getMessage("slotBooked") // Use generic message for Sunday
    }
    
    // Check business hours
    const hour = selectedTime.getHours()
    if (hour < BUSINESS_HOURS_START || hour >= BUSINESS_HOURS_END) {
      return getMessage("outsideHours")
    }
    
    // Check if slot is available
    if (!isSlotAvailable(selectedTime)) {
      return getMessage("slotBooked")
    }
    
    return ""
  }

  const handleDateChange = (date: string) => {
    const newDate = new Date(date)
    setSelectedDate(newDate)
    setIsSundaySelected(isSunday(newDate))
    setFormData(prev => ({ ...prev, selectedDate: date, selectedTime: "" }))
    setValidationError("")
  }

  const handleTimeSelect = async (slot: TimeSlot) => {
    if (!slot.available) {
      setValidationError(getMessage("slotBooked"))
      // Fetch smart suggestions for this conflicted time
      await fetchSmartSuggestions(slot.datetime)
      return
    }
    
    setFormData(prev => ({ ...prev, selectedTime: slot.datetime }))
    setValidationError("")
    setSmartSuggestions([])
  }
  
  // Fetch smart suggestions from API
  const fetchSmartSuggestions = async (conflictedDateTime: string) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout for mobile
      
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'temp', // Temporary data for validation
          phone: '03001234567',
          appointment_date: conflictedDateTime,
        }),
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      const result = await response.json()
      
      if (!result.success && result.alternatives) {
        setSmartSuggestions(result.alternatives)
      }
    } catch (error) {
      console.error('Failed to fetch smart suggestions:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate phone number
      const cleanPhone = formData.phone.replace(/[\s-()]/g, '')
      const phoneRegex = /^(\+92|0)?3[0-9]{9}$|^(\+\d{1,3})?\d{10,14}$/
      if (!phoneRegex.test(cleanPhone)) {
        throw new Error(language === "ur" 
          ? "غلط فون نمبر - پاکستانی نمبر (03xxxxxxxxx) یا بین الاقوامی نمبر درج کریں" 
          : "Invalid phone number - Please enter Pakistani (03xxxxxxxxx) or international format")
      }

      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error(language === "ur" ? "نام درج کریں" : "Name is required")
      }

      if (!formData.selectedTime) {
        throw new Error(language === "ur" ? "تاریخ اور وقت منتخب کریں" : "Please select date and time")
      }

      // Final validation of selected time
      const timeValidationError = validateSelectedTime(formData.selectedTime)
      if (timeValidationError) {
        throw new Error(timeValidationError)
      }

      // Create patient record via API (uses admin client to bypass RLS)
      const patientData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        session_type: formData.sessionType,
        appointment_date: formData.selectedTime,
        urgency: formData.urgency,
        payment_method: formData.paymentMethod,
        notes: formData.notes,
      }

      // Retry logic for mobile networks with exponential backoff
      let appointmentId: string = ''
      let lastError: Error | null = null
      const maxRetries = 3
      
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const controller = new AbortController()
          const timeout = 15000 + (attempt * 5000) // Increase timeout on each retry: 15s, 20s, 25s
          const timeoutId = setTimeout(() => controller.abort(), timeout)
          
          const response = await fetch('/api/appointments', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'X-Retry-Attempt': String(attempt + 1),
            },
            body: JSON.stringify(patientData),
            signal: controller.signal,
          })
          
          clearTimeout(timeoutId)
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to book appointment')
          }

          const result = await response.json()
          appointmentId = result.id
          break // Success! Exit retry loop
          
        } catch (error: any) {
          lastError = error
          console.error(`Attempt ${attempt + 1}/${maxRetries} failed:`, error.message)
          
          // If this was the last attempt, throw the error
          if (attempt === maxRetries - 1) {
            if (error.name === 'AbortError') {
              throw new Error(language === "ur" 
                ? "نیٹ ورک ٹائم آؤٹ۔ براہ کرم اپنے انٹرنیٹ کنکشن کو چیک کریں اور دوبارہ کوشش کریں۔"
                : "Network timeout. Please check your internet connection and try again.")
            }
            throw error
          }
          
          // Wait before retrying (exponential backoff: 1s, 2s, 4s)
          const waitTime = Math.pow(2, attempt) * 1000
          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }
      
      if (!appointmentId) {
        throw lastError || new Error('Failed to create appointment')
      }

      // Save to local IndexedDB for offline access and sync
      try {
        const { localDB } = await import('@/lib/local-db')
        await localDB.savePatient({
          id: appointmentId,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          session_type: formData.sessionType,
          appointment_date: formData.selectedTime,
          status: 'pending',
          urgency: formData.urgency,
          payment_method: formData.paymentMethod,
          notes: formData.notes,
          sessions_completed: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        console.log('✅ Saved to local IndexedDB')
      } catch (localError) {
        console.warn('Failed to save to local cache:', localError)
      }

      setAppointmentId(appointmentId)
      setIsSubmitted(true)

      // Update booked appointments list
      setBookedAppointments(prev => [...prev, {
        datetime: formData.selectedTime,
        duration: 60 // Default duration
      }])

      // Notifications
      try {
        showBrowserNotification({
          patientName: formData.name,
          phone: formData.phone,
          email: formData.email,
          appointmentDate: formData.selectedTime,
          sessionType: formData.sessionType,
          urgency: formData.urgency,
          notes: formData.notes
        })
        
        const adminEvent = new CustomEvent('newAppointment', {
          detail: {
            id: appointmentId,
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            appointment_date: formData.selectedTime,
            session_type: formData.sessionType,
            status: "pending",
            urgency: formData.urgency,
            notes: formData.notes,
            sessions_completed: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        })
        window.dispatchEvent(adminEvent)
        
      } catch (error) {
        console.error('Notification error:', error)
      }

      toast({
        title: language === "ur" ? "اپائنٹمنٹ بک ہو گئی" : "Appointment Booked Successfully! 🎉",
        description: language === "ur" 
          ? "آپ کی اپائنٹمنٹ کامیابی سے بک ہو گئی" 
          : "Dr. Bashir has been notified via WhatsApp. You will receive confirmation shortly.",
      })

    } catch (error) {
      console.error("Booking error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"

      toast({
        title: language === "ur" ? "خرابی" : "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <AppointmentConfirmation 
        appointmentData={{
          name: formData.name,
          phone: formData.phone,
          sessionType: formData.sessionType,
          preferredTime: formData.selectedTime,
          appointmentId: appointmentId
        }}
        onBackToHome={() => {
          setIsSubmitted(false)
          setFormData({
            name: "",
            phone: "",
            email: "",
            sessionType: "in_clinic",
            selectedDate: "",
            selectedTime: "",
            notes: "",
            paymentMethod: "cash",
            urgency: "normal",
            bookingType: "direct",
          })
        }}
        onNewAppointment={() => {
          setIsSubmitted(false)
          setFormData({
            name: "",
            phone: "",
            email: "",
            sessionType: "in_clinic",
            selectedDate: "",
            selectedTime: "",
            notes: "",
            paymentMethod: "cash",
            urgency: "normal",
            bookingType: "direct",
          })
        }}
      />
    )
  }

  return (
    <Card className="border-4 border-[rgb(66,139,124)]/20 shadow-2xl bg-gradient-to-br from-white via-[rgb(66,139,124)]/5 to-[rgb(66,139,124)]/10 dark:from-gray-900 dark:to-gray-800 overflow-hidden relative">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[rgb(66,139,124)] rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-[rgb(76,157,144)] rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[rgb(56,137,124)] rounded-full blur-2xl animate-pulse animation-delay-2000"></div>
      </div>
      
      <CardHeader className="bg-gradient-to-r from-[rgb(66,139,124)] via-[rgb(76,157,144)] to-[rgb(66,139,124)] text-white p-4 md:p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-2 left-2 w-8 h-8 border-2 border-white/30 rotate-45 animate-pulse"></div>
            <div className="absolute top-4 right-4 w-6 h-6 border-2 border-white/20 rotate-12 animate-pulse animation-delay-1000"></div>
            <div className="absolute bottom-2 left-4 w-4 h-4 border-2 border-white/25 rotate-90 animate-pulse animation-delay-2000"></div>
            <div className="absolute bottom-4 right-2 w-10 h-10 border-2 border-white/15 rotate-180 animate-pulse animation-delay-3000"></div>
          </div>
          
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-lg animate-pulse"></div>
          <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-to-br from-white/15 to-transparent rounded-full blur-lg animate-pulse animation-delay-1000"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute -inset-2 bg-white/10 rounded-full animate-pulse"></div>
              <div className="absolute -inset-1 bg-white/5 rounded-full animate-pulse animation-delay-500"></div>
              
              <div className="w-12 h-12 md:w-16 md:h-16 relative bg-white/10 rounded-full p-2 backdrop-blur-sm">
                <img
                  src="/images/gonstead-logo-new.png"
                  alt="Gonstead Chiropractic Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse animation-delay-1000"></div>
            </div>
          </div>
          
          <CardTitle className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 text-white drop-shadow-lg tracking-wide">
            <span className="bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
              {language === "ur" ? "ذہین اپائنٹمنٹ بکنگ" : "Smart Appointment Booking"}
            </span>
          </CardTitle>
          
          <p className="text-white/80 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-light">
            {language === "ur" ? "40 منٹ کا فرق برقرار رکھتے ہوئے پیشہ ورانہ بکنگ" : "Professional Booking with 40-Minute Gap Enforcement"}
          </p>
          
          <div className="mt-4 p-3 bg-[rgb(227,252,236)] border border-[rgb(227,252,236)] rounded-lg backdrop-blur-sm">
            <div className="text-sm text-white">
              <strong>SMART SCHEDULING NOTICE</strong>
              <p className="mt-1">
                {language === "ur" 
                  ? "یہ سسٹم خود کار طریقے سے صرف دستیاب وقت دکھاتا ہے (صبح 9 - شام 6) اور اتوار کو بند رکھتا ہے۔" 
                  : "This system automatically shows only available slots (9 AM - 6 PM) and keeps Sundays closed."}
              </p>
              <p className="mt-1">
                <strong>{language === "ur" ? "کم از کم فرق:" : "Minimum Gap:"}</strong> 40 {language === "ur" ? "منٹ" : "minutes"} | 
                <strong> {language === "ur" ? "بند:" : "Closed:"}</strong> {language === "ur" ? "اتوار" : "Sundays"}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 md:p-8 relative z-10">
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          {/* Personal Information */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-lg md:text-xl font-semibold text-[rgb(66,139,124)] dark:text-[rgb(66,139,124)] border-b-2 border-[rgb(66,139,124)]/20 pb-3">
              {language === "ur" ? "ذاتی معلومات" : "Personal Information"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {language === "ur" ? "مکمل نام" : "Full Name"} *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={language === "ur" ? "اپنا مکمل نام درج کریں" : "Enter your full name"}
                  className="border-[rgb(66,139,124)]/30 focus:border-[rgb(66,139,124)] h-10 md:h-12 text-sm md:text-base"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {language === "ur" ? "فون نمبر" : "Phone Number"} *
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="03001234567"
                  className="border-[rgb(66,139,124)]/30 focus:border-[rgb(66,139,124)] h-10 md:h-12 text-sm md:text-base"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {language === "ur" ? "ای میل (اختیاری)" : "Email (Optional)"}
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder={language === "ur" ? "آپ کا ای میل ایڈریس" : "your.email@example.com"}
                className="border-[rgb(66,139,124)]/30 focus:border-[rgb(66,139,124)] focus:ring-[rgb(66,139,124)] h-10 md:h-12 text-sm md:text-base"
              />
            </div>
          </div>

          {/* Session Type */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-lg md:text-xl font-semibold text-[rgb(66,139,124)] dark:text-[rgb(66,139,124)] border-b-2 border-[rgb(66,139,124)]/20 pb-3">
              {language === "ur" ? "سیشن کی قسم" : "Session Type"} *
            </h3>
            <RadioGroup
              value={formData.sessionType}
              onValueChange={(value: "in_clinic" | "video") => setFormData((prev) => ({ ...prev, sessionType: value }))}
              className="space-y-3 md:space-y-4"
            >
              <div className="flex items-center space-x-4 p-4 md:p-6 border-2 border-[rgb(66,139,124)]/20 rounded-2xl hover:border-[rgb(66,139,124)]/50 hover:bg-[rgb(66,139,124)]/5 transition-all duration-300 cursor-pointer">
                <RadioGroupItem value="in_clinic" id="clinic" className="border-[rgb(50,106,122)] data-[state=checked]:bg-[rgb(50,106,122)] data-[state=checked]:border-[rgb(50,106,122)] text-[rgb(50,106,122)] w-5 h-5" />
                <Label htmlFor="clinic" className="flex items-center gap-3 md:gap-4 cursor-pointer flex-1">
                  <CalendarIcon className="h-6 w-6 md:h-8 md:w-8 text-[rgb(66,139,124)]" />
                  <div>
                    <div className="font-bold text-base md:text-lg text-gray-800 dark:text-gray-200">
                      {language === "ur" ? "کلینک میں گونسٹیڈ ایڈجسٹمنٹ" : "In-clinic Gonstead Adjustment"}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {language === "ur" ? "جدید مشینری کی مدد سے علاج" : "Advanced machine-assisted treatment"}
                    </div>
                    <div className="text-xs text-[rgb(66,139,124)] font-medium mt-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {language === "ur" ? "تحصیل روڈ، نوشہرہ" : "Tehsil Road, Nowshera"}
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-4 p-4 md:p-6 border-2 border-red-200 rounded-2xl hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-all duration-300 cursor-pointer">
                <RadioGroupItem value="video" id="video" className="border-[rgb(50,106,122)] data-[state=checked]:bg-[rgb(50,106,122)] data-[state=checked]:border-[rgb(50,106,122)] text-[rgb(50,106,122)] w-5 h-5" />
                <Label htmlFor="video" className="flex items-center gap-3 md:gap-4 cursor-pointer flex-1">
                  <Video className="h-6 w-6 md:h-8 md:w-8 text-red-500" />
                  <div>
                    <div className="font-bold text-base md:text-lg text-gray-800 dark:text-gray-200">
                      {language === "ur" ? "ایمرجنسی ویڈیو مشاورت" : "Emergency Video Consultation"}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {language === "ur" ? "فوری مدد - 15 منٹ تک" : "Immediate help - 15 minutes max"}
                    </div>
                    <div className="text-xs text-red-500 font-medium mt-1">
                      {language === "ur" ? "24/7 دستیاب" : "Available 24/7"}
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Smart Date & Time Selection */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-lg md:text-xl font-semibold text-[rgb(66,139,124)] dark:text-[rgb(66,139,124)] border-b-2 border-[rgb(66,139,124)]/20 pb-3">
              {language === "ur" ? "تاریخ اور وقت" : "Date & Time"} *
            </h3>

            {/* Date Selection */}
            <div className="space-y-3">
              <Label htmlFor="date" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {language === "ur" ? "تاریخ منتخب کریں" : "Select Date"}
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="border-[rgb(66,139,124)]/30 focus:border-[rgb(66,139,124)] h-10 md:h-12 text-sm md:text-base"
                min={new Date().toISOString().split('T')[0]}
                required
              />
              {isSundaySelected && (
                <p className="text-red-600 text-xs font-medium flex items-center gap-2">
                  <X className="h-4 w-4" />
                  {language === "ur" ? "اتوار منتخب کیا گیا - کلینک بند" : "Sunday selected - Clinic closed"}
                </p>
              )}
            </div>

            {/* Time Slot Selection */}
            {formData.selectedDate && !isSundaySelected && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {language === "ur" ? "دستیاب وقت منتخب کریں" : "Select Available Time"}
                </Label>
                
                {/* Error Message Display */}
                {validationError && (
                  <Alert className="border-2 border-red-500 bg-red-50 text-red-800">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <AlertDescription className="font-medium text-sm">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-red-600" />
                        <div>
                          <p className="font-bold mb-1">
                            {language === "ur" ? "⚠️ بکنگ کی خرابی" : "⚠️ Booking Error"}
                          </p>
                          <p>{validationError}</p>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Smart Time Suggestions */}
                {smartSuggestions.length > 0 && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <h4 className="text-lg font-bold text-blue-800">
                        {language === "ur" ? "🤖 ذہین تجاویز" : "🤖 Smart Suggestions"}
                      </h4>
                    </div>
                    <p className="text-sm text-blue-700 mb-3">
                      {language === "ur" 
                        ? "آپ کی پسندیدہ تاریخ اور وقت کے قریب یہ اوقات دستیاب ہیں:" 
                        : "Here are available times close to your preferred choice:"}
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      {smartSuggestions.map((suggestion, index) => (
                        <Button
                          key={suggestion.datetime}
                          type="button"
                          variant="outline"
                          className="p-4 h-auto text-left bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-400 transition-all duration-200"
                          onClick={() => {
                            // Parse the suggestion datetime and update form
                            const suggestionDate = new Date(suggestion.datetime)
                            const dateStr = suggestionDate.toISOString().split('T')[0]
                            const timeStr = suggestionDate.toTimeString().slice(0, 5)
                            
                            setFormData(prev => ({ 
                              ...prev, 
                              selectedDate: dateStr, 
                              selectedTime: suggestion.datetime 
                            }))
                            setSelectedDate(suggestionDate)
                            setValidationError("")
                            setSmartSuggestions([])
                          }}
                        >
                          <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-blue-800">
                                {suggestion.date}
                              </span>
                              <span className="text-lg font-bold text-green-600">
                                {suggestion.time}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {suggestion.timeDifference}
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span className="text-green-600 font-medium">
                                {language === "ur" ? "دستیاب" : "Available"}
                              </span>
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-blue-600">
                      {language === "ur" 
                        ? "کوئی بھی تجویز پر کلک کرکے اسے منتخب کریں" 
                        : "Click any suggestion to select it"}
                    </div>
                  </div>
                )}
                
                {/* Clinic Schedule Info */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <strong>{language === "ur" ? "کلینک کا شیڈول:" : "Clinic Schedule:"}</strong>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        {language === "ur" ? "صبح: 9:00 - 1:00" : "Morning: 9:00 AM - 1:00 PM"}
                      </span>
                      <span className="bg-[rgb(227,252,236)] text-green-800 px-2 py-1 rounded">
                        {language === "ur" ? "دوپہر کا وقفہ: 1:00 - 2:00" : "Lunch Break: 1:00 - 2:00 PM"}
                      </span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        {language === "ur" ? "شام: 2:00 - 6:00" : "Afternoon: 2:00 - 6:00 PM"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 max-h-80 overflow-y-auto">
                  {availableSlots.map((slot) => {
                    const bookedPatientName = getBookedAppointmentInfo(slot.datetime)
                    return (
                      <Button
                        key={slot.datetime}
                        type="button"
                        variant={formData.selectedTime === slot.datetime ? "default" : "outline"}
                        className={`p-4 h-auto text-left transition-all duration-300 transform hover:scale-105 ${
                          slot.available
                            ? formData.selectedTime === slot.datetime
                              ? "bg-[rgb(66,139,124)] text-white border-[rgb(66,139,124)] shadow-lg"
                              : "border-[rgb(66,139,124)]/30 hover:border-[rgb(66,139,124)] hover:bg-[rgb(66,139,124)]/5 hover:shadow-md"
                            : "bg-gradient-to-r from-red-50 to-red-100 text-red-700 cursor-not-allowed border-red-300 relative overflow-hidden"
                        }`}
                        onClick={() => handleTimeSelect(slot)}
                        disabled={!slot.available}
                      >
                        {/* Available Slot */}
                        {slot.available ? (
                          <div className="flex flex-col gap-2 w-full">
                            <div className="flex items-center gap-2">
                              <Clock className="h-5 w-5 text-[rgb(66,139,124)]" />
                              <span className="text-xl font-bold text-[rgb(66,139,124)]">
                                {slot.time}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm font-medium text-green-600">
                                {language === "ur" ? "✅ دستیاب" : "✅ Available"}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {language === "ur" ? "کلک کرکے منتخب کریں" : "Click to select"}
                            </div>
                          </div>
                        ) : (
                          /* Booked Slot */
                          <div className="flex flex-col gap-2 w-full relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 to-red-500/10 rounded animate-pulse"></div>
                            <div className="relative z-10">
                              <div className="flex items-center gap-2">
                                <X className="h-5 w-5 text-red-500" />
                                <span className="text-xl font-bold text-red-600">
                                  {slot.time}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                <span className="text-sm font-bold text-red-600">
                                  {language === "ur" ? "❌ بک شدہ" : "❌ Booked"}
                                </span>
                              </div>
                              {bookedPatientName && (
                                <div className="mt-2 p-2 bg-red-100/50 border border-red-200 rounded-md">
                                  <div className="text-xs font-medium text-red-700">
                                    {language === "ur" ? "مریض:" : "Patient:"}
                                  </div>
                                  <div className="text-sm font-bold text-red-800 truncate">
                                    {bookedPatientName}
                                  </div>
                                </div>
                              )}
                              <div className="text-xs text-red-500 mt-2">
                                {language === "ur" 
                                  ? "کلک کرکے متبادل وقت دیکھیں" 
                                  : "Click for alternative times"}
                              </div>
                            </div>
                          </div>
                        )}
                      </Button>
                    )
                  })}
                </div>
                
                {availableSlots.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    {language === "ur" ? "اس دن کے لیے کوئی دستیاب وقت نہیں" : "No available slots for this date"}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Urgency Level */}
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-lg md:text-xl font-semibold text-[rgb(66,139,124)] dark:text-[rgb(66,139,124)] border-b-2 border-[rgb(66,139,124)]/20 pb-3">
              {language === "ur" ? "فوریت کی سطح" : "Urgency Level"}
            </h3>
            <RadioGroup
              value={formData.urgency}
              onValueChange={(value: "normal" | "urgent" | "emergency") =>
                setFormData((prev) => ({ ...prev, urgency: value }))
              }
              className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4"
            >
              <div className="flex items-center space-x-3 p-3 md:p-4 border-2 border-gray-200 rounded-xl hover:border-[rgb(66,139,124)] transition-all">
                <RadioGroupItem value="normal" id="normal" className="border-[rgb(50,106,122)] data-[state=checked]:bg-[rgb(50,106,122)] data-[state=checked]:border-[rgb(50,106,122)] text-[rgb(50,106,122)]" />
                <Label htmlFor="normal" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                  <div>
                    <div className="font-medium text-sm md:text-base">{language === "ur" ? "عام" : "Normal"}</div>
                    <div className="text-xs text-gray-500">{language === "ur" ? "1-2 دن" : "1-2 days"}</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 md:p-4 border-2 border-[rgb(227,252,236)] rounded-xl hover:border-green-400 transition-all">
                <RadioGroupItem value="urgent" id="urgent" className="border-[rgb(50,106,122)] data-[state=checked]:bg-[rgb(50,106,122)] data-[state=checked]:border-[rgb(50,106,122)] text-[rgb(50,106,122)]" />
                <Label htmlFor="urgent" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                  <div>
                    <div className="font-medium text-sm md:text-base">{language === "ur" ? "فوری" : "Urgent"}</div>
                    <div className="text-xs text-gray-500">{language === "ur" ? "آج ہی" : "Same day"}</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 md:p-4 border-2 border-red-200 rounded-xl hover:border-red-400 transition-all">
                <RadioGroupItem value="emergency" id="emergency" className="border-[rgb(50,106,122)] data-[state=checked]:bg-[rgb(50,106,122)] data-[state=checked]:border-[rgb(50,106,122)] text-[rgb(50,106,122)]" />
                <Label htmlFor="emergency" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Clock className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                  <div>
                    <div className="font-medium text-sm md:text-base">
                      {language === "ur" ? "ایمرجنسی" : "Emergency"}
                    </div>
                    <div className="text-xs text-gray-500">{language === "ur" ? "فوری" : "Immediate"}</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {language === "ur" ? "اضافی معلومات" : "Additional Notes"}
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder={
                language === "ur"
                  ? "اپنی تکلیف، درد کی جگہ، یا خاص ضروریات بتائیں..."
                  : "Describe your pain, problem area, or specific requirements..."
              }
              className="border-[rgb(66,139,124)]/30 focus:border-[rgb(66,139,124)] focus:ring-[rgb(66,139,124)] min-h-[100px] md:min-h-[120px] text-sm md:text-base"
            />
          </div>

          <Button
            type="submit"
            className={`w-full font-bold py-4 md:py-6 text-base md:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${
              isSundaySelected || !formData.selectedTime || validationError
                ? 'bg-red-500 hover:bg-red-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[rgb(66,139,124)] to-[rgb(66,139,124)] hover:from-[rgb(66,139,124)] hover:to-[rgb(66,139,124)]'
            } text-white`}
            disabled={isSubmitting || isSundaySelected || !formData.selectedTime || !!validationError}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
                {language === "ur" ? "بک ہو رہا ہے..." : "Booking Appointment..."}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 md:h-6 md:w-6" />
                {language === "ur" ? "اپائنٹمنٹ بک کریں" : "Book Appointment"}
              </div>
            )}
          </Button>
        </form>
      </CardContent>
      
      {/* Enhanced CSS Animations */}
      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        
        .gradient-bg {
          background: linear-gradient(-45deg, #428b7c, #4c9d90, #428b7c, #66b3a7);
          background-size: 400% 400%;
          animation: gradient-shift 4s ease infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </Card>
  )
}
