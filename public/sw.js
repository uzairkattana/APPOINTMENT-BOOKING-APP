/**
 * Gonstead Chiropractic Patient App - Service Worker
 * Handles background push notifications, offline caching, and lock-screen alerts.
 */

const CACHE_NAME = "gonstead-patient-v1"

// Install Service Worker
self.addEventListener("install", (event) => {
  console.log("[ServiceWorker] Installed successfully.")
  self.skipWaiting()
})

// Activate Service Worker
self.addEventListener("activate", (event) => {
  console.log("[ServiceWorker] Activated.")
  event.waitUntil(self.clients.claim())
})

// Listen for Background Push Events (Real-time device screen notifications)
self.addEventListener("push", (event) => {
  let data = { title: "💬 Dr. Bashir Khan", body: "You have a new message from Gonstead Chiropractic.", url: "/patient-portal" }

  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      data.body = event.data.text()
    }
  }

  const options = {
    body: data.body,
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    vibrate: [200, 100, 200, 100, 200],
    data: { url: data.url || "/patient-portal" },
    actions: [
      { action: "open_portal", title: "📱 Open Patient Chat" },
      { action: "dismiss", title: "Dismiss" },
    ],
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Handle Notification Tap / Click
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "dismiss") return

  const targetUrl = event.notification.data?.url || "/patient-portal"

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("/patient-portal") && "focus" in client) {
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})
