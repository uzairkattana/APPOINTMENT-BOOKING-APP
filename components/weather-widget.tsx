"use client"

import { useState, useEffect } from "react"
import { Cloud, Sun, CloudRain, Wind, Droplets } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { NoSSR } from "@/components/no-ssr"

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  condition: string
  location: string
}

interface WeatherWidgetProps {
  isDarkMode?: boolean
}

export function WeatherWidget({ isDarkMode = false }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 28,
    humidity: 65,
    windSpeed: 12,
    condition: "partly-cloudy",
    location: "Nowshera, KP",
  })

  // Simulate weather updates (in real implementation, this would fetch from weather API)
  useEffect(() => {
    const updateWeather = () => {
      setWeather((prev) => ({
        ...prev,
        temperature: Math.round(25 + Math.random() * 10),
        humidity: Math.round(60 + Math.random() * 20),
        windSpeed: Math.round(8 + Math.random() * 8),
      }))
    }

    const interval = setInterval(updateWeather, 300000) // Update every 5 minutes
    return () => clearInterval(interval)
  }, [])

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case "sunny":
        return <Sun className="h-5 w-5 text-[rgb(138,176,141)]" />
      case "rainy":
        return <CloudRain className="h-5 w-5 text-blue-500" />
      case "partly-cloudy":
      default:
        return <Cloud className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <Card
      className={`${isDarkMode ? "bg-gray-700 border-gray-600" : "bg-white/90 border-[#0d5c75]/20"} backdrop-blur-sm`}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getWeatherIcon()}
            <div>
              <div className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-[#0d5c75]"}`}>
                {weather.temperature}°C
              </div>
              <div className={`text-xs ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{weather.location}</div>
            </div>
          </div>

          <div className="flex gap-3 text-xs">
            <div className="flex items-center gap-1">
              <Droplets className="h-3 w-3" />
              <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>{weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-1">
              <Wind className="h-3 w-3" />
              <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>{weather.windSpeed}km/h</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
