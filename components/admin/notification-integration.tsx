"use client"

import React, { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Bell,
  Settings,
  Activity,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Send,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  Zap,
  Target,
  TrendingUp,
  BarChart3,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Smartphone,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  Play,
  Pause,
  X,
  ChevronRight,
  Home,
  User,
  FileText,
  DollarSign,
  MapPin,
  Download,
  Upload
} from "lucide-react"
import { useSettings, useNotificationSettings, useSettingsWatcher } from "@/lib/settings-context"
import { useNotifications } from "@/components/doctor-notifications"
import { NotificationOverlaySystem } from "@/components/notification-overlay-system"
import { NotificationManagementDashboard } from "@/components/admin/notification-management-dashboard"
import { useToast } from "@/hooks/use-toast"

interface NotificationIntegrationProps {
  currentPage: string
  userId?: string
  userRole?: "admin" | "doctor" | "staff"
  pageData?: any
}

interface QuickNotificationAction {
  id: string
  label: string
  icon: React.ComponentType<any>
  action: () => void
  category: "patient" | "appointment" | "system" | "emergency"
  enabled: boolean
}

interface PageSpecificNotifications {
  [key: string]: {
    relevantNotifications: string[]
    quickActions: QuickNotificationAction[]
    displaySettings: {
      showInSidebar: boolean
      showOverlay: boolean
      priority: "high" | "medium" | "low"
    }
  }
}

