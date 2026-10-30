import { v4 as uuidv4 } from 'uuid'

// Types for analytics data
export interface VisitorSession {
  id: string
  visitorId: string
  startTime: Date
  lastActivity: Date
  duration: number
  pageViews: number
  pages: string[]
  referrer: string
  userAgent: string
  ipAddress?: string
  location?: {
    country: string
    city: string
    region: string
  }
  device: {
    type: 'desktop' | 'mobile' | 'tablet'
    os: string
    browser: string
  }
  isActive: boolean
}

export interface PageView {
  id: string
  sessionId: string
  visitorId: string
  page: string
  title: string
  timestamp: Date
  timeOnPage?: number
  exitPage: boolean
}

export interface RealTimeStats {
  activeVisitors: number
  todayVisitors: number
  pageViews: number
  avgSessionDuration: number
  bounceRate: number
  topPages: Array<{ page: string; views: number }>
  trafficSources: Array<{ source: string; visitors: number }>
  deviceStats: Array<{ type: string; percentage: number }>
  locationStats: Array<{ country: string; visitors: number }>
}

// Local storage keys
const VISITOR_ID_KEY = 'gonstead_visitor_id'
const SESSION_KEY = 'gonstead_session'

// Analytics class for client-side tracking
export class AnalyticsTracker {
  private visitorId: string
  private sessionId: string
  private startTime: Date
  private lastActivity: Date
  private currentPage: string = ''
  private pageStartTime: Date = new Date()

  constructor() {
    this.visitorId = this.getOrCreateVisitorId()
    this.sessionId = this.getOrCreateSession()
    this.startTime = new Date()
    this.lastActivity = new Date()
    
    if (typeof window !== 'undefined') {
      this.initializeTracking()
    }
  }

  private getOrCreateVisitorId(): string {
    if (typeof window === 'undefined') return uuidv4()
    
    let visitorId = localStorage.getItem(VISITOR_ID_KEY)
    if (!visitorId) {
      visitorId = uuidv4()
      localStorage.setItem(VISITOR_ID_KEY, visitorId)
    }
    return visitorId
  }

