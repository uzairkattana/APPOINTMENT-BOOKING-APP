"use client"

import React, { useState, useEffect } from 'react'
import { MessageCircle, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

export default function StaffCommunication() {
  const [staffUsername, setStaffUsername] = useState('')
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Get staff username from localStorage
    const username = localStorage.getItem('staff_username')
    if (username) {
      setStaffUsername(username)
    } else {
      toast({
        title: "Authentication Required",
        description: "Please log in to access communication.",
        variant: "destructive"
      })
      router.push('/staff/auth')
    }
  }, [toast, router])

  const communicationStats = [
    {
      title: "Active Conversations",
      value: "1",
      icon: <Users className="h-6 w-6 text-emerald-600" />,
      description: "With admin"
    },
    {
      title: "Response Time",
      value: "< 5 min",
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      description: "Average response"
    },
    {
      title: "Messages Today",
      value: "12",
      icon: <MessageCircle className="h-6 w-6 text-purple-600" />,
      description: "Total exchanged"
    },
    {
      title: "Status",
      value: "Online",
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      description: "Admin available"
    }
  ]

  const communicationGuidelines = [
    {
      title: "Emergency Issues",
      description: "For urgent patient matters or system issues",
      priority: "high",
      icon: <AlertCircle className="h-5 w-5 text-red-500" />
    },
    {
      title: "Appointment Changes",
      description: "Schedule modifications or patient requests",
      priority: "medium",
      icon: <Clock className="h-5 w-5 text-yellow-500" />
    },
    {
      title: "General Questions",
      description: "Routine inquiries and clarifications",
      priority: "low",
      icon: <MessageCircle className="h-5 w-5 text-blue-500" />
    }
  ]

  if (!staffUsername) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Communication Center</h1>
              <p className="text-gray-600">Real-time chat with admin team</p>
            </div>
            <Button
              onClick={() => router.push('/staff-dashboard')}
              variant="outline"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {communicationStats.map((stat, index) => (
            <Card key={index} className="bg-white shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-full">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Communication Guidelines */}
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5" />
                  <span>Communication Guidelines</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {communicationGuidelines.map((guideline, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                    {guideline.icon}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{guideline.title}</h4>
                      <p className="text-sm text-gray-600">{guideline.description}</p>
                      <Badge 
                        variant="outline" 
                        className={`mt-1 ${
                          guideline.priority === 'high' ? 'border-red-500 text-red-700' :
                          guideline.priority === 'medium' ? 'border-yellow-500 text-yellow-700' :
                          'border-blue-500 text-blue-700'
                        }`}
                      >
                        {guideline.priority} priority
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-md h-[600px]">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>Admin Chat</span>
                  </div>
                  <Badge className="bg-green-500 text-white">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    Online
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[520px]">
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 text-emerald-600" />
                    <h3 className="text-lg font-semibold mb-2">Chat Widget Active</h3>
                    <p className="text-sm mb-4">Use the floating chat button in the bottom-right corner to start messaging with admin.</p>
                    <div className="animate-bounce inline-block">
                      <div className="bg-emerald-600 text-white rounded-full p-3">
                        <MessageCircle className="h-6 w-6" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Report Emergency</h3>
                  <p className="text-sm text-gray-600">Urgent patient or system issues</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Schedule Change</h3>
                  <p className="text-sm text-gray-600">Request appointment modifications</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-md hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-full">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">General Inquiry</h3>
                  <p className="text-sm text-gray-600">Questions and clarifications</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
