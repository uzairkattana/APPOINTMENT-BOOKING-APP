import { type NextRequest, NextResponse } from "next/server"
import { createPatientFirestore, getPatientsFirestore, upsertAppointmentQueueFirestore } from "@/lib/firebase-db"

// Business hours constants
const BUSINESS_HOURS_START = 9 // 9:00 AM
const BUSINESS_HOURS_END = 18 // 6:00 PM
const APPOINTMENT_GAP_MINUTES = 40
const SLOT_DURATION_MINUTES = 30
const LUNCH_BREAK_START = 13 // 1:00 PM
const LUNCH_BREAK_END = 14 // 2:00 PM

// Mock database - in production, replace with real database
const mockAppointments: Array<{
  id: string;
  datetime: string;
  duration: number;
  patientName: string;
  phone: string;
}> = [
  { id: "1", datetime: "2025-07-22T11:00:00", duration: 60, patientName: "Ahmad Hassan", phone: "03001234567" },
  { id: "2", datetime: "2025-07-22T14:30:00", duration: 45, patientName: "Fatima Ali", phone: "03119876543" },
  { id: "3", datetime: "2025-07-23T10:00:00", duration: 30, patientName: "Muhammad Khan", phone: "03451234567" },
  { id: "4", datetime: "2025-07-23T15:30:00", duration: 60, patientName: "Aisha Malik", phone: "03335678901" },
]

// Function to get all appointments from Firestore
async function getAllAppointments() {
  try {
    const fsPatients = await getPatientsFirestore()
    
    // Convert Firestore patient data to appointment format
    const firestoreAppointments = fsPatients.map(patient => ({
      id: patient.id,
      datetime: patient.appointment_date,
      duration: 60, // Default duration
      patientName: patient.name,
      phone: patient.phone
    }))
    
    return [...firestoreAppointments, ...mockAppointments]
  } catch (error) {
    console.error('Error in getAllAppointments:', error)
    return mockAppointments
  }
}

// Validation functions
function isBusinessHours(datetime: string): boolean {
  const appointmentTime = new Date(datetime)
  const hour = appointmentTime.getHours()
  return hour >= BUSINESS_HOURS_START && hour < BUSINESS_HOURS_END
}

function isSunday(datetime: string): boolean {
  const appointmentTime = new Date(datetime)
  return appointmentTime.getDay() === 0
}

function hasMinimumGap(datetime: string, existingAppointments: typeof mockAppointments): boolean {
  const newAppointmentTime = new Date(datetime)
  
  for (const appointment of existingAppointments) {
    const existingTime = new Date(appointment.datetime)
    const timeDifferenceMinutes = Math.abs(newAppointmentTime.getTime() - existingTime.getTime()) / (1000 * 60)
    
    if (timeDifferenceMinutes < APPOINTMENT_GAP_MINUTES) {
      return false
    }
  }
  
  return true
}

// Generate smart alternative time suggestions
function getSmartAlternatives(requestedDateTime: string, maxAlternatives: number = 5): Array<{
  time: string;
  datetime: string;
  date: string;
  dayName: string;
  timeDifference: string;
}> {
  const requestedTime = new Date(requestedDateTime)
  const alternatives: Array<{
    time: string;
    datetime: string;
    date: string;
    dayName: string;
    timeDifference: string;
    score: number;
  }> = []
  
  // Search within a 7-day window from requested date
  const searchDays = 7
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  for (let dayOffset = 0; dayOffset <= searchDays; dayOffset++) {
    const searchDate = new Date(requestedTime)
    searchDate.setDate(requestedTime.getDate() + dayOffset)
    
    // Skip Sundays
    if (searchDate.getDay() === 0) continue
    
    const dateString = searchDate.toISOString().split('T')[0]
    const availableSlots = getAvailableSlots(dateString)
    
    for (const slot of availableSlots) {
      if (!slot.available) continue
      
      const slotTime = new Date(slot.datetime)
      const timeDiffMinutes = Math.abs(slotTime.getTime() - requestedTime.getTime()) / (1000 * 60)
      
      // Calculate preference score (lower is better)
      let score = timeDiffMinutes
      
      // Prefer same day
      if (dayOffset === 0) score -= 1000
      
      // Prefer similar time of day
      const requestedHour = requestedTime.getHours()
      const slotHour = slotTime.getHours()
      const hourDiff = Math.abs(slotHour - requestedHour)
      score += hourDiff * 60
      
      // Format time difference
      let timeDifference = ""
      if (dayOffset === 0) {
        if (timeDiffMinutes < 60) {
          timeDifference = `${Math.round(timeDiffMinutes)} minutes from your preferred time`
        } else {
          timeDifference = `${Math.round(timeDiffMinutes / 60)} hours from your preferred time`
        }
      } else if (dayOffset === 1) {
        timeDifference = "Next day - same time"
      } else {
        timeDifference = `${dayOffset} days later`
      }
      
      alternatives.push({
        time: slot.time,
        datetime: slot.datetime,
        date: searchDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        dayName: dayNames[searchDate.getDay()],
        timeDifference,
        score
      })
    }
  }
  
  // Sort by preference score and return top alternatives
  return alternatives
    .sort((a, b) => a.score - b.score)
    .slice(0, maxAlternatives)
    .map(({ score, ...rest }) => rest)
}

