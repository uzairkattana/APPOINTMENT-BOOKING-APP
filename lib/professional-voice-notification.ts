// Professional Voice Notification Service
"use client"

interface VoiceProfile {
  id: string
  name: string
  type: "male" | "female" | "neutral"
  description: string
  pitch: number
  rate: number
  volume: number
}

interface VoiceNotificationSettings {
  enabled: boolean
  volume: number
  rate: number
  pitch: number
  selectedVoice: string
  autoPlay: boolean
  priorities: {
    emergency: boolean
    urgent: boolean
    normal: boolean
  }
}

interface NotificationSpeechData {
  patientName?: string
  type: string
  urgency?: "normal" | "urgent" | "emergency"
  message: string
  appointmentTime?: string
  sessionType?: string
}

export class ProfessionalVoiceNotificationService {
  private static instance: ProfessionalVoiceNotificationService
  private synthesis: SpeechSynthesis | null = null
  private voices: SpeechSynthesisVoice[] = []
  private currentUtterance: SpeechSynthesisUtterance | null = null
  private isPlaying = false
  private queue: NotificationSpeechData[] = []
  
  // Professional voice profiles optimized for medical notifications
  private voiceProfiles: VoiceProfile[] = [
    {
      id: "professional-female-soft",
      name: "Professional Female (Soft)",
      type: "female",
      description: "Gentle, reassuring female voice perfect for patient notifications",
      pitch: 1.1,
      rate: 0.9,
      volume: 0.75
    },
    {
      id: "professional-male-soft",
      name: "Professional Male (Soft)",
      type: "male",
      description: "Calm, professional male voice with clear articulation",
      pitch: 0.9,
      rate: 0.9,
      volume: 0.75
    },
    {
      id: "professional-female-standard",
      name: "Professional Female (Standard)",
      type: "female",
      description: "Clear and confident female voice for general notifications",
      pitch: 1.0,
      rate: 0.95,
      volume: 0.8
    },
    {
      id: "professional-male-standard",
      name: "Professional Male (Standard)",
      type: "male",
      description: "Authoritative yet friendly male voice",
      pitch: 0.95,
      rate: 0.95,
      volume: 0.8
    },
    {
      id: "emergency-alert",
      name: "Emergency Alert",
      type: "neutral",
      description: "Clear, urgent voice for emergency notifications",
      pitch: 1.05,
      rate: 1.0,
      volume: 0.9
    }
  ]

  private settings: VoiceNotificationSettings = {
    enabled: true,
    volume: 0.75,
    rate: 0.9,
    pitch: 1.0,
    selectedVoice: "professional-female-soft",
    autoPlay: true,
    priorities: {
      emergency: true,
      urgent: true,
      normal: true
    }
  }

  private constructor() {
    if (typeof window !== "undefined") {
      this.synthesis = window.speechSynthesis
      this.loadVoices()
      
      // Load voices when they change (some browsers load voices asynchronously)
      if (this.synthesis) {
        this.synthesis.onvoiceschanged = () => this.loadVoices()
      }
    }
  }

  static getInstance(): ProfessionalVoiceNotificationService {
    if (!ProfessionalVoiceNotificationService.instance) {
      ProfessionalVoiceNotificationService.instance = new ProfessionalVoiceNotificationService()
    }
    return ProfessionalVoiceNotificationService.instance
  }

  private loadVoices(): void {
    if (this.synthesis) {
      this.voices = this.synthesis.getVoices()
    }
  }

