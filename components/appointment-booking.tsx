"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar, Video, Clock, CheckCircle, AlertTriangle, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useLanguage } from "./language-provider"
import { useToast } from "@/hooks/use-toast"
import { AppointmentConfirmation } from "./appointment-confirmation"

import { createPatient } from "@/lib/data-service"

export function AppointmentBooking() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    sessionType: "clinic",
    preferredTime: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSundaySelected, setIsSundaySelected] = useState(false)
  const { t, language } = useLanguage()
  const { toast } = useToast()

  // Sunday closure detection
  const isSunday = (date: Date) => {
    return date.getDay() === 0 // Sunday = 0
  }

  const isToday = () => {
    const today = new Date()
    return today.getDay() === 0 // Check if today is Sunday
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate Pakistani phone number
    const phoneRegex = /^(\+92|0)?3[0-9]{9}$/
    if (!phoneRegex.test(formData.phone)) {
      toast({
        title: language === "ur" ? "غلط فون نمبر" : "Invalid Phone Number",
        description:
          language === "ur"
            ? "براہ کرم پاکستانی فون نمبر درج کریں (مثال: 03001234567)"
            : "Please enter a valid Pakistani phone number (e.g., 03001234567)",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Validate Sunday selection
    if (formData.preferredTime) {
      const selectedDateTime = new Date(formData.preferredTime)
      if (isSunday(selectedDateTime)) {
        toast({
          title: language === "ur" ? "کلینک بند" : "Clinic Closed",
          description: language === "ur" 
            ? "اتوار کو کلینک بند ہے۔ براہ کرم پیر سے ہفتہ تک کوئی دن منتخب کریں۔" 
            : "Clinic is closed on Sundays. Please select Monday through Saturday.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }
    }

    // Save appointment directly to Firestore
    try {
      await createPatient({
        name: formData.name,
        phone: formData.phone,
        session_type: formData.sessionType === "clinic" ? "in_clinic" : "video",
        appointment_date: formData.preferredTime || new Date().toISOString(),
        status: "pending",
        urgency: "normal",
        payment_method: "cash",
        sessions_completed: 0,
      })
    } catch (dbErr) {
      console.error("Failed to save appointment to Firestore:", dbErr)
    }

    setIsSubmitted(true)
    setIsSubmitting(false)

    toast({
      title: language === "ur" ? "اپائنٹمنٹ بک ہو گئی" : "Appointment Booked",
      description: language === "ur" ? "ڈاکٹر باہر جلد ہی آپ سے رابطہ کریں گے" : "Dr. Bahir will contact you shortly",
    })
  }

  if (isSubmitted) {
    return (
      <AppointmentConfirmation 
        appointmentData={formData}
        onBackToHome={() => {
          setIsSubmitted(false)
          setFormData({ name: "", phone: "", sessionType: "clinic", preferredTime: "" })
        }}
        onNewAppointment={() => {
          setIsSubmitted(false)
          setFormData({ name: "", phone: "", sessionType: "clinic", preferredTime: "" })
        }}
      />
    )
  }

  return (
    <Card className="border-[#2a9d8f]">
      <CardHeader className="bg-[#2a9d8f] text-white">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {t("book.appointment")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name">{language === "ur" ? "نام" : "Name"} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder={language === "ur" ? "اپنا نام درج کریں" : "Enter your name"}
              required
            />
          </div>

          {/* Phone Input */}
          <div className="space-y-2">
            <Label htmlFor="phone">{language === "ur" ? "فون نمبر" : "Phone Number"} *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="03001234567"
              required
            />
          </div>

          {/* Session Type */}
          <div className="space-y-3">
            <Label>{language === "ur" ? "سیشن کی قسم" : "Session Type"} *</Label>
            <RadioGroup
              value={formData.sessionType}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, sessionType: value }))}
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="clinic" id="clinic" />
                <Label htmlFor="clinic" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Calendar className="h-4 w-4 text-[#2a9d8f]" />
                  <div>
                    <div className="font-medium">
                      {language === "ur" ? "کلینک میں گونسٹیڈ ایڈجسٹمنٹ" : "In-clinic Gonstead Adjustment"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {language === "ur" ? "مشین کی مدد سے" : "Machine-assisted treatment"}
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="video" id="video" />
                <Label htmlFor="video" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Video className="h-4 w-4 text-red-500" />
                  <div>
                    <div className="font-medium">
                      {language === "ur" ? "ایمرجنسی ویڈیو مشاورت" : "Emergency Video Consultation"}
                    </div>
                    <div className="text-sm text-gray-500">{language === "ur" ? "15 منٹ تک" : "15 minutes max"}</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Sunday Closure Notice */}
          {(isToday() || isSundaySelected) && (
            <Alert className={`border-2 ${
              isToday() 
                ? 'border-red-500 bg-red-50 text-red-800' 
                : 'border-amber-500 bg-amber-50 text-amber-800'
            }`}>
              <AlertTriangle className={`h-5 w-5 ${
                isToday() ? 'text-red-600' : 'text-amber-600'
              }`} />
              <AlertDescription className="font-medium text-sm">
                <div className="flex items-start gap-2">
                  <Info className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                    isToday() ? 'text-red-600' : 'text-amber-600'
                  }`} />
                  <div>
                    <p className="font-bold mb-1">
                      {isToday() ? '🚫 CLINIC CLOSED TODAY' : '📅 SUNDAY SELECTED - CLINIC CLOSED'}
                    </p>
                    <p>
                      {isToday() 
                        ? (language === "ur" 
                            ? "ہمارا کلینک آج (اتوار) بند ہے۔ براہ کرم اپنی اپائنٹمنٹ کے لیے کوئی اور دن منتخب کریں۔"
                            : "Our clinic is closed today (Sunday). Please select another day for your appointment booking.")
                        : (language === "ur"
                            ? "آپ نے اتوار کا دن منتخب کیا ہے۔ ہمارا کلینک اتوار کو بند رہتا ہے۔ براہ کرم پیر سے ہفتہ تک کوئی دن منتخب کریں۔"
                            : "You have selected Sunday. Our clinic is closed on Sundays. Please choose Monday through Saturday for your appointment.")}
                    </p>
                    {!isToday() && (
                      <p className="mt-2 text-xs font-medium">
                        <strong>{language === "ur" ? "کھلنے کے اوقات:" : "Operating Hours:"}</strong> {language === "ur" ? "پیر - ہفتہ" : "Monday - Saturday"} | 
                        <strong> {language === "ur" ? "بند:" : "Closed:"}</strong> {language === "ur" ? "اتوار اور عوامی تعطیلات" : "Sundays & Public Holidays"}
                      </p>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Preferred Time */}
          <div className="space-y-2">
            <Label htmlFor="time">{language === "ur" ? "ترجیحی وقت" : "Preferred Time"}</Label>
            <Input
              id="time"
              type="datetime-local"
              value={formData.preferredTime}
              onChange={(e) => {
                const selectedDateTime = new Date(e.target.value)
                setIsSundaySelected(isSunday(selectedDateTime))
                setFormData((prev) => ({ ...prev, preferredTime: e.target.value }))
              }}
              className={`${
                isSundaySelected ? 'border-red-500 bg-red-50' : ''
              }`}
            />
            {isSundaySelected && (
              <p className="text-red-600 text-xs font-medium">
                ⚠️ {language === "ur" ? "اتوار منتخب کیا گیا - کلینک بند" : "Sunday selected - Clinic closed"}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className={`w-full ${
              isSundaySelected 
                ? 'bg-red-500 hover:bg-red-600 cursor-not-allowed' 
                : 'bg-[#2a9d8f] hover:bg-[#238a7a]'
            }`} 
            disabled={isSubmitting || isSundaySelected}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 animate-spin" />
                {language === "ur" ? "بک ہو رہا ہے..." : "Booking..."}
              </div>
            ) : (
              t("book.appointment")
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
