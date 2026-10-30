"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useToast } from "@/hooks/use-toast"

// Types for comprehensive settings
export interface NotificationSettings {
  enabled: boolean
  duration: number // in seconds
  maxVisible: number
  position: "top-right" | "top-left" | "bottom-right" | "bottom-left"
  sound: boolean
  vibration: boolean
  autoAcknowledge: boolean
  urgencyFilters: {
    normal: boolean
    urgent: boolean
    emergency: boolean
  }
  appointmentNotifications: {
    newAppointment: boolean
    appointmentReminder: boolean
    appointmentCancellation: boolean
    appointmentModification: boolean
  }
  emergencyNotifications: {
    enabled: boolean
    immediateAlert: boolean
    persistUntilAcknowledged: boolean
    escalationTime: number // minutes
  }
  scheduleNotifications: {
    dailySchedule: boolean
    upcomingAppointments: boolean
    overduePatients: boolean
    reminderTime: number // minutes before appointment
  }
}

export interface SystemLimits {
  maxPatientsPerDay: number
  maxConcurrentAppointments: number
  appointmentDuration: {
    minimum: number
    maximum: number
    default: number
  }
  sessionLimits: {
    videoCallMaxDuration: number
    clinicSessionMaxDuration: number
    emergencySessionMaxDuration: number
  }
  dataRetention: {
    patientRecords: number // days
    appointmentHistory: number // days
    systemLogs: number // days
  }
  rateLimits: {
    appointmentBookingsPerHour: number
    apiRequestsPerMinute: number
    failedLoginAttempts: number
  }
}

export interface UserInterface {
  theme: "light" | "dark" | "auto"
  language: "en" | "ur" | "ar" | "es" | "fr"
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD"
  timeFormat: "12h" | "24h"
  currency: "PKR" | "USD" | "EUR" | "GBP"
  timezone: string
  accessibility: {
    highContrast: boolean
    largeText: boolean
    screenReader: boolean
    keyboardNavigation: boolean
  }
  dashboard: {
    layout: "grid" | "list" | "compact"
    widgets: string[]
    refreshInterval: number // seconds
  }
}

export interface SecuritySettings {
  sessionTimeout: number // minutes
  requireMFA: boolean
  passwordPolicy: {
    minLength: number
    requireUppercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
    expiryDays: number
  }
  auditLogging: {
    enabled: boolean
    logLevel: "basic" | "detailed" | "verbose"
    retentionDays: number
  }
  apiSecurity: {
    rateLimitEnabled: boolean
    requireApiKey: boolean
    allowedOrigins: string[]
  }
  dataEncryption: {
    enabled: boolean
    algorithm: string
    keyRotationDays: number
  }
}

export interface AppSettings {
  notifications: NotificationSettings
  systemLimits: SystemLimits
  userInterface: UserInterface
  security: SecuritySettings
  integrations: {
    whatsapp: { enabled: boolean; apiKey: string }
    sms: { enabled: boolean; provider: string; apiKey: string }
    email: { enabled: boolean; smtpSettings: any }
    calendar: { enabled: boolean; provider: string }
  }
  backup: {
    enabled: boolean
    frequency: "daily" | "weekly" | "monthly"
    retention: number
    cloudProvider: string
  }
}

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  notifications: {
    enabled: true,
    duration: 5,
    maxVisible: 3,
    position: "top-right",
    sound: true,
    vibration: false,
    autoAcknowledge: false,
    urgencyFilters: {
      normal: true,
      urgent: true,
      emergency: true
    },
    appointmentNotifications: {
      newAppointment: true,
      appointmentReminder: true,
      appointmentCancellation: true,
      appointmentModification: true
    },
    emergencyNotifications: {
      enabled: true,
      immediateAlert: true,
      persistUntilAcknowledged: true,
      escalationTime: 5
    },
    scheduleNotifications: {
      dailySchedule: true,
      upcomingAppointments: true,
      overduePatients: true,
      reminderTime: 30
    }
  },
  systemLimits: {
    maxPatientsPerDay: 50,
    maxConcurrentAppointments: 5,
    appointmentDuration: {
      minimum: 15,
      maximum: 120,
      default: 30
    },
    sessionLimits: {
      videoCallMaxDuration: 60,
      clinicSessionMaxDuration: 90,
      emergencySessionMaxDuration: 30
    },
    dataRetention: {
      patientRecords: 2555, // ~7 years
      appointmentHistory: 1095, // 3 years
      systemLogs: 90
    },
    rateLimits: {
      appointmentBookingsPerHour: 10,
      apiRequestsPerMinute: 100,
      failedLoginAttempts: 5
    }
  },
  userInterface: {
    theme: "light",
    language: "en",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "12h",
    currency: "PKR",
    timezone: "Asia/Karachi",
    accessibility: {
      highContrast: false,
      largeText: false,
      screenReader: false,
      keyboardNavigation: true
    },
    dashboard: {
      layout: "grid",
      widgets: ["overview", "appointments", "patients", "analytics"],
      refreshInterval: 30
    }
  },
  security: {
    sessionTimeout: 60,
    requireMFA: false,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      expiryDays: 90
    },
    auditLogging: {
      enabled: true,
      logLevel: "detailed",
      retentionDays: 365
    },
    apiSecurity: {
      rateLimitEnabled: true,
      requireApiKey: true,
      allowedOrigins: ["localhost:3000"]
    },
    dataEncryption: {
      enabled: true,
      algorithm: "AES-256",
      keyRotationDays: 30
    }
  },
  integrations: {
    whatsapp: { enabled: false, apiKey: "" },
    sms: { enabled: false, provider: "twilio", apiKey: "" },
    email: { enabled: true, smtpSettings: {} },
    calendar: { enabled: false, provider: "google" }
  },
  backup: {
    enabled: true,
    frequency: "daily",
    retention: 30,
    cloudProvider: "aws"
  }
}

