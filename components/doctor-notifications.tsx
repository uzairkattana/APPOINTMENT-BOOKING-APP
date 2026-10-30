"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Bell, 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  X, 
  CheckCircle,
  AlertTriangle,
  Star,
  Heart,
  Stethoscope,
  MapPin,
  MessageCircle
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { professionalVoiceNotification } from "@/lib/professional-voice-notification"

export interface NotificationData {
  id: string
  type: "appointment" | "emergency" | "reminder" | "system"
  patientName: string
  appointmentId: string
  phoneNumber: string
  appointmentTime?: string
  sessionType?: "in_clinic" | "video" | "emergency"
  urgency?: "normal" | "urgent" | "emergency"
  message?: string
  timestamp: Date
  duration?: number // in milliseconds, defaults to 5000
  autoShow?: boolean
}

interface DoctorNotificationProps {
  notifications: NotificationData[]
  onDismiss: (id: string) => void
  onMarkRead: (id: string) => void
  settings?: {
    enableSound: boolean
    showDuration: number
    maxVisible: number
    position: "top-right" | "top-left" | "bottom-right" | "bottom-left"
  }
}

interface ActiveNotification extends NotificationData {
  isVisible: boolean
  timeLeft: number
}

export function DoctorNotifications({ 
  notifications, 
  onDismiss, 
  onMarkRead,
  settings = {
    enableSound: true,
    showDuration: 5000,
    maxVisible: 3,
    position: "top-right"
  }
}: DoctorNotificationProps) {
  const [activeNotifications, setActiveNotifications] = useState<ActiveNotification[]>([])
  const [soundEnabled, setSoundEnabled] = useState(settings.enableSound)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [voiceInitialized, setVoiceInitialized] = useState(false)

  // Load voice settings on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      professionalVoiceNotification.loadSettings()
      const voiceSettings = professionalVoiceNotification.getSettings()
      setVoiceEnabled(voiceSettings.enabled)
      
      // Auto-initialize voice on first user interaction
      const initializeVoice = () => {
        if (!voiceInitialized && voiceSettings.enabled) {
          // Trigger a silent test to initialize the speech synthesis
          if (window.speechSynthesis) {
            window.speechSynthesis.cancel()
            const utterance = new SpeechSynthesisUtterance("")
            utterance.volume = 0
            window.speechSynthesis.speak(utterance)
            setVoiceInitialized(true)
          }
        }
      }
      
      // Listen for first user interaction
      document.addEventListener('click', initializeVoice, { once: true })
      document.addEventListener('keydown', initializeVoice, { once: true })
      
      return () => {
        document.removeEventListener('click', initializeVoice)
        document.removeEventListener('keydown', initializeVoice)
      }
    }
  }, [])

  // Auto-show notifications
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.autoShow && !activeNotifications.find(active => active.id === notification.id)) {
        showNotification(notification)
      }
    })
  }, [notifications])

  // Play notification sound
  const playNotificationSound = (type: NotificationData["type"]) => {
    if (!soundEnabled) return
    
    try {
      const audio = new Audio()
      switch (type) {
        case "emergency":
          audio.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjqU2e++cyMELYXU8N2QQAoUXrTp66hVFApGn+DyvmwhBjqU2e++cyME"
          break
        case "appointment":
          audio.src = "data:audio/wav;base64,UklGRkABAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YRwBAAC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4"
          break
        default:
          audio.src = "data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQ4AAAC4uLi4uLi4uLi4uA=="
      }
      audio.volume = 0.3
      audio.play().catch(() => {
        // Ignore audio play errors (browser restrictions)
      })
    } catch (error) {
      console.log("Audio notification failed:", error)
    }
  }

  const showNotification = (notification: NotificationData) => {
    const duration = notification.duration || settings.showDuration
    const newNotification: ActiveNotification = {
      ...notification,
      isVisible: true,
      timeLeft: duration
    }

    // Play notification sound
    playNotificationSound(notification.type)

    // Speak notification with professional voice
    if (voiceEnabled) {
      professionalVoiceNotification.speak({
        patientName: notification.patientName,
        type: notification.type,
        urgency: notification.urgency,
        message: notification.message || "",
        appointmentTime: notification.appointmentTime,
        sessionType: notification.sessionType
      }).catch(error => {
        console.error("Voice notification error:", error)
      })
    }

    setActiveNotifications(prev => {
      const filtered = prev.filter(n => n.id !== notification.id)
      const limited = filtered.slice(0, settings.maxVisible - 1)
      return [newNotification, ...limited]
    })

    // Auto-dismiss after duration
    setTimeout(() => {
      dismissNotification(notification.id, true)
    }, duration)
  }

  const dismissNotification = (id: string, isAutomatic = false) => {
    setActiveNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isVisible: false } : n)
    )
    
    setTimeout(() => {
      setActiveNotifications(prev => prev.filter(n => n.id !== id))
      if (!isAutomatic) {
        onDismiss(id)
      }
    }, 300) // Allow exit animation
  }

  const markAsRead = (id: string) => {
    onMarkRead(id)
    dismissNotification(id)
  }

  const getNotificationIcon = (type: NotificationData["type"], urgency?: string) => {
    switch (type) {
      case "emergency":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "appointment":
        return urgency === "urgent" 
          ? <Clock className="h-5 w-5 text-orange-500" />
          : <Calendar className="h-5 w-5 text-blue-500" />
      case "reminder":
        return <Bell className="h-5 w-5 text-yellow-500" />
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />
    }
  }

  const getNotificationStyle = (type: NotificationData["type"], urgency?: string) => {
    switch (type) {
      case "emergency":
        return {
          border: "border-red-500",
          background: "bg-red-50",
          glow: "shadow-red-500/20"
        }
      case "appointment":
        if (urgency === "urgent") {
          return {
            border: "border-orange-500",
            background: "bg-orange-50",
            glow: "shadow-orange-500/20"
          }
        }
        return {
          border: "border-blue-500",
          background: "bg-blue-50",
          glow: "shadow-blue-500/20"
        }
      case "reminder":
        return {
          border: "border-yellow-500",
          background: "bg-yellow-50",
          glow: "shadow-yellow-500/20"
        }
      default:
        return {
          border: "border-green-500",
          background: "bg-green-50",
          glow: "shadow-green-500/20"
        }
    }
  }

  const formatPhoneNumber = (phone: string) => {
    // Format Pakistani phone numbers nicely
    if (phone.startsWith("+92")) {
      return phone.replace(/(\+92)(\d{3})(\d{3})(\d{4})/, "$1 $2 $3 $4")
    }
    if (phone.startsWith("03")) {
      return phone.replace(/(\d{4})(\d{3})(\d{4})/, "$1 $2 $3")
    }
    return phone
  }

  const positionClasses = {
    "top-right": "fixed top-4 right-4 z-50",
    "top-left": "fixed top-4 left-4 z-50",
    "bottom-right": "fixed bottom-4 right-4 z-50",
    "bottom-left": "fixed bottom-4 left-4 z-50"
  }

  return (
    <div className={`${positionClasses[settings.position]} space-y-3 w-96 max-w-[calc(100vw-2rem)]`}>
      <AnimatePresence>
        {activeNotifications.map((notification) => {
          const styles = getNotificationStyle(notification.type, notification.urgency)
          
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, scale: 0.8, x: settings.position.includes("right") ? 100 : -100 }}
              animate={{ opacity: notification.isVisible ? 1 : 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: settings.position.includes("right") ? 100 : -100 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`
                ${styles.background} ${styles.border} ${styles.glow}
                border-l-4 rounded-lg shadow-lg backdrop-blur-sm
                transform hover:scale-[1.02] transition-all duration-200
              `}
            >
              <Card className="border-none bg-transparent shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getNotificationIcon(notification.type, notification.urgency)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">
                            {notification.type === "appointment" ? "New Appointment" : 
                             notification.type === "emergency" ? "Emergency Alert" :
                             notification.type === "reminder" ? "Reminder" : "Notification"}
                          </h3>
                          {notification.urgency && (
                            <Badge variant={
                              notification.urgency === "emergency" ? "destructive" :
                              notification.urgency === "urgent" ? "default" : "secondary"
                            } className="text-xs px-2 py-0.5">
                              {notification.urgency.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissNotification(notification.id)}
                      className="h-8 w-8 p-0 hover:bg-white/50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {/* Patient Info */}
                    <div className="bg-white/70 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-gray-900">{notification.patientName}</span>
                        {notification.sessionType && (
                          <Badge variant="outline" className="text-xs">
                            {notification.sessionType === "video" ? "Video Call" :
                             notification.sessionType === "emergency" ? "Emergency" : "In-Clinic"}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-700">
                          {formatPhoneNumber(notification.phoneNumber)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs hover:bg-blue-100"
                          onClick={() => window.open(`tel:${notification.phoneNumber}`)}
                        >
                          Call
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">
                          ID: {notification.appointmentId}
                        </span>
                      </div>

                      {notification.appointmentTime && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-600" />
                          <span className="text-sm text-gray-700">
                            {new Date(notification.appointmentTime).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Additional Message */}
                    {notification.message && (
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-sm text-gray-700">{notification.message}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Acknowledge
                      </Button>
                      {notification.type === "appointment" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="px-3"
                            onClick={() => window.open(`tel:${notification.phoneNumber}`)}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="px-3"
                            onClick={() => {
                              // Open patient details or navigate to patient management
                              console.log("View patient details:", notification.patientName)
                            }}
                          >
                            <User className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <motion.div
                        className={`h-1 rounded-full ${
                          notification.type === "emergency" ? "bg-red-500" :
                          notification.urgency === "urgent" ? "bg-orange-500" : "bg-blue-500"
                        }`}
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: (notification.duration || settings.showDuration) / 1000, ease: "linear" }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Sound Toggle */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`
            w-10 h-10 rounded-full p-0 
            ${soundEnabled ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"}
            hover:scale-110 transition-all duration-200
          `}
        >
          <Bell className={`h-4 w-4 ${soundEnabled ? "" : "opacity-50"}`} />
        </Button>
      </div>
    </div>
  )
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])

  const addNotification = (notification: Omit<NotificationData, "id" | "timestamp">) => {
    const newNotification: NotificationData = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      autoShow: true
    }
    
    setNotifications(prev => [newNotification, ...prev])
    return newNotification.id
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, autoShow: false } : n)
    )
  }

  const clearAll = () => {
    setNotifications([])
  }

  // Quick helper for appointment notifications
  const notifyAppointment = (patientName: string, phoneNumber: string, appointmentTime?: string, urgency: "normal" | "urgent" | "emergency" = "normal") => {
    return addNotification({
      type: "appointment",
      patientName,
      appointmentId: `APT-${Date.now().toString().slice(-6)}`,
      phoneNumber,
      appointmentTime,
      urgency,
      sessionType: "in_clinic",
      message: urgency === "emergency" ? "Emergency appointment requires immediate attention!" : undefined
    })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    clearAll,
    notifyAppointment
  }
}
