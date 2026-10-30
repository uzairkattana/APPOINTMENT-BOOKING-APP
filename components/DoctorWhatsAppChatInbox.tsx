"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MessageSquare,
  Search,
  Send,
  User,
  Stethoscope,
  Phone,
  Mail,
  CheckCheck,
  Check,
  Clock,
  Sparkles,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Zap,
  ArrowLeft,
  Users,
  X,
  MessageCircle,
  Trash2,
  UserMinus,
  ShieldAlert,
} from "lucide-react"
import {
  subscribeToAllPatientChats,
  subscribeToChatMessages,
  sendDoctorChatMessage,
  clearChatThread,
  deleteEntireChatThread,
  clearAllChatThreads,
  markChatReadByDoctor,
  type ChatThread,
  type ChatMessage,
} from "@/lib/patient-chat-service"
import { useToast } from "@/hooks/use-toast"

interface DoctorWhatsAppChatInboxProps {
  isFloating?: boolean
}

export function DoctorWhatsAppChatInbox({ isFloating = false }: DoctorWhatsAppChatInboxProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [inputText, setInputText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isClearing, setIsClearing] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const widgetRef = useRef<HTMLDivElement>(null)

  // Auto-close widget when clicking outside in floating mode
  useEffect(() => {
    if (!isFloating) return

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
  }, [isOpen, isFloating])

  // Total unread count for doctor badge
  const totalUnreadCount = threads.reduce((acc, t) => acc + (t.unread_doctor_count || 0), 0)

  // Subscribe to all patient chat threads
  useEffect(() => {
    const unsub = subscribeToAllPatientChats((allThreads) => {
      setThreads(allThreads)

      setSelectedThread((prevSelected) => {
        if (prevSelected) {
          // Keep the currently active selected thread locked!
          const updated = allThreads.find((t) => t.id === prevSelected.id)
          return updated || prevSelected
        }

        // On initial desktop load when no thread is selected yet:
        if (allThreads.length > 0 && typeof window !== "undefined" && window.innerWidth >= 768) {
          // Default to first patient thread if available, otherwise first thread
          const firstPatient = allThreads.find((t) => !t.is_staff_internal) || allThreads[0]
          return firstPatient
        }

        return null
      })
    })
    return () => unsub()
  }, [])

  // Subscribe to messages of selected patient
  useEffect(() => {
    if (!selectedThread) return

    markChatReadByDoctor(selectedThread.id)

    const unsub = subscribeToChatMessages(selectedThread.id, (msgs) => {
      setMessages(msgs)
    })

    return () => unsub()
  }, [selectedThread?.id])

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendDoctorReply = async (customText?: string) => {
    const textToSend = customText || inputText.trim()
    if (!textToSend || !selectedThread) return

    if (!customText) setInputText("")

    // Optimistically render sent message immediately in background
    const optimisticMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      sender: "doctor",
      sender_name: "Dr. Bashir Khan",
      text: textToSend,
      created_at: new Date().toISOString(),
      read: true,
    }

    setMessages((prev) => [...prev, optimisticMsg])

    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }

    await sendDoctorChatMessage({
      chatId: selectedThread.id,
      doctorName: "Dr. Bashir Khan",
      text: textToSend,
    })
  }

  const handleClearCurrentChat = async () => {
    if (!selectedThread || isClearing) return
    if (!confirm(`Are you sure you want to clear message history for ${selectedThread.patient_name}?`)) return

    setIsClearing(true)
    const success = await clearChatThread(selectedThread.id)
    setIsClearing(false)

    if (success) {
      toast({
        title: "🗑️ Messages Cleared",
        description: `Chat message history with ${selectedThread.patient_name} cleared.`,
      })
    }
  }

  const handleDeletePersonChat = async () => {
    if (!selectedThread || isClearing) return
    const personName = selectedThread.patient_name
    if (!confirm(`Are you sure you want to COMPLETELY DELETE the entire chat thread for ${personName}? This person will be removed from your inbox.`)) return

    setIsClearing(true)
    const threadToDeleteId = selectedThread.id
    setSelectedThread(null)

    const success = await deleteEntireChatThread(threadToDeleteId)
    setIsClearing(false)

    if (success) {
      toast({
        title: "🔥 Chat Thread Deleted",
        description: `${personName}'s chat thread has been completely removed.`,
      })
    }
  }

  const handleClearAllChats = async () => {
    if (isClearing) return
    if (!confirm("Are you sure you want to clear ALL patient chat threads across the clinic?")) return

    setIsClearing(true)
    const success = await clearAllChatThreads()
    setSelectedThread(null)
    setIsClearing(false)

    if (success) {
      toast({
        title: "🧹 All Chats Cleared",
        description: "All patient chat threads have been completely cleared.",
      })
    }
  }

  const filteredThreads = threads.filter(
    (t) =>
      t.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.patient_phone.includes(searchQuery) ||
      t.patient_email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const quickResponses = [
    "Your adjustment appointment is confirmed with Dr. Bashir Khan! 👍",
    "Please apply 15-minute ice compression on the lumbar region twice daily.",
    "Your X-ray analysis notes have been reviewed. Everything looks good!",
    "Hi! How are your spinal pain levels feeling after yesterday's adjustment?",
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
      <CardHeader className="bg-gradient-to-r from-[#0d5c75] to-[#126b87] p-3.5 sm:p-4 border-b border-teal-800/30 text-white flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shadow-sm font-bold border border-white/20">
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xs sm:text-base font-bold text-white flex items-center gap-2">
              <span>Patient Direct WhatsApp Inbox</span>
              <Badge className="bg-[#2a9d8f] text-white text-[10px] shadow-xs">Live Doctor Portal</Badge>
            </CardTitle>
            <p className="text-[11px] sm:text-xs text-white/80">
              Direct consultation messaging channel with patients & staff
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Clear All Patients Chats - Pure Circular Icon */}
          <Button
            onClick={handleClearAllChats}
            disabled={isClearing}
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0 rounded-full bg-white/15 hover:bg-red-600/80 text-white border-white/30 shadow-xs flex items-center justify-center"
            title="Delete all clinic patient chat threads"
          >
            <Trash2 className="h-4 w-4 text-white" />
          </Button>

          {/* Global Back / All Patients Button */}
          {selectedThread && (
            <Button
              onClick={() => setSelectedThread(null)}
              variant="outline"
              size="sm"
              className="bg-white/15 hover:bg-white/25 text-white border-white/30 text-[11px] font-semibold gap-1 rounded-xl shadow-xs h-8 px-2 sm:px-3"
            >
              <Users className="h-3.5 w-3.5 text-white" />
              <span>Patients</span>
            </Button>
          )}

          {/* Close button for Floating Mode */}
          {isFloating && (
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white/80 hover:text-white hover:bg-white/20 rounded-xl"
            >
              <X className="h-5 w-5 text-white" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col md:flex-row overflow-hidden bg-white">
        {/* LEFT SIDEBAR: PATIENT CHAT LIST */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-slate-200/80 flex flex-col bg-slate-50/70 ${selectedThread ? "hidden md:flex" : "flex"
            }`}
        >
          {/* SEARCH BAR */}
          <div className="p-3 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search patient name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs h-9 bg-slate-100/80 border-slate-200 focus:border-[#2a9d8f] focus:bg-white rounded-xl"
              />
            </div>
          </div>

          {/* CHAT THREADS LIST */}
          <ScrollArea className="flex-1">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No active patient chats found.
              </div>
            ) : (
              filteredThreads.map((th) => {
                const isSelected = selectedThread?.id === th.id
                return (
                  <div
                    key={th.id}
                    onClick={() => {
                      setSelectedThread(th)
                      markChatReadByDoctor(th.id)
                    }}
                    className={`p-3.5 border-b border-slate-200/80 cursor-pointer transition-all duration-200 flex items-center gap-3 ${isSelected
                        ? "bg-teal-50/80 border-l-4 border-l-[#2a9d8f] text-slate-900 shadow-xs"
                        : "hover:bg-slate-100/70 text-slate-700"
                      }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-[#0d5c75] to-[#2a9d8f] text-white flex items-center justify-center font-bold shadow-sm">
                        {th.patient_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                          <span>{th.patient_name}</span>
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">
                          {formatTime(th.last_updated)}
                        </span>
                      </div>

                      {/* PROMINENT PHONE NUMBER DISPLAY */}
                      {th.patient_phone && (
                        <p className="text-[11px] font-semibold text-[#0d5c75] flex items-center gap-1 mb-0.5">
                          <Phone className="h-3 w-3 text-[#2a9d8f]" />
                          <span>{th.patient_phone}</span>
                        </p>
                      )}

                      <p className="text-[11px] text-slate-500 truncate font-normal">
                        {th.last_message || "No messages yet"}
                      </p>
                    </div>

                    {th.unread_doctor_count > 0 && (
                      <Badge className="bg-[#2a9d8f] text-white text-[10px] rounded-full h-5 px-1.5 font-bold flex-shrink-0">
                        {th.unread_doctor_count}
                      </Badge>
                    )}
                  </div>
                )
              })
            )}
          </ScrollArea>
        </div>

        {/* RIGHT MAIN PANEL: ACTIVE CONVERSATION */}
        {selectedThread ? (
          <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
            {/* ACTIVE PATIENT HEADER WITH PHONE & DELETE CHAT BUTTONS */}
            <div className="p-3.5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Button
                  onClick={() => setSelectedThread(null)}
                  variant="ghost"
                  size="sm"
                  className="p-1.5 h-9 w-9 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl flex-shrink-0"
                  title="Back to Patients List"
                >
                  <ArrowLeft className="h-5 w-5 text-[#0d5c75]" />
                </Button>

                <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#0d5c75] to-[#2a9d8f] flex items-center justify-center font-bold text-white flex-shrink-0 shadow-sm">
                  {selectedThread.patient_name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 truncate">
                    <span>{selectedThread.patient_name}</span>
                    {selectedThread.is_staff_internal ? (
                      <Badge variant="outline" className="text-[10px] border-amber-500/50 text-amber-800 bg-amber-50 font-bold hidden sm:inline-flex">
                        Internal Staff Desk
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] border-teal-500/40 text-[#0d5c75] bg-teal-50/50 hidden sm:inline-flex">
                        Patient Portal Direct
                      </Badge>
                    )}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-slate-700 font-semibold">
                    {selectedThread.patient_phone && (
                      <span className="flex items-center gap-1 text-[#0d5c75]">
                        <Phone className="h-3.5 w-3.5 text-[#2a9d8f]" />
                        <span>Phone: {selectedThread.patient_phone}</span>
                      </span>
                    )}
                    {selectedThread.patient_email && (
                      <span className="hidden sm:flex items-center gap-1 text-slate-500 font-normal">
                        <Mail className="h-3 w-3 text-[#0d5c75]" />
                        {selectedThread.patient_email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS: CLEAR MESSAGES & DELETE PERSON CHAT THREAD (PURE ROUNDED ICONS) */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  onClick={handleClearCurrentChat}
                  disabled={isClearing}
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-full text-amber-700 hover:text-amber-800 border-amber-300 hover:bg-amber-50 shadow-xs flex items-center justify-center"
                  title="Clear message history only"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                <Button
                  onClick={handleDeletePersonChat}
                  disabled={isClearing}
                  variant="destructive"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xs flex items-center justify-center"
                  title="Completely delete this person's chat thread from inbox"
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* MESSAGES LIST AREA */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc]">
              {messages.length === 0 ? (
                <div className="text-center text-slate-400 py-16 text-xs">
                  No message history yet. Type a message below to start chatting with {selectedThread.patient_name}.
                </div>
              ) : (
                messages.map((m) => {
                  const isDoctor = m.sender === "doctor"
                  const isStaff = m.sender === "staff"

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isDoctor ? "items-end" : "items-start"} space-y-1`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[80%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-xs break-words ${isDoctor
                            ? "bg-gradient-to-r from-[#0d5c75] to-[#126b87] text-white rounded-br-none"
                            : isStaff
                              ? "bg-gradient-to-r from-amber-600 to-emerald-600 text-white rounded-bl-none"
                              : "bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs"
                          }`}
                      >
                        <div className={`text-[10px] font-bold opacity-90 mb-1 ${isDoctor ? "text-teal-100" : isStaff ? "text-amber-100" : "text-[#0d5c75]"}`}>
                          {isDoctor ? "Dr. Bashir Khan" : isStaff ? `Staff (${m.sender_name})` : selectedThread.patient_name}
                        </div>
                        <p className="leading-relaxed">{m.text}</p>
                      </div>
                      <div className="text-[10px] text-slate-400 px-1 flex items-center gap-1 font-medium">
                        <span>{formatTime(m.created_at)}</span>
                        {(isDoctor || isStaff) && <CheckCheck className="h-3 w-3 text-[#2a9d8f]" />}
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
                Quick Reply:
              </span>
              {quickResponses.map((qr, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendDoctorReply(qr)}
                  className="text-[10px] bg-white hover:bg-teal-50 text-slate-700 border border-slate-200 hover:border-[#2a9d8f] rounded-full px-2.5 py-1 whitespace-nowrap transition-all shadow-xs"
                >
                  {qr}
                </button>
              ))}
            </div>

            {/* CHAT INPUT FORM */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <Input
                placeholder={`Type reply to ${selectedThread.patient_name}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendDoctorReply()}
                className="flex-1 text-xs sm:text-sm h-10 border-slate-200 focus:border-[#2a9d8f] rounded-xl"
              />
              <Button
                onClick={() => handleSendDoctorReply()}
                disabled={!inputText.trim() || isSending}
                className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] hover:from-[#0a4a5c] hover:to-[#238a7a] text-white h-10 px-4 rounded-xl font-bold gap-1 shadow-sm"
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="hidden sm:inline">Send</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50/50 p-8 text-center">
            <div className="max-w-sm space-y-3">
              <div className="h-16 w-16 bg-teal-100 text-[#0d5c75] rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Select a Patient Conversation</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose a patient from the left sidebar to view their live 1-on-1 private WhatsApp consultation thread.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (!isFloating) {
    return <div className="h-[calc(100vh-160px)] min-h-[500px] w-full">{MainChatContent}</div>
  }

  return (
    <>
      {/* Sleek Pure Circular Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full p-0 bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] hover:from-[#0a4a5c] hover:to-[#238a7a] text-white shadow-2xl flex items-center justify-center border-2 border-white/40 transition-all duration-300 hover:scale-105"
            title="Open WhatsApp Doctor Chat Inbox"
          >
            <MessageSquare className="h-7 w-7 text-white" />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white animate-pulse">
                {totalUnreadCount}
              </span>
            )}
          </Button>
        </div>
      )}

      {/* Floating Popup Window */}
      {isOpen && (
        <div ref={widgetRef} className="fixed bottom-6 right-6 z-50 w-[95vw] sm:w-[540px] md:w-[820px] lg:w-[960px] h-[calc(100vh-120px)] max-h-[700px] min-h-[480px] shadow-2xl rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {MainChatContent}
        </div>
      )}
    </>
  )
}
export default DoctorWhatsAppChatInbox
