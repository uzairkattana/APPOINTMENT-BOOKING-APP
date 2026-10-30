"use client"

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface AnalyticsProviderProps {
  children: React.ReactNode
}

// Lightweight analytics that doesn't block performance
export default function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Debounced tracking to reduce performance impact
  useEffect(() => {
    if (!isClient) return

    // Use requestIdleCallback for non-critical tracking
    const trackingCallback = () => {
      // Only track essential metrics
      const startTime = performance.now()
      
      // Simple page view tracking (deferred)
      setTimeout(() => {
        try {
          // Track only essential data
          const basicMetrics = {
            path: pathname,
            timestamp: Date.now(),
            userAgent: navigator.userAgent.slice(0, 100), // Truncate for performance
            referrer: document.referrer || 'direct'
          }
          
          // Non-blocking API call with timeout
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout
          
          fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'page_view',
              data: basicMetrics
            }),
            signal: controller.signal
          }).catch(() => {
            // Silently fail - don't block user experience
          }).finally(() => {
            clearTimeout(timeoutId)
          })
          
        } catch (error) {
          // Silent error handling
        }
      }, 2000) // Delay tracking by 2 seconds
    }

    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(trackingCallback, { timeout: 5000 })
    } else {
      setTimeout(trackingCallback, 3000)
    }
    
  }, [pathname, isClient])

  // Minimal Web Vitals tracking (only on user interaction)
  useEffect(() => {
    if (!isClient) return

    let hasInteracted = false
    
    const handleFirstInteraction = () => {
      if (hasInteracted) return
      hasInteracted = true
      
      // Track Web Vitals only after user interaction
      import('web-vitals').then(({ onCLS, onFCP, onLCP }) => {
        const vitalsCallback = (metric: any) => {
          // Only track if metric is significant
          if (metric.value > 100) { // Only track slow metrics
            fetch('/api/analytics/track', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'web_vitals',
                data: {
                  page: pathname,
                  [metric.name.toLowerCase()]: metric.value
                }
              })
            }).catch(() => {}) // Silent fail
          }
        }

        onCLS(vitalsCallback)
        onFCP(vitalsCallback)
        onLCP(vitalsCallback)
      }).catch(() => {}) // Silent fail
    }

    // Listen for first user interaction
    const events = ['click', 'scroll', 'keydown']
    events.forEach(event => {
      document.addEventListener(event, handleFirstInteraction, { 
        once: true, 
        passive: true 
      })
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFirstInteraction)
      })
    }
  }, [pathname, isClient])

  return <>{children}</>
}

// Simplified hook for manual tracking
export function useAnalytics() {
  const trackEvent = (eventType: string, data: any) => {
    // Non-blocking event tracking
    setTimeout(() => {
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: eventType, data })
      }).catch(() => {}) // Silent fail
    }, 100)
  }

  return { trackEvent }
}
