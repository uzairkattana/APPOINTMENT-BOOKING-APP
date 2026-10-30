"use client"

import React, { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DoctorNotifications, useNotifications, type NotificationData } from "@/components/doctor-notifications"
import { useSettings, useNotificationSettings, useSettingsWatcher } from "@/lib/settings-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Bell,
  BellOff,
  Settings,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Filter,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Phone,
  MessageSquare,
  Pause,
  Play,
  X,
  ChevronUp,
  ChevronDown,
  Activity,
  Zap,
  Timer,
  Target
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NotificationQueueItem extends NotificationData {
  queuedAt: Date
  priority: number // Higher number = higher priority
  source: string
}

interface NotificationOverlayProps {
  patientData?: any[] // Patient data from the current context
  currentUser?: {
    role: "doctor" | "admin" | "staff"
    id: string
    name: string
  }
  pageContext?: {
    page: string
    route: string
  }
}

export function NotificationOverlaySystem({ 
  patientData = [], 
  currentUser = { role: "doctor", id: "doc-1", name: "Dr. Bashir" },
  pageContext = { page: "dashboard", route: "/admin/dashboard" }
}: NotificationOverlayProps) {
  const { settings } = useSettings()
  const { notifications: notificationSettings } = useNotificationSettings()
  const { notifications, addNotification, removeNotification, markAsRead } = useNotifications()
  const { toast } = useToast()

  // Overlay state
  const [isMinimized, setIsMinimized] = useState(false)
  const [isHidden, setIsHidden] = useState(!notificationSettings.enabled)
  const [isPaused, setIsPaused] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [filterActive, setFilterActive] = useState("all") // "all", "urgent", "emergency", "normal"
  
  // Real-time notification queue
  const [notificationQueue, setNotificationQueue] = useState<NotificationQueueItem[]>([])
  const [processedNotifications, setProcessedNotifications] = useState<NotificationQueueItem[]>([])
  const [stats, setStats] = useState({
    totalToday: 0,
    acknowledged: 0,
    pending: 0,
    emergencies: 0
  })

  // Auto-connect to settings changes
  useSettingsWatcher(useCallback((newSettings) => {
    setIsHidden(!newSettings.notifications.enabled)
  }, []))

  // Initialize demo notifications
  useEffect(() => {
    const initializeNotifications = () => {
      const demoNotifications: NotificationQueueItem[] = [
        {
          id: "demo-1",
          type: "appointment",
          patientName: "Ahmad Khan",
          appointmentId: "APT-2024001",
          phoneNumber: "+92 300 1234567",
          appointmentTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          sessionType: "in_clinic",
          urgency: "normal",
          message: "New appointment scheduled for in-clinic session",
          timestamp: new Date(),
          autoShow: true,
          queuedAt: new Date(),
          priority: 2,
          source: "appointment_system"
        },
        {
          id: "demo-2",
          type: "emergency",
          patientName: "Sarah Ahmed",
          appointmentId: "EMR-2024001",
          phoneNumber: "+92 321 9876543",
          appointmentTime: new Date().toISOString(),
          sessionType: "emergency",
          urgency: "emergency",
          message: "Emergency case requiring immediate attention - severe back pain",
          timestamp: new Date(),
          autoShow: true,
          queuedAt: new Date(),
          priority: 10,
          source: "emergency_system"
        }
      ]
      
      setNotificationQueue(demoNotifications)
      updateStats()
    }

    // Initialize after a short delay to simulate real-time arrival
    const timer = setTimeout(initializeNotifications, 2000)
    return () => clearTimeout(timer)
  }, [])

  // Auto-process notification queue
  useEffect(() => {
    if (isPaused || isHidden) return

    const processQueue = () => {
      if (notificationQueue.length > 0) {
        // Sort by priority and timestamp
        const sortedQueue = [...notificationQueue].sort((a, b) => {
          if (a.priority !== b.priority) return b.priority - a.priority
          return new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime()
        })

        const nextNotification = sortedQueue[0]
        
        // Check if notification passes filters
        if (shouldShowNotification(nextNotification)) {
          // Add to main notifications for display
          addNotification({
            ...nextNotification,
            duration: (nextNotification.urgency === "emergency" ? 10 : notificationSettings.duration) * 1000
          })

          // Move to processed
          setProcessedNotifications(prev => [nextNotification, ...prev])
          setNotificationQueue(prev => prev.filter(n => n.id !== nextNotification.id))
          
          // Update stats
          updateStats()

          // Show toast for high priority notifications
          if (nextNotification.urgency === "emergency") {
            toast({
              title: "🚨 EMERGENCY ALERT",
              description: `${nextNotification.patientName} requires immediate attention`,
              className: "border-red-500 bg-red-50",
            })
          }
        } else {
          // Remove filtered notification
          setNotificationQueue(prev => prev.filter(n => n.id !== nextNotification.id))
        }
      }
    }

    const interval = setInterval(processQueue, 3000) // Process every 3 seconds
    return () => clearInterval(interval)
  }, [notificationQueue, isPaused, isHidden, notificationSettings, filterActive, addNotification])

  // Add new notifications to queue (this would be called from external systems)
  const queueNotification = useCallback((notification: Omit<NotificationQueueItem, "queuedAt" | "priority">) => {
    const priority = notification.urgency === "emergency" ? 10 :
                    notification.urgency === "urgent" ? 5 : 2

    const queueItem: NotificationQueueItem = {
      ...notification,
      queuedAt: new Date(),
      priority,
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    setNotificationQueue(prev => [...prev, queueItem])
  }, [])

  // Simulate real-time notifications
  useEffect(() => {
    if (currentUser.role !== "doctor") return

    const simulateNotifications = () => {
      const mockPatients = [
        "Muhammad Ali", "Fatima Sheikh", "Hassan Ahmed", "Aisha Khan",
        "Omar Abdullah", "Zainab Malik", "Ali Raza", "Maria Siddiqui"
      ]
      
      const notificationTypes: NotificationData["type"][] = ["appointment", "reminder", "system"]
      const urgencyLevels: NotificationData["urgency"][] = ["normal", "urgent", "emergency"]

      const createRandomNotification = () => {
        const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
        const urgency = urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)]
        const patient = mockPatients[Math.floor(Math.random() * mockPatients.length)]

        queueNotification({
          type,
          patientName: patient,
          appointmentId: `APT-${Date.now().toString().slice(-6)}`,
          phoneNumber: `+92 3${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)} ${Math.floor(Math.random() * 9000000) + 1000000}`,
          appointmentTime: new Date(Date.now() + Math.random() * 4 * 60 * 60 * 1000).toISOString(),
          sessionType: Math.random() > 0.7 ? "video" : "in_clinic",
          urgency,
          message: type === "appointment" ? `New ${urgency} appointment scheduled` :
                  type === "reminder" ? `Appointment reminder for ${patient}` :
                  `System notification: ${urgency} priority`,
          timestamp: new Date(),
          autoShow: true,
          source: `${type}_system`
        })
      }

      // Add notifications at random intervals
      const interval = setInterval(() => {
        if (!isPaused && Math.random() > 0.7) { // 30% chance every interval
          createRandomNotification()
        }
      }, 15000) // Every 15 seconds

      return () => clearInterval(interval)
    }

    const timer = setTimeout(simulateNotifications, 5000) // Start after 5 seconds
    return () => clearTimeout(timer)
  }, [currentUser.role, isPaused, queueNotification])

  const shouldShowNotification = (notification: NotificationQueueItem): boolean => {
    if (filterActive === "all") return true
    
    return (
      (filterActive === "emergency" && notification.urgency === "emergency") ||
      (filterActive === "urgent" && notification.urgency === "urgent") ||
      (filterActive === "normal" && notification.urgency === "normal")
    )
  }

  const updateStats = () => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    const todayNotifications = processedNotifications.filter(n => 
      new Date(n.timestamp) >= todayStart
    )

    setStats({
      totalToday: todayNotifications.length,
      acknowledged: todayNotifications.filter(n => !n.autoShow).length,
      pending: notificationQueue.length,
      emergencies: todayNotifications.filter(n => n.urgency === "emergency").length
    })
  }

  const handleNotificationDismiss = (id: string) => {
    removeNotification(id)
    setProcessedNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, autoShow: false } : n)
    )
    updateStats()
  }

  const handleNotificationMarkRead = (id: string) => {
    markAsRead(id)
    setProcessedNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, autoShow: false } : n)
    )
    updateStats()
  }

  if (isHidden) {
    return (
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="fixed bottom-4 right-4 z-40"
      >
        <Button
          onClick={() => setIsHidden(false)}
          size="sm"
          className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
        >
          <Bell className="h-5 w-5" />
          {stats.pending > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {stats.pending}
            </Badge>
          )}
        </Button>
      </motion.div>
    )
  }

  return (
    <>
      {/* Main Notification Display */}
      <DoctorNotifications
        notifications={notifications.filter(n => n.autoShow)}
        onDismiss={handleNotificationDismiss}
        onMarkRead={handleNotificationMarkRead}
        settings={{
          enableSound: notificationSettings.sound,
          showDuration: notificationSettings.duration * 1000,
          maxVisible: notificationSettings.maxVisible,
          position: notificationSettings.position
        }}
      />

      {/* Notification Control Panel */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed bottom-4 right-4 z-30 ${isMinimized ? 'w-auto' : 'w-96'}`}
      >
        <Card className="border-blue-200 bg-white/95 backdrop-blur-sm shadow-xl">
          {isMinimized ? (
            // Minimized View
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsMinimized(false)}
                  className="w-8 h-8 p-0"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  <Badge variant={stats.pending > 0 ? "destructive" : "secondary"} className="text-xs">
                    {stats.pending} queued
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {stats.totalToday} today
                  </Badge>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsPaused(!isPaused)}
                  className="w-8 h-8 p-0"
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsHidden(true)}
                  className="w-8 h-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          ) : (
            // Expanded View
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    <h3 className="font-semibold">Live Notifications</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsPaused(!isPaused)}
                      className="text-white hover:bg-white/20 w-8 h-8 p-0"
                    >
                      {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsMinimized(true)}
                      className="text-white hover:bg-white/20 w-8 h-8 p-0"
                    >
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsHidden(true)}
                      className="text-white hover:bg-white/20 w-8 h-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <CardContent className="p-4 space-y-4">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 p-2 rounded-lg text-center">
                    <div className="text-lg font-bold text-blue-600">{stats.pending}</div>
                    <div className="text-xs text-blue-600">Queued</div>
                  </div>
                  <div className="bg-green-50 p-2 rounded-lg text-center">
                    <div className="text-lg font-bold text-green-600">{stats.totalToday}</div>
                    <div className="text-xs text-green-600">Today</div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      isPaused ? "bg-yellow-500" : "bg-green-500 animate-pulse"
                    }`} />
                    <span className="text-sm font-medium">
                      {isPaused ? "Paused" : "Active"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Timer className="h-3 w-3" />
                    Next check: {isPaused ? "paused" : "3s"}
                  </div>
                </div>

                {/* Filter Controls */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Priority Filter</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowHistory(!showHistory)}
                      className="text-xs"
                    >
                      {showHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      History
                    </Button>
                  </div>
                  <div className="flex gap-1">
                    {[
                      { key: "all", label: "All", icon: Target },
                      { key: "emergency", label: "Emergency", icon: AlertTriangle },
                      { key: "urgent", label: "Urgent", icon: Clock },
                      { key: "normal", label: "Normal", icon: CheckCircle }
                    ].map(filter => (
                      <Button
                        key={filter.key}
                        size="sm"
                        variant={filterActive === filter.key ? "default" : "outline"}
                        onClick={() => setFilterActive(filter.key)}
                        className="flex-1 text-xs"
                      >
                        <filter.icon className="h-3 w-3 mr-1" />
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Recent Notifications History */}
                <AnimatePresence>
                  {showHistory && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2"
                    >
                      <Separator />
                      <div className="text-sm font-medium">Recent Activity</div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {processedNotifications.slice(0, 5).map((notification) => (
                          <div key={notification.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              notification.urgency === "emergency" ? "bg-red-500" :
                              notification.urgency === "urgent" ? "bg-orange-500" : "bg-green-500"
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{notification.patientName}</div>
                              <div className="text-gray-600 truncate">{notification.message}</div>
                            </div>
                            <div className="text-gray-500">
                              {new Date(notification.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        ))}
                        {processedNotifications.length === 0 && (
                          <div className="text-center text-gray-500 py-4">
                            No notifications yet
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Settings Quick Access */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs"
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Configure
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Test notification
                      queueNotification({
                        type: "appointment",
                        patientName: "Test Patient",
                        appointmentId: "TEST-123",
                        phoneNumber: "+92 300 1234567",
                        appointmentTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
                        sessionType: "in_clinic",
                        urgency: "normal",
                        message: "Test notification from overlay system",
                        timestamp: new Date(),
                        autoShow: true,
                        source: "test_system"
                      })
                    }}
                    className="flex-1 text-xs"
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    Test
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </motion.div>
    </>
  )
}

// Context provider for notification overlay
interface NotificationOverlayContextType {
  queueNotification: (notification: Omit<NotificationQueueItem, "queuedAt" | "priority">) => void
  isVisible: boolean
  setVisible: (visible: boolean) => void
}

const NotificationOverlayContext = React.createContext<NotificationOverlayContextType | undefined>(undefined)

export function NotificationOverlayProvider({ children }: { children: React.ReactNode }) {
  const [overlayRef, setOverlayRef] = useState<{
    queueNotification: (notification: Omit<NotificationQueueItem, "queuedAt" | "priority">) => void
  } | null>(null)
  const [isVisible, setIsVisible] = useState(true)

  const queueNotification = useCallback((notification: Omit<NotificationQueueItem, "queuedAt" | "priority">) => {
    if (overlayRef?.queueNotification) {
      overlayRef.queueNotification(notification)
    }
  }, [overlayRef])

  return (
    <NotificationOverlayContext.Provider value={{
      queueNotification,
      isVisible,
      setVisible: setIsVisible
    }}>
      {children}
    </NotificationOverlayContext.Provider>
  )
}

export function useNotificationOverlay() {
  const context = React.useContext(NotificationOverlayContext)
  if (!context) {
    throw new Error("useNotificationOverlay must be used within a NotificationOverlayProvider")
  }
  return context
}

// Auto-integration component for pages
export function NotificationAutoIntegration({ 
  currentPage, 
  patientData 
}: { 
  currentPage: string
  patientData?: any[] 
}) {
  const { notifications } = useNotificationSettings()
  
  // Auto-detect context and configure notifications accordingly
  const pageConfig = {
    dashboard: { showOverlay: true, priority: "high" },
    calendar: { showOverlay: true, priority: "high" },
    patients: { showOverlay: true, priority: "medium" },
    settings: { showOverlay: false, priority: "low" }
  }

  const config = pageConfig[currentPage as keyof typeof pageConfig] || { showOverlay: false, priority: "low" }

  if (!notifications.enabled || !config.showOverlay) {
    return null
  }

  return (
    <NotificationOverlaySystem 
      patientData={patientData}
      pageContext={{ page: currentPage, route: window?.location?.pathname || "" }}
    />
  )
}
