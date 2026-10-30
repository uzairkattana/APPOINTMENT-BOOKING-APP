"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { VoiceNotificationControls } from "@/components/voice-notification-controls"
import { DoctorNotifications, useNotifications } from "@/components/doctor-notifications"
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  User,
  Play,
  Sparkles
} from "lucide-react"

export default function VoiceNotificationDemo() {
  const {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    clearAll
  } = useNotifications()

  const [demoCount, setDemoCount] = useState(1)

  const testNormalNotification = () => {
    addNotification({
      type: "appointment",
      patientName: `Ahmad Hassan #${demoCount}`,
      appointmentId: `APT-${Date.now().toString().slice(-6)}`,
      phoneNumber: "+92 300 1234567",
      appointmentTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      sessionType: "in_clinic",
      urgency: "normal",
      message: "Patient has scheduled a routine checkup appointment"
    })
    setDemoCount(prev => prev + 1)
  }

  const testUrgentNotification = () => {
    addNotification({
      type: "appointment",
      patientName: `Fatima Sheikh #${demoCount}`,
      appointmentId: `URG-${Date.now().toString().slice(-6)}`,
      phoneNumber: "+92 321 9876543",
      appointmentTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      sessionType: "video",
      urgency: "urgent",
      message: "Patient requesting urgent video consultation for back pain"
    })
    setDemoCount(prev => prev + 1)
  }

  const testEmergencyNotification = () => {
    addNotification({
      type: "emergency",
      patientName: `Ali Raza #${demoCount}`,
      appointmentId: `EMR-${Date.now().toString().slice(-6)}`,
      phoneNumber: "+92 345 7654321",
      appointmentTime: new Date().toISOString(),
      sessionType: "emergency",
      urgency: "emergency",
      message: "Emergency case: Severe spinal injury requiring immediate attention!"
    })
    setDemoCount(prev => prev + 1)
  }

  const testReminderNotification = () => {
    addNotification({
      type: "reminder",
      patientName: `Zainab Malik #${demoCount}`,
      appointmentId: `RMD-${Date.now().toString().slice(-6)}`,
      phoneNumber: "+92 333 2468135",
      appointmentTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      sessionType: "in_clinic",
      urgency: "normal",
      message: "Follow-up appointment reminder for post-treatment checkup"
    })
    setDemoCount(prev => prev + 1)
  }

  const testMultiple = () => {
    testNormalNotification()
    setTimeout(() => testUrgentNotification(), 2000)
    setTimeout(() => testEmergencyNotification(), 4000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Sparkles className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Professional Voice Notification System
            </h1>
            <Sparkles className="h-10 w-10 text-purple-600" />
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience unique, professional, and outstanding soft voice notifications
            designed specifically for healthcare professionals
          </p>
        </div>

        {/* Demo Controls */}
        <Card className="border-2 border-purple-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-purple-600" />
              Test Notifications
            </CardTitle>
            <CardDescription>
              Click any button below to test different notification types with voice
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Normal Notification */}
              <Button
                onClick={testNormalNotification}
                className="h-24 flex flex-col gap-2 bg-green-500 hover:bg-green-600"
              >
                <User className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Normal</div>
                  <div className="text-xs opacity-90">Regular Appointment</div>
                </div>
              </Button>

              {/* Urgent Notification */}
              <Button
                onClick={testUrgentNotification}
                className="h-24 flex flex-col gap-2 bg-orange-500 hover:bg-orange-600"
              >
                <Clock className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Urgent</div>
                  <div className="text-xs opacity-90">High Priority</div>
                </div>
              </Button>

              {/* Emergency Notification */}
              <Button
                onClick={testEmergencyNotification}
                className="h-24 flex flex-col gap-2 bg-red-500 hover:bg-red-600"
              >
                <AlertTriangle className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Emergency</div>
                  <div className="text-xs opacity-90">Immediate Action</div>
                </div>
              </Button>

              {/* Reminder Notification */}
              <Button
                onClick={testReminderNotification}
                className="h-24 flex flex-col gap-2 bg-blue-500 hover:bg-blue-600"
              >
                <Bell className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-semibold">Reminder</div>
                  <div className="text-xs opacity-90">Follow-up Alert</div>
                </div>
              </Button>
            </div>

            {/* Batch Actions */}
            <div className="mt-4 flex gap-2">
              <Button
                onClick={testMultiple}
                variant="outline"
                className="flex-1 border-purple-300 hover:bg-purple-50"
              >
                Test Multiple (3 notifications)
              </Button>
              <Button
                onClick={clearAll}
                variant="outline"
                className="flex-1 border-gray-300 hover:bg-gray-50"
                disabled={notifications.length === 0}
              >
                Clear All ({notifications.length})
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
                  <div className="text-sm text-blue-600">Total Active</div>
                </CardContent>
              </Card>
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{demoCount - 1}</div>
                  <div className="text-sm text-green-600">Tests Run</div>
                </CardContent>
              </Card>
              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {notifications.filter(n => n.urgency === "emergency").length}
                  </div>
                  <div className="text-sm text-purple-600">Emergencies</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Voice Controls */}
        <div className="flex justify-center">
          <VoiceNotificationControls />
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">🎯 Professional Voice</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Soft, clear, and natural sounding</li>
                <li>✓ Multiple voice profiles to choose from</li>
                <li>✓ Optimized for medical terminology</li>
                <li>✓ Gender and tone customization</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg">⚡ Smart Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Priority-based voice selection</li>
                <li>✓ Automatic queue management</li>
                <li>✓ Emergency notifications skip queue</li>
                <li>✓ Intelligent speech formatting</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-lg">🎨 Customization</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Adjustable volume, pitch & rate</li>
                <li>✓ Priority-specific settings</li>
                <li>✓ Browser-synced preferences</li>
                <li>✓ Real-time preview and testing</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardHeader>
            <CardTitle>📋 How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm text-gray-700">
              <li><strong>1.</strong> Click the voice profile toggle to enable voice notifications</li>
              <li><strong>2.</strong> Select your preferred voice (Professional Female Soft recommended)</li>
              <li><strong>3.</strong> Adjust volume, speech rate, and pitch to your preference</li>
              <li><strong>4.</strong> Choose which priority levels should speak (Emergency/Urgent/Normal)</li>
              <li><strong>5.</strong> Click "Test Voice" to hear how it sounds</li>
              <li><strong>6.</strong> Use the test buttons above to trigger different notification types</li>
              <li><strong>7.</strong> Notice how emergency notifications use a more urgent voice automatically</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Notification Display */}
      <DoctorNotifications
        notifications={notifications}
        onDismiss={removeNotification}
        onMarkRead={markAsRead}
        settings={{
          enableSound: true,
          showDuration: 8000,
          maxVisible: 3,
          position: "top-right"
        }}
      />
    </div>
  )
}

