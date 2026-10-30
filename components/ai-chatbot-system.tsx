"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Send, Bot, User, Mic, MicOff, Calendar, Phone, MessageCircle } from "lucide-react"
import { useLanguage } from "./language-provider"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
  type?: "text" | "appointment" | "contact"
}

interface ConversationState {
  messages: Message[]
  context: string
  appointmentFlow: {
    active: boolean
    step: number
    data: {
      name: string
      phone: string
      concern: string
    }
  }
  medicalContext: string[]
}

// Comprehensive medical knowledge base for chiropractic expertise
const chiropracticKnowledge = {
  gonstead: {
    keywords: ["gonstead", "technique", "method", "approach"],
    info: "The Gonstead technique is a precise and thorough approach to chiropractic care that focuses on specific adjustments to correct misalignments in the spine. It uses detailed analysis including X-rays, visualization, instrumentation, and palpation to identify the exact location of vertebral subluxations. Dr. Bashir is certified at the highest Level V in this technique.",
  },
  adjustment: {
    keywords: ["adjustment", "manipulate", "crack", "pop", "align"],
    info: "A chiropractic adjustment is a precise, controlled force applied to a joint to restore proper function and mobility. This helps reduce pain, improve range of motion, and allow the body to heal naturally. Dr. Bashir uses advanced machine-assisted techniques for optimal precision.",
  },
  sciatica: {
    keywords: ["sciatica", "sciatic", "leg pain", "shooting pain"],
    info: "Sciatica is pain that radiates along the sciatic nerve, which runs from the lower back through the hips and down each leg. It's typically caused by compression of the nerve, often due to a herniated disk or bone spur. Gonstead adjustments can effectively address the root cause.",
  },
  backPain: {
    keywords: ["back pain", "lower back", "upper back", "spine pain"],
    info: "Back pain can be caused by various factors including poor posture, muscle strain, disc issues, or spinal misalignments. Dr. Bashir's approach addresses the root cause rather than just treating symptoms, using precise Gonstead techniques.",
  },
  neckPain: {
    keywords: ["neck pain", "cervical", "stiff neck", "neck stiffness"],
    info: "Neck pain often results from poor posture, muscle strain, or misalignments in the cervical spine. Gonstead adjustments can help restore proper alignment and reduce pain. Dr. Bashir uses specialized cervical techniques for safe and effective treatment.",
  },
  headaches: {
    keywords: ["headache", "migraine", "head pain", "tension headache"],
    info: "Many headaches are caused by tension in the neck and upper back or misalignments in the cervical spine. Chiropractic care can help reduce the frequency and intensity of headaches by addressing spinal alignment issues.",
  },
  posture: {
    keywords: ["posture", "slouching", "forward head", "rounded shoulders"],
    info: "Good posture is essential for spinal health. Dr. Bashir provides both adjustments and guidance on maintaining proper posture throughout daily activities, including ergonomic advice for work and home environments.",
  },
  wellness: {
    keywords: ["wellness", "prevention", "maintenance", "health"],
    info: "Chiropractic care isn't just for pain relief—it's a key component of overall wellness, helping to maintain proper nervous system function and supporting the body's natural healing abilities.",
  },
  sports: {
    keywords: ["sports injury", "athletic", "performance", "recovery"],
    info: "Sports injuries often involve spinal misalignments that can affect performance and recovery. Dr. Bashir works with athletes to optimize spinal health for peak performance and faster injury recovery.",
  },
  arthritis: {
    keywords: ["arthritis", "joint pain", "stiffness", "inflammation"],
    info: "While chiropractic care cannot cure arthritis, it can help manage symptoms by improving joint mobility, reducing inflammation, and maintaining proper spinal alignment to reduce stress on affected joints.",
  },
}

