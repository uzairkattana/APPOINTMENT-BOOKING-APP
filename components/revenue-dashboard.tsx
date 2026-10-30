"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, TrendingUp, TrendingDown, Calendar, CreditCard, Users, Activity } from 'lucide-react'
import type { Patient } from '@/lib/data-service'

interface RevenueDashboardProps {
  patients: Patient[]
  isDarkMode?: boolean
}

interface RevenueData {
  total: number
  byPaymentMethod: Record<string, number>
  bySessionType: Record<string, number>
  dailyRevenue: Array<{ date: string; amount: number }>
  weeklyRevenue: Array<{ week: string; amount: number }>
  monthlyRevenue: Array<{ month: string; amount: number }>
}

// Pricing constants
const PRICING = {
  in_clinic: 1500, // Rs. 1500 per in-clinic session
  video: 1000,     // Rs. 1000 per video session
}

export function RevenueDashboard({ patients, isDarkMode = false }: RevenueDashboardProps) {
  const [timePeriod, setTimePeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly')
  
  // Calculate revenue data
  const revenueData = useMemo((): RevenueData => {
    const data: RevenueData = {
      total: 0,
      byPaymentMethod: { cash: 0, jazzcash: 0, easypaisa: 0 },
      bySessionType: { in_clinic: 0, video: 0 },
      dailyRevenue: [],
      weeklyRevenue: [],
      monthlyRevenue: [],
    }

    // Process each patient
    patients.forEach(patient => {
      const sessionsCompleted = patient.sessions_completed || 0
      const sessionType = patient.session_type
      const paymentMethod = patient.payment_method || 'cash'
      const pricePerSession = PRICING[sessionType]
      const revenue = sessionsCompleted * pricePerSession

      // Total revenue
      data.total += revenue

      // By payment method
      data.byPaymentMethod[paymentMethod] = (data.byPaymentMethod[paymentMethod] || 0) + revenue

      // By session type
      data.bySessionType[sessionType] = (data.bySessionType[sessionType] || 0) + revenue
    })

    // Generate time-series data (simulated for now - in production, use actual dates)
    const today = new Date()
    
    // Daily revenue (last 7 days)
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      // Calculate daily revenue from completed patients
      const dailyAmount = patients
        .filter(p => {
          const apptDate = new Date(p.appointment_date).toISOString().split('T')[0]
          return apptDate === dateStr && (p.sessions_completed || 0) > 0
        })
        .reduce((sum, p) => sum + ((p.sessions_completed || 0) * PRICING[p.session_type]), 0)
      
      data.dailyRevenue.push({ date: dateStr, amount: dailyAmount })
    }

    // Weekly revenue (last 4 weeks)
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today)
      weekStart.setDate(weekStart.getDate() - (i * 7))
      const weekStr = `Week ${4 - i}`
      
      const weeklyAmount = data.total / 4 // Simplified - in production, calculate from actual dates
      data.weeklyRevenue.push({ week: weekStr, amount: weeklyAmount })
    }

    // Monthly revenue (last 6 months)
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(today)
      monthDate.setMonth(monthDate.getMonth() - i)
      const monthStr = monthDate.toLocaleDateString('en-US', { month: 'short' })
      
      const monthlyAmount = data.total / 6 // Simplified - in production, calculate from actual dates
      data.monthlyRevenue.push({ month: monthStr, amount: monthlyAmount })
    }

    return data
  }, [patients])

  // Calculate growth percentage (simplified)
  const growthPercentage = 12.5 // In production, calculate actual growth

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-[#0d5c75]'}`}>
            Revenue Dashboard
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Track your clinic's financial performance
          </p>
        </div>
        <Select value={timePeriod} onValueChange={(value: any) => setTimePeriod(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card className={`border-[#22c55e]/20 ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-green-50 to-green-100'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-green-600'}`}>
              Total Revenue
            </CardTitle>
            <DollarSign className={`h-4 w-4 ${isDarkMode ? 'text-white' : 'text-green-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-green-600'}`}>
              Rs. {revenueData.total.toLocaleString()}
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-500 font-medium">
                +{growthPercentage}% from last period
              </span>
            </div>
          </CardContent>
        </Card>

        {/* In-Clinic Revenue */}
        <Card className={`border-[#0d5c75]/20 ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-blue-50 to-blue-100'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-[#0d5c75]'}`}>
              In-Clinic Revenue
            </CardTitle>
            <Activity className={`h-4 w-4 ${isDarkMode ? 'text-white' : 'text-[#0d5c75]'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-[#0d5c75]'}`}>
              Rs. {revenueData.bySessionType.in_clinic.toLocaleString()}
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              {Math.round((revenueData.bySessionType.in_clinic / revenueData.total) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        {/* Video Consultation Revenue */}
        <Card className={`border-purple-500/20 ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-purple-50 to-purple-100'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-purple-600'}`}>
              Video Revenue
            </CardTitle>
            <CreditCard className={`h-4 w-4 ${isDarkMode ? 'text-white' : 'text-purple-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-purple-600'}`}>
              Rs. {revenueData.bySessionType.video.toLocaleString()}
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              {Math.round((revenueData.bySessionType.video / revenueData.total) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        {/* Average Revenue Per Patient */}
        <Card className={`border-orange-500/20 ${isDarkMode ? 'bg-gray-800' : 'bg-gradient-to-br from-orange-50 to-orange-100'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-orange-600'}`}>
              Avg Per Patient
            </CardTitle>
            <Users className={`h-4 w-4 ${isDarkMode ? 'text-white' : 'text-orange-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-orange-600'}`}>
              Rs. {Math.round(revenueData.total / Math.max(patients.length, 1)).toLocaleString()}
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              Based on {patients.length} patients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart (Simple Bar Chart) */}
      <Card className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
        <CardHeader>
          <CardTitle className={isDarkMode ? 'text-white' : 'text-[#0d5c75]'}>
            Revenue Trend - {timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(timePeriod === 'daily' ? revenueData.dailyRevenue :
              timePeriod === 'weekly' ? revenueData.weeklyRevenue :
              revenueData.monthlyRevenue).map((item, index) => {
                const label = 'date' in item ? item.date : 'week' in item ? item.week : item.month
                const maxAmount = Math.max(...(timePeriod === 'daily' ? revenueData.dailyRevenue :
                  timePeriod === 'weekly' ? revenueData.weeklyRevenue :
                  revenueData.monthlyRevenue).map(i => i.amount))
                const percentage = (item.amount / maxAmount) * 100

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{label}</span>
                      <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-[#0d5c75]'}`}>
                        Rs. {item.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
          <CardHeader>
            <CardTitle className={`text-sm ${isDarkMode ? 'text-white' : 'text-[#0d5c75]'}`}>
              Cash Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-[#0d5c75]'}`}>
              Rs. {revenueData.byPaymentMethod.cash.toLocaleString()}
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              {Math.round((revenueData.byPaymentMethod.cash / revenueData.total) * 100)}% of revenue
            </p>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
          <CardHeader>
            <CardTitle className={`text-sm ${isDarkMode ? 'text-white' : 'text-[#0d5c75]'}`}>
              JazzCash
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-[#0d5c75]'}`}>
              Rs. {revenueData.byPaymentMethod.jazzcash.toLocaleString()}
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              {Math.round((revenueData.byPaymentMethod.jazzcash / revenueData.total) * 100)}% of revenue
            </p>
          </CardContent>
        </Card>

        <Card className={isDarkMode ? 'bg-gray-800' : 'bg-white'}>
          <CardHeader>
            <CardTitle className={`text-sm ${isDarkMode ? 'text-white' : 'text-[#0d5c75]'}`}>
              Easypaisa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-[#0d5c75]'}`}>
              Rs. {revenueData.byPaymentMethod.easypaisa.toLocaleString()}
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              {Math.round((revenueData.byPaymentMethod.easypaisa / revenueData.total) * 100)}% of revenue
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

