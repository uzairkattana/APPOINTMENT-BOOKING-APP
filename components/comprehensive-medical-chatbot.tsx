'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Calendar, 
  Stethoscope, 
  MapPin, 
  AlertTriangle,
  Info,
  BookOpen,
  Heart,
  Brain,
  Loader2,
  X,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { voiceService } from '@/lib/voice-service'
import { 
  searchMedicalKnowledge, 
  findDisorderBySymptom, 
  findDisorderByLocation,
  getBodyLocationInfo,
  medicalQuestions,
  type MedicalDisorder,
  type BodyLocation
} from '@/lib/medical-knowledge'
import AppointmentBookingForm, { type AppointmentData } from './appointment-booking-form'
import { createPatient } from "@/lib/data-service"

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  metadata?: {
    disorders?: MedicalDisorder[]
    locations?: BodyLocation[]
    suggestions?: string[]
    showBookingForm?: boolean
  }
}

interface ComprehensiveMedicalChatbotProps {
  onAppointmentBooked?: (data: AppointmentData) => void
}

const commonGreetings = [
  'Hello! I\'m your medical assistant. How can I help you today?',
  'Hi there! I can help you with medical questions, disorder information, and appointment booking. What would you like to know?',
  'Welcome! Ask me about any medical conditions, symptoms, or body locations. I can also help you book an appointment.',
]

const quickActions = [
  { label: 'Book Appointment', icon: Calendar, trigger: 'book an appointment' },
  { label: 'Back Pain Info', icon: AlertTriangle, trigger: 'tell me about back pain' },
  { label: 'Neck Pain Info', icon: Brain, trigger: 'what causes neck pain' },
  { label: 'Headache Help', icon: Brain, trigger: 'help with headaches' },
  { label: 'Joint Problems', icon: Heart, trigger: 'joint pain information' },
  { label: 'Body Locations', icon: MapPin, trigger: 'show me body locations' }
]

