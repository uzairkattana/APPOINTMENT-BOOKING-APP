"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  BarChart3,
  Settings,
  Database,
  UserCheck,
  PillIcon as Prescription,
  Activity,
  X,
  ChevronDown,
  ChevronRight,
  LogOut,
  User,
  HelpCircle,
  Clock,
  TrendingUp,
  Eye,
  DollarSign,
  Star,
  MapPin,
  Search,
  Menu
} from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
  currentPath?: string
}

interface MenuItem {
  id: string
  title: string
  href?: string
  icon: any
  description?: string
  badge?: string
  children?: MenuItem[]
  category?: string
}

const sidebarItems: MenuItem[] = [
  {
    id: "overview",
    title: "Overview",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    description: "Main dashboard",
    category: "main"
  },
  {
    id: "patients",
    title: "Patient Management",
    icon: Users,
    description: "Manage patients",
    category: "core",
    children: [
      { id: "patient-tracking", title: "Patient Tracking", href: "/admin/patient-tracking", icon: Activity },
    ]
  },
  {
    id: "medical",
    title: "Medical History",
    href: "/medical-history",
    icon: FileText,
    description: "Patient health records",
    category: "core"
  },
  {
    id: "prescriptions",
    title: "Prescriptions",
    href: "/admin/prescription",
    icon: Prescription,
    description: "Digital prescriptions",
    category: "core"
  },
  {
    id: "money-management",
    title: "Money Management",
    href: "/admin/money-management",
    icon: DollarSign,
    description: "Financial records & payments",
    category: "core",
    badge: "Secure"
  },
  {
    id: "analytics",
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    description: "Performance data",
    category: "insights"
  },
  {
    id: "website-analytics",
    title: "Website Visitor Analytics",
    href: "/admin/website-analytics",
    icon: TrendingUp,
    description: "Real-time website tracking",
    badge: "Live",
    category: "insights"
  },
  {
    id: "administration",
    title: "Administration",
    icon: Settings,
    description: "System management",
    category: "admin",
    children: [
      { id: "settings", title: "Basic Settings", href: "/admin/settings", icon: Settings },
      { id: "location-settings", title: "Location & Maps", href: "/admin/location-settings", icon: MapPin },
      { id: "audit-logs", title: "Audit Logs", href: "/admin/audit-logs", icon: Activity },
      { id: "staff-access", title: "Staff Access", href: "/admin/staff-access", icon: UserCheck },
    ]
  },
  {
    id: "staff",
    title: "Staff Management",
    href: "/staff-dashboard",
    icon: UserCheck,
    description: "Manage staff",
    category: "admin"
  }
]

