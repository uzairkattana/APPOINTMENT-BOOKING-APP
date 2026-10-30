"use client"

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { PatientTrackingDashboard } from '@/components/patient-tracking-dashboard'

function PatientTrackingContent() {
  const searchParams = useSearchParams()
  const prescriptionId = searchParams.get('id')

  return <PatientTrackingDashboard initialPrescriptionId={prescriptionId || undefined} />
}

export default function PatientTrackingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d5c75] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading patient tracking...</p>
      </div>
    </div>}>
      <PatientTrackingContent />
    </Suspense>
  )
}