export default function ComprehensiveMedicalChatbot({ onAppointmentBooked }: ComprehensiveMedicalChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [prefilledAppointmentData, setPrefilledAppointmentData] = useState<Partial<AppointmentData>>({})
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Initialize with greeting
    if (messages.length === 0) {
      addBotMessage(commonGreetings[Math.floor(Math.random() * commonGreetings.length)])
    }
  }, [messages.length])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const addBotMessage = (content: string, metadata?: Message['metadata']) => {
    const botMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content,
      timestamp: new Date(),
      metadata
    }
    setMessages(prev => [...prev, botMessage])
  }

  const addUserMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
  }

  const generateMedicalResponse = (query: string): { response: string; metadata?: Message['metadata'] } => {
    const lowerQuery = query.toLowerCase()

    // Check for appointment booking requests
    if (lowerQuery.includes('book') && (lowerQuery.includes('appointment') || lowerQuery.includes('schedule'))) {
      return {
        response: "I'd be happy to help you book an appointment! I'll open the booking form for you. Please fill in your information and we'll get you scheduled with one of our healthcare providers.",
        metadata: { showBookingForm: true }
      }
    }

    // Check for emergency situations
    if (lowerQuery.includes('emergency') || lowerQuery.includes('urgent') || lowerQuery.includes('severe pain')) {
      return {
        response: "⚠️ For medical emergencies, please call 911 immediately or visit your nearest emergency room. If this is not an emergency but you need urgent care, please call our clinic directly at (555) 123-4567."
      }
    }

    // Search medical knowledge base
    const searchResults = searchMedicalKnowledge(query)
    
    if (searchResults.disorders.length > 0 || searchResults.locations.length > 0) {
      let response = "I found some relevant information for you:\n\n"
      
      if (searchResults.disorders.length > 0) {
        response += "**Related Conditions:**\n"
        searchResults.disorders.slice(0, 3).forEach(disorder => {
          response += `• **${disorder.name}**: ${disorder.description}\n`
        })
        response += "\n"
      }

      if (searchResults.locations.length > 0) {
        response += "**Body Locations:**\n"
        searchResults.locations.slice(0, 2).forEach(location => {
          response += `• **${location.name}**: ${location.anatomy}\n`
        })
        response += "\n"
      }

      response += "Would you like more detailed information about any of these conditions, or would you like to book an appointment for evaluation?"

      return {
        response,
        metadata: {
          disorders: searchResults.disorders,
          locations: searchResults.locations,
          suggestions: searchResults.suggestions
        }
      }
    }

    // Check for common medical questions
    for (const question of medicalQuestions) {
      if (question.keywords.some(keyword => lowerQuery.includes(keyword))) {
        return { response: question.response }
      }
    }

    // Check for body location queries
    if (lowerQuery.includes('where') || lowerQuery.includes('location') || lowerQuery.includes('anatomy')) {
      const locationInfo = getBodyLocationInfo(query)
      if (locationInfo) {
        return {
          response: `**${locationInfo.name}**\n\n${locationInfo.anatomy}\n\n**Common disorders in this area:**\n${locationInfo.commonDisorders.map(d => `• ${d}`).join('\n')}\n\nWould you like more information about any of these conditions?`,
          metadata: { locations: [locationInfo] }
        }
      }
    }

    // Check for symptom queries
    if (lowerQuery.includes('symptom') || lowerQuery.includes('pain') || lowerQuery.includes('hurt')) {
      const disorders = findDisorderBySymptom(query)
      if (disorders.length > 0) {
        const response = `Based on your symptoms, here are some possible conditions to discuss with a healthcare provider:\n\n${disorders.slice(0, 3).map(d => `• **${d.name}**: ${d.description}`).join('\n\n')}\n\n⚠️ **Important**: This information is for educational purposes only. Please consult with a healthcare professional for proper diagnosis and treatment.`
        return {
          response,
          metadata: { disorders }
        }
      }
    }

    // Default response with suggestions
    return {
      response: "I'm here to help with medical questions and appointment booking. You can ask me about:\n\n• Specific medical conditions or disorders\n• Body locations and anatomy\n• Symptoms and their possible causes\n• Treatment options\n• Booking appointments\n\nWhat would you like to know more about?",
      metadata: {
        suggestions: [
          'Tell me about back pain',
          'What causes headaches?',
          'Book an appointment',
          'Neck pain symptoms',
          'Joint pain information'
        ]
      }
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userInput = inputValue.trim()
    addUserMessage(userInput)
    setInputValue('')
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(async () => {
      const response = generateMedicalResponse(userInput)
      addBotMessage(response.response, response.metadata)
      setIsTyping(false)

      // Speak the response if voice is enabled
      if (isVoiceEnabled) {
        await voiceService.speak(response.response, 'doctor')
      }

      // Check if we should show booking form
      if (response.metadata?.showBookingForm) {
        setShowBookingForm(true)
      }
    }, 1000 + Math.random() * 1000)
  }

  const handleQuickAction = (trigger: string) => {
    setInputValue(trigger)
    setTimeout(() => handleSendMessage(), 100)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleAppointmentSubmit = async (data: AppointmentData) => {
    try {
      // Save appointment directly to Firestore
      await createPatient({
        name: `${data.firstName} ${data.lastName}`.trim(),
        phone: data.phone,
        email: data.email,
        session_type: data.appointmentType === "emergency" ? "video" : "in_clinic",
        appointment_date: data.preferredDate ? data.preferredDate.toISOString() : new Date().toISOString(),
        status: "pending",
        urgency: data.appointmentType === "emergency" ? "emergency" : "normal",
        payment_method: "cash",
        notes: data.notes || data.symptoms || "",
        sessions_completed: 0,
      })
      
      if (onAppointmentBooked) {
        await onAppointmentBooked(data)
      }

      // Add success message to chat
      addBotMessage(
        `Great! Your appointment has been booked for ${data.preferredDate ? data.preferredDate.toLocaleDateString() : 'your preferred date'} ${data.preferredTime ? `at ${data.preferredTime}` : ''}. You should receive a confirmation email shortly at ${data.email}. Is there anything else I can help you with?`
      )
      
      setShowBookingForm(false)
      setPrefilledAppointmentData({})
    } catch (error) {
      console.error('Error booking appointment:', error)
      toast.error('Failed to book appointment. Please try again.')
    }
  }

  const renderMessage = (message: Message) => (
    <div key={message.id} className={cn("flex gap-3 mb-4", message.type === 'user' ? 'justify-end' : 'justify-start')}>
      <div className={cn("flex gap-3 max-w-[80%]", message.type === 'user' ? 'flex-row-reverse' : 'flex-row')}>
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          message.type === 'user' ? 'bg-primary' : 'bg-muted'
        )}>
          {message.type === 'user' ? <User className="h-4 w-4 text-primary-foreground" /> : <Bot className="h-4 w-4" />}
        </div>
        
        <div className="space-y-2">
          <div className={cn(
            "rounded-lg px-4 py-2 text-sm",
            message.type === 'user' 
              ? 'bg-primary/80 text-primary-foreground backdrop-blur-sm' 
              : 'bg-transparent text-foreground border border-white/20 backdrop-blur-sm'
          )}>
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
          
          {message.metadata && (
            <div className="space-y-2">
              {message.metadata.disorders && message.metadata.disorders.length > 0 && (
                <Card className="p-3">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    Medical Conditions
                  </h4>
                  <Accordion type="single" collapsible>
                    {message.metadata.disorders.slice(0, 3).map((disorder, index) => (
                      <AccordionItem key={disorder.id} value={`disorder-${index}`}>
                        <AccordionTrigger className="text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant={disorder.severity === 'severe' ? 'destructive' : disorder.severity === 'moderate' ? 'default' : 'secondary'}>
                              {disorder.severity}
                            </Badge>
                            {disorder.name}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-sm space-y-2">
                          <p><strong>Description:</strong> {disorder.description}</p>
                          <p><strong>Symptoms:</strong> {disorder.symptoms.slice(0, 3).join(', ')}</p>
                          <p><strong>Treatments:</strong> {disorder.treatments.slice(0, 3).join(', ')}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </Card>
              )}

              {message.metadata.locations && message.metadata.locations.length > 0 && (
                <Card className="p-3">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Body Locations
                  </h4>
                  {message.metadata.locations.map((location) => (
                    <div key={location.id} className="text-sm space-y-1">
                      <p><strong>{location.name}</strong></p>
                      <p className="text-muted-foreground">{location.anatomy}</p>
                    </div>
                  ))}
                </Card>
              )}

              {message.metadata.suggestions && message.metadata.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {message.metadata.suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(suggestion)}
                      className="text-xs"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-40"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Appointment Booking Form Dialog */}
      <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <AppointmentBookingForm
            onSubmit={handleAppointmentSubmit}
            onClose={() => setShowBookingForm(false)}
            prefilledData={prefilledAppointmentData}
          />
        </DialogContent>
      </Dialog>

      {/* Main Chat Interface */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <Card className={cn("h-[80vh] flex flex-col relative overflow-hidden", isMinimized && "h-16")} style={{backgroundColor: 'rgba(173,192,190,0.9)', backgroundImage: 'url(/images/muscle-anatomy.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundBlendMode: 'overlay'}}>
            {/* Background overlay for better text readability */}
            <div className="absolute inset-0 bg-transparent" />
            {/* Header */}
            <CardHeader className="pb-3 border-b relative z-10 bg-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <Stethoscope className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Medical Assistant</CardTitle>
                    <CardDescription>Your healthcare information companion</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                    title={isVoiceEnabled ? "Turn off voice" : "Turn on voice"}
                    className={isVoiceEnabled ? "bg-green-100 text-green-600" : ""}
                  >
                    {isVoiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMinimized(!isMinimized)}
                  >
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {!isMinimized && (
              <>
                {/* Quick Actions */}
                <div className="p-4 border-b">
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((action) => (
                      <Button
                        key={action.label}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction(action.trigger)}
                        className="text-xs"
                      >
                        <action.icon className="h-3 w-3 mr-1" />
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Messages */}
                <CardContent className="flex-1 p-0">
                  <ScrollArea className="h-full p-4" ref={chatContainerRef}>
                    {messages.map(renderMessage)}
                    
                    {isTyping && (
                      <div className="flex gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-muted rounded-lg px-4 py-2 flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span className="text-sm text-muted-foreground">Typing...</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </ScrollArea>
                </CardContent>

                {/* Input */}
                <CardFooter className="border-t p-4">
                  <div className="flex w-full gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about medical conditions, symptoms, or book an appointment..."
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </>
            )}
          </Card>
        </DialogContent>
      </Dialog>
    </>
  )
}
