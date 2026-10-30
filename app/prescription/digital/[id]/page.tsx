"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DigitalPrescription } from '@/components/digital-prescription'
import { PrescriptionData, PrescriptionLookupResult } from '@/lib/prescription-types'
import { prescriptionTracker } from '@/lib/prescription-tracking'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Loader2, ShieldX, Activity, FileText } from 'lucide-react'

export default function DigitalPrescriptionPage() {
  const params = useParams()
  const router = useRouter()
  const prescriptionId = params.id as string

  const [lookupResult, setLookupResult] = useState<PrescriptionLookupResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPrescriptionData()
  }, [prescriptionId])

  const loadPrescriptionData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Use the new prescription tracking service
      const result = await prescriptionTracker.lookupByPrescriptionId(prescriptionId)
      setLookupResult(result)
      
      if (!result.found) {
        setError(result.error || 'Prescription not found.')
      }
      
      setLoading(false)
    } catch (err) {
      console.error('Error loading prescription:', err)
      setError('Failed to load prescription. Please try again.')
      setLoading(false)
    }
  }

  const handleViewFullTracking = () => {
    router.push(`/patient-tracking?id=${prescriptionId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#245064] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Digital Prescription</h2>
            <p className="text-gray-600">Validating access and retrieving prescription data...</p>
            <div className="mt-4 bg-gradient-to-r from-[#245064] to-[#2e6478] h-2 rounded-full animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || (lookupResult && !lookupResult.found)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 border-red-300">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Prescription Not Found</h2>
            <p className="text-red-600 mb-4">{error || 'The requested prescription could not be located.'}</p>
            <div className="bg-red-100 p-4 rounded-lg border border-red-200 mb-4">
              <p className="text-sm text-red-700">
                <strong>Note:</strong> Please verify the prescription ID and ensure you have the correct access link.
              </p>
            </div>
            <Button 
              onClick={() => router.push('/patient-tracking')}
              variant="outline"
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              Try Patient Tracking Lookup
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!lookupResult?.prescription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No Data Available</h2>
            <p className="text-gray-600">Prescription data could not be loaded.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Patient Tracking Quick Access */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6" />
            <div>
              <h3 className="font-semibold">Complete Patient Tracking Available</h3>
              <p className="text-sm opacity-90">View comprehensive treatment history, progress, and session details</p>
            </div>
          </div>
          <Button 
            onClick={handleViewFullTracking}
            variant="secondary"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <Activity className="h-4 w-4 mr-2" />
            View Full Tracking
          </Button>
        </div>
      </div>

      {/* Digital Prescription Display */}
      <DigitalPrescription 
        prescription={lookupResult.prescription} 
        isPublicView={true}
        showActions={true}
      />
    </div>
  )
}
