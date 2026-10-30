"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function WhatsAppFloat() {
  const [isHovered, setIsHovered] = useState(false)

  const handleWhatsAppClick = () => {
    window.open("https://wa.me/923046996267?text=Hello Gonstead Chiropractic Clinic, I would like to book an appointment.", "_blank")
  }

  return (
    <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-50">
      <Button
        onClick={handleWhatsAppClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`h-14 w-14 md:h-16 md:w-16 lg:h-18 lg:w-18 rounded-full bg-gradient-to-br from-[#25D366] via-[#128C7E] to-[#075E54] hover:from-[#25D366] hover:via-[#075E54] hover:to-[#25D366] shadow-lg hover:shadow-2xl transition-all duration-300 transform ${
          isHovered ? "scale-110" : "scale-100"
        } relative overflow-hidden border-4 border-white/30 ring-4 ring-white/20 backdrop-blur-sm`}
        size="icon"
        title="Chat on WhatsApp"
      >
        {/* Logo in background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="relative w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12">
            <Image
              src="/images/gonstead-logo-new.png"
              alt="Gonstead Logo"
              fill
              className="object-contain filter brightness-200"
            />
          </div>
        </div>
        {/* WhatsApp icon on top */}
        <MessageCircle className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-white filter drop-shadow-sm relative z-10" />
        {/* Pulse animation for active state */}
        <div className="absolute inset-0 rounded-full bg-[#25D366]/30 animate-ping"></div>
      </Button>

      {/* Enhanced Tooltip */}
      {isHovered && (
        <div className="absolute bottom-16 md:bottom-20 left-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-xs md:text-sm px-3 py-2 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in-0 zoom-in-95 duration-200 backdrop-blur-md border border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Chat on WhatsApp
          </div>
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  )
}
