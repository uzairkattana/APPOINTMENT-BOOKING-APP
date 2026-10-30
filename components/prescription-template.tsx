"use client"

import React from "react"

interface PrescriptionTemplateProps {
  patient: {
    name: string
    phone: string
    email?: string
    session_type: "in_clinic" | "video"
    notes?: string
  }
  prescriptionNotes: string
  prescriptionMedicine: string
  chiropracticSuggestions: string[]
}

export const PrescriptionTemplate: React.FC<PrescriptionTemplateProps> = () => {
  return (
    <div className="prescription-wrapper">
      {/* Empty Background Only */}
      <div
        id="prescription-content"
        className="prescription-container bg-gradient-to-br from-gray-50 to-white shadow-2xl rounded-lg overflow-hidden"
        style={{
          width: "210mm",
          height: "280mm",
          maxHeight: "280mm",
          margin: "0 auto",
          fontFamily: "'Times New Roman', serif",
          fontSize: "13px",
          lineHeight: "1.5",
          color: "#000",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Just Empty Space with Subtle Background */}
        <div className="flex-1 p-8">
          <div className="h-full border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-lg font-medium">Prescription Template</p>
              <p className="text-sm">Background Only</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
