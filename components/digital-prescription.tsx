"use client"

import React, { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Download, 
  Printer, 
  Calendar, 
  User, 
  Shield,
  FileText,
  ExternalLink,
  Clock,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { PrescriptionData } from '@/lib/prescription-types'
import Image from 'next/image'
import { QRCodeGenerator } from './prescription/qr-code-generator'

interface DigitalPrescriptionProps {
  prescription: PrescriptionData
  isPublicView?: boolean
  showActions?: boolean
}

export function DigitalPrescription({ 
  prescription, 
  isPublicView = false, 
  showActions = true 
}: DigitalPrescriptionProps) {
  const prescriptionRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = async () => {
    await downloadPrescription('pdf')
  }

  const downloadPrescription = async (format: 'pdf' | 'png' | 'jpg') => {
    try {
      const element = prescriptionRef.current
      if (!element) return

      // Clone element for rendering
      const elementClone = element.cloneNode(true) as HTMLElement
      
      // Hide action buttons in output
      const actionButtons = elementClone.querySelectorAll('.action-buttons, .digital-actions')
      actionButtons.forEach(btn => {
        if (btn.parentNode) {
          btn.parentNode.removeChild(btn)
        }
      })
      
      // Style for rendering
      elementClone.style.position = 'absolute'
      elementClone.style.left = '-9999px'
      elementClone.style.top = '0'
      elementClone.style.width = '800px'
      elementClone.style.padding = '20px'
      elementClone.style.backgroundColor = '#ffffff'
      elementClone.style.fontFamily = 'Arial, sans-serif'
      
      document.body.appendChild(elementClone)

      const canvas = await html2canvas(elementClone, {
        scale: format === 'pdf' ? 1.5 : 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: elementClone.scrollHeight,
        logging: false
      })

      document.body.removeChild(elementClone)

      // Generate filename with patient name and prescription ID
      const sanitizedPatientName = prescription.patient_name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
      const dateStr = new Date().toISOString().split('T')[0]
      const baseFileName = `prescription-${sanitizedPatientName}-${prescription.id}-${dateStr}`

      if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/png', 0.95)
        const pdf = new jsPDF('p', 'mm', 'a4')
        
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const imgAspectRatio = canvas.height / canvas.width
        
        const maxWidth = pdfWidth - 20
        const maxHeight = pdfHeight - 20
        
        let finalWidth = maxWidth
        let finalHeight = maxWidth * imgAspectRatio
        
        if (finalHeight > maxHeight) {
          finalHeight = maxHeight
          finalWidth = finalHeight / imgAspectRatio
        }
        
        const xOffset = (pdfWidth - finalWidth) / 2
        const yOffset = (pdfHeight - finalHeight) / 2
        
        pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight)
        pdf.save(`${baseFileName}.pdf`)
      } else {
        // Download as image (PNG or JPG)
        const imgData = canvas.toDataURL(`image/${format}`, format === 'jpg' ? 0.9 : 0.95)
        const link = document.createElement('a')
        link.download = `${baseFileName}.${format}`
        link.href = imgData
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
      
    } catch (error) {
      console.error(`Error generating ${format.toUpperCase()}:`, error)
      alert(`Error generating ${format.toUpperCase()}. Please try again.`)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const goToPatientPortal = () => {
    // In a real application, this would redirect to patient portal
    window.open('/patient-portal', '_blank')
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            font-size: 12px;
            line-height: 1.3;
            background: white !important;
          }
          
          .digital-actions {
            display: none !important;
          }
          
          .action-buttons {
            display: none !important;
          }
          
          .digital-prescription-container {
            border: 3px solid rgb(36,80,100) !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 15mm !important;
            border-radius: 8px !important;
            background: white !important;
            max-width: calc(210mm - 20mm - 6px) !important;
            width: 100% !important;
            page-break-inside: avoid !important;
          }
          
          .digital-header {
            background: rgb(36,80,100) !important;
            color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .digital-logo-container {
            background: rgba(255,255,255,0.9) !important;
            border: 2px solid rgba(255,255,255,0.5) !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          .digital-footer {
            background: rgb(36,80,100) !important;
            color: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Security Badge for Public View */}
          {isPublicView && (
            <div className="mb-6">
              <Card className="border-green-500 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="h-6 w-6 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-green-800">Secure Digital Prescription</h3>
                        <p className="text-sm text-green-600">
                          This is an authentic digital prescription from Gonstead Chiropractic Clinic
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Clock className="h-3 w-3 mr-1" />
                      Accessed: {new Date().toLocaleString()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Digital Actions - Only show if actions are enabled */}
          {showActions && (
            <div className="mb-6 digital-actions">
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-4 justify-center">
                    <Button 
                      onClick={handleDownloadPDF} 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                    <Button 
                      onClick={() => downloadPrescription('png')} 
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PNG
                    </Button>
                    <Button 
                      onClick={() => downloadPrescription('jpg')} 
                      variant="outline"
                      className="border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download JPG
                    </Button>
                    <Button 
                      onClick={handlePrint} 
                      variant="outline"
                      className="border-gray-400 hover:bg-gray-100"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button 
                      onClick={goToPatientPortal} 
                      variant="outline"
                      className="border-[#245064] text-[#245064] hover:bg-[#245064] hover:text-white"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Patient Portal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Digital Prescription */}
          <div 
            ref={prescriptionRef} 
            className="digital-prescription-container bg-white border-3 border-[#245064] rounded-lg shadow-2xl p-6 mx-auto"
            style={{ maxWidth: '800px' }}
          >
            {/* Header */}
            <div className="digital-header text-center border-b-3 border-[#245064] p-4 mb-6 bg-gradient-to-r from-[#245064] to-[#2e6478] text-white rounded-lg">
              <div className="digital-logo-container w-24 h-24 mx-auto mb-4 flex items-center justify-center rounded-full bg-white/90 border-2 border-white/50">
                <Image
                  src="/images/gonstead-chiropractic-logo-new.png"
                  alt="Gonstead Chiropractic Clinic Logo"
                  width={80}
                  height={80}
                  className="object-contain rounded-full"
                />
              </div>
              <div className="text-xl font-bold mb-2">GONSTEAD CHIROPRACTIC CLINIC</div>
              <div className="text-lg font-semibold mb-1">{prescription.doctor_name}</div>
              <div className="text-sm italic opacity-90">Chiropractic Specialist</div>
            </div>

            {/* Patient Information */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="text-[#245064] text-lg font-bold mb-4 border-b-2 border-[#245064] pb-2">
                Patient Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#245064] mb-1">Patient Name:</span>
                  <span className="text-base font-semibold border-b-2 border-[#245064] pb-1">
                    {prescription.patient_name}
                  </span>
                </div>
                {prescription.patient_age && (
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#245064] mb-1">Age:</span>
                    <span className="text-base font-semibold border-b-2 border-[#245064] pb-1">
                      {prescription.patient_age}
                    </span>
                  </div>
                )}
                {prescription.patient_gender && (
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#245064] mb-1">Gender:</span>
                    <span className="text-base font-semibold border-b-2 border-[#245064] pb-1 capitalize">
                      {prescription.patient_gender}
                    </span>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#245064] mb-1">Date of Visit:</span>
                  <span className="text-base font-semibold border-b-2 border-[#245064] pb-1">
                    {formatDateTime(prescription.visit_date)}
                  </span>
                </div>
                {prescription.patient_phone && (
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#245064] mb-1">Phone:</span>
                    <span className="text-base font-semibold border-b-2 border-[#245064] pb-1">
                      {prescription.patient_phone}
                    </span>
                  </div>
                )}
                {prescription.patient_email && (
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#245064] mb-1">Email:</span>
                    <span className="text-base font-semibold border-b-2 border-[#245064] pb-1">
                      {prescription.patient_email}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Conditions Display */}
            {prescription.conditions && prescription.conditions.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h4 className="text-yellow-800 font-bold text-sm mb-2">
                  Diagnosed Chiropractic Conditions:
                </h4>
                <div className="text-sm leading-relaxed text-yellow-700">
                  {prescription.conditions.map((condition, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-yellow-600">•</span>
                      <span>{condition}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Treatment Prescription */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="text-[#245064] text-lg font-bold mb-4 border-b-2 border-[#245064] pb-2">
                Treatment Prescription
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Treatment Plan */}
                <div className="bg-white border border-gray-300 rounded p-4">
                  <h4 className="text-[#245064] font-bold text-sm mb-2">Treatment Plan & Cure:</h4>
                  <div className="text-sm leading-relaxed min-h-[80px] bg-gray-50 p-3 rounded border">
                    {prescription.treatment_plan || 'No treatment plan specified'}
                  </div>
                </div>

                {/* Prescribed Medicine */}
                {prescription.prescribed_medicine && (
                  <div className="bg-white border border-gray-300 rounded p-4">
                    <h4 className="text-[#245064] font-bold text-sm mb-2">Prescribed Medicine:</h4>
                    <div className="text-sm leading-relaxed min-h-[80px] bg-gray-50 p-3 rounded border">
                      {prescription.prescribed_medicine}
                    </div>
                  </div>
                )}
              </div>

              {/* Sessions */}
              {prescription.total_sessions && (
                <div className="bg-white border border-gray-300 rounded p-4 mt-4">
                  <h4 className="text-[#245064] font-bold text-sm mb-4">Treatment Sessions:</h4>
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <div key={num} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id={`digital-session${num}`}
                          className="w-4 h-4 accent-[#245064]"
                          disabled
                        />
                        <label htmlFor={`digital-session${num}`} className="text-xs">
                          Session {num}
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <span className="font-bold text-[#245064] text-sm">Total Sessions Recommended:</span>
                    <div className="border-2 border-[#245064] rounded px-3 py-1 bg-white font-bold text-center min-w-[60px]">
                      {prescription.total_sessions}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Information */}
              {prescription.session_fee && (
                <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mt-4">
                  <h3 className="text-[#245064] text-sm font-bold mb-3 border-b-2 border-[#245064] pb-1">
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-white p-3 rounded">
                    <div>
                      <span className="text-[#245064] font-bold text-xs">Session Fee:</span>
                      <div className="text-sm font-bold">
                        Rs {prescription.session_fee}
                      </div>
                    </div>
                    <div>
                      <span className="text-[#245064] font-bold text-xs">Payment Method:</span>
                      <div className="text-sm font-bold">
                        {prescription.payment_method || '-'}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[#245064] font-bold text-xs">Payment Status:</span>
                      <div className="text-sm font-bold">
                        {prescription.payment_status || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-6 mt-6">
                <div className="text-center">
                  <div className="border-b-2 border-[#245064] h-8 mb-2"></div>
                  <div className="text-[#245064] font-bold text-xs">Patient Signature</div>
                </div>
                <div className="text-center">
                  <div className="border-b-2 border-[#245064] h-8 mb-2"></div>
                  <div className="text-[#245064] font-bold text-xs">Doctor Signature</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="digital-footer text-center bg-[#245064] text-white p-4 rounded-lg border-2 border-[#245064]">
              <div className="flex justify-between items-center text-sm">
                <div className="text-left">
                  <strong>Address:</strong> {prescription.clinic_address}
                </div>
                <div className="text-right">
                  <strong>Phone:</strong> {prescription.clinic_phone}
                </div>
              </div>
            </div>

            {/* Footer with QR Code */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-xs text-gray-500 space-y-1">
                <div>Digital Prescription ID: {prescription.id}</div>
                <div>Generated: {new Date(prescription.created_at).toLocaleString()}</div>
              </div>
              {prescription.id && (
                <QRCodeGenerator
                  data={`${typeof window !== 'undefined' ? window.location.origin : ''}/prescription/digital/${prescription.id}`}
                  size={80}
                  className="ml-4"
                />
              )}
            </div>
            
            {/* Digital Verification Info */}
            <div className="mt-2 text-center text-xs text-gray-400 space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Shield className="h-3 w-3" />
                Secured by Gonstead Chiropractic Digital System
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
