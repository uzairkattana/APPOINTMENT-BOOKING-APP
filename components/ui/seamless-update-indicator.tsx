"use client"

import React from 'react'
import { RefreshCw, Wifi, WifiOff, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SeamlessUpdateIndicatorProps {
  isUpdating: boolean
  lastSyncTime: Date | null
  errorCount: number
  isOnline: boolean
  updateAvailable: boolean
  isHealthy: boolean
  className?: string
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
  showLastSync?: boolean
}

export function SeamlessUpdateIndicator({
  isUpdating,
  lastSyncTime,
  errorCount,
  isOnline,
  updateAvailable,
  isHealthy,
  className,
  position = 'top-right',
  showLastSync = true
}: SeamlessUpdateIndicatorProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      default:
        return 'top-4 right-4'
    }
  }

  const getStatusIcon = () => {
    if (!isOnline) {
      return <WifiOff className="h-3 w-3 text-red-500" />
    }
    if (isUpdating) {
      return <RefreshCw className="h-3 w-3 text-blue-500 animate-spin" />
    }
    if (errorCount > 0) {
      return <AlertCircle className="h-3 w-3 text-orange-500" />
    }
    if (isHealthy) {
      return <CheckCircle className="h-3 w-3 text-green-500" />
    }
    return <Wifi className="h-3 w-3 text-gray-500" />
  }

  const getStatusText = () => {
    if (!isOnline) return 'Offline'
    if (isUpdating) return 'Syncing...'
    if (errorCount > 0) return `Retry ${errorCount}/3`
    if (updateAvailable) return 'Updated'
    return 'Live'
  }

  const getLastSyncText = () => {
    if (!lastSyncTime) return ''
    const now = new Date()
    const diff = now.getTime() - lastSyncTime.getTime()
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    
    if (minutes > 0) {
      return `${minutes}m ago`
    } else {
      return `${seconds}s ago`
    }
  }

  return (
    <div
      className={cn(
        'fixed z-50 transition-all duration-300',
        getPositionClasses(),
        className
      )}
    >
      {/* Main indicator */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm border transition-all duration-300',
          isUpdating
            ? 'bg-blue-50/90 border-blue-200/50 shadow-sm'
            : updateAvailable
            ? 'bg-green-50/90 border-green-200/50 shadow-sm'
            : errorCount > 0
            ? 'bg-orange-50/90 border-orange-200/50 shadow-sm'
            : !isOnline
            ? 'bg-red-50/90 border-red-200/50 shadow-sm'
            : 'bg-white/70 border-gray-200/50 hover:bg-white/90 hover:shadow-sm'
        )}
      >
        {getStatusIcon()}
        <span
          className={cn(
            'text-xs font-medium transition-colors',
            isUpdating
              ? 'text-blue-700'
              : updateAvailable
              ? 'text-green-700'
              : errorCount > 0
              ? 'text-orange-700'
              : !isOnline
              ? 'text-red-700'
              : 'text-gray-600'
          )}
        >
          {getStatusText()}
        </span>
        {showLastSync && lastSyncTime && !isUpdating && (
          <span className="text-xs text-gray-500 font-normal">
            {getLastSyncText()}
          </span>
        )}
      </div>

      {/* Update pulse animation */}
      {updateAvailable && (
        <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-20" />
      )}
    </div>
  )
}

// Minimal dot indicator for less intrusive display
export function SeamlessDotIndicator({
  isUpdating,
  isOnline,
  errorCount,
  className,
  position = 'top-right'
}: Pick<SeamlessUpdateIndicatorProps, 'isUpdating' | 'isOnline' | 'errorCount' | 'className' | 'position'>) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      default:
        return 'top-4 right-4'
    }
  }

  const getDotColor = () => {
    if (!isOnline) return 'bg-red-500'
    if (isUpdating) return 'bg-blue-500'
    if (errorCount > 0) return 'bg-orange-500'
    return 'bg-green-500'
  }

  return (
    <div
      className={cn(
        'fixed z-50 transition-all duration-300',
        getPositionClasses(),
        className
      )}
    >
      <div
        className={cn(
          'w-3 h-3 rounded-full transition-all duration-300',
          getDotColor(),
          isUpdating && 'animate-pulse'
        )}
      />
      {isUpdating && (
        <div className="absolute inset-0 w-3 h-3 rounded-full bg-blue-400 animate-ping opacity-30" />
      )}
    </div>
  )
}