export default function AdminSidebar({ isOpen, onClose, currentPath }: AdminSidebarProps) {
  const router = useRouter()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [currentTime, setCurrentTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Ensure component is mounted on client side
  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
  }, [])

  // Update time every minute
  useEffect(() => {
    if (!mounted) return
    
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [mounted])

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId)
    } else {
      newExpanded.add(itemId)
    }
    setExpandedItems(newExpanded)
  }

  const handleNavigation = (href: string) => {
    if (href) {
      console.log('AdminSidebar: Navigating to:', href)
      router.push(href)
      // Auto-close sidebar after navigation for better UX
      onClose()
    }
  }

  const handleLogout = () => {
    // Add logout logic here
    router.push('/staff-login')
    onClose()
  }

  const isActiveItem = (item: MenuItem): boolean => {
    if (item.href === currentPath) return true
    if (item.children) {
      return item.children.some(child => child.href === currentPath)
    }
    return false
  }

  // Filter menu items by search query
  const filteredItems = sidebarItems.filter(item => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    const matchesParent = item.title.toLowerCase().includes(query) || 
                         item.description?.toLowerCase().includes(query)
    const matchesChild = item.children?.some(child => 
      child.title.toLowerCase().includes(query)
    )
    return matchesParent || matchesChild
  })

  // Auto-expand items with matching children when searching
  useEffect(() => {
    if (searchQuery) {
      const newExpanded = new Set<string>()
      filteredItems.forEach(item => {
        if (item.children?.some(child => 
          child.title.toLowerCase().includes(searchQuery.toLowerCase())
        )) {
          newExpanded.add(item.id)
        }
      })
      setExpandedItems(newExpanded)
    }
  }, [searchQuery])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop with smooth fade - applies to entire dashboard on all screen sizes */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sidebar with smooth slide animation - Responsive width */}
      <aside 
        className={`fixed top-0 left-0 h-screen w-full sm:w-80 md:w-72 lg:w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`} 
        style={{ maxHeight: '100vh', overflowY: 'hidden' }}
        role="navigation"
        aria-label="Admin Navigation"
      >
        {/* Professional Header - Fixed height with better mobile sizing */}
        <div className="flex-shrink-0 bg-gradient-to-br from-[#0d5c75] via-[#1a6b7d] to-[#2a9d8f] text-white relative overflow-hidden">
          {/* Subtle background pattern - Hidden on mobile for performance */}
          <div className="absolute inset-0 opacity-10 hidden sm:block">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-8 translate-x-8"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-4 -translate-x-4"></div>
          </div>
          
          <div className="relative z-10 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
                  <Image
                    src="/images/gonstead-chiropractic-logo-new.png"
                    alt="Gonstead Logo"
                    width={isMobile ? 28 : 36}
                    height={isMobile ? 28 : 36}
                    className="object-contain"
                    priority
                    onError={(e) => {
                      console.log('Image failed to load, showing fallback');
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                  <div className="text-white font-bold text-xs sm:text-sm" style={{ display: 'none' }}>
                    GC
                  </div>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold font-poppins tracking-wide">Admin Portal</h2>
                  <p className="text-xs sm:text-sm text-white/90 font-medium">Management System</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-1.5 sm:p-2 transition-all duration-200 shrink-0"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
            
            {/* Doctor Info Card - Compact on mobile with right-shifted profile */}
            <div className="bg-white/15 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 shadow-inner">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 pl-2 sm:pl-3">
                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-white/30 rounded-full flex items-center justify-center shrink-0 overflow-hidden border-2 border-white/40">
                  <Image
                    src="/images/patient-profile.jpg"
                    alt="Dr. Bashir Khan"
                    width={44}
                    height={44}
                    className="object-cover w-full h-full"
                    style={{ objectPosition: '65% center' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.parentElement?.querySelector('.fallback-icon') as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="fallback-icon w-full h-full items-center justify-center" style={{ display: 'none' }}>
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs font-bold text-white truncate leading-tight">Dr. Bashir Khan</p>
                  <p className="text-[9px] sm:text-[10px] text-white/80 leading-tight">Gonstead Specialist</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] sm:text-xs text-white/70">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="hidden xs:inline">{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="xs:hidden">{currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                </span>
                <span className="bg-green-500/30 px-2 py-0.5 sm:py-1 rounded-full text-green-100 font-medium">
                  Online
                </span>
              </div>
            </div>

            {/* Search Bar for quick navigation */}
            <div className="mt-3 sm:mt-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              <Input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-9 pr-3 py-2 text-sm rounded-lg focus:bg-white/15 focus:border-white/40 transition-all"
                aria-label="Search navigation menu"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3 text-white/60" />
                </button>
              )}
            </div>
          </div>
        </div>

      {/* Scrollable Navigation Menu - Takes remaining space */}
        <nav className="admin-sidebar-scroll" aria-label="Main menu">
          <div className="p-2 sm:p-3 space-y-1">
            {filteredItems.length === 0 && searchQuery && (
              <div className="text-center py-8 text-gray-500 text-sm">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No menu items found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            )}
            {filteredItems.map((item) => {
              const Icon = item.icon
              const isActive = isActiveItem(item)
              const isExpanded = expandedItems.has(item.id)
              const hasChildren = item.children && item.children.length > 0
              
              return (
                <div key={item.id} className="space-y-1">
                  {/* Main Menu Item */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      if (hasChildren) {
                        console.log('AdminSidebar: Toggling expansion for:', item.id)
                        toggleExpanded(item.id)
                      } else if (item.href) {
                        console.log('AdminSidebar: Direct navigation to:', item.href)
                        handleNavigation(item.href)
                        // Sidebar will auto-close via handleNavigation
                      }
                    }}
                    className={`
                      w-full text-left p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-200 group relative touch-manipulation
                      ${
                        isActive 
                          ? 'bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white shadow-lg border-l-4 border-white/30' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 hover:shadow-sm active:scale-[0.98]'
                      }
                    `}
                    aria-expanded={hasChildren ? isExpanded : undefined}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className={`
                          w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all duration-200 shrink-0
                          ${
                            isActive 
                              ? 'bg-white/25 shadow-sm' 
                              : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-[#0d5c75]/10'
                          }
                        `}>
                          <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isActive ? 'text-white' : 'text-[#0d5c75] dark:text-[#2a9d8f]'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <h3 className={`font-semibold text-xs sm:text-sm truncate ${
                              isActive ? 'text-white' : 'text-gray-800 dark:text-gray-100'
                            }`}>
                              {item.title}
                            </h3>
                            {item.badge && (
                              <Badge variant={isActive ? 'secondary' : 'default'} className="text-[10px] sm:text-xs px-1 sm:px-1.5 py-0 sm:py-0.5 shrink-0">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          {item.description && !isMobile && (
                            <p className={`text-xs mt-0.5 truncate ${
                              isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {hasChildren && (
                        <ChevronDown className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform duration-200 shrink-0 ${
                          isExpanded ? 'rotate-180' : 'rotate-0'
                        } ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                      )}
                    </div>
                  </button>
                  
                  {/* Submenu Items */}
                  {hasChildren && (
                    <div className={`overflow-hidden transition-all duration-200 ${
                      isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="ml-4 sm:ml-6 space-y-0.5 sm:space-y-1 border-l-2 border-gray-100 dark:border-gray-700 pl-3 sm:pl-4">
                        {item.children?.map((child) => {
                          const ChildIcon = child.icon
                          const isChildActive = child.href === currentPath
                          
                          return (
                            <button
                              key={child.id}
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                console.log('AdminSidebar: Child navigation to:', child.href)
                                if (child.href) {
                                  handleNavigation(child.href)
                                }
                              }}
                              className={`
                                w-full text-left p-2 sm:p-2.5 rounded-lg transition-all duration-200 group touch-manipulation
                                ${
                                  isChildActive 
                                    ? 'bg-[#0d5c75]/10 dark:bg-[#2a9d8f]/20 text-[#0d5c75] dark:text-[#2a9d8f] border-l-2 border-[#0d5c75] dark:border-[#2a9d8f]' 
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 active:scale-[0.98]'
                                }
                              `}
                              aria-current={isChildActive ? 'page' : undefined}
                            >
                              <div className="flex items-center gap-2 sm:gap-2.5">
                                <ChildIcon className={`h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 ${
                                  isChildActive ? 'text-[#0d5c75] dark:text-[#2a9d8f]' : 'text-gray-500 dark:text-gray-400'
                                }`} />
                                <span className={`text-xs sm:text-sm font-medium truncate ${
                                  isChildActive ? 'text-[#0d5c75] dark:text-[#2a9d8f]' : 'text-gray-700 dark:text-gray-200'
                                }`}>
                                  {child.title}
                                </span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {/* Extra padding at the bottom to ensure last items are accessible */}
          <div className="h-12 sm:h-16"></div>
        </nav>

        {/* Professional Footer - Fixed at bottom with mobile optimization */}
        <footer className="flex-shrink-0 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
          <div className="p-3 sm:p-4">
            {/* Help and Logout */}
            <div className="flex gap-2 mb-2 sm:mb-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleNavigation('/admin/help')}
                className="flex-1 text-gray-600 dark:text-gray-300 hover:text-[#0d5c75] dark:hover:text-[#2a9d8f] hover:bg-[#0d5c75]/5 dark:hover:bg-[#2a9d8f]/10 transition-all duration-200 touch-manipulation active:scale-95 text-xs sm:text-sm"
              >
                <HelpCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                <span className="font-medium">Help</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
                className="flex-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 touch-manipulation active:scale-95 text-xs sm:text-sm"
              >
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                <span className="font-medium">Logout</span>
              </Button>
            </div>
            
            {/* Clinic Info - Hidden on small mobile */}
            <div className="hidden xs:block text-center border-t border-gray-200 dark:border-gray-700 pt-2 sm:pt-3">
              <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-semibold">
                Gonstead Chiropractic Management
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-500 mt-0.5 sm:mt-1">
                Professional Healthcare System v2.0
              </p>
            </div>
          </div>
        </footer>
      </aside>
    </>
  )
}
