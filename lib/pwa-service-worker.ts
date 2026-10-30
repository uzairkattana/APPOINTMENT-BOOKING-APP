/**
 * Gonstead Patient PWA Service Worker & Real-Time Push Notification Engine
 * Manages background service worker registration and pushes native mobile screen alerts even when the website is closed.
 */

export async function registerPatientServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null
  }

  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" })
    console.log("✅ Patient App ServiceWorker registered successfully:", reg.scope)
    return reg
  } catch (err) {
    console.warn("ServiceWorker registration note:", err)
    return null
  }
}

export async function requestPushNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false
  }

  if (Notification.permission === "granted") return true

  if (Notification.permission !== "denied") {
    const perm = await Notification.requestPermission()
    return perm === "granted"
  }

  return false
}

/**
 * Plays a pleasant clinical notification chime using Web Audio API
 */
export function playNotificationChime() {
  if (typeof window === "undefined") return
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()

    // Note 1 (E5)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = "sine"
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime)
    gain1.gain.setValueAtTime(0.15, ctx.currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start()
    osc1.stop(ctx.currentTime + 0.3)

    // Note 2 (B5) - delayed chime
    setTimeout(() => {
      try {
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.type = "sine"
        osc2.frequency.setValueAtTime(987.77, ctx.currentTime)
        gain2.gain.setValueAtTime(0.2, ctx.currentTime)
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.start()
        osc2.stop(ctx.currentTime + 0.4)
      } catch (e) {}
    }, 120)
  } catch (e) {}
}

/**
 * Triggers a real-time system notification on the mobile screen via Service Worker.
 * Displays on lock screen / notification tray even if the app or website tab is closed!
 */
export async function sendBackgroundScreenNotification(params: {
  title: string
  body: string
  url?: string
}) {
  if (typeof window === "undefined" || !("Notification" in window)) return

  try {
    const hasPermission = await requestPushNotificationPermission()
    if (!hasPermission) return

    playNotificationChime()

    const reg = await navigator.serviceWorker.getRegistration()

    const options: NotificationOptions = {
      body: params.body,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      vibrate: [200, 100, 200, 100, 200],
      tag: `gonstead-bg-${Date.now()}`,
      data: { url: params.url || "/patient-portal" },
    }

    if (reg && reg.showNotification) {
      await reg.showNotification(params.title, options)
    } else {
      new Notification(params.title, options)
    }
  } catch (e) {
    console.warn("sendBackgroundScreenNotification error:", e)
  }
}
