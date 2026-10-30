"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Phone, 
  Mail, 
  Calendar, 
  User, 
  FileText, 
  Stethoscope,
  Activity,
  Heart,
  Printer
} from "lucide-react"

interface MedicalRecord {
  id: string
  patientName: string
  age: number
  gender: string
  phone: string
  email: string
  lastVisit: string
  diagnosis: string
  treatmentType: string
  status: string
  sessionsCompleted: number
  totalSessions: number
  nextAppointment: string
  chiefComplaint: string
  medicalHistory: string
  currentMedications: string
  treatmentPlan: string
  progress: string
  doctorNotes: string
}

interface ProfessionalMedicalRecordProps {
  record: MedicalRecord
  onPrint?: () => void
}

export function ProfessionalMedicalRecord({ record, onPrint }: ProfessionalMedicalRecordProps) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint()
    } else {
      window.print()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "ongoing":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "completed":
        return "bg-green-50 text-green-700 border-green-200"
      case "follow-up":
        return "bg-amber-50 text-amber-700 border-amber-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const progressPercentage = (record.sessionsCompleted / record.totalSessions) * 100

  return (
    <>
      {/* Optimized Print Styles for Single Page */}
      <style jsx global>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          body {
            margin: 0 !important;
            padding: 0 !important;
            font-family: 'Arial', sans-serif !important;
            font-size: 11px !important;
            line-height: 1.3 !important;
            color: #333 !important;
          }
          
          .print-container {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 10px !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            font-size: 11px !important;
          }
          
          .print-header {
            text-align: center !important;
            margin-bottom: 10px !important;
            padding: 10px 0 8px 0 !important;
            border-bottom: 2px solid #0d5c75 !important;
          }
          
          .print-logo {
            width: 40px !important;
            height: 40px !important;
            margin: 0 auto 6px !important;
            display: block !important;
          }
          
          .print-clinic-name {
            color: #0d5c75 !important;
            font-size: 18px !important;
            font-weight: bold !important;
            margin: 3px 0 2px 0 !important;
          }
          
          .print-doctor-name {
            color: #666 !important;
            font-size: 12px !important;
            margin: 2px 0 !important;
          }
          
          .print-contact {
            color: #888 !important;
            font-size: 10px !important;
            margin-top: 3px !important;
            line-height: 1.2 !important;
          }
          
          .print-record-id {
            background: #f8f9fa !important;
            padding: 6px 10px !important;
            border-radius: 5px !important;
            margin: 8px 0 !important;
            text-align: center !important;
            border: 1px solid #e9ecef !important;
            font-size: 10px !important;
          }
          
          .print-section {
            margin: 8px 0 !important;
            page-break-inside: avoid !important;
          }
          
          .print-section-title {
            color: #0d5c75 !important;
            font-size: 13px !important;
            font-weight: bold !important;
            margin-bottom: 5px !important;
            padding-bottom: 3px !important;
            border-bottom: 1px solid #ddd !important;
          }
          
          .print-grid {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
            margin: 5px 0 !important;
          }
          
          .print-grid-3 {
            display: grid !important;
            grid-template-columns: 1fr 1fr 1fr !important;
            gap: 10px !important;
            margin: 5px 0 !important;
          }
          
          .print-item {
            margin: 4px 0 !important;
          }
          
          .print-label {
            font-weight: bold !important;
            color: #333 !important;
            font-size: 10px !important;
            margin-bottom: 2px !important;
          }
          
          .print-value {
            color: #555 !important;
            font-size: 10px !important;
            line-height: 1.3 !important;
          }
          
          .print-badge {
            display: inline-block !important;
            padding: 2px 8px !important;
            border-radius: 10px !important;
            font-size: 9px !important;
            font-weight: 600 !important;
            border: 1px solid !important;
          }
          
          .print-progress {
            margin: 5px 0 !important;
          }
          
          .print-progress-bar {
            width: 100% !important;
            height: 7px !important;
            background: #e9ecef !important;
            border-radius: 4px !important;
            overflow: hidden !important;
            margin: 3px 0 !important;
          }
          
          .print-progress-fill {
            height: 100% !important;
            background: #28a745 !important;
            border-radius: 4px !important;
          }
          
          .print-footer {
            text-align: center !important;
            margin-top: 10px !important;
            padding-top: 8px !important;
            border-top: 1px solid #ddd !important;
            font-size: 9px !important;
            color: #666 !important;
            line-height: 1.2 !important;
          }
          
          .compact-text {
            font-size: 9px !important;
            line-height: 1.2 !important;
            padding: 3px 6px !important;
            margin: 3px 0 !important;
          }
          
          .no-print {
            display: none !important;
          }
        }
        
        @page {
          size: A4 !important;
          margin: 0.4in !important;
        }
      `}</style>

      <div className="print-container max-w-4xl mx-auto bg-white shadow-2xl border border-gray-200">
        {/* Professional Header with Logo */}
        <div className="print-header bg-gradient-to-r from-[#0d5c75] to-[#428b7c] text-white p-6 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 w-16 h-16 border-2 border-white/30 rounded-full"></div>
            <div className="absolute bottom-4 right-4 w-12 h-12 border-2 border-white/20 rounded-full"></div>
            <div className="absolute top-8 right-8 w-8 h-8 border border-white/25 rotate-45"></div>
          </div>
          
          <div className="relative z-10 text-center">
            {/* Clinic Logo */}
            <div className="flex justify-center mb-4">
              <div className="print-logo w-16 h-16 bg-white/15 rounded-full p-2 backdrop-blur-sm border-2 border-white/20">
                <img
                  src="/images/gonstead-logo-new.png"
                  alt="Gonstead Chiropractic Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            <h1 className="print-clinic-name text-2xl font-bold mb-2">
              Gonstead Chiropractic Clinic
            </h1>
            <p className="print-doctor-name text-lg text-white/90 mb-1">
              Dr. Bashir Khan - Gonstead Specialist
            </p>
            <div className="print-contact text-sm text-white/80">
              <p>Near Peshawar Model School, Tehsil Road, Nowshera</p>
              <p>📞 +92 304 699 6267 | 🌐 gonsteadclinic.com</p>
            </div>
          </div>
        </div>

        {/* Compact Medical Record Content */}
        <div className="p-3 space-y-3">
          {/* Record Header - Compact */}
          <div className="print-record-id flex items-center justify-between bg-gray-50 p-2 rounded border">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#0d5c75]" />
              <div>
                <p className="font-bold text-[#0d5c75] text-sm">Medical Record #{record.id}</p>
                <p className="text-xs text-gray-600">Generated: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="no-print">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1 px-3 py-1 bg-[#0d5c75] text-white rounded text-sm hover:bg-[#0a4a5c] transition-colors"
              >
                <Printer className="h-3 w-3" />
                Print
              </button>
            </div>
          </div>

          {/* Patient Information - 3 Column Grid */}
          <div className="print-section">
            <h2 className="print-section-title flex items-center gap-1 text-[#0d5c75] text-sm font-bold mb-2">
              <User className="h-3 w-3" />
              Patient Information
            </h2>
            <div className="print-grid-3 grid grid-cols-3 gap-4">
              <div className="print-item">
                <p className="print-label">Name:</p>
                <p className="print-value font-semibold text-[#0d5c75]">{record.patientName}</p>
              </div>
              <div className="print-item">
                <p className="print-label">Age/Gender:</p>
                <p className="print-value">{record.age}y • {record.gender}</p>
              </div>
              <div className="print-item">
                <p className="print-label">Phone:</p>
                <p className="print-value">{record.phone}</p>
              </div>
              <div className="print-item">
                <p className="print-label">Email:</p>
                <p className="print-value text-xs">{record.email}</p>
              </div>
              <div className="print-item">
                <p className="print-label">Last Visit:</p>
                <p className="print-value">{record.lastVisit}</p>
              </div>
              <div className="print-item">
                <p className="print-label">Status:</p>
                <Badge className={`print-badge ${getStatusColor(record.status)}`}>
                  {record.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Clinical Assessment - 2 Column */}
          <div className="print-section">
            <h2 className="print-section-title flex items-center gap-1 text-[#0d5c75] text-sm font-bold mb-2">
              <Stethoscope className="h-3 w-3" />
              Clinical Assessment
            </h2>
            <div className="print-grid grid grid-cols-2 gap-4">
              <div>
                <p className="print-label">Chief Complaint:</p>
                <p className="compact-text bg-blue-50 border-l-2 border-blue-400 rounded">
                  {record.chiefComplaint}
                </p>
              </div>
              <div>
                <p className="print-label">Diagnosis:</p>
                <p className="compact-text bg-green-50 border-l-2 border-green-400 rounded font-semibold">
                  {record.diagnosis}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <p className="print-label">Treatment Type:</p>
              <p className="compact-text bg-purple-50 border-l-2 border-purple-400 rounded">
                {record.treatmentType}
              </p>
            </div>
          </div>

          {/* Treatment Progress - Inline */}
          <div className="print-section">
            <h2 className="print-section-title flex items-center gap-1 text-[#0d5c75] text-sm font-bold mb-2">
              <Activity className="h-3 w-3" />
              Progress & Next Steps
            </h2>
            <div className="print-grid grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="print-label text-xs">Sessions: {record.sessionsCompleted}/{record.totalSessions}</p>
                  <p className="text-xs font-bold text-[#0d5c75]">{progressPercentage.toFixed(0)}%</p>
                </div>
                <div className="print-progress-bar">
                  <div 
                    className="print-progress-fill bg-gradient-to-r from-[#0d5c75] to-[#428b7c]"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <p className="print-label">Next Appointment:</p>
                <p className="print-value text-[#0d5c75] font-semibold">{record.nextAppointment}</p>
              </div>
            </div>
            <div className="mt-2">
              <p className="print-label">Progress Summary:</p>
              <p className="compact-text bg-green-50 border-l-2 border-green-400 rounded">
                {record.progress}
              </p>
            </div>
          </div>

          {/* Medical History & Medications - Compact 2 Column */}
          <div className="print-section">
            <h2 className="print-section-title text-[#0d5c75] text-sm font-bold mb-2">
              Medical History & Medications
            </h2>
            <div className="print-grid grid grid-cols-2 gap-4">
              <div>
                <p className="print-label">Medical History:</p>
                <p className="compact-text bg-yellow-50 border-l-2 border-yellow-400 rounded">
                  {record.medicalHistory}
                </p>
              </div>
              <div>
                <p className="print-label">Current Medications:</p>
                <p className="compact-text bg-orange-50 border-l-2 border-orange-400 rounded">
                  {record.currentMedications}
                </p>
              </div>
            </div>
          </div>

          {/* Treatment Plan & Doctor's Notes - Combined */}
          <div className="print-section">
            <h2 className="print-section-title text-[#0d5c75] text-sm font-bold mb-2">
              Treatment Plan & Clinical Notes
            </h2>
            <div className="space-y-2">
              <div>
                <p className="print-label">Treatment Plan:</p>
                <p className="compact-text bg-blue-50 border-l-2 border-blue-400 rounded">
                  {record.treatmentPlan}
                </p>
              </div>
              <div>
                <p className="print-label">Doctor's Notes:</p>
                <p className="compact-text bg-green-50 border-l-2 border-green-400 rounded">
                  {record.doctorNotes}
                </p>
              </div>
            </div>
          </div>

          {/* Compact Professional Footer */}
          <div className="print-footer border-t border-[#0d5c75] pt-2 mt-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-4 h-4">
                <img
                  src="/images/gonstead-logo-new.png"
                  alt="Logo"
                  className="w-full h-full object-contain opacity-70"
                />
              </div>
              <p className="text-[#0d5c75] font-bold text-xs">Gonstead Chiropractic Excellence</p>
            </div>
            <p className="text-gray-600 text-xs text-center mb-1">
              Confidential medical record - Unauthorized disclosure prohibited
            </p>
            <div className="flex items-center justify-center text-xs text-gray-500">
              <span>© 2024 Gonstead Clinic • Dr. Bashir Khan • Nowshera</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
