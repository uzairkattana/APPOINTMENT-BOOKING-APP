import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import geoip from 'geoip-lite'

// In-memory storage for demo (in production, use a database)
interface AnalyticsEvent {
  id: string
  type: string
  data: any
  timestamp: Date
  ipAddress?: string
  location?: {
    country: string
    region: string
    city: string
    timezone: string
    ll?: number[]
  }
  performance?: {
    loadTime?: number
    renderTime?: number
    networkSpeed?: string
    webVitals?: {
      lcp?: number
      fid?: number
      cls?: number
      ttfb?: number
      fcp?: number
    }
  }
}

// Global storage for analytics data
const analyticsData: AnalyticsEvent[] = []
const activeSessions = new Map<string, any>()
const pagePerformance = new Map<string, any>()

// Initialize with some demo data for development
if (analyticsData.length === 0) {
  // Add some demo analytics events
  const demoEvents = [
    {
      id: crypto.randomUUID(),
      type: 'pageview',
      data: {
        page: '/',
        title: 'Home - Gonstead Chiropractic',
        visitorId: 'visitor-1',
        sessionId: 'session-1',
        referrer: 'https://google.com'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      location: { country: 'Pakistan', city: 'Nowshera', region: 'KPK', timezone: 'Asia/Karachi' }
    },
    {
      id: crypto.randomUUID(),
      type: 'pageview', 
      data: {
        page: '/appointment-booking',
        title: 'Book Appointment - Gonstead Chiropractic',
        visitorId: 'visitor-2',
        sessionId: 'session-2',
        referrer: 'direct'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      location: { country: 'Pakistan', city: 'Peshawar', region: 'KPK', timezone: 'Asia/Karachi' }
    },
    {
      id: crypto.randomUUID(),
      type: 'pageview',
      data: {
        page: '/doctor-profile',
        title: 'Dr. Bashir - Gonstead Specialist',
        visitorId: 'visitor-3', 
        sessionId: 'session-3',
        referrer: 'https://facebook.com'
      },
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      location: { country: 'Pakistan', city: 'Islamabad', region: 'ICT', timezone: 'Asia/Karachi' }
    }
  ]
  
  analyticsData.push(...demoEvents)
  
  // Add demo sessions
  activeSessions.set('session-1', {
    id: 'session-1',
    visitorId: 'visitor-1',
    startTime: new Date(Date.now() - 1000 * 60 * 30),
    lastActivity: new Date(Date.now() - 1000 * 60 * 25),
    pageViews: 2,
    pages: ['/', '/services'],
    device: { type: 'desktop', browser: 'Chrome', os: 'Windows' },
    location: { country: 'Pakistan', city: 'Nowshera' },
    referrer: 'https://google.com',
    isActive: false
  })
  
  activeSessions.set('session-2', {
    id: 'session-2', 
    visitorId: 'visitor-2',
    startTime: new Date(Date.now() - 1000 * 60 * 15),
    lastActivity: new Date(Date.now() - 1000 * 60 * 2),
    pageViews: 3,
    pages: ['/appointment-booking', '/doctor-profile', '/services'],
    device: { type: 'mobile', browser: 'Safari', os: 'iOS' },
    location: { country: 'Pakistan', city: 'Peshawar' },
    referrer: 'direct',
    isActive: true
  })
  
  activeSessions.set('session-3', {
    id: 'session-3',
    visitorId: 'visitor-3',
    startTime: new Date(Date.now() - 1000 * 60 * 5),
    lastActivity: new Date(Date.now() - 1000 * 60 * 1),
    pageViews: 1,
    pages: ['/doctor-profile'],
    device: { type: 'tablet', browser: 'Chrome', os: 'Android' },
    location: { country: 'Pakistan', city: 'Islamabad' },
    referrer: 'https://facebook.com',
    isActive: true
  })
  
  // Add demo page performance
  pagePerformance.set('/', {
    totalViews: 25,
    totalTimeSpent: 45000,
    bounces: 8,
    avgLoadTime: 1200
  })
  
  pagePerformance.set('/appointment-booking', {
    totalViews: 18,
    totalTimeSpent: 72000,
    bounces: 3,
    avgLoadTime: 1800
  })
  
  pagePerformance.set('/doctor-profile', {
    totalViews: 15,
    totalTimeSpent: 38000,
    bounces: 5,
    avgLoadTime: 950
  })
}

export async function POST(request: NextRequest) {
  try {
    let body
    try {
      body = await request.json()
    } catch (error) {
      if (error instanceof SyntaxError && error.message.includes('Unexpected end of JSON input')) {
        return NextResponse.json({ error: 'Empty or malformed JSON body' }, { status: 400 })
      }
      throw error // Re-throw other parsing errors
    }
    const { type, data } = body
    
    // Get client IP address
    const headersList = await headers()
    const clientIP = headersList.get('x-forwarded-for') || 
                    headersList.get('x-real-ip') || 
                    request.ip || 
                    '127.0.0.1' // fallback for development

    // Get geolocation data
    let location = undefined
    try {
      const geo = geoip.lookup(clientIP === '127.0.0.1' ? '8.8.8.8' : clientIP) // Use Google DNS for demo
      if (geo) {
        location = {
          country: geo.country || 'Unknown',
          region: geo.region || 'Unknown', 
          city: geo.city || 'Unknown',
          timezone: geo.timezone || 'Unknown',
          ll: geo.ll
        }
      }
    } catch (geoError) {
      console.warn('Geolocation lookup failed:', geoError)
    }

    // Extract performance data if available
    const performance = data.performance || {}

    // Create analytics event
    const event: AnalyticsEvent = {
      id: crypto.randomUUID(),
      type,
      data: {
        ...data,
        ipAddress: clientIP
      },
      timestamp: new Date(),
      ipAddress: clientIP,
      location,
      performance
    }

    // Store the event
    analyticsData.push(event)

    // Handle different event types
    switch (type) {
      case 'pageview':
        handlePageView(event)
        break
      case 'page_exit':
        handlePageExit(event)
        break
      case 'heartbeat':
        handleHeartbeat(event)
        break
      case 'performance':
        handlePerformanceMetrics(event)
        break
      case 'web_vitals':
        handleWebVitals(event)
        break
      case 'event':
        handleCustomEvent(event)
        break
    }

    // Clean old data (keep only last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const currentLength = analyticsData.length
    for (let i = analyticsData.length - 1; i >= 0; i--) {
      if (analyticsData[i].timestamp < oneDayAgo) {
        analyticsData.splice(i, 1)
      }
    }

    return NextResponse.json({ 
      success: true, 
      eventId: event.id,
      totalEvents: analyticsData.length 
    })

  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track analytics event' },
      { status: 500 }
    )
  }
}

function handlePageView(event: AnalyticsEvent) {
  const { sessionId, visitorId, page, title } = event.data
  
  // Update or create session
  if (!activeSessions.has(sessionId)) {
    activeSessions.set(sessionId, {
      id: sessionId,
      visitorId,
      startTime: event.timestamp,
      lastActivity: event.timestamp,
      pageViews: 0,
      pages: [],
      referrer: event.data.referrer || '',
      userAgent: event.data.userAgent || '',
      device: event.data.device || {},
      location: event.location,
      isActive: true
    })
  }

  const session = activeSessions.get(sessionId)
  session.lastActivity = event.timestamp
  session.pageViews += 1
  session.location = event.location || session.location
  if (!session.pages.includes(page)) {
    session.pages.push(page)
  }

  // Initialize page performance tracking
  if (!pagePerformance.has(page)) {
    pagePerformance.set(page, {
      totalViews: 0,
      totalTimeSpent: 0,
      bounces: 0,
      avgLoadTime: 0,
      webVitals: []
    })
  }
  
  const pageStats = pagePerformance.get(page)
  pageStats.totalViews += 1
}

function handlePageExit(event: AnalyticsEvent) {
  const { sessionId, timeOnPage, page } = event.data
  
  if (activeSessions.has(sessionId)) {
    const session = activeSessions.get(sessionId)
    session.lastActivity = event.timestamp
  }

  // Update page performance stats
  if (timeOnPage && page && pagePerformance.has(page)) {
    const pageStats = pagePerformance.get(page)
    pageStats.totalTimeSpent += timeOnPage
    
    // Track bounce if time on page is less than 30 seconds
    if (timeOnPage < 30000) {
      pageStats.bounces += 1
    }
  }
}

function handleHeartbeat(event: AnalyticsEvent) {
  const { sessionId } = event.data
  
  if (activeSessions.has(sessionId)) {
    const session = activeSessions.get(sessionId)
    session.lastActivity = event.timestamp
    session.isActive = true
  }
}

function handlePerformanceMetrics(event: AnalyticsEvent) {
  const { page, loadTime, renderTime, networkSpeed } = event.data
  
  if (page && pagePerformance.has(page)) {
    const pageStats = pagePerformance.get(page)
    
    if (loadTime) {
      pageStats.avgLoadTime = pageStats.avgLoadTime 
        ? (pageStats.avgLoadTime + loadTime) / 2 
        : loadTime
    }
  }
}

function handleWebVitals(event: AnalyticsEvent) {
  const { page, vitals } = event.data
  
  if (page && vitals) {
    // Initialize page performance tracking if it doesn't exist
    if (!pagePerformance.has(page)) {
      pagePerformance.set(page, {
        totalViews: 0,
        totalTimeSpent: 0,
        bounces: 0,
        avgLoadTime: 0,
        webVitals: []
      })
    }
    
    const pageStats = pagePerformance.get(page)
    if (pageStats && pageStats.webVitals) {
      pageStats.webVitals.push({
        ...vitals,
        timestamp: event.timestamp
      })
    }
  }
}

function handleCustomEvent(event: AnalyticsEvent) {
  // Store custom events for analysis
  console.log('Custom event tracked:', event.data.eventType, event.data.data)
}

// Export analytics data for use by other API endpoints
export { analyticsData, activeSessions, pagePerformance }
