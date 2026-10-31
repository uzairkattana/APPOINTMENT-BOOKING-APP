"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Settings,
  UserCheck,
  PillIcon as Prescription,
  X,
  LogOut,
  HelpCircle,
  Clock,
  TrendingUp,
  DollarSign,
  MapPin,
  Search,
  ShieldCheck,
  ChevronRight
} from "lucide-react"

export interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
  currentPath?: string
}

export interface MenuItem {
  id: string
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
  badge?: string
  badgeType?: "live" | "secure" | "default"
  children?: MenuItem[]
}

export interface NavSection {
  id: string
  label: string
  items: MenuItem[]
}

// Structured Rules & Hierarchical Sections for the Admin Navigation
const navSections: NavSection[] = [
  {
    id: "main",
    label: "Main Navigation",
    items: [
      {
        id: "overview",
        title: "Overview",
        href: "/admin/dashboard/",
        icon: LayoutDashboard,
        description: "Dashboard metrics & patient queue",
      },
    ],
  },
  {
    id: "clinical",
    label: "Clinical Operations",
    items: [
      {
        id: "medical-history",
        title: "Medical History",
        href: "/medical-history/",
        icon: FileText,
        description: "Patient clinical health records",
      },
      {
        id: "prescriptions",
        title: "Prescriptions",
        href: "/admin/prescription/",
        icon: Prescription,
        description: "Digital prescriptions & Rx",
      },
    ],
  },
  {
    id: "financial",
    label: "Financial & Revenue",
    items: [
      {
        id: "money-management",
        title: "Money Management",
        href: "/admin/money-management/",
        icon: DollarSign,
        description: "Revenue, payments & billing",
        badge: "Secure",
        badgeType: "secure",
      },
    ],
  },
  {
    id: "intelligence",
    label: "Intelligence & Insights",
    items: [
      {
        id: "analytics",
        title: "Clinic Analytics",
        href: "/admin/analytics/",
        icon: BarChart3,
        description: "Appointments & clinical trends",
      },
      {
        id: "website-analytics",
        title: "Website Visitor Analytics",
        href: "/admin/website-analytics/",
        icon: TrendingUp,
        description: "Real-time traffic & visitors",
        badge: "Live",
        badgeType: "live",
      },
    ],
  },
  {
    id: "administration",
    label: "System & Administration",
    items: [
      {
        id: "settings",
        title: "Settings",
        href: "/admin/settings/",
        icon: Settings,
        description: "Clinic preferences, location & setup",
      },
      {
        id: "location-settings",
        title: "Location & Maps",
        href: "/admin/location-settings/",
        icon: MapPin,
        description: "Clinic address & Google Maps",
      },
      {
        id: "audit-logs",
        title: "Security Audit Logs",
        href: "/admin/audit-logs/",
        icon: ShieldCheck,
        description: "Activity logs & audit trails",
      },
      {
        id: "staff-access",
        title: "Staff Access & Roles",
        href: "/admin/staff-access/",
        icon: UserCheck,
        description: "User permissions & security",
      },
    ],
  },
]

