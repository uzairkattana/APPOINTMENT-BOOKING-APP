// IndexedDB wrapper for local patient data caching
// Provides offline support and faster reads while syncing with Supabase

const DB_NAME = 'GonsteadClinicDB'
const DB_VERSION = 1
const STORES = {
  patients: 'patients',
  prescriptions: 'prescriptions',
  syncQueue: 'syncQueue', // Track pending changes when offline
}

class LocalDatabase {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Patients store
        if (!db.objectStoreNames.contains(STORES.patients)) {
          const patientsStore = db.createObjectStore(STORES.patients, { keyPath: 'id' })
          patientsStore.createIndex('phone', 'phone', { unique: false })
          patientsStore.createIndex('appointment_date', 'appointment_date', { unique: false })
          patientsStore.createIndex('status', 'status', { unique: false })
          patientsStore.createIndex('created_at', 'created_at', { unique: false })
        }

        // Prescriptions store
        if (!db.objectStoreNames.contains(STORES.prescriptions)) {
          const prescriptionsStore = db.createObjectStore(STORES.prescriptions, { keyPath: 'id' })
          prescriptionsStore.createIndex('patient_id', 'patient_id', { unique: false })
          prescriptionsStore.createIndex('prescription_id', 'prescription_id', { unique: true })
        }

        // Sync queue for offline changes
        if (!db.objectStoreNames.contains(STORES.syncQueue)) {
          const syncStore = db.createObjectStore(STORES.syncQueue, { keyPath: 'id', autoIncrement: true })
          syncStore.createIndex('timestamp', 'timestamp', { unique: false })
          syncStore.createIndex('synced', 'synced', { unique: false })
        }
      }
    })
  }

  private async ensureDb(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init()
    }
    return this.db!
  }

  // Generic CRUD operations
  async add(storeName: string, data: any): Promise<void> {
    const db = await this.ensureDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.add({ ...data, _local_timestamp: Date.now() })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async put(storeName: string, data: any): Promise<void> {
    const db = await this.ensureDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put({ ...data, _local_timestamp: Date.now() })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async get(storeName: string, id: string): Promise<any> {
    const db = await this.ensureDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAll(storeName: string): Promise<any[]> {
    const db = await this.ensureDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async delete(storeName: string, id: string): Promise<void> {
    const db = await this.ensureDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(id)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clear(storeName: string): Promise<void> {
    const db = await this.ensureDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // Sync queue operations
  async addToSyncQueue(action: 'create' | 'update' | 'delete', storeName: string, data: any): Promise<void> {
    const db = await this.ensureDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.syncQueue, 'readwrite')
      const store = transaction.objectStore(STORES.syncQueue)
      const request = store.add({
        action,
        storeName,
        data,
        timestamp: Date.now(),
        synced: false,
      })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getPendingSyncItems(): Promise<any[]> {
    const db = await this.ensureDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.syncQueue, 'readonly')
      const store = transaction.objectStore(STORES.syncQueue)
      const index = store.index('synced')
      const request = index.getAll(false)

      request.onsuccess = () => resolve(request.result || [])
      request.onerror = () => reject(request.error)
    })
  }

  async markSynced(id: number): Promise<void> {
    const db = await this.ensureDb()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.syncQueue, 'readwrite')
      const store = transaction.objectStore(STORES.syncQueue)
      const getRequest = store.get(id)

      getRequest.onsuccess = () => {
        const item = getRequest.result
        if (item) {
          item.synced = true
          item.syncedAt = Date.now()
          const updateRequest = store.put(item)
          updateRequest.onsuccess = () => resolve()
          updateRequest.onerror = () => reject(updateRequest.error)
        } else {
          resolve()
        }
      }
      getRequest.onerror = () => reject(getRequest.error)
    })
  }

  // Patient-specific helpers
  async getAllPatients(): Promise<any[]> {
    return this.getAll(STORES.patients)
  }

  async getPatient(id: string): Promise<any> {
    return this.get(STORES.patients, id)
  }

  async savePatient(patient: any): Promise<void> {
    return this.put(STORES.patients, patient)
  }

  async deletePatient(id: string): Promise<void> {
    return this.delete(STORES.patients, id)
  }

  // Bulk sync
  async syncPatientsFromCloud(patients: any[]): Promise<void> {
    const db = await this.ensureDb()
    const transaction = db.transaction(STORES.patients, 'readwrite')
    const store = transaction.objectStore(STORES.patients)

    for (const patient of patients) {
      store.put({ ...patient, _local_timestamp: Date.now() })
    }

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }
}

// Singleton instance
export const localDB = new LocalDatabase()

// Initialize on import (browser only)
if (typeof window !== 'undefined') {
  localDB.init().catch(err => console.error('Failed to initialize local database:', err))
}

