'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Stethoscope, 
  MessageCircle, 
  Calendar, 
  MapPin, 
  BookOpen, 
  Info,
  CheckCircle,
  AlertTriangle,
  Heart
} from 'lucide-react'
import { type AppointmentData } from '@/components/appointment-booking-form'
import { toast } from 'sonner'

export default function ChatbotDemoPage() {
  const [appointmentBookings, setAppointmentBookings] = useState<AppointmentData[]>([])

  const handleAppointmentBooked = async (data: AppointmentData) => {
    try {
      // Simulate API call to book appointment
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setAppointmentBookings(prev => [...prev, data])
      toast.success('Appointment booked successfully!')
      
      // In a real application, you would send this data to your backend
      console.log('Appointment booked:', data)
    } catch (error) {
      console.error('Error booking appointment:', error)
      throw error
    }
  }

  const features = [
    {
      icon: MessageCircle,
      title: 'Intelligent Medical Q&A',
      description: 'Ask questions about medical conditions, symptoms, and treatments',
      examples: ['What causes back pain?', 'Tell me about sciatica', 'Symptoms of herniated disc']
    },
    {
      icon: MapPin,
      title: 'Body Location Information',
      description: 'Learn about anatomy and common disorders in specific body parts',
      examples: ['Cervical spine anatomy', 'Lower back problems', 'Neck disorders']
    },
    {
      icon: Stethoscope,
      title: 'Disorder Database',
      description: 'Comprehensive information about medical conditions and treatments',
      examples: ['Fibromyalgia treatment', 'Migraine causes', 'Osteoarthritis symptoms']
    },
    {
      icon: Calendar,
      title: 'Appointment Booking',
      description: 'Schedule appointments directly through the chatbot interface',
      examples: ['Book an appointment', 'Schedule consultation', 'Emergency visit']
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Medical Chatbot Demo</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience our comprehensive medical assistant that can answer questions about disorders, 
            body locations, symptoms, and help you book appointments.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Try asking:</p>
                  {feature.examples.map((example, index) => (
                    <Badge key={index} variant="secondary" className="text-xs mr-1 mb-1">
                      {example}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <Card className="bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              How to Use the Medical Chatbot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Medical Questions
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Ask about specific medical conditions and disorders
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Get information about symptoms and their possible causes
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Learn about treatment options and prevention
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Explore body anatomy and common disorders
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Appointment Booking
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Type "book an appointment" to start scheduling
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Fill out the comprehensive booking form
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Choose from various appointment types
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    Get instant confirmation and reminders
                  </li>
                </ul>
              </div>
            </div>

            <Separator />

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800">Medical Disclaimer</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    This chatbot provides educational information only and should not replace professional medical advice. 
                    For emergencies, call 911. Always consult with healthcare professionals for diagnosis and treatment.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sample Questions */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Try These Sample Questions
            </CardTitle>
            <CardDescription>
              Click the chatbot button in the bottom right to start a conversation, then try these questions:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                'What is a herniated disc?',
                'Tell me about sciatica symptoms',
                'What causes neck pain?',
                'Book an appointment',
                'What is fibromyalgia?',
                'Lower back pain treatment',
                'Migraine vs tension headache',
                'Cervical spine anatomy',
                'Joint pain in knees'
              ].map((question, index) => (
                <div key={index} className="bg-white/60 rounded-lg p-3 text-sm border border-gray-200">
                  <span className="text-gray-700">&ldquo;{question}&rdquo;</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        {appointmentBookings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Appointment Bookings
              </CardTitle>
              <CardDescription>
                Appointments booked through the chatbot interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointmentBookings.map((booking, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <p className="font-semibold text-green-800">
                        {booking.firstName} {booking.lastName}
                      </p>
                      <p className="text-sm text-green-600">
                        {booking.appointmentType} - {booking.preferredDate?.toLocaleDateString()} {booking.preferredTime}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Confirmed
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Chatbot Component */}
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Chatbot Demo</h1>
        <p className="text-gray-600">Advanced chatbot component has been removed.</p>
      </div>
    </div>
  )
}
