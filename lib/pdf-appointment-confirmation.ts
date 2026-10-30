/**
 * Professional Appointment Confirmation PDF Generator
 * International Standard Format with QR Code, Clinic Branding, and Complete Details
 */

import jsPDF from 'jspdf'
import QRCode from 'qrcode'
import { type Patient } from './supabase'

interface AppointmentConfirmationData {
  patient: Patient
  appointmentDate: string // ISO format
  appointmentTime: string // Formatted time (e.g., "2:00 PM")
  sessionType: 'in_clinic' | 'video'
  notes?: string
  referenceNumber?: string
  clinicInfo?: {
    name: string
    address: string
    phone: string
    email: string
    website: string
    mapUrl: string
  }
}

/**
 * Generate a professional appointment confirmation PDF
 */
export async function generateAppointmentConfirmationPDF(data: AppointmentConfirmationData): Promise<void> {
  const {
    patient,
    appointmentDate,
    appointmentTime,
    sessionType,
    notes,
    referenceNumber = generateReferenceNumber(),
    clinicInfo = getDefaultClinicInfo()
  } = data

  // Create PDF (A4 size: 210mm x 297mm)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // Color palette
  const primaryColor: [number, number, number] = [13, 92, 117] // #0d5c75
  const accentColor: [number, number, number] = [16, 185, 129] // #10b981
  const lightGray: [number, number, number] = [243, 244, 246] // #f3f4f6
  const darkGray: [number, number, number] = [75, 85, 99] // #4b5563
  const white: [number, number, number] = [255, 255, 255]

  let currentY = 15

  // ============================================
  // HEADER SECTION - Clinic Branding
  // ============================================
  pdf.setFillColor(...primaryColor)
  pdf.rect(0, 0, 210, 40, 'F')

  // Add Clinic Logo (left side)
  try {
    // Load actual clinic logo
    const logoPath = '/images/gonstead-chiropractic-logo-new.png'
    const logoImg = new Image()
    logoImg.src = logoPath
    
    // Add logo image to PDF
    await new Promise<void>((resolve, reject) => {
      logoImg.onload = () => {
        try {
          pdf.addImage(logoImg, 'PNG', 12, 10, 20, 20, undefined, 'FAST')
          resolve()
        } catch (err) {
          reject(err)
        }
      }
      logoImg.onerror = () => reject(new Error('Failed to load logo'))
    })
  } catch (error) {
    console.error('Error adding logo:', error)
    // Fallback to text-based logo placeholder
    pdf.setFillColor(...white)
    pdf.circle(20, 20, 8, 'F')
    pdf.setFillColor(...primaryColor)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(...white)
    pdf.text('GC', 20, 21.5, { align: 'center' })
  }

  // Clinic Name (centered)
  pdf.setTextColor(...white)
  pdf.setFontSize(22)
  pdf.setFont('helvetica', 'bold')
  pdf.text(clinicInfo.name, 105, 18, { align: 'center' })

  // Tagline
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Professional Chiropractic Care • Gonstead Method Specialists', 105, 25, { align: 'center' })

  // Contact info header
  pdf.setFontSize(7.5)
  pdf.text(`Phone: ${clinicInfo.phone} | Email: ${clinicInfo.email} | Web: ${clinicInfo.website}`, 105, 31, { align: 'center' })

  // Small QR code in header (top-right) linking to Google Maps
  try {
    const headerQrSize = 22 // mm
    const headerQrX = 210 - 12 - headerQrSize // 12mm right margin
    const headerQrY = 9 // below top edge inside header
    const headerQrDataUrl = await QRCode.toDataURL(clinicInfo.mapUrl, {
      width: 300,
      margin: 1,
      color: { dark: '#ffffff', light: '#0d5c75' } // invert for header contrast
    })
    // White background for QR for clarity
    pdf.setFillColor(255, 255, 255)
    pdf.roundedRect(headerQrX - 2, headerQrY - 2, headerQrSize + 4, headerQrSize + 4, 2, 2, 'F')
    pdf.addImage(headerQrDataUrl, 'PNG', headerQrX, headerQrY, headerQrSize, headerQrSize)
    // Caption under QR (inside header)
    pdf.setFontSize(6.5)
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Maps QR', headerQrX + headerQrSize / 2, headerQrY + headerQrSize + 5, { align: 'center' })
  } catch (e) {
    console.error('Header QR render failed:', e)
  }

  currentY = 48

  // ============================================
  // TITLE SECTION
  // ============================================
  pdf.setTextColor(...primaryColor)
  pdf.setFontSize(20)
  pdf.setFont('helvetica', 'bold')
  pdf.text('APPOINTMENT CONFIRMATION', 105, currentY, { align: 'center' })

  currentY += 10

  // Reference number with background
  pdf.setFillColor(...lightGray)
  pdf.roundedRect(15, currentY - 5, 180, 10, 2, 2, 'F')
  pdf.setTextColor(...darkGray)
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'bold')
  // Left: Reference number; Right: Patient ID (prominent)
  pdf.text(`Reference No: ${referenceNumber}`, 20, currentY, { align: 'left' })
  // Use full professional ID (no truncation). If a separate patient_code exists, prefer it.
  const patientIdDisplay = (patient as any).patient_code || (patient.id || 'N/A')
  pdf.text(`Patient ID: ${patientIdDisplay}`, 195, currentY, { align: 'right' })

  currentY += 15

  // ============================================
  // PATIENT INFORMATION SECTION
  // ============================================
  drawSectionHeader(pdf, 'PATIENT INFORMATION', currentY, primaryColor, accentColor)
  currentY += 8

  const patientInfo = [
    { label: 'Full Name', value: patient.name },
    { label: 'Phone Number', value: patient.phone },
    { label: 'Email Address', value: patient.email || 'Not provided' },
    { label: 'Patient ID', value: (patient as any).patient_code || (patient.id || 'N/A') },
    { label: 'Sessions Completed', value: `${patient.sessions_completed || 0} of ${patient.total_sessions || 3}` }
  ]

  currentY = drawInfoBlock(pdf, patientInfo, currentY, 15, darkGray, lightGray)
  currentY += 8

  // ============================================
  // APPOINTMENT DETAILS SECTION
  // ============================================
  drawSectionHeader(pdf, 'APPOINTMENT DETAILS', currentY, primaryColor, accentColor)
  currentY += 8

  // Parse appointment date
  const apptDate = new Date(appointmentDate)
  const dayOfWeek = apptDate.toLocaleDateString('en-US', { weekday: 'long' })
  const fullDate = apptDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  const appointmentInfo = [
    { label: 'Date', value: fullDate },
    { label: 'Day', value: dayOfWeek },
    { label: 'Time', value: appointmentTime },
    { label: 'Session Type', value: sessionType === 'in_clinic' ? 'In-Clinic Session' : 'Video Consultation' },
    { label: 'Status', value: 'Confirmed' }
  ]

  if (notes) {
    appointmentInfo.push({ label: 'Notes', value: notes })
  }

  currentY = drawInfoBlock(pdf, appointmentInfo, currentY, 15, darkGray, lightGray)
  currentY += 8

  // ============================================
  // CLINIC LOCATION SECTION
  // ============================================
  drawSectionHeader(pdf, 'CLINIC LOCATION', currentY, primaryColor, accentColor)
  currentY += 8

  const locationInfo = [
    { label: 'Address', value: clinicInfo.address },
    { label: 'Phone', value: clinicInfo.phone },
    { label: 'Google Maps', value: 'Scan QR code or visit link below' }
  ]

  currentY = drawInfoBlock(pdf, locationInfo, currentY, 15, darkGray, lightGray)
  currentY += 5

  // Clickable Google Maps link below location info (visible even without QR)
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(...primaryColor)
  pdf.textWithLink('Open in Google Maps', 20, currentY, { url: clinicInfo.mapUrl })
  currentY += 8


  // ============================================
  // PRE-VISIT INSTRUCTIONS
  // ============================================
  drawSectionHeader(pdf, 'PRE-VISIT INSTRUCTIONS', currentY, primaryColor, accentColor)
  currentY += 8

  const instructions = [
    'Please arrive 10 minutes early to complete any necessary paperwork',
    'Wear comfortable, loose-fitting clothing for your examination',
    'Bring any previous X-rays or medical records if available',
    'List any medications you are currently taking',
    'Notify us of any recent injuries or changes in your condition'
  ]

  pdf.setFontSize(8.5)
  pdf.setTextColor(...darkGray)
  pdf.setFont('helvetica', 'normal')

  instructions.forEach((instruction, index) => {
    const bulletX = 18
    const textX = 22
    
    // Draw bullet point
    pdf.circle(bulletX, currentY - 1, 0.8, 'F')
    
    // Draw text with word wrap
    const lines = pdf.splitTextToSize(instruction, 170)
    pdf.text(lines, textX, currentY)
    currentY += lines.length * 5
  })

  currentY += 5

  // ============================================
  // CANCELLATION POLICY
  // ============================================
  drawSectionHeader(pdf, 'CANCELLATION & RESCHEDULING POLICY', currentY, primaryColor, accentColor)
  currentY += 8

  pdf.setFontSize(8.5)
  pdf.setTextColor(...darkGray)
  pdf.setFont('helvetica', 'normal')
  const policyText = [
    'If you need to cancel or reschedule your appointment, please contact us at least 24 hours in advance.',
    'Late cancellations or no-shows may result in a cancellation fee. Thank you for your understanding.'
  ]

  policyText.forEach(line => {
    const lines = pdf.splitTextToSize(line, 170)
    pdf.text(lines, 20, currentY)
    currentY += lines.length * 5
  })

  currentY += 6

  // ============================================
  // FOOTER
  // ============================================
  const footerY = 280 // Bottom of A4 page (adjusted)

  // Footer background
  pdf.setFillColor(...primaryColor)
  pdf.rect(0, footerY, 210, 20, 'F')

  // Footer text
  pdf.setFontSize(8)
  pdf.setTextColor(...white)
  pdf.setFont('helvetica', 'normal')
  pdf.text('Thank you for choosing our clinic for your chiropractic care needs.', 105, footerY + 6, { align: 'center' })
  pdf.text('We look forward to helping you achieve optimal spinal health and wellness.', 105, footerY + 10, { align: 'center' })
  
  // Generation timestamp
  pdf.setFontSize(7)
  pdf.text(`Generated on: ${new Date().toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  })}`, 105, footerY + 15, { align: 'center' })

  // ============================================
  // SAVE PDF
  // ============================================
  const fileName = `Appointment_Confirmation_${patient.name.replace(/\s+/g, '_')}_${referenceNumber}.pdf`
  pdf.save(fileName)
}