function validateAppointmentTime(datetime: string): { 
  valid: boolean; 
  error?: string;
  alternatives?: Array<{
    time: string;
    datetime: string;
    date: string;
    dayName: string;
    timeDifference: string;
  }>;
} {
  // Check if Sunday
  if (isSunday(datetime)) {
    const alternatives = getSmartAlternatives(datetime)
    return { 
      valid: false, 
      error: "Clinic is closed on Sundays. Please select Monday through Saturday.",
      alternatives 
    }
  }
  
  // Check business hours
  if (!isBusinessHours(datetime)) {
    const alternatives = getSmartAlternatives(datetime)
    return { 
      valid: false, 
      error: "Selected time is outside business hours (9:00 AM - 6:00 PM).",
      alternatives 
    }
  }
  
  // Check minimum gap
  if (!hasMinimumGap(datetime, mockAppointments)) {
    const alternatives = getSmartAlternatives(datetime)
    return { 
      valid: false, 
      error: "This time slot conflicts with existing appointments. Please select a time with at least 40 minutes gap.",
      alternatives 
    }
  }
  
  return { valid: true }
}

export async function POST(request: NextRequest) {
  // Add CORS headers for mobile browsers - must be set BEFORE any async operations
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24 hours
  }

  try {
    const appointmentData = await request.json()
    
    // Validate required fields
    if (!appointmentData.name || !appointmentData.phone || !appointmentData.appointment_date) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, phone, or appointment_date" },
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate appointment time
    const validation = validateAppointmentTime(appointmentData.appointment_date)
    if (!validation.valid) {
      return NextResponse.json(
        { 
          success: false, 
          error: validation.error,
          alternatives: validation.alternatives || [],
          suggestedMessage: validation.alternatives?.length ? 
            "Here are some available appointment times close to your preferred choice:" : 
            "Please select a different date and time."
        },
        { status: 400, headers: corsHeaders }
      )
    }

    // Save to Firestore database
    const newPatient = await createPatientFirestore({
      name: appointmentData.name,
      phone: appointmentData.phone,
      email: appointmentData.email || undefined,
      session_type: appointmentData.session_type || 'in_clinic',
      appointment_date: appointmentData.appointment_date,
      status: 'pending',
      urgency: appointmentData.urgency || 'normal',
      payment_method: appointmentData.payment_method || 'cash',
      notes: appointmentData.notes || '',
      sessions_completed: 0,
    })

    if (!newPatient) {
      console.error("❌ Firestore create patient error")
      return NextResponse.json(
        { success: false, error: "Database error saving appointment to Firestore" },
        { status: 500, headers: corsHeaders }
      )
    }

    const appointmentId = newPatient.id

    // Mirror the booking into the live queue in Firestore
    try {
      await upsertAppointmentQueueFirestore({
        appointment_id: appointmentId,
        patient_id: appointmentId,
        patient_name: appointmentData.name,
        patient_phone: appointmentData.phone,
        appointment_date: appointmentData.appointment_date,
        status: 'scheduled',
      })
    } catch (queueError) {
      console.warn('⚠️ Failed to create appointment queue row:', queueError)
    }

    // Add to mock database for backward compatibility
    mockAppointments.push({
      id: appointmentId,
      datetime: appointmentData.appointment_date,
      duration: 60,
      patientName: appointmentData.name,
      phone: appointmentData.phone
    })

    console.log("✅ New appointment saved to database:", {
      id: appointmentId,
      ...appointmentData,
      timestamp: new Date().toISOString(),
      validationPassed: true
    })

    // Note: Local IndexedDB sync happens on client-side after successful response
    // Client should save to IndexedDB when it receives the appointment ID

    // Log notification
    console.log(`📩 Appointment notification - Patient: ${appointmentData.name}, Phone: ${appointmentData.phone}, Time: ${appointmentData.appointment_date}`)
    
    // Simulate WhatsApp notification
    console.log(`📱 WhatsApp notification sent to Dr. Bashir Khan about new appointment for ${appointmentData.name}`)

    return NextResponse.json({
      success: true,
      id: appointmentId,
      message: "Appointment booked successfully with smart scheduling validation",
      appointmentDetails: {
        id: appointmentId,
        patientName: appointmentData.name,
        phone: appointmentData.phone,
        datetime: appointmentData.appointment_date,
        sessionType: appointmentData.session_type,
        urgency: appointmentData.urgency,
        notes: appointmentData.notes
      }
    }, { headers: corsHeaders })
    
  } catch (error: any) {
    console.error("❌ Appointment booking error:", error)
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }
    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error. Please try again later.",
        details: error?.message || 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: corsHeaders
      }
    )
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204, // No Content - standard for OPTIONS
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
    },
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    
    // Get all appointments (Supabase + mock)
    const allAppointments = await getAllAppointments()
    
    // If date is provided, return available slots for that date
    if (date) {
      const availableSlots = await getAvailableSlotsAsync(date)
      const bookedSlots = await getBookedSlotsAsync(date)
      return NextResponse.json({
        success: true,
        date: date,
        availableSlots: availableSlots,
        bookedSlots: bookedSlots,
        businessHours: {
          start: BUSINESS_HOURS_START,
          end: BUSINESS_HOURS_END,
          slotDuration: SLOT_DURATION_MINUTES,
          minimumGap: APPOINTMENT_GAP_MINUTES
        }
      })
    }
    
    // Return all appointments
    return NextResponse.json({
      success: true,
      appointments: allAppointments,
      businessHours: {
        start: BUSINESS_HOURS_START,
        end: BUSINESS_HOURS_END,
        slotDuration: SLOT_DURATION_MINUTES,
        minimumGap: APPOINTMENT_GAP_MINUTES
      }
    })
  } catch (error) {
    console.error("❌ Error fetching appointments:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch appointments" },
      { status: 500 }
    )
  }
}

