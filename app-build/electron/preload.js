const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // File system dialogs
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
  
  // Menu actions
  onMenuAction: (callback) => ipcRenderer.on('menu-action', callback),
  
  // Platform info
  platform: process.platform,
  
  // Offline/Online status
  isOnline: () => navigator.onLine,
  
  // Service Worker messages
  onServiceWorkerMessage: (callback) => {
    navigator.serviceWorker?.addEventListener('message', callback)
  },
  
  // Environment
  isElectron: true,
  isDev: process.env.NODE_ENV === 'development'
})

// DOM content loaded handler
window.addEventListener('DOMContentLoaded', () => {
  // Add Electron-specific class to body for styling
  document.body.classList.add('electron-app')
  
  // Handle offline/online status
  const updateOnlineStatus = () => {
    document.body.classList.toggle('offline', !navigator.onLine)
    document.body.classList.toggle('online', navigator.onLine)
  }
  
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  updateOnlineStatus()
})