// Settings Context Interface
interface SettingsContextType {
  settings: AppSettings
  updateSettings: (path: string, value: any) => void
  updateBulkSettings: (newSettings: Partial<AppSettings>) => void
  resetSettings: () => void
  saveSettings: () => Promise<boolean>
  hasUnsavedChanges: boolean
  isLoading: boolean
  lastSaved: Date | null
  subscribeToChanges: (callback: (settings: AppSettings) => void) => () => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

// Settings Provider Component
interface SettingsProviderProps {
  children: ReactNode
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const { toast } = useToast()
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [subscribers, setSubscribers] = useState<((settings: AppSettings) => void)[]>([])

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [])

  // Auto-save mechanism
  useEffect(() => {
    if (hasUnsavedChanges) {
      const autoSaveTimer = setTimeout(() => {
        saveSettings(false) // Silent auto-save
      }, 30000) // Auto-save after 30 seconds

      return () => clearTimeout(autoSaveTimer)
    }
  }, [hasUnsavedChanges])

  // Notify subscribers when settings change
  useEffect(() => {
    subscribers.forEach(callback => callback(settings))
  }, [settings, subscribers])

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem("comprehensive_admin_settings")
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        // Merge with defaults to ensure all properties exist
        const merged = mergeWithDefaults(parsed, DEFAULT_SETTINGS)
        setSettings(merged)
        
