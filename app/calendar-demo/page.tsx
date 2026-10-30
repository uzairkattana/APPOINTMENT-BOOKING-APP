"use client"

import React from 'react'
import AppointmentCalendar from '@/components/appointment-calendar'
import { sampleAppointments } from '@/lib/sample-appointments'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Users, Clock, TrendingUp } from 'lucide-react'

export default function CalendarDemo() {
  const handleAppointmentClick = (appointment: any) => {
    console.log('Appointment clicked:', appointment)
  }

  const handleAppointmentUpdate = (appointment: any) => {
    console.log('Appointment updated:', appointment)
  }

  const handleAppointmentDelete = (id: string) => {
    console.log('Appointment deleted:', id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(190,205,203)] to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#0d5c75] via-[#1a6b7a] to-[#2a9d8f] text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2 font-poppins">
              🦴 Gonstead Chiropractic Calendar Demo
            </h1>
            <p className="text-white/80 text-lg">
              Professional Appointment Management System
            </p>
            <div className="flex justify-center items-center gap-2 mt-4">
              <Badge variant="outline" className="text-white border-white/30 bg-white/10">
                <CalendarDays className="h-3 w-3 mr-1" />
                Advanced Calendar
              </Badge>
              <Badge variant="outline" className="text-white border-white/30 bg-white/10">
                <Users className="h-3 w-3 mr-1" />
                Patient Management
              </Badge>
              <Badge variant="outline" className="text-white border-white/30 bg-white/10">
                <Clock className="h-3 w-3 mr-1" />
                Real-time Updates
              </Badge>
              <Badge variant="outline" className="text-white border-white/30 bg-white/10">
                <TrendingUp className="h-3 w-3 mr-1" />
                Analytics Ready
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Demo Information */}
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8 border-[#0d5c75]/20 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-[#f3a800] to-[#e07c1c] text-white">
            <CardTitle className="text-xl font-bold">
              📋 Calendar Demo Features
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {sampleAppointments.length}
                </div>
                <div className="text-sm text-blue-700 font-medium">Sample Appointments</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">4</div>
                <div className="text-sm text-green-700 font-medium">Status Types</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 mb-1">3</div>
                <div className="text-sm text-yellow-700 font-medium">Urgency Levels</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">2</div>
                <div className="text-sm text-purple-700 font-medium">Session Types</div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-[#0d5c75]/10 to-[#2a9d8f]/10 rounded-lg border border-[#0d5c75]/20">
              <h3 className="font-semibold text-[#0d5c75] mb-2">✨ Key Features Demonstrated:</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Interactive month and list views
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Color-coded appointment status
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Emergency and urgent indicators
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Professional hover effects
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Detailed appointment modals
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                  Advanced filtering system
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                  Real-time statistics
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-teal-500 rounded-full"></span>
                  Mobile responsive design
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Component */}
        <AppointmentCalendar
          appointments={sampleAppointments}
          onAppointmentClick={handleAppointmentClick}
          onAppointmentUpdate={handleAppointmentUpdate}
          onAppointmentDelete={handleAppointmentDelete}
        />

        {/* Additional Information */}
        <Card className="mt-8 border-[#0d5c75]/20 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-[#2a9d8f] to-[#0d5c75] text-white">
            <CardTitle className="text-xl font-bold">
              🔧 Integration Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="prose max-w-none">
              <h3 className="text-[#0d5c75] font-semibold mb-3">How to Use This Calendar:</h3>
              <ol className="space-y-2 text-gray-700">
                <li><strong>Click on appointments</strong> to view detailed information in a professional modal</li>
                <li><strong>Use the search bar</strong> to find specific patients or phone numbers</li>
                <li><strong>Filter by status</strong> (Pending, Confirmed, Completed, Cancelled)</li>
                <li><strong>Filter by urgency</strong> (Normal, Urgent, Emergency)</li>
                <li><strong>Switch between views</strong> using Month and List toggle buttons</li>
                <li><strong>Navigate months</strong> using Previous/Next buttons or click Today</li>
                <li><strong>Emergency appointments</strong> pulse with red animation for immediate attention</li>
                <li><strong>Hover over appointments</strong> to see professional interactive effects</li>
              </ol>
              
              <h3 className="text-[#0d5c75] font-semibold mb-3 mt-6">🎨 Design Philosophy:</h3>
              <p className="text-gray-700 mb-4">
                This calendar is specifically designed for Gonstead Chiropractic practices with:
              </p>
              <ul className="space-y-1 text-gray-700">
                <li>• <strong>Spine-inspired</strong> custom icons and visual elements</li>
                <li>• <strong>Medical color coding</strong> for quick status identification</li>
                <li>• <strong>Professional gradients</strong> matching your brand colors</li>
                <li>• <strong>Accessibility features</strong> including high contrast and reduced motion support</li>
                <li>• <strong>Responsive design</strong> that works perfectly on all devices</li>
                <li>• <strong>Print-friendly</strong> styles for physical appointment schedules</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
