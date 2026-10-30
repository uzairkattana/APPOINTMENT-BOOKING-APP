"use client"

import { useState, useEffect, useRef } from "react"
import { Activity, X, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

// Comprehensive Sports injury types with educational details
const sportsInjuries = [
  { 
    name: "Sports Injuries", 
    image: "/images/posture injery/SportsInjuries.png",
    description: "Common injuries from athletic activities and physical sports",
    causes: ["Overuse", "Poor technique", "Inadequate warm-up", "Contact trauma"],
    symptoms: ["Pain", "Swelling", "Reduced mobility", "Muscle weakness"],
    treatment: "Gonstead adjustments, rehabilitation exercises, activity modification",
    relatedInjuries: ["Muscle Spasm", "Joint Stiffness", "Sprains/Strains"]
  },
  { 
    name: "Neck Pain", 
    image: "/images/posture injery/NeckPain-2.png",
    description: "Cervical spine discomfort affecting daily activities",
    causes: ["Poor posture", "Whiplash", "Muscle strain", "Herniated disc"],
    symptoms: ["Neck stiffness", "Headaches", "Shoulder pain", "Arm numbness"],
    treatment: "Cervical adjustments, postural correction, strengthening exercises",
    relatedInjuries: ["Headaches", "Frozen Shoulder", "Numbness & Tingling"]
  },
  { 
    name: "Low Back Pain", 
    image: "/images/posture injery/Low-Back-Pain-1.png",
    description: "Lower lumbar spine pain affecting mobility and quality of life",
    causes: ["Disc problems", "Muscle strain", "Poor posture", "Lifting injuries"],
    symptoms: ["Lower back ache", "Sciatica", "Muscle spasms", "Stiffness"],
    treatment: "Lumbar adjustments, core strengthening, ergonomic education",
    relatedInjuries: ["Muscle Spasm", "Leg Pain", "Joint Stiffness"]
  },
  { 
    name: "Mid & Upper Back Pain", 
    image: "/images/posture injery/Mid-and-upper-back-pain-1.png",
    description: "Thoracic spine pain often related to posture and stress",
    causes: ["Poor posture", "Stress", "Rib dysfunction", "Muscle tension"],
    symptoms: ["Upper back ache", "Shoulder blade pain", "Rib pain", "Breathing difficulty"],
    treatment: "Thoracic adjustments, postural exercises, stress management",
    relatedInjuries: ["Neck Pain", "Shoulder & Arm", "Muscle Spasm"]
  },
  { 
    name: "Shoulder & Arm", 
    image: "/images/posture injery/ShoulderAndArm.png",
    description: "Shoulder joint and arm pain affecting daily activities",
    causes: ["Rotator cuff injury", "Impingement", "Overuse", "Posture problems"],
    symptoms: ["Shoulder pain", "Arm weakness", "Limited range of motion", "Night pain"],
    treatment: "Shoulder adjustments, rotator cuff exercises, posture correction",
    relatedInjuries: ["Frozen Shoulder", "Tennis/Golfers Elbow", "Neck Pain"]
  },
  { 
    name: "Tennis/Golfers Elbow", 
    image: "/images/posture injery/TennisGolfersElbow.png",
    description: "Elbow tendinitis from repetitive arm and wrist motions",
    causes: ["Repetitive motion", "Poor technique", "Overuse", "Muscle imbalances"],
    symptoms: ["Elbow pain", "Forearm pain", "Grip weakness", "Morning stiffness"],
    treatment: "Elbow adjustments, tendon rehabilitation, technique correction",
    relatedInjuries: ["Wrist/Carpal Tunnel", "Shoulder & Arm", "Muscle Spasm"]
  },
  { 
    name: "Knee Pain", 
    image: "/images/posture injery/Knee.png",
    description: "Knee joint pain affecting walking and daily activities",
    causes: ["Ligament injury", "Meniscus tear", "Patella tracking", "Arthritis"],
    symptoms: ["Knee pain", "Swelling", "Instability", "Limited movement"],
    treatment: "Knee adjustments, strengthening exercises, gait analysis",
    relatedInjuries: ["Ankle/Foot", "Leg Pain", "Joint Stiffness"]
  },
  { 
    name: "Ankle/Foot", 
    image: "/images/posture injery/AnkleFoot.png",
    description: "Ankle and foot problems affecting walking and balance",
    causes: ["Sprains", "Plantar fasciitis", "Poor footwear", "Biomechanical issues"],
    symptoms: ["Ankle pain", "Foot pain", "Swelling", "Walking difficulty"],
    treatment: "Ankle adjustments, foot orthotics, gait correction",
    relatedInjuries: ["Knee Pain", "Leg Pain", "Sprains/Strains"]
  },
  { 
    name: "Headaches", 
    image: "/images/posture injery/Headaches.png",
    description: "Cervicogenic headaches originating from neck dysfunction",
    causes: ["Neck tension", "Poor posture", "Stress", "Jaw problems"],
    symptoms: ["Head pain", "Neck stiffness", "Eye strain", "Jaw tension"],
    treatment: "Cervical adjustments, posture correction, stress management",
    relatedInjuries: ["Neck Pain", "TMJ", "Mid & Upper Back Pain"]
  },
  { 
    name: "Frozen Shoulder", 
    image: "/images/posture injery/FrozenShoulder.png",
    description: "Adhesive capsulitis causing severe shoulder stiffness",
    causes: ["Inflammation", "Diabetes", "Immobility", "Trauma"],
    symptoms: ["Severe stiffness", "Pain", "Limited motion", "Night pain"],
    treatment: "Gentle adjustments, mobilization, progressive exercises",
    relatedInjuries: ["Shoulder & Arm", "Neck Pain", "Joint Stiffness"]
  },
  { 
    name: "Work Injuries", 
    image: "/images/posture injery/WorkInjuries.png",
    description: "Occupational injuries from workplace activities",
    causes: ["Repetitive strain", "Poor ergonomics", "Lifting", "Prolonged sitting"],
    symptoms: ["Chronic pain", "Fatigue", "Reduced productivity", "Stiffness"],
    treatment: "Workplace ergonomics, regular adjustments, exercise programs",
    relatedInjuries: ["Neck Pain", "Low Back Pain", "Wrist/Carpal Tunnel"]
  },
  { 
    name: "Automobile Injuries", 
    image: "/images/posture injery/AutomobileInjuries.png",
    description: "Injuries sustained from motor vehicle accidents",
    causes: ["Whiplash", "Impact trauma", "Sudden deceleration", "Airbag deployment"],
    symptoms: ["Neck pain", "Back pain", "Headaches", "Muscle spasms"],
    treatment: "Comprehensive assessment, gentle adjustments, rehabilitation",
    relatedInjuries: ["Neck Pain", "Low Back Pain", "Headaches"]
  },
  { 
    name: "Muscle Spasm", 
    image: "/images/posture injery/MuscleSpasm.png",
    description: "Involuntary muscle contractions causing pain and stiffness",
    causes: ["Overuse", "Dehydration", "Electrolyte imbalance", "Nerve irritation"],
    symptoms: ["Muscle cramps", "Tight muscles", "Pain", "Reduced mobility"],
    treatment: "Spinal adjustments, muscle therapy, hydration, stretching",
    relatedInjuries: ["Joint Stiffness", "Sports Injuries", "Low Back Pain"]
  },
  { 
    name: "Sprains/Strains", 
    image: "/images/posture injery/SprainsStrains.png",
    description: "Ligament and muscle injuries from overextension or trauma",
    causes: ["Sudden movement", "Overextension", "Trauma", "Poor conditioning"],
    symptoms: ["Pain", "Swelling", "Bruising", "Limited movement"],
    treatment: "Joint adjustments, soft tissue therapy, rehabilitation exercises",
    relatedInjuries: ["Sports Injuries", "Ankle/Foot", "Muscle Spasm"]
  },
  { 
    name: "Joint Stiffness", 
    image: "/images/posture injery/JointStiffness.png",
    description: "Reduced joint mobility affecting daily activities",
    causes: ["Arthritis", "Inactivity", "Aging", "Previous injury"],
    symptoms: ["Stiffness", "Reduced range of motion", "Pain", "Difficulty moving"],
    treatment: "Joint mobilization, adjustments, movement therapy",
    relatedInjuries: ["Frozen Shoulder", "Knee Pain", "Muscle Spasm"]
  },
  { 
    name: "Numbness & Tingling", 
    image: "/images/posture injery/NumbnessAndTingling.png",
    description: "Nerve compression symptoms affecting sensation",
    causes: ["Nerve compression", "Disc problems", "Carpal tunnel", "Poor posture"],
    symptoms: ["Numbness", "Tingling", "Pins and needles", "Weakness"],
    treatment: "Nerve decompression, spinal adjustments, ergonomic correction",
    relatedInjuries: ["Wrist/Carpal Tunnel", "Neck Pain", "Low Back Pain"]
  },
  { 
    name: "TMJ", 
    image: "/images/posture injery/TMJ.png",
    description: "Temporomandibular joint dysfunction affecting jaw movement",
    causes: ["Jaw clenching", "Teeth grinding", "Stress", "Misalignment"],
    symptoms: ["Jaw pain", "Clicking sounds", "Limited opening", "Headaches"],
    treatment: "Jaw adjustments, stress management, bite guard therapy",
    relatedInjuries: ["Headaches", "Neck Pain", "Mid & Upper Back Pain"]
  },
  { 
    name: "Wrist/Carpal Tunnel", 
    image: "/images/posture injery/WristCarpelTunnel.png",
    description: "Median nerve compression in the wrist causing hand symptoms",
    causes: ["Repetitive motions", "Poor ergonomics", "Pregnancy", "Diabetes"],
    symptoms: ["Hand numbness", "Tingling", "Weakness", "Night pain"],
    treatment: "Wrist adjustments, ergonomic changes, nerve gliding exercises",
    relatedInjuries: ["Tennis/Golfers Elbow", "Numbness & Tingling", "Work Injuries"]
  },
  { 
    name: "Leg Pain", 
    image: "/images/posture injery/Leg.png",
    description: "Lower extremity pain from various causes",
    causes: ["Sciatica", "Muscle strain", "Vascular issues", "Nerve compression"],
    symptoms: ["Leg ache", "Shooting pain", "Weakness", "Cramping"],
    treatment: "Spinal adjustments, nerve decompression, strengthening exercises",
    relatedInjuries: ["Low Back Pain", "Knee Pain", "Ankle/Foot"]
  },
  { 
    name: "RMAN", 
    image: "/images/posture injery/RMAN.png",
    description: "Repetitive Motion and Nerve dysfunction",
    causes: ["Repetitive activities", "Poor ergonomics", "Overuse", "Nerve irritation"],
    symptoms: ["Chronic pain", "Nerve symptoms", "Fatigue", "Reduced function"],
    treatment: "Comprehensive care, ergonomic assessment, rehabilitation",
    relatedInjuries: ["Work Injuries", "Numbness & Tingling", "Muscle Spasm"]
  }
]

export function SportsInjuriesFloat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [selectedInjury, setSelectedInjury] = useState<string | null>("RMAN")
  const [hoveredInjury, setHoveredInjury] = useState<string | null>(null)
  const [expandedInjury, setExpandedInjury] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const handleInjuryClick = (injuryName: string) => {
    setSelectedInjury(injuryName)
    setExpandedInjury(expandedInjury === injuryName ? null : injuryName)
  }

  const handleInjuryHover = (injuryName: string | null) => {
    setHoveredInjury(injuryName)
  }

  // Handle mouse leave to reset to default RMAN
  const handleInjuryMouseLeave = () => {
    setHoveredInjury(null)
    // Reset to RMAN as default when not hovering
    if (!selectedInjury || selectedInjury === hoveredInjury) {
      setSelectedInjury("RMAN")
    }
  }

  // Always show hovered injury in image area, or selected injury, or default to RMAN
  const currentInjury = hoveredInjury || selectedInjury || "RMAN"
  const currentInjuryData = sportsInjuries.find(injury => injury.name === currentInjury)

  // Handle click outside to close panel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  return (
    <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-50">
      {/* Main Sports Injuries Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
className={`h-14 w-14 md:h-16 md:w-16 lg:h-18 lg:w-18 rounded-full bg-gradient-to-br from-[#2a9d8f] via-[#0d5c75] to-[#1e6f8f] hover:from-[#2a9d8f] hover:via-[#0d5c75] hover:to-[#2a9d8f] shadow-lg hover:shadow-2xl transition-all duration-300 transform ${
          isHovered ? "scale-110 opacity-100" : "scale-100 opacity-90"
        } relative overflow-hidden border-4 border-white/30 ring-4 ring-white/20 backdrop-blur-sm`}
        size="icon"
        title="Sports Injuries Information"
      >
        {/* Sports injuries icon on top */}
        <Activity className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-white filter drop-shadow-sm relative z-10" />
        {/* Pulse animation for active state */}
        <div className="absolute inset-0 rounded-full bg-[#2a9d8f]/30 animate-ping"></div>
      </Button>

      {/* Enhanced Tooltip */}
      {isHovered && !isOpen && (
        <div className="absolute bottom-16 md:bottom-20 left-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-xs md:text-sm px-3 py-2 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in-0 zoom-in-95 duration-200 backdrop-blur-md border border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#2a9d8f] rounded-full animate-pulse"></div>
            Sports Injuries
          </div>
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}

      {/* Sports Injuries Panel - Highly Responsive */}
      {isOpen && (
        <div ref={panelRef} className="absolute bottom-16 md:bottom-20 left-0 w-[95vw] max-w-[320px] sm:max-w-[480px] md:max-w-[600px] lg:max-w-[700px] h-[70vh] max-h-[450px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-in fade-in-0 zoom-in-95 duration-300 overflow-hidden">
          {/* Header with adaptive color */}
          <div className="bg-white dark:bg-gradient-to-r dark:from-[#2a9d8f] dark:to-[#0d5c75] text-[#0d5c75] dark:text-white border-b border-gray-200 dark:border-transparent p-3 md:p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 md:h-5 md:w-5 text-[#2a9d8f] dark:text-white" />
              <span className="font-semibold text-sm md:text-base text-[#0d5c75] dark:text-white">Sports Injuries</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-[#0d5c75] dark:text-white hover:bg-[#2a9d8f]/10 dark:hover:bg-white/20 h-6 w-6 md:h-8 md:w-8 p-0"
            >
              <X className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>

          {/* Responsive Layout Container */}
          <div className="flex flex-col sm:flex-row h-[calc(100%-48px)] md:h-[calc(100%-64px)]">
            {/* Text List - Full width on mobile, half on desktop */}
            <div className="w-full sm:w-1/2 bg-gray-50 dark:bg-gray-700 border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-600 max-h-[40%] sm:max-h-full">
              <div className="h-full overflow-y-auto">
                {sportsInjuries.map((injury, index) => (
                  <div key={index} className="border-b border-gray-200 dark:border-gray-600">
                    {/* Injury Name Row */}
                    <div
                      className={`p-2 md:p-3 cursor-pointer transition-all duration-200 active:bg-[#2a9d8f]/20 hover:bg-[#2a9d8f]/10 hover:border-l-4 hover:border-l-[#2a9d8f] ${
                        selectedInjury === injury.name 
                          ? 'bg-[#2a9d8f]/20 border-l-4 border-l-[#2a9d8f] text-[#0d5c75] font-semibold' 
                          : hoveredInjury === injury.name
                          ? 'bg-[#2a9d8f]/10 border-l-4 border-l-[#2a9d8f] text-[#0d5c75] font-medium'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                      onClick={() => handleInjuryClick(injury.name)}
                      onMouseEnter={() => handleInjuryHover(injury.name)}
                      onMouseLeave={() => handleInjuryMouseLeave()}
                      onTouchStart={() => handleInjuryHover(injury.name)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs md:text-sm font-medium leading-tight">
                          {injury.name}
                        </span>
                        {expandedInjury === injury.name ? (
                          <ChevronUp className="h-3 w-3 md:h-4 md:w-4 text-[#2a9d8f] flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-3 w-3 md:h-4 md:w-4 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Educational Dropdown */}
                    {expandedInjury === injury.name && (
                      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 p-3 md:p-4 animate-in slide-in-from-top-2 duration-300">
                        {/* Description */}
                        <div className="mb-3">
                          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {injury.description}
                          </p>
                        </div>

                        {/* Causes */}
                        <div className="mb-3">
                          <h4 className="text-xs font-semibold text-[#0d5c75] dark:text-[#2a9d8f] mb-1">
                            Common Causes:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {injury.causes.map((cause, idx) => (
                              <span key={idx} className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded-full">
                                {cause}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Symptoms */}
                        <div className="mb-3">
                          <h4 className="text-xs font-semibold text-[#0d5c75] dark:text-[#2a9d8f] mb-1">
                            Symptoms:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {injury.symptoms.map((symptom, idx) => (
                              <span key={idx} className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-full">
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Treatment */}
                        <div className="mb-3">
                          <h4 className="text-xs font-semibold text-[#0d5c75] dark:text-[#2a9d8f] mb-1">
                            Gonstead Treatment:
                          </h4>
                          <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                            <p className="text-xs text-green-800 dark:text-green-400 leading-relaxed">
                              {injury.treatment}
                            </p>
                          </div>
                        </div>

                        {/* Related Injuries */}
                        <div className="mb-2">
                          <h4 className="text-xs font-semibold text-[#0d5c75] dark:text-[#2a9d8f] mb-1">
                            Related Conditions:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {injury.relatedInjuries.map((related, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleInjuryClick(related)}
                                className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-200"
                              >
                                {related}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Professional Note */}
                        <div className="bg-[#2a9d8f]/10 dark:bg-[#2a9d8f]/20 p-2 rounded-lg mt-2">
                          <p className="text-xs text-[#0d5c75] dark:text-[#2a9d8f] font-medium">
                            💡 Professional chiropractic assessment and treatment available at our clinic
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Image Display - Full width on mobile, half on desktop */}
            <div className="w-full sm:w-1/2 bg-white dark:bg-gray-800 flex items-center justify-center min-h-[60%] sm:min-h-full">
              <div className="p-3 md:p-6 w-full h-full flex flex-col items-center justify-center">
                <div className="relative w-full h-3/4 mb-2 md:mb-4">
                  <Image
                    src={sportsInjuries.find(injury => injury.name === currentInjury)?.image || ''}
                    alt={currentInjury}
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-sm md:text-lg font-semibold text-[#0d5c75] dark:text-[#2a9d8f] mb-1 md:mb-2">
                    {currentInjury}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 hidden sm:block">
                    Professional chiropractic treatment available
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 sm:hidden">
                    Tap to select
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