export function AIChatbotSystem() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [conversationState, setConversationState] = useState<ConversationState>({
    messages: [],
    context:
      "You are Dr. Bashir's AI assistant for Gonstead Chiropractic clinic. Be professional, helpful, and knowledgeable about chiropractic care.",
    appointmentFlow: {
      active: false,
      step: 0,
      data: { name: "", phone: "", concern: "" },
    },
    medicalContext: [],
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const { t, language } = useLanguage()
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversationState.messages])

  // Voice greeting on open
  useEffect(() => {
    if (isOpen && showWelcome) {
      playVoiceGreeting()
      setShowWelcome(false)
      initializeChat()
    }
  }, [isOpen])

  // Outside click detection to close chatbot
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && chatContainerRef.current && !chatContainerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const playVoiceGreeting = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(t("voice.greeting"))
      utterance.lang = language === "ur" ? "ur-PK" : "en-US"
      utterance.rate = 0.9
      speechSynthesis.speak(utterance)
    }
  }

  const initializeChat = () => {
    const welcomeMessage: Message = {
      id: "1",
      text: t("ai.welcome"),
      sender: "bot",
      timestamp: new Date(),
      type: "text",
    }
    setConversationState((prev) => ({
      ...prev,
      messages: [welcomeMessage],
    }))
  }

  const findMedicalContext = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    for (const [, knowledge] of Object.entries(chiropracticKnowledge)) {
      if (knowledge.keywords.some((keyword) => lowerMessage.includes(keyword))) {
        return knowledge.info
      }
    }
    return ""
  }
  
  // Backend-powered response generator calling the unified /api/chat route.
  const callOpenRouterAPI = async (userMessage: string, history: Message[]): Promise<string> => {
    const medicalContext = findMedicalContext(userMessage)

    const historyPayload = history.map((m) => ({
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
        medicalContext,
      }),
    })

    const data = await res.json()
    if (!res.ok || !data?.text) {
      throw new Error(data?.error || "Failed to get reply from assistant")
    }

    return String(data.text)
  }

  const handleAppointmentFlow = (userInput: string): string => {
    const { appointmentFlow } = conversationState
    const { step, data } = appointmentFlow

    switch (step) {
      case 1: // Getting name
        setConversationState((prev) => ({
          ...prev,
          appointmentFlow: {
            ...prev.appointmentFlow,
            step: 2,
            data: { ...prev.appointmentFlow.data, name: userInput },
          },
        }))
        return language === "ur"
          ? "شکریہ! اب براہ کرم اپنا فون نمبر بتائیں (مثال: 03001234567)۔"
          : "Thank you! Now please provide your phone number (e.g., 03001234567)."

      case 2: // Getting phone
        // Validate Pakistani phone number
        const phoneRegex = /^(\+92|0)?3[0-9]{9}$/
        if (!phoneRegex.test(userInput.trim())) {
          return language === "ur"
            ? "براہ کرم صحیح پاکستانی فون نمبر درج کریں (مثال: 03001234567)۔"
            : "Please enter a valid Pakistani phone number (e.g., 03001234567)."
        }

        setConversationState((prev) => ({
          ...prev,
          appointmentFlow: {
            ...prev.appointmentFlow,
            step: 3,
            data: { ...prev.appointmentFlow.data, phone: userInput },
          },
        }))
        return language === "ur"
          ? "بہترین! آخر میں، اپنی صحت کی پریشانی کے بارے میں تفصیل سے بتائیں۔"
          : "Perfect! Finally, please describe your health concern in detail."

      case 3: // Getting concern
        const finalData = { ...data, concern: userInput }

        // Reset appointment flow
        setConversationState((prev) => ({
          ...prev,
          appointmentFlow: {
            active: false,
            step: 0,
            data: { name: "", phone: "", concern: "" },
          },
          context:
            prev.context +
            `\nPatient ${finalData.name} with phone ${finalData.phone} has concern: ${finalData.concern}`,
        }))

        // Auto-fill email form
        autoFillEmailForm(finalData)

        return language === "ur"
          ? `شکریہ ${finalData.name}! آپ کی اپائنٹمنٹ کی معلومات محفوظ ہو گئیں:\n\n📞 فون: ${finalData.phone}\n🏥 مسئلہ: ${finalData.concern}\n\nڈاکٹر بشیر جلد ہی آپ سے رابطہ کریں گے۔ ایمرجنسی کے لیے +92 304 699 6267 پر کال کریں۔`
          : `Thank you ${finalData.name}! Your appointment information has been saved:\n\n📞 Phone: ${finalData.phone}\n🏥 Concern: ${finalData.concern}\n\nDr. Bashir will contact you shortly. For emergencies, call +92 304 699 6267.`

      default:
        return ""
    }
  }

  const autoFillEmailForm = (appointmentData: any) => {
    toast({
      title: language === "ur" ? "اپائنٹمنٹ محفوظ" : "Appointment Saved",
      description:
        language === "ur"
          ? "آپ کی معلومات محفوظ ہو گئیں۔ ڈاکٹر بشیر جلد رابطہ کریں گے۔"
          : "Your information has been saved. Dr. Bashir will contact you soon.",
    })
  }

  const startVoiceInput = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = language === "ur" ? "ur-PK" : "en-US"

      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputValue(transcript)
      }

      recognition.onerror = () => {
        setIsListening(false)
        toast({
          title: "Voice Input Error",
          description: "Could not access microphone. Please type your message.",
          variant: "destructive",
        })
      }

      recognition.start()
    } else {
      toast({
        title: "Voice Input Not Supported",
        description: "Your browser doesn't support voice input.",
        variant: "destructive",
      })
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    const messageText = inputValue
    setInputValue("")

    setConversationState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
    }))

    setIsTyping(true)

    try {
      let botText: string | null = null
      const lowerInput = messageText.toLowerCase()
      const triggersAppointment =
        lowerInput.includes("appointment") ||
        lowerInput.includes("book") ||
        lowerInput.includes("schedule") ||
        lowerInput.includes("اپائنٹمنٹ") ||
        lowerInput.includes("بک")

      if (conversationState.appointmentFlow.active || triggersAppointment) {
        // Ensure appointment flow is active
        if (!conversationState.appointmentFlow.active) {
          setConversationState((prev) => ({
            ...prev,
            appointmentFlow: {
              ...prev.appointmentFlow,
              active: true,
              step: 1,
            },
          }))
          botText =
            language === "ur"
              ? "میں آپ کی اپائنٹمنٹ بک کرنے میں مدد کروں گا۔ براہِ کرم پہلے اپنا نام لکھیں۔"
              : "I'll help you book an appointment. Let's start with your full name."
        } else {
          botText = handleAppointmentFlow(messageText)
        }
      } else {
        const historyForApi = [...conversationState.messages, userMessage]
        botText = await callOpenRouterAPI(messageText, historyForApi)
      }

      if (botText && botText.trim()) {
        const botMessage: Message = {
          id: `${Date.now()}-bot`,
          text: botText,
          sender: "bot",
          timestamp: new Date(),
        }

        setConversationState((prev) => ({
          ...prev,
          messages: [...prev.messages, botMessage],
        }))
      }
    } catch (error) {
      console.error("AI chat error:", error)
      const fallbackText =
        language === "ur"
          ? "معذرت، اس وقت سرور جواب نہیں دے سکا۔ براہِ کرم تھوڑی دیر بعد دوبارہ کوشش کریں یا براہِ راست کلینک سے رابطہ کریں: +92 304 699 6267."
          : "Sorry, I couldn't reach the assistant right now. Please try again shortly or contact the clinic directly at +92 304 699 6267."
      const botMessage: Message = {
        id: `${Date.now()}-error`,
        text: fallbackText,
        sender: "bot",
        timestamp: new Date(),
      }
      setConversationState((prev) => ({
        ...prev,
        messages: [...prev.messages, botMessage],
      }))
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      {/* Chat Toggle Button with Spine Animation */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-[10010] h-10 w-10 rounded-full bg-gradient-to-r from-[#3e8288] to-[#358085] hover:from-[#358085] hover:to-[#2c7078] shadow-xl border-3 border-[#f3a800] transition-all duration-300 hover:scale-110 spine-pulse"
        size="icon"
        aria-label={isOpen ? "Close chat" : "Open chat with Dr. Bashir's AI assistant"}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <div className="relative">
            <Bot className="h-6 w-6 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#f3a800] rounded-full animate-pulse"></div>
          </div>
        )}
      </Button>

      {/* Welcome Screen with Animated Spine Visual */}
      {isOpen && showWelcome && (
        <Card className="fixed bottom-24 right-4 z-[10005] w-96 h-64 shadow-2xl border-2 border-[#f3a800] bg-gradient-to-br from-[#F8F5F0] to-white">
          <CardContent className="flex flex-col items-center justify-center h-full p-6">
            <div className="animated-spine-visual mb-4">
              <div className="spine-container">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="spine-segment" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>
            <h3 className="text-xl font-bold text-[#0d5c75] mb-2 font-poppins">
              {language === "ur" ? "خوش آمدید!" : "Welcome!"}
            </h3>
            <p className="text-center text-[#0A3A47] text-sm font-open-sans">
              {language === "ur" ? "ڈاکٹر بشیر کا AI اسسٹنٹ" : "Dr. Bashir's AI Assistant"}
            </p>
            <div className="pulse-wave-animation mt-4">
              <div className="pulse-dot"></div>
              <div className="pulse-dot"></div>
              <div className="pulse-dot"></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Chat Window */}
      {isOpen && !showWelcome && (
        <Card
          ref={chatContainerRef}
          className="fixed bottom-24 right-4 z-[10005] w-96 h-[500px] shadow-2xl border-2 border-[#0d5c75] bg-white overflow-hidden"
        >
          <CardHeader className="bg-gradient-to-r from-[#0d5c75] to-[#0a4a5c] text-white p-4">
            <CardTitle className="flex items-center gap-3 text-lg">
              <Image
                src="/images/gonstead-logo.png"
                alt="Dr. Bashir"
                width={32}
                height={32}
                className="bg-white rounded-full p-1"
              />
              <div>
                <div className="font-bold font-poppins">Dr. Bashir's AI</div>
                <div className="text-xs opacity-90 font-open-sans">Gonstead Specialist Assistant</div>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 flex flex-col h-full">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-[#F8F5F0]/20 to-white">
              {conversationState.messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-md ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-[#0d5c75] to-[#0a4a5c] text-white"
                        : "bg-white border border-[#0d5c75]/20 text-[#0A3A47]"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.sender === "bot" && <Bot className="h-4 w-4 mt-0.5 text-[#f3a800] flex-shrink-0" />}
                      {message.sender === "user" && <User className="h-4 w-4 mt-0.5 flex-shrink-0" />}
                      <span className="whitespace-pre-line leading-relaxed font-open-sans">{message.text}</span>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-[#0d5c75]/20 shadow-md p-3 rounded-2xl text-sm">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-[#f3a800]" />
                      <div className="pulse-wave-animation">
                        <div className="pulse-dot"></div>
                        <div className="pulse-dot"></div>
                        <div className="pulse-dot"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {!conversationState.appointmentFlow.active && (
              <div className="p-3 border-t border-[#0d5c75]/20 bg-[#F8F5F0]/50">
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#0d5c75] text-[#0d5c75] hover:bg-[#0d5c75] hover:text-white text-xs font-open-sans"
                    onClick={() => {
                      setConversationState((prev) => ({
                        ...prev,
                        appointmentFlow: {
                          ...prev.appointmentFlow,
                          active: true,
                          step: 1,
                        },
                      }))
                      const appointmentMsg: Message = {
                        id: Date.now().toString(),
                        text: language === "ur" ? "اپائنٹمنٹ بک کریں" : "Book Appointment",
                        sender: "user",
                        timestamp: new Date(),
                      }
                      setConversationState((prev) => ({
                        ...prev,
                        messages: [...prev.messages, appointmentMsg],
                      }))
                    }}
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    {language === "ur" ? "اپائنٹمنٹ" : "Appointment"}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#25d366] text-[#25d366] hover:bg-[#25d366] hover:text-white text-xs font-open-sans"
                    onClick={() => window.open("https://wa.me/923046996267", "_blank")}
                  >
                    <MessageCircle className="h-3 w-3 mr-1" />
                    WhatsApp
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[#f3a800] text-[#f3a800] hover:bg-[#f3a800] hover:text-white text-xs font-open-sans"
                    onClick={() => window.open("tel:+923046996267")}
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    {language === "ur" ? "کال" : "Call"}
                  </Button>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-[#0d5c75]/20 p-3 bg-white">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    conversationState.appointmentFlow.step > 0
                      ? conversationState.appointmentFlow.step === 1
                        ? language === "ur"
                          ? "اپنا نام..."
                          : "Your name..."
                        : conversationState.appointmentFlow.step === 2
                          ? language === "ur"
                            ? "فون نمبر..."
                            : "Phone number..."
                          : language === "ur"
                            ? "صحت کی پریشانی..."
                            : "Health concern..."
                      : language === "ur"
                        ? "پیغام لکھیں..."
                        : "Type your message..."
                  }
                  className="text-sm border-[#0d5c75]/30 focus:border-[#f3a800] font-open-sans"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={isTyping}
                />
                <Button
                  size="sm"
                  onClick={startVoiceInput}
                  disabled={isListening || isTyping}
                  className={`${isListening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-[#f3a800] hover:bg-[#e09700]"}`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={isTyping || !inputValue.trim()}
                  className="bg-[#0d5c75] hover:bg-[#0a4a5c] px-4"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {isListening && (
                <div className="flex items-center gap-2 text-red-500 text-xs mt-2 font-open-sans">
                  <div className="pulse-wave-animation">
                    <div className="pulse-dot"></div>
                    <div className="pulse-dot"></div>
                    <div className="pulse-dot"></div>
                  </div>
                  {language === "ur" ? "سن رہا ہے..." : "Listening..."}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
