import { NextRequest, NextResponse } from 'next/server'

// Import in-memory storage from tracking endpoint
let analyticsData: any[] = []
let activeSessions = new Map<string, any>()
let pagePerformance = new Map<string, any>()

// Try to import from track route, fallback to empty arrays
try {
  const trackModule = require('../track/route')
  analyticsData = trackModule.analyticsData || []
  activeSessions = trackModule.activeSessions || new Map()
  pagePerformance = trackModule.pagePerformance || new Map()
} catch (error) {
  console.log('Using fallback analytics data')
}

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '24h'
    const page = searchParams.get('page')
    
    const now = new Date()
    let startDate: Date
    
    // Calculate time range
    switch (timeframe) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000)
        break
      case '6h':
        startDate = new Date(now.getTime() - 6 * 60 * 60 * 1000)
        break
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }

    // Filter data by timeframe
    const filteredEvents = analyticsData.filter(event => 
      new Date(event.timestamp) >= startDate
    )

    // Calculate statistics
    const stats = calculateStats(filteredEvents, Array.from(activeSessions.values()), filteredEvents)

    // Add real-time data
    const realTimeStats = {
      ...stats,
      timestamp: now.toISOString(),
      dataPoints: filteredEvents.length,
      timeframe
    }

    return NextResponse.json(realTimeStats)

  } catch (error) {
    console.error('Analytics stats error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve analytics stats' },
      { status: 500 }
    )
  }
}

function calculateStats(events: any[], sessions: any[], filteredEvents: any[]) {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  // Active visitors (heartbeat in last 5 minutes)
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)
  const activeVisitors = sessions.filter(session => 
    new Date(session.lastActivity) >= fiveMinutesAgo
  ).length

  // Page views
  const pageViews = events.filter(event => event.type === 'pageview')
  const totalPageViews = pageViews.length

  // Unique visitors (unique session IDs)
  const uniqueVisitors = new Set(pageViews.map(event => event.data.visitorId)).size

  // Session duration calculation
  const totalSessions = sessions.length
  const completedSessions = sessions.filter(session => 
    new Date(session.lastActivity) < oneHourAgo
  )
  const avgSessionDuration = completedSessions.length > 0 
    ? completedSessions.reduce((total, session) => {
        const duration = new Date(session.lastActivity).getTime() - new Date(session.startTime).getTime()
        return total + duration
      }, 0) / completedSessions.length / 1000 // Convert to seconds
    : 0

  // Bounce rate (sessions with only 1 page view)
  const bounceRate = sessions.length > 0 
    ? (sessions.filter(session => session.pageViews === 1).length / sessions.length) * 100
    : 0

  // Country/Location statistics
  const locationCounts = sessions.reduce((acc: any, session) => {
    const country = session.location?.country || 'Unknown'
    const city = session.location?.city || 'Unknown'
    const locationKey = `${country}|${city}`
    
    if (!acc[country]) {
      acc[country] = { country, cities: {}, totalVisitors: 0 }
    }
    acc[country].totalVisitors += 1
    acc[country].cities[city] = (acc[country].cities[city] || 0) + 1
    
    return acc
  }, {})

  const countryStats = Object.values(locationCounts)
    .map((country: any) => ({
      country: country.country,
      visitors: country.totalVisitors,
      percentage: totalSessions > 0 ? Math.round((country.totalVisitors / totalSessions) * 100) : 0,
      cities: Object.entries(country.cities)
        .map(([city, count]) => ({ city, visitors: count }))
        .sort((a: any, b: any) => b.visitors - a.visitors)
        .slice(0, 5)
    }))
    .sort((a: any, b: any) => b.visitors - a.visitors)

  // Top pages with enhanced metrics
  const pageStats = Array.from(pagePerformance.entries()).map(([page, stats]) => {
    const pageViewsForPage = pageViews.filter(view => view.data.page === page).length
    const avgTimeOnPage = stats.totalTimeSpent > 0 && stats.totalViews > 0 
      ? Math.round(stats.totalTimeSpent / stats.totalViews / 1000) // Convert to seconds
      : 0
    const bounceRateForPage = stats.totalViews > 0 
      ? Math.round((stats.bounces / stats.totalViews) * 100)
      : 0
    
    return {
      page,
      views: pageViewsForPage,
      avgTimeOnPage,
      bounceRate: bounceRateForPage,
      avgLoadTime: Math.round(stats.avgLoadTime || 0),
      totalTimeSpent: Math.round(stats.totalTimeSpent / 1000) // Convert to seconds
    }
  }).sort((a, b) => b.views - a.views).slice(0, 10)

  // Legacy top pages for backward compatibility
  const topPages = pageStats.map(page => ({ page: page.page, views: page.views }))

  // Traffic sources
  const sourceCounts = sessions.reduce((acc: any, session) => {
    const source = getSourceFromReferrer(session.referrer)
    acc[source] = (acc[source] || 0) + 1
    return acc
  }, {})

  const trafficSources = Object.entries(sourceCounts)
    .map(([source, visitors]) => ({ source, visitors }))
    .sort((a: any, b: any) => b.visitors - a.visitors)

  // Enhanced device statistics
  const deviceCounts = sessions.reduce((acc: any, session) => {
    const deviceType = session.device?.type || 'Unknown'
    const os = session.device?.os || 'Unknown'
    const browser = session.device?.browser || 'Unknown'
    
    if (!acc[deviceType]) {
      acc[deviceType] = { browsers: {}, os: {}, count: 0 }
    }
    
    acc[deviceType].count += 1
    acc[deviceType].browsers[browser] = (acc[deviceType].browsers[browser] || 0) + 1
    acc[deviceType].os[os] = (acc[deviceType].os[os] || 0) + 1
    
    return acc
  }, {})

  const deviceStats = Object.entries(deviceCounts)
    .map(([type, data]: [string, any]) => ({
      type,
      count: data.count,
      percentage: totalSessions > 0 ? Math.round((data.count / totalSessions) * 100) : 0,
      browsers: Object.entries(data.browsers)
        .map(([browser, count]) => ({ browser, count }))
        .sort((a: any, b: any) => b.count - a.count),
      operatingSystems: Object.entries(data.os)
        .map(([os, count]) => ({ os, count }))
        .sort((a: any, b: any) => b.count - a.count)
    }))
    .sort((a, b) => b.count - a.count)

  // Browser statistics
  const browserCounts = sessions.reduce((acc: any, session) => {
    const browser = session.device?.browser || 'Unknown'
    acc[browser] = (acc[browser] || 0) + 1
    return acc
  }, {})

  const browserStats = Object.entries(browserCounts)
    .map(([browser, count]) => ({
      browser,
      count: count as number,
      percentage: totalSessions > 0 ? Math.round(((count as number) / totalSessions) * 100) : 0
    }))

  // Performance metrics from Web Vitals
  const webVitalsData = filteredEvents.filter(event => event.type === 'web_vitals')
  const avgWebVitals = webVitalsData.length > 0 ? {
    lcp: webVitalsData.reduce((sum, event) => sum + (event.data.vitals?.lcp || 0), 0) / webVitalsData.length,
    fid: webVitalsData.reduce((sum, event) => sum + (event.data.vitals?.fid || 0), 0) / webVitalsData.length,
    cls: webVitalsData.reduce((sum, event) => sum + (event.data.vitals?.cls || 0), 0) / webVitalsData.length,
    ttfb: webVitalsData.reduce((sum, event) => sum + (event.data.vitals?.ttfb || 0), 0) / webVitalsData.length,
    fcp: webVitalsData.reduce((sum, event) => sum + (event.data.vitals?.fcp || 0), 0) / webVitalsData.length
  } : null

  // Real-time performance insights
  const performanceInsights = {
    avgPageLoadTime: Array.from(pagePerformance.values())
      .reduce((sum: number, page: any) => sum + (page.avgLoadTime || 0), 0) / Math.max(pagePerformance.size, 1),
    slowestPages: Array.from(pagePerformance.entries())
      .map(([page, stats]: [string, any]) => ({ page, loadTime: stats.avgLoadTime || 0 }))
      .sort((a, b) => b.loadTime - a.loadTime)
      .slice(0, 5),
    webVitals: avgWebVitals
  }

  // Hourly data for charts
  const hourlyData = generateHourlyData(pageViews)

  // Enhanced recent activity with location
  const recentActivity = events
    .filter(event => event.type === 'pageview')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 50)
    .map(event => ({
      timestamp: event.timestamp,
      page: event.data.page,
      title: event.data.title,
      referrer: event.data.referrer,
      device: event.data.device,
      visitorId: event.data.visitorId,
      location: event.location,
      performance: event.performance
    }))

  return {
    activeVisitors,
    totalPageViews,
    uniqueVisitors,
    avgSessionDuration: Math.round(avgSessionDuration),
    bounceRate: Math.round(bounceRate),
    topPages,
    enhancedPageStats: pageStats,
    trafficSources,
    deviceStats,
    browserStats,
    countryStats,
    locationStats: countryStats, // alias for backward compatibility
    performanceInsights,
    hourlyData,
    recentActivity,
    totalSessions,
    newVisitors: uniqueVisitors, // Simplified - in production, track returning vs new
    returningVisitors: Math.max(0, totalSessions - uniqueVisitors)
  }
}

