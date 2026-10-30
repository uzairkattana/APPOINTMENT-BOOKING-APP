"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Eye, 
  Users, 
  Clock, 
  MousePointer, 
  TrendingUp, 
  TrendingDown,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Download,
  RefreshCw,
  Calendar,
  ArrowUp,
  ArrowDown,
  Activity,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  FileText,
  Zap,
  MapPin,
  Flag,
  Timer,
  Gauge,
  Wifi,
  Database,
  TrendingUp as Trending
} from "lucide-react"
import { LineChart as RechartsLineChart, BarChart as RechartsBarChart, PieChart as RechartsPieChart, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, Bar, Pie, AreaChart, Area } from 'recharts'
import Image from "next/image"

interface AnalyticsData {
  activeVisitors: number
  totalPageViews: number
  uniqueVisitors: number
  avgSessionDuration: number
  bounceRate: number
  topPages: Array<{ page: string; views: number }>
  enhancedPageStats: Array<{ 
    page: string; 
    views: number; 
    avgTimeOnPage: number; 
    bounceRate: number; 
    avgLoadTime: number;
    totalTimeSpent: number;
  }>
  trafficSources: Array<{ source: string; visitors: number }>
  deviceStats: Array<{ 
    type: string; 
    count: number; 
    percentage: number;
    browsers: Array<{ browser: string; count: number }>;
    operatingSystems: Array<{ os: string; count: number }>;
  }>
  browserStats: Array<{ browser: string; count: number; percentage: number }>
  countryStats: Array<{ 
    country: string; 
    visitors: number; 
    percentage: number;
    cities: Array<{ city: string; visitors: number }>;
  }>
  locationStats: Array<{ 
    country: string; 
    visitors: number; 
    percentage: number;
    cities: Array<{ city: string; visitors: number }>;
  }>
  performanceInsights: {
    avgPageLoadTime: number;
    slowestPages: Array<{ page: string; loadTime: number }>;
    webVitals: {
      lcp: number;
      fid: number;
      cls: number;
      ttfb: number;
      fcp: number;
    } | null;
  }
  hourlyData: Array<{ hour: number; time: string; pageViews: number; uniqueVisitors: number }>
  recentActivity: Array<{ 
    timestamp: string; 
    page: string; 
    title: string; 
    referrer: string; 
    device: any; 
    visitorId: string;
    location?: any;
    performance?: any;
  }>
  totalSessions: number
  newVisitors: number
  returningVisitors: number
}

