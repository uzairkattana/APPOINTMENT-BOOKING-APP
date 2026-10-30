"use client"

import { useState, useEffect } from "react"

export function DynamicFooter() {
  const [currentTime, setCurrentTime] = useState<string>("")
  const [currentDate, setCurrentDate] = useState<string>("")
  const [currentDay, setCurrentDay] = useState<string>("")
  const [weather, setWeather] = useState<string>("Loading...")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const updateDateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
      setCurrentDate(now.toLocaleDateString())
      setCurrentDay(now.toLocaleDateString([], { weekday: 'long' }))
    }

    // Update immediately
    updateDateTime()
    
    // Update every minute
    const interval = setInterval(updateDateTime, 60000)

    // Simple weather simulation (you can replace with actual API)
    const weatherOptions = ["Sunny ☀️", "Cloudy ☁️", "Partly Cloudy ⛅", "Clear 🌤️"]
    setWeather(weatherOptions[Math.floor(Math.random() * weatherOptions.length)])

    return () => clearInterval(interval)
  }, [])

  // Don't render anything on server-side to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <footer className="bg-[#0d5c75]/10 dark:bg-gray-800/50 backdrop-blur-sm border-t border-[#0d5c75]/20 py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <span className="font-medium">🕒 Time:</span>
            <span className="font-mono">{currentTime}</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-2">
            <span className="font-medium">📅 Date:</span>
            <span>{currentDate}</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-2">
            <span className="font-medium">📆 Day:</span>
            <span>{currentDay}</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-2">
            <span className="font-medium">🌤️ Weather:</span>
            <span>{weather}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
