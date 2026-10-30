"use client"

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Award, Volume2, VolumeX } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function VoiceAssistantButton() {
  const { toast } = useToast()
  const [isPlaying, setIsPlaying] = useState(false)

  // Complete website content for reading
  const siteContent = `
    Welcome to Gonstead Chiropractic Clinic. We are the leading chiropractic care center in Nowshera, specializing in the precise Gonstead technique. 
    
    About our clinic: We focus on accurate spinal analysis and targeted adjustments. Dr. Bashir Khan brings over 15 years of expertise to provide you with the most effective chiropractic care. Our approach emphasizes finding the exact source of spinal dysfunction and treating it with minimal force for maximum effectiveness.
    
    Our services include: Comprehensive Gonstead spinal adjustments, precise X-ray analysis, postural correction, disc herniation treatment, and sports injury rehabilitation. We offer both in-clinic treatments and video consultations for your convenience. Each treatment is personalized to address your specific spinal health needs using the proven Gonstead technique.
    
    Meet Dr. Bashir Khan: He is a certified Gonstead specialist with over 15 years of experience in chiropractic care. He has successfully treated over 2000 patients with a 99% success rate. Dr. Khan specializes in precise spinal analysis, disc herniation treatment, postural correction, and sports injury rehabilitation. His philosophy centers on providing personalized, precise care that addresses the root cause of spinal dysfunction.
    
    Our clinic location: We are conveniently located Near Peshawar Model School on Tehsil Road in Nowshera, Khyber Pakhtunkhwa. We're open Monday through Saturday from 9 AM to 6 PM, with emergency appointments available on Sundays. You can easily find us with ample parking available. Our modern facility is equipped with the latest diagnostic and treatment equipment for your comfort and care.
    
    Booking appointments: You can book online through our website, call us at +92 304 699 6267, or use our WhatsApp booking service. We offer both in-clinic Gonstead adjustments and video consultations. Initial consultations are 2000 Pakistani Rupees, with follow-up sessions at 1500 Pakistani Rupees. We accept cash, JazzCash, and EasyPaisa payments, and insurance coverage may apply.
    
    Contact information: You can reach us at +92 304 699 6267 for appointments and inquiries. Our email is gonsteadchiropractic.org@gmail.com. We're located Near Peshawar Model School, Tehsil Road, Nowshera, KPK. For emergencies, please call our emergency line immediately. We also offer WhatsApp booking and consultations for your convenience.
    
    Thank you for choosing Gonstead Chiropractic Clinic for your spinal health needs.
  `

  // Import the voice service
  const voiceService = typeof window !== 'undefined' ? require('@/lib/voice-service').voiceService : null
  
  // ElevenLabs voice function with fallback
  const speakWithElevenLabs = async (text: string): Promise<boolean> => {
    if (!voiceService || typeof window === 'undefined') {
      console.log('ElevenLabs service not available')
      return false
    }
    
    try {
      // Use ElevenLabs voice service
      const success = await voiceService.speak(text, 'patient')
      if (success) {
        console.log('ElevenLabs speech successful')
      } else {
        console.log('ElevenLabs speech failed')
      }
      return success
    } catch (error) {
      console.log('ElevenLabs voice error - falling back to browser TTS')
      return false
    }
  }

  // Browser TTS function as fallback
  const speakWithBrowserTTS = (text: string): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        if (!window.speechSynthesis) {
          resolve(false)
          return
        }

        // Cancel any existing speech
        window.speechSynthesis.cancel()
        
        // Wait a bit for cancel to complete
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(text)
          
          // Configure utterance
          utterance.rate = 0.8
          utterance.pitch = 1.0
          utterance.volume = 0.9
          utterance.lang = 'en-US'
          
          // Try to find a good voice
          const setVoiceAndSpeak = () => {
            const voices = window.speechSynthesis.getVoices()
            
            if (voices.length > 0) {
              // Prefer English voices
              const englishVoices = voices.filter(voice => 
                voice.lang.startsWith('en')
              )
              
              if (englishVoices.length > 0) {
                utterance.voice = englishVoices[0]
              } else {
                utterance.voice = voices[0]
              }
            }
            
            utterance.onstart = () => {
              console.log('Browser TTS started')
            }
            
            utterance.onend = () => {
              console.log('Browser TTS ended')
              setIsPlaying(false)
              resolve(true)
            }
            
            utterance.onerror = (event) => {
              console.error('Browser TTS error:', {
                error: event.error,
                type: event.type,
                message: 'Speech synthesis failed'
              })
              setIsPlaying(false)
              resolve(false)
            }
            
            try {
              window.speechSynthesis.speak(utterance)
              resolve(true)
            } catch (error) {
              console.log('Failed to speak')
              setIsPlaying(false)
              resolve(false)
            }
          }
          
          // Load voices if not already loaded
          if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
              setVoiceAndSpeak()
            }
          } else {
            setVoiceAndSpeak()
          }
        }, 100)
      } catch (error) {
        console.error('Browser TTS setup error:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          name: error instanceof Error ? error.name : 'Error'
        })
        setIsPlaying(false)
        resolve(false)
      }
    })
  }

  // Main function to handle click
  const handleClick = async () => {
    try {
      if (isPlaying) {
        // Stop current speaking
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel()
        }
        setIsPlaying(false)
        toast({
          title: "Voice Assistant",
          description: "Reading stopped",
        })
        return
      }

      setIsPlaying(true)
      toast({
        title: "Voice Assistant",
        description: "Reading website content aloud...",
      })

      // Clean text for better speech
      const cleanText = siteContent
        .replace(/\s+/g, ' ')
        .trim()

      // Try ElevenLabs first, then fallback to browser TTS
      let success = await speakWithElevenLabs(cleanText)
      
      if (!success) {
        console.log('ElevenLabs failed, trying browser TTS')
        success = await speakWithBrowserTTS(cleanText)
      }
      
      if (!success) {
        setIsPlaying(false)
        toast({
          title: "Voice Error",
          description: "Could not read content. Please check your browser settings.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Voice error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : 'Error'
      })
      setIsPlaying(false)
      toast({
        title: "Voice Error",
        description: error instanceof Error ? error.message : "Voice service is unavailable.",
        variant: "destructive",
      })
    }
  }

  return (
    <Badge
      className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-cyan-300 border border-cyan-400/40 px-6 py-3 text-base font-bold backdrop-blur-sm rounded-full shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 cursor-pointer group relative overflow-hidden"
      onClick={handleClick}
    >
      {/* Animated background on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
      
      <div className="relative flex items-center gap-2">
        <Award className="h-4 w-4" />
        <span style={{color: 'rgb(46,99,119)'}}>Board Certified Gonstead Specialist</span>
        {isPlaying ? (
          <VolumeX className="h-4 w-4 ml-1 animate-pulse text-red-400" />
        ) : (
          <Volume2 className="h-4 w-4 ml-1 group-hover:animate-pulse" />
        )}
      </div>

      {/* Voice indicator */}
      {isPlaying && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
      )}
    </Badge>
  )
}
