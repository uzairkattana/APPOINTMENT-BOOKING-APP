"use client"

import { SmartAppointmentBooking } from "@/components/smart-appointment-booking"
import { LanguageProvider } from "@/components/language-provider"
import { Toaster } from "@/components/ui/toaster"

export default function SmartBookingDemoPage() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
              Smart Appointment Booking System
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Experience our enhanced booking system with 40-minute gap enforcement, 
              automatic Sunday closure, business hours validation, and bilingual error messaging.
            </p>
            
            {/* Features Highlight */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 mb-8">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border-2 border-green-200">
                <div className="text-2xl mb-2">⏰</div>
                <h3 className="font-bold text-green-700 dark:text-green-400">40-Minute Gap</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatic enforcement of minimum time between appointments
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border-2 border-blue-200">
                <div className="text-2xl mb-2">🏥</div>
                <h3 className="font-bold text-blue-700 dark:text-blue-400">Business Hours</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Only 9 AM - 6 PM slots available, Sundays automatically closed
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border-2 border-purple-200">
                <div className="text-2xl mb-2">🌐</div>
                <h3 className="font-bold text-purple-700 dark:text-purple-400">Bilingual Messages</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Error messages in both English and Urdu
                </p>
              </div>
            </div>
          </div>

          {/* Smart Booking Component */}
          <SmartAppointmentBooking />
          
          {/* Instructions */}
          <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
              🚀 How to Test the Smart Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-lg mb-2 text-blue-600">✅ What Works</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Select any Monday-Saturday date</li>
                  <li>• Choose available time slots (green buttons)</li>
                  <li>• Times automatically respect 40-minute gaps</li>
                  <li>• Business hours enforced (9 AM - 6 PM)</li>
                  <li>• Real-time validation with bilingual messages</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-lg mb-2 text-red-600">❌ What's Blocked</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Sunday selections (clinic closed)</li>
                  <li>• Times too close to existing appointments</li>
                  <li>• Slots outside business hours</li>
                  <li>• Already booked time slots (grayed out)</li>
                  <li>• Invalid form submissions</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200">
              <h4 className="font-bold text-yellow-800 dark:text-yellow-400 mb-2">
                💡 Demo Data
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Some slots are pre-booked for testing (July 22-23, 2025). Try selecting times 
                around 11:00 AM or 2:30 PM on these dates to see the conflict detection in action.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </LanguageProvider>
  )
}
