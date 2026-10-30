"use client"

interface OfflineData {
  id: string
  type: 'patient' | 'appointment' | 'prescription' | 'sync_queue'
  data: any
  timestamp: number
  synced: boolean
}

interface SyncQueueItem {
  id: string
  action: 'create' | 'update' | 'delete'
  table: string
  data: any
  timestamp: number
  retries: number
  lastError?: string
}

class OfflineStorageManager {
  private static instance: OfflineStorageManager
  private db: IDBDatabase | null = null
  private readonly dbName = 'GonsteadClinicDB'
  private readonly dbVersion = 1

  public static getInstance(): OfflineStorageManager {
    if (!OfflineStorageManager.instance) {
      OfflineStorageManager.instance = new OfflineStorageManager()
    }
    return OfflineStorageManager.instance
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve() // Server-side, skip IndexedDB
        return
      }

      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        console.log('IndexedDB initialized successfully')
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains('patients')) {
          const patientsStore = db.createObjectStore('patients', { keyPath: 'id' })
          patientsStore.createIndex('phone', 'phone', { unique: false })
          patientsStore.createIndex('email', 'email', { unique: false })
          patientsStore.createIndex('synced', 'synced', { unique: false })
        }

        if (!db.objectStoreNames.contains('appointments')) {
          const appointmentsStore = db.createObjectStore('appointments', { keyPath: 'id' })
          appointmentsStore.createIndex('patient_id', 'patient_id', { unique: false })
          appointmentsStore.createIndex('date', 'appointment_date', { unique: false })
        }

        if (!db.objectStoreNames.contains('prescriptions')) {
          const prescriptionsStore = db.createObjectStore('prescriptions', { keyPath: 'id' })
          prescriptionsStore.createIndex('patient_id', 'patient_id', { unique: false })
        }

        if (!db.objectStoreNames.contains('sync_queue')) {
          const syncStore = db.createObjectStore('sync_queue', { keyPath: 'id' })
          syncStore.createIndex('timestamp', 'timestamp', { unique: false })
          syncStore.createIndex('action', 'action', { unique: false })
        }

        console.log('IndexedDB object stores created')
      }
    })
  }

  // Generic CRUD operations
  async save(storeName: string, data: any): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      
      const offlineData: OfflineData = {
        id: data.id || `${storeName}_${Date.now()}`,
        type: storeName as any,
        data: { ...data, offline_created: true },
        timestamp: Date.now(),
        synced: false
      }

      const request = store.put(offlineData.data)
      
      request.onsuccess = () => {
        console.log(`Saved ${storeName} data offline:`, offlineData.id)
        resolve()
      }
      request.onerror = () => reject(request.error)
    })
  }

  async get(storeName: string, id: string): Promise<any> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(id)
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAll(storeName: string): Promise<any[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()
      
      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async delete(storeName: string, id: string): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(id)
      
      request.onsuccess = () => {
        console.log(`Deleted ${storeName} data:`, id)
        resolve()
      }
      request.onerror = () => reject(request.error)
    })
  }

  // Sync queue management
  async addToSyncQueue(action: 'create' | 'update' | 'delete', table: string, data: any): Promise<void> {
    const queueItem: SyncQueueItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      table,
      data,
      timestamp: Date.now(),
      retries: 0
    }

    await this.save('sync_queue', queueItem)
    console.log('Added to sync queue:', queueItem)
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    try {
      const queue = await this.getAll('sync_queue')
      return queue.sort((a, b) => a.timestamp - b.timestamp)
    } catch (error) {
      console.error('Error getting sync queue:', error)
      return []
    }
  }

  async processSyncQueue(): Promise<{ success: number; failed: number }> {
    const queue = await this.getSyncQueue()
    let success = 0
    let failed = 0

    for (const item of queue) {
      try {
        // Process sync item based on action and table
        await this.processSyncItem(item)
        await this.delete('sync_queue', item.id)
        success++
        console.log('Synced queue item:', item.id)
      } catch (error) {
        failed++
        console.error('Failed to sync item:', item.id, error)
        
        // Update retry count
        item.retries++
        item.lastError = error instanceof Error ? error.message : 'Unknown error'
        
        // Remove from queue if too many retries
        if (item.retries >= 3) {
          await this.delete('sync_queue', item.id)
          console.log('Removed failed sync item after max retries:', item.id)
        } else {
          await this.save('sync_queue', item)
        }
      }
    }

    return { success, failed }
  }

  private async processSyncItem(item: SyncQueueItem): Promise<void> {
    // This would integrate with your Supabase API
    switch (item.table) {
      case 'patients':
        if (item.action === 'create') {
          // Call your createPatient API
          await this.syncPatientToServer(item.data, 'create')
        } else if (item.action === 'update') {
          await this.syncPatientToServer(item.data, 'update')
        } else if (item.action === 'delete') {
          await this.syncPatientToServer(item.data, 'delete')
        }
        break
      
      case 'appointments':
        // Similar logic for appointments
        break
      
      case 'prescriptions':
        // Similar logic for prescriptions
        break
    }
  }

  private async syncPatientToServer(data: any, action: string): Promise<void> {
    // Simulate API call - replace with actual Supabase integration
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (navigator.onLine) {
          console.log(`Syncing patient ${action}:`, data.name)
          resolve()
        } else {
          reject(new Error('No internet connection'))
        }
      }, 1000)
    })
  }

  // Patient-specific methods
  async savePatient(patient: any): Promise<void> {
    await this.save('patients', patient)
    
    // Add to sync queue if online
    if (navigator.onLine) {
      await this.addToSyncQueue('create', 'patients', patient)
    }
  }

  async updatePatient(id: string, updates: any): Promise<void> {
    const existing = await this.get('patients', id)
    if (existing) {
      const updated = { ...existing, ...updates, updated_at: new Date().toISOString() }
      await this.save('patients', updated)
      
      if (navigator.onLine) {
        await this.addToSyncQueue('update', 'patients', updated)
      }
    }
  }

  async deletePatient(id: string): Promise<void> {
    const existing = await this.get('patients', id)
    if (existing) {
      await this.delete('patients', id)
      
      if (navigator.onLine) {
        await this.addToSyncQueue('delete', 'patients', { id })
      }
    }
  }

  async getAllPatients(): Promise<any[]> {
    return await this.getAll('patients')
  }

  // Prescription methods
  async savePrescription(prescription: any): Promise<void> {
    await this.save('prescriptions', prescription)
    
    if (navigator.onLine) {
      await this.addToSyncQueue('create', 'prescriptions', prescription)
    }
  }

  async getAllPrescriptions(): Promise<any[]> {
    return await this.getAll('prescriptions')
  }

  // Data migration from localStorage
  async migrateFromLocalStorage(): Promise<void> {
    try {
      // Migrate patients
      const patientsData = localStorage.getItem('gonstead_patients')
      if (patientsData) {
        const patients = JSON.parse(patientsData)
        for (const patient of patients) {
          await this.save('patients', patient)
        }
        console.log('Migrated patients from localStorage to IndexedDB')
      }

      // Migrate prescriptions
      const prescriptionsData = localStorage.getItem('saved_prescriptions')
      if (prescriptionsData) {
        const prescriptions = JSON.parse(prescriptionsData)
        for (const prescription of prescriptions) {
          await this.save('prescriptions', prescription)
        }
        console.log('Migrated prescriptions from localStorage to IndexedDB')
      }

      // Clear localStorage after migration
      localStorage.removeItem('gonstead_patients')
      localStorage.removeItem('saved_prescriptions')
      
      // Set migration flag
      localStorage.setItem('indexeddb_migrated', 'true')
    } catch (error) {
      console.error('Migration error:', error)
    }
  }

  // Check if migration is needed
  async shouldMigrate(): Promise<boolean> {
    const migrated = localStorage.getItem('indexeddb_migrated')
    const hasLocalStorageData = localStorage.getItem('gonstead_patients') || localStorage.getItem('saved_prescriptions')
    
    return !migrated && !!hasLocalStorageData
  }

  // Clear all data (for testing)
  async clearAllData(): Promise<void> {
    if (!this.db) await this.init()
    
    const stores = ['patients', 'appointments', 'prescriptions', 'sync_queue']
    
    for (const storeName of stores) {
      const transaction = this.db!.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      await new Promise<void>((resolve, reject) => {
        const request = store.clear()
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
    }
    
    console.log('Cleared all offline data')
  }

  // Get storage statistics
  async getStorageStats(): Promise<any> {
    const patients = await this.getAllPatients()
    const prescriptions = await this.getAllPrescriptions()
    const syncQueue = await this.getSyncQueue()

    return {
      patients: patients.length,
      prescriptions: prescriptions.length,
      pendingSync: syncQueue.length,
      storageUsed: await this.getStorageUsage()
    }
  }

  private async getStorageUsage(): Promise<number> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      return estimate.usage || 0
    }
    return 0
  }
}

// Export singleton instance
export const offlineStorage = OfflineStorageManager.getInstance()

// Helper hook for React components
export function useOfflineStorage() {
  return offlineStorage
}
