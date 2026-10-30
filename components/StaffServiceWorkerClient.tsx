"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { syncManager } from "@/lib/sync-manager"

export default function StaffServiceWorkerClient() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const pathname = usePathname()

  const isStaffRoute = pathname === "/staff-dashboard" || pathname?.startsWith("/staff")

  useEffect(() => {
    if (!isStaffRoute) return

    // Register service worker + initialize sync for staff routes (optional)
    syncManager.initialize().catch((error) => {
      console.warn('Staff service worker initialization failed (app will still work):', error)
    })

    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.active?.postMessage({
          type: "CACHE_URLS",
          urls: ["/staff-dashboard", "/staff-login", "/offline"],
        })
      }).catch((error) => {
        console.warn('Staff service worker ready failed (app will still work):', error)
      })
    }

    // Capture PWA install prompt only on staff routes
    const handler = (e: any) => {
      if (!isStaffRoute) return
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener("beforeinstallprompt", handler as any)

    return () => window.removeEventListener("beforeinstallprompt", handler as any)
  }, [isStaffRoute])

  if (!isStaffRoute || !deferredPrompt) return null

  return (
    <>
      <style jsx>{`
        @keyframes slideInStaff {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .staff-install-container {
          position: fixed;
          right: 0;
          bottom: 20%;
          transform: translateY(50%);
          z-index: 60;
          animation: slideInStaff 0.5s ease-out 1s both;
        }

        .staff-install-button {
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
          right: -150px;
          padding: 12px 20px 12px 16px;
          background: linear-gradient(135deg, #0d5c75 0%, #2a9d8f 100%);
          color: white;
          border: none;
          border-radius: 12px 0 0 12px;
          box-shadow: -4px 4px 16px rgba(0, 0, 0, 0.3);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
          overflow: hidden;
        }

        .staff-install-button:hover {
          right: 0;
          padding-right: 24px;
          box-shadow: -6px 6px 24px rgba(0, 0, 0, 0.4);
          background: linear-gradient(135deg, #0a4a5c 0%, #238276 100%);
        }

        .staff-install-button:active {
          transform: scale(0.98);
        }

        .staff-install-icon {
          font-size: 20px;
          transition: transform 0.3s ease;
        }

        .staff-install-button:hover .staff-install-icon {
          transform: scale(1.2) rotate(5deg);
        }

        .staff-install-text {
          opacity: 0;
          max-width: 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .staff-install-button:hover .staff-install-text {
          opacity: 1;
          max-width: 170px;
          margin-left: 4px;
        }

        .staff-install-tab {
          position: absolute;
          left: -2px;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 40px;
          background: linear-gradient(180deg, #22c55e 0%, #16a34a 100%);
          border-radius: 4px 0 0 4px;
          transition: height 0.3s ease;
        }

        .staff-install-button:hover .staff-install-tab {
          height: 60px;
        }

        @media (max-width: 768px) {
          .staff-install-container {
            bottom: 16px;
            transform: none;
          }

          .staff-install-button {
            right: -130px;
            font-size: 14px;
            padding: 10px 16px 10px 12px;
          }
        }
      `}</style>

      <div className="staff-install-container">
        <button
          className="staff-install-button"
          onClick={async () => {
            deferredPrompt.prompt()
            try {
              await deferredPrompt.userChoice
            } finally {
              setDeferredPrompt(null)
            }
          }}
          aria-label="Install Staff App"
        >
          <div className="staff-install-tab"></div>
          <span className="staff-install-icon">📱</span>
          <span className="staff-install-text">Install Staff App</span>
        </button>
      </div>
    </>
  )
}

