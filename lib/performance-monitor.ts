"use client"

/**
 * Performance Monitoring Utility
 * Tracks Core Web Vitals and page performance metrics
 */

interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private observer: PerformanceObserver | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObserver()
      this.trackInitialLoad()
    }
  }

  private initializeObserver() {
    try {
      // Track Core Web Vitals
      this.observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'largest-contentful-paint') {
            this.recordMetric('LCP', entry.startTime, this.getLCPRating(entry.startTime))
          }
          
          if (entry.entryType === 'first-input') {
            const fidEntry = entry as PerformanceEventTiming
            this.recordMetric('FID', fidEntry.processingStart - fidEntry.startTime, this.getFIDRating(fidEntry.processingStart - fidEntry.startTime))
          }
          
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            this.recordMetric('CLS', (entry as any).value, this.getCLSRating((entry as any).value))
          }
        })
      })

      this.observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
    } catch (error) {
      console.warn('PerformanceObserver not supported:', error)
    }
  }

  private trackInitialLoad() {
    window.addEventListener('load', () => {
      // Track First Contentful Paint
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0] as PerformanceNavigationTiming
      if (fcpEntry) {
        this.recordMetric('FCP', fcpEntry.startTime, this.getFCPRating(fcpEntry.startTime))
      }

      // Track Total Load Time
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.navigationStart
        this.recordMetric('Load Time', loadTime, this.getLoadTimeRating(loadTime))
        
        // Track TTFB (Time to First Byte)
        const ttfb = navigation.responseStart - navigation.navigationStart
        this.recordMetric('TTFB', ttfb, this.getTTFBRating(ttfb))
      }

      // Track bundle sizes
      this.trackBundleSize()
    })
  }

  private trackBundleSize() {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    let totalJSSize = 0
    let totalCSSSize = 0

    resources.forEach((resource) => {
      if (resource.name.includes('.js')) {
        totalJSSize += resource.transferSize || 0
      }
      if (resource.name.includes('.css')) {
        totalCSSSize += resource.transferSize || 0
      }
    })

    this.recordMetric('JS Bundle Size', totalJSSize / 1024, this.getBundleSizeRating(totalJSSize / 1024)) // KB
    this.recordMetric('CSS Bundle Size', totalCSSSize / 1024, this.getBundleSizeRating(totalCSSSize / 1024)) // KB
  }

  private recordMetric(name: string, value: number, rating: 'good' | 'needs-improvement' | 'poor') {
    this.metrics.push({
      name,
      value,
      rating,
      timestamp: Date.now()
    })

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const color = rating === 'good' ? 'green' : rating === 'needs-improvement' ? 'orange' : 'red'
      console.log(`%c${name}: ${value.toFixed(2)}ms (${rating})`, `color: ${color}; font-weight: bold`)
    }
  }

  // Rating functions based on Core Web Vitals thresholds
  private getLCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor'
  }

  private getFIDRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor'
  }

  private getCLSRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor'
  }

  private getFCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor'
  }

  private getLoadTimeRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value <= 3000 ? 'good' : value <= 5000 ? 'needs-improvement' : 'poor'
  }

  private getTTFBRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor'
  }

  private getBundleSizeRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    return value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor'
  }

  // Public methods
  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics]
  }

  public getMetricsByRating(rating: 'good' | 'needs-improvement' | 'poor'): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.rating === rating)
  }

  public logSummary() {
    const summary = {
      total: this.metrics.length,
      good: this.getMetricsByRating('good').length,
      needsImprovement: this.getMetricsByRating('needs-improvement').length,
      poor: this.getMetricsByRating('poor').length
    }

    console.table(this.metrics)
    console.log('Performance Summary:', summary)
  }

  public dispose() {
    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Export types
export type { PerformanceMetric }
export { PerformanceMonitor }
