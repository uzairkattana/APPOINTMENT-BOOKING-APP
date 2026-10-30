"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Search,
  User,
  Calendar,
  TrendingUp,
  Activity,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Download,
  RefreshCw,
  Heart,
  Stethoscope,
  Users,
  Target
} from 'lucide-react'

import { PatientTracking, PrescriptionLookupResult } from '@/lib/prescription-types'
import { prescriptionTracker } from '@/lib/prescription-tracking'

interface PatientTrackingDashboardProps {
  initialPrescriptionId?: string
}

export function PatientTrackingDashboard({ initialPrescriptionId }: PatientTrackingDashboardProps) {
  const [prescriptionId, setPrescriptionId] = useState(initialPrescriptionId || '')
  const [loading, setLoading] = useState(false)
  const [lookupResult, setLookupResult] = useState<PrescriptionLookupResult | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (initialPrescriptionId) {
      handleLookup()
    }
  }, [initialPrescriptionId])

  const handleLookup = async () => {
    if (!prescriptionId.trim()) {
      setLookupResult({
        found: false,
        error: 'Please enter a prescription ID',
        access_info: { accessed_at: new Date().toISOString(), access_count: 0 }
      })
      return
    }

    setLoading(true)
    try {
      const result = await prescriptionTracker.lookupByPrescriptionId(prescriptionId.trim())
      setLookupResult(result)
    } catch (error) {
      setLookupResult({
        found: false,
        error: 'An error occurred during lookup',
        access_info: { accessed_at: new Date().toISOString(), access_count: 0 }
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = async () => {
    if (!lookupResult?.found) return
    
    try {
      const report = await prescriptionTracker.generateTrackingReport(prescriptionId)
      
      // Create and download the report as a text file
      const blob = new Blob([report], { type: 'text/plain' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `patient-tracking-report-${prescriptionId}-${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report. Please try again.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getProgressColor = (progress: string) => {
    switch (progress) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200'
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'fair': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'poor': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getProgressPercentage = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            Patient Tracking Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive patient monitoring system powered by prescription ID lookup
          </p>
        </div>

        {/* Search Section */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Search className="h-5 w-5" />
              Prescription Lookup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 max-w-2xl mx-auto">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter Prescription ID (e.g., PRESC-2024-001)"
                  value={prescriptionId}
                  onChange={(e) => setPrescriptionId(e.target.value)}
                  className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleLookup()}
                />
              </div>
              <Button
                onClick={handleLookup}
                disabled={loading}
                className="h-12 px-8 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-semibold"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Lookup Patient
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {lookupResult && (
          <div className="space-y-6">
            {!lookupResult.found ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {lookupResult.error || 'Prescription not found. Please check the ID and try again.'}
                </AlertDescription>
              </Alert>
            ) : (
              lookupResult.patient_tracking && (
                <>
                  {/* Patient Overview Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-100 text-sm">Total Visits</p>
                            <p className="text-3xl font-bold">{lookupResult.patient_tracking.summary.total_visits}</p>
                          </div>
                          <Users className="h-8 w-8 text-blue-200" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-teal-100 text-sm">Progress</p>
                            <p className="text-3xl font-bold capitalize">{lookupResult.patient_tracking.summary.overall_progress}</p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-teal-200" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-100 text-sm">Sessions</p>
                            <p className="text-3xl font-bold">
                              {lookupResult.patient_tracking.summary.completed_sessions}/
                              {lookupResult.patient_tracking.summary.completed_sessions + lookupResult.patient_tracking.summary.remaining_sessions}
                            </p>
                          </div>
                          <Activity className="h-8 w-8 text-green-200" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-100 text-sm">Pain Relief</p>
                            <p className="text-3xl font-bold">{lookupResult.patient_tracking.summary.average_pain_improvement}/10</p>
                          </div>
                          <Heart className="h-8 w-8 text-purple-200" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Main Content Tabs */}
                  <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-2xl text-gray-800">
                            {lookupResult.patient_tracking.patient_info.name}
                          </CardTitle>
                          <p className="text-gray-600 mt-1">
                            Patient ID: {lookupResult.patient_tracking.patient_id} | 
                            Prescription ID: {lookupResult.patient_tracking.prescription_id}
                          </p>
                        </div>
                        <Button onClick={handleDownloadReport} variant="outline" className="gap-2">
                          <Download className="h-4 w-4" />
                          Download Report
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6">
                      <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-5">
                          <TabsTrigger value="overview">Overview</TabsTrigger>
                          <TabsTrigger value="visits">Visit History</TabsTrigger>
                          <TabsTrigger value="progress">Progress</TabsTrigger>
                          <TabsTrigger value="sessions">Sessions</TabsTrigger>
                          <TabsTrigger value="prescription">Prescription</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6 mt-6">
                          {/* Patient Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <User className="h-5 w-5" />
                                  Patient Information
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-600">Name</p>
                                    <p className="font-semibold">{lookupResult.patient_tracking.patient_info.name}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">Age</p>
                                    <p className="font-semibold">{lookupResult.patient_tracking.patient_info.age}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">Gender</p>
                                    <p className="font-semibold capitalize">{lookupResult.patient_tracking.patient_info.gender}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">Joining Date</p>
                                    <p className="font-semibold">{formatDate(lookupResult.patient_tracking.patient_info.joining_date)}</p>
                                  </div>
                                </div>
                                
                                <Separator />
                                
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <span>{lookupResult.patient_tracking.patient_info.phone}</span>
                                  </div>
                                  {lookupResult.patient_tracking.patient_info.email && (
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-4 w-4 text-gray-500" />
                                      <span>{lookupResult.patient_tracking.patient_info.email}</span>
                                    </div>
                                  )}
                                  {lookupResult.patient_tracking.patient_info.address && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-gray-500" />
                                      <span>{lookupResult.patient_tracking.patient_info.address}</span>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>

                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                  <Target className="h-5 w-5" />
                                  Treatment Summary
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="space-y-4">
                                  <div>
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-sm text-gray-600">Treatment Progress</span>
                                      <Badge className={getProgressColor(lookupResult.patient_tracking.summary.overall_progress)}>
                                        {lookupResult.patient_tracking.summary.overall_progress}
                                      </Badge>
                                    </div>
                                    <Progress 
                                      value={getProgressPercentage(
                                        lookupResult.patient_tracking.summary.completed_sessions,
                                        lookupResult.patient_tracking.summary.completed_sessions + lookupResult.patient_tracking.summary.remaining_sessions
                                      )}
                                      className="h-2"
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="text-gray-600">Duration</p>
                                      <p className="font-semibold">{lookupResult.patient_tracking.summary.treatment_duration_days} days</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Last Visit</p>
                                      <p className="font-semibold">{formatDate(lookupResult.patient_tracking.summary.last_visit_date)}</p>
                                    </div>
                                  </div>

                                  <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                      <Activity className="h-4 w-4 text-blue-600" />
                                      <span className="text-sm font-medium text-blue-800">Pain Improvement</span>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-600">
                                      {lookupResult.patient_tracking.summary.average_pain_improvement}/10
                                    </p>
                                    <p className="text-xs text-blue-600">Average improvement per session</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          {/* Conditions */}
                          {lookupResult.patient_tracking.prescription_details.conditions && 
                           lookupResult.patient_tracking.prescription_details.conditions.length > 0 && (
                            <Card>
                              <CardHeader>
                                <CardTitle>Current Conditions</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="flex flex-wrap gap-2">
                                  {lookupResult.patient_tracking.prescription_details.conditions.map((condition, index) => (
                                    <Badge key={index} variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                      {condition}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </TabsContent>

                        <TabsContent value="visits" className="mt-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Visit History ({lookupResult.patient_tracking.visit_history.length} visits)
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {lookupResult.patient_tracking.visit_history.map((visit, index) => (
                                  <Card key={visit.id} className="border-l-4 border-l-blue-500">
                                    <CardContent className="p-4">
                                      <div className="flex items-start justify-between mb-3">
                                        <div>
                                          <div className="flex items-center gap-2 mb-1">
                                            <Badge variant={visit.status === 'completed' ? 'default' : 'secondary'}>
                                              {visit.visit_type}
                                            </Badge>
                                            <span className="text-sm text-gray-500">Session #{visit.session_number}</span>
                                          </div>
                                          <p className="font-semibold">{formatDateTime(visit.visit_date)}</p>
                                        </div>
                                        <Badge className={visit.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                                          {visit.status}
                                        </Badge>
                                      </div>

                                      <div className="space-y-2">
                                        <div>
                                          <p className="text-sm font-medium text-gray-700">Chief Complaint:</p>
                                          <p className="text-sm text-gray-600">{visit.chief_complaint}</p>
                                        </div>

                                        <div>
                                          <p className="text-sm font-medium text-gray-700">Treatment Given:</p>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {visit.treatment_given.map((treatment, i) => (
                                              <Badge key={i} variant="outline" className="text-xs">
                                                {treatment}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>

                                        <div>
                                          <p className="text-sm font-medium text-gray-700">Doctor's Notes:</p>
                                          <p className="text-sm text-gray-600">{visit.doctor_notes}</p>
                                        </div>

                                        {visit.next_visit_date && (
                                          <div className="bg-blue-50 p-2 rounded">
                                            <p className="text-xs text-blue-700">
                                              <Clock className="h-3 w-3 inline mr-1" />
                                              Next visit: {formatDateTime(visit.next_visit_date)}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="progress" className="mt-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" />
                                Progress Tracking
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-6">
                                {lookupResult.patient_tracking.progress_tracking.map((progress, index) => (
                                  <Card key={progress.id} className="bg-gray-50">
                                    <CardContent className="p-4">
                                      <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-semibold">{formatDate(progress.assessment_date)}</h4>
                                        <Badge className={getProgressColor(progress.treatment_effectiveness)}>
                                          {progress.treatment_effectiveness}
                                        </Badge>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="text-center">
                                          <p className="text-sm text-gray-600">Pain Before</p>
                                          <p className="text-2xl font-bold text-red-500">{progress.pain_level_before}/10</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-sm text-gray-600">Pain After</p>
                                          <p className="text-2xl font-bold text-green-500">{progress.pain_level_after}/10</p>
                                        </div>
                                        <div className="text-center">
                                          <p className="text-sm text-gray-600">Mobility Score</p>
                                          <p className="text-2xl font-bold text-blue-500">{progress.mobility_score}/10</p>
                                        </div>
                                      </div>

                                      <div className="space-y-2">
                                        <div>
                                          <p className="text-sm font-medium text-gray-700">Improvement Notes:</p>
                                          <p className="text-sm text-gray-600">{progress.improvement_notes}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-700">Doctor's Assessment:</p>
                                          <p className="text-sm text-gray-600">{progress.doctor_assessment}</p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="sessions" className="mt-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Treatment Sessions
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                {lookupResult.patient_tracking.treatment_sessions.map((session, index) => (
                                  <Card key={session.id} className="border-l-4 border-l-green-500">
                                    <CardContent className="p-4">
                                      <div className="flex items-start justify-between mb-3">
                                        <div>
                                          <h4 className="font-semibold">Session #{session.session_number}</h4>
                                          <p className="text-sm text-gray-600">{formatDateTime(session.session_date)} • {session.duration_minutes} mins</p>
                                        </div>
                                        <Badge className={session.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                                          {session.payment_status}
                                        </Badge>
                                      </div>

                                      <div className="space-y-3">
                                        <div>
                                          <p className="text-sm font-medium text-gray-700">Techniques Used:</p>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {session.techniques_used.map((technique, i) => (
                                              <Badge key={i} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                                {technique}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>

                                        <div>
                                          <p className="text-sm font-medium text-gray-700">Areas Treated:</p>
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            {session.areas_treated.map((area, i) => (
                                              <Badge key={i} variant="outline" className="text-xs bg-purple-50 text-purple-700">
                                                {area}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>

                                        <div>
                                          <p className="text-sm font-medium text-gray-700">Patient Feedback:</p>
                                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{session.patient_feedback}</p>
                                        </div>

                                        <div>
                                          <p className="text-sm font-medium text-gray-700">Doctor's Notes:</p>
                                          <p className="text-sm text-gray-600">{session.doctor_notes}</p>
                                        </div>

                                        {session.homework_assigned && session.homework_assigned.length > 0 && (
                                          <div>
                                            <p className="text-sm font-medium text-gray-700">Homework Assigned:</p>
                                            <ul className="text-sm text-gray-600 list-disc list-inside mt-1">
                                              {session.homework_assigned.map((homework, i) => (
                                                <li key={i}>{homework}</li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}

                                        <div className="bg-blue-50 p-2 rounded">
                                          <p className="text-xs text-blue-700 font-medium">Next Session Plan:</p>
                                          <p className="text-xs text-blue-600">{session.next_session_plan}</p>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        <TabsContent value="prescription" className="mt-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Prescription Details
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h4 className="font-semibold mb-3">Treatment Plan</h4>
                                  <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm leading-relaxed">
                                      {lookupResult.patient_tracking.prescription_details.treatment_plan}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-3">Prescribed Medicine</h4>
                                  <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm leading-relaxed text-green-800">
                                      {lookupResult.patient_tracking.prescription_details.prescribed_medicine || 'No medication prescribed'}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center bg-blue-50 p-4 rounded-lg">
                                  <p className="text-sm text-blue-600">Total Sessions</p>
                                  <p className="text-2xl font-bold text-blue-800">
                                    {lookupResult.patient_tracking.prescription_details.total_sessions}
                                  </p>
                                </div>
                                <div className="text-center bg-green-50 p-4 rounded-lg">
                                  <p className="text-sm text-green-600">Session Fee</p>
                                  <p className="text-2xl font-bold text-green-800">
                                    Rs {lookupResult.patient_tracking.prescription_details.session_fee}
                                  </p>
                                </div>
                                <div className="text-center bg-purple-50 p-4 rounded-lg">
                                  <p className="text-sm text-purple-600">Payment Status</p>
                                  <p className="text-lg font-bold text-purple-800 capitalize">
                                    {lookupResult.patient_tracking.prescription_details.payment_status}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-semibold mb-3">Clinic Information</h4>
                                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                  <div className="flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium">{lookupResult.patient_tracking.prescription_details.doctor_name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">{lookupResult.patient_tracking.prescription_details.clinic_address}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm">{lookupResult.patient_tracking.prescription_details.clinic_phone}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}
