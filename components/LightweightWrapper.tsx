"use client"

import React, { memo, useMemo, useCallback, useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Lightweight wrapper that preserves all features while optimizing performance
interface LightweightWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  delay?: number
  triggerOnScroll?: boolean
  triggerOnInteraction?: boolean
  preserveFeatures?: boolean
}

// Smart lazy loading that maintains all functionality
const useLightweightLoading = (
  triggerOnScroll = false, 
  triggerOnInteraction = false, 
  delay = 0
) => {
  const [shouldLoad, setShouldLoad] = useState(!triggerOnScroll && !triggerOnInteraction)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (shouldLoad) return

    let timeoutId: NodeJS.Timeout
    let observer: IntersectionObserver

    // Load after delay
    if (delay > 0 && !triggerOnScroll && !triggerOnInteraction) {
      timeoutId = setTimeout(() => setShouldLoad(true), delay)
    }

    // Load on scroll into view
    if (triggerOnScroll) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            if (delay > 0) {
              timeoutId = setTimeout(() => setShouldLoad(true), delay)
            } else {
              setShouldLoad(true)
            }
          }
        },
        { threshold: 0.1, rootMargin: '50px' }
      )

      // Create a dummy element to observe if no element is provided
      const dummyElement = document.createElement('div')
      observer.observe(dummyElement)
    }

    // Load on user interaction
    if (triggerOnInteraction) {
      const handleInteraction = () => {
        setShouldLoad(true)
      }

      const events = ['click', 'scroll', 'keydown', 'mousemove', 'touchstart']
      events.forEach(event => {
        document.addEventListener(event, handleInteraction, { 
          once: true, 
          passive: true 
        })
      })

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, handleInteraction)
        })
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      if (observer) observer.disconnect()
    }
  }, [triggerOnScroll, triggerOnInteraction, delay, shouldLoad])

  return { shouldLoad, isVisible }
}

// Lightweight wrapper component
export const LightweightWrapper = memo<LightweightWrapperProps>(({ 
  children, 
  fallback = null, 
  delay = 0,
  triggerOnScroll = false,
  triggerOnInteraction = false,
  preserveFeatures = true
}) => {
  const { shouldLoad } = useLightweightLoading(
    triggerOnScroll, 
    triggerOnInteraction, 
    delay
  )

  // Always render if preserveFeatures is true (maintains all functionality)
  if (preserveFeatures && !triggerOnScroll && !triggerOnInteraction) {
    return <>{children}</>
  }

  // Smart loading with fallback
  if (!shouldLoad) {
    return fallback ? <>{fallback}</> : null
  }

  return <>{children}</>
})

LightweightWrapper.displayName = 'LightweightWrapper'

// HOC for making components lightweight while preserving features
export const withLightweight = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    delay?: number
    triggerOnScroll?: boolean
    triggerOnInteraction?: boolean
    fallback?: React.ReactNode
    preserveFeatures?: boolean
  } = {}
) => {
  const LightweightComponent = memo<P>((props) => {
    return (
      <LightweightWrapper {...options}>
        <Component {...props} />
      </LightweightWrapper>
    )
  })

  LightweightComponent.displayName = `Lightweight(${Component.displayName || Component.name})`
  return LightweightComponent
}

// Smart dynamic import that preserves all features
export const createLightweightDynamic = <P extends object>(
  importFn: () => Promise<{ default: React.ComponentType<P> }>,
  options: {
    fallback?: React.ComponentType<any>
    preserveFeatures?: boolean
    delay?: number
    ssr?: boolean
  } = {}
) => {
  const { 
    fallback: Fallback, 
    preserveFeatures = true, 
    delay = 0,
    ssr = false 
  } = options

  // If preserveFeatures is true, load immediately to maintain functionality
  if (preserveFeatures && delay === 0) {
    return dynamic(importFn, {
      loading: () => Fallback ? <Fallback /> : null,
      ssr
    })
  }

  // Otherwise, use smart loading
  return dynamic(importFn, {
    loading: () => Fallback ? <Fallback /> : (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-32 w-full flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    ),
    ssr
  })
}

// Lightweight fallback components that maintain visual consistency
export const LightweightFallback = {
  Chatbot: () => (
    <div className="fixed bottom-4 right-4 w-14 h-14 bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] rounded-full shadow-lg animate-pulse flex items-center justify-center">
      <div className="w-6 h-6 bg-white/20 rounded-full"></div>
    </div>
  ),
  
  SportsFloat: () => (
    <div className="fixed top-1/2 right-4 transform -translate-y-1/2 w-12 h-32 bg-gradient-to-b from-[#2a9d8f] to-[#0d5c75] rounded-full shadow-lg animate-pulse"></div>
  ),
  
  Technology: () => (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  ),
  
  WeatherWidget: () => (
    <div className="w-16 h-16 bg-white/10 rounded-lg animate-pulse flex items-center justify-center">
      <div className="w-8 h-8 bg-white/20 rounded-full"></div>
    </div>
  )
}

export default LightweightWrapper
