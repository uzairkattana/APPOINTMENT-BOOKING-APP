"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Calendar, Clock, AlertCircle, CheckCircle2, CalendarDays, Video, MapPin, Bell, Repeat, Info, TrendingUp, AlertTriangle, Download } from "lucide-react"
import { type Patient, updatePatient } from "@/lib/data-service"
import { checkAppointmentConflict, getAvailableTimeSlots, createAppointmentReminder, saveReminder } from "@/lib/appointment-utils"
import { useToast } from "@/hooks/use-toast"
import { generateAppointmentConfirmationPDF } from "@/lib/pdf-appointment-confirmation"

interface BookNextAppointmentProps {
  patient: Patient
  allPatients: Patient[]
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  isDarkMode?: boolean
}

export function BookNextAppointment({
  patient,
  allPatients,
  isOpen,
  onClose,
  onSuccess,
  isDarkMode = false
}: BookNextAppointmentProps) {
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [sessionType, setSessionType] = useState<"in_clinic" | "video">(patient.session_type || "in_clinic")
  const [notes, setNotes] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [conflictWarning, setConflictWarning] = useState<string>("")
  const [showPreview, setShowPreview] = useState(false)
  const [autoReminder, setAutoReminder] = useState(true)
  const [recurringMode, setRecurringMode] = useState(false)
  const [recurringCount, setRecurringCount] = useState(1)
  const [recurringInterval, setRecurringInterval] = useState<'weekly' | 'biweekly'>('weekly')
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [bookedAppointmentData, setBookedAppointmentData] = useState<{
    date: string
    time: string
  } | null>(null)

  // Generate next 30 days for date selection (excluding Sundays)
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let daysAdded = 0
    let currentDate = new Date(today)
    
    while (daysAdded < 30) {
      currentDate.setDate(today.getDate() + daysAdded)
      
      // Skip Sundays (day 0) - clinic closed
      if (currentDate.getDay() !== 0) {
        dates.push({
          value: currentDate.toISOString().split('T')[0],
          label: currentDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          }),
          dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'long' })
        })
      }
      
      daysAdded++
    }
    
    return dates
  }

  const availableDates = getAvailableDates()

  // Update available time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      const date = new Date(selectedDate)
      const slots = getAvailableTimeSlots(date, allPatients, { start: 8, end: 18 })
      setAvailableTimeSlots(slots)
      
      // Clear selected time if it's no longer available
      if (selectedTime && !slots.includes(selectedTime)) {
        setSelectedTime("")
      }
    }
  }, [selectedDate, allPatients])

  // Check for conflicts when time is selected
  useEffect(() => {
    if (selectedDate && selectedTime) {
      // Parse time slot (e.g., "2:00 PM") and create full ISO date
      const date = new Date(selectedDate)
      const timeParts = selectedTime.match(/(\d+):(\d+)\s+(AM|PM)/)
      
      if (timeParts) {
        let hours = parseInt(timeParts[1])
        const minutes = parseInt(timeParts[2])
        const period = timeParts[3]
        
        if (period === 'PM' && hours !== 12) hours += 12
        if (period === 'AM' && hours === 12) hours = 0
        
        date.setHours(hours, minutes, 0, 0)
        
        // Build local ISO (no timezone) to keep consistency across app
        const localISO = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}T${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`

        // Check against ALL patients (including all follow-up appointments)
        const conflict = checkAppointmentConflict(localISO, allPatients)
        
        if (conflict.hasConflict) {
          setConflictWarning(conflict.message || "Time slot conflict detected")
        } else {
          setConflictWarning("")
        }
      }
    }
  }, [selectedDate, selectedTime, allPatients])

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time for the appointment",
        variant: "destructive"
      })
      return
    }

    if (conflictWarning) {
      toast({
        title: "Time Conflict",
        description: conflictWarning,
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      // Parse time and create full appointment date
      const date = new Date(selectedDate)
      const timeParts = selectedTime.match(/(\d+):(\d+)\s+(AM|PM)/)
      
      if (!timeParts) {
        throw new Error("Invalid time format")
      }

      let hours = parseInt(timeParts[1])
      const minutes = parseInt(timeParts[2])
      const period = timeParts[3]
      
      if (period === 'PM' && hours !== 12) hours += 12
      if (period === 'AM' && hours === 12) hours = 0
      
      date.setHours(hours, minutes, 0, 0)
      const nextAppointmentDate = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}T${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`

      // Add current appointment to history with full details
      const currentHistory = patient.appointment_history || []
      const currentAppointmentInHistory = currentHistory.some(
        h => h.appointment_date === patient.appointment_date
      )
      
      const currentSessionDetails = {
        appointment_date: patient.appointment_date,
        session_type: patient.session_type,
        status: 'completed' as const, // Mark as completed since we're booking next
        notes: patient.notes || 'Session completed successfully',
        completed_at: new Date().toISOString(),
        session_number: (patient.sessions_completed || 0) + 1
      }
      
      if (!currentAppointmentInHistory) {
        currentHistory.push(currentSessionDetails)
      }

      // Calculate new session count and status
      const previousSessionsCompleted = patient.sessions_completed || 0
      const previousTotalSessions = patient.total_sessions || 3

      // Always increment sessions_completed for each completed visit
      const newSessionsCompleted = previousSessionsCompleted + 1

      // IMPORTANT BUSINESS RULE:
      // sessions_completed (taken) must never be greater than total_sessions (total).
      // If patient completes more sessions than originally planned,
      // automatically extend total_sessions to match.
      const newTotalSessions = Math.max(previousTotalSessions, newSessionsCompleted)

      const derivedStatus: Patient['status'] =
        newSessionsCompleted >= newTotalSessions ? 'completed' : 'confirmed'

      // Update CURRENT patient record with:
      // 1. Increment session count (current session is now completed)
      // 2. Update appointment date to the NEW appointment
      // 3. Update last_visit to now
      // 4. Store next appointment metadata
      // 5. Update appointment history
      const currentPatientUpdates: Partial<Patient> = {
        appointment_date: nextAppointmentDate, // Move to next appointment
        sessions_completed: newSessionsCompleted, // Increment session count
        total_sessions: newTotalSessions, // Ensure total always >= completed sessions
        last_visit: new Date().toISOString(), // Mark current visit as completed
        status: derivedStatus, // Update status based on progress
        session_type: sessionType, // Update session type for next appointment
        notes: notes || 'Follow-up appointment scheduled', // Update notes
        next_appointment_date: nextAppointmentDate, // Store for reference
        next_appointment_notes: notes || 'Follow-up appointment',
        next_appointment_booked_at: new Date().toISOString(), // Booking timestamp
        appointment_history: currentHistory
      }

      await updatePatient(patient.id, currentPatientUpdates)

      // Note: We DO NOT create a new patient record
      // Instead, we've already updated the CURRENT patient's appointment_date to the new time
      // This maintains a single patient record with updated appointment slot

      // Update localStorage for current patient
      try {
        const localPatients = JSON.parse(localStorage.getItem("gonstead_patients") || "[]")
        const localIndex = localPatients.findIndex((p: Patient) => p.id === patient.id)
        
        if (localIndex !== -1) {
          localPatients[localIndex] = {
            ...localPatients[localIndex],
            ...currentPatientUpdates,
            updated_at: new Date().toISOString()
          }
          localStorage.setItem("gonstead_patients", JSON.stringify(localPatients))
        }
      } catch (e) {
        console.error("Error updating localStorage:", e)
      }

      // Store appointment data for PDF generation
      setBookedAppointmentData({
        date: nextAppointmentDate,
        time: selectedTime
      })
      
      // Auto-generate and download confirmation PDF immediately
      try {
        await generateAppointmentConfirmationPDF({
          patient: { ...patient, ...currentPatientUpdates },
          appointmentDate: nextAppointmentDate,
          appointmentTime: selectedTime,
          sessionType: sessionType,
          notes: notes || undefined
        })
        toast({
          title: "📄 Confirmation PDF Downloaded",
          description: `Appointment confirmation for ${patient.name} has been downloaded.`,
        })
      } catch (e) {
        console.error('Auto PDF generation failed, user can download manually:', e)
      }
      
      // Show success dialog with PDF download option (fallback/manual)
      setShowSuccessDialog(true)
      
      toast({
        title: "✅ Appointment Updated & Session Recorded",
        description: `${patient.name}'s appointment moved to ${new Date(nextAppointmentDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} at ${selectedTime}. Session ${newSessionsCompleted}/${newTotalSessions} completed.`,
      })

      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error booking next appointment:", error)
      toast({
        title: "Error",
        description: "Failed to book next appointment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadConfirmation = async () => {
    if (!bookedAppointmentData) return

    try {
      await generateAppointmentConfirmationPDF({
        patient: patient,
        appointmentDate: bookedAppointmentData.date,
        appointmentTime: bookedAppointmentData.time,
        sessionType: sessionType,
        notes: notes || undefined
      })

      toast({
        title: "📄 PDF Downloaded",
        description: "Appointment confirmation has been downloaded successfully.",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleCloseSuccess = () => {
    setShowSuccessDialog(false)
    setBookedAppointmentData(null)
    onClose()
  }

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl max-h-[95vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
        <DialogHeader className="sticky top-0 z-10 pb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}">
          <DialogTitle className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-[#0d5c75]'} flex items-center gap-2`}>
            <Calendar className="h-6 w-6" />
            Book Next Appointment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4 pb-4">
          {/* Patient Info Banner */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'} border ${isDarkMode ? 'border-gray-600' : 'border-blue-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-[#0d5c75]'}`}>
                  {patient.name}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {patient.phone} • Sessions: {patient.sessions_completed || 0}/{patient.total_sessions || 3}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Current Appointment</p>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {new Date(patient.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <Label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
              Select Date *
            </Label>
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger className={`w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
                <SelectValue placeholder="Choose appointment date" />
              </SelectTrigger>
              <SelectContent>
                {availableDates.map((date) => (
                  <SelectItem key={date.value} value={date.value}>
                    {date.label} ({date.dayOfWeek})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div className="space-y-2">
              <Label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'} flex items-center gap-2`}>
                <Clock className="h-4 w-4" />
                Select Time *
              </Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className={`w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
                  <SelectValue placeholder="Choose time slot" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {availableTimeSlots.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No available slots for this date
                    </div>
                  ) : (
                    availableTimeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              
              {conflictWarning && (
                <div className="flex items-start gap-2 text-red-600 text-sm mt-2 p-2 bg-red-50 rounded">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{conflictWarning}</span>
                </div>
              )}
              
              {selectedTime && !conflictWarning && (
                <div className="flex items-start gap-2 text-green-600 text-sm mt-2 p-2 bg-green-50 rounded">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Time slot available</span>
                </div>
              )}
            </div>
          )}

          {/* Session Type */}
          <div className="space-y-2">
            <Label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
              Session Type
            </Label>
            <Select value={sessionType} onValueChange={(value: "in_clinic" | "video") => setSessionType(value)}>
              <SelectTrigger className={`w-full ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_clinic">In-Clinic Session</SelectItem>
                <SelectItem value="video">Video Consultation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Appointment Notes */}
          <div className="space-y-2">
            <Label className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
              Appointment Notes (Optional)
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special notes for this appointment (e.g., follow-up goals, specific concerns to address)"
              className={`min-h-[100px] ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : ''}`}
            />
          </div>

          {/* Action Buttons - Sticky Footer */}
          <div className={`flex gap-3 pt-4 pb-2 sticky bottom-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} mt-6 -mx-6 px-6`}>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleBookAppointment}
              disabled={!selectedDate || !selectedTime || !!conflictWarning || isLoading}
              className="flex-1 bg-[#0d5c75] hover:bg-[#0a4a5c] text-white"
            >
              {isLoading ? "Booking..." : "Book Next Appointment"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Success Dialog with PDF Download Option */}
    <Dialog open={showSuccessDialog} onOpenChange={handleCloseSuccess}>
      <DialogContent className={`max-w-md max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'}`}>
        <DialogHeader>
          <DialogTitle className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-[#0d5c75]'} flex items-center gap-2`}>
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            Appointment Confirmed!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4 pb-4">
          {/* Success Message */}
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'} border ${isDarkMode ? 'border-green-800' : 'border-green-200'}`}>
            <p className={`text-sm ${isDarkMode ? 'text-green-200' : 'text-green-800'}`}>
              Your next appointment has been successfully scheduled. Would you like to download a confirmation document?
            </p>
          </div>

          {/* Appointment Summary */}
          {bookedAppointmentData && (
            <div className="space-y-2">
              <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(bookedAppointmentData.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <Clock className="h-4 w-4" />
                <span>{bookedAppointmentData.time}</span>
              </div>
            </div>
          )}

          {/* Download Button */}
          <div className="space-y-3">
            <Button
              onClick={handleDownloadConfirmation}
              className="w-full bg-[#0d5c75] hover:bg-[#0a4a5c] text-white flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Confirmation PDF
            </Button>
            
            <Button
              variant="outline"
              onClick={handleCloseSuccess}
              className="w-full"
            >
              Close
            </Button>
          </div>

          {/* Info Note */}
          <div className={`flex items-start gap-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} p-3 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              The confirmation PDF includes appointment details, clinic location with QR code, pre-visit instructions, and cancellation policy.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}

