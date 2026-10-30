"use client"

import { useState, useEffect, useCallback } from "react"
import { DoctorNotifications, useNotifications, NotificationData } from "../doctor-notifications"
import { useNotificationSettings } from "../../lib/settings-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Bell,
  BellRing,
  BellOff,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Clock,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
  Trash2,
  RefreshCw,
  TestTube
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

// Real-time notification manager that integrates with settings
export function NotificationManager() {
  const { toast } = useToast()
  const { notifications: notificationSettings } = useNotificationSettings()
  const {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    clearAll,
    notifyAppointment
  } = useNotifications()

  const [isActive, setIsActive] = useState(true)
  const [testMode, setTestMode] = useState(false)
  const [statistics, setStatistics] = useState({
    total: 0,
    acknowledged: 0,
    dismissed: 0,
    active: 0
  })

  // Demo/test appointment data
  const demoAppointments = [
    { name: "Ahmad Hassan", phone: "+92 300 1234567", urgency: "normal" as const },
    { name: "Fatima Ali", phone: "+92 311 9876543", urgency: "urgent" as const },
    { name: "Muhammad Khan", phone: "+92 345 1234567", urgency: "emergency" as const },
    { name: "Aisha Malik", phone: "+92 333 5678901", urgency: "normal" as const },
    { name: "Dr. Sarah Ahmed", phone: "+92 321 4567890", urgency: "urgent" as const }
  ]

  // Listen for real appointment bookings
  useEffect(() => {
    const handleNewAppointment = (event: CustomEvent) => {
      if (!notificationSettings.enabled || !notificationSettings.appointmentNotifications.newAppointment) {
        return
      }

      const appointmentData = event.detail
      
      addNotification({
        type: "appointment",
        patientName: appointmentData.patientName || appointmentData.name,
        appointmentId: appointmentData.appointmentId || appointmentData.id || `APT-${Date.now().toString().slice(-6)}`,
        phoneNumber: appointmentData.phoneNumber || appointmentData.phone,
        appointmentTime: appointmentData.appointmentTime || appointmentData.appointment_date,
        sessionType: appointmentData.sessionType || appointmentData.session_type || "in_clinic",
        urgency: appointmentData.urgency || "normal",
        message: appointmentData.notes || undefined,
        duration: (notificationSettings.duration || 5) * 1000 // Convert to milliseconds
      })

      updateStatistics()
    }

    // Listen for custom appointment events
    window.addEventListener('newAppointmentBooked', handleNewAppointment as EventListener)
    
    // Listen for settings updates
    const handleSettingsUpdate = (event: CustomEvent) => {
      // Notification settings were updated, could trigger re-evaluation of active notifications
      console.log("Notification settings updated:", event.detail.settings.notifications)
    }
    
    window.addEventListener('settingsUpdated', handleSettingsUpdate as EventListener)

    return () => {
      window.removeEventListener('newAppointmentBooked', handleNewAppointment as EventListener)
      window.removeEventListener('settingsUpdated', handleSettingsUpdate as EventListener)
    }
  }, [notificationSettings, addNotification])

  // Update statistics when notifications change
  useEffect(() => {
    updateStatistics()
  }, [notifications])

  const updateStatistics = useCallback(() => {
    const total = notifications.length
    const active = notifications.filter(n => n.autoShow).length
    const acknowledged = notifications.filter(n => !n.autoShow).length
    
    setStatistics({
      total,
      acknowledged,
      dismissed: total - active - acknowledged,
      active
    })
  }, [notifications])

  // Test notification function
  const sendTestNotification = (urgency: "normal" | "urgent" | "emergency" = "normal") => {
    const randomDemo = demoAppointments[Math.floor(Math.random() * demoAppointments.length)]
    
    const testNotification = addNotification({
      type: "appointment",
      patientName: `${randomDemo.name} (Test)`,
      appointmentId: `TEST-${Date.now().toString().slice(-6)}`,
      phoneNumber: randomDemo.phone,
      appointmentTime: new Date(Date.now() + Math.random() * 7200000).toISOString(), // Random time in next 2 hours
      sessionType: Math.random() > 0.5 ? "in_clinic" : "video",
      urgency,
      message: urgency === "emergency" ? "Emergency appointment requires immediate attention!" : 
               urgency === "urgent" ? "Urgent consultation requested by patient" : undefined,
      duration: (notificationSettings.duration || 5) * 1000
    })

    toast({
      title: "🧪 Test Notification Sent",
      description: `${urgency.toUpperCase()} priority test notification for ${randomDemo.name}`,
      className: "border-blue-500 bg-blue-50"
    })

    return testNotification
  }

  // Bulk test function
  const sendBulkTestNotifications = () => {
    const count = 3
    let delay = 0
    
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const urgency = i === 0 ? "normal" : i === 1 ? "urgent" : "emergency"
        sendTestNotification(urgency)
      }, delay)
      delay += 1000 // 1 second apart
    }

    toast({
      title: "🧪 Bulk Test Started",
      description: `Sending ${count} test notifications with different priorities`,
      className: "border-purple-500 bg-purple-50"
    })
  }

  const handleDismiss = (id: string) => {
    removeNotification(id)
    toast({
      title: "✅ Notification Dismissed",
      description: "Notification has been removed from queue",
      className: "border-green-500 bg-green-50"
    })
  }

  const handleMarkRead = (id: string) => {
    markAsRead(id)
    toast({
      title: "👁️ Notification Acknowledged",
      description: "Notification marked as read and acknowledged",
      className: "border-blue-500 bg-blue-50"
    })
  }

  const toggleNotificationSystem = () => {
    setIsActive(!isActive)
    toast({
      title: isActive ? "🔕 Notifications Disabled" : "🔔 Notifications Enabled",
      description: isActive ? "Doctor notifications are now disabled" : "Doctor notifications are now active",
      className: isActive ? "border-red-500 bg-red-50" : "border-green-500 bg-green-50"
    })
  }

  const clearAllNotifications = () => {
    clearAll()
    toast({
      title: "🗑️ All Notifications Cleared",
      description: "Notification queue has been cleared",
      className: "border-gray-500 bg-gray-50"
    })
  }

  return (
    <div className="space-y-6">
      {/* Notification Control Panel */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BellRing className="h-5 w-5 text-blue-600" />
              <span className="text-blue-900">Doctor Notification System</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={isActive ? "default" : "secondary"} className="px-3 py-1">
                {isActive ? "ACTIVE" : "DISABLED"}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* System Control */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                {isActive ? (
                  <BellRing className="h-5 w-5 text-green-600" />
                ) : (
                  <BellOff className="h-5 w-5 text-red-600" />
                )}
                <div>
                  <Label className="font-medium text-gray-900">System Status</Label>
                  <p className="text-xs text-gray-600">Master control</p>
                </div>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={toggleNotificationSystem}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <TestTube className="h-5 w-5 text-purple-600" />
                <div>
                  <Label className="font-medium text-gray-900">Test Mode</Label>
                  <p className="text-xs text-gray-600">Demo notifications</p>
                </div>
              </div>
              <Switch
                checked={testMode}
                onCheckedChange={setTestMode}
              />
            </div>

            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-blue-200">
              <Volume2 className="h-5 w-5 text-indigo-600" />
              <div>
                <Label className="font-medium text-gray-900">Sound Enabled</Label>
                <p className="text-xs text-gray-600">{notificationSettings.sound ? "On" : "Off"}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-white rounded-lg border border-blue-200">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <Label className="font-medium text-gray-900">Duration</Label>
                <p className="text-xs text-gray-600">{notificationSettings.duration}s display</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Statistics */}
          <div>
            <Label className="font-medium text-gray-900 block mb-3">Notification Statistics</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{statistics.total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{statistics.active}</div>
                <div className="text-xs text-gray-600">Active</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-600">{statistics.acknowledged}</div>
                <div className="text-xs text-gray-600">Acknowledged</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-600">{statistics.dismissed}</div>
                <div className="text-xs text-gray-600">Dismissed</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Test Controls */}
          {testMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4"
            >
              <Label className="font-medium text-gray-900 block">Test Notification Controls</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Button
                  onClick={() => sendTestNotification("normal")}
                  disabled={!isActive}
                  variant="outline"
                  className="border-green-500 text-green-700 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Normal
                </Button>
                <Button
                  onClick={() => sendTestNotification("urgent")}
                  disabled={!isActive}
                  variant="outline"
                  className="border-orange-500 text-orange-700 hover:bg-orange-50"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Urgent
                </Button>
                <Button
                  onClick={() => sendTestNotification("emergency")}
                  disabled={!isActive}
                  variant="outline"
                  className="border-red-500 text-red-700 hover:bg-red-50"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Emergency
                </Button>
                <Button
                  onClick={sendBulkTestNotifications}
                  disabled={!isActive}
                  variant="outline"
                  className="border-purple-500 text-purple-700 hover:bg-purple-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Bulk Test
                </Button>
                <Button
                  onClick={clearAllNotifications}
                  variant="outline"
                  className="border-gray-500 text-gray-700 hover:bg-gray-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Current Settings Display */}
      <Card className="border-indigo-200 bg-indigo-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-indigo-900">
            <Settings className="h-5 w-5" />
            <span>Current Notification Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="font-medium text-gray-900">Display Settings</Label>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Duration: {notificationSettings.duration} seconds</div>
                <div>Max Visible: {notificationSettings.maxVisible}</div>
                <div>Position: {notificationSettings.position.replace('-', ' ')}</div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-medium text-gray-900">Audio & Visual</Label>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Sound: {notificationSettings.sound ? "Enabled" : "Disabled"}</div>
                <div>Vibration: {notificationSettings.vibration ? "Enabled" : "Disabled"}</div>
                <div>Auto-acknowledge: {notificationSettings.autoAcknowledge ? "Yes" : "No"}</div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-medium text-gray-900">Emergency Settings</Label>
              <div className="space-y-1 text-sm text-gray-600">
                <div>Emergency alerts: {notificationSettings.emergencyNotifications.enabled ? "Enabled" : "Disabled"}</div>
                <div>Immediate alert: {notificationSettings.emergencyNotifications.immediateAlert ? "Yes" : "No"}</div>
                <div>Escalation: {notificationSettings.emergencyNotifications.escalationTime} min</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Notification Display */}
      <AnimatePresence>
        {isActive && notificationSettings.enabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <DoctorNotifications
              notifications={notifications}
              onDismiss={handleDismiss}
              onMarkRead={handleMarkRead}
              settings={{
                enableSound: notificationSettings.sound,
                showDuration: notificationSettings.duration * 1000,
                maxVisible: notificationSettings.maxVisible,
                position: notificationSettings.position
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Queue (for debugging/management) */}
      {notifications.length > 0 && (
        <Card className="border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-gray-900">
              <Bell className="h-5 w-5" />
              <span>Notification Queue ({notifications.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <Badge variant={
                      notification.urgency === "emergency" ? "destructive" :
                      notification.urgency === "urgent" ? "default" : "secondary"
                    }>
                      {notification.urgency?.toUpperCase() || "NORMAL"}
                    </Badge>
                    <div>
                      <div className="font-medium text-sm">{notification.patientName}</div>
                      <div className="text-xs text-gray-600">
                        {notification.appointmentId} • {notification.phoneNumber}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {notification.autoShow ? "Active" : "Read"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeNotification(notification.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Instructions */}
      <Card className="border-yellow-200 bg-yellow-50/30">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2 text-yellow-900">
            <Info className="h-5 w-5" />
            <span>Integration Guide</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-700 space-y-2">
            <p><strong>Automatic Integration:</strong> This notification system automatically detects new appointments and displays doctor notifications according to your settings.</p>
            
            <p><strong>Real-time Updates:</strong> When a new appointment is booked through any interface, a notification will appear for {notificationSettings.duration} seconds showing:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Patient name and phone number</li>
              <li>Appointment ID for reference</li>
              <li>Appointment time and session type</li>
              <li>Urgency level and special notes</li>
            </ul>
            
            <p><strong>Settings Integration:</strong> All notification behavior is controlled by your admin settings and applies in real-time across the entire system.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Hook for external components to trigger notifications
export function useAppointmentNotifications() {
  const { addNotification } = useNotifications()
  const { notifications: settings } = useNotificationSettings()
  
  const notifyNewAppointment = (appointmentData: {
    patientName: string
    phoneNumber: string
    appointmentId: string
    appointmentTime?: string
    sessionType?: "in_clinic" | "video" | "emergency"
    urgency?: "normal" | "urgent" | "emergency"
    notes?: string
  }) => {
    if (!settings.enabled || !settings.appointmentNotifications.newAppointment) {
      return null
    }

    return addNotification({
      type: "appointment",
      patientName: appointmentData.patientName,
      appointmentId: appointmentData.appointmentId,
      phoneNumber: appointmentData.phoneNumber,
      appointmentTime: appointmentData.appointmentTime,
      sessionType: appointmentData.sessionType || "in_clinic",
      urgency: appointmentData.urgency || "normal",
      message: appointmentData.notes,
      duration: settings.duration * 1000
    })
  }

  return { notifyNewAppointment }
}