// Helper function to get available slots for a specific date
function getAvailableSlots(dateStr: string): Array<{ time: string; datetime: string; available: boolean }> {
  const date = new Date(dateStr)
  const slots: Array<{ time: string; datetime: string; available: boolean }> = []
  
  // Skip Sundays
  if (date.getDay() === 0) {
    return slots
  }
  
  const dateString = date.toISOString().split('T')[0]
  
  for (let hour = BUSINESS_HOURS_START; hour < BUSINESS_HOURS_END; hour++) {
    // Skip lunch break
    if (hour >= LUNCH_BREAK_START && hour < LUNCH_BREAK_END) {
      continue
    }
    
    for (let minute = 0; minute < 60; minute += SLOT_DURATION_MINUTES) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      const datetime = `${dateString}T${timeStr}:00`
      
      const isAvailable = hasMinimumGap(datetime, mockAppointments)
      const displayTime = formatTimeDisplay(hour, minute)
      
      slots.push({
        time: displayTime,
        datetime: datetime,
        available: isAvailable
      })
    }
  }
  
  return slots
}

// Helper function to get booked slots for a specific date
function getBookedSlots(dateStr: string): Array<{ time: string; datetime: string; patientName: string }> {
  const date = new Date(dateStr)
  const dateString = date.toISOString().split('T')[0]
  
  return mockAppointments
    .filter(appointment => appointment.datetime.startsWith(dateString))
    .map(appointment => {
      const time = new Date(appointment.datetime)
      return {
        time: formatTimeDisplay(time.getHours(), time.getMinutes()),
        datetime: appointment.datetime,
        patientName: appointment.patientName
      }
    })
}

// Helper function to format time for display (12-hour format with clear AM/PM)
function formatTimeDisplay(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
}

// Async helper function to get available slots for a specific date
async function getAvailableSlotsAsync(dateStr: string): Promise<Array<{ time: string; datetime: string; available: boolean }>> {
  const date = new Date(dateStr)
  const slots: Array<{ time: string; datetime: string; available: boolean }> = []
  
  // Skip Sundays
  if (date.getDay() === 0) {
    return slots
  }
  
  // Get all appointments to check conflicts
  const allAppointments = await getAllAppointments()
  const dateString = date.toISOString().split('T')[0]
  
  for (let hour = BUSINESS_HOURS_START; hour < BUSINESS_HOURS_END; hour++) {
    // Skip lunch break
    if (hour >= LUNCH_BREAK_START && hour < LUNCH_BREAK_END) {
      continue
    }
    
    for (let minute = 0; minute < 60; minute += SLOT_DURATION_MINUTES) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      const datetime = `${dateString}T${timeStr}:00`
      
      const isAvailable = hasMinimumGap(datetime, allAppointments)
      const displayTime = formatTimeDisplay(hour, minute)
      
      slots.push({
        time: displayTime,
        datetime: datetime,
        available: isAvailable
      })
    }
  }
  
  return slots
}

// Async helper function to get booked slots for a specific date
async function getBookedSlotsAsync(dateStr: string): Promise<Array<{ time: string; datetime: string; patientName: string }>> {
  const date = new Date(dateStr)
  const dateString = date.toISOString().split('T')[0]
  
  const allAppointments = await getAllAppointments()
  
  return allAppointments
    .filter(appointment => appointment.datetime.startsWith(dateString))
    .map(appointment => {
      const time = new Date(appointment.datetime)
      return {
        time: formatTimeDisplay(time.getHours(), time.getMinutes()),
        datetime: appointment.datetime,
        patientName: appointment.patientName
      }
    })
}

// Helper function to format date for display
function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}
