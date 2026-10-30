"use client"

import type React from "react"

import { useState, useRef } from "react"
import emailjs from '@emailjs/browser'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Mail, Send, CheckCircle, Loader2, Mic, MicOff, MessageCircle, Phone, MapPin, QrCode } from "lucide-react"
import { useLanguage } from "./language-provider"
import { useToast } from "@/hooks/use-toast"

interface FormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  healthConcerns: string
}

const healthTermSuggestions = [
  "Lower back pain",
  "Neck stiffness",
  "Headaches",
  "Sciatica",
  "Posture correction",
  "Sports injury",
  "Chronic pain",
  "Muscle tension",
  "Joint mobility",
  "Spinal alignment",
  "Work-related pain",
  "Arthritis",
]

export function EmailJSContactForm() {
  const { language } = useLanguage()
  const { toast } = useToast()
  const form = useRef<HTMLFormElement>(null)

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    healthConcerns: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Voice-to-form functionality
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
        setFormData((prev) => ({
          ...prev,
          message: prev.message + (prev.message ? " " : "") + transcript,
        }))
      }

      recognition.onerror = () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Your EmailJS configuration
      const serviceId = process.env.NEXT_PUBLIC_EMAIL_SERVICE_ID || "service_s8n248l"
      const templateId = process.env.NEXT_PUBLIC_EMAIL_TEMPLATE_ID || "template_cvai1qm"
      const publicKey = process.env.NEXT_PUBLIC_EMAIL_PUBLIC_KEY || "STD49hXa06xbHgXCK"

      const templateParams = {
        from_name: formData.name.trim(),
        from_email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim() || 'Contact Form Submission from Website',
        message: formData.message.trim(),
        health_concerns: formData.healthConcerns.trim(),
        to_email: "gonsteadchiropractic.org@gmail.com",
      }

      // Send email using EmailJS
      await emailjs.send(serviceId, templateId, templateParams, publicKey)

      setIsSubmitted(true)
      toast({
        title: language === "ur" ? "پیغام بھیج دیا گیا" : "Message Sent Successfully",
        description:
          language === "ur" ? "ہماری ٹیم جلد ہی آپ سے رابطہ کرے گی" : "Our team will contact you shortly",
      })

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        healthConcerns: "",
      })
    } catch (error) {
      toast({
        title: language === "ur" ? "خرابی" : "Error",
        description: language === "ur" ? "پیغام بھیجنے میں مسئلہ ہے" : "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addHealthSuggestion = (suggestion: string) => {
    setFormData((prev) => ({
      ...prev,
      healthConcerns: prev.healthConcerns ? `${prev.healthConcerns}, ${suggestion}` : suggestion,
    }))
    setShowSuggestions(false)
  }

  if (isSubmitted) {
    return (
      <Card className="border-[#f3a800] bg-gradient-to-br from-[#f8f5f0] to-white shadow-2xl">
        <CardContent className="text-center p-6 md:p-8">
          <div className="animate-bounce mb-6">
            <CheckCircle className="h-16 w-16 md:h-24 md:w-24 text-[#f3a800] mx-auto" />
          </div>
          <h3 className="text-2xl md:text-4xl font-bold text-[#0d5c75] mb-4 font-poppins">
            {language === "ur" ? "کامیابی!" : "Message Sent!"}
          </h3>
          <p className="text-[#0d5c75] mb-6 text-base md:text-lg font-open-sans">
            {language === "ur" ? "آپ کا پیغام کامیابی سے بھیج دیا گیا ہے۔" : "Your message has been sent successfully."}
          </p>

          {/* WhatsApp Card */}
          <Card className="bg-[#25d366] text-white mb-6">
            <CardContent className="p-4">
              <h4 className="font-bold mb-2 font-poppins">
                {language === "ur" ? "فوری رابطے کے لیے" : "For Immediate Contact"}
              </h4>
              <Button asChild variant="outline" className="border-white text-[#25d366] bg-white hover:bg-gray-100">
                <a href="https://wa.me/923046996267" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp: +92 304 699 6267
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* QR Calendar Add */}
          <div className="bg-white p-4 rounded-lg border border-[#0d5c75]/20">
            <div className="flex items-center justify-center gap-2 mb-2">
              <QrCode className="h-5 w-5 text-[#0d5c75]" />
              <span className="text-sm text-[#0d5c75] font-open-sans">
                {language === "ur" ? "کیلنڈر میں شامل کریں" : "Add to Calendar"}
              </span>
            </div>
            <div className="w-24 h-24 bg-gray-200 mx-auto rounded-lg flex items-center justify-center">
              <QrCode className="h-12 w-12 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-[#0d5c75] shadow-2xl bg-gradient-to-br from-[#f8f5f0] to-white overflow-hidden relative">
      {/* Spine-inspired background animation */}
      <div className="absolute inset-0 opacity-5">
        <div className="spine-form-bg">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="vertebra-connection"
              style={{
                animationDelay: `${i * 0.2}s`,
                left: `${10 + i * 10}%`,
              }}
            />
          ))}
        </div>
      </div>

      <CardHeader className="bg-gradient-to-r from-[#0d5c75] to-[#0a4a5c] text-white p-4 md:p-6 relative z-10">
        <CardTitle className="flex items-center gap-3 text-xl md:text-2xl font-poppins">
          <Mail className="h-6 w-6 md:h-7 md:w-7" />
          {language === "ur" ? "گونسٹیڈ کائروپریکٹک کلینک سے رابطہ کریں" : "Contact Gonstead Chiropractic Clinic"}
        </CardTitle>
        <p className="text-[#f8f5f0] text-sm font-open-sans">
          {language === "ur" ? "اپنی صحت کی ضروریات کے بارے میں بتائیں" : "Tell us about your health needs"}
        </p>
      </CardHeader>

      <CardContent className="p-4 md:p-8 relative z-10">
        <form ref={form} onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information with Vertebrae Reveal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 vertebra-reveal">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#0A3A47] font-poppins font-semibold">
                {language === "ur" ? "نام" : "Full Name"} *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder={language === "ur" ? "اپنا نام درج کریں" : "Enter your full name"}
                className="border-[#0d5c75]/30 focus:border-[#f3a800] spine-input font-open-sans"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#0A3A47] font-poppins font-semibold">
                {language === "ur" ? "ای میل" : "Email Address"} *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder={language === "ur" ? "آپ کا ای میل" : "your.email@example.com"}
                className="border-[#0d5c75]/30 focus:border-[#f3a800] spine-input font-open-sans"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 vertebra-reveal" style={{ animationDelay: "0.1s" }}>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[#0A3A47] font-poppins font-semibold">
                {language === "ur" ? "فون نمبر" : "Phone Number"}
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="+92 304 699 6267"
                className="border-[#0d5c75]/30 focus:border-[#f3a800] spine-input font-open-sans"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-[#0A3A47] font-poppins font-semibold">
                {language === "ur" ? "موضوع" : "Subject"} *
              </Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                placeholder={language === "ur" ? "پیغام کا موضوع" : "Message subject"}
                className="border-[#0d5c75]/30 focus:border-[#f3a800] spine-input font-open-sans"
                required
              />
            </div>
          </div>

          {/* Health Concerns with AI Suggestions */}
          <div className="space-y-2 vertebra-reveal" style={{ animationDelay: "0.2s" }}>
            <Label htmlFor="healthConcerns" className="text-[#0A3A47] font-poppins font-semibold">
              {language === "ur" ? "صحت کی پریشانیاں" : "Health Concerns"}
            </Label>
            <div className="relative">
              <Textarea
                id="healthConcerns"
                value={formData.healthConcerns}
                onChange={(e) => setFormData((prev) => ({ ...prev, healthConcerns: e.target.value }))}
                placeholder={
                  language === "ur" ? "اپنی صحت کی پریشانیاں بیان کریں..." : "Describe your health concerns..."
                }
                className="border-[#0d5c75]/30 focus:border-[#f3a800] spine-input min-h-[80px] font-open-sans"
                onFocus={() => setShowSuggestions(true)}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="absolute top-2 right-2 border-[#f3a800] text-[#f3a800] hover:bg-[#f3a800] hover:text-white"
                onClick={() => setShowSuggestions(!showSuggestions)}
              >
                AI Suggestions
              </Button>
            </div>

            {showSuggestions && (
              <div className="flex flex-wrap gap-2 mt-2">
                {healthTermSuggestions.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer border-[#0d5c75] text-[#0d5c75] hover:bg-[#0d5c75] hover:text-white transition-colors font-open-sans"
                    onClick={() => addHealthSuggestion(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Message with Voice Input */}
          <div className="space-y-2 vertebra-reveal" style={{ animationDelay: "0.3s" }}>
            <Label htmlFor="message" className="text-[#0A3A47] font-poppins font-semibold">
              {language === "ur" ? "تفصیلی پیغام" : "Detailed Message"} *
            </Label>
            <div className="relative">
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                placeholder={language === "ur" ? "اپنا تفصیلی پیغام لکھیں..." : "Write your detailed message..."}
                className="border-[#0d5c75]/30 focus:border-[#f3a800] spine-input min-h-[120px] pr-12 font-open-sans"
                required
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className={`absolute top-2 right-2 ${
                  isListening
                    ? "border-red-500 text-red-500 animate-pulse"
                    : "border-[#f3a800] text-[#f3a800] hover:bg-[#f3a800] hover:text-white"
                }`}
                onClick={startVoiceInput}
                disabled={isListening}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </div>
            {isListening && (
              <div className="flex items-center gap-2 text-red-500 text-sm font-open-sans">
                <div className="pulse-wave-animation">
                  <div className="pulse-dot"></div>
                  <div className="pulse-dot"></div>
                  <div className="pulse-dot"></div>
                </div>
                {language === "ur" ? "سن رہا ہے..." : "Listening..."}
              </div>
            )}
          </div>

          {/* Submit Button with Spinal Wave */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#0d5c75] to-[#0a4a5c] hover:from-[#0a4a5c] hover:to-[#083d4a] text-white font-bold py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 spine-wave-btn font-poppins"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin" />
                {language === "ur" ? "بھیج رہا ہے..." : "Sending Message..."}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Send className="h-5 w-5" />
                {language === "ur" ? "پیغام بھیجیں" : "Send Message"}
              </div>
            )}
          </Button>
        </form>

        {/* Contact Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border border-[#0d5c75]/20">
            <Phone className="h-6 w-6 text-[#0d5c75] mx-auto mb-2" />
            <p className="text-sm font-poppins font-semibold text-[#0A3A47]">{language === "ur" ? "فون" : "Phone"}</p>
            <p className="text-xs text-[#0A3A47] font-open-sans">+92 304 699 6267</p>
          </div>

          <div className="text-center p-4 bg-white rounded-lg border border-[#0d5c75]/20">
            <Mail className="h-6 w-6 text-[#f3a800] mx-auto mb-2" />
            <p className="text-sm font-poppins font-semibold text-[#0A3A47]">
              {language === "ur" ? "ای میل" : "Email"}
            </p>
            <p className="text-xs text-[#0A3A47] font-open-sans">gonsteadchiropractic.org@gmail.com</p>
          </div>

          <div className="text-center p-4 bg-white rounded-lg border border-[#0d5c75]/20">
            <MapPin className="h-6 w-6 text-[#0d5c75] mx-auto mb-2" />
            <p className="text-sm font-poppins font-semibold text-[#0A3A47]">{language === "ur" ? "پتہ" : "Address"}</p>
            <p className="text-xs text-[#0A3A47] font-open-sans">Near Peshawar Model School, Tehsil Road, Nowshera</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
