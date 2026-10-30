"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface ProgressiveEnhancementState {
  isImageOptimizationEnabled: boolean
  isAdvancedAnimationsEnabled: boolean
  isLazyLoadingEnabled: boolean
  isHighQualityImagesEnabled: boolean
  connectionSpeed: 'slow' | 'fast' | 'unknown'
  deviceCapability: 'low' | 'medium' | 'high'
}

interface ProgressiveEnhancementContextType extends ProgressiveEnhancementState {
  enableFeature: (feature: keyof ProgressiveEnhancementState, value: boolean) => void
  shouldLoadFeature: (feature: string) => boolean
  getOptimizedImageQuality: () => number
  getOptimizedImageSizes: (defaultSizes: string) => string
}

const ProgressiveEnhancementContext = createContext<ProgressiveEnhancementContextType | null>(null)

export const useProgressiveEnhancement = () => {
  const context = useContext(ProgressiveEnhancementContext)
  if (!context) {
    throw new Error('useProgressiveEnhancement must be used within ProgressiveEnhancementProvider')
  }
  return context
}

interface ProgressiveEnhancementProviderProps {
  children: React.ReactNode
  preserveFeatures?: boolean // Always true for feature preservation
}

export const ProgressiveEnhancementProvider: React.FC<ProgressiveEnhancementProviderProps> = ({ 
  children, 
  preserveFeatures = true 
}) => {
  const [state, setState] = useState<ProgressiveEnhancementState>({
    isImageOptimizationEnabled: true,
    isAdvancedAnimationsEnabled: true,
    isLazyLoadingEnabled: true,
    isHighQualityImagesEnabled: true,
    connectionSpeed: 'unknown',
    deviceCapability: 'high'
  })

  // Feature-preserving device and connection detection
  useEffect(() => {
    const detectCapabilities = () => {
      try {
        // Detect device capability without breaking existing functionality
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        const deviceMemory = (navigator as any).deviceMemory || 8
        const hardwareConcurrency = navigator.hardwareConcurrency || 4
        
        let deviceCapability: 'low' | 'medium' | 'high' = 'high'
        
        // Conservative capability detection to preserve features
        if (deviceMemory < 4 && hardwareConcurrency < 4 && !gl) {
          deviceCapability = 'low'
        } else if (deviceMemory < 8 || hardwareConcurrency < 8) {
          deviceCapability = 'medium'
        }

        // Connection speed detection (progressive enhancement)
        let connectionSpeed: 'slow' | 'fast' | 'unknown' = 'fast' // Default to fast to preserve features
        
        if ('connection' in navigator) {
          const connection = (navigator as any).connection
          if (connection?.effectiveType) {
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
              connectionSpeed = 'slow'
            } else if (connection.effectiveType === '3g') {
              connectionSpeed = 'fast' // Treat 3g as fast enough for features
            } else {
              connectionSpeed = 'fast'
            }
          }
        }

        // Feature-preserving state updates
        setState(prevState => ({
          ...prevState,
          deviceCapability,
          connectionSpeed,
          // Only disable features in extreme cases, preserve by default
          isAdvancedAnimationsEnabled: preserveFeatures ? true : (deviceCapability !== 'low'),
          isHighQualityImagesEnabled: preserveFeatures ? true : (connectionSpeed !== 'slow'),
          isImageOptimizationEnabled: true, // Always enabled for performance
          isLazyLoadingEnabled: true, // Always enabled for performance
        }))
      } catch (error) {
        // If detection fails, preserve all features
        console.warn('Progressive enhancement detection failed, preserving all features:', error)
      }
    }

    // Run detection after component mount
    detectCapabilities()

    // Listen for connection changes (progressive enhancement)
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      if (connection?.addEventListener) {
        connection.addEventListener('change', detectCapabilities)
        return () => connection.removeEventListener('change', detectCapabilities)
      }
    }
  }, [preserveFeatures])

  // Feature-preserving feature enabler
  const enableFeature = useCallback((feature: keyof ProgressiveEnhancementState, value: boolean) => {
    setState(prevState => ({
      ...prevState,
      [feature]: preserveFeatures ? true : value // Always preserve if preserveFeatures is true
    }))
  }, [preserveFeatures])

  // Smart feature loading check
  const shouldLoadFeature = useCallback((feature: string): boolean => {
    if (preserveFeatures) return true // Always load all features to preserve functionality
    
    switch (feature) {
      case 'animations':
        return state.isAdvancedAnimationsEnabled && state.deviceCapability !== 'low'
      case 'highQualityImages':
        return state.isHighQualityImagesEnabled && state.connectionSpeed !== 'slow'
      case 'lazyLoading':
        return state.isLazyLoadingEnabled
      case 'imageOptimization':
        return state.isImageOptimizationEnabled
      default:
        return true // Default to loading feature to preserve functionality
    }
  }, [state, preserveFeatures])

  // Get optimized image quality based on capabilities
  const getOptimizedImageQuality = useCallback((): number => {
    if (preserveFeatures) return 85 // High quality by default to preserve visual quality
    
    if (state.connectionSpeed === 'slow') return 60
    if (state.deviceCapability === 'low') return 70
    if (state.deviceCapability === 'medium') return 80
    return 85
  }, [state, preserveFeatures])

  // Get optimized image sizes
  const getOptimizedImageSizes = useCallback((defaultSizes: string): string => {
    if (preserveFeatures) return defaultSizes // Preserve original sizes
    
    // Only optimize if not preserving features and connection is slow
    if (state.connectionSpeed === 'slow') {
      return defaultSizes.replace(/\d+px/g, (match) => {
        const size = parseInt(match.replace('px', ''))
        return `${Math.floor(size * 0.8)}px` // Reduce by 20%
      })
    }
    return defaultSizes
  }, [state, preserveFeatures])

  const contextValue: ProgressiveEnhancementContextType = {
    ...state,
    enableFeature,
    shouldLoadFeature,
    getOptimizedImageQuality,
    getOptimizedImageSizes,
  }

  return (
    <ProgressiveEnhancementContext.Provider value={contextValue}>
      {children}
    </ProgressiveEnhancementContext.Provider>
  )
}

// Feature-preserving Enhanced Image component
export interface EnhancedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  quality?: number
  sizes?: string
  priority?: boolean
  className?: string
  preserveQuality?: boolean
  [key: string]: any
}

export const EnhancedImage: React.FC<EnhancedImageProps> = ({
  src,
  alt,
  width,
  height,
  quality = 85,
  sizes,
  priority = false,
  className = '',
  preserveQuality = true,
  ...props
}) => {
  const { getOptimizedImageQuality, getOptimizedImageSizes, shouldLoadFeature } = useProgressiveEnhancement()

  const optimizedQuality = preserveQuality ? quality : getOptimizedImageQuality()
  const optimizedSizes = sizes ? (preserveQuality ? sizes : getOptimizedImageSizes(sizes)) : undefined

  // Always import Next Image to preserve functionality
  const [NextImage, setNextImage] = useState<any>(null)

  useEffect(() => {
    import('next/image').then(module => {
      setNextImage(() => module.default)
    })
  }, [])

  if (!NextImage) {
    // Fallback to regular img to preserve functionality
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        {...props}
      />
    )
  }

  return (
    <NextImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      quality={optimizedQuality}
      sizes={optimizedSizes}
      priority={priority}
      className={className}
      {...props}
    />
  )
}

export default ProgressiveEnhancementProvider
