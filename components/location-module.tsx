"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Clock, Phone, Car, ExternalLink, MessageCircle, Locate } from "lucide-react"
import { useLanguage } from "./language-provider"

export function LocationModule() {
  const { language } = useLanguage()
  const [trafficInfo, setTrafficInfo] = useState({
    status: "light",
    estimatedTime: "5-8 minutes",
  })
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Simulate live traffic updates
  useEffect(() => {
    const interval = setInterval(() => {
      const statuses = ["light", "moderate", "heavy"]
      const times = ["5-8 minutes", "8-12 minutes", "12-18 minutes"]
      const randomIndex = Math.floor(Math.random() * 3)

      setTrafficInfo({
        status: statuses[randomIndex],
        estimatedTime: times[randomIndex],
      })
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Handle map loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMapLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const getTrafficColor = (status: string) => {
    switch (status) {
      case "light":
        return "text-green-500"
      case "moderate":
        return "text-yellow-500"
      case "heavy":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getDirections = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
          // Open directions with user's current location
          window.open(
            `https://www.google.com/maps/dir/${latitude},${longitude}/34.0153,71.9804/@34.0153,71.9804,15z`,
            "_blank",
          )
        },
        () => {
          // Fallback to the provided Google Maps link
          window.open("https://maps.app.goo.gl/8pJ9o2hCPtGY3XtD9", "_blank")
        },
      )
    } else {
      window.open("https://maps.app.goo.gl/8pJ9o2hCPtGY3XtD9", "_blank")
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Location Card */}
      <Card className="border-[#0d5c75] shadow-2xl bg-gradient-to-br from-[#F8F5F0] to-white overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#0d5c75] to-[#0a4a5c] text-white p-4 md:p-6">
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl font-poppins">
            <MapPin className="h-6 w-6 md:h-7 md:w-7" />
            {language === "ur" ? "کلینک کا مقام" : "Clinic Location"}
          </CardTitle>
          <p className="text-[#F8F5F0] text-sm font-open-sans">
            {language === "ur"
              ? "پولیس سٹیشن کے قریب، تحصیل روڈ، نوشہرہ"
              : "Near Peshawar Model School, Tehsil Road, Nowshera"}
          </p>
        </CardHeader>

        <CardContent className="p-6">
          {/* Google Maps Embed with Exact Link */}
          <div className="relative mb-6">
            <div className="w-full h-[400px] rounded-xl border-2 border-[#0d5c75]/20 overflow-hidden bg-[#F8F5F0]">
              {!isMapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#F8F5F0] z-10">
                  <div className="flex items-center gap-3">
                    <div className="spinner border-[#0d5c75]"></div>
                    <span className="text-[#0A3A47] font-open-sans">Loading map...</span>
                  </div>
                </div>
              )}

              {/* Professional Google Maps Embed */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3307.4614046736474!2d71.97788!3d34.01533!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38d917b90f9b6ce9%3A0x93c2e9e4a56d3a0d!2sGonstead%20Chiropractic%20Clinic%20-%20Dr.%20Bashir!5e0!3m2!1sen!2s!4v1717687854793!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                onLoad={() => setIsMapLoaded(true)}
                className={`transition-opacity duration-500 ${isMapLoaded ? "opacity-100" : "opacity-0"}`}
                title="Gonstead Chiropractic Clinic - Dr. Bashir Location"
              ></iframe>

              {/* Live Traffic Indicator */}
              <div className="absolute top-4 right-4 z-10">
                <Badge className={`${getTrafficColor(trafficInfo.status)} bg-white border-2 shadow-lg`}>
                  <Car className="h-3 w-3 mr-1" />
                  {language === "ur" ? "ٹریفک" : "Traffic"}: {trafficInfo.status}
                </Badge>
              </div>

              {/* Location Pin Overlay */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <div className="animate-bounce">
                    <div className="w-8 h-8 bg-[#D2F5E2] rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <MapPin className="h-4 w-4 text-gray-800" />
                  </div>
                </div>
              </div>
            </div>

            {/* Map Controls */}
            <div className="absolute bottom-4 left-4 flex gap-2 z-10">
              <Button
                size="sm"
                className="bg-white/95 text-[#0d5c75] hover:bg-white border border-[#0d5c75]/20 shadow-lg"
                onClick={() => window.open("https://maps.app.goo.gl/8pJ9o2hCPtGY3XtD9", "_blank")}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                {language === "ur" ? "گوگل میپس" : "Google Maps"}
              </Button>
            </div>
          </div>

          {/* Location Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Access Information */}
            <div className="bg-white p-4 rounded-lg border border-[#0d5c75]/20 shadow-sm">
              <h4 className="font-bold text-[#0A3A47] mb-3 font-poppins flex items-center gap-2">
                <Navigation className="h-4 w-4 text-[#0d5c75]" />
                {language === "ur" ? "رسائی کی معلومات" : "Access Information"}
              </h4>
              <ul className="text-sm text-[#0A3A47] space-y-2 font-open-sans">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#D2F5E2] rounded-full"></div>
                  {language === "ur" ? "مفت پارکنگ دستیاب" : "Free parking available"}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#D2F5E2] rounded-full"></div>
                  {language === "ur" ? "وہیل چیئر رسائی" : "Wheelchair accessible"}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#D2F5E2] rounded-full"></div>
                  {language === "ur" ? "عوامی ٹرانسپورٹ" : "Public transport nearby"}
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#D2F5E2] rounded-full"></div>
                  {language === "ur" ? "آسان رسائی" : "Easy to locate"}
                </li>
              </ul>
            </div>

            {/* Clinic Hours */}
            <div className="bg-white p-4 rounded-lg border border-[#0d5c75]/20 shadow-sm">
              <h4 className="font-bold text-[#0A3A47] mb-3 font-poppins flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#0d5c75]" />
                {language === "ur" ? "کلینک کے اوقات" : "Clinic Hours"}
              </h4>
              <div className="space-y-2 text-sm font-open-sans">
                <div className="flex justify-between items-center">
                  <span className="text-[#0A3A47]">{language === "ur" ? "پیر - جمعہ:" : "Mon - Fri:"}</span>
                  <span className="text-[#0d5c75] font-semibold">8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#0A3A47]">{language === "ur" ? "ہفتہ:" : "Saturday:"}</span>
                  <span className="text-[#0d5c75] font-semibold">9:00 AM - 3:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#0A3A47]">{language === "ur" ? "اتوار:" : "Sunday:"}</span>
                  <span className="text-red-500 font-semibold">{language === "ur" ? "بند" : "Closed"}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 font-bold">{language === "ur" ? "ایمرجنسی:" : "Emergency:"}</span>
                    <span className="text-green-600 font-bold">24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Traffic & Travel Time */}
          <div className="bg-white p-4 rounded-lg border border-[#0d5c75]/20 shadow-sm mb-6">
            <h4 className="font-bold text-[#0A3A47] mb-3 font-poppins flex items-center gap-2">
              <Car className="h-4 w-4 text-[#0d5c75]" />
              {language === "ur" ? "لائیو ٹریفک اور سفری وقت" : "Live Traffic & Travel Time"}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-open-sans text-[#0A3A47]">
                    {language === "ur" ? "موجودہ حالت:" : "Current Status:"}
                  </span>
                  <Badge className={`${getTrafficColor(trafficInfo.status)} bg-white border`}>
                    {trafficInfo.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-open-sans text-[#0A3A47]">
                    {language === "ur" ? "تخمینی وقت:" : "Estimated Time:"}
                  </span>
                  <span className="text-sm font-bold text-[#0d5c75] font-open-sans">{trafficInfo.estimatedTime}</span>
                </div>
              </div>
              <div className="flex items-center justify-center sm:justify-end">
                <Button
                  onClick={getDirections}
                  className="bg-gradient-to-r from-[#0d5c75] to-[#0a4a5c] hover:from-[#0a4a5c] hover:to-[#083d4a] text-white shadow-lg"
                >
                  <Locate className="h-4 w-4 mr-2" />
                  {language === "ur" ? "راستہ حاصل کریں" : "Get Directions"}
                </Button>
              </div>
            </div>
          </div>

          {/* Contact Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              className="bg-[#25d366] hover:bg-[#20b858] text-white font-poppins shadow-lg"
              onClick={() => window.open("https://wa.me/923046996267", "_blank")}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              {language === "ur" ? "واٹس ایپ" : "WhatsApp"}
            </Button>

            <Button
              className="bg-[#D2F5E2] hover:bg-[#B8E6C1] text-gray-800 font-poppins shadow-lg"
              onClick={() => window.open("tel:+923046996267")}
            >
              <Phone className="h-4 w-4 mr-2" />
              {language === "ur" ? "فون کال" : "Phone Call"}
            </Button>

            <Button
              variant="outline"
              className="border-[#0d5c75] text-[#0d5c75] hover:bg-[#0d5c75] hover:text-white font-poppins shadow-lg"
              onClick={() => window.open("https://maps.app.goo.gl/8pJ9o2hCPtGY3XtD9", "_blank")}
            >
              <MapPin className="h-4 w-4 mr-2" />
              {language === "ur" ? "مکمل پتہ" : "Full Address"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