export default function AdminSidebar({ isOpen, onClose, currentPath }: AdminSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const activePath = currentPath || pathname || ""

  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Mount effect & clock interval
  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Lock body scroll on small screens when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Close sidebar on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  const handleNavigation = (href: string) => {
    if (href) {
      onClose()
      router.push(href)
    }
  }

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_authenticated")
      localStorage.removeItem("admin_email")
      sessionStorage.clear()
    }
    onClose()
    router.replace("/admin/auth/")
    if (typeof window !== "undefined") {
      window.location.replace("/admin/auth/")
    }
  }

  // Path normalization to handle trailing slashes robustly
  const normalizePath = (p?: string): string => {
    if (!p) return ""
    return p.replace(/\/+$/, "").toLowerCase()
  }

  const isItemActive = (href: string): boolean => {
    const normActive = normalizePath(activePath)
    const normHref = normalizePath(href)
    if (!normActive && !normHref) return false
    return normActive === normHref
  }

  // Filter sections and items based on search input
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return navSections

    const query = searchQuery.toLowerCase().trim()
    return navSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          const matchesTitle = item.title.toLowerCase().includes(query)
          const matchesDesc = item.description?.toLowerCase().includes(query)
          const matchesBadge = item.badge?.toLowerCase().includes(query)
          return matchesTitle || matchesDesc || matchesBadge
        }),
      }))
      .filter((section) => section.items.length > 0)
  }, [searchQuery])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop overlay with blur */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Responsive Sidebar Drawer (Mobile, Tablet & Desktop) */}
      <aside
        className={`fixed top-0 left-0 h-full w-[88vw] max-w-[340px] sm:w-80 md:w-80 lg:w-84 bg-white dark:bg-gray-900 shadow-2xl z-50 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ maxHeight: "100vh" }}
        role="navigation"
        aria-label="Admin Navigation"
      >
        {/* Sleek Admin Header (No Doctor Profile Card) */}
        <div className="flex-shrink-0 bg-gradient-to-br from-[#0a4657] via-[#0d5c75] to-[#1a6b7d] text-white p-4 sm:p-5 relative shadow-md">
          {/* Header Top: Logo & Title + Close Button */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/20 backdrop-blur-md p-1.5 flex items-center justify-center border border-white/30 shadow-md shrink-0">
                <Image
                  src="/images/gonstead-chiropractic-logo-new.png"
                  alt="Gonstead Logo"
                  width={34}
                  height={34}
                  className="object-contain w-full h-full"
                  priority
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-bold font-poppins tracking-wide text-white truncate leading-tight">
                  Admin Portal
                </h2>
                <p className="text-[11px] sm:text-xs text-white/80 font-medium truncate">
                  Gonstead Chiropractic
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-9 w-9 rounded-full text-white/90 hover:text-white hover:bg-white/20 active:scale-95 transition-all shrink-0"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* System Status & Real-time Clock Bar */}
          <div className="flex items-center justify-between pt-2 pb-1 border-t border-white/15 text-[11px] font-medium text-white/85">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span>System Online</span>
            </div>

            <div className="flex items-center gap-1 text-white/80">
              <Clock className="h-3.5 w-3.5 text-white/70" />
              <span>
                {mounted && currentTime
                  ? currentTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
                  : "--:--"}
              </span>
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/60 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search administration..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-8 pr-8 text-xs rounded-lg focus:bg-white/15 focus:border-white/40 focus:ring-0 transition-all"
              aria-label="Filter administration tools"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded text-white/70 hover:text-white"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content Container (Navigation Sections + Footer at the end of scroll) */}
        <div className="admin-sidebar-scroll flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col justify-between">
          <nav
            className="px-2 py-3 space-y-4"
            aria-label="Admin Sections"
          >
          {filteredSections.length === 0 ? (
            <div className="text-center py-10 px-4 text-gray-500 dark:text-gray-400">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-40 text-gray-400" />
              <p className="text-xs font-semibold">No matching sections found</p>
              <p className="text-[11px] text-gray-400 mt-1">Try another term or clear the filter</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="mt-3 text-xs h-7 px-3 border-gray-300 dark:border-gray-700"
              >
                Clear Search
              </Button>
            </div>
          ) : (
            filteredSections.map((section, sectionIdx) => (
              <div key={section.id} className="space-y-1">
                {/* Category Rule Divider & Label */}
                <div className={`px-2 pb-1 ${sectionIdx > 0 ? "pt-2" : "pt-0"}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase select-none">
                      {section.label}
                    </span>
                    <div className="h-[1px] flex-1 bg-gray-200/80 dark:bg-gray-800" />
                  </div>
                </div>

                {/* Section Items */}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isActive = isItemActive(item.href)

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleNavigation(item.href)}
                        className={`w-full text-left p-2.5 sm:p-2.5 rounded-xl transition-all duration-150 group flex items-center justify-between min-h-[44px] touch-manipulation ${
                          isActive
                            ? "bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white shadow-md shadow-[#0d5c75]/25 font-medium border-l-4 border-emerald-300"
                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-100/90 dark:hover:bg-gray-800/80 active:scale-[0.98]"
                        }`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                          {/* Icon Container */}
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-teal-50 dark:bg-teal-950/40 text-[#0d5c75] dark:text-[#2a9d8f] group-hover:bg-[#0d5c75]/10 dark:group-hover:bg-[#2a9d8f]/20"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>

                          {/* Text & Description */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs sm:text-sm font-semibold truncate ${
                                  isActive ? "text-white" : "text-gray-800 dark:text-gray-100"
                                }`}
                              >
                                {item.title}
                              </span>

                              {/* Badges */}
                              {item.badge && (
                                <>
                                  {item.badgeType === "live" ? (
                                    <span
                                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                                        isActive
                                          ? "bg-white/20 text-white"
                                          : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                                      }`}
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      {item.badge}
                                    </span>
                                  ) : item.badgeType === "secure" ? (
                                    <span
                                      className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                                        isActive
                                          ? "bg-white/20 text-white"
                                          : "bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30"
                                      }`}
                                    >
                                      {item.badge}
                                    </span>
                                  ) : (
                                    <Badge
                                      variant={isActive ? "secondary" : "default"}
                                      className="text-[9px] px-1 py-0"
                                    >
                                      {item.badge}
                                    </Badge>
                                  )}
                                </>
                              )}
                            </div>

                            {item.description && (
                              <p
                                className={`text-[11px] truncate mt-0.5 ${
                                  isActive
                                    ? "text-white/80"
                                    : "text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                                }`}
                              >
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <ChevronRight
                          className={`h-4 w-4 shrink-0 transition-transform ${
                            isActive
                              ? "text-white/80 translate-x-0.5"
                              : "text-gray-300 dark:text-gray-600 group-hover:text-gray-500 group-hover:translate-x-0.5"
                          }`}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          )}

          </nav>

          {/* Enhanced Footer (Scrolls with content - visible when fully scrolled down) */}
          <footer className="mt-auto bg-gray-50/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-800 p-3 sm:p-3.5 space-y-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {/* Quick jump to Settings */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleNavigation("/admin/settings/")}
              className="w-full justify-between text-xs h-9 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-[#0d5c75]/10 dark:hover:bg-[#2a9d8f]/20 hover:text-[#0d5c75] dark:hover:text-[#2a9d8f] transition-all touch-manipulation"
            >
              <span className="flex items-center gap-2 font-medium">
                <Settings className="h-3.5 w-3.5 text-[#0d5c75] dark:text-[#2a9d8f]" />
                Settings
              </span>
              <ChevronRight className="h-3 w-3 text-gray-400" />
            </Button>

            {/* Help & Logout Row */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleNavigation("/admin/help/")}
                className="flex-1 justify-center text-xs h-9 text-gray-600 dark:text-gray-300 hover:text-[#0d5c75] dark:hover:text-[#2a9d8f] hover:bg-gray-100 dark:hover:bg-gray-800 transition-all touch-manipulation"
              >
                <HelpCircle className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                <span>Help & Docs</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex-1 justify-center text-xs h-9 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all touch-manipulation"
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                <span>Sign Out</span>
              </Button>
            </div>

            {/* Clinic Brand & Security Tag */}
            <div className="text-center pt-1 border-t border-gray-200/60 dark:border-gray-800/80">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                Gonstead Chiropractic Clinic • Admin Portal v2.4
              </p>
            </div>
          </footer>
        </div>
      </aside>
    </>
  )
}
