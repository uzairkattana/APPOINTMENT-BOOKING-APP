"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  actualTheme: "light" | "dark"
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")
  const [mounted, setMounted] = useState(false)

  // Handle hydration - prevent initial flash
  useEffect(() => {
    // Get theme from localStorage synchronously to prevent hydration mismatch
    const stored = localStorage.getItem("gonstead-theme") as Theme | null
    const initialTheme = (stored && ["light", "dark"].includes(stored)) ? stored : "light"
    
    // Set theme immediately to prevent flash
    setTheme(initialTheme)
    setMounted(true)
  }, [])

  // Apply theme changes
  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement
    const body = document.body

    // Save to localStorage
    localStorage.setItem("gonstead-theme", theme)

    // Remove existing theme classes
    root.classList.remove("light", "dark")
    body.classList.remove("light", "dark")
    
    // Add new theme classes
    root.classList.add(theme)
    body.classList.add(theme)
    
    // Set CSS custom properties for more reliable theming
    root.setAttribute('data-theme', theme)
  }, [theme, mounted])

  // Render children with default theme until mounted to prevent chunk loading errors
  if (!mounted) {
    return <div className="light" data-theme="light">{children}</div>
  }

  return <ThemeContext.Provider value={{ theme, setTheme, actualTheme: theme, mounted }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    // Return default values if no provider found (e.g., during SSR)
    return {
      theme: 'light' as Theme,
      setTheme: () => {},
      actualTheme: 'light' as 'light' | 'dark',
      mounted: false
    }
  }
  return context
}