export function NotificationIntegration({
  currentPage = "dashboard",
  userId = "admin-1",
  userRole = "admin",
  pageData = {}
}: NotificationIntegrationProps) {
  const { settings } = useSettings()
  const { notifications: notificationSettings, updateNotification } = useNotificationSettings()
  const { addNotification } = useNotifications()
  const { toast } = useToast()

  // Integration state
  const [isIntegrationActive, setIsIntegrationActive] = useState(true)
  const [showManagement, setShowManagement] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(true)
  const [realtimeStats, setRealtimeStats] = useState({
    activeNotifications: 0,
    pendingQueue: 0,
    deliveryRate: 96.8,
    responseTime: 1.2
  })

  // Page-specific notification configurations
  const pageConfigurations: PageSpecificNotifications = {
    dashboard: {
      relevantNotifications: ["appointment", "emergency", "system"],
      quickActions: [
        {
          id: "emergency-alert",
          label: "Send Emergency Alert",
          icon: AlertTriangle,
          action: () => sendEmergencyNotification(),
          category: "emergency",
          enabled: true
        },
        {
          id: "appointment-reminder",
          label: "Appointment Reminder",
          icon: Calendar,
          action: () => sendAppointmentReminder(),
          category: "appointment",
          enabled: true
        },
        {
          id: "system-broadcast",
          label: "System Broadcast",
          icon: Send,
          action: () => sendSystemBroadcast(),
          category: "system",
          enabled: true
        }
      ],
      displaySettings: {
        showInSidebar: true,
        showOverlay: true,
        priority: "high"
      }
    },
    calendar: {
      relevantNotifications: ["appointment", "reminder"],
      quickActions: [
        {
          id: "appointment-confirm",
          label: "Confirm Appointment",
          icon: CheckCircle,
          action: () => confirmAppointment(),
          category: "appointment",
          enabled: true
        },
        {
          id: "reschedule-notice",
          label: "Reschedule Notice",
          icon: Clock,
          action: () => sendRescheduleNotice(),
          category: "appointment",
          enabled: true
        }
      ],
      displaySettings: {
        showInSidebar: true,
        showOverlay: true,
        priority: "high"
      }
    },
    "patient-tracking": {
      relevantNotifications: ["patient", "appointment"],
      quickActions: [
        {
          id: "patient-update",
          label: "Patient Status Update",
          icon: User,
          action: () => sendPatientUpdate(),
          category: "patient",
          enabled: true
        },
        {
          id: "treatment-reminder",
          label: "Treatment Reminder",
          icon: Bell,
          action: () => sendTreatmentReminder(),
          category: "patient",
          enabled: true
        }
      ],
      displaySettings: {
        showInSidebar: true,
        showOverlay: true,
        priority: "medium"
      }
    },
    settings: {
      relevantNotifications: ["system"],
      quickActions: [],
      displaySettings: {
        showInSidebar: false,
        showOverlay: false,
        priority: "low"
      }
    }
  }

  const currentConfig = pageConfigurations[currentPage] || pageConfigurations.dashboard

  // Real-time stats updates
  useEffect(() => {
    const updateStats = () => {
      setRealtimeStats(prev => ({
        ...prev,
        activeNotifications: Math.floor(Math.random() * 5) + 1,
        pendingQueue: Math.floor(Math.random() * 3),
        deliveryRate: 95 + Math.random() * 5,
        responseTime: 0.8 + Math.random() * 1.2
      }))
    }

    const interval = setInterval(updateStats, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [])

  // Quick notification actions
  const sendEmergencyNotification = () => {
    addNotification({
      type: "emergency",
      patientName: "Emergency Patient",
      appointmentId: `EMR-${Date.now().toString().slice(-6)}`,
      phoneNumber: "+92 300 9999999",
      appointmentTime: new Date().toISOString(),
      urgency: "emergency",
      sessionType: "emergency",
      message: "Emergency case requires immediate doctor attention",
      duration: 15000 // 15 seconds for emergency
    })

    toast({
      title: "🚨 Emergency Alert Sent",
      description: "Emergency notification sent to all available doctors",
      className: "border-red-500 bg-red-50"
    })
  }

  const sendAppointmentReminder = () => {
    addNotification({
      type: "appointment",
      patientName: "Ahmad Hassan",
      appointmentId: `APT-${Date.now().toString().slice(-6)}`,
      phoneNumber: "+92 300 1234567",
      appointmentTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      urgency: "normal",
      sessionType: "in_clinic",
      message: "Upcoming appointment reminder sent to patient and doctor"
    })

    toast({
      title: "📅 Reminder Sent",
      description: "Appointment reminder sent successfully"
    })
  }

  const sendSystemBroadcast = () => {
    addNotification({
      type: "system",
      patientName: "System Administrator",
      appointmentId: `SYS-${Date.now().toString().slice(-6)}`,
      phoneNumber: "+92 300 0000000",
      appointmentTime: new Date().toISOString(),
      urgency: "normal",
      sessionType: "in_clinic",
      message: "System maintenance scheduled for tonight at 11 PM"
    })

    toast({
      title: "📢 System Broadcast",
      description: "System notification broadcasted to all users"
    })
  }

  const confirmAppointment = () => {
    toast({
      title: "✅ Appointment Confirmed",
      description: "Confirmation notification sent to patient"
    })
  }

  const sendRescheduleNotice = () => {
    toast({
      title: "📞 Reschedule Notice",
      description: "Reschedule notification sent to affected parties"
    })
  }

  const sendPatientUpdate = () => {
    toast({
      title: "👤 Patient Update",
      description: "Patient status update sent to medical team"
    })
  }

  const sendTreatmentReminder = () => {
    toast({
      title: "💊 Treatment Reminder",
      description: "Treatment reminder sent to patient"
    })
  }

  // Settings watcher to respond to changes
  useSettingsWatcher(useCallback((newSettings) => {
    setIsIntegrationActive(newSettings.notifications.enabled)
  }, []))

  if (!isIntegrationActive) {
    return (
      <div className="fixed bottom-4 left-4 z-20">
        <Card className="w-80 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Notifications Disabled
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => updateNotification("enabled", true)}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Enable
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      {/* Notification Overlay System (Main Display) */}
      {currentConfig.displaySettings.showOverlay && (
        <NotificationOverlaySystem
          pageContext={{ page: currentPage, route: window?.location?.pathname || "" }}
          patientData={pageData}
          currentUser={{ role: userRole, id: userId, name: "Admin User" }}
        />
      )}

      {/* Quick Actions Sidebar */}
      {currentConfig.displaySettings.showInSidebar && showQuickActions && (
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="fixed left-4 top-1/2 transform -translate-y-1/2 z-20 w-72"
        >
          <Card className="border-blue-200 bg-white/95 backdrop-blur-sm shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Notification Center
                </CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowQuickActions(false)}
                  className="text-white hover:bg-white/20 w-6 h-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Real-time Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 p-2 rounded text-center">
                  <div className="text-lg font-bold text-blue-600">{realtimeStats.activeNotifications}</div>
                  <div className="text-xs text-blue-600">Active</div>
                </div>
                <div className="bg-green-50 p-2 rounded text-center">
                  <div className="text-lg font-bold text-green-600">{realtimeStats.deliveryRate.toFixed(1)}%</div>
                  <div className="text-xs text-green-600">Delivered</div>
                </div>
              </div>

              <Separator />

              {/* Page-specific Quick Actions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Quick Actions</h3>
                  <Badge variant="outline" className="text-xs">
                    {currentPage}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  {currentConfig.quickActions.filter(action => action.enabled).map((action) => (
                    <Button
                      key={action.id}
                      size="sm"
                      variant="outline"
                      onClick={action.action}
                      className="w-full justify-start text-xs"
                    >
                      <action.icon className="h-3 w-3 mr-2" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Notification Settings Quick Access */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Settings</h3>
                
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Sound Alerts</Label>
                  <Switch
                    checked={notificationSettings.sound}
                    onCheckedChange={(value) => updateNotification("sound", value)}
                    className="scale-75"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Emergency Priority</Label>
                  <Switch
                    checked={notificationSettings.emergencyNotifications.enabled}
                    onCheckedChange={(value) => updateNotification("emergencyNotifications.enabled", value)}
                    className="scale-75"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Display Duration (sec)</Label>
                  <Input
                    type="number"
                    value={notificationSettings.duration}
                    onChange={(e) => updateNotification("duration", parseInt(e.target.value))}
                    min={1}
                    max={30}
                    className="h-6 text-xs"
                  />
                </div>
              </div>

              <Separator />

              {/* Management Access */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowManagement(true)}
                  className="flex-1 text-xs"
                >
                  <Settings className="h-3 w-3 mr-1" />
                  Manage
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                >
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Minimized Sidebar Toggle (when hidden) */}
      {currentConfig.displaySettings.showInSidebar && !showQuickActions && (
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="fixed left-4 top-1/2 transform -translate-y-1/2 z-20"
        >
          <Button
            onClick={() => setShowQuickActions(true)}
            size="sm"
            className="rounded-full w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {/* Notification Management Dashboard Dialog */}
      <Dialog open={showManagement} onOpenChange={setShowManagement}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Notification Management Dashboard
            </DialogTitle>
          </DialogHeader>
          <NotificationManagementDashboard />
        </DialogContent>
      </Dialog>

      {/* Page-specific notification integrations */}
      <PageSpecificIntegrations 
        currentPage={currentPage}
        pageData={pageData}
        onNotificationSent={(message) => toast({ title: "Notification Sent", description: message })}
      />
    </>
  )
}

// Page-specific integration components
function PageSpecificIntegrations({
  currentPage,
  pageData,
  onNotificationSent
}: {
  currentPage: string
  pageData: any
  onNotificationSent: (message: string) => void
}) {
  const { addNotification } = useNotifications()

  useEffect(() => {
    // Auto-trigger notifications based on page data changes
    if (currentPage === "patient-tracking" && pageData?.newPatients?.length > 0) {
      // Notify about new patients
      pageData.newPatients.forEach((patient: any) => {
        addNotification({
          type: "appointment",
          patientName: patient.name,
          appointmentId: patient.appointmentId,
          phoneNumber: patient.phone,
          appointmentTime: patient.appointmentTime,
          urgency: patient.urgency || "normal",
          sessionType: patient.sessionType || "in_clinic",
          message: `New patient registration: ${patient.name}`
        })
      })
    }

    if (currentPage === "calendar" && pageData?.upcomingAppointments?.length > 0) {
      // Check for appointments starting soon
      const now = new Date()
      const soonAppointments = pageData.upcomingAppointments.filter((apt: any) => {
        const aptTime = new Date(apt.appointmentTime)
        const timeDiff = aptTime.getTime() - now.getTime()
        return timeDiff > 0 && timeDiff <= 30 * 60 * 1000 // 30 minutes
      })

      soonAppointments.forEach((apt: any) => {
        addNotification({
          type: "reminder",
          patientName: apt.patientName,
          appointmentId: apt.id,
          phoneNumber: apt.phoneNumber,
          appointmentTime: apt.appointmentTime,
          urgency: "urgent",
          sessionType: apt.sessionType,
          message: `Appointment starting in 30 minutes`
        })
      })
    }
  }, [currentPage, pageData, addNotification])

  return null // This component only handles side effects
}

// Settings Provider Wrapper to ensure settings context
export function NotificationIntegrationProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  )
}

// Hook for page-level notification integration
export function usePageNotifications(currentPage: string) {
  const { addNotification } = useNotifications()
  const { toast } = useToast()

  const sendPageSpecificNotification = useCallback((type: "info" | "success" | "warning" | "error", message: string) => {
    const urgency = type === "error" ? "emergency" : type === "warning" ? "urgent" : "normal"
    
    addNotification({
      type: type === "error" ? "emergency" : "system",
      patientName: "System",
      appointmentId: `PAGE-${Date.now().toString().slice(-6)}`,
      phoneNumber: "+92 300 0000000",
      appointmentTime: new Date().toISOString(),
      urgency,
      sessionType: "in_clinic",
      message: `[${currentPage.toUpperCase()}] ${message}`
    })

    toast({
      title: `${currentPage} Notification`,
      description: message,
      variant: type === "error" ? "destructive" : "default"
    })
  }, [currentPage, addNotification, toast])

  return {
    sendPageSpecificNotification,
    notifySuccess: (message: string) => sendPageSpecificNotification("success", message),
    notifyError: (message: string) => sendPageSpecificNotification("error", message),
    notifyInfo: (message: string) => sendPageSpecificNotification("info", message),
    notifyWarning: (message: string) => sendPageSpecificNotification("warning", message)
  }
}

// Auto-integration component that can be dropped into any page
export function AutoNotificationIntegration() {
  const [currentPage, setCurrentPage] = useState("")

  useEffect(() => {
    // Auto-detect current page from URL
    const path = window.location.pathname
    const pageName = path.split('/').pop() || "dashboard"
    setCurrentPage(pageName)
  }, [])

  if (!currentPage) return null

  return (
    <NotificationIntegration
      currentPage={currentPage}
      userRole="admin"
      userId="current-user"
    />
  )
}
