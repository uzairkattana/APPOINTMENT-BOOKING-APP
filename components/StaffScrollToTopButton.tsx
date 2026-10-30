"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronUp } from "lucide-react"

interface StaffScrollToTopButtonProps {
  showAfter?: number
  className?: string
}

export default function StaffScrollToTopButton({ showAfter = 200, className = "" }: StaffScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > showAfter) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    // Add scroll listener
    window.addEventListener("scroll", toggleVisibility)

    // Cleanup
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [showAfter])

  const scrollToTop = () => {
    setIsAnimating(true)
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
    
    // Reset animation state after scroll
    setTimeout(() => {
      setIsAnimating(false)
    }, 600)
  }

  if (!isVisible) return null

  return (
    <div className={`fixed bottom-20 right-4 z-[9997] ${className}`}>
      <Button
        onClick={scrollToTop}
        className={`
          relative w-12 h-12 rounded-full shadow-lg transition-all duration-300 ease-in-out
          bg-gradient-to-r from-[#2a9d8f]/20 to-[#264653]/20 hover:from-[#2a9d8f]/30 hover:to-[#264653]/30
          text-white border-2 border-white/20 backdrop-blur-xl
          hover:scale-110 active:scale-95
          ${isAnimating ? 'animate-pulse' : ''}
        `}
        title="Scroll to Top"
      >
        <ChevronUp 
          className={`
            relative z-10 h-5 w-5 text-[#2a9d8f] transition-all duration-300
            ${isAnimating ? 'translate-y-[-2px]' : ''}
          `} 
        />
      </Button>
    </div>
  )
}
