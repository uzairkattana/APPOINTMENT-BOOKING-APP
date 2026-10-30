"use client"

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals'

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export default function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)
  const [analyticsTracker, setAnalyticsTracker] = useState<any>(null)
  const [pageStartTime, setPageStartTime] = useState<Date>(new Date())
  const [webVitalsTracked, setWebVitalsTracked] = useState<Set<string>>(new Set())

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
    
    // Dynamically import analytics only on client side
    import('@/lib/analytics').then(({ analyticsTracker }) => {
      setAnalyticsTracker(analyticsTracker)
    }).catch(error => {
      console.error('Failed to load analytics:', error)
    })
  }, [])

  // Track page changes
  useEffect(() => {
    if (!isClient || !analyticsTracker) return

    try {
      const title = document?.title || 'Unknown Page'
      setPageStartTime(new Date())
      analyticsTracker.trackPageView(pathname, title)
      
      // Track performance metrics for new page
      setTimeout(() => {
        trackPagePerformance(pathname)
      }, 1000) // Wait for page to load
      
    } catch (error) {
      console.error('Error tracking page view:', error)
    }
  }, [pathname, isClient, analyticsTracker])

  // Web Vitals tracking
  useEffect(() => {
    if (!isClient || !analyticsTracker) return

    const trackWebVital = (metric: any) => {
      try {
        const vitalsKey = `${pathname}-${metric.name}`
        if (webVitalsTracked.has(vitalsKey)) return
        
        setWebVitalsTracked(prev => new Set([...prev, vitalsKey]))
        
        // Send web vitals data
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'web_vitals',
            data: {
              page: pathname,
              vitals: {
                [metric.name.toLowerCase()]: metric.value
              }
            }
          })
        }).catch(error => {
          console.error('Web vitals tracking error:', error)
        })
      } catch (error) {
        console.error('Error tracking web vital:', error)
      }
    }

    // Set up Web Vitals tracking
    onCLS(trackWebVital)
    onINP(trackWebVital)
    onFCP(trackWebVital)
    onLCP(trackWebVital)
    onTTFB(trackWebVital)
    
  }, [pathname, isClient, analyticsTracker, webVitalsTracked])

  // Track page performance
  const trackPagePerformance = (page: string) => {
    if (!isClient || typeof window === 'undefined') return
    
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.fetchStart
        const renderTime = navigation.domContentLoadedEventEnd - navigation.fetchStart
        
        // Get connection info if available
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
        const networkSpeed = connection ? connection.effectiveType || 'unknown' : 'unknown'
        
        // Send performance data
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'performance',
            data: {
              page,
              loadTime,
              renderTime,
              networkSpeed,
              performance: {
                loadTime,
                renderTime,
                networkSpeed
              }
            }
          })
        }).catch(error => {
          console.error('Performance tracking error:', error)
        })
      }
    } catch (error) {
      console.error('Error tracking page performance:', error)
    }
  }

  // Initialize tracking
  useEffect(() => {
    if (!isClient || !analyticsTracker || typeof window === 'undefined') return

    let handlers: Array<() => void> = []

    try {
      // Track clicks on important elements
      const handleClick = (event: MouseEvent) => {
        try {
          const target = event.target as HTMLElement
          if (!target) return

          // Track CTA clicks
          if (target.classList?.contains('btn') || target.tagName === 'BUTTON') {
            analyticsTracker.trackEvent('cta_click', {
              element: target.tagName,
              text: target.textContent || '',
              page: pathname,
              position: {
                x: event.clientX,
                y: event.clientY
              }
            })
          }

          // Track link clicks
          if (target.tagName === 'A' || target.closest?.('a')) {
            const link = target.closest('a') || target as HTMLAnchorElement
            if (link?.href) {
              analyticsTracker.trackEvent('link_click', {
                href: link.href,
                text: link.textContent || '',
                page: pathname,
                isExternal: link.hostname !== window.location.hostname
              })
            }
          }
        } catch (error) {
          console.error('Error in click handler:', error)
        }
      }

      // Track form submissions
      const handleFormSubmit = (event: Event) => {
        try {
          const form = event.target as HTMLFormElement
          if (form && form.tagName === 'FORM') {
            analyticsTracker.trackEvent('form_submit', {
              formId: form.id || '',
              action: form.action || '',
              page: pathname
            })
          }
        } catch (error) {
          console.error('Error in form submit handler:', error)
        }
      }

      // Add event listeners
      if (window.addEventListener) {
        window.addEventListener('click', handleClick, { passive: true })
        window.addEventListener('submit', handleFormSubmit, { passive: true })
        
        handlers.push(() => {
          window.removeEventListener('click', handleClick)
          window.removeEventListener('submit', handleFormSubmit)
        })
      }
    } catch (error) {
      console.error('Error setting up analytics tracking:', error)
    }

    // Cleanup function
    return () => {
      handlers.forEach(handler => {
        try {
          handler()
        } catch (error) {
          console.error('Error in cleanup:', error)
        }
      })
    }
  }, [pathname, isClient, analyticsTracker])

  return <>{children}</>
}

// Hook for manual event tracking
export function useAnalytics() {
  const [tracker, setTracker] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@/lib/analytics').then(({ analyticsTracker }) => {
        setTracker(analyticsTracker)
      }).catch(error => {
        console.error('Failed to load analytics in hook:', error)
      })
    }
  }, [])

  const trackEvent = (eventType: string, data: any) => {
    if (tracker) {
      tracker.trackEvent(eventType, data)
    }
  }

  const trackPageView = (page: string, title: string) => {
    if (tracker) {
      tracker.trackPageView(page, title)
    }
  }

  return {
    trackEvent,
    trackPageView,
    visitorId: tracker?.getVisitorId() || null,
    sessionId: tracker?.getSessionId() || null
  }
}