/**
 * Draw a section header with underline
 */
function drawSectionHeader(
  pdf: jsPDF,
  title: string,
  y: number,
  primaryColor: [number, number, number],
  accentColor: [number, number, number]
): void {
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(...primaryColor)
  pdf.text(title, 15, y)

  // Accent underline
  pdf.setDrawColor(...accentColor)
  pdf.setLineWidth(1)
  pdf.line(15, y + 1, 195, y + 1)
}

/**
 * Draw an information block with alternating row colors
 */
function drawInfoBlock(
  pdf: jsPDF,
  items: Array<{ label: string; value: string }>,
  startY: number,
  leftMargin: number,
  textColor: [number, number, number],
  bgColor: [number, number, number]
): number {
  let currentY = startY
  const rowHeight = 7
  const labelWidth = 60

  items.forEach((item, index) => {
    // Alternating background
    if (index % 2 === 0) {
      pdf.setFillColor(...bgColor)
      pdf.rect(leftMargin, currentY - 5, 180, rowHeight, 'F')
    }

    // Label
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(...textColor)
    pdf.text(`${item.label}:`, leftMargin + 2, currentY)

    // Value
    pdf.setFont('helvetica', 'normal')
    const valueLines = pdf.splitTextToSize(item.value, 110)
    pdf.text(valueLines, leftMargin + labelWidth, currentY)

    currentY += rowHeight
  })

  return currentY
}

/**
 * Generate a unique reference number
 */
function generateReferenceNumber(): string {
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `GCC-${year}${month}${day}-${random}`
}

/**
 * Get default clinic information
 */
function getDefaultClinicInfo() {
  return {
    name: 'Gonstead Chiropractic Clinic',
    address: 'Near Peshawar Model School, Tehsil Road, Nowshera, Pakistan',
    phone: '+92 321 9113096',
    email: 'info@gonsteadchiropractic.com',
    website: 'www.gonsteadchiropractic.com',
    mapUrl: 'https://maps.app.goo.gl/8pJ9o2hCPtGY3XtD9'
  }
}

