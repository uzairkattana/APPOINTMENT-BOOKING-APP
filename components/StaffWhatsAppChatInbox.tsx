"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare,
  Send,
  Stethoscope,
  CheckCheck,
  Loader2,
  Zap,
  X,
  MessageCircle,
  ShieldCheck,
  UserCheck,
} from "lucide-react"
import {
  subscribeToStaffDoctorChat,
  sendStaffDoctorChatMessage,
  type ChatMessage,
} from "@/lib/patient-chat-service"

interface StaffWhatsAppChatInboxProps {
  staffUsername?: string
}

export function StaffWhatsAppChatInbox({ staffUsername = "Staff Member" }: StaffWhatsAppChatInboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState("")

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<HTMLDivElement>(null)

  // Auto-close widget when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("touchstart", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [isOpen])

  // Subscribe exclusively to internal Staff-Doctor chat stream
  useEffect(() => {
    const unsub = subscribeToStaffDoctorChat((msgs) => {
      setMessages(msgs)
    })
    return () => unsub()
  }, [])

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendStaffReply = async (customText?: string) => {
    const textToSend = customText || inputText.trim()
    if (!textToSend) return

    if (!customText) setInputText("")

    // Optimistically render sent message immediately in background
    const optimisticMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      sender: "staff",
      sender_name: staffUsername,
      text: textToSend,
      created_at: new Date().toISOString(),
      read: true,
    }

    setMessages((prev) => [...prev, optimisticMsg])

    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }

    await sendStaffDoctorChatMessage({
      staffName: staffUsername,
      text: textToSend,
    })
  }

  const quickResponses = [
    "Dr. Bashir Khan, a new patient has arrived at the reception desk.",
    "Patient X-ray reports have been attached to their file.",
    "Treatment room 2 is sanitized and prepared for the next adjustment session.",
  ]

  const formatTime = (isoString?: string) => {
    if (!isoString) return ""
    try {
      const d = new Date(isoString)
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch (e) {
      return ""
    }
  }

  const MainChatContent = (
    <Card className="border border-slate-200 shadow-2xl bg-white text-slate-900 rounded-3xl overflow-hidden h-full flex flex-col">
      {/* LIGHT THEME CLINICAL HEADER BAR */}
      <CardHeader className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] p-3.5 sm:p-4 border-b border-teal-800/30 text-white flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shadow-sm font-bold border border-white/20">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xs sm:text-base font-bold text-white flex items-center gap-2">
              <span>Doctor Internal Desk Channel</span>
              <Badge className="bg-amber-500 text-slate-950 font-bold text-[10px] shadow-xs">Doctor Only Desk</Badge>
            </CardTitle>
            <p className="text-[11px] sm:text-xs text-white/80">
              Direct internal communication channel between Staff & Dr. Bashir Khan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Close button for Floating Mode */}
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/20 rounded-xl"
          >
            <X className="h-5 w-5 text-white" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col overflow-hidden bg-white">
        {/* DOCTOR DESK SUB-HEADER */}
        <div className="p-3 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#0d5c75] to-[#126b87] flex items-center justify-center font-bold text-white shadow-sm">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>Dr. Bashir Khan</span>
                <ShieldCheck className="h-4 w-4 text-[#2a9d8f]" />
              </h3>
              <p className="text-[11px] text-teal-800 font-semibold">
                Gonstead Chiropractic Specialist • Internal Clinic Channel
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-700 bg-emerald-50">
            🔒 Private Staff-Doctor Line
          </Badge>
        </div>

        {/* MESSAGES LIST AREA */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc]">
          {messages.length === 0 ? (
            <div className="text-center text-slate-400 py-16 text-xs space-y-2">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-[#0d5c75]">
                <MessageCircle className="h-6 w-6" />
              </div>
              <p className="font-semibold text-slate-700">Internal Desk Ready</p>
              <p className="text-slate-500 max-w-xs mx-auto">
                Type a message below to communicate directly with Dr. Bashir Khan. Patient chats are protected and accessible only by the Doctor.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isDoctor = m.sender === "doctor"
              const isStaff = m.sender === "staff"

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isStaff ? "items-end" : "items-start"} space-y-1`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-xs break-words ${
                      isStaff
                        ? "bg-gradient-to-r from-amber-600 to-emerald-600 text-white rounded-br-none"
                        : isDoctor
                        ? "bg-gradient-to-r from-[#0d5c75] to-[#126b87] text-white rounded-bl-none"
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs"
                    }`}
                  >
                    <div className={`text-[10px] font-bold opacity-90 mb-1 ${isStaff ? "text-amber-100" : "text-teal-100"}`}>
                      {isStaff ? `Staff (${m.sender_name})` : "Dr. Bashir Khan"}
                    </div>
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                  <div className="text-[10px] text-slate-400 px-1 flex items-center gap-1 font-medium">
                    <span>{formatTime(m.created_at)}</span>
                    {isStaff && <CheckCheck className="h-3 w-3 text-[#2a9d8f]" />}
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* QUICK RESPONSE CHIPS */}
        <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 flex-shrink-0 mr-1">
            <Zap className="h-3 w-3 text-amber-500" />
            Desk Quick Reply:
          </span>
          {quickResponses.map((qr, idx) => (
            <button
              key={idx}
              onClick={() => handleSendStaffReply(qr)}
              className="text-[10px] bg-white hover:bg-teal-50 text-slate-700 border border-slate-200 hover:border-[#2a9d8f] rounded-full px-2.5 py-1 whitespace-nowrap transition-all shadow-xs"
            >
              {qr}
            </button>
          ))}
        </div>

        {/* CHAT INPUT FORM */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <Input
            placeholder={`Type internal message to Dr. Bashir Khan...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendStaffReply()}
            className="flex-1 text-xs sm:text-sm h-10 border-slate-200 focus:border-[#2a9d8f] rounded-xl"
          />
          <Button
            onClick={() => handleSendStaffReply()}
            disabled={!inputText.trim()}
            className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] hover:from-[#0a4a5c] hover:to-[#238a7a] text-white h-10 px-4 rounded-xl font-bold gap-1 shadow-sm"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Send to Doctor</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <>
      {/* Sleek Pure Circular Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full p-0 bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] hover:from-[#0a4a5c] hover:to-[#238a7a] text-white shadow-2xl flex items-center justify-center border-2 border-white/40 transition-all duration-300 hover:scale-105"
            title="Open Staff-Doctor Internal Desk Chat"
          >
            <Stethoscope className="h-7 w-7 text-white" />
          </Button>
        </div>
      )}

      {/* Floating Popup Window */}
      {isOpen && (
        <div ref={widgetRef} className="fixed bottom-6 right-6 z-50 w-[95vw] sm:w-[500px] md:w-[650px] h-[calc(100vh-120px)] max-h-[650px] min-h-[450px] shadow-2xl rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {MainChatContent}
        </div>
      )}
    </>
  )
}
export default StaffWhatsAppChatInbox
