"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cpu, Activity, Target, Zap } from "lucide-react"
import { useLanguage } from "./language-provider"
import Image from "next/image"

export function TechnologyShowcase() {
  const { t, language } = useLanguage()

  const technologies = [
    {
      icon: <Cpu className="h-8 w-8 text-[#2a9d8f]" />,
      title: language === "ur" ? "ایڈجسٹو آرتھروسٹم™" : "Adjustive Arthrostim™",
      description:
        language === "ur" ? "جدید مشین سے ریڑھ کی ہڈی کی درست پوزیشن" : "Advanced machine-assisted spinal positioning",
      image: "/images/Adjustive-Arthrostim.jpg",
    },
    {
      icon: <Activity className="h-8 w-8 text-[#2a9d8f]" />,
      title: language === "ur" ? "سرویکل ڈراپ ٹیبل" : "Cervical Drop Table",
      description: language === "ur" ? "گردن کی ہڈیوں کا محفوظ علاج" : "Safe cervical spine treatment",
      image: "/images/Cervical-Drop-Table.jpg",
    },
    {
      icon: <Target className="h-8 w-8 text-[#2a9d8f]" />,
      title: language === "ur" ? "پریسیژن ایڈجسٹمنٹ" : "Precision Adjustment",
      description: language === "ur" ? "بالکل درست جگہ پر علاج" : "Targeted treatment with accuracy",
      image: "/images/Precision-Adjustment.jpg",
    },
    {
      icon: <Zap className="h-8 w-8 text-[#2a9d8f]" />,
      title: language === "ur" ? "فوری نتائج" : "Immediate Results",
      description: language === "ur" ? "پہلے سیشن میں بہتری" : "Improvement from first session",
      image: "/images/Immediate-Results.jpg",
    },
  ]

  return (
    <div className="py-16 relative overflow-hidden">
      {/* Professional Background Pattern */}
      <div className="absolute inset-0 bg-[rgb(206,225,225)] dark:bg-[rgb(206,225,225)]/80"></div>
      
      {/* Subtle Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#2a9d8f] rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#0d5c75] rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center px-4 py-2 mb-4 bg-gradient-to-r from-[#2a9d8f]/10 to-[#0d5c75]/10 rounded-full border border-[#2a9d8f]/20 backdrop-blur-sm">
            <div className="w-2 h-2 bg-[#2a9d8f] rounded-full mr-3 animate-pulse"></div>
            <span className="text-[#2a9d8f] dark:text-teal-400 font-semibold text-sm tracking-wide uppercase">
              Advanced Technology
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#2a9d8f] via-[#0d5c75] to-[#2a9d8f] bg-clip-text text-transparent mb-4 font-poppins">
            {t("technology.showcase")}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Experience the future of chiropractic care with our cutting-edge technology
          </p>
        </div>

        {/* Technology Cards with Professional Glass Effect */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {technologies.map((tech, index) => (
            <div key={index} className="group relative">
              {/* Card with Glass Effect */}
              <Card className="relative overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/30 dark:border-gray-700/30 shadow-2xl hover:shadow-3xl transition-all duration-500 group-hover:scale-105">
                {/* Background Image with Lighter Blur */}
                <div className="absolute inset-0 overflow-hidden">
                  <Image
                    src={tech.image}
                    alt={tech.title}
                    fill
                    className="object-cover opacity-40 group-hover:opacity-60 transition-opacity duration-500 blur-[1px]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  {/* Lighter glass overlay for better image visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/50 to-white/30 dark:from-gray-800/70 dark:via-gray-800/50 dark:to-gray-800/30 backdrop-blur-[0.5px]"></div>
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <CardHeader className="text-center pb-4">
                    {/* Icon with Professional Design */}
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#2a9d8f]/20 to-[#0d5c75]/20 rounded-full flex items-center justify-center border border-[#2a9d8f]/30 shadow-lg group-hover:shadow-xl transition-all duration-300">
                        {tech.icon}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-[#0d5c75] dark:text-teal-400 mb-2 font-poppins">
                      {tech.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="text-center px-6 pb-6">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {tech.description}
                    </p>
                    
                    {/* Subtle accent line */}
                    <div className="mt-4 mx-auto w-12 h-1 bg-gradient-to-r from-[#2a9d8f] to-[#0d5c75] rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </CardContent>
                </div>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#2a9d8f]/10 to-[#0d5c75]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </Card>
              
              {/* Floating Background Effect */}
              <div className="absolute -inset-2 bg-gradient-to-r from-[#2a9d8f]/20 via-transparent to-[#0d5c75]/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
