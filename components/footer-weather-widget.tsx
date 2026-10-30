"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Clock, MapPin, Cloud, Sun, CloudRain, Thermometer, Calendar } from "lucide-react"

interface WeatherData {
  temperature: number
  condition: string
  icon: string
  humidity: number
}

export function FooterWeatherWidget() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 22,
    condition: "Clear",
    icon: "sun",
    humidity: 65
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getShortDay = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short'
    })
  }

  const getShortDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
      case 'sunny':
        return <Sun className="h-5 w-5" style={{ color: 'rgb(227,252,236)' }} />
      case 'cloudy':
      case 'overcast':
        return <Cloud className="h-5 w-5 text-gray-400" />
      case 'rainy':
      case 'rain':
        return <CloudRain className="h-5 w-5 text-blue-400" />
      default:
        return <Sun className="h-5 w-5" style={{ color: 'rgb(227,252,236)' }} />
    }
  }

  return (
    <Card className="bg-gradient-to-r from-[#0d5c75]/90 via-[#2a9d8f]/85 to-[#0d5c75]/90 backdrop-blur-sm border border-white/20 shadow-lg text-white dark:text-white">
      <div className="p-4">
        {/* Header with Location */}
        <div className="flex items-center justify-center gap-2 mb-3 pb-2 border-b border-white/30">
          <MapPin className="h-4 w-4 text-white" />
          <span className="text-sm font-bold text-white">NOWSHERA, PAKISTAN</span>
        </div>

        {/* Main Content - Horizontal Layout */}
        <div className="grid grid-cols-3 gap-4 items-center">
          {/* Date Section */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar className="h-3 w-3 text-white" />
              <span className="text-xs font-medium text-white">DATE</span>
            </div>
            <div className="bg-white/20 rounded-md p-2 backdrop-blur-sm border border-white/30">
              <div className="text-sm font-bold text-white">{getShortDay(currentTime)}</div>
              <div className="text-xs text-white/90">{getShortDate(currentTime)}</div>
              <div className="text-xs text-white/80">{currentTime.getFullYear()}</div>
            </div>
          </div>

          {/* Time Section */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-3 w-3 text-white" />
              <span className="text-xs font-medium text-white">TIME</span>
            </div>
            <div className="bg-white/20 rounded-md p-2 backdrop-blur-sm border border-white/30">
              <div className="text-sm font-bold font-mono text-white">
                {formatTime(currentTime)}
              </div>
              <div className="text-xs text-white/80">Local Time</div>
            </div>
          </div>

          {/* Weather Section */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Thermometer className="h-3 w-3 text-white" />
              <span className="text-xs font-medium text-white">WEATHER</span>
            </div>
            <div className="bg-white/20 rounded-md p-2 backdrop-blur-sm border border-white/30">
              <div className="flex items-center justify-center mb-1">
                {getWeatherIcon(weather.condition)}
              </div>
              <div className="text-sm font-bold text-white">{weather.temperature}°C</div>
              <div className="text-xs text-white/80">{weather.condition}</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