  private getOrCreateSession(): string {
    if (typeof window === 'undefined') return uuidv4()
    
    const sessionData = localStorage.getItem(SESSION_KEY)
    if (sessionData) {
      const session = JSON.parse(sessionData)
      const sessionAge = Date.now() - new Date(session.startTime).getTime()
      
      // Session expires after 30 minutes of inactivity
      if (sessionAge < 30 * 60 * 1000) {
        return session.id
      }
    }
    
    const newSessionId = uuidv4()
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      id: newSessionId,
      startTime: new Date().toISOString()
    }))
    
    return newSessionId
  }

  private initializeTracking(): void {
    // Ensure we're in the browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return
    }

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackPageExit()
      } else {
        this.lastActivity = new Date()
      }
    })

    // Track clicks
    document.addEventListener('click', (event) => {
      this.trackEvent('click', {
        element: (event.target as HTMLElement)?.tagName,
        x: event.clientX,
        y: event.clientY
      })
    })

    // Track scroll depth
    let maxScroll = 0
    document.addEventListener('scroll', () => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100)
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent
        if (maxScroll % 25 === 0) { // Track at 25%, 50%, 75%, 100%
          this.trackEvent('scroll', { depth: maxScroll })
        }
      }
      this.lastActivity = new Date()
    })

    // Track time on page before unload
    window.addEventListener('beforeunload', () => {
      this.trackPageExit()
    })

    // Update activity periodically
    setInterval(() => {
      this.heartbeat()
    }, 30000) // Every 30 seconds
  }

  public trackPageView(page: string, title: string): void {
    // End previous page view
    if (this.currentPage) {
      this.trackPageExit()
    }

    this.currentPage = page
    this.pageStartTime = new Date()
    this.lastActivity = new Date()

    const pageView: PageView = {
      id: uuidv4(),
      sessionId: this.sessionId,
      visitorId: this.visitorId,
      page,
      title,
      timestamp: new Date(),
      exitPage: false
    }

    this.sendAnalytics('pageview', pageView)
  }

  private trackPageExit(): void {
    if (!this.currentPage) return

    const timeOnPage = Date.now() - this.pageStartTime.getTime()
    
    this.sendAnalytics('page_exit', {
      sessionId: this.sessionId,
      visitorId: this.visitorId,
      page: this.currentPage,
      timeOnPage,
      timestamp: new Date()
    })
  }

  public trackEvent(eventType: string, data: any): void {
    this.lastActivity = new Date()
    
    this.sendAnalytics('event', {
      sessionId: this.sessionId,
      visitorId: this.visitorId,
      eventType,
      data,
      timestamp: new Date()
    })
  }

  private heartbeat(): void {
    this.sendAnalytics('heartbeat', {
      sessionId: this.sessionId,
      visitorId: this.visitorId,
      timestamp: new Date(),
      duration: Date.now() - this.startTime.getTime()
    })
  }

  private getDeviceInfo() {
    const userAgent = navigator.userAgent
    
    let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop'
    if (/tablet|ipad/i.test(userAgent)) {
      deviceType = 'tablet'
    } else if (/mobile|iphone|android/i.test(userAgent)) {
      deviceType = 'mobile'
    }

    let browser = 'Unknown'
    if (userAgent.includes('Chrome')) browser = 'Chrome'
    else if (userAgent.includes('Firefox')) browser = 'Firefox'
    else if (userAgent.includes('Safari')) browser = 'Safari'
    else if (userAgent.includes('Edge')) browser = 'Edge'

    let os = 'Unknown'
    if (userAgent.includes('Windows')) os = 'Windows'
    else if (userAgent.includes('Mac')) os = 'macOS'
    else if (userAgent.includes('Linux')) os = 'Linux'
    else if (userAgent.includes('Android')) os = 'Android'
    else if (userAgent.includes('iOS')) os = 'iOS'

    return { type: deviceType, browser, os }
  }

  private async sendAnalytics(type: string, data: any): Promise<void> {
    try {
      const payload = {
        type,
        data: {
          ...data,
          device: this.getDeviceInfo(),
          referrer: document.referrer,
          url: window.location.href,
          userAgent: navigator.userAgent
        }
      }

      // Send to analytics API endpoint
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }

  public getVisitorId(): string {
    return this.visitorId
  }

  public getSessionId(): string {
    return this.sessionId
  }
}

// Singleton instance
export const analyticsTracker = typeof window !== 'undefined' ? new AnalyticsTracker() : null

// Helper functions for server-side analytics
export function generateAnalyticsId(): string {
  return uuidv4()
}

export function calculateSessionDuration(startTime: Date, endTime: Date): number {
  return Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
}

export function isNewVisitor(visitorId: string, existingVisitorIds: string[]): boolean {
  return !existingVisitorIds.includes(visitorId)
}

export function getBounceRate(sessions: VisitorSession[]): number {
  const bouncedSessions = sessions.filter(session => session.pageViews === 1)
  return sessions.length > 0 ? (bouncedSessions.length / sessions.length) * 100 : 0
}

export function getTopPages(pageViews: PageView[]): Array<{ page: string; views: number }> {
  const pageCounts = pageViews.reduce((acc, view) => {
    acc[view.page] = (acc[view.page] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(pageCounts)
    .map(([page, views]) => ({ page, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10)
}

export function getTrafficSources(sessions: VisitorSession[]): Array<{ source: string; visitors: number }> {
  const sourceCounts = sessions.reduce((acc, session) => {
    const source = getSourceFromReferrer(session.referrer)
    acc[source] = (acc[source] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(sourceCounts)
    .map(([source, visitors]) => ({ source, visitors }))
    .sort((a, b) => b.visitors - a.visitors)
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