export default function WebsiteAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('24h')
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/stats?timeframe=${timeframe}`)
      const data = await response.json()
      setAnalyticsData(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  // Initialize and set up real-time updates
  useEffect(() => {
    fetchAnalytics()
    
    // Auto-refresh every 30 seconds for real-time data
    const interval = setInterval(fetchAnalytics, 30000)
    
    return () => clearInterval(interval)
  }, [timeframe])

  // Colors for charts
  const chartColors = ['#0d5c75', '#2a9d8f', '#e76f51', '#f4a261', '#e9c46a', '#264653']

  // Export functionality
  const exportData = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      const response = await fetch(`/api/analytics/export?format=${format}&timeframe=${timeframe}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const extension = format === 'excel' ? 'xlsx' : format === 'pdf' ? 'html' : format
      a.download = `website-analytics-${timeframe}.${extension}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  // Get country flag emoji
  const getCountryFlag = (countryCode: string) => {
    const flagMap: Record<string, string> = {
      'US': '🇺🇸', 'CA': '🇨🇦', 'GB': '🇬🇧', 'DE': '🇩🇪', 'FR': '🇫🇷',
      'IT': '🇮🇹', 'ES': '🇪🇸', 'NL': '🇳🇱', 'AU': '🇦🇺', 'JP': '🇯🇵',
      'CN': '🇨🇳', 'IN': '🇮🇳', 'BR': '🇧🇷', 'MX': '🇲🇽', 'RU': '🇷🇺',
      'KR': '🇰🇷', 'SG': '🇸🇬', 'HK': '🇭🇰', 'TW': '🇹🇼', 'TH': '🇹🇭',
      'Unknown': '🌍'
    }
    
    return flagMap[countryCode] || '🌍'
  }

  // Performance score calculation
  const getPerformanceScore = (webVitals: any) => {
    if (!webVitals) return 0
    
    let score = 100
    
    // LCP (Largest Contentful Paint) - Good: <2.5s, Poor: >4s
    if (webVitals.lcp > 4000) score -= 25
    else if (webVitals.lcp > 2500) score -= 10
    
    // FID (First Input Delay) - Good: <100ms, Poor: >300ms
    if (webVitals.fid > 300) score -= 25
    else if (webVitals.fid > 100) score -= 10
    
    // CLS (Cumulative Layout Shift) - Good: <0.1, Poor: >0.25
    if (webVitals.cls > 0.25) score -= 25
    else if (webVitals.cls > 0.1) score -= 10
    
    // TTFB (Time to First Byte) - Good: <800ms, Poor: >1800ms
    if (webVitals.ttfb > 1800) score -= 15
    else if (webVitals.ttfb > 800) score -= 8
    
    return Math.max(0, score)
  }

  if (loading && !analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-[#FEFCF8] p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="h-8 w-8 animate-spin text-[#0d5c75]" />
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-[#FEFCF8] p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 relative flex-shrink-0">
            <Image
              src="/images/gonstead-chiropractic-logo-new.png"
                alt="Gonstead Chiropractic Logo"
                fill
                className="object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/images/gonstead-logo-new.png";
                }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#0d5c75] font-poppins flex items-center gap-3">
                <TrendingUp className="h-8 w-8" />
                Website Visitor Analytics
                <Badge variant="secondary" className="bg-green-100 text-green-700 px-2 py-1">
                  <Activity className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </h1>
              <p className="text-gray-600 mt-2 font-open-sans">
                Real-time website performance and visitor tracking dashboard
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {lastUpdated.toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="6h">Last 6 Hours</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={fetchAnalytics}
              disabled={loading}
              className="bg-[#0d5c75] hover:bg-[#0d5c75]/90"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            
            <Button variant="outline" onClick={() => exportData('csv')}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Active Visitors</CardTitle>
              <Activity className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-[#0d5c75]">
                {analyticsData?.activeVisitors || 0}
              </span>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                Live
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-1">Currently browsing</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Page Views</CardTitle>
              <Eye className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-[#0d5c75]">
                {analyticsData?.totalPageViews?.toLocaleString() || 0}
              </span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">In selected timeframe</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Unique Visitors</CardTitle>
              <Users className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-[#0d5c75]">
                {analyticsData?.uniqueVisitors || 0}
              </span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Individual users</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Avg. Session</CardTitle>
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-[#0d5c75]">
                {Math.floor((analyticsData?.avgSessionDuration || 0) / 60)}:{((analyticsData?.avgSessionDuration || 0) % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Minutes:seconds</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Bounce Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-[#0d5c75]">
                {analyticsData?.bounceRate?.toFixed(1) || 0}%
              </span>
              <div className={`flex items-center gap-1 ${(analyticsData?.bounceRate || 0) < 50 ? 'text-green-500' : 'text-red-500'}`}>
                {(analyticsData?.bounceRate || 0) < 50 ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {(analyticsData?.bounceRate || 0) < 50 ? 'Good' : 'High'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              New vs Returning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">New Visitors</span>
                <span className="font-semibold">{analyticsData?.newVisitors || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Returning</span>
                <span className="font-semibold">{analyticsData?.returningVisitors || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-[#0d5c75]">
              {analyticsData?.totalSessions || 0}
            </span>
            <p className="text-xs text-gray-500 mt-1">User sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="countries" className="flex items-center gap-2">
            <Flag className="h-4 w-4" />
            Countries
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="traffic" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Traffic
          </TabsTrigger>
          <TabsTrigger value="devices" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Devices
          </TabsTrigger>
          <TabsTrigger value="pages" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Pages
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Real-time
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Page Views Trend */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Page Views Trend
                </CardTitle>
                <CardDescription>Hourly breakdown of page views and unique visitors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={analyticsData?.hourlyData || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="hour" 
                        stroke="#666"
                        fontSize={12}
                        tickFormatter={(hour) => `${hour}:00`}
                      />
                      <YAxis stroke="#666" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        labelFormatter={(hour) => `${hour}:00`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="pageViews" 
                        stroke="#0d5c75" 
                        strokeWidth={3}
                        name="Page Views"
                        dot={{ fill: '#0d5c75', strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="uniqueVisitors" 
                        stroke="#2a9d8f" 
                        strokeWidth={3}
                        name="Unique Visitors"
                        dot={{ fill: '#2a9d8f', strokeWidth: 2, r: 4 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Traffic Sources */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Traffic Sources
                </CardTitle>
                <CardDescription>Where your visitors are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={analyticsData?.trafficSources || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        dataKey="visitors"
                        nameKey="source"
                      >
                        {(analyticsData?.trafficSources || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Countries Tab */}
        <TabsContent value="countries" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Countries Distribution */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5" />
                  Visitor Countries
                </CardTitle>
                <CardDescription>Geographic distribution of your visitors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(analyticsData?.countryStats || []).slice(0, 10).map((country, index) => (
                    <div key={country.country} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {getCountryFlag(country.country)}
                        </span>
                        <div>
                          <span className="font-medium">{country.country}</span>
                          <p className="text-xs text-gray-500">
                            {country.cities.length > 0 && `Top city: ${country.cities[0].city}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-sm font-semibold">{country.visitors}</span>
                          <p className="text-xs text-gray-500">visitors</p>
                        </div>
                        <Badge variant="outline" className="font-semibold">
                          {country.percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {(!analyticsData?.countryStats || analyticsData.countryStats.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No location data available yet</p>
                      <p className="text-sm">Location data will appear as visitors browse your website</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* World Map Visualization */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Global Reach
                </CardTitle>
                <CardDescription>Your website's worldwide audience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 rounded-lg">
                  <div className="text-center">
                    <Globe className="h-16 w-16 mx-auto mb-4 text-[#0d5c75] opacity-60" />
                    <h3 className="text-lg font-semibold text-[#0d5c75] mb-2">Global Analytics</h3>
                    <p className="text-gray-600 mb-4">Tracking visitors from around the world</p>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-[#0d5c75]">
                          {analyticsData?.countryStats?.length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Countries</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-[#0d5c75]">
                          {analyticsData?.countryStats?.reduce((sum, country) => 
                            sum + country.cities.length, 0) || 0}
                        </div>
                        <div className="text-sm text-gray-600">Cities</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Score */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Performance Score
                </CardTitle>
                <CardDescription>Overall website performance based on Core Web Vitals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analyticsData?.performanceInsights?.webVitals ? (
                    <>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-[#0d5c75] mb-2">
                          {getPerformanceScore(analyticsData.performanceInsights.webVitals)}
                        </div>
                        <div className="text-gray-600">Performance Score</div>
                        <Progress 
                          value={getPerformanceScore(analyticsData.performanceInsights.webVitals)} 
                          className="w-full mt-3" 
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">LCP (Largest Contentful Paint)</span>
                          <span className="font-semibold">
                            {(analyticsData.performanceInsights.webVitals.lcp / 1000).toFixed(2)}s
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">FID (First Input Delay)</span>
                          <span className="font-semibold">
                            {analyticsData.performanceInsights.webVitals.fid.toFixed(0)}ms
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">CLS (Cumulative Layout Shift)</span>
                          <span className="font-semibold">
                            {analyticsData.performanceInsights.webVitals.cls.toFixed(3)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">TTFB (Time to First Byte)</span>
                          <span className="font-semibold">
                            {(analyticsData.performanceInsights.webVitals.ttfb / 1000).toFixed(2)}s
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No performance data available yet</p>
                      <p className="text-sm">Performance metrics will appear as users interact with your website</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Slowest Pages */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Page Load Times
                </CardTitle>
                <CardDescription>Pages that need optimization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(analyticsData?.performanceInsights?.slowestPages || []).slice(0, 8).map((page, index) => (
                    <div key={page.page} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-white bg-red-500 rounded-full w-6 h-6 flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="font-medium text-sm truncate max-w-40">{page.page}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-red-600">
                          {(page.loadTime / 1000).toFixed(2)}s
                        </span>
                        <span className="text-xs text-gray-500">load time</span>
                      </div>
                    </div>
                  ))}
                  
                  {analyticsData?.performanceInsights && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Database className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold text-blue-900">Average Load Time</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-700">
                        {(analyticsData.performanceInsights.avgPageLoadTime / 1000).toFixed(2)}s
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Traffic Tab */}
        <TabsContent value="traffic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Sources List */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>Traffic Sources Breakdown</CardTitle>
                <CardDescription>Detailed visitor sources with metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(analyticsData?.trafficSources || []).map((source, index) => (
                    <div key={source.source} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: chartColors[index % chartColors.length] }}
                        />
                        <span className="font-medium">{source.source}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">{source.visitors} visitors</span>
                        <Badge variant="outline">
                          {analyticsData && analyticsData.uniqueVisitors > 0 
                            ? ((source.visitors / analyticsData.uniqueVisitors) * 100).toFixed(1)
                            : 0}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {(!analyticsData?.trafficSources || analyticsData.trafficSources.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No traffic data available yet</p>
                      <p className="text-sm">Data will appear as visitors browse your website</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Visitor Flow */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>Most viewed pages on your website</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(analyticsData?.topPages || []).slice(0, 8).map((page, index) => (
                    <div key={page.page} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-white bg-[#0d5c75] rounded-full w-6 h-6 flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="font-medium text-sm truncate max-w-40">{page.page}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{page.views}</span>
                        <span className="text-xs text-gray-500">views</span>
                      </div>
                    </div>
                  ))}
                  {(!analyticsData?.topPages || analyticsData.topPages.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No page data available yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Types */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5" />
                  Device Types
                </CardTitle>
                <CardDescription>Breakdown of visitor devices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(analyticsData?.deviceStats || []).map((device, index) => {
                    const icons = {
                      desktop: Monitor,
                      mobile: Smartphone,
                      tablet: Tablet
                    }
                    const Icon = icons[device.type as keyof typeof icons] || Monitor

                    return (
                      <div key={device.type} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#0d5c75]/10 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-[#0d5c75]" />
                          </div>
                          <div>
                            <span className="font-medium capitalize">{device.type}</span>
                            <p className="text-xs text-gray-500">{device.count} visitors</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="font-semibold">
                          {device.percentage}%
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Browser Statistics */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>Browser Distribution</CardTitle>
                <CardDescription>Visitor browser preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={analyticsData?.browserStats || []} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" stroke="#666" fontSize={12} />
                      <YAxis dataKey="browser" type="category" stroke="#666" fontSize={12} width={80} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar dataKey="count" fill="#0d5c75" radius={[0, 4, 4, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages" className="space-y-6">
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <CardTitle>Page Performance Analytics</CardTitle>
              <CardDescription>Detailed breakdown of page visits, engagement, and time spent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-3 text-sm font-semibold text-gray-600">Page</th>
                      <th className="text-right p-3 text-sm font-semibold text-gray-600">Views</th>
                      <th className="text-right p-3 text-sm font-semibold text-gray-600">Avg. Time</th>
                      <th className="text-right p-3 text-sm font-semibold text-gray-600">Bounce Rate</th>
                      <th className="text-right p-3 text-sm font-semibold text-gray-600">Load Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(analyticsData?.enhancedPageStats || []).map((page, index) => (
                      <tr key={page.page} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white bg-[#0d5c75] rounded-full w-5 h-5 flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span className="font-medium text-sm">{page.page}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="font-semibold">{page.views.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">
                            {analyticsData && analyticsData.totalPageViews > 0 
                              ? ((page.views / analyticsData.totalPageViews) * 100).toFixed(1)
                              : 0}%
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="font-semibold text-[#0d5c75]">
                            {Math.floor(page.avgTimeOnPage / 60)}:{(page.avgTimeOnPage % 60).toString().padStart(2, '0')}
                          </div>
                          <div className="text-xs text-gray-500">mm:ss</div>
                        </td>
                        <td className="p-3 text-right">
                          <Badge variant={page.bounceRate > 70 ? "destructive" : page.bounceRate > 40 ? "secondary" : "outline"} className="text-xs">
                            {page.bounceRate}%
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <div className="font-semibold text-sm">
                            {(page.avgLoadTime / 1000).toFixed(2)}s
                          </div>
                          <div className={`text-xs ${
                            page.avgLoadTime < 2000 ? 'text-green-600' : 
                            page.avgLoadTime < 4000 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {page.avgLoadTime < 2000 ? 'Fast' : page.avgLoadTime < 4000 ? 'Average' : 'Slow'}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(!analyticsData?.enhancedPageStats || analyticsData.enhancedPageStats.length === 0) && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">
                          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>No page data available yet</p>
                          <p className="text-sm mt-2">Enhanced page metrics will appear as visitors browse your website</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Real-time Tab */}
        <TabsContent value="realtime" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Activity Feed */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-500" />
                      Live Activity Feed
                    </CardTitle>
                    <CardDescription>Real-time visitor activity on your website</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">LIVE</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {(analyticsData?.recentActivity || []).slice(0, 20).map((activity, index) => (
                    <div key={`${activity.visitorId}-${activity.timestamp}`} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] flex items-center justify-center">
                        <Eye className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.page}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{new Date(activity.timestamp).toLocaleTimeString()}</span>
                          <span>•</span>
                          <span>{activity.device?.type || 'Unknown'} {activity.device?.browser || ''}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.referrer || 'Direct'}
                      </Badge>
                    </div>
                  ))}
                  {(!analyticsData?.recentActivity || analyticsData.recentActivity.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No recent activity</p>
                      <p className="text-sm">Activity will appear here as visitors browse your website</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Real-time Metrics */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle>Live Metrics Dashboard</CardTitle>
                <CardDescription>Current website performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                    <div className="text-2xl font-bold text-green-700 mb-1">
                      {analyticsData?.activeVisitors || 0}
                    </div>
                    <div className="text-sm text-green-600 font-medium">Active Now</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                    <div className="text-2xl font-bold text-blue-700 mb-1">
                      {analyticsData?.totalPageViews || 0}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">Total Views</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                    <span className="text-sm font-medium">Session Duration</span>
                    <span className="font-bold text-[#0d5c75]">
                      {Math.floor((analyticsData?.avgSessionDuration || 0) / 60)}m {((analyticsData?.avgSessionDuration || 0) % 60).toFixed(0)}s
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                    <span className="text-sm font-medium">Bounce Rate</span>
                    <span className={`font-bold ${(analyticsData?.bounceRate || 0) < 50 ? 'text-green-600' : 'text-red-600'}`}>
                      {analyticsData?.bounceRate?.toFixed(1) || 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                    <span className="text-sm font-medium">Total Sessions</span>
                    <span className="font-bold text-[#0d5c75]">{analyticsData?.totalSessions || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Additional tabs content would continue here... */}
      </Tabs>

      {/* Export and Actions */}
      <Card className="bg-white shadow-lg border-0 mt-8">
        <CardHeader>
          <CardTitle>Data Export & Management</CardTitle>
          <CardDescription>Export your analytics data for further analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => exportData('csv')} className="bg-[#0d5c75] hover:bg-[#0d5c75]/90">
              <Download className="h-4 w-4 mr-2" />
              Export CSV Report
            </Button>
            <Button onClick={() => exportData('excel')} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Excel Report
            </Button>
            <Button onClick={() => exportData('pdf')} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF Report
            </Button>
            <Button onClick={fetchAnalytics} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
