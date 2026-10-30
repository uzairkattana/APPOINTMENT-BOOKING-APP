// Voice Service for ElevenLabs API Integration
"use client"

interface VoiceSettings {
  stability: number
  similarity_boost: number
  style?: number
  use_speaker_boost?: boolean
}

interface TTSResponse {
  success: boolean
  audioUrl?: string
  error?: string
}

interface VoiceConfig {
  voiceId: string
  apiKey: string
  modelId?: string
  settings?: VoiceSettings
}

export class VoiceService {
  private static instance: VoiceService
  // Removed external TTS keys; default to browser TTS only
  private voiceConfig: Partial<VoiceConfig> = {}
  private audioContext: AudioContext | null = null
  private isPlaying = false

  constructor() {}

  static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService()
    }
    return VoiceService.instance
  }

  // Initialize audio context
  private async initAudioContext(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  // Convert text to speech using ElevenLabs API with fallback to browser TTS
  async textToSpeech(
    text: string, 
    voiceType: 'patient' | 'doctor' = 'patient',
    options?: Partial<VoiceConfig>
  ): Promise<TTSResponse> {
    try {
      if (!text || text.trim().length === 0) {
        return { success: false, error: "Empty text provided" }
      }

      // Clean text for better synthesis
      const cleanText = this.cleanTextForSpeech(text)
      
      // External TTS disabled; using browser TTS
      // Skipping external API; proceed to browser TTS

      // Fallback to browser's built-in TTS
      return this.useBrowserTTS(cleanText)
    } catch (error) {
        const errorMessage = typeof error === 'object' && error && 'message' in error ? String(error.message) : (typeof error === 'string' ? error : 'Unknown error occurred')
        console.error('Text-to-speech error:', {
          message: errorMessage,
          name: typeof error === 'object' && error && 'name' in error ? String(error.name) : 'Error'
        })
        return {
          success: false,
          error: errorMessage
        }
    }
  }

  // Fallback browser TTS method
  private useBrowserTTS(text: string): Promise<TTSResponse> {
    return new Promise((resolve) => {
      try {
        if (typeof window === 'undefined' || !window.speechSynthesis) {
          resolve({ success: false, error: 'Speech synthesis not supported' })
          return
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel()
        
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9
        utterance.pitch = 1.0
        utterance.volume = 0.8
        utterance.lang = 'en-US'
        
        // Find a good voice
        const voices = window.speechSynthesis.getVoices()
        const preferredVoices = voices.filter(voice => 
          voice.lang.includes('en') && 
          (voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.name.includes('Natural'))
        )
        
        if (preferredVoices.length > 0) {
          utterance.voice = preferredVoices[0]
        } else if (voices.length > 0) {
          utterance.voice = voices.find(voice => voice.lang.includes('en')) || voices[0]
        }

        utterance.onend = () => {
          resolve({ success: true, audioUrl: 'browser-tts' })
        }

        utterance.onerror = () => {
          resolve({ success: false, error: 'Browser TTS failed' })
        }

        window.speechSynthesis.speak(utterance)
        
        // Resolve immediately for browser TTS
        resolve({ success: true, audioUrl: 'browser-tts' })
      } catch (error) {
        resolve({ success: false, error: 'Browser TTS error' })
      }
    })
  }

  // Play audio from URL
  async playAudio(audioUrl: string): Promise<boolean> {
    try {
      await this.initAudioContext()

      if (this.isPlaying) {
        this.stopCurrentAudio()
      }

      return new Promise((resolve, reject) => {
        const audio = new Audio(audioUrl)
        
        audio.onloadeddata = () => {
          console.log('Audio loaded successfully')
        }

        audio.onplay = () => {
          this.isPlaying = true
          console.log('Audio started playing')
        }

        audio.onended = () => {
          this.isPlaying = false
          URL.revokeObjectURL(audioUrl) // Clean up blob URL
          console.log('Audio finished playing')
          resolve(true)
        }

        audio.onerror = (event) => {
          this.isPlaying = false
          const target = (event && typeof event === 'object' && 'target' in event) ? event.target as HTMLAudioElement : null
          const errorDetails = {
            message: 'Audio error occurred',
            type: (event && typeof event === 'object' && 'type' in event) ? event.type : 'error',
            target: target?.src || 'unknown source',
            readyState: target?.readyState,
            networkState: target?.networkState,
            errorCode: target?.error?.code || 'unknown',
            errorMessage: target?.error?.message || 'No detailed error'
          }
          console.error('Audio playback error:', errorDetails)
          reject(new Error(`Audio playback failed: ${errorDetails.errorMessage}`))
        }

        // Set volume and play with user interaction check
        audio.volume = 0.8
        audio.play().catch((playError) => {
          console.error('Play failed:', {
            name: playError.name,
            message: playError.message,
            suggestion: playError.name === 'NotAllowedError' ? 'User interaction required' : 'Check audio support'
          })
          this.isPlaying = false
          reject(playError)
        })
      })
    } catch (error) {
      console.error('Error playing audio:', {
        message: typeof error === 'object' && error && 'message' in error ? error.message : (typeof error === 'string' ? error : 'Unknown error'),
        name: typeof error === 'object' && error && 'name' in error ? error.name : 'Error',
        stack: typeof error === 'object' && error && 'stack' in error ? error.stack : undefined
      })
      return false
    }
  }

  // Speak text with automatic TTS and playback
  async speak(
    text: string, 
    voiceType: 'patient' | 'doctor' = 'patient',
    options?: Partial<VoiceConfig>
  ): Promise<boolean> {
    try {
      // Clean the text for better speech
      const cleanText = this.cleanTextForSpeech(text)
      
      console.log(`Speaking (${voiceType}):`, cleanText)

      const ttsResult = await this.textToSpeech(cleanText, voiceType, options)
      
      if (!ttsResult.success || !ttsResult.audioUrl) {
        console.error('TTS failed:', ttsResult.error)
        return false
      }

      await this.playAudio(ttsResult.audioUrl)
      return true
    } catch (error) {
      console.error('Error in speak function:', error)
      return false
    }
  }

  // Clean text for better speech synthesis
  private cleanTextForSpeech(text: string): string {
    return text
      // Remove URLs
      .replace(/https?:\/\/[^\s]+/g, 'website link')
      // Remove email addresses
      .replace(/[\w.-]+@[\w.-]+\.[a-z]{2,}/gi, 'email address')
      // Remove phone numbers in common formats
      .replace(/(\+\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g, 'phone number')
      // Remove excessive punctuation
      .replace(/[!]{2,}/g, '!')
      .replace(/[?]{2,}/g, '?')
      .replace(/[.]{2,}/g, '.')
      // Replace common abbreviations
      .replace(/\bDr\./gi, 'Doctor')
      .replace(/\bPKR\b/gi, 'Pakistani Rupees')
      .replace(/\b24\/7\b/gi, 'twenty four seven')
      .replace(/\b\d+\+\b/gi, (match) => match.replace('+', ' plus'))
      // Remove emojis and special characters for cleaner speech
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '')
      // Clean up extra spaces
      .replace(/\s+/g, ' ')
      .trim()
  }

  // Stop current audio playback with better cleanup
  stopCurrentAudio(): void {
    try {
      // Stop speech synthesis
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      
      // Stop all audio elements
      if (typeof document !== 'undefined') {
        const audioElements = document.querySelectorAll('audio')
        audioElements.forEach(audio => {
          if (!audio.paused) {
            audio.pause()
            audio.currentTime = 0
          }
        })
      }
      
      this.isPlaying = false
    } catch (error) {
      console.error('Error stopping audio:', error)
      this.isPlaying = false
    }
  }

  // Check if currently playing
  isCurrentlyPlaying(): boolean {
    return this.isPlaying
  }

  // Update voice settings
  updateVoiceSettings(settings: Partial<VoiceSettings>): void {
    this.voiceConfig.settings = { 
      ...this.voiceConfig.settings, 
      ...Object.fromEntries(
        Object.entries(settings).filter(([_, value]) => value !== undefined)
      )
    } as VoiceSettings
  }

  // Set voice type for different users
  setVoiceType(voiceType: 'patient' | 'doctor', voiceId?: string): void {
    if (voiceId) {
      this.voiceConfig.voiceId = voiceId
    }
    // You can extend this to use different voice IDs for patient vs doctor
  }

  // Get available voices (mock - you can implement actual API call)
  getAvailableVoices(): Array<{id: string, name: string, type: string}> {
    return [
      { id: "HKFOb9iktHA85uKXydRT", name: "Default Voice", type: "neural" },
      // Add more voices as needed
    ]
  }
}

// Export singleton instance
export const voiceService = VoiceService.getInstance()

// Export types for external use
export type { VoiceConfig, VoiceSettings, TTSResponse }
