"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  BarChart3,
  Activity,
  X,
  Download
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Patient } from "@/lib/data-service"

interface PatientGrowthAnalyticsProps {
  patients: Patient[]
  isDarkMode?: boolean
  isOpen: boolean
  onClose: () => void
}

type TimeRange = "day" | "week" | "month" | "year" | "years"

interface GrowthData {
  label: string
  value: number
  date: string
}

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
    const data: GrowthData[] = []

    switch (selectedRange) {
      case "day": {
        // Last 24 hours by hour
        for (let i = 23; i >= 0; i--) {
          const date = new Date(now)
          date.setHours(date.getHours() - i)
          const hourStart = new Date(date)
          hourStart.setMinutes(0, 0, 0)
          const hourEnd = new Date(hourStart)
          hourEnd.setHours(hourEnd.getHours() + 1)

          const count = patients.filter(p => {
            const createdAt = new Date(p.created_at)
            return createdAt >= hourStart && createdAt < hourEnd
          }).length

          data.push({
            label: date.getHours().toString().padStart(2, '0') + ":00",
            value: count,
            date: hourStart.toISOString()
          })
        }
        break
      }

      case "week": {
        // Last 7 days
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
            label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            value: count,
            date: date.toISOString()
          })
        }
        break
      }

      case "month": {
        // Last 30 days
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
            label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: count,
            date: date.toISOString()
          })
        }
        break
      }

      case "year": {
        // Last 12 months
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
            label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            value: count,
            date: date.toISOString()
          })
        }
        break
      }

      case "years": {
        // All years with patient data
        const years = new Set(patients.map(p => new Date(p.created_at).getFullYear()))
        const sortedYears = Array.from(years).sort()
        
        sortedYears.forEach(year => {
          const count = patients.filter(p => {
            return new Date(p.created_at).getFullYear() === year
          }).length

          data.push({
            label: year.toString(),
            value: count,
            date: new Date(year, 0, 1).toISOString()
          })
        })
        break
      }
    }

    return data
  }, [patients, selectedRange])

  // Calculate advanced statistics with data science metrics
  const stats = useMemo(() => {
    const values = growthData.map(d => d.value)
    const currentPeriodCount = values.reduce((sum, v) => sum + v, 0)
    const maxValue = Math.max(...values, 1)
    const minValue = Math.min(...values)
    const avgValue = currentPeriodCount / values.length
    
    // Calculate growth percentage (compare first half vs second half)
    const halfIndex = Math.floor(growthData.length / 2)
    const firstHalf = growthData.slice(0, halfIndex).reduce((sum, d) => sum + d.value, 0)
    const secondHalf = growthData.slice(halfIndex).reduce((sum, d) => sum + d.value, 0)
    const growthPercentage = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf * 100) : 0
    
    // 📊 DATA SCIENCE STATISTICS
    
    // 1. Standard Deviation - measures spread/variability
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avgValue, 2), 0) / values.length
    const stdDev = Math.sqrt(variance)
    
    // 2. Coefficient of Variation - relative variability (std dev as % of mean)
    const coefficientOfVariation = avgValue > 0 ? (stdDev / avgValue) * 100 : 0
    
    // 3. Median - middle value (50th percentile)
    const sortedValues = [...values].sort((a, b) => a - b)
    const median = sortedValues.length % 2 === 0
      ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
      : sortedValues[Math.floor(sortedValues.length / 2)]
    
    // 4. Percentiles (25th, 75th) - quartiles for box plot
    const q1Index = Math.floor(sortedValues.length * 0.25)
    const q3Index = Math.floor(sortedValues.length * 0.75)
    const q1 = sortedValues[q1Index]
    const q3 = sortedValues[q3Index]
    const iqr = q3 - q1 // Interquartile Range
    
    // 5. Z-Scores - identify statistical outliers (>2 or <-2)
    const zScores = values.map(v => stdDev > 0 ? (v - avgValue) / stdDev : 0)
    const outliers = zScores.filter(z => Math.abs(z) > 2).length
    
    // 6. Moving Average (3-period) - smoothed trend line
    const movingAvg = values.map((_, i) => {
      if (i < 2) return null
      return (values[i - 2] + values[i - 1] + values[i]) / 3
    })
    
    // 7. Trend Analysis - linear regression slope
    const n = values.length
    const xValues = Array.from({ length: n }, (_, i) => i)
    const sumX = xValues.reduce((a, b) => a + b, 0)
    const sumY = values.reduce((a, b) => a + b, 0)
    const sumXY = xValues.reduce((sum, x, i) => sum + x * values[i], 0)
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0)
    const slope = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) : 0
    const trendDirection = slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable'
    
    // 8. Consistency Score (0-100) - inverse of coefficient of variation
    const consistencyScore = Math.max(0, Math.min(100, 100 - coefficientOfVariation))
    
    // 9. Peak-to-Average Ratio - how much higher peaks are than average
    const peakRatio = avgValue > 0 ? maxValue / avgValue : 0
    
    return {
      total: currentPeriodCount,
      max: maxValue,
      min: minValue,
      average: avgValue,
      growthPercentage,
      // Advanced metrics
      stdDev,
      variance,
      median,
      q1,
      q3,
      iqr,
      coefficientOfVariation,
      zScores,
      outliers,
      movingAvg,
      slope,
      trendDirection,
      consistencyScore,
      peakRatio
    }
  }, [growthData])

  const handleExport = () => {
    const csvContent = [
      ["Date/Time", "Patient Count"],
      ...growthData.map(d => [d.label, d.value.toString()])
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `patient-growth-${selectedRange}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Status Distribution for Pie Chart
  const statusDistribution = useMemo(() => {
    const counts = {
      pending: patients.filter(p => p.status === 'pending').length,
      confirmed: patients.filter(p => p.status === 'confirmed').length,
      completed: patients.filter(p => p.status === 'completed').length,
      cancelled: patients.filter(p => p.status === 'cancelled').length,
    }
    return counts
  }, [patients])

  const totalPatients = Object.values(statusDistribution).reduce((a, b) => a + b, 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`max-w-[95vw] w-[1400px] h-[85vh] overflow-hidden ${
          isDarkMode ? "bg-gray-900 text-white border-gray-700" : "bg-white"
        }`}
      >
        <DialogHeader className="pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className={`h-5 w-5 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
              <span>Patient Growth Analytics Dashboard</span>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleExport}
                className={`h-8 ${isDarkMode ? "border-gray-600 hover:bg-gray-800" : ""}`}
              >
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className={`h-8 ${isDarkMode ? "hover:bg-gray-800" : ""}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Main Content - No Scroll Container */}
        <div className="h-[calc(85vh-80px)] overflow-hidden">
          {/* Time Range Selector */}
          <div className="flex gap-2 mb-3">
            {(["day", "week", "month", "year"] as TimeRange[]).map((range) => (
              <Button
                key={range}
                size="sm"
                variant={selectedRange === range ? "default" : "outline"}
                onClick={() => setSelectedRange(range)}
                className={`h-7 text-xs ${
                  selectedRange === range
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : isDarkMode
                      ? "border-gray-600 hover:bg-gray-800"
                      : ""
                }`}
              >
                {range === "day" && "24 Hours"}
                {range === "week" && "7 Days"}
                {range === "month" && "30 Days"}
                {range === "year" && "12 Months"}
              </Button>
            ))}
          </div>

          {/* Compact Statistics Cards */}
          <div className="grid grid-cols-4 gap-3 mb-3">
            <Card className={`${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gradient-to-br from-blue-50 to-blue-100"}`}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-[10px] font-medium ${isDarkMode ? "text-gray-400" : "text-blue-600"}`}>Total</p>
                    <p className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-blue-900"}`}>{stats.total}</p>
                  </div>
                  <Users className={`h-6 w-6 ${isDarkMode ? "text-blue-400" : "text-blue-600"}`} />
                </div>
              </CardContent>
            </Card>

            <Card className={`${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gradient-to-br from-green-50 to-green-100"}`}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-[10px] font-medium ${isDarkMode ? "text-gray-400" : "text-green-600"}`}>Avg</p>
                    <p className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-green-900"}`}>{stats.average.toFixed(1)}</p>
                  </div>
                  <Activity className={`h-6 w-6 ${isDarkMode ? "text-green-400" : "text-green-600"}`} />
                </div>
              </CardContent>
            </Card>

            <Card className={`${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gradient-to-br from-purple-50 to-purple-100"}`}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-[10px] font-medium ${isDarkMode ? "text-gray-400" : "text-purple-600"}`}>Peak</p>
                    <p className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-purple-900"}`}>{stats.max}</p>
                  </div>
                  <BarChart3 className={`h-6 w-6 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} />
                </div>
              </CardContent>
            </Card>

            <Card className={stats.growthPercentage >= 0 ? (isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gradient-to-br from-emerald-50 to-emerald-100") : (isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gradient-to-br from-red-50 to-red-100")}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-[10px] font-medium ${isDarkMode ? "text-gray-400" : stats.growthPercentage >= 0 ? "text-emerald-600" : "text-red-600"}`}>Growth</p>
                    <p className={`text-xl font-bold ${isDarkMode ? "text-white" : stats.growthPercentage >= 0 ? "text-emerald-900" : "text-red-900"}`}>{stats.growthPercentage >= 0 ? "+" : ""}{stats.growthPercentage.toFixed(1)}%</p>
                  </div>
                  {stats.growthPercentage >= 0 ? <TrendingUp className={`h-6 w-6 ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`} /> : <TrendingDown className={`h-6 w-6 ${isDarkMode ? "text-red-400" : "text-red-600"}`} />}
                </div>
              </CardContent>
            </Card>
          </div>

        {/* Chart */}
        <Card className={`mt-6 ${isDarkMode ? "bg-gray-800 border-gray-700" : ""}`}>
          <CardHeader>
            <CardTitle className={`text-lg flex items-center gap-2 ${isDarkMode ? "text-white" : ""}`}>
              <Calendar className="h-5 w-5" />
              Patient Registration Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {growthData.map((item, index) => {
                const percentage = stats.max > 0 ? (item.value / stats.max) * 100 : 0
                const isHighest = item.value === stats.max && item.value > 0
                
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className={`font-medium min-w-[100px] ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {item.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                          {item.value}
                        </span>
                        {isHighest && (
                          <Badge variant="secondary" className="text-xs bg-yellow-500 text-white">
                            Peak
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className={`w-full h-8 rounded-lg overflow-hidden ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-200"
                    }`}>
                      <div
                        className={`h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-3 ${
                          isHighest
                            ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                            : item.value > stats.average
                            ? "bg-gradient-to-r from-green-400 to-green-600"
                            : item.value > 0
                            ? "bg-gradient-to-r from-blue-400 to-blue-600"
                            : "bg-gray-400"
                        }`}
                        style={{ width: `${Math.max(percentage, item.value > 0 ? 5 : 0)}%` }}
                      >
                        {item.value > 0 && (
                          <span className="text-white text-xs font-semibold">
                            {percentage.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary */}
            <div className={`mt-6 p-4 rounded-lg ${
              isDarkMode ? "bg-gray-700" : "bg-gray-50"
            }`}>
              <h4 className={`font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                📊 Summary
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Time Period</p>
                  <p className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {selectedRange === "day" && "Last 24 Hours"}
                    {selectedRange === "week" && "Last 7 Days"}
                    {selectedRange === "month" && "Last 30 Days"}
                    {selectedRange === "year" && "Last 12 Months"}
                    {selectedRange === "years" && "All Time"}
                  </p>
                </div>
                <div>
                  <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Data Points</p>
                  <p className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {growthData.length}
                  </p>
                </div>
                <div>
                  <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Avg per Period</p>
                  <p className={`font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {stats.average.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Trend</p>
                  <p className={`font-semibold ${
                    stats.growthPercentage >= 0 
                      ? isDarkMode ? "text-green-400" : "text-green-600"
                      : isDarkMode ? "text-red-400" : "text-red-600"
                  }`}>
                    {stats.growthPercentage >= 0 ? "📈 Growing" : "📉 Declining"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 🔬 ADVANCED DATA SCIENCE STATISTICS */}
        <Card className={`mt-6 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-gradient-to-br from-indigo-50 to-purple-50"}`}>
          <CardHeader>
            <CardTitle className={`text-lg flex items-center gap-2 ${isDarkMode ? "text-white" : "text-indigo-900"}`}>
              <Activity className="h-5 w-5" />
              🔬 Advanced Statistical Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Statistical Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Median */}
              <div className={`p-4 rounded-lg border-2 ${
                isDarkMode ? "bg-gray-900 border-indigo-500/30" : "bg-white border-indigo-200"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold uppercase tracking-wide ${
                    isDarkMode ? "text-indigo-400" : "text-indigo-600"
                  }`}>Median</span>
                  <Badge variant="secondary" className="text-xs">
                    50th %ile
                  </Badge>
                </div>
                <p className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-indigo-900"}`}>
                  {stats.median.toFixed(1)}
                </p>
                <p className="text-xs mt-1 text-gray-500">Middle value (robust to outliers)</p>
              </div>

              {/* Standard Deviation */}
              <div className={`p-4 rounded-lg border-2 ${
                isDarkMode ? "bg-gray-900 border-purple-500/30" : "bg-white border-purple-200"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold uppercase tracking-wide ${
                    isDarkMode ? "text-purple-400" : "text-purple-600"
                  }`}>Std Deviation (σ)</span>
                  <Badge variant="secondary" className="text-xs">
                    Spread
                  </Badge>
                </div>
                <p className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-purple-900"}`}>
                  ±{stats.stdDev.toFixed(2)}
                </p>
                <p className="text-xs mt-1 text-gray-500">Data variability from mean</p>
              </div>

              {/* Consistency Score */}
              <div className={`p-4 rounded-lg border-2 ${
                isDarkMode ? "bg-gray-900 border-emerald-500/30" : "bg-white border-emerald-200"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold uppercase tracking-wide ${
                    isDarkMode ? "text-emerald-400" : "text-emerald-600"
                  }`}>Consistency</span>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      stats.consistencyScore >= 70 ? "bg-emerald-500 text-white" :
                      stats.consistencyScore >= 40 ? "bg-yellow-500 text-white" :
                      "bg-red-500 text-white"
                    }`}
                  >
                    {stats.consistencyScore >= 70 ? "High" : stats.consistencyScore >= 40 ? "Medium" : "Low"}
                  </Badge>
                </div>
                <p className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-emerald-900"}`}>
                  {stats.consistencyScore.toFixed(0)}%
                </p>
                <div className="w-full bg-gray-300 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      stats.consistencyScore >= 70 ? "bg-emerald-500" :
                      stats.consistencyScore >= 40 ? "bg-yellow-500" :
                      "bg-red-500"
                    }`}
                    style={{ width: `${stats.consistencyScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Distribution Analysis - Box Plot Style */}
            <div className={`p-4 rounded-lg mb-4 ${
              isDarkMode ? "bg-gray-900" : "bg-white border border-gray-200"
            }`}>
              <h5 className={`text-sm font-semibold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                📊 Distribution Analysis (Box Plot)
              </h5>
              
              {/* Visual Box Plot */}
              <div className="relative h-24 flex items-center">
                {/* Background line */}
                <div className="absolute w-full h-1 bg-gray-300 rounded"></div>
                
                {/* Min marker */}
                <div 
                  className="absolute w-1 h-8 bg-blue-400 rounded"
                  style={{ left: '0%' }}
                  title={`Min: ${stats.min}`}
                >
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold whitespace-nowrap">
                    {stats.min}
                  </span>
                </div>
                
                {/* Q1 marker */}
                <div 
                  className="absolute w-1 h-12 bg-green-400 rounded"
                  style={{ left: `${(stats.q1 / stats.max) * 100}%` }}
                  title={`Q1 (25th): ${stats.q1}`}
                >
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-semibold whitespace-nowrap">
                    Q1: {stats.q1.toFixed(1)}
                  </span>
                </div>
                
                {/* Median marker (thicker) */}
                <div 
                  className="absolute w-2 h-16 bg-yellow-500 rounded"
                  style={{ left: `${(stats.median / stats.max) * 100}%` }}
                  title={`Median: ${stats.median}`}
                >
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap">
                    Median: {stats.median.toFixed(1)}
                  </span>
                </div>
                
                {/* Mean marker (diamond) */}
                <div 
                  className="absolute w-3 h-3 bg-red-500 rotate-45"
                  style={{ left: `${(stats.average / stats.max) * 100}%`, transform: 'translateX(-50%) rotate(45deg)' }}
                  title={`Mean: ${stats.average}`}
                >
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-semibold whitespace-nowrap rotate-[-45deg]">
                    μ: {stats.average.toFixed(1)}
                  </span>
                </div>
                
                {/* Q3 marker */}
                <div 
                  className="absolute w-1 h-12 bg-green-400 rounded"
                  style={{ left: `${(stats.q3 / stats.max) * 100}%` }}
                  title={`Q3 (75th): ${stats.q3}`}
                >
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-semibold whitespace-nowrap">
                    Q3: {stats.q3.toFixed(1)}
                  </span>
                </div>
                
                {/* Max marker */}
                <div 
                  className="absolute w-1 h-8 bg-purple-400 rounded"
                  style={{ right: '0%' }}
                  title={`Max: ${stats.max}`}
                >
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-semibold whitespace-nowrap">
                    {stats.max}
                  </span>
                </div>
                
                {/* IQR Box */}
                <div 
                  className={`absolute h-16 border-2 rounded ${
                    isDarkMode ? "bg-green-500/20 border-green-400" : "bg-green-100 border-green-500"
                  }`}
                  style={{ 
                    left: `${(stats.q1 / stats.max) * 100}%`,
                    width: `${((stats.q3 - stats.q1) / stats.max) * 100}%`
                  }}
                  title={`IQR: ${stats.iqr.toFixed(2)}`}
                />
              </div>
              
              <div className="grid grid-cols-5 gap-2 mt-8 text-xs">
                <div className="text-center">
                  <p className="font-semibold text-blue-600">Min</p>
                  <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>{stats.min}</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-green-600">Q1 (25%)</p>
                  <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>{stats.q1.toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-yellow-600">Median</p>
                  <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>{stats.median.toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-green-600">Q3 (75%)</p>
                  <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>{stats.q3.toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-purple-600">Max</p>
                  <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>{stats.max}</p>
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-900" : "bg-white border border-gray-200"}`}>
                <p className="text-xs text-gray-500 mb-1">Range</p>
                <p className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {(stats.max - stats.min).toFixed(1)}
                </p>
              </div>
              
              <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-900" : "bg-white border border-gray-200"}`}>
                <p className="text-xs text-gray-500 mb-1">IQR (Q3-Q1)</p>
                <p className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {stats.iqr.toFixed(2)}
                </p>
              </div>
              
              <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-900" : "bg-white border border-gray-200"}`}>
                <p className="text-xs text-gray-500 mb-1">CV (%)</p>
                <p className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  {stats.coefficientOfVariation.toFixed(1)}%
                </p>
              </div>
              
              <div className={`p-3 rounded-lg ${isDarkMode ? "bg-gray-900" : "bg-white border border-gray-200"}`}>
                <p className="text-xs text-gray-500 mb-1">Outliers</p>
                <p className={`text-xl font-bold ${
                  stats.outliers > 0 ? "text-red-500" : isDarkMode ? "text-white" : "text-gray-900"
                }`}>
                  {stats.outliers}
                </p>
              </div>
            </div>

            {/* Trend Analysis */}
            <div className={`mt-4 p-4 rounded-lg ${
              isDarkMode ? "bg-gray-900" : "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200"
            }`}>
              <h5 className={`text-sm font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                📈 Trend Analysis (Linear Regression)
              </h5>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Slope</p>
                  <p className={`text-lg font-bold ${
                    stats.slope > 0.1 ? "text-green-600" : 
                    stats.slope < -0.1 ? "text-red-600" : 
                    "text-yellow-600"
                  }`}>
                    {stats.slope.toFixed(4)}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Direction</p>
                  <Badge 
                    className={`${
                      stats.trendDirection === 'increasing' ? 'bg-green-500 text-white' :
                      stats.trendDirection === 'decreasing' ? 'bg-red-500 text-white' :
                      'bg-yellow-500 text-white'
                    }`}
                  >
                    {stats.trendDirection === 'increasing' ? '📈 Increasing' :
                     stats.trendDirection === 'decreasing' ? '📉 Decreasing' :
                     '➡️ Stable'}
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Peak Ratio</p>
                  <p className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    {stats.peakRatio.toFixed(2)}x
                  </p>
                </div>
              </div>
            </div>

            {/* Statistical Insights */}
            <div className={`mt-4 p-4 rounded-lg border-l-4 ${
              isDarkMode ? "bg-blue-900/20 border-blue-400" : "bg-blue-50 border-blue-500"
            }`}>
              <h5 className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
                isDarkMode ? "text-blue-400" : "text-blue-900"
              }`}>
                💡 Statistical Insights
              </h5>
              <ul className="space-y-1 text-xs">
                <li className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                  • <strong>Consistency:</strong> {stats.consistencyScore >= 70 ? 'High consistency in patient registrations' : stats.consistencyScore >= 40 ? 'Moderate variability in registrations' : 'High variability - consider investigating peaks/troughs'}
                </li>
                <li className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                  • <strong>Distribution:</strong> {Math.abs(stats.median - stats.average) < 0.5 ? 'Symmetric distribution (mean ≈ median)' : stats.median < stats.average ? 'Right-skewed (mean > median) - occasional high spikes' : 'Left-skewed (mean < median) - occasional low dips'}
                </li>
                <li className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                  • <strong>Outliers:</strong> {stats.outliers === 0 ? 'No statistical outliers detected (all values within 2σ)' : `${stats.outliers} outlier(s) detected (>2 standard deviations from mean)`}
                </li>
                <li className={isDarkMode ? "text-gray-300" : "text-gray-700"}>
                  • <strong>Trend:</strong> {stats.trendDirection === 'increasing' ? `Positive growth trajectory (slope: ${stats.slope.toFixed(4)})` : stats.trendDirection === 'decreasing' ? `Declining trajectory (slope: ${stats.slope.toFixed(4)})` : 'Stable pattern with no clear trend'}
                </li>
              </ul>
            </div>
          </CardContent>
             </Card>
           </div>
       </DialogContent>
    </Dialog>
  )
}

// Mini Icon Component for Dashboard
export function PatientGrowthIcon({ 
  onClick, 
  isDarkMode = false 
}: { 
  onClick: () => void
  isDarkMode?: boolean 
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative p-1.5 rounded-full transition-all duration-200 hover:scale-110 ${
        isDarkMode 
          ? "hover:bg-white/10 active:bg-white/20" 
          : "hover:bg-blue-100 active:bg-blue-200"
      }`}
      title="View Patient Growth Analytics"
      aria-label="View Patient Growth Analytics"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-colors ${
          isDarkMode ? "text-white group-hover:text-blue-400" : "text-blue-600 group-hover:text-blue-700"
        }`}
      >
        {/* Bar Chart Icon */}
        <path
          d="M3 20h18M7 20V10M12 20V4M17 20v-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Trending Up Arrow */}
        <path
          d="M19 8l-3-3m0 0l-3 3m3-3v6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />
      </svg>
      
      {/* Tooltip */}
      <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none ${
        isDarkMode ? "bg-gray-700 text-white" : "bg-gray-900 text-white"
      }`}>
        Growth Analytics
      </div>
    </button>
  )
}

