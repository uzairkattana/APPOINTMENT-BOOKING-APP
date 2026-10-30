"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BarChart3,
  Activity,
  X,
  Download,
  PieChart
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Patient } from "@/lib/data-service"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface PatientGrowthAnalyticsProps {
  patients: Patient[]
  isDarkMode?: boolean
  isOpen: boolean
  onClose: () => void
}

type TimeRange = "week" | "month" | "year"

export function PatientGrowthAnalytics({ 
  patients, 
  isDarkMode = false,
  isOpen,
  onClose
}: PatientGrowthAnalyticsProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>("week")

  // Calculate growth data based on selected time range
  const growthData = useMemo(() => {
    const now = new Date()
    const data: Array<{ label: string; value: number; fullDate: string; dateObj: Date }> = []

    if (selectedRange === "week") {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)
        const nextDay = new Date(date)
        nextDay.setDate(nextDay.getDate() + 1)

        const count = patients.filter(p => {
          const createdAt = new Date(p.created_at)
          return createdAt >= date && createdAt < nextDay
        }).length

        data.push({
          label: date.toLocaleDateString('en-US', { weekday: 'short' }),
          value: count,
          fullDate: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          dateObj: date
        })
      }
    } else if (selectedRange === "month") {
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)
        const nextDay = new Date(date)
        nextDay.setDate(nextDay.getDate() + 1)

        const count = patients.filter(p => {
          const createdAt = new Date(p.created_at)
          return createdAt >= date && createdAt < nextDay
        }).length

        data.push({
          label: date.getDate().toString(),
          value: count,
          fullDate: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          dateObj: date
        })
      }
    } else if (selectedRange === "year") {
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now)
        date.setMonth(date.getMonth() - i)
        date.setDate(1)
        date.setHours(0, 0, 0, 0)
        const nextMonth = new Date(date)
        nextMonth.setMonth(nextMonth.getMonth() + 1)

        const count = patients.filter(p => {
          const createdAt = new Date(p.created_at)
          return createdAt >= date && createdAt < nextMonth
        }).length

        data.push({
          label: date.toLocaleDateString('en-US', { month: 'short' }),
          value: count,
          fullDate: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          dateObj: date
        })
      }
    }

    return data
  }, [patients, selectedRange])

  // Status Distribution for Pie Chart
  const statusDistribution = useMemo(() => [
    { label: 'Pending', value: patients.filter(p => p.status === 'pending').length, color: '#f59e0b' },
    { label: 'Confirmed', value: patients.filter(p => p.status === 'confirmed').length, color: '#3b82f6' },
    { label: 'Completed', value: patients.filter(p => p.status === 'completed').length, color: '#22c55e' },
    { label: 'Cancelled', value: patients.filter(p => p.status === 'cancelled').length, color: '#ef4444' },
  ], [patients])

  const totalPatients = statusDistribution.reduce((sum, item) => sum + item.value, 0)

  // Statistics
  const stats = useMemo(() => {
    const values = growthData.map(d => d.value)
    const total = values.reduce((sum, v) => sum + v, 0)
    const max = Math.max(...values, 1)
    const avg = total / values.length

    const halfIndex = Math.floor(growthData.length / 2)
    const firstHalf = values.slice(0, halfIndex).reduce((sum, v) => sum + v, 0)
    const secondHalf = values.slice(halfIndex).reduce((sum, v) => sum + v, 0)
    const growth = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf * 100) : 0

    return { total, max, avg, growth }
  }, [growthData])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`max-w-[95vw] w-[1300px] h-[85vh] flex flex-col overflow-hidden ${
          isDarkMode ? "bg-gray-900 text-white border-gray-700" : "bg-white"
        }`}
      >
        {/* Header */}
        <DialogHeader className="flex-shrink-0 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className={`h-5 w-5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
              Patient Analytics Dashboard
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={onClose} className="h-7">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Main Content - NO SCROLL */}
        <div className="flex-1 flex flex-col overflow-hidden pb-2">
          {/* Time Range & Stats Row */}
          <div className="flex gap-3 mb-3 flex-shrink-0">
            {/* Time Range Selector */}
            <div className="flex gap-2">
              {(["week", "month", "year"] as TimeRange[]).map((range) => (
                <Button
                  key={range}
                  size="sm"
                  variant={selectedRange === range ? "default" : "outline"}
                  onClick={() => setSelectedRange(range)}
                  className={`h-7 text-xs capitalize ${
                    selectedRange === range ? "bg-blue-600" : isDarkMode ? "border-gray-600" : ""
                  }`}
                >
                  {range}
                </Button>
              ))}
            </div>

            {/* Compact Stats Cards */}
            <div className="flex gap-2 flex-1">
              <Card className={`flex-1 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-blue-50"}`}>
                <CardContent className="p-2 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-gray-500">Total</p>
                    <p className="text-lg font-bold">{stats.total}</p>
                  </div>
                  <Users className="h-5 w-5 opacity-50" />
                </CardContent>
              </Card>

              <Card className={`flex-1 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-green-50"}`}>
                <CardContent className="p-2 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-gray-500">Avg</p>
                    <p className="text-lg font-bold">{stats.avg.toFixed(1)}</p>
                  </div>
                  <Activity className="h-5 w-5 opacity-50" />
                </CardContent>
              </Card>

              <Card className={`flex-1 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-purple-50"}`}>
                <CardContent className="p-2 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-gray-500">Peak</p>
                    <p className="text-lg font-bold">{stats.max}</p>
                  </div>
                  <BarChart3 className="h-5 w-5 opacity-50" />
                </CardContent>
              </Card>

              <Card className={`flex-1 ${stats.growth >= 0 ? (isDarkMode ? "bg-gray-800" : "bg-emerald-50") : (isDarkMode ? "bg-gray-800" : "bg-red-50")}`}>
                <CardContent className="p-2 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-gray-500">Growth</p>
                    <p className={`text-lg font-bold ${stats.growth >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {stats.growth >= 0 ? "+" : ""}{stats.growth.toFixed(1)}%
                    </p>
                  </div>
                  {stats.growth >= 0 ? <TrendingUp className="h-5 w-5 text-emerald-600" /> : <TrendingDown className="h-5 w-5 text-red-600" />}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Charts Grid - 2 Columns */}
          <div className="flex-1 grid grid-cols-2 gap-3 overflow-hidden">
            {/* Left Column: Bar Chart & Line Chart */}
            <div className="flex flex-col gap-3 overflow-hidden">
              {/* Bar Chart */}
              <Card className={`flex-1 overflow-hidden ${isDarkMode ? "bg-gray-800 border-gray-700" : ""}`}>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    Registration Trend (Bar)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 h-[calc(100%-52px)] overflow-y-auto">
                  <TooltipProvider>
                    <div className="space-y-2">
                      {growthData.map((item, index) => {
                        const percentage = stats.max > 0 ? (item.value / stats.max) * 100 : 0
                        return (
                          <Tooltip key={index}>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2 cursor-pointer hover:bg-opacity-50 hover:bg-blue-100 dark:hover:bg-gray-700 rounded px-1 transition-colors">
                                <span className="text-[10px] w-8 text-gray-500">{item.label}</span>
                                <div className={`flex-1 h-5 rounded overflow-hidden ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`}>
                                  <div
                                    className={`h-full transition-all duration-300 ${item.value > stats.avg ? "bg-gradient-to-r from-green-400 to-green-600" : "bg-gradient-to-r from-blue-400 to-blue-600"}`}
                                    style={{ width: `${Math.max(percentage, item.value > 0 ? 5 : 0)}%` }}
                                  />
                                </div>
                                <span className="text-[11px] font-bold w-6 text-right">{item.value}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="bg-gray-900 text-white border-gray-700">
                              <div className="space-y-1">
                                <p className="font-semibold">{item.fullDate}</p>
                                <p className="text-sm">Patients: <span className="font-bold">{item.value}</span></p>
                                <p className="text-xs text-gray-400">
                                  {item.value > stats.avg ? '↑ Above average' : item.value < stats.avg ? '↓ Below average' : '= Average'}
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )
                      })}
                    </div>
                  </TooltipProvider>
                </CardContent>
              </Card>

              {/* Line Chart */}
              <Card className={`flex-1 overflow-hidden ${isDarkMode ? "bg-gray-800 border-gray-700" : ""}`}>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    Trend Line
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 h-[calc(100%-52px)]">
                  <TooltipProvider>
                    <div className="relative h-full">
                      <svg viewBox="0 0 400 150" className="w-full h-full">
                        {/* Grid lines */}
                        <line x1="30" y1="10" x2="30" y2="130" stroke={isDarkMode ? "#374151" : "#e5e7eb"} strokeWidth="1"/>
                        <line x1="30" y1="130" x2="390" y2="130" stroke={isDarkMode ? "#374151" : "#e5e7eb"} strokeWidth="1"/>
                        
                        {/* Y-axis labels */}
                        <text x="20" y="15" fontSize="10" fill={isDarkMode ? "#9ca3af" : "#6b7280"} textAnchor="end">{stats.max}</text>
                        <text x="20" y="75" fontSize="10" fill={isDarkMode ? "#9ca3af" : "#6b7280"} textAnchor="end">{Math.round(stats.max / 2)}</text>
                        <text x="20" y="135" fontSize="10" fill={isDarkMode ? "#9ca3af" : "#6b7280"} textAnchor="end">0</text>
                        
                        {/* Line */}
                        <polyline
                          points={growthData.map((item, i) => {
                            const x = 30 + (i / (growthData.length - 1)) * 360
                            const y = 130 - ((item.value / stats.max) * 120)
                            return `${x},${y}`
                          }).join(' ')}
                          fill="none"
                          stroke={stats.growth >= 0 ? "#22c55e" : "#ef4444"}
                          strokeWidth="2"
                        />
                        
                        {/* Points with hover effect */}
                        {growthData.map((item, i) => {
                          const x = 30 + (i / (growthData.length - 1)) * 360
                          const y = 130 - ((item.value / stats.max) * 120)
                          return (
                            <Tooltip key={i}>
                              <TooltipTrigger asChild>
                                <g className="cursor-pointer">
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r="6"
                                    fill="transparent"
                                    className="hover:fill-blue-200 transition-all"
                                  />
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r="3"
                                    fill={item.value === stats.max ? "#f59e0b" : stats.growth >= 0 ? "#22c55e" : "#ef4444"}
                                    className="pointer-events-none"
                                  />
                                </g>
                              </TooltipTrigger>
                              <TooltipContent className="bg-gray-900 text-white border-gray-700">
                                <div className="space-y-1">
                                  <p className="font-semibold">{item.fullDate}</p>
                                  <p className="text-sm">Registrations: <span className="font-bold">{item.value}</span></p>
                                  {item.value === stats.max && (
                                    <p className="text-xs text-amber-400">🏆 Peak day!</p>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )
                        })}
                        
                        {/* X-axis labels */}
                        {growthData.map((item, i) => {
                          if (i % Math.ceil(growthData.length / 7) === 0 || i === growthData.length - 1) {
                            const x = 30 + (i / (growthData.length - 1)) * 360
                            return (
                              <text key={i} x={x} y="145" fontSize="9" fill={isDarkMode ? "#9ca3af" : "#6b7280"} textAnchor="middle">
                                {item.label}
                              </text>
                            )
                          }
                          return null
                        })}
                      </svg>
                    </div>
                  </TooltipProvider>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Pie Chart & Status Stats */}
            <div className="flex flex-col gap-3 overflow-hidden">
              {/* Pie Chart */}
              <Card className={`flex-1 overflow-hidden ${isDarkMode ? "bg-gray-800 border-gray-700" : ""}`}>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm flex items-center gap-1">
                    <PieChart className="h-4 w-4" />
                    Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 h-[calc(100%-52px)]">
                  <TooltipProvider>
                    <div className="flex items-center justify-center h-full">
                      {totalPatients > 0 ? (
                        <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px]">
                          {statusDistribution.map((item, index) => {
                            const startAngle = statusDistribution.slice(0, index).reduce((sum, d) => sum + (d.value / totalPatients) * 360, 0)
                            const angle = (item.value / totalPatients) * 360
                            const endAngle = startAngle + angle
                            
                            const startRad = (startAngle - 90) * Math.PI / 180
                            const endRad = (endAngle - 90) * Math.PI / 180
                            
                            const x1 = 100 + 80 * Math.cos(startRad)
                            const y1 = 100 + 80 * Math.sin(startRad)
                            const x2 = 100 + 80 * Math.cos(endRad)
                            const y2 = 100 + 80 * Math.sin(endRad)
                            
                            const largeArc = angle > 180 ? 1 : 0
                            
                            if (item.value === 0) return null
                            
                            return (
                              <Tooltip key={index}>
                                <TooltipTrigger asChild>
                                  <g className="cursor-pointer">
                                    <path
                                      d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                      fill={item.color}
                                      opacity="0.9"
                                      className="hover:opacity-100 transition-opacity"
                                    />
                                  </g>
                                </TooltipTrigger>
                                <TooltipContent className="bg-gray-900 text-white border-gray-700">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                      <p className="font-semibold">{item.label}</p>
                                    </div>
                                    <p className="text-sm">Count: <span className="font-bold">{item.value}</span> patients</p>
                                    <p className="text-sm">Percentage: <span className="font-bold">{((item.value / totalPatients) * 100).toFixed(1)}%</span></p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )
                          })}
                          <circle cx="100" cy="100" r="45" fill={isDarkMode ? "#1f2937" : "#ffffff"} />
                          <text x="100" y="95" fontSize="20" fontWeight="bold" fill={isDarkMode ? "#ffffff" : "#000000"} textAnchor="middle">
                            {totalPatients}
                          </text>
                          <text x="100" y="110" fontSize="10" fill={isDarkMode ? "#9ca3af" : "#6b7280"} textAnchor="middle">
                            Total
                          </text>
                        </svg>
                      ) : (
                        <p className="text-gray-500 text-sm">No data</p>
                      )}
                    </div>
                  </TooltipProvider>
                </CardContent>
              </Card>

              {/* Status Stats */}
              <Card className={`flex-1 overflow-hidden ${isDarkMode ? "bg-gray-800 border-gray-700" : ""}`}>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm">Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2">
                  {statusDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{item.value}</span>
                        <Badge variant="secondary" className="text-[9px] h-4 px-1">
                          {totalPatients > 0 ? ((item.value / totalPatients) * 100).toFixed(0) : 0}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

