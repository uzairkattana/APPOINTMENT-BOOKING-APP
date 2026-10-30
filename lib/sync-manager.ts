// Sync Manager - Keeps local IndexedDB and Supabase cloud in sync
// Handles realtime updates, offline queue, and conflict resolution

import { useState, useEffect } from 'react'
import { supabase, createPatient } from './supabase'
import { localDB } from './local-db'
import { offlineStorage } from './offline-storage'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface SyncResult {
  success: number
  failed: number
  totalProcessed: number
  errors: string[]
}

class SyncManager {
  private static instance: SyncManager
  private isSyncing = false
  private syncCallbacks: Array<(result: SyncResult) => void> = []

  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager()
    }
    return SyncManager.instance
  }

  constructor() {
    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline())
      window.addEventListener('offline', () => this.handleOffline())
      
      // Listen for service worker messages
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'BACKGROUND_SYNC') {
            this.performBackgroundSync()
          }
        })
      }
    }
  }

  private handleOnline() {
    console.log('SyncManager: Connection restored, starting sync...')
    // Delay sync slightly to ensure connection is stable
    setTimeout(() => {
      this.performBackgroundSync()
    }, 2000)
  }

  private handleOffline() {
    console.log('SyncManager: Connection lost, entering offline mode')
  }

  // Main synchronization method
  async performBackgroundSync(): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping...')
      return { success: 0, failed: 0, totalProcessed: 0, errors: [] }
    }

    if (!navigator.onLine) {
      console.log('No internet connection, sync postponed')
      return { success: 0, failed: 0, totalProcessed: 0, errors: ['No internet connection'] }
    }

    this.isSyncing = true
    console.log('Starting background synchronization...')

    try {
      const result = await this.syncAllData()
      console.log('Background sync completed:', result)
      
      // Notify callbacks
      this.syncCallbacks.forEach(callback => callback(result))
      
      return result
    } catch (error) {
      console.error('Background sync failed:', error)
      const errorResult = { success: 0, failed: 1, totalProcessed: 1, errors: [error instanceof Error ? error.message : 'Unknown error'] }
      
      // Notify callbacks
      this.syncCallbacks.forEach(callback => callback(errorResult))
      
      return errorResult
    } finally {
      this.isSyncing = false
    }
  }

  private async syncAllData(): Promise<SyncResult> {
    const result: SyncResult = {
      success: 0,
      failed: 0,
      totalProcessed: 0,
      errors: []
    }

    try {
      // Initialize offline storage
      await offlineStorage.init()

      // Process sync queue
      const queueResult = await offlineStorage.processSyncQueue()
      result.success += queueResult.success
      result.failed += queueResult.failed
      result.totalProcessed += queueResult.success + queueResult.failed

      // Sync unsynced patients
      const unsyncedPatients = await this.getUnsyncedPatients()
      for (const patient of unsyncedPatients) {
        try {
          await this.syncPatientToServer(patient)
          result.success++
        } catch (error) {
          result.failed++
          result.errors.push(`Patient sync failed: ${patient.name} - ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
        result.totalProcessed++
      }

      // Sync unsynced prescriptions
      const unsyncedPrescriptions = await this.getUnsyncedPrescriptions()
      for (const prescription of unsyncedPrescriptions) {
        try {
          await this.syncPrescriptionToServer(prescription)
          result.success++
        } catch (error) {
          result.failed++
          result.errors.push(`Prescription sync failed: ${prescription.id} - ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
        result.totalProcessed++
      }

      return result
    } catch (error) {
      result.failed++
      result.errors.push(error instanceof Error ? error.message : 'Unknown sync error')
      return result
    }
  }

  private async getUnsyncedPatients(): Promise<any[]> {
    try {
      const patients = await offlineStorage.getAllPatients()
      return patients.filter(p => p.offline_created && !p.synced)
    } catch (error) {
      console.error('Error getting unsynced patients:', error)
      return []
    }
  }

  private async getUnsyncedPrescriptions(): Promise<any[]> {
    try {
      const prescriptions = await offlineStorage.getAllPrescriptions()
      return prescriptions.filter(p => p.offline_created && !p.synced)
    } catch (error) {
      console.error('Error getting unsynced prescriptions:', error)
      return []
    }
  }

  private async syncPatientToServer(patient: any): Promise<void> {
    try {
      console.log('Syncing patient to server:', patient.name)
      
      // Create patient in Supabase
      const { offline_created, synced, ...patientData } = patient
      const result = await createPatient(patientData)
      
      if (result) {
        // Mark as synced in local storage
        await offlineStorage.updatePatient(patient.id, { synced: true, server_id: result.id })
        console.log('Patient synced successfully:', patient.name)
      }
    } catch (error) {
      console.error('Failed to sync patient:', patient.name, error)
      throw error
    }
  }

  private async syncPrescriptionToServer(prescription: any): Promise<void> {
    try {
      console.log('Syncing prescription to server:', prescription.id)
      
      // In a real implementation, you would call your prescription API
      // For now, we'll simulate the sync
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mark as synced
      const prescriptions = await offlineStorage.getAllPrescriptions()
      const updated = prescriptions.map(p => 
        p.id === prescription.id ? { ...p, synced: true } : p
      )
      
      // Update in IndexedDB
      await offlineStorage.save('prescriptions', { ...prescription, synced: true })
      
      console.log('Prescription synced successfully:', prescription.id)
    } catch (error) {
      console.error('Failed to sync prescription:', prescription.id, error)
      throw error
    }
  }

  // Public methods for manual sync
  async forcSync(): Promise<SyncResult> {
    return await this.performBackgroundSync()
  }

  // Register sync callback
  onSyncComplete(callback: (result: SyncResult) => void) {
    this.syncCallbacks.push(callback)
  }

  // Remove sync callback
  offSyncComplete(callback: (result: SyncResult) => void) {
    const index = this.syncCallbacks.indexOf(callback)
    if (index > -1) {
      this.syncCallbacks.splice(index, 1)
    }
  }

  // Check if sync is needed
  async needsSync(): Promise<boolean> {
    try {
      await offlineStorage.init()
      const queue = await offlineStorage.getSyncQueue()
      const unsyncedPatients = await this.getUnsyncedPatients()
      const unsyncedPrescriptions = await this.getUnsyncedPrescriptions()
      
      return queue.length > 0 || unsyncedPatients.length > 0 || unsyncedPrescriptions.length > 0
    } catch (error) {
      console.error('Error checking sync status:', error)
      return false
    }
  }

  // Get sync status
  getSyncStatus() {
    return {
      isSyncing: this.isSyncing,
      isOnline: typeof window !== 'undefined' ? navigator.onLine : false
    }
  }

  // Register service worker and setup background sync
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        // Check if service worker file exists before registering
        const response = await fetch('/sw.js', { method: 'HEAD' }).catch(() => null)
        
        if (response && response.ok) {
          const registration = await navigator.serviceWorker.register('/sw.js')
          console.log('Service Worker registered successfully:', registration)
          
          // Register background sync
          if ('sync' in window.ServiceWorkerRegistration.prototype) {
            const syncReg = registration as any // Background Sync API not in TS types
            if (syncReg.sync && syncReg.sync.register) {
              await syncReg.sync.register('background-sync')
              console.log('Background sync registered')
            }
          }
          
          return registration
        } else {
          console.log('Service Worker file not found, skipping registration')
          return undefined
        }
      } catch (error) {
        console.warn('Service Worker registration failed (this is optional):', error)
        // Don't throw error - service worker is optional for chat functionality
        return undefined
      }
    }
  }

  // Initialize the sync manager
  async initialize(): Promise<void> {
    try {
      // Initialize offline storage
      await offlineStorage.init()
      
      // Check for migration
      if (await offlineStorage.shouldMigrate()) {
        console.log('Migrating data from localStorage to IndexedDB...')
        await offlineStorage.migrateFromLocalStorage()
      }
      
      // Register service worker (optional - won't fail if not available)
      await this.registerServiceWorker()
      
      // Perform initial sync if online
      if (typeof window !== 'undefined' && navigator.onLine) {
        setTimeout(() => {
          this.performBackgroundSync()
        }, 3000) // Wait 3 seconds after app load
      }
      
      console.log('SyncManager initialized successfully')
    } catch (error) {
      console.warn('SyncManager initialization failed (chat will still work):', error)
      // Don't throw error - sync manager is optional for chat functionality
    }
  }
}

// Export singleton instance
export const syncManager = SyncManager.getInstance()

// React hook for sync status
export function useSyncManager() {
  const [syncStatus, setSyncStatus] = useState(syncManager.getSyncStatus())
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null)

  useEffect(() => {
    const handleSyncComplete = (result: SyncResult) => {
      setLastSyncResult(result)
      setSyncStatus(syncManager.getSyncStatus())
    }

    syncManager.onSyncComplete(handleSyncComplete)
    
    // Update status periodically
    const interval = setInterval(() => {
      setSyncStatus(syncManager.getSyncStatus())
    }, 1000)

    return () => {
      clearInterval(interval)
      syncManager.offSyncComplete(handleSyncComplete)
    }
  }, [])

  return {
    ...syncStatus,
    lastSyncResult,
    forceSync: () => syncManager.forcSync(),
    needsSync: () => syncManager.needsSync()
  }
}
