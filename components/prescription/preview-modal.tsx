"use client"

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Download, Printer, ZoomIn, ZoomOut, Eye, Loader2 } from 'lucide-react'
import { PrescriptionData } from '@/lib/prescription-types'
import Image from 'next/image'
import { QRCodeGenerator } from './qr-code-generator'

interface PreviewModalProps {
  prescription: Partial<PrescriptionData> & { patient_name: string }
  onClose: () => void
  onDownload?: (format: 'pdf' | 'png' | 'jpg') => void
  onPrint?: () => void
  showQRCode?: boolean
}

export function PreviewModal({ 
  prescription, 
  onClose, 
  onDownload,
  onPrint,
  showQRCode = true
}: PreviewModalProps) {
  const [zoom, setZoom] = useState(1)
  const [isDownloading, setIsDownloading] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.5))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5))

  const handleDownload = async (format: 'pdf' | 'png' | 'jpg') => {
    if (!onDownload) return
    setIsDownloading(true)
    try {
      await onDownload(format)
    } finally {
      setIsDownloading(false)
    }
  }

  const prescriptionUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/prescription/digital/${prescription.id || 'preview'}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-6xl my-8">
        {/* Header Controls */}
        <Card className="mb-4 shadow-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-[#245064]" />
                <h2 className="text-xl font-bold text-[#245064]">Prescription Preview</h2>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 1.5}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {onDownload && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload('pdf')}
                      disabled={isDownloading}
                      className="flex items-center gap-2"
                    >
                      {isDownloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload('png')}
                      disabled={isDownloading}
                      className="flex items-center gap-2"
                    >
                      {isDownloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      PNG
                    </Button>
                  </>
                )}
                {onPrint && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onPrint}
                    className="flex items-center gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Close
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Area */}
        <Card className="shadow-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-auto max-h-[calc(100vh-200px)] bg-gray-100 p-8">
              <div
                ref={previewRef}
                style={{ 
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.2s ease'
                }}
                className="bg-white max-w-[800px] mx-auto border-3 border-[#245064] rounded-lg shadow-xl"
              >
                {/* Prescription Content */}
                <div className="p-8">
                  {/* Header */}
                  <div className="text-center border-b-3 border-[#245064] pb-6 mb-6 bg-gradient-to-r from-[#245064] to-[#2e6478] text-white rounded-lg p-6">
                    <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center rounded-full bg-white/90 border-2 border-white/50">
                      <Image
                        src="/images/gonstead-chiropractic-logo-new.png"
                        alt="Clinic Logo"
                        width={80}
                        height={80}
                        className="object-contain rounded-full"
                      />
                    </div>
                    <div className="text-2xl font-bold mb-2">GONSTEAD CHIROPRACTIC CLINIC</div>
                    <div className="text-lg font-semibold mb-1">
                      {prescription.doctor_name || 'DR. BASHIR KHAN'}
                    </div>
                    <div className="text-sm italic opacity-90">Chiropractic Specialist</div>
                  </div>

                  {/* Patient Information */}
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-6">
                    <h3 className="text-[#245064] text-lg font-bold mb-4 border-b-2 border-[#245064] pb-2">
                      Patient Information
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm font-bold text-[#245064]">Patient Name:</span>
                        <div className="text-base font-semibold border-b-2 border-[#245064] pb-1 mt-1">
                          {prescription.patient_name || 'N/A'}
                        </div>
                      </div>
                      {prescription.patient_age && (
                        <div>
                          <span className="text-sm font-bold text-[#245064]">Age:</span>
                          <div className="text-base font-semibold border-b-2 border-[#245064] pb-1 mt-1">
                            {prescription.patient_age}
                          </div>
                        </div>
                      )}
                      {prescription.patient_gender && (
                        <div>
                          <span className="text-sm font-bold text-[#245064]">Gender:</span>
                          <div className="text-base font-semibold border-b-2 border-[#245064] pb-1 mt-1 capitalize">
                            {prescription.patient_gender}
                          </div>
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-bold text-[#245064]">Date of Visit:</span>
                        <div className="text-base font-semibold border-b-2 border-[#245064] pb-1 mt-1">
                          {prescription.visit_date ? new Date(prescription.visit_date).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conditions */}
                  {prescription.conditions && prescription.conditions.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <h4 className="text-yellow-800 font-bold text-sm mb-2">
                        Diagnosed Chiropractic Conditions:
                      </h4>
                      <div className="text-sm text-yellow-700 space-y-1">
                        {prescription.conditions.map((condition, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span>•</span>
                            <span>{condition}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Treatment Plan */}
                  <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-6">
                    <h3 className="text-[#245064] text-lg font-bold mb-4 border-b-2 border-[#245064] pb-2">
                      Treatment Prescription
                    </h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white border border-gray-300 rounded p-4">
                        <h4 className="text-[#245064] font-bold text-sm mb-2">Treatment Plan:</h4>
                        <div className="text-sm leading-relaxed min-h-[60px] bg-gray-50 p-3 rounded">
                          {prescription.treatment_plan || 'No treatment plan specified'}
                        </div>
                      </div>
                      {prescription.prescribed_medicine && (
                        <div className="bg-white border border-gray-300 rounded p-4">
                          <h4 className="text-[#245064] font-bold text-sm mb-2">Prescribed Medicine:</h4>
                          <div className="text-sm leading-relaxed min-h-[60px] bg-gray-50 p-3 rounded">
                            {prescription.prescribed_medicine}
                          </div>
                        </div>
                      )}
                    </div>

                    {prescription.total_sessions && (
                      <div className="bg-white border border-gray-300 rounded p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#245064]">Total Sessions:</span>
                          <div className="border-2 border-[#245064] rounded px-4 py-2 bg-white font-bold">
                            {prescription.total_sessions}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Signatures */}
                    <div className="grid grid-cols-2 gap-6 mt-6">
                      <div className="text-center">
                        <div className="border-b-2 border-[#245064] h-12 mb-2"></div>
                        <div className="text-[#245064] font-bold text-sm">Patient Signature</div>
                      </div>
                      <div className="text-center">
                        <div className="border-b-2 border-[#245064] h-12 mb-2"></div>
                        <div className="text-[#245064] font-bold text-sm">Doctor Signature</div>
                      </div>
                    </div>
                  </div>

                  {/* Footer with QR Code */}
                  <div className="flex items-center justify-between bg-[#245064] text-white p-4 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm">
                        <strong>Address:</strong> Near Peshawar Model School, Tehsil Road Nowshera, KPK
                      </div>
                      <div className="text-sm mt-1">
                        <strong>Phone:</strong> +923046996267
                      </div>
                    </div>
                    {showQRCode && prescription.id && (
                      <div className="ml-4">
                        <QRCodeGenerator 
                          data={prescriptionUrl}
                          size={80}
                          className="bg-white p-2 rounded"
                        />
                      </div>
                    )}
                  </div>

                  {/* Digital ID */}
                  <div className="mt-4 text-center text-xs text-gray-500">
                    <div>Prescription ID: {prescription.id || 'PREVIEW'}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

