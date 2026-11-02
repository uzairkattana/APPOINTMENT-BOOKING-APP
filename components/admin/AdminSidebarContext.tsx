"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { usePathname } from "next/navigation"
import AdminSidebar from "@/components/AdminSidebar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

interface AdminSidebarContextType {
  isSidebarOpen: boolean
  setIsSidebarOpen: (open: boolean) => void
  openSidebar: () => void
  closeSidebar: () => void
  toggleSidebar: () => void
}

const AdminSidebarContext = createContext<AdminSidebarContextType | undefined>(undefined)

export function useAdminSidebar() {
  const context = useContext(AdminSidebarContext)
  if (!context) {
    return {
      isSidebarOpen: false,
      setIsSidebarOpen: () => {},
      openSidebar: () => {},
      closeSidebar: () => {},
      toggleSidebar: () => {},
    }
  }
  return context
}

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname() || ""

  const openSidebar = useCallback(() => setIsSidebarOpen(true), [])
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), [])
  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), [])

  // Auto-close on page navigation
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [pathname])

  const isAuthPage = pathname.startsWith("/admin/auth")

  return (
    <AdminSidebarContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        openSidebar,
        closeSidebar,
        toggleSidebar,
      }}
    >
      {children}

      {/* Render sidebar for all non-auth admin pages */}
      {!isAuthPage && (
        <>
          <AdminSidebar
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
            currentPath={pathname}
          />

          {/* Quick-access floating mobile menu button - ensures sidebar is accessible from ANY page and scroll position */}
          {!isSidebarOpen && (
            <button
              type="button"
              onClick={openSidebar}
              className="fixed bottom-5 left-5 z-[90] sm:hidden bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white p-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-2 border-white/40 ring-4 ring-black/10 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              title="Open Admin Navigation Menu"
              aria-label="Open Admin Navigation Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
        </>
      )}
    </AdminSidebarContext.Provider>
  )
}

/**
 * Standard Header Menu Trigger Button for Admin Pages
 */
export function AdminMenuButton({
  className = "",
  label = "Menu",
  showLabel = false,
  variant = "ghost",
}: {
  className?: string
  label?: string
  showLabel?: boolean
  variant?: "ghost" | "outline" | "default" | "secondary"
}) {
  const { openSidebar } = useAdminSidebar()

  return (
    <Button
      type="button"
      variant={variant}
      onClick={openSidebar}
      className={`flex items-center gap-1.5 shrink-0 ${className}`}
      title="Open Admin Menu"
      aria-label="Open Admin Menu"
    >
      <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
      {showLabel && <span className="text-xs sm:text-sm font-medium">{label}</span>}
    </Button>
  )
}
