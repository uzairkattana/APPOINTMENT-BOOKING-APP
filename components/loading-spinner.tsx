"use client"

import Image from "next/image"
import { useState, useEffect } from "react"

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-[#2a9d8f]`}
      ></div>
    </div>
  )
}

// Enhanced Loading Page Component
export function EnhancedLoadingPage({ 
  title = "Loading...", 
  subtitle = "Please wait while we prepare your experience",
  showProgress = true 
}: { 
  title?: string
  subtitle?: string
  showProgress?: boolean
}) {
  const [progress, setProgress] = useState(0)
  const [loadingText, setLoadingText] = useState("Initializing...")
  
  const loadingSteps = [
    { text: "Initializing...", duration: 1000 },
    { text: "Loading resources...", duration: 1500 },
    { text: "Preparing interface...", duration: 1200 },
    { text: "Finalizing...", duration: 800 },
    { text: "Ready!", duration: 500 }
  ]

  useEffect(() => {
    let currentStep = 0
    let progressInterval: NodeJS.Timeout
    let stepTimeout: NodeJS.Timeout

    const updateProgress = () => {
      if (currentStep < loadingSteps.length) {
        setLoadingText(loadingSteps[currentStep].text)
        
        // Animate progress for this step
        const stepProgress = (currentStep / loadingSteps.length) * 100
        const nextStepProgress = ((currentStep + 1) / loadingSteps.length) * 100
        
        let currentProgress = stepProgress
        progressInterval = setInterval(() => {
          currentProgress += 2
          if (currentProgress >= nextStepProgress) {
            setProgress(nextStepProgress)
            clearInterval(progressInterval)
          } else {
            setProgress(currentProgress)
          }
        }, 50)
        
        stepTimeout = setTimeout(() => {
          clearInterval(progressInterval)
          currentStep++
          updateProgress()
        }, loadingSteps[currentStep].duration)
      }
    }

    if (showProgress) {
      updateProgress()
    }

    return () => {
      clearInterval(progressInterval)
      clearTimeout(stepTimeout)
    }
  }, [showProgress])

  return (
    <div className="min-h-screen bg-[rgb(174,193,192)] flex items-center justify-center overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-[15%] left-[10%] w-40 h-40 bg-gradient-to-r from-[#0d5c75]/30 to-[#2a9d8f]/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-[60%] right-[12%] w-32 h-32 bg-gradient-to-r from-[rgb(227,252,236)]/30 to-[#0d5c75]/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-[25%] left-[15%] w-24 h-24 bg-gradient-to-r from-[#2a9d8f]/30 to-[rgb(227,252,236)]/30 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[30%] right-[25%] w-16 h-16 bg-gradient-to-r from-[rgb(227,252,236)]/20 to-[#2a9d8f]/20 rounded-full blur-lg animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>
      
      {/* Floating Medical Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-8 h-8 bg-[#0d5c75]/20 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-[40%] right-[20%] w-6 h-6 bg-[#2a9d8f]/20 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-[30%] left-[30%] w-4 h-4 bg-[rgb(227,252,236)]/20 rounded-full animate-bounce" style={{ animationDelay: '2.5s' }}></div>
      </div>
      
      {/* Main Loading Card */}
      <div className="relative z-10 max-w-lg w-full mx-4">
        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40 p-10 text-center transform transition-all duration-1000">
          {/* Professional Logo Animation */}
          <div className="mb-8">
            <div className="relative w-28 h-28 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0d5c75] to-[#2a9d8f] rounded-full animate-pulse shadow-2xl"></div>
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <div className="w-20 h-20 relative animate-spin" style={{ animationDuration: '3s' }}>
                  <Image
                    src="/images/gonstead-chiropractic-logo-new.png"
                    alt="Gonstead Chiropractic Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-[rgb(227,252,236)] rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            
            {/* Clinic Brand */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-[#0d5c75] font-poppins tracking-wide">
                Gonstead Chiropractic
              </h1>
              <p className="text-lg font-semibold text-[#2a9d8f] mb-2">
                Bashir Khan Clinic
              </p>
              <p className="text-sm text-gray-600 font-medium">
                Excellence in Chiropractic Care
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className="w-2 h-2 bg-[#0d5c75] rounded-full animate-pulse"></div>
                <p className="text-xs text-[#0d5c75] font-semibold tracking-wider">
                  PROFESSIONAL MANAGEMENT SYSTEM
                </p>
                <div className="w-2 h-2 bg-[rgb(227,252,236)] rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Loading Animation */}
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 border-4 border-[#0d5c75]/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-[#0d5c75] border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-2 border-[#2a9d8f]/30 rounded-full"></div>
              <div className="absolute inset-2 border-2 border-[#2a9d8f] border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            
            <h2 className="text-2xl font-bold text-[#0d5c75] mb-2">
              {title}
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              {subtitle}
            </p>
            
            {/* Loading Progress */}
            {showProgress && (
              <div className="space-y-3">
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-[#0d5c75] font-medium">
                  {loadingText}
                </p>
                <p className="text-xs text-gray-500">
                  {Math.round(progress)}% Complete
                </p>
              </div>
            )}
          </div>
          
          {/* Professional Badge */}
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-[#0d5c75] to-[#2a9d8f] text-white px-6 py-3 rounded-full text-sm font-bold tracking-wide shadow-lg">
              LOADING DASHBOARD
            </div>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Secure Connection</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Encrypted Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Professional Info */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/40">
          <p className="text-xs text-gray-600 font-medium">
            Powered by Gonstead Chiropractic Management System
          </p>
          <p className="text-xs text-[#0d5c75] font-bold mt-1">
            Near Peshawar Model School, Tehsil Road, Nowshera • +92 304 699 6267
          </p>
        </div>
      </div>
    </div>
  )
}
