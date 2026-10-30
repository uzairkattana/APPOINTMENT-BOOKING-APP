import { useState, useEffect, useCallback, useRef } from 'react'

interface SilentSyncOptions {
  syncInterval?: number // in milliseconds
  enableRealTimeSync?: boolean
  enableVisibilitySync?: boolean // sync when tab becomes visible
  enableNetworkSync?: boolean // sync when network comes back online
  maxRetries?: number
  retryDelay?: number
}

interface SyncState {
  isUpdating: boolean
  lastSyncTime: Date | null
  errorCount: number
  isOnline: boolean
  updateAvailable: boolean
}

export function useSilentSync(
  syncFunction: () => Promise<any>,
  dependencies: any[] = [],
  options: SilentSyncOptions = {}
) {
  const {
    syncInterval = 30000, // 30 seconds default
    enableRealTimeSync = true,
    enableVisibilitySync = true,
    enableNetworkSync = true,
    maxRetries = 3,
    retryDelay = 5000
  } = options

  const [syncState, setSyncState] = useState<SyncState>({
    isUpdating: false,
    lastSyncTime: null,
    errorCount: 0,
    isOnline: navigator.onLine,
    updateAvailable: false
  })

  const syncTimeoutRef = useRef<NodeJS.Timeout>()
  const retryTimeoutRef = useRef<NodeJS.Timeout>()
  const isComponentMountedRef = useRef(true)

  // Silent sync function that doesn't disrupt UI
  const performSilentSync = useCallback(async (showUpdate = false) => {
    if (!isComponentMountedRef.current || syncState.isUpdating) return

    try {
      setSyncState(prev => ({ 
        ...prev, 
        isUpdating: true, 
        updateAvailable: showUpdate 
      }))

      await syncFunction()

      if (isComponentMountedRef.current) {
        setSyncState(prev => ({
          ...prev,
          isUpdating: false,
          lastSyncTime: new Date(),
          errorCount: 0,
          updateAvailable: false
        }))
      }
    } catch (error) {
      if (isComponentMountedRef.current) {
        const newErrorCount = syncState.errorCount + 1
        setSyncState(prev => ({
          ...prev,
          isUpdating: false,
          errorCount: newErrorCount,
          updateAvailable: false
        }))

        // Retry with exponential backoff if under max retries
        if (newErrorCount < maxRetries) {
          const delay = retryDelay * Math.pow(2, newErrorCount - 1)
          retryTimeoutRef.current = setTimeout(() => {
            performSilentSync(false)
          }, delay)
        }
      }
    }
  }, [syncFunction, syncState.isUpdating, syncState.errorCount, maxRetries, retryDelay])

  // Set up periodic silent sync
  useEffect(() => {
    if (!enableRealTimeSync) return

    const startPeriodicSync = () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }

      syncTimeoutRef.current = setTimeout(() => {
        performSilentSync(true)
        startPeriodicSync() // Schedule next sync
      }, syncInterval)
    }

    // Initial sync after a short delay to avoid disrupting page load
    const initialTimeout = setTimeout(() => {
      performSilentSync(false)
      startPeriodicSync()
    }, 2000)

    return () => {
      clearTimeout(initialTimeout)
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [performSilentSync, syncInterval, enableRealTimeSync, ...dependencies])

  // Sync when tab becomes visible
  useEffect(() => {
    if (!enableVisibilitySync) return

    const handleVisibilityChange = () => {
      if (!document.hidden && syncState.isOnline) {
        // Small delay to avoid syncing immediately when switching tabs rapidly
        setTimeout(() => performSilentSync(false), 1000)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [performSilentSync, enableVisibilitySync, syncState.isOnline])

  // Sync when network comes back online
  useEffect(() => {
    if (!enableNetworkSync) return

    const handleOnline = () => {
      setSyncState(prev => ({ ...prev, isOnline: true }))
      // Immediate sync when coming back online
      setTimeout(() => performSilentSync(false), 500)
    }

    const handleOffline = () => {
      setSyncState(prev => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [performSilentSync, enableNetworkSync])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isComponentMountedRef.current = false
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

  // Manual sync trigger
  const triggerSync = useCallback(() => {
    performSilentSync(true)
  }, [performSilentSync])

  return {
    ...syncState,
    triggerSync,
    isHealthy: syncState.errorCount < maxRetries && syncState.isOnline
  }
}

// Hook for seamless data updates without loading states
export function useSeamlessData<T>(
  initialData: T,
  fetchFunction: () => Promise<T>,
  syncOptions?: SilentSyncOptions
) {
  const [data, setData] = useState<T>(initialData)
  const [isInitialized, setIsInitialized] = useState(false)

  const syncData = useCallback(async () => {
    try {
      const newData = await fetchFunction()
      setData(newData)
      if (!isInitialized) {
        setIsInitialized(true)
      }
    } catch (error) {
      console.warn('Silent data sync failed:', error)
      // Don't throw error to avoid disrupting UI
    }
  }, [fetchFunction, isInitialized])

  const syncState = useSilentSync(syncData, [data], {
    syncInterval: 15000, // More frequent for data updates
    ...syncOptions
  })

  return {
    data,
    setData, // Allow manual updates
    isInitialized,
    syncState,
    refresh: syncState.triggerSync
  }
}
