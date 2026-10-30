// WhatsApp Notification Utility for New Appointments

interface AppointmentNotification {
  patientName: string
  phone: string
  email?: string
  appointmentDate: string
  sessionType: "in_clinic" | "video"
  urgency: "normal" | "urgent" | "emergency"
  notes?: string
}

/**
 * Generate WhatsApp notification message for new appointment
 */
export function generateWhatsAppMessage(appointment: AppointmentNotification): string {
  const urgencyEmoji = {
    normal: "📅",
    urgent: "⚡",
    emergency: "🚨"
  }

  const sessionEmoji = appointment.sessionType === "in_clinic" ? "🏥" : "💻"
  
  return `${urgencyEmoji[appointment.urgency]} *NEW APPOINTMENT BOOKED*

👤 *Patient:* ${appointment.patientName}
📞 *Phone:* ${appointment.phone}
📧 *Email:* ${appointment.email || "Not provided"}
${sessionEmoji} *Type:* ${appointment.sessionType === "in_clinic" ? "In-Clinic Treatment" : "Video Consultation"}
📅 *Date & Time:* ${new Date(appointment.appointmentDate).toLocaleString()}
⚠️ *Urgency:* ${appointment.urgency.toUpperCase()}

${appointment.notes ? `📝 *Notes:* ${appointment.notes}` : ""}

🏥 *Gonstead Chiropractic Clinic*
📍 Near Peshawar Model School, Tehsil Road, Nowshera
📞 +92 304 699 6267

Please confirm the appointment and prepare for the session.`
}

/**
 * Open WhatsApp Web with pre-filled message
 */
export function sendWhatsAppNotification(
  doctorPhoneNumber: string, 
  appointment: AppointmentNotification
): void {
  const message = generateWhatsAppMessage(appointment)
  const encodedMessage = encodeURIComponent(message)
  
  // Clean phone number (remove any non-numeric characters except +)
  const cleanPhoneNumber = doctorPhoneNumber.replace(/[^\d+]/g, '')
  
  // WhatsApp Web URL with pre-filled message
  const whatsappUrl = `https://wa.me/${cleanPhoneNumber}?text=${encodedMessage}`
  
  // Open in new window/tab
  window.open(whatsappUrl, '_blank')
}

/**
 * Alternative: Use WhatsApp API for automated sending (requires API setup)
 */
export async function sendAutomatedWhatsAppNotification(
  apiConfig: {
    accountSid: string
    authToken: string
    fromNumber: string // Your WhatsApp Business number
  },
  toNumber: string,
  appointment: AppointmentNotification
): Promise<boolean> {
  try {
    // Example using Twilio WhatsApp API
    const message = generateWhatsAppMessage(appointment)
    
    const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + apiConfig.accountSid + '/Messages.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(apiConfig.accountSid + ':' + apiConfig.authToken)
      },
      body: new URLSearchParams({
        From: `whatsapp:${apiConfig.fromNumber}`,
        To: `whatsapp:${toNumber}`,
        Body: message
      })
    })

    return response.ok
  } catch (error) {
    console.error('WhatsApp API Error:', error)
    return false
  }
}

/**
 * Integration function to call when new appointment is created
 */
export function notifyNewAppointment(appointment: AppointmentNotification) {
  // Your WhatsApp number (Dr. Bashir's number)
  const doctorWhatsApp = "+923046996267"
  
  // Option 1: Open WhatsApp Web (immediate, no API setup needed)
  sendWhatsAppNotification(doctorWhatsApp, appointment)
  
  // Option 2: If you have API credentials, use automated sending
  // const apiConfig = {
  //   accountSid: 'YOUR_TWILIO_ACCOUNT_SID',
  //   authToken: 'YOUR_TWILIO_AUTH_TOKEN',
  //   fromNumber: '+14155238886' // Your Twilio WhatsApp number
  // }
  // sendAutomatedWhatsAppNotification(apiConfig, doctorWhatsApp, appointment)
}

/**
 * Browser notification utility (bonus feature)
 */
export function showBrowserNotification(appointment: AppointmentNotification) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("New Appointment Booked!", {
      body: `${appointment.patientName} - ${new Date(appointment.appointmentDate).toLocaleString()}`,
      icon: "/images/gonstead-logo-new.png",
      tag: "new-appointment"
    })
  }
}

/**
 * Request notification permission
 */
export function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission()
  }
}
