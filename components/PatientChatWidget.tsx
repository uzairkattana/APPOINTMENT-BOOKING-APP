"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MessageSquare,
  X,
  Send,
  Stethoscope,
  CheckCheck,
  Check,
  Sparkles,
  User,
  ShieldCheck,
  Loader2,
  ChevronDown,
} from "lucide-react"
import {
  getOrCreateChatThread,
  subscribeToChatMessages,
  sendPatientChatMessage,
  markChatReadByPatient,
  type ChatMessage,
  type ChatThread,
} from "@/lib/patient-chat-service"
import {
  registerPatientServiceWorker,
  requestPushNotificationPermission,
  sendBackgroundScreenNotification,
} from "@/lib/pwa-service-worker"

interface PatientChatWidgetProps {
  patientId: string
  patientName: string
  patientEmail: string
  patientPhone: string
}

export function PatientChatWidget({
  patientId,
  patientName,
  patientEmail,
  patientPhone,
}: PatientChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [thread, setThread] = useState<ChatThread | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const scrollRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<HTMLDivElement>(null)
  const notifiedMessageIdsRef = useRef<Set<string>>(new Set())
  const isInitialSnapshotRef = useRef(true)

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

  // Register ServiceWorker & Initialize Chat Thread on mount
  useEffect(() => {
    registerPatientServiceWorker()
    requestPushNotificationPermission()

    let unsubscribe: () => void = () => {}

    const initThread = async () => {
      const activeThread = await getOrCreateChatThread({
        patient_id: patientId || "patient_guest",
        patient_name: patientName || "Patient",
        patient_email: patientEmail || "",
        patient_phone: patientPhone || "",
      })
      setThread(activeThread)

      // Subscribe to real-time chat messages
      unsubscribe = subscribeToChatMessages(activeThread.id, (msgs) => {
        setMessages(msgs)

        // Count unread doctor messages
        const unreadFromDoctor = msgs.filter((m) => m.sender === "doctor" && !m.read).length
        setUnreadCount(unreadFromDoctor)

        // Initial snapshot: store existing message IDs to avoid notifying on historical messages
        if (isInitialSnapshotRef.current) {
          msgs.forEach((m) => notifiedMessageIdsRef.current.add(m.id))
          isInitialSnapshotRef.current = false
          return
        }

        // Real-time update: notify only on newly arrived doctor messages
        msgs.forEach((m) => {
          if (m.sender === "doctor" && !notifiedMessageIdsRef.current.has(m.id)) {
            notifiedMessageIdsRef.current.add(m.id)
            sendBackgroundScreenNotification({
              title: "💬 New Message from Dr. Bashir Khan",
              body: m.text,
              url: "/patient-portal",
            })
          }
        })
      })
    }

    initThread()

    return () => {
      unsubscribe()
    }
  }, [patientId, patientName, patientEmail, patientPhone])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
      if (thread?.id) {
        markChatReadByPatient(thread.id)
        setUnreadCount(0)
      }
    }
  }, [messages, isOpen, thread?.id])

  const handleSend = async () => {
    if (!inputText.trim() || !thread) return

    const textToSend = inputText.trim()
    setInputText("")

    // Optimistically render sent message immediately in background
    const optimisticMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      sender: "patient",
      sender_name: patientName || "Patient",
      text: textToSend,
      created_at: new Date().toISOString(),
      read: false,
    }

    setMessages((prev) => [...prev, optimisticMsg])

    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }

    await sendPatientChatMessage({
      chatId: thread.id,
      patientName: patientName || "Patient",
      text: textToSend,
    })
  }

  const formatTime = (isoString?: string) => {
    if (!isoString) return ""
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch (e) {
      return ""
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => {
            setIsOpen(true)
            if (thread?.id) markChatReadByPatient(thread.id)
            setUnreadCount(0)
          }}
          className="relative bg-gradient-to-r from-[#0d5c75] via-[#2a9d8f] to-[#245064] hover:from-[#0a4a5c] hover:to-[#1e7a6b] text-white rounded-full p-4 h-14 w-14 shadow-2xl border-2 border-teal-300/30 flex items-center justify-center transition-all duration-300 hover:scale-110"
          title="Chat with Dr. Bashir Khan"
        >
          <MessageSquare className="h-6 w-6 text-white animate-pulse" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center p-0 font-bold animate-bounce shadow-md border border-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div ref={widgetRef} className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[400px] h-[550px] max-h-[85vh] shadow-2xl rounded-3xl overflow-hidden border border-white/20 bg-slate-900/95 backdrop-blur-xl flex flex-col transition-all duration-300">
      {/* CHAT HEADER */}
      <div className="p-4 bg-gradient-to-r from-[#173e4d] via-[#245064] to-[#0f2d3a] border-b border-white/10 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-slate-900 animate-ping" />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-white">Dr. Bashir Khan</h3>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-xs text-emerald-300/80 font-medium">Gonstead Chiropractic Care</p>
          </div>
        </div>

        <Button
          onClick={() => setIsOpen(false)}
          variant="ghost"
          size="sm"
          className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-8 w-8 p-0"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* MESSAGES LIST AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950">
        <div className="text-center my-2">
          <span className="text-[10px] bg-slate-800/80 border border-slate-700 text-slate-300 px-3 py-1 rounded-full shadow-sm">
            🔒 End-to-End Encrypted Private Consultation Channel
          </span>
        </div>

        {messages.length === 0 ? (
          <div className="text-center text-slate-400 py-12 px-4 space-y-3">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <MessageSquare className="h-6 w-6" />
            </div>
            <p className="text-xs text-slate-300">
              Hi <strong className="text-white">{patientName}</strong>! Send a message directly to Dr. Bashir Khan regarding your spinal alignment, symptoms, or appointment.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isPatient = msg.sender === "patient"
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isPatient ? "items-end" : "items-start"} space-y-1`}
              >
                <div
                  className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md leading-relaxed break-words ${
                    isPatient
                      ? "bg-gradient-to-r from-[#2a9d8f] to-[#1e7a6b] text-white rounded-br-none border border-teal-400/30"
                      : "bg-slate-800 border border-slate-700 text-slate-100 rounded-bl-none"
                  }`}
                >
                  {!isPatient && (
                    <div className="text-[11px] font-bold text-emerald-400 mb-1 flex items-center gap-1">
                      <Stethoscope className="h-3 w-3" />
                      <span>{msg.sender_name}</span>
                    </div>
                  )}
                  <p>{msg.text}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 px-1">
                  <span>{formatTime(msg.created_at)}</span>
                  {isPatient && <CheckCheck className="h-3 w-3 text-teal-400" />}
                </div>
              </div>
            )
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* CHAT INPUT FORM */}
      <div className="p-3 bg-slate-900 border-t border-white/10 flex items-center gap-2">
        <Input
          placeholder="Type message for Dr. Bashir Khan..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-400 text-xs sm:text-sm rounded-xl focus-visible:ring-teal-500"
        />
        <Button
          onClick={handleSend}
          disabled={!inputText.trim() || isSending}
          className="bg-gradient-to-r from-[#2a9d8f] to-[#238a7a] hover:from-[#238a7a] hover:to-[#1d7366] text-white rounded-xl h-10 w-10 p-0 shadow-md flex-shrink-0"
        >
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
