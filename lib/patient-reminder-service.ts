/**
 * Patient Pre-Appointment Reminder & Notification Service
 * Automatically inspects upcoming appointments and triggers 24-hour / next-day push notifications.
 */

import type { Patient } from "./firebase-db"

export interface AppointmentReminder {
  appointmentId: string
  date: string
  time: string
  sessionType: string
  hoursRemaining: number
  isTomorrow: boolean
  message: string
}

/**
 * Check upcoming appointments and return those happening within 24 hours / tomorrow.
 */
export function checkUpcomingPreAppointmentReminders(
  appointments: Patient[],
  patientName: string = "Patient"
): AppointmentReminder[] {
  if (!appointments || appointments.length === 0) return []

  const now = new Date()
  const todayStr = now.toISOString().split("T")[0]
  
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split("T")[0]

  const activeReminders: AppointmentReminder[] = []

  appointments.forEach((apt) => {
    const st = apt.status?.toLowerCase()
    if (st !== "scheduled" && st !== "confirmed") return

    const aptDateStr = apt.appointment_date
    if (!aptDateStr) return

    // Calculate if appointment is today or tomorrow
    const isToday = aptDateStr === todayStr
    const isTomorrow = aptDateStr === tomorrowStr

    // If appointment is within 24 hours or tomorrow
    if (isToday || isTomorrow) {
      const timeStr = apt.appointment_time || "10:00 AM"
      const timeDiffHours = isToday ? 4 : 24

      const msg = isToday
        ? `🔔 Today's Visit Alert: Hi ${patientName}, your Gonstead adjustment is scheduled for today at ${timeStr} with Dr. Bashir Khan.`
        : `🔔 Tomorrow's Appointment Reminder: Hi ${patientName}, your Gonstead adjustment is scheduled for tomorrow (${aptDateStr}) at ${timeStr} with Dr. Bashir Khan.`

      activeReminders.push({
        appointmentId: apt.id,
        date: aptDateStr,
        time: timeStr,
        sessionType: apt.session_type || "in_clinic",
        hoursRemaining: timeDiffHours,
        isTomorrow,
        message: msg,
      })

      // Trigger Browser Push Notification if client permission is granted
      triggerBrowserPushReminder(apt.id, msg)
    }
  })

  return activeReminders
}

/**
 * Trigger native browser push notification for pre-appointment reminder.
 */
export function triggerBrowserPushReminder(aptId: string, message: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return

  const storageKey = `notified_apt_${aptId}_${new Date().toISOString().split("T")[0]}`
  if (localStorage.getItem(storageKey)) {
    // Already notified today for this appointment
    return
  }

  if (Notification.permission === "granted") {
    try {
      new Notification("Gonstead Chiropractic Reminder", {
        body: message,
        icon: "/icon-192x192.png",
        tag: `reminder-${aptId}`,
      })
      localStorage.setItem(storageKey, "true")
    } catch (e) {
      console.warn("Notification trigger error:", e)
    }
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification("Gonstead Chiropractic Reminder", {
          body: message,
          icon: "/icon-192x192.png",
          tag: `reminder-${aptId}`,
        })
        localStorage.setItem(storageKey, "true")
      }
    })
  }
}
