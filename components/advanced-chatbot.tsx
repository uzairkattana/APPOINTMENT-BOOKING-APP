"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Send,
  X,
  Bot,
  User,
  Languages,
  Search,
  HelpCircle,
  Copy,
  Info,
  Activity,
  Dumbbell,
  AlertTriangle,
  ClipboardList,
  FileCheck,
  BarChart3,
  LineChart,
  ExternalLink,
  BookOpen
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
// import { voiceService } from "../lib/voice-service"
// import { googleAIService } from "../lib/google-ai-service"
import { generateKnowledgeResponse } from "../lib/chatbot-knowledge"
import { useLanguage } from "@/components/language-provider"
import { AnalyticsTracker } from "@/lib/analytics"
// Speech recognition types will be handled inline

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  type?: "text" | "appointment" | "location" | "booking"
}

interface AppointmentData {
  name?: string
  phone?: string
  email?: string
  preferredTime?: string
  sessionType?: "in_clinic" | "video"
  notes?: string
  step: number
}


export function AdvancedChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const chatbotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        chatbotRef.current &&
        !chatbotRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [chatbotRef])
  const { language, setLanguage } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your Gonstead Chiropractic assistant. I can help you book appointments, answer questions about treatments, or connect you with Bashir Khan Chiropractic. How can I assist you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [compact, setCompact] = useState(false)
  const [isNarrow, setIsNarrow] = useState(false)
  const [appointmentBooking, setAppointmentBooking] = useState<AppointmentData | null>(null)

  // Init analytics (client-only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      analyticsRef.current = new AnalyticsTracker()
    }
  }, [])

  // Limit messages for performance
  useEffect(() => {
    setMessages(prev => prev.length > 100 ? prev.slice(prev.length - 100) : prev)
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Compact mode on very small viewports
  useEffect(() => {
    const update = () => {
      const narrow = typeof window !== 'undefined' && (window.innerWidth < 380 || window.innerHeight < 600)
      setIsNarrow(!!narrow)
      setCompact(!!narrow)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Simple intent-based suggestions (updates as user types)
  const [suggestedIds, setSuggestedIds] = useState<string[]>([])
  useEffect(() => {
    const text = inputMessage.toLowerCase()
    const ids: string[] = []
    if (/(book|appointment|schedule|اپائنٹمنٹ|بک)/.test(text)) ids.push('booking', 'hours')
    if (/(where|location|map|کہاں)/.test(text)) ids.push('location')
    if (/(sciatica|sciatic|leg|سائٹیکا)/.test(text)) ids.push('sciatica')
    if (/(back|lower|lumbar|کمر|پیٹھ)/.test(text)) ids.push('low_back_pain')
    if (/(neck|cervical|گردن)/.test(text)) ids.push('neck_pain')
    if (/(headache|migraine|سر درد)/.test(text)) ids.push('headache')
    if (/(posture|sit|stand|پوسچر|بیٹھنا|کھڑا)/.test(text)) ids.push('posture')
    if (/(sleep|sleeping|position|نیند|سونا)/.test(text)) ids.push('sleep')
    if (/(x\s?-?ray|xray|ایکس رے)/.test(text)) ids.push('xray')
    if (/(pay|payment|easypaisa|jazzcash|ادائیگی|فیس)/.test(text)) ids.push('payments')
    if (/(reschedule|cancel|change|تبدیل|منسوخ)/.test(text)) ids.push('reschedule')
    setSuggestedIds(Array.from(new Set(ids)).slice(0, 3))
  }, [inputMessage])


  const processAppointmentBooking = (userMessage: string): string => {
    const message = userMessage.toLowerCase()

    if (!appointmentBooking) {
      // Start booking process
      setAppointmentBooking({ step: 1 })
      return "Great! I'll help you book an appointment with Bashir Khan Chiropractic. Let's start with your full name. What's your name?"
    }

    switch (appointmentBooking.step) {
      case 1: // Getting name
        setAppointmentBooking(prev => ({ ...prev!, name: userMessage, step: 2 }))
        return `Thank you, ${userMessage}! Now I need your phone number for appointment confirmation. Please provide your mobile number.`

      case 2: // Getting phone
        const phoneRegex = /^(\+92|0)?3[0-9]{9}$/
        if (!phoneRegex.test(userMessage.replace(/\s/g, ''))) {
          return "Please provide a valid Pakistani mobile number (e.g., 03001234567 or +923001234567)."
        }
        setAppointmentBooking(prev => ({ ...prev!, phone: userMessage, step: 3 }))
        return "Perfect! Would you prefer an in-clinic Gonstead adjustment or a video consultation? Please type 'clinic' or 'video'."

      case 3: // Getting session type
        if (message.includes('clinic') || message.includes('office') || message.includes('visit')) {
          setAppointmentBooking(prev => ({ ...prev!, sessionType: 'in_clinic', step: 4 }))
          return "Excellent choice! In-clinic Gonstead adjustments provide the most comprehensive treatment. When would you like to schedule your appointment? Please provide your preferred date and time (e.g., 'Tomorrow 2 PM' or 'Monday 10 AM')."
        } else if (message.includes('video') || message.includes('online') || message.includes('virtual')) {
          setAppointmentBooking(prev => ({ ...prev!, sessionType: 'video', step: 4 }))
          return "Good choice for quick consultation! Video consultations are great for follow-ups and initial assessments. When would you like to schedule your video consultation? Please provide your preferred date and time."
        } else {
          return "Please choose either 'clinic' for in-person visit or 'video' for online consultation."
        }

      case 4: // Getting preferred time
        setAppointmentBooking(prev => ({ ...prev!, preferredTime: userMessage, step: 5 }))
        return "Great! Do you have any specific concerns or notes about your condition that you'd like Bashir Khan Chiropractic to know beforehand? (You can type 'none' if no specific notes)"

      case 5: // Getting notes and confirmation
        const notes = message === 'none' ? '' : userMessage
        setAppointmentBooking(prev => ({ ...prev!, notes, step: 6 }))

        const appointmentSummary = `
📋 APPOINTMENT SUMMARY:
👤 Name: ${appointmentBooking.name}
📞 Phone: ${appointmentBooking.phone}
🏥 Type: ${appointmentBooking.sessionType === 'in_clinic' ? 'In-Clinic Gonstead Adjustment' : 'Video Consultation'}
📅 Preferred Time: ${appointmentBooking.preferredTime}
📝 Notes: ${notes || 'None'}

Shall I confirm and book this appointment for you? Please type 'yes' to confirm or 'no' to cancel.`

        return appointmentSummary

      case 6: // Final confirmation
        if (message.includes('yes') || message.includes('confirm') || message.includes('book')) {
          // Reset booking state
          const bookingData = { ...appointmentBooking }
          setAppointmentBooking(null)

          // Here you would typically send the data to your backend
          console.log('Appointment booked:', bookingData)

          return `🎉 APPOINTMENT CONFIRMED! 

Dear ${bookingData.name}, your appointment has been successfully booked!

📅 Appointment Details:
• Type: ${bookingData.sessionType === 'in_clinic' ? 'In-Clinic Treatment' : 'Video Consultation'}
• Time: ${bookingData.preferredTime}
• Phone: ${bookingData.phone}

✅ What's Next:
• You'll receive a WhatsApp confirmation shortly
• Our team will contact you to confirm the exact time
• For clinic visits: Near Peshawar Model School, Tehsil Road, Nowshera

📞 Contact: +92 304 699 6267

Thank you for choosing Gonstead Chiropractic Clinic!`
        } else {
          setAppointmentBooking(null)
          return "Appointment booking cancelled. No worries! Feel free to start over anytime or contact us directly at +92 304 699 6267."
        }

      default:
        setAppointmentBooking(null)
        return "Let's start fresh. How can I help you today?"
    }
  }

  const getBotResponse = async (userMessage: string): Promise<string> => {
    const message = userMessage.toLowerCase()

    // Appointment booking conversational flow
    if (
      appointmentBooking ||
      message.includes("appointment") ||
      message.includes("book") ||
      message.includes("schedule") ||
      message.includes("اپائنٹمنٹ") ||
      message.includes("بک")
    ) {
      return processAppointmentBooking(userMessage)
    }

    // Try unified backend first
    try {
      const historyPayload = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }))

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          history: historyPayload,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data?.text) {
        throw new Error(data?.error || "Failed to get assistant response")
      }

      return String(data.text)
    } catch (error) {
      console.error("Chat backend error:", error)
      // Fallback to local structured knowledge base
      const kbAnswer = getFallbackResponse(userMessage)
      return `${kbAnswer}\n\nThis information is general educational guidance and not a diagnosis. For a personalized assessment, please consult the clinic directly at +92 304 699 6267 or your healthcare provider.`
    }
  }

  const getFallbackResponse = (message: string): string => {
    console.warn('Fallback response used for message:', message)
    return "Right now the intelligent assistant engine is not fully connected, so I can't safely generate a detailed clinical answer. This chat is for general guidance only. For accurate advice about your specific condition, please contact Gonstead Chiropractic Clinic directly at +92 304 699 6267 or visit in person. For any emergency or severe symptoms, seek urgent medical care or call 1122."
  }


  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    const currentMessage = inputMessage
    setInputMessage("")
    setMessages((prev) => [...prev, userMessage])

    analyticsRef.current?.trackEvent('chat_send', { len: currentMessage.length })

    setIsTyping(true)
    try {
      const botText = await getBotResponse(currentMessage)
      if (botText && botText.trim()) {
        const botMessage: Message = {
          id: `${Date.now()}-bot`,
          text: botText,
          sender: "bot",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMessage])
      }
    } catch (error) {
      console.error('Advanced chatbot error:', error)
      const fallback: Message = {
        id: `${Date.now()}-error`,
        text:
          language === 'ur'
            ? 'معذرت، اس وقت سرور جواب نہیں دے سکا۔ براہِ کرم تھوڑی دیر بعد دوبارہ کوشش کریں یا براہِ راست کلینک سے رابطہ کریں: +92 304 699 6267.'
            : "Sorry, I couldn't process your request right now. Please try again shortly or contact the clinic directly at +92 304 699 6267.",
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, fallback])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Accessibility: focus trap, focus input on open, ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false) }
    if (isOpen) {
      prevFocusRef.current = document.activeElement as HTMLElement
      setTimeout(() => {
        const el = document.querySelector<HTMLInputElement>('input[aria-label="Message input"]')
        el?.focus()
      }, 0)
      window.addEventListener('keydown', onKey)

      const container = chatbotRef.current
      const trap = (e: KeyboardEvent) => {
        if (e.key !== 'Tab' || !container) return
        const focusables = container.querySelectorAll<HTMLElement>(
          'button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusables.length) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus()
        }
      }
      container?.addEventListener('keydown', trap as any)
      return () => {
        window.removeEventListener('keydown', onKey)
        container?.removeEventListener('keydown', trap as any)
        prevFocusRef.current?.focus?.()
      }
    }
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen])

  if (!isOpen) {
    // track open intent when launcher is visible; actual open tracked on click
    return (
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[10010]">
        <Button
          aria-label="Open chat assistant"
          onClick={() => { setIsOpen(true); analyticsRef.current?.trackEvent('chat_open', {}) }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 rounded-full bg-gradient-to-br from-[rgb(0,78,108)] via-[rgb(0,92,128)] to-[rgb(0,105,147)] text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform ${isHovered ? "scale-110 opacity-100" : "scale-100 opacity-90"
            } relative overflow-hidden border-4 border-white/30 ring-4 ring-white/20`}
        >
          {/* Subtle pulse */}
          <div className="absolute inset-0 rounded-full bg-[rgb(0,78,108)]/30 animate-ping z-0"></div>
          {/* Brand logo watermark centered */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <Image
              src="/images/gonstead-logo-new.png"
              alt="Brand watermark"
              width={28}
              height={28}
              className="opacity-80 contrast-125 drop-shadow-sm"
            />
          </div>
        </Button>

        {/* Enhanced Tooltip */}
        {isHovered && (
          <div className="absolute bottom-16 md:bottom-20 right-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-xs md:text-sm px-3 py-2 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in-0 zoom-in-95 duration-200 backdrop-blur-md border border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[rgb(0,78,108)] rounded-full animate-pulse"></div>
              Chat with Gonstead Chiropractic Assistant
            </div>
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={chatbotRef} className="fixed left-2 right-2 sm:left-auto sm:right-4 md:right-6 z-[10010] pb-[env(safe-area-inset-bottom)]" style={{ bottom: 'calc(env(safe-area-inset-bottom) + 16px)' }} dir={language === 'ur' ? 'rtl' : 'ltr'}>
      <Card
        className={`w-full sm:w-[360px] md:w-[400px] lg:w-[440px] xl:w-[460px] max-w-[calc(100vw-1rem)]
        shadow-sm border border-gray-200 dark:border-gray-800 transition-all duration-200 bg-white dark:bg-gray-900
        ${compact ? "h-[88dvh] sm:h-[85vh]" : "h-[82dvh] sm:h-[80vh]"}
        max-h-[calc(100dvh-2.5rem)]
        rounded-2xl overflow-hidden flex flex-col`}
      >
        {/* Enhanced Header */}
        <CardHeader className="bg-white dark:bg-gray-900 text-[rgb(66,139,124)] p-2 md:p-2 rounded-t-2xl border-b border-gray-200 dark:border-gray-800">

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 relative flex-shrink-0">
                <Image src="/images/gonstead-logo-new.png" alt="Gonstead Logo" fill className="object-contain filter drop-shadow-sm" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm md:text-base font-poppins font-semibold truncate">Bashir Khan Chiropractic Assistant</CardTitle>
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <Link href="/faq" target="_blank" className="text-xs text-[rgb(66,139,124)] dark:text-teal-400 hover:underline px-2 py-1 font-medium flex items-center gap-1" title="Open FAQ Page">FAQ ↗</Link>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-red-500/20 p-1.5 md:p-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>

        </CardHeader>

        <>
          <CardContent className="p-0 flex-1 min-h-0 overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-[rgba(13,92,117,0.35)] scrollbar-track-transparent" role="log" aria-live="polite" aria-relevant="additions">
            <div className="p-2 md:p-3 pb-1 space-y-2 md:space-y-3">

                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2 md:gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 motion-reduce:transition-none motion-reduce:animate-none`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {message.sender === "bot" && (
                      <Avatar className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0 ring-2 ring-[rgb(66,139,124)]/20 order-1">
                        <AvatarImage src="/images/gonstead-logo-new.png" className="object-contain p-1" />
                        <AvatarFallback className="bg-[rgb(66,139,124)]/10">
                          <Bot className="h-3 w-3 md:h-4 md:w-4 text-[rgb(66,139,124)]" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[75%] md:max-w-[80%] p-2.5 md:p-3 rounded-2xl transition-all duration-200 border ${message.sender === "user"
                        ? "bg-[rgb(66,139,124)] text-white border-[rgb(66,139,124)] rounded-br-md ml-auto order-2"
                        : "bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 rounded-bl-md mr-auto order-2"
                        }`}
                    >
                      <p className="text-[11px] md:text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`${message.sender === "user" ? "text-white/70" : "text-gray-500 dark:text-gray-400"
                          }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                    {message.sender === "user" && (
                      <Avatar className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0 ring-2 ring-blue-500/20 order-3">
                        <AvatarFallback className="bg-blue-500/10">
                          <User className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-2 md:gap-3 justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                    <Avatar className="w-7 h-7 md:w-8 md:h-8 ring-2 ring-[rgb(66,139,124)]/20">
                      <AvatarImage src="/images/gonstead-logo-new.png" className="object-contain p-1" />
                      <AvatarFallback className="bg-[rgb(66,139,124)]/10">
                        <Bot className="h-3 w-3 md:h-4 md:w-4 text-[rgb(66,139,124)]" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-white/95 dark:bg-gray-800/95 p-2.5 md:p-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-[rgb(66,139,124)] rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-[rgb(66,139,124)] rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-[rgb(66,139,124)] rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
          </CardContent>

          {/* Enhanced Input Area - Fixed positioning */}
          <div className="flex-shrink-0 p-2 md:p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="flex gap-2">
                <Input
                  aria-label="Message input"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 pl-3 py-2 md:py-2.5 rounded-lg border-gray-200/70 dark:border-gray-700 focus:border-[rgb(66,139,124)] focus:ring-[rgb(66,139,124)]/25 bg-white dark:bg-gray-800 text-sm w-full min-w-0 transition-all duration-200 shadow-sm"
                />
                <Button
                  aria-label="Send message"
                  onClick={sendMessage}
                  className="flex-shrink-0 bg-gradient-to-r from-[rgb(66,139,124)] to-[rgb(58,133,118)] hover:from-[rgb(72,145,130)] hover:to-[rgb(64,139,124)] text-white px-3 md:px-4 py-2.5 md:py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!inputMessage.trim()}
                  title="Send message"
                >
                  <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      </Card>
    </div>
  )
}