function getSourceFromReferrer(referrer: string): string {
  if (!referrer) return 'Direct'
  
  try {
    const url = new URL(referrer)
    const hostname = url.hostname.toLowerCase()
    
    if (hostname.includes('google')) return 'Google'
    if (hostname.includes('facebook')) return 'Facebook'
    if (hostname.includes('twitter') || hostname.includes('t.co')) return 'Twitter'
    if (hostname.includes('linkedin')) return 'LinkedIn'
    if (hostname.includes('youtube')) return 'YouTube'
    if (hostname.includes('instagram')) return 'Instagram'
    
    return hostname
  } catch {
    return 'Unknown'
  }
}

function generateHourlyData(pageViews: any[]) {
  const hours = 24
  const hourlyData = []
  const now = new Date()

  for (let i = hours - 1; i >= 0; i--) {
    const hourStart = new Date(now.getTime() - i * 60 * 60 * 1000)
    const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000)
    
    const viewsInHour = pageViews.filter(view => {
      const viewTime = new Date(view.timestamp)
      return viewTime >= hourStart && viewTime < hourEnd
    }).length

    const uniqueVisitorsInHour = new Set(
      pageViews
        .filter(view => {
          const viewTime = new Date(view.timestamp)
          return viewTime >= hourStart && viewTime < hourEnd
        })
        .map(view => view.data.visitorId)
    ).size

    hourlyData.push({
      hour: hourStart.getHours(),
      time: hourStart.toISOString(),
      pageViews: viewsInHour,
      uniqueVisitors: uniqueVisitorsInHour
    })
  }

  return hourlyData
}