  private getOptimalVoice(profile: VoiceProfile): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) {
      this.loadVoices()
    }

    // Priority order for selecting voices
    const preferredVoiceNames = [
      // Google voices (high quality, natural)
      "Google UK English Female",
      "Google US English Female",
      "Google UK English Male", 
      "Google US English Male",
      // Microsoft voices (professional quality)
      "Microsoft Zira - English (United States)",
      "Microsoft David - English (United States)",
      "Microsoft Hazel - English (Great Britain)",
      "Microsoft George - English (Great Britain)",
      // Apple voices (natural, high quality on Safari)
      "Samantha",
      "Karen",
      "Daniel",
      "Alex",
      // Generic fallbacks
      "English United States",
      "English United Kingdom"
    ]

    // Filter by gender preference
    const genderFilteredVoices = this.voices.filter(voice => {
      const nameLower = voice.name.toLowerCase()
      if (profile.type === "female") {
        return nameLower.includes("female") || 
               nameLower.includes("zira") || 
               nameLower.includes("hazel") || 
               nameLower.includes("samantha") ||
               nameLower.includes("karen")
      } else if (profile.type === "male") {
        return nameLower.includes("male") || 
               nameLower.includes("david") || 
               nameLower.includes("george") ||
               nameLower.includes("daniel") ||
               nameLower.includes("alex")
      }
      return true
    })

    // Try to find a preferred voice
    for (const preferredName of preferredVoiceNames) {
      const voice = genderFilteredVoices.find(v => 
        v.name.includes(preferredName)
      )
      if (voice) return voice
    }

    // Fallback to any English voice
    const englishVoice = this.voices.find(v => 
      v.lang.startsWith("en") && v.localService
    )
    
    return englishVoice || this.voices[0] || null
  }

  private createProfessionalMessage(data: NotificationSpeechData): string {
    const { patientName, type, urgency, message, appointmentTime, sessionType } = data
    
    let speechText = ""
    
    // Add urgency prefix
    if (urgency === "emergency") {
      speechText = "Emergency alert. "
    } else if (urgency === "urgent") {
      speechText = "Urgent notification. "
    }
    
    // Main message based on notification type
    if (type === "appointment") {
      if (patientName) {
        speechText += `New appointment for ${patientName}. `
      }
      
      if (sessionType) {
        const sessionTypeText = sessionType === "in_clinic" ? "in clinic" : 
                               sessionType === "video" ? "video consultation" : 
                               sessionType
        speechText += `Session type: ${sessionTypeText}. `
      }
      
      if (appointmentTime) {
        const time = new Date(appointmentTime)
        const timeStr = time.toLocaleTimeString("en-US", { 
          hour: "numeric", 
          minute: "2-digit",
          hour12: true 
        })
        const dateStr = time.toLocaleDateString("en-US", { 
          month: "short", 
          day: "numeric" 
        })
        speechText += `Scheduled for ${dateStr} at ${timeStr}. `
      }
    } else if (type === "reminder") {
      speechText += `Reminder: `
      if (patientName) {
        speechText += `${patientName}. `
      }
    } else if (type === "system") {
      speechText += "System notification. "
    }
    
    // Add custom message
    if (message) {
      speechText += this.cleanTextForSpeech(message)
    }
    
    return speechText
  }

  private cleanTextForSpeech(text: string): string {
    return text
      // Remove URLs
      .replace(/https?:\/\/[^\s]+/g, "website link")
      // Remove email addresses
      .replace(/[\w.-]+@[\w.-]+\.[a-z]{2,}/gi, "email address")
      // Handle phone numbers
      .replace(/\+\d{2}\s?\d{3}\s?\d{7}/g, "phone number")
      // Remove excessive punctuation
      .replace(/[!]{2,}/g, "!")
      .replace(/[?]{2,}/g, "?")
      .replace(/[.]{2,}/g, ".")
      // Replace common medical abbreviations
      .replace(/\bDr\./gi, "Doctor")
      .replace(/\bMr\./gi, "Mister")
      .replace(/\bMs\./gi, "Miss")
      .replace(/\bMrs\./gi, "Missis")
      // Remove emojis
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, "")
      // Clean up spaces
      .replace(/\s+/g, " ")
      .trim()
  }

  async speak(data: NotificationSpeechData): Promise<boolean> {
    try {
      if (!this.settings.enabled || !this.synthesis) {
        console.log("Voice notifications disabled or not supported")
        return false
      }

      // Check if this priority level should be spoken
      const urgency = data.urgency || "normal"
      if (!this.settings.priorities[urgency]) {
        console.log(`Voice notifications disabled for ${urgency} priority`)
        return false
      }

      // Stop any current speech
      if (this.isPlaying) {
        this.stop()
      }

      // Get the voice profile
      const profileId = urgency === "emergency" ? "emergency-alert" : this.settings.selectedVoice
      const profile = this.voiceProfiles.find(p => p.id === profileId) || this.voiceProfiles[0]
      
      // Create the speech text
      const speechText = this.createProfessionalMessage(data)
      
      if (!speechText || speechText.trim().length === 0) {
        console.warn("No speech text generated")
        return false
      }

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(speechText)
      
      // Get optimal voice
      const voice = this.getOptimalVoice(profile)
      if (voice) {
        utterance.voice = voice
      }
      
      // Apply voice profile settings with user preferences
      utterance.pitch = profile.pitch * this.settings.pitch
      utterance.rate = profile.rate * this.settings.rate
      utterance.volume = profile.volume * this.settings.volume
      utterance.lang = "en-US"
      
      // Event handlers
      utterance.onstart = () => {
        this.isPlaying = true
        console.log("Voice notification started:", speechText.substring(0, 50))
      }
      
      utterance.onend = () => {
        this.isPlaying = false
        this.currentUtterance = null
        console.log("Voice notification completed")
        
        // Process queue if items exist
        this.processQueue()
      }
      
      utterance.onerror = (event) => {
        this.isPlaying = false
        this.currentUtterance = null
        console.error("Voice notification error:", event.error)
      }
      
      this.currentUtterance = utterance
      this.synthesis.speak(utterance)
      
      return true
    } catch (error) {
      console.error("Error speaking notification:", error)
      this.isPlaying = false
      return false
    }
  }

  private async processQueue(): Promise<void> {
    if (this.queue.length > 0 && !this.isPlaying) {
      const next = this.queue.shift()
      if (next) {
        await this.speak(next)
      }
    }
  }

  addToQueue(data: NotificationSpeechData): void {
    // Emergency notifications should skip the queue
    if (data.urgency === "emergency") {
      this.speak(data)
    } else {
      this.queue.push(data)
      if (!this.isPlaying) {
        this.processQueue()
      }
    }
  }

  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel()
      this.isPlaying = false
      this.currentUtterance = null
    }
  }

  clearQueue(): void {
    this.queue = []
  }

  // Settings management
  updateSettings(newSettings: Partial<VoiceNotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("voiceNotificationSettings", JSON.stringify(this.settings))
    }
  }

  getSettings(): VoiceNotificationSettings {
    return { ...this.settings }
  }

  loadSettings(): void {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("voiceNotificationSettings")
      if (saved) {
        try {
          this.settings = { ...this.settings, ...JSON.parse(saved) }
        } catch (error) {
          console.error("Error loading voice settings:", error)
        }
      }
    }
  }

  getVoiceProfiles(): VoiceProfile[] {
    return [...this.voiceProfiles]
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return [...this.voices]
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying
  }

  getQueueLength(): number {
    return this.queue.length
  }

  // Test functionality
  async testVoice(profileId?: string): Promise<boolean> {
    const testData: NotificationSpeechData = {
      type: "appointment",
      patientName: "Ahmad Hassan",
      urgency: "normal",
      message: "This is a test of the professional voice notification system. The voice is clear and natural.",
      appointmentTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      sessionType: "in_clinic"
    }

    if (profileId) {
      const currentVoice = this.settings.selectedVoice
      this.settings.selectedVoice = profileId
      const result = await this.speak(testData)
      this.settings.selectedVoice = currentVoice
      return result
    }

    return this.speak(testData)
  }
}

// Export singleton instance
export const professionalVoiceNotification = ProfessionalVoiceNotificationService.getInstance()

// Export types
export type { VoiceProfile, VoiceNotificationSettings, NotificationSpeechData }