        const lastSavedStr = localStorage.getItem("settings_last_saved")
        if (lastSavedStr) {
          setLastSaved(new Date(lastSavedStr))
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
      toast({
        title: "⚠️ Settings Load Error",
        description: "Failed to load saved settings. Using defaults.",
        variant: "destructive"
      })
    }
  }

  const mergeWithDefaults = (saved: any, defaults: AppSettings): AppSettings => {
    const result = { ...defaults }
    
    for (const key in saved) {
      if (saved[key] && typeof saved[key] === 'object' && !Array.isArray(saved[key])) {
        result[key as keyof AppSettings] = {
          ...result[key as keyof AppSettings],
          ...saved[key]
        }
      } else {
        result[key as keyof AppSettings] = saved[key]
      }
    }
    
    return result
  }

  const updateSettings = (path: string, value: any) => {
    setSettings(prev => {
      const keys = path.split('.')
      const updated = JSON.parse(JSON.stringify(prev)) // Deep clone
      let current = updated
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      return updated
    })
    
    setHasUnsavedChanges(true)
  }

  const updateBulkSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }))
    setHasUnsavedChanges(true)
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
    setHasUnsavedChanges(true)
    toast({
      title: "🔄 Settings Reset",
      description: "All settings have been reset to default values.",
      className: "border-blue-500 bg-blue-50"
    })
  }

  const saveSettings = async (showToast = true): Promise<boolean> => {
    setIsLoading(true)
    try {
      // Validate settings before saving
      const validationResult = validateSettings(settings)
      if (!validationResult.isValid) {
        if (showToast) {
          toast({
            title: "❌ Validation Error",
            description: validationResult.errors.join(", "),
            variant: "destructive"
          })
        }
        return false
      }

      localStorage.setItem("comprehensive_admin_settings", JSON.stringify(settings))
      const now = new Date()
      localStorage.setItem("settings_last_saved", now.toISOString())
      
      setHasUnsavedChanges(false)
      setLastSaved(now)
      
      // Broadcast settings change event for real-time updates
      window.dispatchEvent(new CustomEvent('settingsUpdated', { 
        detail: { settings } 
      }))
      
      if (showToast) {
        toast({
          title: "✅ Settings Saved",
          description: "Configuration changes applied successfully and are now active system-wide.",
          className: "border-green-500 bg-green-50"
        })
      }
      
      return true
    } catch (error) {
      console.error("Failed to save settings:", error)
      if (showToast) {
        toast({
          title: "❌ Save Failed",
          description: "Unable to save settings. Please try again.",
          variant: "destructive"
        })
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const validateSettings = (settings: AppSettings): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    // Validate notification duration
    if (settings.notifications.duration < 1 || settings.notifications.duration > 30) {
      errors.push("Notification duration must be between 1-30 seconds")
    }

    // Validate max patients per day
    if (settings.systemLimits.maxPatientsPerDay < 1 || settings.systemLimits.maxPatientsPerDay > 200) {
      errors.push("Max patients per day must be between 1-200")
    }

    // Validate appointment durations
    const { minimum, maximum, default: defaultDuration } = settings.systemLimits.appointmentDuration
    if (minimum >= maximum) {
      errors.push("Minimum appointment duration must be less than maximum")
    }
    if (defaultDuration < minimum || defaultDuration > maximum) {
      errors.push("Default appointment duration must be between minimum and maximum")
    }

    // Validate session timeout
    if (settings.security.sessionTimeout < 5 || settings.security.sessionTimeout > 480) {
      errors.push("Session timeout must be between 5-480 minutes")
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  const subscribeToChanges = (callback: (settings: AppSettings) => void) => {
    setSubscribers(prev => [...prev, callback])
    
    // Return unsubscribe function
    return () => {
      setSubscribers(prev => prev.filter(cb => cb !== callback))
    }
  }

  const contextValue: SettingsContextType = {
    settings,
    updateSettings,
    updateBulkSettings,
    resetSettings,
    saveSettings,
    hasUnsavedChanges,
    isLoading,
    lastSaved,
    subscribeToChanges
  }

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  )
}

// Hook to use settings
export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}

// Hook for specific setting sections
export function useNotificationSettings() {
  const { settings, updateSettings } = useSettings()
  
  return {
    notifications: settings.notifications,
    updateNotification: (path: string, value: any) => 
      updateSettings(`notifications.${path}`, value)
  }
}

export function useSystemLimits() {
  const { settings, updateSettings } = useSettings()
  
  return {
    limits: settings.systemLimits,
    updateLimit: (path: string, value: any) => 
      updateSettings(`systemLimits.${path}`, value)
  }
}

export function useUISettings() {
  const { settings, updateSettings } = useSettings()
  
  return {
    ui: settings.userInterface,
    updateUI: (path: string, value: any) => 
      updateSettings(`userInterface.${path}`, value)
  }
}

// Real-time settings watcher
export function useSettingsWatcher(callback: (settings: AppSettings) => void) {
  const { subscribeToChanges } = useSettings()
  
  useEffect(() => {
    const unsubscribe = subscribeToChanges(callback)
    return unsubscribe
  }, [callback, subscribeToChanges])
}

// Settings validation hook
export function useSettingsValidation() {
  const { settings } = useSettings()
  
  const validateCurrentSettings = () => {
    const errors: string[] = []

    // Real-time validation logic
    if (settings.notifications.duration < 1) {
      errors.push("Notification duration too short")
    }
    
    if (settings.systemLimits.maxPatientsPerDay > 100) {
      errors.push("Consider reducing max patients per day for optimal care")
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: errors.filter(e => e.includes("Consider"))
    }
  }

  return validateCurrentSettings
}

// Settings export/import utility
export function useSettingsIO() {
  const { settings, updateBulkSettings } = useSettings()
  
  const exportSettings = () => {
    const exportData = {
      settings,
      exportDate: new Date().toISOString(),
      version: "1.0.0"
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json"
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `gonstead-settings-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  const importSettings = (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target?.result as string)
          
          if (importData.settings) {
            updateBulkSettings(importData.settings)
            resolve(true)
          } else {
            reject(new Error("Invalid settings file format"))
          }
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsText(file)
    })
  }
  
  return { exportSettings, importSettings }
}
