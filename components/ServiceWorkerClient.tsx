"use client"

import { useEffect, useState } from 'react'
import { syncManager } from '@/lib/sync-manager'

export default function ServiceWorkerClient() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Register service worker + initialize sync (optional)
    syncManager.initialize().catch((error) => {
      console.warn('Service worker initialization failed (app will still work):', error)
    })

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        // Try to precache admin routes lazily
        reg.active?.postMessage({
          type: 'CACHE_URLS',
          urls: ['/admin', '/admin/dashboard', '/offline']
        })
      }).catch((error) => {
        console.warn('Service worker ready failed (app will still work):', error)
      })
    }

    // Handle PWA install prompt capture
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler as any)

    return () => window.removeEventListener('beforeinstallprompt', handler as any)
  }, [])

  // Expose a tiny floating install button when available
  if (!deferredPrompt) return null

  return (
    <button
      onClick={async () => {
        deferredPrompt.prompt()
        try {
          await deferredPrompt.userChoice
        } finally {
          setDeferredPrompt(null)
        }
      }}
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 60,
        padding: '8px 12px',
        background: '#0d5c75',
        color: 'white',
        borderRadius: 9999,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
      }}
      aria-label="Install app"
    >
      Install App
    </button>
  )
}