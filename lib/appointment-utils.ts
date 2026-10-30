import type { Patient } from './supabase'

// Appointment reminder system
export interface AppointmentReminder {
  id: string
  patientId: string
  patientName: string
  appointmentDate: string
  reminderTime: string
  status: 'pending' | 'sent' | 'failed'
  type: '24h' | '1h' | 'custom'
  message: string
  createdAt: string
}

// Check for appointment conflicts (double booking prevention)
export function checkAppointmentConflict(
  newAppointmentDate: string,
  existingPatients: Patient[],
  excludePatientId?: string
): { hasConflict: boolean; conflictingPatient?: Patient; message?: string } {
  const newDate = new Date(newAppointmentDate)
  const newTime = newDate.getTime()
  
  // Session duration: 40 minutes for both in-clinic and video
  const SESSION_DURATION_MS = 40 * 60 * 1000
  
  for (const patient of existingPatients) {
    // Skip if this is the same patient being edited
    if (excludePatientId && patient.id === excludePatientId) continue
    
    // Skip cancelled appointments
    if (patient.status === 'cancelled') continue
    
    const existingDate = new Date(patient.appointment_date)
    const existingTime = existingDate.getTime()
    
    // Check if appointments overlap
    const timeDifference = Math.abs(newTime - existingTime)
    
    if (timeDifference < SESSION_DURATION_MS) {
      return {
        hasConflict: true,
        conflictingPatient: patient,
        message: `Time slot conflicts with ${patient.name}'s appointment at ${existingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      }
    }
  }
  
  return { hasConflict: false }
}

// Get available time slots for a specific date
export function getAvailableTimeSlots(
  date: Date,
  existingPatients: Patient[],
  clinicHours: { start: number; end: number } = { start: 8, end: 18 }
): string[] {
  const slots: string[] = []
  const SESSION_INTERVAL_MINUTES = 40
  
  // Check if it's Sunday
  if (date.getDay() === 0) {
    return [] // Clinic closed on Sundays
  }
  
  // Generate all possible time slots
  for (let hour = clinicHours.start; hour < clinicHours.end; hour++) {
    for (let minute = 0; minute < 60; minute += SESSION_INTERVAL_MINUTES) {
      const totalMinutes = hour * 60 + minute
      if (totalMinutes >= clinicHours.start * 60 && totalMinutes < clinicHours.end * 60) {
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
        const period = hour >= 12 ? 'PM' : 'AM'
        const formattedMinute = minute.toString().padStart(2, '0')
        const timeSlot = `${displayHour}:${formattedMinute} ${period}`
        
        // Check if this slot is available
        const testDate = new Date(date)
        testDate.setHours(hour, minute, 0, 0)
        
        const conflict = checkAppointmentConflict(testDate.toISOString(), existingPatients)
        if (!conflict.hasConflict) {
          slots.push(timeSlot)
        }
      }
    }
  }
  
  return slots
}

// Create appointment reminders
export function createAppointmentReminder(
  patient: Patient,
  reminderType: '24h' | '1h' | 'custom',
  customTime?: string
): AppointmentReminder {
  const appointmentDate = new Date(patient.appointment_date)
  let reminderTime: Date
  
  switch (reminderType) {
    case '24h':
      reminderTime = new Date(appointmentDate)
      reminderTime.setHours(reminderTime.getHours() - 24)
      break
    case '1h':
      reminderTime = new Date(appointmentDate)
      reminderTime.setHours(reminderTime.getHours() - 1)
      break
    case 'custom':
      reminderTime = customTime ? new Date(customTime) : new Date()
      break
  }
  
  const message = generateReminderMessage(patient, reminderType)
  
  return {
    id: `REM${Date.now()}`,
    patientId: patient.id,
    patientName: patient.name,
    appointmentDate: patient.appointment_date,
    reminderTime: reminderTime.toISOString(),
    status: 'pending',
    type: reminderType,
    message,
    createdAt: new Date().toISOString()
  }
}

// Generate reminder message
function generateReminderMessage(patient: Patient, reminderType: '24h' | '1h' | 'custom'): string {
  const appointmentDate = new Date(patient.appointment_date)
  const dateStr = appointmentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  const timeStr = appointmentDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
  
  let timeframe = ''
  switch (reminderType) {
    case '24h':
      timeframe = 'tomorrow'
      break
    case '1h':
      timeframe = 'in 1 hour'
      break
    case 'custom':
      timeframe = 'soon'
      break
  }
  
  return `🏥 Appointment Reminder: Dear ${patient.name}, your ${patient.session_type === 'in_clinic' ? 'in-clinic' : 'video consultation'} appointment is scheduled for ${dateStr} at ${timeStr}. Gonstead Chiropractic Clinic. Call +92 304 699 6267 to reschedule.`
}

// Get upcoming appointments that need reminders
export function getUpcomingAppointmentsForReminders(
  patients: Patient[],
  hoursAhead: number = 24
): Patient[] {
  const now = new Date()
  const futureTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000)
  
  return patients.filter(patient => {
    if (patient.status === 'cancelled' || patient.status === 'completed') return false
    
    const appointmentDate = new Date(patient.appointment_date)
    return appointmentDate > now && appointmentDate <= futureTime
  })
}

// Save reminder to localStorage
export function saveReminder(reminder: AppointmentReminder): void {
  try {
    const reminders = getReminders()
    reminders.push(reminder)
    localStorage.setItem('appointment_reminders', JSON.stringify(reminders))
  } catch (error) {
    console.error('Error saving reminder:', error)
  }
}

// Get all reminders
export function getReminders(): AppointmentReminder[] {
  try {
    const stored = localStorage.getItem('appointment_reminders')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading reminders:', error)
    return []
  }
}

// Mark reminder as sent
export function markReminderAsSent(reminderId: string): void {
  try {
    const reminders = getReminders()
    const updated = reminders.map(r => 
      r.id === reminderId ? { ...r, status: 'sent' as const } : r
    )
    localStorage.setItem('appointment_reminders', JSON.stringify(updated))
  } catch (error) {
    console.error('Error updating reminder:', error)
  }
}

// Get pending reminders that should be sent now
export function getPendingReminders(): AppointmentReminder[] {
  const reminders = getReminders()
  const now = new Date()
  
  return reminders.filter(r => {
    if (r.status !== 'pending') return false
    const reminderTime = new Date(r.reminderTime)
    return reminderTime <= now
  })
}

// Patient engagement utilities
export interface EngagementAction {
  id: string
  patientId: string
  type: 'welcome' | 'followup' | 'progress_update' | 'appointment_reminder' | 'treatment_complete'
  message: string
  sentAt: string
  status: 'sent' | 'pending' | 'failed'
}

// Generate welcome message for new patients
export function generateWelcomeMessage(patient: Patient): string {
  return `Welcome to Gonstead Chiropractic Clinic! 🏥\n\nDear ${patient.name},\n\nThank you for choosing our clinic. Your appointment is scheduled for ${new Date(patient.appointment_date).toLocaleDateString()} at ${new Date(patient.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.\n\nWe look forward to helping you achieve optimal spinal health!\n\nDr. Bashir Khan\nGonstead Certified Specialist\n+92 304 699 6267`
}

// Generate follow-up message
export function generateFollowUpMessage(patient: Patient, sessionNumber: number): string {
  return `Follow-up: Session ${sessionNumber} Complete 💪\n\nDear ${patient.name},\n\nGreat progress! You've completed ${sessionNumber} of ${patient.total_sessions || 3} sessions. ${
    sessionNumber < (patient.total_sessions || 3) 
      ? `Your next appointment is coming up. Keep up the good work!` 
      : 'Congratulations on completing your treatment plan! We recommend periodic check-ups to maintain your spinal health.'
  }\n\nGonstead Chiropractic Clinic\n+92 304 699 6267`
}

// Generate progress update
export function generateProgressUpdate(patient: Patient): string {
  const progress = Math.round(((patient.sessions_completed || 0) / (patient.total_sessions || 3)) * 100)
  return `Treatment Progress Update 📊\n\nDear ${patient.name},\n\nYou're ${progress}% through your treatment plan! Keep following your home care instructions for best results.\n\nCompleted: ${patient.sessions_completed || 0} sessions\nRemaining: ${(patient.total_sessions || 3) - (patient.sessions_completed || 0)} sessions\n\nGonstead Chiropractic Clinic`
}

// Check for no-show risk
export function assessNoShowRisk(patient: Patient): { risk: 'low' | 'medium' | 'high'; reasons: string[] } {
  const reasons: string[] = []
  let riskScore = 0
  
  // Check if patient is new (first appointment)
  if ((patient.sessions_completed || 0) === 0) {
    riskScore += 2
    reasons.push('First-time patient')
  }
  
  // Check urgency level
  if (patient.urgency === 'normal') {
    riskScore += 1
    reasons.push('Normal urgency (lower commitment)')
  }
  
  // Check if video consultation (typically lower commitment)
  if (patient.session_type === 'video') {
    riskScore += 1
    reasons.push('Video consultation')
  }
  
  // Check payment method (prepaid methods have lower no-show rates)
  if (patient.payment_method === 'cash') {
    riskScore += 1
    reasons.push('Cash payment (not prepaid)')
  }
  
  // Determine risk level
  let risk: 'low' | 'medium' | 'high' = 'low'
  if (riskScore >= 4) risk = 'high'
  else if (riskScore >= 2) risk = 'medium'
  
  return { risk, reasons }
}

// Calculate optimal reminder timing based on no-show risk
export function getOptimalReminderTiming(patient: Patient): { times: string[]; recommendations: string[] } {
  const risk = assessNoShowRisk(patient)
  
  if (risk.risk === 'high') {
    return {
      times: ['72h', '24h', '1h'],
      recommendations: [
        'Send reminder 3 days before appointment',
        'Send reminder 24 hours before',
        'Send reminder 1 hour before',
        'Consider phone call for confirmation'
      ]
    }
  } else if (risk.risk === 'medium') {
    return {
      times: ['24h', '1h'],
      recommendations: [
        'Send reminder 24 hours before',
        'Send reminder 1 hour before'
      ]
    }
  } else {
    return {
      times: ['24h'],
      recommendations: [
        'Send reminder 24 hours before appointment'
      ]
    }
  }
}

