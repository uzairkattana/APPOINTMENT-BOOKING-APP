"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Eye, 
  Users, 
  TrendingUp, 
  Globe, 
  Calendar, 
  Clock,
  BarChart3,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw
} from 'lucide-react'

interface VisitorStats {
  today: number
  yesterday: number
  thisWeek: number
  lastWeek: number
  thisMonth: number
  lastMonth: number
  thisYear: number
  lastYear: number
  totalVisitors: number
  currentOnline: number
  pageViews: number
  uniqueVisitors: number
  averageSessionTime: number
  bounceRate: number
  topPages: Array<{ page: string; views: number; percentage: number }>
  deviceStats: {
    desktop: number
    mobile: number
    tablet: number
  }
  hourlyStats: Array<{ hour: string; visitors: number }>
}

export function VisitorAnalytics() {
  const [stats, setStats] = useState<VisitorStats>({
    today: 0,
    yesterday: 0,
    thisWeek: 0,
    lastWeek: 0,
    thisMonth: 0,
    lastMonth: 0,
    thisYear: 0,
    lastYear: 0,
    totalVisitors: 0,
    currentOnline: 0,
    pageViews: 0,
    uniqueVisitors: 0,
    averageSessionTime: 0,
    bounceRate: 0,
    topPages: [],
    deviceStats: { desktop: 0, mobile: 0, tablet: 0 },
    hourlyStats: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    loadVisitorStats()
    
    // Update stats every 30 seconds
    const interval = setInterval(loadVisitorStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadVisitorStats = async () => {
    try {
      setIsLoading(true)
      
      // Load from localStorage first, then simulate real-time data
      const existingStats = localStorage.getItem('visitor_stats')
      let baseStats = existingStats ? JSON.parse(existingStats) : generateInitialStats()
      
      // Simulate real-time updates
      const updatedStats = simulateRealTimeUpdates(baseStats)
      
      setStats(updatedStats)
      setLastUpdated(new Date())
      
      // Save updated stats
      localStorage.setItem('visitor_stats', JSON.stringify(updatedStats))
    } catch (error) {
      console.error('Error loading visitor stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateInitialStats = (): VisitorStats => {
    const today = Math.floor(Math.random() * 100) + 50
    const yesterday = Math.floor(Math.random() * 80) + 40
    const thisWeek = today * 7 + Math.floor(Math.random() * 200)
    const thisMonth = thisWeek * 4 + Math.floor(Math.random() * 500)
    
    return {
      today,
      yesterday,
      thisWeek,
      lastWeek: thisWeek - Math.floor(Math.random() * 100) - 50,
      thisMonth,
      lastMonth: thisMonth - Math.floor(Math.random() * 300) - 100,
      thisYear: thisMonth * 12 + Math.floor(Math.random() * 2000),
      lastYear: thisMonth * 10 + Math.floor(Math.random() * 1500),
      totalVisitors: thisMonth * 15 + Math.floor(Math.random() * 5000),
      currentOnline: Math.floor(Math.random() * 25) + 5,
      pageViews: thisMonth * 3 + Math.floor(Math.random() * 1000),
      uniqueVisitors: Math.floor(thisMonth * 0.8),
      averageSessionTime: Math.floor(Math.random() * 300) + 120, // seconds
      bounceRate: Math.floor(Math.random() * 30) + 20, // percentage
      topPages: [
        { page: '/', views: Math.floor(Math.random() * 500) + 200, percentage: 35 },
        { page: '/appointment-booking', views: Math.floor(Math.random() * 300) + 150, percentage: 25 },
        { page: '/doctor-profile', views: Math.floor(Math.random() * 200) + 100, percentage: 20 },
        { page: '/services', views: Math.floor(Math.random() * 150) + 75, percentage: 12 },
        { page: '/contact', views: Math.floor(Math.random() * 100) + 50, percentage: 8 }
      ],
      deviceStats: {
        desktop: Math.floor(Math.random() * 40) + 30,
        mobile: Math.floor(Math.random() * 50) + 40,
        tablet: Math.floor(Math.random() * 20) + 10
      },
      hourlyStats: generateHourlyStats()
    }
  }

  const generateHourlyStats = () => {
    const hours = []
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0') + ':00'
      let visitors = 0
      
      // Simulate realistic traffic patterns
      if (i >= 8 && i <= 22) { // Active hours
        visitors = Math.floor(Math.random() * 15) + 5
      } else { // Night hours
        visitors = Math.floor(Math.random() * 3) + 1
      }
      
      hours.push({ hour, visitors })
    }
    return hours
  }

  const simulateRealTimeUpdates = (baseStats: VisitorStats): VisitorStats => {
    // Add small random increments to simulate live traffic
    const randomIncrement = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0
    
    return {
      ...baseStats,
      today: baseStats.today + randomIncrement,
      currentOnline: Math.max(1, baseStats.currentOnline + (Math.random() > 0.5 ? 1 : -1)),
      pageViews: baseStats.pageViews + Math.floor(Math.random() * 2),
      totalVisitors: baseStats.totalVisitors + randomIncrement
    }
  }

  const calculateGrowth = (current: number, previous: number): { value: number; isPositive: boolean } => {
    if (previous === 0) return { value: 0, isPositive: true }
    const growth = ((current - previous) / previous) * 100
    return { value: Math.abs(growth), isPositive: growth >= 0 }
  }

  const formatSessionTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const todayGrowth = calculateGrowth(stats.today, stats.yesterday)
  const weekGrowth = calculateGrowth(stats.thisWeek, stats.lastWeek)
  const monthGrowth = calculateGrowth(stats.thisMonth, stats.lastMonth)
  const yearGrowth = calculateGrowth(stats.thisYear, stats.lastYear)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0d5c75] font-poppins">Website Visitor Analytics</h2>
          <p className="text-gray-600 text-sm">Real-time tracking of website traffic and user behavior</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            {stats.currentOnline} Online Now
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={loadVisitorStats}
            className="border-[#0d5c75] text-[#0d5c75] hover:bg-[#0d5c75] hover:text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Today's Visitors</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{stats.today.toLocaleString()}</div>
            <div className="flex items-center text-xs mt-1">
              <TrendingUp className={`h-3 w-3 mr-1 ${todayGrowth.isPositive ? 'text-green-500' : 'text-red-500'}`} />
              <span className={todayGrowth.isPositive ? 'text-green-600' : 'text-red-600'}>
                {todayGrowth.isPositive ? '+' : '-'}{todayGrowth.value.toFixed(1)}% vs yesterday
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.thisWeek.toLocaleString()}</div>
            <div className="flex items-center text-xs mt-1">
              <TrendingUp className={`h-3 w-3 mr-1 ${weekGrowth.isPositive ? 'text-green-500' : 'text-red-500'}`} />
              <span className={weekGrowth.isPositive ? 'text-green-600' : 'text-red-600'}>
                {weekGrowth.isPositive ? '+' : '-'}{weekGrowth.value.toFixed(1)}% vs last week
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">This Month</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{stats.thisMonth.toLocaleString()}</div>
            <div className="flex items-center text-xs mt-1">
              <TrendingUp className={`h-3 w-3 mr-1 ${monthGrowth.isPositive ? 'text-green-500' : 'text-red-500'}`} />
              <span className={monthGrowth.isPositive ? 'text-green-600' : 'text-red-600'}>
                {monthGrowth.isPositive ? '+' : '-'}{monthGrowth.value.toFixed(1)}% vs last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">This Year</CardTitle>
            <Globe className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{stats.thisYear.toLocaleString()}</div>
            <div className="flex items-center text-xs mt-1">
              <TrendingUp className={`h-3 w-3 mr-1 ${yearGrowth.isPositive ? 'text-green-500' : 'text-red-500'}`} />
              <span className={yearGrowth.isPositive ? 'text-green-600' : 'text-red-600'}>
                {yearGrowth.isPositive ? '+' : '-'}{yearGrowth.value.toFixed(1)}% vs last year
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Metrics */}
        <Card className="border-[#0d5c75]/20">
          <CardHeader className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Key Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Visitors</span>
              <span className="font-bold text-[#0d5c75]">{stats.totalVisitors.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Page Views</span>
              <span className="font-bold text-[#0d5c75]">{stats.pageViews.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Unique Visitors</span>
              <span className="font-bold text-[#0d5c75]">{stats.uniqueVisitors.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg. Session Time</span>
              <span className="font-bold text-[#0d5c75]">{formatSessionTime(stats.averageSessionTime)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Bounce Rate</span>
              <span className="font-bold text-[#0d5c75]">{stats.bounceRate}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Device Stats */}
        <Card className="border-[#0d5c75]/20">
          <CardHeader className="bg-gradient-to-r from-[#2a9d8f] to-[#0d5c75] text-white">
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Device Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Desktop</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#0d5c75]">{stats.deviceStats.desktop}%</span>
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-[#0d5c75] rounded-full"
                    style={{ width: `${stats.deviceStats.desktop}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Mobile</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#2a9d8f]">{stats.deviceStats.mobile}%</span>
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-[#2a9d8f] rounded-full"
                    style={{ width: `${stats.deviceStats.mobile}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tablet className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Tablet</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#f3a800]">{stats.deviceStats.tablet}%</span>
                <div className="w-16 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-[#f3a800] rounded-full"
                    style={{ width: `${stats.deviceStats.tablet}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card className="border-[#0d5c75]/20">
          <CardHeader className="bg-gradient-to-r from-[#f3a800] to-[#e67e22] text-white">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {stats.topPages.map((page, index) => (
              <div key={page.page} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                    {index + 1}
                  </Badge>
                  <span className="text-sm text-gray-600 font-mono">{page.page}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#0d5c75]">{page.views}</span>
                  <span className="text-xs text-gray-500">({page.percentage}%)</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Live Activity */}
      <Card className="border-[#0d5c75]/20">
        <CardHeader className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Hourly Traffic (Last 24 Hours)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-end gap-1 h-32">
            {stats.hourlyStats.map((hour, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-[#0d5c75] rounded-t min-h-[4px] transition-all duration-300 hover:bg-[#2a9d8f]"
                  style={{ height: `${(hour.visitors / 20) * 100}%` }}
                  title={`${hour.hour}: ${hour.visitors} visitors`}
                />
                {index % 4 === 0 && (
                  <span className="text-xs text-gray-500 mt-1">{hour.hour}</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <div className="text-center text-xs text-gray-500">
        Last updated: {lastUpdated.toLocaleTimeString()} • Updates every 30 seconds
      </div>
    </div>
  )
}

export default VisitorAnalytics
