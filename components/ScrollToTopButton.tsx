"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronUp, Navigation } from "lucide-react"

interface ScrollToTopButtonProps {
  showAfter?: number
  className?: string
}

export default function ScrollToTopButton({ showAfter = 200, className = "" }: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const syncChatVisibility = () => {
    if (typeof document === "undefined") return
    const chatInterface = document.querySelector('[data-chat-interface="true"]')
    setIsChatOpen(Boolean(chatInterface))
  }

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

    // Initial checks
    toggleVisibility()
    syncChatVisibility()

    // Watch for chat open/close DOM changes
    const observer = new MutationObserver(() => {
      syncChatVisibility()
    })
    observer.observe(document.body, { childList: true, subtree: true })

    // Cleanup
    return () => {
      window.removeEventListener("scroll", toggleVisibility)
      observer.disconnect()
    }
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

  if (!isVisible || isChatOpen) return null

  return (
    <div className={`fixed bottom-20 right-4 z-[9998] ${className}`}>
      <Button
        onClick={scrollToTop}
        className={`
          relative w-12 h-12 rounded-full shadow-lg transition-all duration-300 ease-in-out
          bg-gradient-to-r from-[#0d5c75]/20 to-[#2a9d8f]/20 hover:from-[#0d5c75]/30 hover:to-[#2a9d8f]/30
          text-white border-2 border-white/20 backdrop-blur-xl
          hover:scale-110 active:scale-95
          ${isAnimating ? 'animate-pulse' : ''}
        `}
        title="Scroll to Top"
      >
        <ChevronUp 
          className={`
            relative z-10 h-5 w-5 text-[#0d5c75] transition-all duration-300
            ${isAnimating ? 'translate-y-[-2px]' : ''}
          `} 
        />
      </Button>
    </div>
  )
}

// Alternative navigation button with different icon
export function NavigationScrollButton({ showAfter = 200, className = "" }: ScrollToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > showAfter) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [showAfter])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  if (!isVisible) return null

  return (
    <div className={`fixed bottom-6 right-6 z-40 ${className}`}>
      <Button
        onClick={scrollToTop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative w-16 h-16 rounded-full shadow-2xl transition-all duration-500 ease-in-out group
          bg-[rgba(40,147,135,0.12)] backdrop-blur-lg border-2 border-[rgba(40,147,135,0.25)]
          hover:bg-[rgba(40,147,135,0.22)] hover:border-[rgba(40,147,135,0.45)]
          hover:scale-110 active:scale-95 hover:shadow-[0_0_30px_rgba(40,147,135,0.4)]
        `}
        title="Navigate to Top"
      >
        {/* Glass effect background */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/10 to-transparent opacity-50" />
        
        {/* Animated navigation icon */}
        <Navigation 
          className={`
            relative z-10 h-6 w-6 text-[rgb(40,147,135)] transition-all duration-300 group-hover:text-[rgb(35,127,117)]
            ${isHovered ? 'rotate-[-15deg] translate-y-[-1px]' : ''}
          `} 
        />
        
        {/* Floating animation elements */}
        <div className="absolute inset-0">
          <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[rgb(40,147,135)] rounded-full animate-bounce opacity-70" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-3 left-3 w-1 h-1 bg-[rgb(40,147,135)] rounded-full animate-ping opacity-60" style={{ animationDelay: '1s' }} />
        </div>
        
        {/* Hover glow effect */}
        <div className={`
          absolute inset-0 rounded-full bg-[rgb(40,147,135)] opacity-0 transition-opacity duration-300
          ${isHovered ? 'opacity-10' : 'opacity-0'}
        `} />
      </Button>
    </div>
  )
}
